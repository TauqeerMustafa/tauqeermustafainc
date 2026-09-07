# Tauqeer Mustafa Inc. — Backend

FastAPI service backing the admin portal and contact form: JWT auth, CRUD
for services/portfolio/blog/careers/announcements, and contact message
storage.

## Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x (sync)
- PostgreSQL (via `psycopg`)
- Alembic
- Pydantic v2 (camelCase JSON via a shared `CamelModel`, matching the
  frontend's TypeScript types)
- python-jose (JWT) + bcrypt (password hashing)
- Uvicorn

## Project structure

```
app/
  api/
    deps.py          Auth dependencies (CurrentUser, CurrentAdmin, DB session)
    routes/
      system.py       /, /health, /version
      auth.py          /auth/login, /auth/me (GET + PUT)
      blog.py          /blog CRUD
      portfolio.py     /portfolio CRUD
      career.py        /careers CRUD
      service.py       /services CRUD
      contact.py       /contact (public submit, admin list/update/delete)
      announcement.py  /announcements CRUD
      __init__.py       Aggregates all routers into one `router`
  core/
    config.py         Settings (env-driven)
    security.py       Password hashing + JWT create/decode
  db/                 SQLAlchemy Base + session
  models/             One SQLAlchemy model per table
  schemas/            Pydantic request/response schemas
scripts/
  seed.py             Creates an admin user + seeds starter content
alembic/versions/      Migrations (users table, then content tables)
```

## Setup

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
copy .env.example .env   # or: cp .env.example .env
```

Edit `.env` with a real `DATABASE_URL` and a generated `SECRET_KEY` before
running anything beyond local development. See `.env.example` for every
variable `core/config.py` reads.

## Run

```bash
.venv\Scripts\python -m alembic upgrade head
.venv\Scripts\python -m scripts.seed
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API docs (Swagger UI) are available at `/docs` once the server
is running, and `/redoc` for the ReDoc variant - both generated automatically
by FastAPI from the route/schema definitions above.

## Endpoints

System:
- `GET /`, `GET /health`, `GET /version`

Auth:
- `POST /auth/login` — email + password (+ optional `remember`), returns a bearer token and the user
- `GET /auth/me` — current user (requires `Authorization: Bearer <token>`)
- `PUT /auth/me` — update name and/or change password (requires current password)

Content (public `GET`, admin-only `POST` / `PUT` / `DELETE`):
- `/services`, `/services/{slug}`
- `/blog`, `/blog/{slug}` (`?published_only=false` to include drafts)
- `/portfolio`, `/portfolio/{slug}`
- `/careers`, `/careers/{slug}` (`?open_only=false` to include closed roles)
- `/announcements` (`?published_only=true` for the public-facing subset)

Contact:
- `POST /contact` — public submission (also reachable via the frontend's
  `/api/contact` Next.js route, which proxies here)
- `GET /contact` (`?unread_only=true`), `PUT /contact/{id}`, `DELETE /contact/{id}` — admin-only

All list endpoints accept `page` and `page_size` query params and return
`{ data: { items, pagination }, message, success }`, matching
`frontend/types/api.ts`. Admin-only routes require a bearer token for a
user with `is_superuser = true` (exposed to the frontend as `role: "admin"`).

## Alembic

```bash
.venv\Scripts\python -m alembic revision --autogenerate -m "message"
.venv\Scripts\python -m alembic upgrade head
```

## Seed data

After running migrations, create an initial admin user and starter content:

```bash
.venv\Scripts\python -m scripts.seed
```

This creates `admin@tauqeermustafa.tech` / `ChangeMe123!` as a superuser —
change this password immediately after the first login in production. It
also seeds the same services, portfolio, blog, and career content currently
hardcoded in the frontend's `lib/site-data.ts`, so the site has real content
from day one instead of an empty database. The script is idempotent - it
skips rows whose slug (or, for the admin user, email) already exists.

## Known gaps / things to verify before production

- **Not yet run in this environment.** This was built without network or
  database access, so nothing here has been executed against a real
  Postgres instance. `python3 -m py_compile` and static import/symbol
  checks were used to catch syntax and reference errors, but that cannot
  catch everything a real run would (e.g. actual SQL execution, Alembic
  autogenerate diffing against a live schema). Run the full setup above
  locally before deploying.
- **CORS** is controlled by `CORS_ORIGINS` in `.env` - update it to your
  real frontend origin(s) before deploying anywhere but localhost.
- **No rate limiting** on `/auth/login` or `POST /contact` - both are
  public-facing and would benefit from throttling in production.
- **The public frontend doesn't read from this API yet.** `lib/site-data.ts`
  on the frontend is a static TypeScript file with its own copy of similar
  content; the admin portal manages this database instead. Pointing the
  public pages at these endpoints is a reasonable next step.
