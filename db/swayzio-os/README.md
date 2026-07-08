# Swayzio OS — Schema And Migrations

The Swayzio OS database is a dedicated Neon Postgres project (`swayzio-os`) that stores the
agent-native company brain. It is separate from the dashboard cache database.

Current status is summarized in `docs/COMPANY-OS.md` and `docs/HANDOFF.md`.

## Current Schema

The project uses five namespaces:

- `raw` — append-only source payloads.
- `core` — normalized identity-resolved entities.
- `metrics` — daily/monthly rollups for dashboards and agents.
- `memory` — documents, facts, embeddings, and hybrid recall.
- `ops` — migrations, sync runs, cursors, data dictionary, freshness, and outbox.

## Migrations

Migrations are immutable SQL files in `db/swayzio-os/migrations/`.

Current files:

- `0001_init.sql` — extensions and schemas.
- `0002_ops.sql` — raw records, sync ledger, state, outbox, dictionary, freshness.
- `0003_core_identity.sql` — identity spine, companies, personal-domain helper.
- `0004_dictionary_seed.sql` — initial data dictionary entries.
- `0005_core_stripe.sql` — Stripe core and metrics tables.
- `0006_core_hubspot.sql` — HubSpot core and metrics tables.
- `0007_core_app.sql` — Swayzio-Core app customer and app metrics tables.
- `0008_freshness_rows_read.sql` — freshness view revision.
- `0009_api_views.sql` — curated read-only `api` schema.
- `0010_api_grants.sql` — Data API grants.
- `0011_memory.sql` — memory document/fact tables and `memory.recall`.
- `0012_api_analytics.sql` — Stripe trend and company catalog views.
- `0013_stripe_collectible.sql` — collectible MRR fields and `api.stripe_snapshot` recreation.
- `0014_source_depth_quality.sql` — OS-first dashboard views, deeper HubSpot/Stripe coverage, and quality checks.
- `0015_relax_stripe_ledger_links.sql` — relaxed Stripe ledger foreign-key links for partial historical windows.
- `0016_fix_stripe_billing_monthly.sql` — Stripe monthly billing rollup fixes.
- `0017_mercury_source_depth.sql` — Mercury core tables and curated API views.
- `0018_fix_mercury_counterparties_status.sql` — Mercury counterparty/status view fixes.
- `0019_facebook_source_depth.sql` — Facebook Pages, posts, insights, ads, and curated API views.
- `0020_instagram_source_depth.sql` — Instagram account/media/insight core tables and API views.
- `0021_instagram_insights_permission_label.sql` — Instagram permission label/data dictionary update.
- `0022_social_engagement_super_followers.sql` — social actors, engagements, and ranked super-follower API view.
- `0023_super_followers_reach_weighting.sql` — reach-led super-follower scoring refinement.

Add a new migration for every schema change. Do not edit applied migrations; the runner checksums
applied files and flags drift.

## Commands

```bash
npm run os:migrate:status
npm run os:migrate
npm run os:sync
npm run os:verify
npm run os:embed
```

The migration runner loads `.env.local` automatically and uses `SWAYZIO_OS_DATABASE_URL`.

## Feed Code

- `src/server/os/db.ts` — Neon SQL client for the owner/admin OS URL.
- `src/server/os/sync.ts` — `withSyncRun`, which records `ops.sync_runs` and cursor state.
- `src/server/os/load.ts` — raw landing and set-based identity resolution.
- `src/server/os/feeds/stripe.ts` — Stripe raw/core/metrics feed.
- `src/server/os/feeds/hubspot.ts` — HubSpot raw/core/metrics feed.
- `src/server/os/feeds/app.ts` — Swayzio-Core app raw/core/metrics feed.
- `src/server/os/feeds/mercury.ts` — Mercury accounts, transactions, recipients, categories, cards,
  statements, organization, users, events, webhooks, and credit/treasury surfaces when present.
- `src/server/os/feeds/facebook.ts` — Facebook/Meta Pages, posts, organic insights, ad accounts,
  campaigns, and Ads Insights when the configured token has permission.
- `src/server/os/feeds/instagram.ts` — Instagram professional accounts, media, comments,
  Business Discovery actor enrichment, and insights via Instagram API with Facebook Login.
- `src/server/os/embed.ts` — embedding helper for `memory.*`.

## Operational Notes

- Full OS sync runs through `.github/workflows/os-sync.yml` every six hours because the complete sweep
  can exceed a single Vercel function budget.
- Dashboard cache warming remains separate at `/api/cron/refresh`.
- Agents should read through the `os_agent_ro` role via `SWAYZIO_OS_AGENT_RO_URL`, not the owner URL.
- If a migration adds columns used by an `api.*` view, recreate the dependent view in the same
  migration because Postgres views freeze their `SELECT *` shape.

## Risk Workflow

For risky schema work, point `SWAYZIO_OS_DATABASE_URL` at a throwaway Neon branch, run migrations and
verification there, then apply the same migration to the primary branch.
