# Tauqeer Mustafa Inc. — Frontend

Next.js 16 (App Router) frontend for the public marketing site, the client
login flow, and the admin content-management portal.

> **Note on Next.js 16:** this project pins Next.js 16, which introduced
> breaking changes from earlier versions (for example, the `middleware.ts`
> convention was renamed to `proxy.ts`, and dynamic route `params`/`searchParams`
> are async). See `AGENTS.md` before making routing-level changes, and consult
> `node_modules/next/dist/docs/` once dependencies are installed for anything
> version-specific.

## Stack

- Next.js 16 (App Router, React 19)
- Tailwind CSS 4
- TanStack Query for data fetching/caching
- react-hook-form + Zod for form validation
- Axios for API calls
- Lucide icons

## Project structure

```
app/
  (site)/         Public marketing pages (home, about, services, portfolio,
                   blog, careers, contact, privacy, terms, cookies,
                   accessibility) - wrapped in app/(site)/layout.tsx with the
                   public Navbar/Footer.
  admin/           Admin portal (dashboard, services, portfolio, blog,
                   careers, messages, announcements, settings) - auth-gated
                   by components/admin/AdminGuard.tsx, own dark-themed shell.
  login/           Standalone login page (no public nav/footer).
  api/contact/     Server route that proxies contact form submissions to
                   the FastAPI backend.
  robots.ts        Generates /robots.txt
  sitemap.ts       Generates /sitemap.xml from static + dynamic routes

components/
  home/            Public homepage sections + shared UI primitives (ui.tsx).
  layout/          Navbar, Footer, and an unused legacy Header.tsx.
  admin/           Admin shell (sidebar, header, guard) and shared admin
                   UI primitives (AdminUI.tsx: drawers, tables states, etc).
  contact/         Contact form, contact info, map embed, FAQ.
  auth/            LoginForm (client component rendered by app/login/page.tsx).
  common/          Cookie consent banner + preferences control.

data/               Static content used by the public site (company info,
                    services). lib/site-data.ts holds the actual services/
                    projects/posts/jobs content shown on public pages -
                    this is intentionally separate from the database-backed
                    admin content model (see below).
hooks/, services/   TanStack Query hooks + Axios service layer for talking
                    to the FastAPI backend (auth, blog, portfolio, careers,
                    services, messages, announcements).
providers/          App-wide providers: React Query client, auth token
                    context (localStorage-backed), app config.
types/              Shared TypeScript types, matching the backend's
                    Pydantic response shapes (camelCase).
```

### Two content sources - know which one you're editing

- **Public pages** (`app/(site)/...`) render from `lib/site-data.ts`, a
  static TypeScript file. Editing content there requires a code change and
  redeploy.
- **Admin portal** (`app/admin/...`) reads/writes the FastAPI backend's
  database tables via the hooks in `hooks/`. This is the editable,
  database-backed version of similar content (blog, portfolio, careers,
  services).

These are not yet connected to each other - the admin portal manages its
own database rows, separate from the static data the public site currently
renders. Pointing the public pages at the backend instead of the static
file is a reasonable next step once the backend is deployed and seeded.

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_API_URL` - base URL of the FastAPI backend (see `../backend`),
  no trailing slash, no `/api` prefix.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The admin portal is at `/admin` (redirects to
`/login` if not authenticated) and requires the backend to be running,
migrated, and seeded - see `../backend/README.md`.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run a production build
npm run lint     # eslint
```

## Known gaps / things to verify before production

- **Auth storage is `localStorage`-only.** `components/admin/AdminGuard.tsx`
  protects admin routes client-side; there is no server/edge-level check.
  `proxy.ts` already has a matcher for `/admin/:path*` but is currently a
  no-op - wiring real auth there would need the token to live in a cookie
  instead of (or in addition to) `localStorage`.
- **`@supabase/supabase-js` and `@supabase/ssr` are installed** but not used
  anywhere in the codebase. If Supabase isn't part of the plan, they can be
  removed; if it is, the current custom JWT auth and Supabase would need to
  be reconciled rather than run side by side.
- **This has not been run with `npm install` in this environment** (no
  network access when this was built) - run a full `npm run build` locally
  before deploying to catch anything environment-specific.
