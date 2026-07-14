# Tauqeer Inc.

This repository currently contains the Tauqeer Mustafa Inc. frontend application.

## Current Structure

- `frontend/` - Next.js App Router application for the public website.
- `backend/` - Reserved for backend implementation. No backend code exists yet.
- `docs/` - Reserved for project documentation. No detailed docs exist yet.

## Frontend

The frontend is a Next.js 16 app using React 19, Tailwind CSS 4, Framer Motion, and Lucide icons.

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Useful validation commands:

```powershell
npm.cmd run lint
npm.cmd run build
```

## Repository Status

Implemented:

- Public homepage composition in `frontend/app/page.tsx`.
- Homepage sections under `frontend/components/home/`.
- Shared `Navbar` and `Footer` under `frontend/components/layout/`.

Missing:

- Backend application code.
- Backend API contracts and data models.
- Additional public routes linked from the navbar, such as `/about`, `/services`, `/portfolio`, `/careers`, `/blog`, `/contact`, and `/login`.
- Detailed project documentation in `docs/`.
