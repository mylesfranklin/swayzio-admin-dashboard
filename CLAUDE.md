# CLAUDE.md — Swayzio Admin Dashboard

The internal **brain and analytics engine** for Swayzio. Founders-only dashboard unifying Stripe,
HubSpot, Kit, Mercury, and social data, with a built-in AI agent. Fast, beautiful, Vercel-native.

**Read these first:** `docs/ARCHITECTURE.md` (the spec), `docs/MIGRATION.md` (where we are),
`docs/DECISIONS.md` (why things are the way they are).

---

## Current state (2026-06)
Mid-migration from the Replit export (React/Vite/Wouter + Express) to the target stack. The legacy
app under `client/` + `server/` still runs (`npm run dev`, port 5000). New work happens in the
Next.js structure as it comes online. Do not delete legacy code until the migration plan says so
(Phase 5).

## Target stack
Next.js 16 (App Router, **Turbopack**) · React 19 · Tailwind CSS 4 + **daisyUI 5** (CSS-first config)
· **ApexCharts** (via the `daisyui-charts` skill) · TanStack Query · Clerk (founders-only) · Drizzle
+ **Neon** Postgres · **Vercel** (hosting + Cron + Fluid Compute) · **eve.dev** agent (later phase).

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

## Commands (legacy, until Next is primary)
- `npm run dev` — legacy Vite+Express on :5000
- `npm run check` — tsc
- `npm run db:push` — Drizzle push to Neon
(Next.js scripts will be added in Phase 1.)

## Data reality (live vs mock)
Live (real API → cache): **Stripe, HubSpot, Kit, Mercury.** Mock (in-memory `MemStorage` sample
data, to be replaced): **customers list/detail, socials, SEO, GitHub, Vercel.** When a page shows
suspiciously round/static numbers, check whether it's still on mock data.

## Don't
- Don't migrate to Cloudflare/D1, SolidJS, or Rspack (see DECISIONS.md — these were considered and rejected).
- Don't add a second hosting platform; everything targets Vercel.
- Don't call Stripe/HubSpot/etc. directly from components — go through the service + cache layer.
- Don't commit secrets; all credentials are env vars.
