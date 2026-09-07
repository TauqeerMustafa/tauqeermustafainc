# Community

This directory is a standalone Next.js application for `community.tauqeermustafa.tech`.

It has its own package manifest, Next.js configuration, app router, visual system, metadata, and deployment root. Keep changes for this experience inside `community/`; do not add navigation, badges, labels, shared imports, redirects, or cross-site references elsewhere in the repository.

## Local development

```bash
cd community
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Create or configure the hosting project with `community/` as its **Root Directory**. The production domain is:

```text
community.tauqeermustafa.tech
```

Add this DNS record at the domain provider to activate the hostname:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `community` | `48583b15a7fa2460.vercel-dns-017.com.` |

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

The app intentionally has no environment variables and no dependency on another application in this repository.
