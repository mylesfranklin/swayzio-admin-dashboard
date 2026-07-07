# Swayzio Admin Dashboard

The internal **brain and analytics engine** for Swayzio — a founders-only dashboard unifying
Stripe, HubSpot, and the Swayzio-Core app database, with clean ApexCharts visualizations.

**Live:** https://admin.swayzio.com (founders only, Google SSO via Clerk) — including **Eve**, the
built-in analytics agent at `/agent`, grounded in **Swayzio OS** (a dedicated Neon "company brain";
see `docs/COMPANY-OS.md`). Status + open threads: `docs/HANDOFF.md`.

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 + daisyUI 5 · ApexCharts · Clerk
(founders-only auth) · Neon Postgres (serverless driver, plain SQL) · Vercel (hosting + Cron +
Fluid Compute).

## Architecture
- **Integrations** live in `src/server/integrations/` (framework-agnostic) and go through a
  stale-while-revalidate **cache** (`src/server/cache.ts`) backed by the dashboard's own Neon DB.
  User-facing routes return cached data instantly; **Vercel Cron** (`/api/cron/refresh`, every 6h)
  warms the caches. Never call a third-party API synchronously on the request path.
- **Auth boundary**: Clerk middleware (`src/proxy.ts`) requires a session; the founder allowlist
  (`src/lib/auth.ts` → `FOUNDER_EMAILS`) gates both the dashboard pages (layout) and the data API
  routes (`requireFounder`).
- **Data sources**: Stripe + HubSpot (live APIs), Swayzio-Core app DB (read-only role, for real
  track-upload analytics). See `docs/` for the full spec, decisions, and integration notes.

## Commands
```bash
npm run dev      # Next.js (Turbopack) on :3000
npm run build    # production build
npm run check    # tsc --noEmit
npm run lint     # next lint
npm run design:build   # regenerate the daisyUI theme from design/swayzio.DESIGN.md
```
Data utilities in `scripts/` run with `npx tsx scripts/<name>.ts` (cache warmers + probes).

## Environment
Secrets live in `.env.local` (gitignored) locally and in Vercel project env in production:
`DATABASE_URL`, `SWAYZIO_APP_DATABASE_URL`, `STRIPE_SECRET_KEY`, `HUBSPOT_ACCESS_TOKEN`,
`FOUNDER_EMAILS`, `CRON_SECRET`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
(+ the `NEXT_PUBLIC_CLERK_*` URL config). See `.env.example`.

## Docs
`docs/ARCHITECTURE.md` · `docs/MIGRATION.md` · `docs/DECISIONS.md` · `docs/INTEGRATIONS-HUBSPOT.md`
