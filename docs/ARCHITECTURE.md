# Swayzio Admin Dashboard — Current Architecture

> **Status:** Current implementation, updated 2026-07-07. For day-to-day open threads read
> `docs/HANDOFF.md`; for durable decisions read `docs/DECISIONS.md`.

The dashboard is a founders-only operating surface for Swayzio. It has two related but distinct data
planes:

- **Dashboard cache plane:** the Next.js app reads Stripe, HubSpot, and Swayzio-Core app DB data
  through framework-agnostic services and a Neon-backed stale-while-revalidate cache.
- **Swayzio OS plane:** a dedicated Neon Postgres project materializes raw, core, metrics, memory, and
  ops schemas for agent-native retrieval. Eve reads curated `api.*` views from this project.

## Stack

| Layer | Current choice |
|---|---|
| Framework | Next.js 16 App Router, Turbopack |
| UI | React 19, Tailwind CSS 4, daisyUI 5 |
| Charts | ApexCharts via `react-apexcharts` |
| Auth | Clerk Next SDK, founders-only allowlist/role gate |
| Dashboard DB | Neon Postgres via `@neondatabase/serverless`, plain SQL, no ORM |
| Company brain | Dedicated Neon Postgres project `swayzio-os`, plain SQL migrations |
| Agent | eve `0.19.0`, root `agent/` layout, Vercel AI Gateway model id |
| Hosting/jobs | Vercel app + Vercel Cron for cache warming; GitHub Actions for long OS sync |

Not currently installed or used: Drizzle, TanStack Query, XState, Recharts.

## Runtime Map

```text
Founder
  -> Clerk / src/proxy.ts
  -> Next App Router
       -> (dashboard) pages
       -> API route handlers
       -> /eve/v1/* rewritten by eve/next

Dashboard pages
  -> src/server/integrations/*
  -> src/server/cache.ts
  -> dashboard Neon integration_cache
  -> Stripe / HubSpot / Swayzio-Core app DB

Swayzio OS sync
  -> .github/workflows/os-sync.yml
  -> scripts/os-sync.ts
  -> src/server/os/feeds/*
  -> swayzio-os raw/core/metrics/ops/memory

Eve
  -> agent/tools/*
  -> agent/lib/os.ts
  -> swayzio-os api.* views and memory.recall()
```

## Routes

Implemented pages:

- `/` main dashboard
- `/agent` Eve chat
- `/analytics/stripe`
- `/analytics/hubspot`
- `/database`
- `/sync-status`
- `/mercury`
- `/socials/super-followers`
- `/socials/instagram`
- `/socials/facebook`
- `/design-system`
- `/sign-in`, `/sign-up`, `/not-authorized`

Implemented API routes:

- `/api/stripe/metrics`
- `/api/hubspot/metrics`
- `/api/cron/refresh`
- `/eve/v1/*` from eve, co-deployed by `withEve(nextConfig)`

Navigation also lists planned pages for SEO, GitHub, TikTok, YouTube, Kit, and settings. Those
routes do not currently exist unless added later.

## Module Boundaries

- `src/app/` is routing and thin server-page orchestration.
- `src/components/` is UI. Client components own chart rendering and interactivity.
- `src/components/ui/` contains the shared `Button`, `Badge`, and `Card` vocabulary that maps to
  `design/swayzio.DESIGN.md`.
- `src/server/integrations/` owns dashboard-facing service logic for Stripe, HubSpot, and app DB
  analytics. Stripe/HubSpot aggregators now prefer Swayzio OS `api.*` views and fall back to the
  cache plane when OS is unavailable.
- `src/server/cache.ts` owns two-tier SWR cache behavior: L1 memory plus L2 Neon `integration_cache`.
- `src/server/db/` contains dashboard and app-DB Neon clients.
- `src/server/os/` contains Swayzio OS ELT clients, feeds, embedding helpers, and sync wrappers.
- `agent/` contains the eve agent. It is intentionally at repo root because eve CLI commands resolve
  `agent/agent.ts` from the project root.
- `db/swayzio-os/migrations/` contains immutable Swayzio OS SQL migrations, currently through `0023`.
- `scripts/` contains migration, sync, embedding, refresh, and verification utilities.

## Data Flow

### Dashboard Cache Plane

`getOrCompute(key, fetcher, ttl)` in `src/server/cache.ts`:

1. Checks in-memory cache.
2. Falls back to Neon `integration_cache`.
3. Serves stale values immediately while refreshing in the background.
4. Computes on cold miss.

Vercel Cron hits `/api/cron/refresh` every six hours to warm Stripe, HubSpot, and app DB cache keys.
User-facing surfaces should call cached aggregators such as `getStripeDashboard()` and
`getHubspotDashboard()`, never raw third-party APIs directly.

### Swayzio OS Plane

`scripts/os-sync.ts` runs selected feeds:

1. `raw.records` stores append-only source payloads.
2. `core.*` stores normalized identity-resolved entities.
3. `metrics.*` stores daily/monthly rollups.
4. `ops.sync_runs` and `ops.sync_state` track run ledger and cursors.
5. `memory.*` stores docs/facts plus embeddings for hybrid recall.

Current OS feeds include full HubSpot contacts and companies (deals intentionally excluded), Stripe
customers/subscriptions/catalog/invoices/charges/refunds/balance transactions, Mercury
accounts/transactions/recipients/categories/cards/statements/organization/users/events/webhooks plus
credit/treasury surfaces when present, Facebook Pages/posts/organic insights/ad accounts/campaigns/Ads
Insights when configured, Instagram professional accounts/media/comments/Business Discovery actor
enrichment/insights when configured, cross-platform social actor/engagement scoring, and Swayzio-Core
app customers. `/sync-status` reads
`api.sync_health` and `api.data_quality`.

The agent reads only curated `api.*` views and `memory.recall()` through the `os_agent_ro` role when
`SWAYZIO_OS_AGENT_RO_URL` is configured.

## Auth

- `src/proxy.ts` is the middleware entrypoint in Next 16.
- Production fails closed if Clerk publishable/secret keys are missing.
- `(dashboard)/layout.tsx` redirects non-founders to `/not-authorized`.
- API handlers call `requireFounder()` for founder-only data access.
- `/api/cron/*` is excluded from Clerk and guarded by `CRON_SECRET`.
- `/eve/v1/*` is excluded from Clerk middleware; the eve channel in `agent/channels/eve.ts` verifies
  Clerk bearer tokens and founder status itself.

## Design System

`design/swayzio.DESIGN.md` is the normative source for colors, typography, radii, and component
recipes. `scripts/build-theme.ts` generates:

- `src/app/theme.generated.css`
- `src/app/design-tokens.generated.json`
- `public/design/*`

Do not hand-edit generated theme files. Use token utilities such as `bg-base-200`, `border-line`,
`text-ink-muted`, `bg-brand`, and shared UI components rather than raw colors.

## Environment

Core dashboard:

- `DATABASE_URL`
- `SWAYZIO_APP_DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `MERCURY_API_TOKEN`
- `FOUNDER_EMAILS`
- `CRON_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_*` redirect settings

Swayzio OS and Eve:

- `SWAYZIO_OS_DATABASE_URL`
- `SWAYZIO_OS_AGENT_RO_URL`
- `CLERK_JWT_ISSUER`
- `CLERK_JWT_AUDIENCE`
- `SYNC_DISPATCH_TOKEN`
- `SYNC_REPO`
- `VERCEL_OIDC_TOKEN` for AI Gateway embeddings/model access on Vercel
- Optional direct embedding overrides: `EMBED_API_KEY`, `OPENAI_API_KEY`, `EMBED_BASE_URL`,
  `EMBED_MODEL`, `EMBED_DIM`

## Verification

Current automated checks:

- `npm run design:lint`
- `npm run design:check`
- `npm run check`
- `npm run os:verify` when live OS/source credentials are available

CI currently runs design lint, generated-theme freshness, design diff on PRs, and TypeScript. It does
not run `next build` because production auth/env fail closed without secrets.

## Known Fragile Areas

- Stripe metric definitions are deliberately reconciled as collected, collectible, and booked. Verify
  before/after any Stripe logic change.
- Eve is pinned exactly. Read `node_modules/eve/CHANGELOG.md` before changing `eve`.
- `/eve/v1/*` must remain outside Clerk middleware.
- Postgres views freeze `SELECT *`; adding metric columns requires recreating dependent `api.*` views
  in the same migration.
- The dashboard nav includes planned routes that are not implemented yet.
