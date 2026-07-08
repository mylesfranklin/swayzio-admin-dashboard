# HANDOFF — Current status & open threads

**Last updated: 2026-07-07.** Read this first when picking the repo up. `CLAUDE.md` has the rules;
this file has the state. Session-persistent agent memory (Claude auto-memory for this project) holds
the same facts in more operational detail — check `deployment`, `swayzio-os`, and
`stripe-data-findings` memories if available.

## What's live (all in production, verified)

| Surface | State |
|---|---|
| Dashboard | admin.swayzio.com, push-to-main auto-deploys. Stripe page + overview lead with the reconciled MRR triple (collected → collectible → booked). |
| Swayzio OS | Neon project `swayzio-os` (`sparkling-butterfly-49751147`). ELT every 6h via GitHub Actions. Migrations applied through **0021**. Stripe, HubSpot, app DB, Mercury, Facebook, and Instagram feeds are live/available. Semantic recall live (41 rows embedded). |
| Eve agent | `/agent` in the dashboard. eve **0.19.0 (pinned exact)**, Sonnet 5 via AI Gateway. Read tools over OS `api.*` views, including Mercury cash/transaction tools and Facebook/Instagram social tools, plus approval-gated `trigger_sync`. Clerk "eve" JWT template (dev + prod instances) carries `aud`/`email`/`role`. |
| Stripe truth | Collected $7.4K/mo · collectible $18.2K (≈ Stripe app tile) · booked $34.5K. Full story: `docs/STRIPE-MRR-INVESTIGATION.md`. |

## Open threads (in rough priority order)

1. **Pause-collection recovery pilot — AWAITING FOUNDER GO.** ~3,336 subs ($42K/mo booked) have
   `pause_collection: {behavior: "void"}` (deliberate old-app design for retrying failed cards; the
   resume half was never built). Quantified plan in STRIPE-MRR-INVESTIGATION §5–6: pilot = resume
   **debit+credit cards, last-paid <6mo (~271 subs, $2.4K/mo booked)**, batch of ~25 first; cancel
   the never-paid cohort (1,345 subs — pure booked-MRR fiction); after retries exhaust, **cancel,
   don't re-park**. Touches live billing — do not start without explicit founder approval.
2. **`churned_accounts` agent tool** (deferred from Phase F2): the Stripe feed only loads
   non-canceled subs, so churned rows aren't in `core`. Needs: feed change to ingest canceled subs
   (bounded window) → `api.churned_accounts` view (**migration 0014** — 0013 is taken by
   stripe_collectible) → the tool.
3. **Eve evals** (Phase F6 remainder): `evals/` + `eve eval` — e.g. assert revenue questions call
   `revenue_health` and quote the collected/collectible caveat.
4. **Rotate `SYNC_DISPATCH_TOKEN`**: currently the founder's gh CLI OAuth token (broad scope,
   founder-authorized 2026-07-07). Replace with a fine-grained PAT (this repo only, Actions R/W) in
   Vercel (all 3 envs) + `.env.local`.
5. **Pause trickle**: ~6 new `pause_collection` sets/month still occur — find the surviving code
   path in **swayzio-core** (`grep pause_collection`) and decide if it's wanted.
6. **Clerk odds & ends**: set `publicMetadata.role="founder"` on prod founder users (the founder
   gate currently rides the `FOUNDER_EMAILS` allowlist); Google OAuth custom credentials for prod
   sign-in are still pending (Console-only — see `deployment` memory).
7. **Neon Data API console toggle** (Phase D remainder): expose the `api` schema in the swayzio-os
   Data API settings (SQL GUC is Neon-locked). Server-side reads don't need it.
8. **Optional**: `schedules/monday-digest.ts` (weekly founder digest via eve cron), Vercel "Agent
   Runs" observability (may need Vercel to enable for the swayzio team).

## Gotchas the next agent will hit (hard-won today)

- **eve is a fast-moving beta.** Pinned `0.19.0` exactly. Before ANY upgrade read
  `node_modules/eve/CHANGELOG.md` (0.14.0 renamed `needsApproval`→`approval`; 0.13→0.19 cost one
  rename). eve CLI resolves the agent from **CWD** and requires `agent/` at a repo root that has
  `package.json` + `.vercel`. `eve link` needs a TTY — headless: `vercel link --yes --project
  swayzio-admin-dashboard --scope swayzio-d6c2c7d6` then `vercel env pull` for `VERCEL_OIDC_TOKEN`.
- **eve 0.19 hard-rejects non-JSON tool output.** The Neon driver parses `interval`/`date` columns
  into objects — cast `::text` in SQL or route rows through `coerceNumbers` (agent/lib/format.ts),
  which now handles Dates.
- **`memory.recall(query, embedding, p_scope, k)`**: `p_scope` exact-matches `fact.scope` /
  `document.source` — it is NOT a kind filter; NULL embedding = lexical-only (by design).
- **Embeddings need no API key**: AI Gateway `/v1/embeddings` authed by `VERCEL_OIDC_TOKEN`
  (auto on Vercel). Watch ESM hoisting in scripts — env must exist before module import
  (`npx tsx --env-file=.env.local`), which is why `embed.ts` resolves config lazily.
- **Local dev auth**: in `eve dev`, Next proxies `/eve/v1/*` to a loopback eve server, so
  `localDev()` accepts ALL local traffic — fail-closed 401 is only testable in prod. Clerk prod
  instances refuse API-created sessions; headless auth tests only work on the dev instance
  (mint via `clerk api /sessions` → `/sessions/{id}/tokens/eve`, then hit a NON-loopback origin).
- **Vercel env API**: `sensitive` type can't target `development`; the CLI's `env add` is flaky for
  preview — use `POST /v10/projects/{id}/env?upsert=true`. Team slug is `swayzio-d6c2c7d6`.
- **Lockfile**: regenerate incrementally (`npx npm@10 install --package-lock-only`) — never from
  scratch on macOS (drops Linux natives; broke CI once already).
- **Clerk middleware** must never touch `/eve/v1/*` (it 500s on non-Clerk bearers) — excluded in the
  `src/proxy.ts` matcher itself; keep it that way.
- **Postgres views freeze `SELECT *` at creation** — adding columns to `metrics.*` requires
  recreating the dependent `api.*` view in the same migration (see 0013).

## Key locations

- Agent: `agent/` (tools, channels/eve.ts, lib/os.ts + format.ts, instructions.md, skills/)
- OS: `src/server/os/` (feeds, load, sync, embed) · `db/swayzio-os/migrations/` · `scripts/os-*.ts`
- Dashboard Stripe metrics: `src/server/integrations/stripe.ts` (**hard rule #2: verify
  before/after any change**), `stripe-dashboard.ts`, `src/components/stripe/stripe-client.tsx`
- Investigation reports: `docs/STRIPE-MRR-INVESTIGATION.md` (also a PDF on the founder's Desktop)
- Phase F build log: `docs/PHASE-F-EVE.md` (historical — complete)
