/**
 * One-off: reconcile lib/meta-templates.ts against what Meta currently holds.
 *
 * The deployed build still runs the old route that read Meta's "already exists"
 * rejection as success, so the rewritten copy cannot be pushed from the admin UI
 * until that deploys. This does what the fixed route does, straight at Graph:
 * create when absent, skip when Meta already has the same copy, otherwise edit
 * components in place — and refuse anything mid-review.
 *
 * Run with --dry to print the plan without writing to Meta.
 */
import { readFileSync } from "node:fs";

const GRAPH_URL = "https://graph.facebook.com/v20.0";
const DRY = process.argv.includes("--dry");

/* ── credentials ─────────────────────────────────────────────────────────── */

// The real values are not on this machine: Vercel redacts env vars marked
// sensitive, so `vercel env pull` writes the literal "[SENSITIVE]" for every
// WhatsApp key (lib/kv.ts already guards against the same string). So the
// environment wins, and the pulled file is only a fallback for the WABA id.
//
//   WHATSAPP_TOKEN=... WHATSAPP_BUSINESS_ACCOUNT_ID=... node push-meta.mjs --dry
function readEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)="?([\s\S]*?)"?$/.exec(line.trim());
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const real = (v) => (v && v !== "[SENSITIVE]" ? v : undefined);
const file = readEnv("temp.env");
const TOKEN = real(process.env.WHATSAPP_TOKEN) ?? real(file.WHATSAPP_TOKEN);
const WABA =
  real(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) ?? real(file.WHATSAPP_BUSINESS_ACCOUNT_ID);

if (!TOKEN || !WABA) {
  console.error(
    `Missing ${!TOKEN ? "WHATSAPP_TOKEN" : ""}${!TOKEN && !WABA ? " and " : ""}${!WABA ? "WHATSAPP_BUSINESS_ACCOUNT_ID" : ""}.\n\n` +
      "Both are marked sensitive in Vercel, so the pulled temp.env holds \"[SENSITIVE]\" rather\n" +
      "than the value. Either export them from Meta > WhatsApp Manager and re-run, or deploy\n" +
      "this commit and press Submit all in the admin UI — the fixed route does the same job."
  );
  process.exit(1);
}

/** Nothing this script prints may carry the token, including Meta's own errors. */
const safe = (s) => String(s).split(TOKEN).join("[REDACTED]");

/* ── the definitions, taken out of the TypeScript source ─────────────────── */

// Sliced rather than reimplemented, so what goes to Meta is byte for byte what
// the app would send. Only the handful of type annotations inside the slice are
// removed, each by exact string, and the guard below fails loudly if the source
// grows one this does not know about.
const src = readFileSync("lib/meta-templates.ts", "utf8").replace(/\r\n/g, "\n");
const from = src.indexOf("export const META_TEMPLATES");
const to = src.indexOf("/**\n * Build the `template.components` array for SENDING");
if (from < 0 || to < 0) {
  console.error("Could not find META_TEMPLATES / buildCreateComponents in lib/meta-templates.ts.");
  process.exit(1);
}

let mod = src.slice(from, to);
const ANNOTATIONS = [
  ["export const META_TEMPLATES: MetaTemplateDef[] = [", "export const META_TEMPLATES = ["],
  ["export function countVariables(body: string): number {", "export function countVariables(body) {"],
  ["export function sanitizeHeader(text: string): string {", "export function sanitizeHeader(text) {"],
  [
    "export function buildCreateComponents(def: MetaTemplateDef): Record<string, unknown>[] {",
    "export function buildCreateComponents(def) {",
  ],
  ["const components: Record<string, unknown>[] = [];", "const components = [];"],
  [
    'const bodyComponent: Record<string, unknown> = { type: "BODY", text: def.body };',
    'const bodyComponent = { type: "BODY", text: def.body };',
  ],
];
for (const [a, b] of ANNOTATIONS) {
  if (!mod.includes(a)) {
    console.error(`lib/meta-templates.ts no longer contains, so cannot be de-typed: ${a}`);
    process.exit(1);
  }
  mod = mod.split(a).join(b);
}
if (/:\s*(string|number|boolean|MetaTemplateDef|Record<)/.test(mod)) {
  console.error("An unknown type annotation survived the slice. Refusing to guess.");
  process.exit(1);
}

const { META_TEMPLATES, buildCreateComponents } = await import(
  "data:text/javascript;base64," + Buffer.from(mod, "utf8").toString("base64")
);
console.log(`${META_TEMPLATES.length} definition(s) loaded from lib/meta-templates.ts.`);

/* ── comparison, mirroring app/api/whatsapp/meta-templates/route.ts ──────── */

/** Only the copy that actually gets delivered: not component order, not `example`. */
function parseMetaComponents(components) {
  let header;
  let body = "";
  let footer;
  let buttons;
  for (const c of components ?? []) {
    const t = String(c?.type || "").toUpperCase();
    if (t === "HEADER" && String(c?.format || "").toUpperCase() === "TEXT") header = c.text;
    else if (t === "BODY") body = c.text ?? "";
    else if (t === "FOOTER") footer = c.text;
    else if (t === "BUTTONS" && Array.isArray(c?.buttons)) {
      buttons = c.buttons.map((b) => b?.text).filter(Boolean);
    }
  }
  return { header, body, footer, buttons };
}

function copyPrint(components) {
  const p = parseMetaComponents(components ?? []);
  return JSON.stringify([p.header ?? "", p.body, p.footer ?? "", p.buttons ?? []]);
}

/** Meta will not take an edit for a template in one of these states. */
const UNEDITABLE = new Set(["PENDING", "IN_APPEAL", "PENDING_DELETION", "DELETED"]);

/* ── what Meta holds right now ───────────────────────────────────────────── */

let listJson;
try {
  const listRes = await fetch(
    `${GRAPH_URL}/${WABA}/message_templates?fields=id,name,status,components&limit=250`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" }
  );
  listJson = await listRes.json();
  if (!listRes.ok) throw new Error(safe(JSON.stringify(listJson?.error ?? listJson)));
} catch (err) {
  // Bail rather than fall through to create: a failed read would look like an
  // empty account and turn all twelve edits into rejected create attempts.
  console.error("Could not read templates from Meta:", safe(err instanceof Error ? err.message : err));
  process.exit(1);
}

const live = new Map();
for (const t of listJson?.data ?? []) {
  if (!t?.name) continue;
  live.set(t.name, {
    id: String(t.id ?? ""),
    status: String(t.status ?? "UNKNOWN").toUpperCase(),
    components: t.components ?? [],
  });
}
console.log(`Meta holds ${live.size} template(s) on this account.\n`);

/* ── plan ────────────────────────────────────────────────────────────────── */

const plan = [];
for (const def of META_TEMPLATES) {
  const components = buildCreateComponents(def);
  const l = live.get(def.name);

  if (!l) plan.push({ def, components, action: "create" });
  else if (copyPrint(components) === copyPrint(l.components)) {
    plan.push({ def, action: "current", status: l.status });
  } else if (UNEDITABLE.has(l.status)) plan.push({ def, action: "blocked", status: l.status });
  else if (!l.id) plan.push({ def, action: "blocked", status: "Meta returned no template id" });
  else plan.push({ def, components, action: "edit", id: l.id, status: l.status });
}

const describe = (p) =>
  p.action === "create"
    ? "create — not at Meta yet"
    : p.action === "edit"
      ? `edit — copy differs (Meta has it ${p.status})`
      : p.action === "current"
        ? `already current (${p.status})`
        : `skip — ${p.status}`;

for (const p of plan) console.log(`  ${p.def.name.padEnd(20)} ${describe(p)}`);

if (DRY) {
  console.log("\n--dry: nothing was sent to Meta.");
  process.exit(0);
}

/* ── write ───────────────────────────────────────────────────────────────── */

console.log("\nSending:\n");
const results = [];
for (const p of plan) {
  if (p.action === "current" || p.action === "blocked") {
    results.push([p.def.name, p.action === "current" ? "unchanged" : `skipped (${p.status})`]);
    continue;
  }

  const url = p.action === "create" ? `${GRAPH_URL}/${WABA}/message_templates` : `${GRAPH_URL}/${p.id}`;
  // An edit sends components only: name, language and category are fixed at
  // creation and Meta rejects an attempt to change them.
  const payload =
    p.action === "create"
      ? {
          name: p.def.name,
          language: p.def.language,
          category: p.def.category,
          allow_category_change: true,
          components: p.components,
        }
      : { components: p.components };

  let line;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) {
      const e = json?.error ?? {};
      line = `failed — ${safe(e.error_user_msg || e.error_user_title || e.message || res.status)}`;
    } else {
      line = p.action === "create" ? `created (${json?.status ?? "PENDING"})` : "updated — back in review";
    }
  } catch (err) {
    line = `failed — ${safe(err)}`;
  }

  results.push([p.def.name, line]);
  console.log(`  ${p.def.name.padEnd(20)} ${line}`);
  await new Promise((r) => setTimeout(r, 400)); // Meta rate-limits bursts of template writes
}

const tally = {};
for (const [, line] of results) {
  const key = line.split(" ")[0];
  tally[key] = (tally[key] ?? 0) + 1;
}
console.log(
  "\n" +
    Object.entries(tally)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")
);
