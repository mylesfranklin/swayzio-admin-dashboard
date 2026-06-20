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

## Phase 2 — Auth (Clerk, founders-only)  ✅ code done (needs Clerk keys to go live)
- [x] Added Clerk (`@clerk/nextjs` 7.5.7 + `@clerk/themes`), `<ClerkProvider>` (dark theme,
      brand `#3b5bdb`) wrapped in root layout — only when keys present.
- [x] `src/proxy.ts` (Next 16's renamed middleware) guards everything except `/sign-in` +
      `/api/webhooks`. **Fails closed in production** without keys; open in keyless local dev.
- [x] Founder gate in `(dashboard)/layout.tsx` via `currentUser()` → `isFounder(email, role)`:
      `FOUNDER_EMAILS` allowlist OR `publicMetadata.role === "founder"`; else → `/not-authorized`.
- [x] `(auth)/sign-in/[[...sign-in]]` route + `/not-authorized` page; sidebar user wired to
      Clerk `<UserButton>`/`useUser` (static "Dev Mode" fallback when keyless).
- [x] `src/lib/auth.ts` centralizes config flags + the fail-closed assertion.
- [ ] **Manual (Myles):** create Clerk app, add keys + `FOUNDER_EMAILS` to `.env` and Vercel,
      set sign-up to "restricted"/off in Clerk dashboard. Then auth activates automatically.

## Phase 3 — Backend + first real screen (Stripe)  ◄ Stripe done
- [x] Neon-direct data layer: `src/server/db` (neon driver) + `src/server/cache.ts`
      (two-tier SWR cache, `integration_cache` table created in Neon). No Drizzle.
- [x] **Rebuilt Stripe service** `src/server/integrations/stripe.ts` for accuracy —
      reads item-level period (API clover moved it), real collected revenue, collection
      rate, past_due at-risk, churn. Verified against live data (see DECISIONS / memory).
- [x] Route handlers: `/api/stripe/metrics` + `/api/cron/refresh` (CRON_SECRET, `maxDuration`).
- [x] Dashboard + `/analytics/stripe` wired to REAL Stripe data; daisyUI ApexCharts
      (collected-revenue area, status donut, collection radial), top-subs table.
- [x] `vercel.json` cron (every 6h) to keep caches warm.
- [ ] **De-Replit HubSpot auth** (Replit connector → `HUBSPOT_ACCESS_TOKEN`) — next.
- [ ] Port Kit + Mercury; replace remaining fixtures (newsletter still sample data).
- [ ] Stripe webhook `/api/webhooks/stripe` (raw-body verify) — when we add write paths.

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
