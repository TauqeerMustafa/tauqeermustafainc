/**
 * Renders the lead-gen playbook markdown inside the portals.
 *
 * A dependency-free renderer for exactly the subset `content/*.md` uses:
 * `#`/`##` headings, paragraphs, pipe tables, bullet and numbered lists,
 * `**bold**` and `` `code` ``. Adding react-markdown for one internal document
 * would ship a parser to the client for text that is fixed at build time.
 *
 * If the markdown grows a construct that is not handled here, it degrades to a
 * paragraph rather than breaking the page.
 */

import type { ReactNode } from "react";

const HEAD_STYLE = { color: "var(--adm-text)" } as const;
const BODY_STYLE = { color: "var(--adm-text-2)" } as const;
const BORDER = "var(--adm-border)";

/** `**bold**` and `` `code` `` — the only inline markup the document uses. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-bold" style={HEAD_STYLE}>
          {match[1]}
        </strong>,
      );
    } else {
      out.push(
        <code
          key={`${keyPrefix}-c${index}`}
          className="px-1 py-0.5 font-mono text-[0.85em]"
          style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}
        >
          {match[2]}
        </code>,
      );
    }
    last = match.index + match[0].length;
    index += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Split a pipe table row into trimmed cells, dropping the edge delimiters. */
function cells(row: string): string[] {
  return row
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function Table({ rows, id }: { rows: string[]; id: string }) {
  const header = cells(rows[0]);
  // rows[1] is the |---|---| separator, which carries no content.
  const body = rows.slice(2).map(cells);
  return (
    <div className="overflow-x-auto border" style={{ borderColor: BORDER }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--adm-surface-2)" }}>
            {header.map((cell, index) => (
              <th
                key={`${id}-h${index}`}
                className="px-4 py-2.5 text-start text-xs font-bold uppercase tracking-wider"
                style={HEAD_STYLE}
              >
                {inline(cell, `${id}-h${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${id}-r${rowIndex}`} className="border-t" style={{ borderColor: BORDER }}>
              {row.map((cell, cellIndex) => (
                <td key={`${id}-c${cellIndex}`} className="px-4 py-2.5 align-top" style={BODY_STYLE}>
                  {inline(cell, `${id}-r${rowIndex}c${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Join wrapped continuation lines so `- a\n  b` is one item. */
function listItems(lines: string[], marker: RegExp): string[] {
  const items: string[] = [];
  for (const line of lines) {
    if (marker.test(line)) items.push(line.replace(marker, ""));
    else if (items.length) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

export function PlaybookDoc({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n{2,}/);

  return (
    <article className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter((line) => line.trim().length > 0);
        if (lines.length === 0) return null;
        const key = `b${index}`;
        const first = lines[0];

        if (first.startsWith("# ")) {
          return (
            <h1 key={key} className="text-2xl font-bold uppercase" style={HEAD_STYLE}>
              {inline(first.slice(2), key)}
            </h1>
          );
        }
        if (first.startsWith("## ")) {
          return (
            <h2
              key={key}
              className="mt-2 border-t pt-6 text-lg font-bold uppercase tracking-wide"
              style={{ ...HEAD_STYLE, borderColor: BORDER }}
            >
              {inline(first.slice(3), key)}
            </h2>
          );
        }
        if (first.startsWith("|") && lines.length > 2) {
          return <Table key={key} id={key} rows={lines} />;
        }
        if (/^\d+\.\s/.test(first)) {
          return (
            <ol key={key} className="flex list-decimal flex-col gap-2 ps-6 text-sm" style={BODY_STYLE}>
              {listItems(lines, /^\d+\.\s+/).map((item, itemIndex) => (
                <li key={`${key}-i${itemIndex}`}>{inline(item, `${key}-i${itemIndex}`)}</li>
              ))}
            </ol>
          );
        }
        if (first.startsWith("- ")) {
          return (
            <ul key={key} className="flex list-disc flex-col gap-2 ps-6 text-sm" style={BODY_STYLE}>
              {listItems(lines, /^-\s+/).map((item, itemIndex) => (
                <li key={`${key}-i${itemIndex}`}>{inline(item, `${key}-i${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key} className="text-sm leading-relaxed" style={BODY_STYLE}>
            {inline(lines.join(" "), key)}
          </p>
        );
      })}
    </article>
  );
}
