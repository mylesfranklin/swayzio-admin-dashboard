# Decision Log (ADR-style)

Short, dated records of architectural decisions and *why*. Newest first.

---

## 2026-06-23 — Swayzio OS: one Neon Postgres as the agent-native company system of record
**Decision:** Build a **new dedicated Neon project** (`swayzio-os`) as the company brain — a single
Postgres holding normalized, cron-fed, append-only company data designed for agent retrieval. The
admin dashboard becomes a *reader* of it; the app itself is **not** re-architected. Full spec in
`docs/COMPANY-OS.md`.
**Why:** Goal is "the whole company in one DB" that maximizes agent runtime (data is pre-joined and
pre-embedded, so agents reason instead of fetch). Neon (Databricks co.) is purpose-built for this —
Data API (PostgREST over HTTP), pgvector, copy-on-write branching/snapshots, MCP, scale-to-zero.
Inverts our current model: crons stop warming a JSON cache and start materializing canonical rows
(`raw`→`core`→`metrics`, plus `memory` + `ops`), unified by a `core.identity` spine across
Stripe/HubSpot/app-DB.
**Locked sub-decisions:** (1) new dedicated project, not the dashboard's project; (2)
external-scheduler-first (Vercel Cron / GitHub Actions) — because **`pg_cron` is silently skipped
under scale-to-zero**; `pg_cron` reserved for an always-on in-DB maintenance lane later; (3) agent/
Data-API auth reuses **Clerk via external JWKS** + RLS, not a second identity system.
**Status update (2026-07-07):** Phases A–F are live. Migrations are applied through `0013`; curated
`api.*` views, `memory.recall`, semantic recall, the root `agent/` Eve agent, and `trigger_sync` are
in production. Current state and open threads live in `docs/HANDOFF.md`.

---

## 2026-06-20 — Drop Drizzle ORM; talk to Neon directly (supersedes "Keep Neon + Drizzle")
**Decision:** Use the **Neon serverless driver** (`@neondatabase/serverless`) with plain SQL +
a hand-written migration file. Remove `drizzle-orm`, `drizzle-kit`, `drizzle-zod`. Keep **Neon** as
the database and **Zod** for validation.
**Why:** Founder preference for fewer abstractions ("use Neon instead of Drizzle"). The DB workload
is light (mostly a cache table; the heavy lifting is Stripe API calls), so the typed query-builder +
auto-migrations don't earn their keep here. Note: Neon and Drizzle were never alternatives — Neon is
the DB host, Drizzle is an ORM on top; this drops only the ORM layer.
**Database:** dedicated Neon project `swayzio-admin-dashboard` (project `little-glade-22134511`, org
"Myles", pg17). `DATABASE_URL` (pooled endpoint) is in gitignored `.env.local`.

## 2026-06-20 — Stripe agent tooling
**Decision:** Installed Stripe's coding skills (`stripe-best-practices`, `stripe-directory`,
`stripe-projects`, `upgrade-stripe`) via `npx skills add https://docs.stripe.com`. Added the Stripe
**MCP server** to `.mcp.json` (`npx @stripe/mcp@latest`, key via `${STRIPE_SECRET_KEY}` env
expansion — no secret committed) for conversational Stripe queries now and the eve.dev agent later.
**Key:** a **restricted live key** (`rk_live_…`) in `.env.local`; verified read access to balance,
customers, subscriptions, charges, invoices, products, events (least privilege for a read-only
dashboard).

## 2026-06-20 — Adopt Next.js 16 + Vercel as the target stack
**Context:** Dashboard exported from Replit (React/Vite/Wouter + Express + Neon). Founder wants
Turbopack, an eve.dev agent chat, daisyUI (drop hand-maintained Tailwind), and to "go all in on
Vercel." Bought a daisyUI charts pack that is itself a Next.js 16 / React 19 / Tailwind 4 / daisyUI 5
app.
**Decision:** Migrate to **Next.js 16 (App Router, Turbopack) + React 19 + Tailwind 4 + daisyUI 5 +
ApexCharts + Clerk + Neon + eve.dev, all on Vercel.**
**Why:** Every stated requirement converges on Next.js — Turbopack has no standalone package (ships
with Next), eve.dev is Vercel-native, the charts pack is already Next, Clerk is first-class in Next,
and Vercel is the chosen host. The expensive business logic is portable TS, so the cost is shell
migration, not a rewrite.
**Rejected:** SolidJS (beta, full component rewrite, no rendering bottleneck to justify it);
Cloudflare/D1/Workers/Hyperdrive (chose Vercel); Rspack (Turbopack is Vercel-native); staying
Vite-SPA permanently (blocks Turbopack + complicates the agent).

## 2026-06-20 — Migrate in-place, not a fresh repo
**Decision:** Restructure this repo into the Next.js app; preserve git history; delete the legacy
shell only after parity.
**Why:** Keeps history and existing Vercel/Neon wiring; the service layer moves rather than is rebuilt.

## 2026-06-20 — Backend → Next Route Handlers + Vercel Cron (not a persistent host)
**Decision:** Port Express services into Next Route Handlers; replace the 6h in-process timer with
Vercel Cron; use Fluid Compute for long Stripe jobs.
**Why:** Goal is one platform (Vercel). The Stripe overhaul already fits serverless timeouts
(core <20s, revenue <75s). Avoids running a second host.

## 2026-06-20 — Keep the design; re-express it as a daisyUI theme
**Decision:** Preserve the Linear dark look exactly, implemented as a `swayzio` daisyUI theme
(Tailwind 4 CSS-first, OKLCH tokens). Replace shadcn primitives with daisyUI; keep Radix only where
daisyUI lacks an accessible primitive.
**Why:** The look is liked; the maintenance burden (hand-maintained Tailwind tokens) is the
complaint. daisyUI moves theming into CSS variables.

## 2026-06-20 — Charts: ApexCharts (via the owned skill), not Recharts
**Decision:** Standardize on ApexCharts + `react-apexcharts`, generated via the `daisyui-charts`
skill; dynamic-import with `ssr:false`.
**Why:** It's the pack we own, pre-styled to daisyUI tokens, and auto-re-themes via `var(--color-*)`.

## 2026-06-20 — Keep Neon + Drizzle (no D1) — superseded
**Decision:** Stay on Neon Postgres with Drizzle.
**Why:** Already built and accurate; native Vercel integration; D1 buys nothing for this workload.
**Superseded by:** `2026-06-20 — Drop Drizzle ORM; talk to Neon directly`. The current code uses the
Neon serverless driver with plain SQL and has no Drizzle dependency.

## 2026-07-07 — eve pinned exact + Sonnet 5 via AI Gateway string
eve is a fast-moving beta (0.13.0 removed defineTool `auth`; 0.14.0 removed `needsApproval`), so the
dependency is pinned exactly (`"eve": "0.19.0"`) and upgrades are gated on reading
`node_modules/eve/CHANGELOG.md`. Model is the gateway id `anthropic/claude-sonnet-5` (founder
preference; cost/speed) — a string id routes through the Vercel AI Gateway via OIDC, so no provider
key exists anywhere.

## 2026-07-07 — Embeddings ride the AI Gateway via OIDC (no provider key)
`embed.ts` defaults to the gateway's OpenAI-compatible `/embeddings` authed by `VERCEL_OIDC_TOKEN`
(auto-provided on Vercel, `vercel env pull` locally). Zero new secrets, billing consolidated in the
gateway. An explicit `EMBED_API_KEY`/`OPENAI_API_KEY` overrides for direct-provider use.

## 2026-07-07 — Stripe metrics lead with the reconciled triple, booked demoted
Collected (cash) → collectible (≈ the Stripe app's MRR: paying + past-due-in-dunning) → booked (list
price) — everywhere: dashboard KPI rows, `metrics.stripe_daily.collectible_mrr` in the OS, and Eve's
`revenue_health`. A single headline "MRR" was hiding the pause_collection base
(docs/STRIPE-MRR-INVESTIGATION.md); no service math changed, only additive fields + presentation.
