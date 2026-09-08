# Support & Helpdesk Subdomain Setup (`support.tauqeermustafa.tech`)

This document describes how `support.tauqeermustafa.tech` is configured, routed, and activated.

---

## 1. Domain & DNS Configuration

To activate the subdomain at your DNS provider (Cloudflare, Namecheap, GoDaddy, Route53, etc.):

| Record Type | Host / Name | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `support` | `cname.vercel-dns.com.` | Automatic / 300 |

*(If using Cloudflare, set proxy status to DNS Only during initial SSL issuance, or Proxied if using Cloudflare SSL).*

---

## 2. Vercel Domain Alias Setup

1. Open your Vercel Dashboard for the **tauqeer-inc** (or frontend) project.
2. Navigate to **Settings** &rarr; **Domains**.
3. Add domain: `support.tauqeermustafa.tech`.
4. Vercel will automatically verify the CNAME record and provision an SSL certificate (Let's Encrypt).

---

## 3. Architecture & Routing

All requests hitting `support.tauqeermustafa.tech` are handled server-side in `frontend/proxy.ts`:

- `https://support.tauqeermustafa.tech/` &rarr; rewrites to `/support`
- `https://support.tauqeermustafa.tech/ticket` &rarr; rewrites to `/support/ticket`
- `https://support.tauqeermustafa.tech/status` &rarr; rewrites to `/support/status`
- `https://support.tauqeermustafa.tech/faq` &rarr; rewrites to `/support/faq`
- `https://support.tauqeermustafa.tech/contact` &rarr; rewrites to `/support/contact`
- Any other path `https://support.tauqeermustafa.tech/xxx` &rarr; rewrites to `/support/xxx`

On the main domain:
- `https://tauqeermustafa.tech/support` serves the suite natively.
- `https://tauqeermustafa.tech/help` redirects/rewrites to `/support`.

---

## 4. Key Features Implemented

1. **Enterprise Ticket Dispatch**:
   - Interactive ticket creation terminal (`/support/ticket`).
   - Dynamic reference IDs (`TMI-SUP-XXXXX`).
   - Priority SLA queue classification (P1 Outage &lt; 1h, P2 High &lt; 4h, P3 Standard &lt; 24h, P4 Inquiry &lt; 48h).
   - Local persistent ticket storage and live ticket tracker.
   - Forwarding to `/api/contact` backend service.

2. **Multichannel Escalation**:
   - 24/7 Production Hotline: `+92 328 1313982`.
   - Direct corporate WhatsApp concierge with pre-formatted greetings.
   - Departmental emails: `support@tauqeermustafa.tech`, `billing@tauqeermustafa.tech`, `clients@tauqeermustafa.tech`, `legal@tauqeermustafa.tech`.

3. **Live System Telemetry**:
   - Component status indicators (Public Site, APIs, Database, Portals, WhatsApp Gateway, Payments).
   - 99.98% SLA monitoring board.

4. **Omni-Search Knowledge Base**:
   - Instant live client-side search across categorized articles and FAQs.
