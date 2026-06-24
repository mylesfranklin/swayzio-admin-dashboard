# Phase F — The eve.dev Agent on Swayzio OS

**Status: F0 (spike) + F1 (skeleton) done on branch `phase-f-eve`; F2–F6 pending.**

> **F1 done (2026-06-24):** `src/agent/` scaffolded — `agent.ts` (model `anthropic/claude-opus-4.8`),
> `instructions.md`, self-contained `lib/os.ts` (own neon client, no cross-root import — OQ #1 sidestepped),
> the 9 read-only tools (`stripe/hubspot/app_snapshot`, `revenue_monthly`, `top_accounts`, `identity_360`,
> `data_dictionary`, `freshness`, `recall_memory` — lexical), `channels/eve.ts` (localDev + fail-closed
> Clerk-founder `AuthFn`), and the `data-dictionary` skill. `next.config.ts` wrapped with
> `withEve(nextConfig, { eveRoot: "./src/agent" })`. `eve info` (from the agent root): compile ready,
> **0 errors, 9/9 tools + 1 skill + instructions discovered**; repo `tsc` clean.
> Learnings: the `eve` CLI resolves its agent root from **CWD**, so `agent:info/dev/build` scripts `cd src/agent`
> (withEve's `eveRoot` only bridges Next). `verifyOidc` requires `audiences` (strict tsc caught it; eve's own
> compile didn't) — the Clerk `AuthFn` is env-gated on `CLERK_JWT_ISSUER`+`CLERK_JWT_AUDIENCE` and skips
> (stays fail-closed) until set. **Next: F2** (composed analytical tools + decide their api surface),
> **F4** (web channel route + confirm Clerk token claims / live `eve link` + chat turn), **F5** (gated `trigger_sync`).

This phase puts a durable, founders-only analytics agent on top of Swayzio OS. The agent is authored as files under `src/agent/`, runs on Vercel's [eve](https://eve.dev) framework (filesystem-first, durable via the Workflow SDK / Vercel Workflow), and is embedded as a chat panel inside the existing dashboard at `admin.swayzio.com`. Its entire knowledge surface is the **same curated `api.*` views and `memory.recall()` function** the dashboard reads — wrapped as thin, **read-only** eve tools that call our existing `src/server/os/db.ts` (`osSql()`) layer. Writes/actions (e.g. triggering a sync) are a separate, explicitly-approved tool set. Auth piggybacks on Clerk via a bearer-token verifier at the eve channel boundary, so the founders-only boundary holds for the chat exactly as it does for every other dashboard route. eve co-deploys inside the same Vercel project as the Next app — no second host — consistent with our hard rules.

> **Beta caveat.** eve is in public beta (launched 2026-06-17), sub-1.0, and changing daily (research saw `0.11.8` → `0.13.3` within days; `0.13.0` was a breaking change that removed the top-level `auth` field from `defineTool`). Pin a version, read the docs eve bundles at `node_modules/eve/docs`, and treat every API shape below as **verify-on-install**. Items the research could not confirm are marked **OPEN QUESTION** — confirm against the installed version before building, do not invent.

---

## 0. What grounds this plan

The codebase facts below are verified against the repo:

- `src/server/os/db.ts` exports `osSql(): NeonQueryFunction` reading `SWAYZIO_OS_DATABASE_URL` (lazy-init, template-tag SQL, driver 1.x).
- `src/server/os/embed.ts` exports `embed(texts): Promise<number[][]>` and `toVectorLiteral(v)`, dim `EMBED_DIM=1536` (halfvec), key `EMBED_API_KEY`/`OPENAI_API_KEY`.
- `src/proxy.ts` is the Clerk middleware (fail-closed in prod, public routes = sign-in/up, `/api/webhooks`, `/api/cron`).
- `src/lib/require-founder.ts` is the server founder gate (`currentUser()` + `isFounder(email, publicMetadata.role)`), `src/lib/auth.ts` holds `isFounder`, `isClerkConfigured`, `isProd`, `FOUNDER_EMAILS`.
- `next.config.ts` already sets `turbopack.root` and `serverExternalPackages: ["stripe","@neondatabase/serverless","drizzle-orm"]`.
- Existing env: `SWAYZIO_OS_DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `FOUNDER_EMAILS`, `EMBED_API_KEY`, `CRON_SECRET`, `DATABASE_URL`, `SWAYZIO_APP_DATABASE_URL`.
- `(dashboard)` route group + `analytics`, `database`, `design-system` pages already exist; we add an `agent` panel/route here.

eve framework facts are cited inline as **[research: <topic>]**.

---

## 0.5 F0 spike findings — confirmed against `eve@0.13.3` (2026-06-24)

Installed `eve@0.13.3` ("Filesystem-first framework for durable backend AI agents that run anywhere", github.com/vercel/eve) on branch `phase-f-eve` and read the bundled docs at `node_modules/eve/docs/*`. Results:

**CONFIRMED (plan was right):**
- `defineAgent({ model: "anthropic/claude-opus-4.8" })` from `eve` — gateway string is the documented form. `eve link` pulls Vercel **AI Gateway** credentials, so no separate Anthropic key is needed once linked.
- `defineTool({ description, inputSchema: z.object(...), needsApproval?, async execute(input, ctx) })` from `eve/tools`. Tool name = filename (snake_case); no `name` field. `needsApproval: always()/once()/never()` (or a `({toolInput})=>boolean` predicate) from `eve/tools/approval`; omitted = `never()`. Replay-safety rationale documented (gate non-idempotent work behind `always()`). **Our entire tool/approval design holds.**
- Channel auth lives on `eveChannel({ auth: [AuthFn...] })` (`eve/channels/eve`) as an **ordered walk**, fail-closed. Protected routes: `POST /eve/v1/session`, `POST /eve/v1/session/:id`, `GET /eve/v1/session/:id/stream`; `GET /eve/v1/health` is always public. `ctx.session.auth.current` carries the principal into tools.
- Connections: `defineMcpClientConnection` / `defineOpenAPIConnection` (`eve/connections`); OAuth via `connect()` from `@vercel/connect/eve`.
- `useEveAgent` from `eve/react`; `eve/next` is the bundler plugin (withEve); `evals/` is a sibling of `agent/`. `lib/` is **import-only, never mounted** into the sandbox (only `skills/` + `sandbox/workspace/**` reach it).
- CLI: `init`, `link`, `deploy`, `build`, `start`, `dev`, `info`, `eval`.

**CORRECTED:**
- §5.2 — the auth helpers are `localDev / vercelOidc / none / httpBasic / jwtHmac / jwtEcdsa / oidc` (`eve/channels/auth`), with low-level verifiers `verifyOidc(token, {issuer, audiences, discoveryUrl})` etc. **Clerk = a custom `AuthFn`** in the walk: `extractBearerToken(req)` → `verifyOidc`/`oidc()` against the Clerk issuer → enforce the founder allowlist (`isFounder`) → `throw new ForbiddenError(...)` for non-founders, `return null` to skip, return a `SessionAuthContext` to accept. `eve init` scaffolds `placeholderAuth()` which **must** be replaced.
- §1/§10 — `eve init src/agent` **fails** (treats the target as a project name; rejects `/`). Hand-create `src/agent/` (per §1) or run `eve init` at the app root. Note `eve init --channel-web-nextjs` scaffolds a Next.js Web Chat app — evaluate it for §5.

**STILL TO VERIFY IN F1 (build-time):**
- Cross-root import `src/agent/lib → ../../server/os/*.js` bundles into the Vercel output (use the `.js` NodeNext extension; watch issue #92). Fallback: physically local bridge importing `@neondatabase/serverless` under `src/agent/lib`.
- Whether the default Clerk session token carries `email`/`role` or needs a JWT template; the exact Clerk OIDC `issuer`/`discoveryUrl` for `oidc()`.
- `withEve({ eveRoot: "./src/agent" })` config shape + Next 16 Turbopack compatibility.

---

## 1. Project layout: eve under `src/agent/` coexisting with the Next app

eve is filesystem-first: a file's location is its identity, no registry **[research: core-architecture, github-and-examples]**. We adopt the **nested layout** with the agent root at `src/agent/`, and wrap `next.config.ts` with `withEve()` pointing `eveRoot` at it. `withEve` co-deploys the eve runtime inside the same Vercel project and rewrites `/eve/v1/*` to it same-origin, so the browser never crosses CORS **[research: channels-and-ui]**.

```
src/
├── agent/
│   ├── agent.ts                 # defineAgent: model, modelOptions, compaction
│   ├── instructions.md          # always-on system prompt (founders' analytics agent)
│   ├── instrumentation.ts       # (optional) OTel — root-only
│   ├── channels/
│   │   └── eve.ts               # eveChannel + Clerk bearer AuthFn (the boundary)
│   ├── connections/             # (likely empty in v1 — see §4 on Neon MCP / supermemory)
│   ├── lib/                     # import-only bridge to src/server/os/* (NOT mounted in sandbox)
│   │   ├── os.ts                #   re-exports osSql, embed, toVectorLiteral
│   │   └── analytics.ts         #   composed query helpers (churn, mrr-trend)
│   ├── tools/                   # one thin read-only tool per api.* view + memory.recall
│   │   ├── identity_360.ts
│   │   ├── top_accounts.ts
│   │   ├── stripe_snapshot.ts
│   │   ├── hubspot_snapshot.ts
│   │   ├── app_snapshot.ts
│   │   ├── revenue_monthly.ts
│   │   ├── data_dictionary.ts
│   │   ├── freshness.ts
│   │   ├── recall_memory.ts
│   │   ├── mrr_trend.ts         # composed analytical tool
│   │   ├── churned_accounts.ts  # composed analytical tool
│   │   └── trigger_sync.ts      # WRITE/action tool, needsApproval: always()
│   ├── skills/
│   │   └── data-dictionary/SKILL.md   # how to read the OS, definitions of MRR/churn
│   └── schedules/
│       └── monday-digest.ts     # (optional, later) weekly founder digest
└── evals/                        # sibling of agent/, NOT inside it [research: core-architecture]
    └── revenue.eval.ts
```

**Critical layout rules to honor [research: core-architecture, github-and-examples]:**
- `instructions.md` required at root; `channels/`, `schedules/`, `instrumentation.ts` are **root-only**.
- `lib/` is **import-only** — it is never mounted into the sandbox workspace. This is exactly where our bridge to `src/server/os/*` lives. Tools run in the **app runtime with full `process.env`** (so `SWAYZIO_OS_DATABASE_URL` is available), *not* in the sandbox **[research: tools-and-skills]**.
- Tool filename = model-facing tool name, must be **snake_case ASCII**. No `name` field.
- Relative imports inside `agent/` use the `.js` extension (NodeNext/ESM) **[research: tools-and-skills]**.

**Coexistence with `src/server`:** Our hard rule is "business logic is framework-agnostic in `src/server`." We keep it there. `src/agent/lib/os.ts` is a one-line re-export bridge so tool files import from inside the agent tree (eve's `lib/` convention) while the real logic stays in `src/server/os/`:

```ts
// src/agent/lib/os.ts  — bridge only; no logic here
export { osSql } from "../../server/os/db.js";
export { embed, toVectorLiteral, EMBED_DIM } from "../../server/os/embed.js";
```

> **OPEN QUESTION (layout):** Can an eve agent root at `src/agent/` import from `../../server/*` (outside the agent root) and still compile/bundle correctly for the Vercel Build Output? eve docs describe `lib/` as import-only authored helpers; importing *above* the agent root is unverified. Issue #92 in the research shows `lib/` sibling imports breaking under `eve dev` with a NodeNext `.js`→`.ts` mapping bug (fixed by PRs #140/#156). Mitigation if it fails: move the thin bridge logic to physically live under `src/agent/lib/` and import `@neondatabase/serverless` directly there, reading the same env var. Confirm before F1 completes.

> **OPEN QUESTION (Turbopack/serverExternalPackages):** `withEve` spawns its own dev server and (per issue #101) breaks under `bun --bun`; we run Node + Turbopack, which should be fine, but confirm `withEve` is compatible with Next 16 Turbopack and that `@neondatabase/serverless` remains external for the eve service build. Keep `"dev": "next dev --turbopack"` running under Node.

---

## 2. The tool set (read-only `api.*` + `memory.recall`, plus composed analytics, plus one gated write)

Pattern for every tool: **thin** — Zod-validate input → call `osSql()` (or `embed`) via the `lib/` bridge → return JSON. This mirrors the official "Guard the Spend" tutorial (`run_sql.ts` imports a `lib/` service) and our own "route handlers are thin" convention **[research: tools-and-skills]**. Read-only SELECTs against `api.*` views are **replay-safe** and need **no approval** (eve replays completed steps; only mid-execution interruptions re-run, and a SELECT is idempotent) **[research: tools-and-skills]**.

All read tools are filtered/paginated server-side so a single call can't blow the 50 MB payload / context budget. Default `limit` small, hard cap enforced, `truncated` flag returned.

### 2.1 One tool per `api.*` view

`src/agent/tools/identity_360.ts`:
```ts
import { defineTool } from "eve/tools";
import { never } from "eve/tools/approval";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  needsApproval: never(),
  description:
    "Look up unified people from api.identity_360 (one row per person across Stripe+HubSpot+app: email, mrr, active_subs, tagged_tracks, pro, in_stripe/in_hubspot/in_app). Filter by email or paginate the top by MRR.",
  inputSchema: z.object({
    email: z.string().email().optional(),
    minMrr: z.number().nonnegative().optional(),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
  }),
  async execute({ email, minMrr, limit, offset }) {
    const sql = osSql();
    const rows = email
      ? await sql`SELECT * FROM api.identity_360 WHERE email = ${email} LIMIT 1`
      : await sql`
          SELECT * FROM api.identity_360
          WHERE (${minMrr ?? null}::numeric IS NULL OR mrr >= ${minMrr ?? null})
          ORDER BY mrr DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}`;
    return { rows, count: (rows as unknown[]).length, truncated: (rows as unknown[]).length === limit };
  },
});
```

The remaining view tools follow the identical shape; signatures (inputSchema → return):

| Tool file | View | inputSchema | Returns |
|---|---|---|---|
| `top_accounts.ts` | `api.top_accounts` | `{ limit:1..100=20, offset:0 }` | `{ rows, count, truncated }` |
| `stripe_snapshot.ts` | `api.stripe_snapshot` | `{}` (z.object({})) | `{ snapshot }` (single row of headline Stripe metrics) |
| `hubspot_snapshot.ts` | `api.hubspot_snapshot` | `{}` | `{ snapshot }` |
| `app_snapshot.ts` | `api.app_snapshot` | `{}` | `{ snapshot }` |
| `revenue_monthly.ts` | `api.revenue_monthly` | `{ months:1..36=12 }` | `{ rows }` (month, revenue, … ordered desc, capped) |
| `data_dictionary.ts` | `api.data_dictionary` | `{ table?:string }` | `{ rows }` (column→meaning; lets the model self-explain the schema) |
| `freshness.ts` | `api.freshness` | `{}` | `{ rows }` (per-source last-sync timestamps so the agent can caveat staleness) |

For `{}`-input tools, `inputSchema: z.object({})` is required (eve requires `inputSchema`; pass empty object for no input) **[research: tools-and-skills]**.

`data_dictionary` and `freshness` are deliberately exposed as tools (not just skill text) so the agent can **ground its own answers in the live schema and caveat stale data** — directly serving the "answers grounded in REAL data" goal.

### 2.2 `memory.recall` tool

`src/agent/tools/recall_memory.ts` — wraps the Phase E hybrid-retrieval function. The agent passes plain text; the tool embeds it server-side (same provider as the dashboard, never exposing the key to the model — `toModelOutput`/redaction rules apply **[research: tools-and-skills]**):

```ts
import { defineTool } from "eve/tools";
import { never } from "eve/tools/approval";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { embed, toVectorLiteral } from "../lib/os.js";

export default defineTool({
  needsApproval: never(),
  description:
    "Recall grounded company knowledge (docs + provenance-gated facts) via hybrid vector+lexical+recency search over Swayzio OS memory. Use for 'what do we know about…', context, past decisions, and definitions.",
  inputSchema: z.object({
    query: z.string().min(1),
    scope: z.enum(["all", "document", "fact"]).default("all"),
    k: z.number().int().min(1).max(20).default(8),
  }),
  async execute({ query, scope, k }) {
    const [vec] = await embed([query]);
    const sql = osSql();
    // memory.recall(query_text, query_embedding halfvec(1536), p_scope, k)
    const rows = await sql`
      SELECT * FROM memory.recall(
        ${query},
        ${toVectorLiteral(vec)}::halfvec(1536),
        ${scope},
        ${k}
      )`;
    return { results: rows };
  },
});
```

> **OPEN QUESTION (recall signature):** Confirm `memory.recall`'s exact parameter order/names and the `p_scope` accepted values against the Phase E migration (`scripts/os-migrate.ts` output / `db/swayzio-os`). The brief states `recall(query_text, query_embedding halfvec(1536), p_scope, k)`; verify the halfvec cast literal works through the Neon HTTP driver (it does for the dashboard backfill in `os-embed.ts`).

### 2.3 Composed analytical tools

Two tools answer the headline founder questions directly so the model doesn't have to hand-assemble multi-step queries (and so the logic is testable/cached). They live as helpers in `src/agent/lib/analytics.ts` (which can in turn call `src/server/integrations/*` or `api.revenue_monthly`):

- `mrr_trend.ts` — *"MRR trend vs last quarter."*
  ```ts
  inputSchema: z.object({
    periodMonths: z.number().int().min(1).max(24).default(3),
    compareToPrior: z.boolean().default(true),
  })
  // returns: { current: {months, mrrSeries}, prior?: {...}, deltaPct }
  ```
  Built on `api.revenue_monthly` (and/or the battle-tested `getSubscriptionMetrics` in `src/server/integrations/stripe.ts` — read-only). **Hard rule:** do not change `stripe-service` MRR math; the tool only *reads* it.

- `churned_accounts.ts` — *"which churned accounts were highest value?"*
  ```ts
  inputSchema: z.object({
    sinceDays: z.number().int().min(1).max(365).default(90),
    limit: z.number().int().min(1).max(100).default(20),
  })
  // returns: { rows: [{ email, lastMrr, churnedAt, source }], truncated }
  ```
  Joins churn events (events-based churn, per hard rule #2) against `api.identity_360` to rank by value. **OPEN QUESTION (data):** confirm whether a churn/event surface exists in `api.*` or whether this must read `core`/`metrics` directly — if it reads outside `api.*`, keep it read-only and document the exception.

All read/composed tools carry `needsApproval: never()` from `eve/tools/approval` **[research: tools-and-skills, github-and-examples]**.

### 2.4 The one write/action tool (separately authorized)

`src/agent/tools/trigger_sync.ts` — the only non-read tool in v1. It enqueues a feed refresh (the same `withSyncRun` path the cron uses). It is gated and idempotency-aware because eve re-runs a step interrupted mid-execution **[research: tools-and-skills]**:

```ts
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

export default defineTool({
  description: "Trigger an out-of-band data sync for one source (stripe|hubspot|app). Use only when the founder explicitly asks to refresh stale data.",
  inputSchema: z.object({ source: z.enum(["stripe", "hubspot", "app"]) }),
  needsApproval: always(),          // human signs off every call
  async execute({ source }) {
    // call the same internal sync entrypoint cron uses; do NOT run a 3rd-party API
    // synchronously here per hard rule #3 — enqueue / hit /api/cron-style trigger.
    return await enqueueSync(source);
  },
});
```

`always()` parks the turn at `session.waiting` until a founder clicks approve, and makes the side effect replay-safe **[research: tools-and-skills, deploy-vercel]**. See §7.

---

## 3. `instructions.md` — the founders' analytics agent system prompt

`src/agent/instructions.md` is always-on every turn; keep it short and stable, push detail into the `data-dictionary` skill **[research: model-mcp-state, tools-and-skills]**.

```md
You are **Eve**, the in-house analytics agent for Swayzio's two founders. You answer
questions about the company's real numbers — revenue, subscriptions, churn, customers,
and product usage — grounded ONLY in the data your tools return.

## How you work
- You read from Swayzio OS, the company brain, through your tools. Every tool is a
  curated, read-only view of real Stripe / HubSpot / product data.
- ALWAYS ground claims in tool output. Never invent numbers. If a tool returns nothing,
  say so. If data may be stale, call `freshness` and caveat the answer with the last
  sync time.
- When you are unsure what a column or metric means, call `data_dictionary` before
  guessing. Definitions of MRR (USD-only), churn (events-based), and revenue live there
  and in the `data-dictionary` skill.
- For "what do we know about X" / past decisions / context, use `recall_memory`.
- Prefer the composed tools (`mrr_trend`, `churned_accounts`) for trend and ranking
  questions; they encode the correct, battle-tested definitions.

## Style
- Concise. Lead with the number/answer, then a one-line "how I got it" (which tools,
  what timeframe). Round money to the nearest dollar; show % to one decimal.
- These are founders: assume fluency, skip basics, surface the surprising thing.

## Boundaries
- You are READ-ONLY by default. The only action you can take is `trigger_sync`, and it
  requires explicit founder approval every time. Never claim you changed anything else.
- Never reveal credentials, connection strings, raw tokens, or internal IDs that aren't
  useful to a founder.
```

Put the deeper, on-demand material (full metric definitions, the `api.*` map, "MRR is USD-only", "churn is events-based") in `src/agent/skills/data-dictionary/SKILL.md` so it's loaded via `load_skill` only when relevant rather than bloating every turn **[research: tools-and-skills, model-mcp-state]**:

```md
---
description: Use when the user asks what a metric means, how MRR/churn/revenue are defined, or which api.* view holds which data.
---
# Swayzio OS data dictionary
- MRR is USD-only. Churn is events-based (not snapshot diff). Revenue history is
  decoupled from core subscription stats.
- api.identity_360 — one row/person unified across Stripe+HubSpot+app …
- api.top_accounts / api.revenue_monthly / api.*_snapshot / api.freshness …
(Mirror docs/ARCHITECTURE.md §10 and the data dictionary view.)
```

---

## 4. Model + MCP config

`src/agent/agent.ts` **[research: model-mcp-state, github-and-examples]**:
```ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-opus-4.8",   // gateway-routed string → AI Gateway via Vercel OIDC, no provider key to manage
  compaction: { thresholdPercent: 0.9 }, // default; tune down if turns get long
});
```

- A **string model id routes through Vercel AI Gateway**; on Vercel with a linked project it authenticates via **OIDC — no `ANTHROPIC_API_KEY` to set** **[research: model-mcp-state, deploy-vercel]**. This is the lowest-setup, Vercel-native choice and matches our "everything on Vercel" rule.
- We deliberately use a **string id, not a direct `@ai-sdk/anthropic` provider object**, because issue #92 shows direct-provider models + `lib/` imports break under `eve dev` (gateway string fixes it) **[research: blogs-bestpractices]**.
- Default if `agent.ts` omitted is `anthropic/claude-sonnet-4.6`; we set Opus explicitly for analytical reasoning quality. Reconsider Sonnet for cost on low-risk turns later **[research: blogs-bestpractices]**.

**MCP connections (`agent/connections/`) — recommendation: NONE in v1.**
- **Do NOT connect the Neon MCP.** The Neon MCP is a database-admin/management surface (run SQL, create branches, manage projects). Exposing it to the agent would (a) break the read-only boundary — it can run arbitrary writes/DDL — and (b) bypass our curated `api.*` surface, which is the whole point of the boundary. Our `osSql()` tools against `api.*` views are strictly safer and sufficient **[research: model-mcp-state — eve has no built-in vector/DB layer; you reach "your own database" from inside a tool's execute]**.
- **Do NOT connect supermemory** in v1. Phase E already gives us `memory.recall()` (pgvector hybrid retrieval) in our own Neon project; eve's State guide explicitly says cross-session/queryable memory belongs in "your own database" reached from a tool — which is exactly `recall_memory.ts`. Adding supermemory would duplicate it and add a second store to keep in sync. Revisit only if we want managed memory we don't own.
- The **Neon Data API (PostgREST + Clerk JWKS)** is an alternative read path to `api.*` over HTTP+JWT. We do **not** route the agent through it — tools call `osSql()` directly (one less hop, full `process.env`, no JWT minting inside the agent). Keep the Data API as the *frontend/3rd-party* read path; the agent uses SQL. (If a future tool needs PostgREST, use `defineOpenAPIConnection` — **OPEN QUESTION**: confirm `defineOpenAPIConnection` can carry a per-request Clerk JWT for the Data API.)

**Cross-session/durable state:** use eve's `defineState` (from `eve/context`) only for ephemeral per-session working memory (e.g. a per-session query budget) — it does **not** replace our DB and resets only if we clear it on `turn.started` **[research: model-mcp-state]**. Anything durable/queryable stays in Swayzio OS. Do **not** set `experimental.workflow.world` (e.g. `@workflow/world-postgres`) — on Vercel the default Vercel Workflow world is correct; that knob is unstable and unrelated to agent memory **[research: model-mcp-state]**.

---

## 5. The web channel: embedded dashboard panel with Clerk auth

There is **no separate "web channel runtime"** — browser chat = the default `eve` HTTP channel (`/eve/v1/session*`, on by default) + the `useEveAgent` React hook, wired same-origin by `withEve` **[research: channels-and-ui]**.

### 5.1 Wire-up

`next.config.ts` — wrap, pointing at the agent root:
```ts
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  serverExternalPackages: ["stripe", "@neondatabase/serverless", "drizzle-orm"],
};

export default withEve(nextConfig, { eveRoot: "./src/agent" });
```

Dashboard route `src/app/(dashboard)/agent/page.tsx` renders a client chat panel using `useEveAgent()` from `eve/react`, styled with the existing daisyUI `swayzio` theme **[research: channels-and-ui]**. The hook returns `{ data.messages, status, send, stop, reset, session, events, error }`. Persist the **full** `session` cursor (sessionId + continuationToken + streamIndex) via `onSessionChange` for resumable threads; optionally persist `chat_event` rows in the `swayzio-admin-dashboard` Neon DB following the eve-chat-template app-chat-vs-eve-session split for multi-thread history **[research: channels-and-ui]**.

### 5.2 Auth at the channel boundary (the security boundary, per hard rule #5)

`src/agent/channels/eve.ts` — fail-closed; founders-only via **bearer token + Clerk JWKS verification**. Research strongly recommends the **bearer + `oidc()`/`verifyOidc` path over calling Clerk's `auth()` inside an `AuthFn`** (the `AuthFn` gets a raw `Request`, not Next request context — calling `auth()` there is unverified) **[research: channels-and-ui]**.

Client attaches a Clerk token on every eve request:
```tsx
// in the chat panel
const { getToken } = useAuth();           // @clerk/nextjs
const agent = useEveAgent({
  headers: async () => ({ authorization: `Bearer ${await getToken()}` }),
});
```

Channel verifies it against Clerk's JWKS and enforces the founder role:
```ts
// src/agent/channels/eve.ts
import { eveChannel } from "eve/channels/eve";
import { type AuthFn, localDev, extractBearerToken, verifyOidc } from "eve/channels/auth";

function clerkFounder(): AuthFn<Request> {
  return async (request) => {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) return null;
    const result = await verifyOidc(token, {
      issuer: process.env.CLERK_JWT_ISSUER!,            // e.g. https://clerk.admin.swayzio.com
      // audiences / discoveryUrl per Clerk JWKS — confirm shape on install
    });
    if (!result.ok) return null;
    const claims = result.sessionAuth?.attributes ?? {};
    const role = (claims as any).publicMetadata?.role;
    const email = (claims as any).email;
    // Mirror src/lib/auth.ts isFounder(email, role): FOUNDER_EMAILS allowlist OR role==="founder"
    const founders = (process.env.FOUNDER_EMAILS ?? "").split(",").map(s => s.trim().toLowerCase());
    const isFounder = role === "founder" || (email && founders.includes(email.toLowerCase()));
    if (!isFounder) return null;
    return { authenticator: "clerk", principalType: "user", principalId: result.sessionAuth!.principalId, attributes: { email, role } };
  };
}

export default eveChannel({
  auth: [clerkFounder(), localDev()],   // localDev for loopback dev; DROP vercelOidc()/placeholderAuth(); NEVER none()
});
```

- The scaffolded default (`placeholderAuth()` / `[localDev(), vercelOidc()]`) **rejects all production browser traffic** — we must replace it before any prod browser call **[research: channels-and-ui, blogs-bestpractices]**. Keeping only `clerkFounder()` + `localDev()` makes the chat exactly as founders-only as the rest of the dashboard.
- This is the boundary; do **not** rely on hiding the route client-side (hard rule #5). The `principalId`/`attributes` flow forward as `ctx.session.auth` for any future per-user scoping **[research: channels-and-ui]**.

> **OPEN QUESTIONS (auth):**
> 1. Confirm `verifyOidc`'s exact config object (issuer/audiences/discoveryUrl/jwksUri) against the installed `eve/channels/auth`; the research could not read the full signature.
> 2. Confirm what a Clerk session token's claims contain by default — does it carry `publicMetadata.role` and `email`, or do we need a custom Clerk JWT template? Likely a **custom JWT template** is required to put `role`/`email` in claims. Decide: custom template vs. a second hop that resolves the Clerk userId → founder via Clerk Backend API.
> 3. Confirm `getToken()` (default Clerk session token) is accepted by `verifyOidc`, vs. needing `getToken({ template: "eve" })`.

### 5.3 Existing middleware

`src/proxy.ts` matches `/(api|trpc)(.*)` and most routes. eve routes live at `/eve/v1/*` (not `/api`). **OPEN QUESTION (middleware):** confirm whether the Clerk middleware matcher catches `/eve/v1/*`. If it does, either (a) add `/eve/v1(.*)` to `isPublicRoute` so eve's *own* `AuthFn` is the sole gate for those routes (preferred — single boundary, avoids double-auth/cookie-vs-bearer conflicts), or (b) exclude `/eve` from the matcher. The eve channel `AuthFn` remains the real boundary either way. `GET /eve/v1/health` must stay public.

---

## 6. Deployment on Vercel (Workflow DevKit, env, scheduling)

eve compiles to Vercel Build Output and runs on Vercel Functions + Fluid Compute; durability is Vercel Workflow (the Workflow SDK's GA layer) **[research: deploy-vercel]**. With `withEve`, the web app and eve runtime deploy as a **single Vercel project** (our existing `swayzio-admin-dashboard` project) — no second host, satisfying the hard rule **[research: channels-and-ui, deploy-vercel]**.

**Deploy command:** use `eve deploy` (wraps `vercel deploy --prod`, installs deps, pulls env) **[research: deploy-vercel]**. Since we deploy from GitHub `main`, the normal path is `git push` → Vercel hosted build runs `next build` (which now runs `eve build` via `withEve`/`eveBuildCommand`). **Do NOT use `vercel deploy --prebuilt`** — sandbox-template prewarm only runs when both `VERCEL` and `VERCEL_DEPLOYMENT_ID` are present; a prebuilt build breaks at runtime **[research: deploy-vercel, blogs-bestpractices]**.

**Env vars (Vercel project + `.env.local`):**
- Already present: `SWAYZIO_OS_DATABASE_URL`, `EMBED_API_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `FOUNDER_EMAILS`, `CRON_SECRET`.
- **New:** `CLERK_JWT_ISSUER` (Clerk Frontend API / instance issuer URL for `verifyOidc`).
- **Model:** none if AI Gateway via linked Vercel project OIDC. Off-Vercel/local fallback: `AI_GATEWAY_API_KEY` **[research: model-mcp-state, deploy-vercel]**.
- Tools read `SWAYZIO_OS_DATABASE_URL` from `process.env` at runtime (they run in the app runtime, not the sandbox) — already wired via `osSql()`.

**maxDuration / Fluid Compute:** not set in eve config — the generated Workflow routes set step routes to `maxDuration: "max"` (plan max) and the flow route to 60s; Fluid Compute is on by default for new projects **[research: deploy-vercel]**. Verify Fluid is on for `swayzio-admin-dashboard`.

**Scheduling:** if we add `src/agent/schedules/monday-digest.ts` (`defineSchedule({ cron, markdown })`), each becomes a Vercel Cron Job evaluated **in UTC** **[research: deploy-vercel]**. Note we already have a 6h OS sync via GitHub Actions (`.github/workflows/os-sync.yml`) — keep data freshness there; the eve schedule is only for *agent-authored* digests, not data loading. `eve dev` never fires schedules on cadence; trigger in dev via `POST /eve/v1/dev/schedules/<name>`.

**Observability:** Vercel auto-detects eve and shows an **Agent Runs** tab (sessions/turns/tool calls/tokens) with no `instrumentation.ts` — but the research flags it is **gated per team**; our Vercel team (swayzio) may need it enabled by Vercel. OTel via `agent/instrumentation.ts` is optional and separate **[research: deploy-vercel]**.

**Verify after deploy [research: deploy-vercel, github-and-examples]:**
```bash
curl https://admin.swayzio.com/eve/v1/health          # public, 200
curl -X POST https://admin.swayzio.com/eve/v1/session  # WITHOUT a Clerk token → expect 401 (boundary holds)
```

---

## 7. Read-only boundary + approval model

**The boundary, restated concretely:**
1. **Surface restriction.** The agent's only DB access is `osSql()` against **`api.*` views** (curated, read-only by design) and `memory.recall()`. No raw `core`/`raw`/`ops` table access, no `osSql` arbitrary-SQL tool exposed to the model, no Neon MCP, no DDL. The model never sees connection strings (they live in `process.env`, used inside `execute`) **[research: tools-and-skills, model-mcp-state]**.
2. **DB-level enforcement (defense in depth).** Run the agent's tools through a **read-only Postgres role** on `swayzio-os` (analogous to the existing `dashboard_ro` role for the app DB). Provision a `os_agent_ro` role with `SELECT` on schema `api` and `EXECUTE` on `memory.recall` only, then point a second env var (e.g. `SWAYZIO_OS_AGENT_RO_URL`) at it and have `lib/os.ts` use that for read tools. This means even a buggy/compromised tool physically cannot write. **OPEN QUESTION (infra):** confirm/create `os_agent_ro` and its grants; decide whether read tools use a separate connection from `trigger_sync`.
3. **Replay safety.** Read SELECTs are idempotent → safe under eve's step replay. Only `trigger_sync` is non-idempotent **[research: tools-and-skills]**.

**Approval model for writes/actions [research: tools-and-skills, deploy-vercel]:**
- `trigger_sync` (the only write in v1) uses `needsApproval: always()` from `eve/tools/approval`. The turn parks at `session.waiting` (durable, holds no compute) until a founder approves in the chat UI (`input.requested` event → render approve/deny → `agent.send(...)` the decision) **[research: channels-and-ui]**.
- Any future write tool (Kit email, HubSpot mutation, Stripe action) is **opt-in, separate, and gated** the same way — never folded into a read tool. Threshold predicates (`needsApproval: ({toolInput}) => …`) for value-based gating where relevant.
- `trigger_sync.execute` must **enqueue**, not call a third-party API synchronously (hard rule #3) — reuse the cron/`withSyncRun` path and make it idempotent so a replayed step can't double-fire.

---

## 8. Phased task breakdown

### F0 — Spike & confirm (do not skip; eve is fast-moving beta)
- [ ] Install pinned `eve` in a branch; read `node_modules/eve/docs` for the **exact installed-version** API (tools, `eve/channels/auth`, `withEve`).
- [ ] Resolve OPEN QUESTIONS: §1 cross-root import, §2.2 recall signature, §5.2 Clerk claims/`verifyOidc` config, §5.3 middleware matcher, §7 `os_agent_ro` role.
- [ ] Verify `withEve` + Next 16 Turbopack + Node dev works (issue #101 is Bun-only; confirm we're clear).
- **Verify:** `npx eve@latest init src/agent` (or manual `npm i eve@<pin> ai zod`) scaffolds; `eve info` lists the discovered surface.

### F1 — Scaffold the agent skeleton
- [ ] `agent.ts` (Opus via gateway string), `instructions.md` (founders' analytics prompt), `lib/os.ts` bridge.
- [ ] One trivial read tool (`freshness.ts`) end-to-end against `api.freshness` via `osSql()`.
- [ ] `eve dev`, ask "is the data fresh?" → tool runs, returns real `api.freshness` rows.
- **Verify:** `eve info` shows the tool; a local session returns real OS data (not mock); no write occurred.

### F2 — Full read tool set
- [ ] Implement all §2.1 view tools + §2.2 `recall_memory` + §2.3 `mrr_trend`/`churned_accounts`.
- [ ] All carry `needsApproval: never()`; all paginated/capped.
- [ ] `data-dictionary` skill authored.
- **Verify:** ask the two headline questions ("MRR trend vs last quarter"; "highest-value churned accounts") in `eve dev`; numbers match the dashboard's `analytics` page and `stripe-service` figures (cross-check MRR/churn per hard rule #2).

### F3 — Read-only boundary hardening
- [ ] Provision `os_agent_ro` role on `swayzio-os` (SELECT on `api`, EXECUTE on `memory.recall`); add `SWAYZIO_OS_AGENT_RO_URL`; route read tools through it.
- [ ] Confirm no tool exposes arbitrary SQL or non-`api` tables to the model.
- **Verify:** attempt a write via the RO connection in a probe script → fails at the DB; redact-check tool outputs for secrets/IDs.

### F4 — Web channel + Clerk auth (the boundary)
- [ ] `channels/eve.ts` with `clerkFounder()` (bearer + `verifyOidc`) + `localDev()`; add `CLERK_JWT_ISSUER`; create Clerk JWT template if needed for `role`/`email` claims.
- [ ] Wrap `next.config.ts` with `withEve({ eveRoot: "./src/agent" })`.
- [ ] `(dashboard)/agent/page.tsx` chat panel with `useEveAgent({ headers: bearer })`, daisyUI `swayzio` theme, resumable session via `onSessionChange`.
- [ ] Reconcile `src/proxy.ts` matcher for `/eve/v1/*`.
- **Verify:** signed-in founder can chat; signed-in **non-founder** gets 401 from the channel; unauthenticated `POST /eve/v1/session` → 401; `GET /eve/v1/health` → 200.

### F5 — Write/action tool + approvals
- [ ] `trigger_sync.ts` with `needsApproval: always()`, idempotent enqueue via the existing sync path.
- [ ] Chat panel renders the `input.requested` approval prompt and sends the decision.
- **Verify:** ask to refresh stripe → turn parks at `session.waiting`; approve → exactly one sync run appears in `ops.sync_runs`; deny → no run.

### F6 — Evals + deploy
- [ ] `evals/revenue.eval.ts` (e.g. asserts the MRR-trend answer calls `mrr_trend` and includes the right caveat); `eve eval`.
- [ ] Push `main` → Vercel hosted build (not `--prebuilt`); confirm Fluid Compute on.
- [ ] Optional `schedules/monday-digest.ts`.
- **Verify:** prod `eve/v1/health` 200; prod `POST /eve/v1/session` without token → 401; Agent Runs tab populates (request Vercel to enable if gated); a real founder Q&A in prod returns grounded, correct numbers.

---

## 9. Risks & open questions

**Risks**
- **Beta churn / breaking changes.** Sub-1.0, daily releases; `0.13.0` already removed `defineTool` top-level `auth`. *Mitigation:* pin a version, gate upgrades behind F0 re-read of bundled docs, keep tools thin so churn surface is small.
- **`lib/` import + NodeNext `.js` mapping bugs** (issues #92/#101). *Mitigation:* use gateway-string model (not direct provider), run dev under Node, keep `.js` extensions, fall back to physically-local bridge under `src/agent/lib`.
- **Clerk claims not in default token.** Likely needs a custom Clerk JWT template for `role`/`email`. *Mitigation:* F0 spike; fallback to Clerk Backend API resolution of userId → founder.
- **Double-auth conflict** between Clerk middleware (cookie) and the eve channel (bearer) on `/eve/v1/*`. *Mitigation:* make eve routes "public" to the Next middleware so the channel `AuthFn` is the single boundary.
- **Cost.** Tokens + Workflow events + tool calls bill per use; long sessions raise Workflow data/replay. *Mitigation:* small result caps, concise tool outputs, push reference text into skills, consider Sonnet for low-risk turns, configure Spend Management **[research: blogs-bestpractices]**.
- **Agent Runs gated per team** — observability may not appear until Vercel enables it for the swayzio team.

**Open questions (consolidated — confirm in F0)**
1. Cross-agent-root import (`src/agent` → `../../server/os/*`) bundles cleanly for Vercel output. (§1)
2. Exact `memory.recall` signature + halfvec cast over HTTP driver. (§2.2)
3. Whether `churned_accounts` can be served from `api.*` or must read `core`/`metrics`. (§2.3)
4. `verifyOidc` config object shape for Clerk JWKS; whether default Clerk token carries `role`/`email` or needs a JWT template; whether `getToken()` vs `getToken({template})`. (§5.2)
5. Clerk middleware matcher behavior for `/eve/v1/*` and the right exclusion. (§5.3)
6. `os_agent_ro` role + grants on `swayzio-os`. (§7)
7. `defineOpenAPIConnection` + per-request Clerk JWT for the Neon Data API (only if we ever route the agent through PostgREST). (§4)
8. Whether the swayzio Vercel team has Agent Runs / Fluid Compute enabled. (§6)

---

## 10. Install / scaffold commands

```bash
# F0 — branch + install (pin a version; check npmjs.com/package/eve for current)
git checkout -b phase-f-eve
npm install eve@<pinned-version> ai zod          # zod already present; ai is new

# Scaffold the agent into src/agent (adds agent.ts + instructions.md + a sample tool).
# Run by a coding agent, bare `eve init` prints a guide — pass the path explicitly:
npx eve@<pinned-version> init src/agent
#   (If init refuses to nest under an existing project, hand-create src/agent/ per §1
#    and add npm scripts: "agent:dev":"eve dev", "agent:build":"eve build", "agent:info":"eve info")

# Read the exact installed API the agent will code against:
cat node_modules/eve/docs/reference/typescript-api.md
cat node_modules/eve/docs/channels/eve.mdx
cat node_modules/eve/docs/reference/project-layout.md

# Wrap next.config.ts with withEve({ eveRoot: "./src/agent" })  (manual edit, §5.1)

# Dev (boots eve dev server next to next dev; browser talks only to the Next origin):
npm run dev
eve info                                          # inspect discovered tools/skills/channels
curl -X POST http://127.0.0.1:3000/eve/v1/session -H 'content-type: application/json' \
  -d '{"message":"Is our data fresh, and what was MRR last month?"}'

# Evals:
eve eval

# Deploy (from main → Vercel hosted build; NOT --prebuilt):
git push origin phase-f-eve     # open PR → merge → Vercel builds
# or directly:
eve deploy                       # wraps vercel deploy --prod, installs deps, pulls env

# Verify prod:
curl https://admin.swayzio.com/eve/v1/health
curl -X POST https://admin.swayzio.com/eve/v1/session   # expect 401 without a Clerk bearer
```
