# Tauqeer Mustafa Inc.

Monorepo for the Tauqeer Mustafa Inc. website: a public marketing site, a
client-facing contact flow, and an admin content-management portal, backed
by a FastAPI service.

## Structure

- `frontend/` - Next.js 16 application (public site, login, admin portal).
  See `frontend/README.md`.
- `backend/` - FastAPI service (auth, content CRUD, contact messages).
  See `backend/README.md`.

## Quick start

You need both services running for the full experience (public site works
standalone against static data; the admin portal and live contact form need
the backend).

**Backend** (PostgreSQL required):

```bash
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
copy .env.example .env   # or: cp .env.example .env
.venv\Scripts\python -m alembic upgrade head
.venv\Scripts\python -m scripts.seed
.venv\Scripts\python -m uvicorn app.main:app --reload
```

This creates an admin login (`admin@tauqeermustafa.tech` / `ChangeMe123!` -
change this immediately) and seeds services/portfolio/blog/careers content.

**Frontend**:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 for the public site, http://localhost:3000/login
for the admin portal (http://localhost:8000/docs for the interactive API
reference once the backend is running).

## What's implemented

- Public site: home, about, services, portfolio, blog, careers, contact
  (with a real Google Maps embed and departmental email routing), legal
  pages (privacy, terms, cookies, accessibility), a working cookie-consent
  banner, SEO metadata (Open Graph/Twitter cards, per-page titles,
  `robots.txt`, `sitemap.xml`, Organization JSON-LD).
- Admin portal: JWT-based login, dashboard with live counts, full CRUD for
  services/portfolio/blog/careers, a contact-message inbox, announcements,
  and account settings (name/password).
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL, JWT auth, CRUD
  routes for every admin-managed resource, a seed script.

## Known gaps

See the "Known gaps" sections in `frontend/README.md` and
`backend/README.md` for specifics (admin auth is client-side only so far,
the public site currently reads from static data rather than the backend,
and none of this has been run end-to-end in this environment since it was
built without network/database access - run it locally before deploying).
