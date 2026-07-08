# Migration Record — Replit/Vite/Express to Next.js/Vercel

> **Status:** Historical record. The migration is complete. Active state and open work live in
> `docs/HANDOFF.md`; current architecture lives in `docs/ARCHITECTURE.md`.

This file keeps the migration history so future agents understand why the repository looks the way it
does. It is not the active roadmap.

## Completed Outcome

- The legacy Replit/Vite/Express app was replaced with a clean Next.js 16 App Router app.
- The app deploys on Vercel at `admin.swayzio.com`.
- Clerk production auth gates founders-only access.
- Stripe, HubSpot, and Swayzio-Core app DB analytics are wired through a Neon-backed
  stale-while-revalidate cache.
- The visual system was moved to Tailwind 4 + daisyUI 5 with `design/swayzio.DESIGN.md` as source of
  truth.
- The `swayzio-os` Neon project became the company brain: raw/core/metrics/memory/ops schemas, feeds
  through migration `0023`, and curated `api.*` views.
- Eve is live at `/agent` from the root `agent/` directory, with read-only tools over Swayzio OS plus
  one approval-gated `trigger_sync` action.

## Historical Phases

### Phase 0 — Foundation

- Architecture, handoff, and decision docs started.
- Replit cruft and legacy reference material were moved out of the active app path.
- `skills/daisyui-charts/` was vendored for chart generation guidance.

### Phase 1 — Next.js Shell And Theme

- Next.js 16, React 19, Tailwind 4, daisyUI 5, and Turbopack were adopted.
- The Linear-inspired dark UI was preserved with a deep-blue accent.
- `design/swayzio.DESIGN.md` became the design source of truth.
- App shell, sidebar, header, mobile nav, and dashboard components were ported.

### Phase 2 — Auth

- Clerk was added through `@clerk/nextjs`.
- `src/proxy.ts` became the Next 16 middleware entrypoint.
- Founder access is enforced by `FOUNDER_EMAILS` or `publicMetadata.role === "founder"`.
- Keyless local dev remains open; production fails closed without Clerk keys.

### Phase 3 — Backend And Real Analytics

- The dashboard data layer moved to the Neon serverless driver and plain SQL.
- Drizzle was removed.
- `src/server/cache.ts` implemented two-tier stale-while-revalidate caching.
- Stripe was rebuilt around accurate collected/collectible/booked revenue definitions.
- HubSpot was de-Replit'd to `HUBSPOT_ACCESS_TOKEN`.
- Swayzio-Core app DB reads were added through the read-only `SWAYZIO_APP_DATABASE_URL`.
- Vercel Cron warms dashboard cache keys through `/api/cron/refresh`.

### Phase 4 — Remaining Dashboard Surface

Partially complete. Real current pages are:

- `/`
- `/analytics/stripe`
- `/analytics/hubspot`
- `/database`
- `/sync-status`
- `/mercury`
- `/socials/top-engaged`
- `/socials/instagram`
- `/socials/facebook`
- `/design-system`
- `/agent`

Still planned or represented only in nav/docs unless implemented later:

- Kit newsletter
- SEO
- GitHub analytics
- TikTok
- YouTube
- Settings
- Customer list/detail

### Phase 5 — Cutover

- Legacy Vite client, Express server, `shared/` schema, Replit artifacts, and unused migration-era
  dependencies were removed.
- Vercel production deployment and custom domain were wired.
- Stripe numbers were verified against live data and Swayzio OS.

### Phase 6 — Eve Agent

- Eve was implemented under root `agent/` because the eve CLI requires `agent/agent.ts` at the repo
  root.
- `next.config.ts` wraps the app with `withEve(nextConfig)`.
- Agent tools read curated Swayzio OS views through `SWAYZIO_OS_AGENT_RO_URL` where available.
- The chat UI lives at `/agent`.
- Open follow-ups are tracked in `docs/HANDOFF.md`.

## Remaining Product Work

Use `docs/HANDOFF.md` as the authoritative list. As of this record, notable open product/data work is:

- Pause-collection recovery pilot, pending explicit founder approval.
- `churned_accounts` tool, requiring canceled-sub ingestion and a new `api.churned_accounts` view.
- Eve evals.
- Fine-grained `SYNC_DISPATCH_TOKEN` rotation.
- Planned dashboard routes for non-Stripe/HubSpot surfaces.

## Rules Preserved From The Migration

- Keep business logic framework-agnostic under `src/server/*`.
- Keep third-party calls out of user-facing request paths by using cache aggregators.
- Do not reintroduce Drizzle, Recharts, Replit connector assumptions, or raw color drift.
- Verify Stripe metric changes before and after with live/source-aligned checks.
