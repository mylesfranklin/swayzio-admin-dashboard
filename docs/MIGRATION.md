# Migration Plan — Replit/Vite/Express → Next.js 16 on Vercel

> **Strategy:** Migrate **in-place** in this repo (git history preserved). Pivot the shell to
> Next.js early so the daisyUI/UI work is done **once**, then port pages and services into it.
> The app stays runnable throughout — we don't break it for a week.

**Decisions locked (2026-06-20):** Go Next.js now · migrate in-place · port backend to Next Route
Handlers + Vercel Cron. See `DECISIONS.md`.

---

## Phase 0 — Foundation & cleanup  ✅ done
- [x] Architecture spec, CLAUDE.md, decision log written.
- [x] Repo cleanup: removed Replit cruft, folded `replit.md` into docs, archived `attached_assets`
      reference docs into `docs/reference/`, updated `.gitignore` (+ `.env` now ignored, `.env.example` added).
- [x] Vendored the `daisyui-charts` skill into `skills/`.
- [ ] Inventory the live-vs-mock data per page (punch list for Phase 4).  ← still TODO

## Phase 1 — Next.js shell + theme (the UI win)  ◄ in progress
- [x] Scaffolded Next.js 16 (App Router, Turbopack, React 19, TS) **in this repo**; legacy
      `client/`+`server/` left in place (excluded from build) for porting reference.
- [x] Tailwind 4 + daisyUI 5 via `globals.css` (CSS-first, no JS theme config). Legacy
      `tailwind.config.ts`/`theme.json`/`postcss.config.js` removed (superseded).
- [x] Authored the **`swayzio` daisyUI theme** — exact Linear dark surfaces + **orange** accent
      (`#f97316`, was purple `#5e6ad2`), 13px type scale, ported glow/animation utilities.
- [x] Built the app shell: root layout (Inter), sidebar (collapsible sections), header
      (breadcrumbs/quick-actions), mobile nav — matched to current UI.
- [x] Converted the **Dashboard** page end-to-end: KPI cards, ApexCharts dual-axis MRR/subscriber
      chart, newsletter analytics, tabs. Builds clean; dev server returns 200 with correct content.
- [ ] **Eyeball check with Myles: confirm the look is preserved** before mass-porting other pages.
- [ ] (Deferred to Phase 3) wire real cached data — currently uses `src/lib/fixtures/dashboard.ts`.

## Phase 2 — Auth (Clerk, founders-only)
- [ ] Add Clerk (`@clerk/nextjs`), `<ClerkProvider>` in root layout.
- [ ] `middleware.ts` guards `(dashboard)` + `/api/*` (except webhooks/clerk routes).
- [ ] Founders allowlist + `publicMetadata.role === "founder"` check. Disable open sign-up.
- [ ] Sign-in route under `(auth)/`.

## Phase 3 — Port the backend (services → Route Handlers)
- [ ] Move `server/` services into `src/server/integrations/*` (plain TS, minimal changes).
- [ ] **De-Replit HubSpot auth:** swap Replit connector → `HUBSPOT_ACCESS_TOKEN` private-app token.
- [ ] Re-expose each endpoint as a Next Route Handler (Node runtime). Keep responses identical.
- [ ] Port `cache-manager` + Drizzle client; point at Neon.
- [ ] Webhooks: `/api/webhooks/stripe` with raw-body signature verification.
- [ ] Replace the in-process 6h timer with **Vercel Cron** → `/api/cron/refresh` (CRON_SECRET).
- [ ] Set `maxDuration` (Fluid Compute) for the Stripe revenue handler.

## Phase 4 — Port remaining pages + kill mocks
- [ ] Port all pages: Stripe, HubSpot, Customers (+detail), Mercury, SEO, Socials, Settings, Sync.
- [ ] Replace `MemStorage` mock data with real Drizzle queries / real APIs per the Phase 0 punch list.
- [ ] Add XState only where state is genuinely complex (sync status, multi-tab, checkout).
- [ ] Zod-validated search params for filters/timeframe/page.

## Phase 5 — Cut over & deploy
- [ ] Delete the legacy Vite client + Express server once parity is reached.
- [ ] Wire Vercel project: Neon integration, all env vars (`VITE_`→`NEXT_PUBLIC_`), cron schedules.
- [ ] Production deploy. Verify Stripe numbers match the legacy app (MRR, active, churn, revenue).

## Phase 6 — AI agent (eve.dev)
- [ ] Scaffold eve agent in `src/agent/`; tools wrap the read-only cached services.
- [ ] Embed web channel as a dashboard panel; auth via Clerk.
- [ ] Iterate on instructions/skills; add MCP connections as needed.

---

## Risk register
| Risk | Mitigation |
|---|---|
| Long Stripe job exceeds serverless limit | Already <75s; Fluid `maxDuration`; escalate to Queue if needed. |
| HubSpot auth breaks off-Replit | Phase 3 swaps to private-app token (blocker until done). |
| UI drift from current look | Phase 1 converts one page first as a pixel-match gate before mass porting. |
| eve.dev is beta | Agent is a later, isolated phase; dashboard ships without it. |
| Doing UI work twice | Avoided by pivoting to Next.js shell *before* daisyUI conversion. |
