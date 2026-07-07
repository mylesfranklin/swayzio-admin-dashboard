# CLAUDE.md — Swayzio Admin Dashboard

The internal **brain and analytics engine** for Swayzio. Founders-only dashboard unifying Stripe,
HubSpot, Kit, Mercury, and social data, with a built-in AI agent. Fast, beautiful, Vercel-native.

**Read these first:** `docs/HANDOFF.md` (current status + open threads), `docs/ARCHITECTURE.md`
(the spec), `docs/DECISIONS.md` (why things are the way they are), `docs/COMPANY-OS.md` (the
Swayzio OS brain the agent reads).

---

## Current state (2026-07)
Everything below is **live in production** at **admin.swayzio.com** (Vercel, swayzio team; push to
`main` auto-deploys):
- **Dashboard**: Next.js app (`src/`), Clerk production auth (founders-only), Stripe + HubSpot +
  Swayzio-Core app DB wired through the cache, cron warming every 6h. The legacy Replit export is
  long gone — clean Next-only repo.
- **Swayzio OS** (docs/COMPANY-OS.md): dedicated Neon project `swayzio-os` — raw→core→metrics ELT
  fed every 6h by GitHub Actions (`os-sync.yml`), identity spine, `api.*` read views, `memory.*`
  with **semantic recall live** (embeddings via Vercel AI Gateway OIDC — no provider key).
  Migrations `db/swayzio-os/migrations/` via `npm run os:migrate` (through 0013).
- **Eve agent** (`agent/` at repo root, eve **0.19.0 pinned**, model `anthropic/claude-sonnet-5`):
  founders-only chat at `/agent` ("Ask the OS"), 13 read-only tools over `api.*` +
  `recall_memory` (hybrid), one approval-gated write (`trigger_sync`). Auth = Clerk "eve" JWT
  template verified at the eve channel (`agent/channels/eve.ts`); reads via the `os_agent_ro`
  Postgres role (`SWAYZIO_OS_AGENT_RO_URL`) so tools physically cannot write.
- **Stripe metrics are the reconciled triple** (docs/STRIPE-MRR-INVESTIGATION.md): collected
  (~$7.4K cash) → collectible (~$18.2K ≈ the Stripe app's MRR) → booked (~$34.5K list price).
  Dashboard, OS (`metrics.stripe_daily.collectible_mrr`), Eve, and the Stripe app all agree.

See `docs/HANDOFF.md` for open threads and memory `deployment`/`swayzio-os`/`stripe-data-findings`.

## Target stack
Next.js 16 (App Router, **Turbopack**) · React 19 · Tailwind CSS 4 + **daisyUI 5** (CSS-first config)
· **ApexCharts** (via the `daisyui-charts` skill) · TanStack Query · Clerk (founders-only) · **Neon**
Postgres via the **serverless driver + plain SQL** (no Drizzle — see DECISIONS.md) · Zod for
validation · **Vercel** (hosting + Cron + Fluid Compute) · **eve** agent (live — pinned exact, it's a
fast-moving beta: read `node_modules/eve/CHANGELOG.md` before any upgrade).

DB: dedicated Neon project `swayzio-admin-dashboard`; `DATABASE_URL` in `.env.local`. Stripe coding
skills installed under `.agents/skills` (`npx skills add https://docs.stripe.com`); Stripe MCP in
`.mcp.json`.

## Hard rules
1. **Preserve the look.** The Linear dark aesthetic is liked and stays. Implement it as the
   `swayzio` daisyUI theme in `globals.css` (OKLCH tokens). **No hand-maintained `tailwind.config`
   theme object** — that burden is exactly what we're removing.
2. **Don't break the Stripe logic.** `stripe-service.ts` is battle-tested: MRR is USD-only, churn is
   events-based, revenue history is **decoupled** from core stats so the slow charge pagination never
   blocks subscription metrics. Port it verbatim; if you must change it, verify the numbers still
   match (MRR, active subs, churn %, total revenue) before/after.
3. **Cache-first, never block the request path.** All integrations go through the stale-while-
   revalidate cache manager. User-facing routes return cached data instantly; refreshes are
   background (Vercel Cron). Never call a third-party API synchronously in a page/handler the user
   waits on.
4. **Charts = ApexCharts via the skill.** To add/edit a chart, read `skills/daisyui-charts/SKILL.md`,
   follow its mandatory selection workflow, pick a variant, and emit the React version. Wrap in the
   `ssr:false` dynamic import + `ChartWrapper`. Use `var(--color-*)` so charts re-theme. **Do not
   reintroduce Recharts.**
5. **Auth is the boundary, not decoration.** Clerk middleware guards `(dashboard)` + `/api/*`
   (except webhooks + Clerk routes). Founders allowlist + `publicMetadata.role === "founder"`. Never
   rely on a client-side route guard as the security boundary.
6. **Env prefixes:** client-exposed vars use `NEXT_PUBLIC_` (not `VITE_`). See ARCHITECTURE §11.
7. **De-Replit anything you touch.** HubSpot auth currently uses Replit connectors
   (`REPLIT_CONNECTORS_HOSTNAME`/`REPL_IDENTITY`) — replace with `HUBSPOT_ACCESS_TOKEN` (private-app
   token). Strip other Replit-only assumptions as you port code.

## Conventions
- **Business logic is framework-agnostic.** Integration services live in `src/server/integrations/`
  and know nothing about HTTP. Route Handlers are thin: validate (Zod) → call service via cache →
  return JSON.
- **URL is the contract.** Filters/timeframe/page live in Zod-validated search params, not ad-hoc
  local state.
- **XState only where it earns it** (sync status, multi-tab dashboards, checkout). Don't machine-ify
  simple pages.
- **Match the surrounding code.** Mirror existing naming, structure, and comment density.

## Commands
- `npm run dev` — Next.js (Turbopack) on :3000 (also boots the eve dev server via `withEve`)
- `npm run build` / `npm run start` — production build / serve
- `npm run check` — tsc · `npm run lint` — next lint
- `npm run design:lint|build|check` — DESIGN.md theme pipeline
- `npm run agent:info|dev|build` — eve CLI (run from the **repo root**; the CLI resolves the agent
  from CWD and requires the `agent/` layout)
- `npm run os:migrate|sync|verify|embed` — Swayzio OS migrations / ELT / verification / embeddings
- Dev/data utilities in `scripts/` (run with `npx tsx scripts/<name>.ts`): cache warmers + probes.

## Data reality (live vs mock)
Live (real API → cache): **Stripe, HubSpot, Kit, Mercury.** Mock (in-memory `MemStorage` sample
data, to be replaced): **customers list/detail, socials, SEO, GitHub, Vercel.** When a page shows
suspiciously round/static numbers, check whether it's still on mock data.

## Don't
- Don't migrate to Cloudflare/D1, SolidJS, or Rspack (see DECISIONS.md — these were considered and rejected).
- Don't add a second hosting platform; everything targets Vercel.
- Don't call Stripe/HubSpot/etc. directly from components — go through the service + cache layer.
- Don't commit secrets; all credentials are env vars.
