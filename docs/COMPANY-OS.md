# Swayzio OS — The Agent-Native Company Brain (one Postgres for the whole business)

> **Status:** Phases A–K **ALL LIVE** (2026-07-08). Neon project `swayzio-os` (`sparkling-butterfly-49751147`),
> PG 18.4, `aws-us-east-1`, autoscale 0.25→2 CU + scale-to-zero. ELT every 6h (GitHub Actions), migrations
> applied through **0023**, semantic recall active, and the eve agent is live in production (see §8 + `docs/HANDOFF.md`).
> **One-line:** Make a single Neon Postgres the **system of record** for the entire company —
> normalized, cron-fed, and built so an agent can retrieve and reason over everything in one query.
> **Scope note:** This does **not** re-architect the admin dashboard app. The dashboard becomes one
> *reader* of Swayzio OS (alongside agents). See `ARCHITECTURE.md` for the app itself.

---

## 1. The reframe — cache → system of record

Today the dashboard's Neon project is a **cache**: `integration_cache` stores JSON blobs keyed by
integration, and the truth lives upstream in Stripe / HubSpot / the Swayzio-Core app DB. Swayzio OS
inverts that:

> **Every scheduled job doesn't *warm a cache* — it *materializes normalized, queryable,
> append-only rows* into a canonical company schema. The dashboard reads those tables. Agents read
> and write those tables. Third-party APIs become upstream feeds, not the source of truth.**

That inversion is the whole primitive. The payoff: an agent spends its runtime *reasoning*, not
*fetching* — the data is always already there, pre-joined and pre-embedded.

## 2. Why Neon is the substrate

Neon (a Databricks company, founded by Postgres committers) rebuilt itself for exactly this; ~80% of
Neon databases are now provisioned by agents. The primitives we'd otherwise assemble ship in the box:

| Primitive | Role in Swayzio OS |
|---|---|
| **Neon Data API** (Rust PostgREST; per-branch HTTPS endpoint) | Every table → a REST endpoint over HTTP. No driver, no pool. Secured by **JWT + Postgres RLS**, accepts **external JWKS** → our **Clerk** tokens work directly. |
| **pgvector + HNSW** | Agent memory + semantic search **colocated** with relational data. Hybrid recall (vector + `tsvector` + recency) in one SQL call. <10M vectors → pgvector beats a separate vector DB on every axis. |
| **Copy-on-write branching + snapshots** | Fork the entire company DB in seconds for a hypothesis / risky migration / "what-if", then discard. Snapshots = time-travel checkpoints. |
| **Neon MCP server** (already loaded in this session) | Agents provision, query, branch, tune via MCP. Management plane is API-native. |
| **Scale-to-zero + fleet API** | Idle cost ≈ $0; cold start ~150–350ms. Programmatic project/branch creation for per-experiment forks. |

## 3. Locked decisions (2026-06-23)

1. **Home:** a **new dedicated Neon project** (`swayzio-os`) is the system of record. The
   admin-dashboard project stays as-is; the dashboard reads from Swayzio OS. Clean blast radius, own
   branching/snapshots/backups, decoupled from the dashboard's cache churn.
2. **Scheduling:** **external-scheduler-first.** Vercel Cron (already wired) + GitHub Actions (for
   jobs >300s) drive all ELT writes; the primary compute keeps cheap scale-to-zero. A small always-on
   lane for `pg_cron` in-DB maintenance is added later, not now (see §6).
3. **Agent auth:** **reuse Clerk via external JWKS.** The Data API validates the same Clerk tokens the
   dashboard already uses; RLS is scoped by the same `sub` claim. One identity system, not two.

## 4. Schema layout — one project, five namespaces

```
raw.*       Landing zone. Append-only raw JSON per source per sync.
            (source, entity, fetched_at, payload jsonb, sync_run_id) — replayable + provenance.
core.*      Canonical normalized entities, conformed across sources:
            person, company, subscription, invoice, contact, track, deal, identity …
            A "customer" is ONE row whether it arrived from Stripe or HubSpot.
metrics.*   Materialized daily/monthly rollups (mrr_daily, churn_monthly, collection_rate …)
            so agents + dashboard get instant aggregates and never recompute.
memory.*    Agent-native layer: embeddings (pgvector), doc/chunk store, facts/lessons (with a
            write-time provenance gate), append-only event log. Hybrid recall in one query.
ops.*       Control plane: sync_runs, sync_state (cursors), outbox, data_freshness, data_dictionary.
```

**The connective tissue is `core.identity` / `core.person`** — a resolved identity unifying a Stripe
customer + HubSpot contact + app-DB user by email/domain. *This* is what turns siloed tables into a
brain: "this churned account — were they a power uploader, and which PRO?" becomes a JOIN, not four
API calls. We already have the email/domain seams to resolve it (HubSpot domain logic, Stripe
customer email, app-DB `owner_id`).

## 5. Ingestion — an idempotent ELT heartbeat

Each source job follows one shape:

```
extract (incremental; cursor in ops.sync_state)
  → upsert to raw.*            (append-only snapshot + provenance)
  → transform to core.*        (normalize, resolve identity, ON CONFLICT upsert by natural key)
  → refresh metrics.*          (touched rollups only)
  → log ops.sync_runs          (status, counts, duration, error)
```

- **Idempotent:** `ON CONFLICT` + natural keys → retries never double-write.
- **Build-vs-buy:** our existing `src/server/integrations/stripe.ts` / `hubspot.ts` are *already
  custom connectors*. We evolve them from "return JSON to cache" → "write normalized rows." Managed
  ELT (Airbyte/Fivetran → Postgres destination) is evaluated only for long-tail SaaS later.
- **App DB:** Swayzio-Core stays the OLTP source; we pull the product tables we care about into
  `core.*` via scheduled sync or logical replication. We do **not** co-locate the live product DB, and
  we avoid `postgres_fdw`/`dblink` for hot paths (their connections die on scale-to-zero).

## 6. The constraint that decides the infra

> **`pg_cron` jobs are *silently skipped* while a Neon compute is scaled to zero — no retry, no error.**

So "everything writes automatically" cannot rest on in-database `pg_cron` if we also want cheap
scale-to-zero. Resolution:

- **External scheduler is the heartbeat.** Vercel Cron / GitHub Actions fire the ELT writes; the
  connection wakes the compute. This is the proven Neon + Vercel pattern and is already how
  `/api/cron/refresh` works — we just point new jobs at Swayzio OS.
- **`pg_cron` is for in-DB upkeep only**, on a small **always-on** compute/branch (Launch ~$19/mo or
  autosuspend disabled): refresh materialized views, embed newly-arrived rows, decay `memory.*`, purge
  old `raw.*`. No source-API egress inside Postgres. Deferred until the external loop is solid.

## 7. The agent-native retrieval surface (the payoff)

Three layers, ordered by how an agent reaches data:

1. **Structured** — Neon Data API + RLS: agents read `core`/`metrics` over HTTP with a Clerk JWT,
   plus a small set of **allow-listed, documented SQL views/functions** (the "MCP boundary": agents
   call safe named queries, not arbitrary SQL).
2. **Semantic** — `memory.*` pgvector for unstructured recall (call notes, docs, decisions, prior
   agent lessons), provenance-gated so hallucinated memories can't accumulate.
3. **Self-orientation** — `ops.data_dictionary` describes every table/column in plain English (an
   `llms.txt` for our own schema) so an agent boots oriented in one query.

This is the foundation eve.dev (app Phase 6) plugs into — its tools become thin, RLS-scoped wrappers
over `core` / `metrics` / `memory`.

## 8. Phased path

- **Phase A — Stand up the project.** ✅ Done 2026-06-23. `swayzio-os` (PG18, us-east-1, autoscale
  0.25→2 + scale-to-zero); five schemas; `ops` control plane (`raw.records`, `sync_runs`, `sync_state`,
  `outbox`, `data_dictionary`, `data_freshness`); `core.identity` spine + `resolve_identity()`; plain-SQL
  migrations + zero-dep runner (`scripts/os-migrate.ts`); driver 1.x + Zod 4 at root. Verified live.
- **Phase B — First feed end-to-end (Stripe).** ✅ Done 2026-06-23. `src/server/os/feeds/stripe.ts`:
  `raw.records` → `core.customer`/`core.subscription` → `metrics.stripe_daily` + `metrics.stripe_revenue_monthly`.
  `monthlyCents` + sub-mapping ported verbatim. **Verified** (`npm run os:verify`): brain-derived
  `metrics.stripe_daily` equals live `getSubscriptionMetrics()` field-by-field (mrr 34682, active 3225,
  paying 942, past_due_mrr_at_risk $25,430). 5,480 subs loaded.
- **Phase C — HubSpot + app-DB feeds; identity spine.** ✅ Done 2026-06-23.
  `feeds/hubspot.ts` (9,088 catalog artists → `core.contact` + `metrics.hubspot_daily`) and
  `feeds/app.ts` (5,668 `billing_customers` → `core.app_customer` + `metrics.app_daily`). Identity
  resolved by email across all three sources via set-based `resolveIdentities` (`src/server/os/load.ts`).
  **Live spine: 11,332 identities, 5,417 spanning >1 source.** Orchestrated by `scripts/os-sync.ts`
  (`npm run os:sync`); scheduled via `.github/workflows/os-sync.yml` every 6h. The full sweep is
  ~6 min, past Vercel's 300s limit, hence GitHub Actions.
- **Phase D — Retrieval surface.** ✅ Done 2026-06-24. Curated read-only `api` schema
  (`db/swayzio-os/migrations/0009`): `identity_360` (one row/person unified across Stripe+HubSpot+app —
  3,137 people in all three), `top_accounts`, `{stripe,hubspot,app}_snapshot`, `revenue_monthly`,
  `data_dictionary`, `freshness`. **Neon Data API provisioned** on branch `br-red-bonus-ahrx5hez`,
  URL `https://ep-falling-mud-ahxdrkqh.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1`, external
  auth = **Clerk JWKS** (dev instance `immune-primate-92.clerk.accounts.dev`; swap to prod JWKS via
  `POST /projects/{id}/jwks` when prod Clerk has a custom domain). Grants (`0010`): `authenticated`
  has USAGE+SELECT on `api`; `anonymous` none. Verified live: endpoint rejects invalid JWTs.
  **One manual toggle remains:** Console → swayzio-os → Data API → Settings → Exposed schemas → add
  `api` → Save (default is `public`; SQL GUC is Neon-locked). Until then, server-side agents query
  `api.*` directly via the connection string.
- **Phase E — Memory.** ✅ Done 2026-06-24 (`db/swayzio-os/migrations/0011`). `memory.document`
  (chunked RAG text) + `memory.fact` (provenance-gated agent memory — every row must cite
  `provenance.source`; supersede, never overwrite), both `halfvec(1536)` + `content_tsv`, HNSW + GIN.
  `memory.recall(query_text, query_embedding, scope, k)` = hybrid 0.55 vector + 0.30 lexical + 0.15
  recency in one call. Provider-agnostic embed feed `src/server/os/embed.ts` + `scripts/os-embed.ts`
  (`npm run os:embed`): chunks the OS docs into `memory.document` (38 chunks ingested) and backfills
  embeddings when `EMBED_API_KEY` is set (OpenAI text-embedding-3-small default; swap via env, re-migrate
  if dim ≠ 1536). Verified: provenance gate rejects sourceless facts; lexical+recency recall ranks
  correctly now — semantic recall activates on first `os:embed` with a key. **Still pending:** the
  always-on `pg_cron` maintenance lane (embedding refresh, `raw` retention, MV refresh).
- **Phase F — Agent.** ✅ **LIVE in production 2026-07-07** (admin.swayzio.com/agent, PR #1). eve 0.19.0
  (pinned) + Sonnet 5 via AI Gateway; agent at `agent/` (repo root — eve CLI requirement); 13 read-only
  tools over `api.*` through the **`os_agent_ro`** role (SELECT on api + EXECUTE memory.recall only) +
  `recall_memory` (hybrid semantic — embeddings via AI Gateway OIDC, no key) + approval-gated
  `trigger_sync` (GitHub workflow_dispatch). Auth: Clerk **"eve" JWT template** (aud+email+role) verified
  at the eve channel; `/eve/v1/*` excluded from Next middleware. Migrations 0012 (api.stripe_trend,
  api.companies) + 0013 (collectible_mrr — `docs/STRIPE-MRR-INVESTIGATION.md`). Build log:
  `docs/PHASE-F-EVE.md`; open threads: `docs/HANDOFF.md`.
- **Phase G — OS-first dashboard + source depth.** ✅ Done 2026-07-07. Dashboard Stripe/HubSpot
  aggregators now prefer OS `api.*` views and fall back to cache-plane readers. HubSpot sync expands
  from catalog-only to all contacts plus companies; deals remain intentionally excluded. Stripe sync
  expands to full customers plus products/prices/coupons and a rolling ledger window for invoices,
  charges, refunds, and balance transactions (`STRIPE_FINANCE_LOOKBACK_DAYS`, scheduled default 30).
  New `api.sync_health` + `api.data_quality` power `/sync-status` and `npm run os:quality`.
- **Phase H — Mercury cash layer.** ✅ Done 2026-07-07. Mercury read-only API sync lands
  organization, accounts, transactions, recipients, categories, cards, statements, users, events,
  webhooks, and credit/treasury surfaces when present. Eve reads curated `api.mercury_*` views and
  Mercury tools for cash snapshot, transactions, cashflow, spend, runway inputs, and entity-level
  inspection with optional raw payloads.
- **Phase I — Facebook social layer.** ✅ First pass 2026-07-08. Meta Graph API sync lands Facebook
  Pages, posts, Page/post insights, ad accounts, campaigns, and campaign-level Ads Insights when the
  token has the required permissions. Eve reads curated `api.facebook_*` views and Facebook tools for
  organic snapshot, post performance, ads performance, and entity-level inspection with sanitized raw
  payloads.
- **Phase J — Instagram social layer.** ✅ First pass 2026-07-08. Instagram API with Facebook Login
  sync lands connected professional accounts and media, plus account/media insights when
  `instagram_business_manage_insights` is granted. Eve reads curated `api.instagram_*` views and Instagram tools
  for profile snapshot, media performance, and entity-level inspection with sanitized raw payloads.
- **Phase K — Social engagement and Top Engaged accounts.** ✅ First pass 2026-07-08. Instagram comment
  harvesting lands known external actors and atomic engagement events in `core.social_actor` and
  `core.social_engagement`, enriches reachable accounts through Business Discovery, and exposes
  `api.super_followers` for influencer, partnership, and high-impact community follow-up workflows.
  The score is reach-led with capped engagement/recency boosts so repeated low-reach comments do not
  bury high-reach accounts. Eve reads the same view through the `super_followers` tool; the dashboard has
  `/socials/top-engaged`. Facebook comments and cross-platform DMs are schema-ready but remain
  gated on Meta permissions/access.

## 9. Open questions

- Identity resolution edge cases (shared/role emails, multiple Stripe customers per person).
- `raw.*` retention window vs. snapshot-based replay (cost trade-off).
- Embedding model + dimension to pin in the `memory.*` schema (must be fixed per column).
- Whether long ELT jobs outgrow GitHub Actions → Vercel Queues / a worker.
- Backfill strategy for historical data on first load of each feed.
