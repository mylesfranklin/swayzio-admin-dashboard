# Swayzio OS — schema & migrations

The agent-native company brain: a dedicated Neon Postgres that is the **system of record** for the
whole business. Full design in [`docs/COMPANY-OS.md`](../../docs/COMPANY-OS.md); decision in
[`docs/DECISIONS.md`](../../docs/DECISIONS.md) (2026-06-23).

> **Status:** Phase A **provisioned & applied.** Neon project `swayzio-os`
> (`sparkling-butterfly-49751147`), **PG 18.4**, region **aws-us-east-1** (colocated with the Vercel
> app + the Swayzio-Core app DB), compute autoscale **0.25→2 CU** with scale-to-zero (300s).
> All 4 migrations applied; identity spine verified live. `SWAYZIO_OS_DATABASE_URL` is in `.env.local`.

## Layout

```
db/swayzio-os/migrations/
  0001_init.sql             schemas (raw, core, metrics, memory, ops) + extensions
  0002_ops.sql              control plane: raw.records, sync_runs, sync_state, outbox, dictionary, freshness
  0003_core_identity.sql    identity spine: core.identity / identity_link / company + resolve_identity()
  0004_dictionary_seed.sql  seed ops.data_dictionary (agent self-orientation)
scripts/os-migrate.ts       zero-dep runner (applies *.sql in order, ledger in ops.schema_migrations)
src/server/os/db.ts         Neon serverless driver client (HTTP), reads SWAYZIO_OS_DATABASE_URL
src/server/os/sync.ts       withSyncRun() — the reusable ELT primitive every feed wraps
```

## Toolchain (latest / agent-first, chosen 2026-06-23)

- **Postgres 18** (Neon default) · **pgvector 0.8.1** (halfvec + HNSW + iterative scans, for `memory.*`).
- **Neon serverless driver 1.x** (HTTP) — Node ≥ 19 (repo runs 24).
- **Zod 4** at the package root (`import { z } from "zod"`). `zod` was unused repo-wide, so it was
  bumped 3→4 cleanly — no `zod/v4` subpath, no dead v3 weight. Gives `z.toJSONSchema()` for agent tools.
- **Plain SQL** migrations, no ORM (per repo convention). Migrations are immutable once applied —
  the runner flags checksum drift; add a new file instead of editing an applied one.

## Provisioning (done 2026-06-23 — recorded for reproducibility)

Project is live. To re-provision (e.g. a second environment), note the **gotcha**: `neonctl projects
create` (2.27.0) has **no `--pg-version` flag**, so it lands on PG17. To pin PG18 use the REST API with
neonctl's stored OAuth token:

```bash
TOKEN=$(node -e "console.log(require(process.env.HOME+'/.config/neonctl/credentials.json').access_token)")
curl -s -X POST https://console.neon.tech/api/v2/projects -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project":{"name":"swayzio-os","pg_version":18,"region_id":"aws-us-east-1","org_id":"org-soft-credit-35486080"}}'
# grab connection_uris[0] → build the -pooler host → SWAYZIO_OS_DATABASE_URL in .env.local
```

Then apply:
```bash
npm run os:migrate:status     # preview pending
npm run os:migrate            # apply (loads .env.local automatically)
```

## No-friction workflow for risky changes

Point `SWAYZIO_OS_DATABASE_URL` at a throwaway Neon **branch**, run `os:migrate`, verify, then run
against the primary branch. Copy-on-write branches are instant and free to discard — the agent-native
way to test a migration with zero blast radius.

## What's intentionally *not* here yet

`metrics.*` rollups, `memory.*` (pgvector tables + hybrid recall), and the per-source `core` entity
tables (subscriptions/invoices/contacts/tracks) land with their feeds — **Phase B (Stripe)** is next:
evolve `src/server/integrations/stripe.ts` into an ELT writer (`raw → core → metrics.mrr_daily`)
wrapped in `withSyncRun`, driven by the existing Vercel cron. See `docs/COMPANY-OS.md §8`.
