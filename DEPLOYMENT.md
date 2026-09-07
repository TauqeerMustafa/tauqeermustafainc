# Deployment

How this project runs in production, and the exact steps to deploy it.

## Architecture

| Piece    | Host   | Notes |
|----------|--------|-------|
| Frontend | Vercel | Next.js, project `tauqeermustafainc`, root dir `frontend/`, domain `tauqeermustafa.tech`. |
| Backend  | Render | FastAPI (Docker), defined by [`render.yaml`](render.yaml) as a Blueprint. |
| Database | Supabase / managed Postgres | External; the backend connects over SSL. Not provisioned by Render. |

The public site renders from static data, so it works even if the backend is
down. The **admin portal** and the **contact form** need the backend reachable
and CORS-allowed.

---

## 1. Backend on Render (Blueprint)

1. Make sure this repo is on GitHub (`origin/master`).
2. Render Dashboard → **New → Blueprint** → connect this repo. Render reads
   [`render.yaml`](render.yaml) and creates the `tauqeer-inc-backend` web service.
3. When prompted, fill the one secret marked `sync: false`:
   - **`DATABASE_URL`** — your Postgres connection string using the **psycopg3**
     driver scheme:
     ```
     postgresql+psycopg://<user>:<password>@<host>:5432/<db>
     ```
     Supabase → Project Settings → Database → Connection string. It gives you a
     `postgresql://…` URL; **change the scheme to `postgresql+psycopg://`**
     (psycopg2 is not installed). Use the **Session pooler** or the direct
     connection (port 5432).
   - **`SECRET_KEY`** is generated automatically by the Blueprint — leave it.
4. (Optional) adjust `CORS_ORIGINS` if your final frontend domain differs from
   the default (`tauqeermustafa.tech`, `www.tauqeermustafa.tech`,
   `tauqeermustafainc.vercel.app`).
5. **Create**. The first deploy builds the Docker image and runs
   `alembic upgrade head` automatically (wired via `dockerCommand` in
   `render.yaml`), then starts uvicorn.
6. **Seed** the initial admin user + starter content (one-off). In Render →
   your service → **Shell**:
   ```bash
   python -m scripts.seed
   ```
   Creates `admin@tauqeermustafa.tech` / `ChangeMe123!` — **change this password
   after first login**. The seed is idempotent (safe to re-run).
7. **Verify**: open `https://<your-service>.onrender.com/health` — it should
   return `{"status":"ok", ...}`.

> The default service name is `tauqeer-inc-backend`, so the URL is normally
> `https://tauqeer-inc-backend.onrender.com`. Confirm the exact URL in the Render
> dashboard (Render only appends a suffix if that subdomain is already taken).

---

## 2. Frontend on Vercel

1. Vercel → project **`tauqeermustafainc`** → **Settings → Environment Variables**.
2. Add, for the **Production** environment (and **Preview** if you want PR builds
   to hit the live API):
   ```
   NEXT_PUBLIC_API_URL = https://tauqeer-inc-backend.onrender.com
   ```
   Use your actual Render URL from step 1.7. **No trailing slash.**
3. **Redeploy** (Deployments → ⋯ → Redeploy, or push a commit). `NEXT_PUBLIC_*`
   values are inlined at build time, so a rebuild is required for the change to
   take effect — editing the env var alone does nothing to the running site.

---

## 3. Verify end-to-end

- Public pages load (static data — always works).
- Go to `/login`, sign in with the seeded admin. The admin **dashboard shows
  live counts** pulled from the backend. If those load, the whole chain
  (frontend build var → Render URL → CORS → DB) is wired correctly.
- A CORS error in the browser console means the site's origin isn't in
  `CORS_ORIGINS` on Render — add it and redeploy the backend.

---

## Gotchas

- **DB driver scheme**: `DATABASE_URL` must start with `postgresql+psycopg://`.
  A plain `postgresql://` makes SQLAlchemy reach for psycopg2, which isn't
  installed → the app fails to start.
- **CORS_ORIGINS**: comma-separated, exact scheme + host, **no trailing slash,
  no spaces** (e.g. `https://tauqeermustafa.tech,https://www.tauqeermustafa.tech`).
- **Free Render tier**: web services spin down when idle; the first request after
  idle is slow (cold start) and re-runs migrations (idempotent, so harmless).
- **Rotate the seeded admin password** immediately after first login.
- Local env files (`.env`, `.env.local`, `.env.production.local`) are gitignored
  and are **not** read by Vercel or Render — they only affect local runs.
  Production config lives in the two dashboards (and `render.yaml`).
