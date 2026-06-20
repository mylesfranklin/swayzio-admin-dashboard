# Swayzio Admin Dashboard — Architecture Specification

> **Status:** Target architecture (v1). Adopted 2026-06-20.
> **One-line:** The internal brain and analytics engine for Swayzio — a fast, founders-only
> dashboard that unifies Stripe, HubSpot, Kit, Mercury, and social data, with a built-in AI agent.

---

## 1. Guiding principles

1. **Fast is a feature.** This is a tool the founders live in. No loading flicker, no layout
   thrash, sub-second navigation. Cached data renders instantly; refreshes happen in the background.
2. **The look is already right.** We are migrating the *implementation*, not the design. The
   Linear-inspired dark aesthetic (near-black surfaces, purple accent, tight spacing) is preserved
   exactly — re-expressed as a daisyUI theme instead of hand-maintained Tailwind tokens.
3. **One platform.** Everything runs on Vercel: frontend, API, cron, and the agent. No split infra.
4. **Business logic is portable; shells are disposable.** The expensive, battle-tested code (Stripe
   accuracy logic, integration services, cache manager, schema) is plain TypeScript and survives the
   migration. Framework glue (routing, bundler, HTTP wrappers) is replaceable.
5. **Cache-first, never block.** Every integration is fronted by a stale-while-revalidate cache.
   The UI is never blocked on a live third-party API call.
6. **Founders only.** Hard auth boundary at the edge via Clerk. There is no public surface.

---

## 2. The stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Next.js 16** (App Router) | First-party Vercel framework; required for Turbopack; native streaming/RSC for the agent chat. |
| **Bundler** | **Turbopack** | Production-stable in Next 16; no standalone package exists, so it ships with Next. Sub-second HMR. |
| **UI runtime** | **React 19** | Matches the charts pack; Server Components reduce client JS. |
| **Styling** | **Tailwind CSS 4 + daisyUI 5** | CSS-first config (`@plugin "daisyui"`) — zero JS theme file to maintain. OKLCH tokens. |
| **Charts** | **ApexCharts** via `react-apexcharts` + the **daisyUI-charts skill** | The pack we own; ~54 pre-built variants styled with daisyUI tokens. Replaces Recharts. |
| **Server state** | **TanStack Query** | Already in use; suspense-mode integrates with React 19 `<Suspense>`. |
| **Routing/URL state** | Next App Router + **Zod-validated search params** | URL is the contract for filters/timeframe/page. |
| **Complex UI state** | **XState** (selectively) | Only on genuinely stateful surfaces (sync, multi-tab dashboards, checkout). Not everywhere. |
| **Auth** | **Clerk** (official Next SDK) | Edge middleware guard; founders-only allowlist. |
| **Database** | **Neon Postgres + Drizzle ORM** | Keep. Native Vercel integration. No D1 migration. |
| **Background jobs** | **Vercel Cron + Fluid Compute** | Replaces the in-process 6h timer; Fluid handles the longer Stripe jobs. |
| **AI agent** | **eve.dev** (Vercel, public beta) | Durable, filesystem-first TS agent; web channel embedded in the dashboard. |
| **Hosting** | **Vercel** | One deploy for everything. |

### What we are NOT doing (and why)
- **SolidJS** — beta core; would force rewriting every component for a tool that has no rendering
  bottleneck. Our bottleneck is third-party API latency (seconds), not VDOM diffing.
- **Cloudflare / D1 / Workers / Hyperdrive** — we chose Vercel. Keep Neon.
- **Rspack** — Turbopack is the Vercel-native bundler and ships with Next.
- **Clerk's Solid SDK** — community port; we use the official React/Next SDK.

---

## 3. System overview

```
                         ┌─────────────────────────────────────────────┐
                         │                  VERCEL                       │
                         │                                               │
   Founder ──HTTPS──►  Clerk Middleware (edge)  ──►  Next.js 16 App      │
                         │   (founders allowlist)        │ App Router    │
                         │                               │               │
                         │   ┌───────────────────────────┼────────────┐ │
                         │   │ Route Handlers / Server Actions (Node)  │ │
                         │   │   /api/dashboard  /api/stripe  ...       │ │
                         │   │   /api/cron/refresh  (Vercel Cron)       │ │
                         │   │   /api/webhooks/stripe (raw body)        │ │
                         │   │   /api/agent/*  (eve.dev web channel)    │ │
                         │   └───────────┬───────────────┬─────────────┘ │
                         │               │               │               │
                         │     ┌─────────▼────────┐  ┌───▼────────────┐  │
                         │     │  Service layer    │  │  eve.dev agent │  │
                         │     │  (integrations)   │  │  (tools→data)  │  │
                         │     └─────────┬────────┘  └────────────────┘  │
                         │               │                               │
                         │     ┌─────────▼─────────────────────────┐    │
                         │     │  Cache manager (SWR, two-tier)      │    │
                         │     └─────────┬──────────────┬──────────┘    │
                         └───────────────┼──────────────┼───────────────┘
                                         │              │
                              ┌──────────▼───┐   ┌──────▼───────────────┐
                              │ Neon Postgres │   │ Stripe / HubSpot /   │
                              │ (Drizzle)     │   │ Kit / Mercury APIs   │
                              │ cache + data  │   └──────────────────────┘
                              └───────────────┘
```

---

## 4. Target directory structure

```
swayzio-admin-dashboard/
├── CLAUDE.md                      # instructions for AI coding sessions
├── docs/
│   ├── ARCHITECTURE.md            # this file
│   ├── MIGRATION.md               # phased Replit→Next.js plan
│   └── DECISIONS.md               # ADR-style decision log
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # root: <ClerkProvider>, <html data-theme="swayzio">
│   │   ├── globals.css            # @import "tailwindcss"; @plugin "daisyui" { swayzio theme }
│   │   ├── (auth)/sign-in/        # public Clerk routes
│   │   ├── (dashboard)/           # Clerk-protected group
│   │   │   ├── layout.tsx         # sidebar + header shell
│   │   │   ├── page.tsx           # main dashboard
│   │   │   ├── stripe/            ├ hubspot/  ├ customers/[id]/
│   │   │   ├── mercury/  seo/  socials/[platform]/  settings/
│   │   └── api/                   # Route Handlers (Node runtime)
│   │       ├── dashboard/route.ts
│   │       ├── stripe/[...]/route.ts   (hubspot, kit, mercury, customers, social)
│   │       ├── cron/refresh/route.ts   # Vercel Cron target (secured)
│   │       ├── webhooks/stripe/route.ts# raw body for signature verify
│   │       └── agent/[...]/route.ts    # eve.dev web channel (later phase)
│   ├── components/
│   │   ├── ui/                    # daisyUI-based primitives (Button, Card, Tabs, Table…)
│   │   ├── charts/                # Chart.tsx (dynamic ssr:false), ChartWrapper, presets
│   │   ├── layout/                # Sidebar, Header, MobileNav
│   │   └── dashboard/             # KpiCard, RevenueChart, RecentActivity…
│   ├── server/                    # framework-agnostic business logic (PORTED, not rewritten)
│   │   ├── integrations/
│   │   │   ├── stripe/            # stripe-service.ts (the mature one)
│   │   │   ├── hubspot/           # de-Replit'd auth → private-app token
│   │   │   ├── kit/  mercury/
│   │   ├── cache/cache-manager.ts
│   │   └── db/index.ts            # drizzle client (Neon)
│   ├── lib/                       # queryClient, fetchers, utils, search-param schemas (Zod)
│   ├── machines/                  # XState machines (selective)
│   └── agent/                     # eve.dev agent (instructions.md, agent.ts, tools/, skills/)
├── shared/schema.ts               # Drizzle schema + Zod types (shared client/server)
├── skills/daisyui-charts/         # vendored charts skill (read by AI to generate charts)
├── drizzle.config.ts
├── next.config.ts                 # Turbopack, maxDuration, raw-body for webhooks
├── postcss.config.mjs             # @tailwindcss/postcss
├── middleware.ts                  # Clerk auth guard (founders allowlist)
└── vercel.json                    # cron schedules
```

---

## 5. Data & caching architecture

Unchanged in concept — this is the part we keep. **Two-tier, stale-while-revalidate.**

- **Source of truth:** Neon Postgres via Drizzle. Tables in `shared/schema.ts`.
- **Cache tables:** `integration_cache` (cached payloads), `integration_sync_state` (cursors).
- **Cache manager:** in-memory L1 + Postgres L2. `getOrFetch(integration, key, fetcher, ttl)`.
- **TTLs:** 15 min (Stripe/HubSpot/Mercury), 30 min (Kit). Stale 5 min before expiry; stale served
  immediately while a background refresh runs.
- **Revenue is decoupled** from core stats (its own `stripe:revenue` cache key) so the slow 12-month
  charge pagination never blocks subscription metrics. **Preserve this — it was hard-won.**

### Live vs. mock (the current reality — see MIGRATION.md for the plan to fix)
| Real (live API → cache) | Mock (in-memory sample data) |
|---|---|
| Stripe, HubSpot, Kit, Mercury | Customers list/detail, socials, SEO, GitHub, Vercel |

The mock `MemStorage` is replaced during migration by real Drizzle-backed queries (or real APIs
where they exist).

---

## 6. Integration / service layer

Each integration is a self-contained module under `src/server/integrations/<name>/` exposing typed
methods that return normalized shapes. Route Handlers are thin: validate → call service via cache →
return JSON. The services know nothing about HTTP.

- **Stripe** — the crown jewel. MRR (USD-only), active subs, events-based churn, decoupled revenue
  history, concurrency-bounded pagination with SDK retries. Ports verbatim.
- **HubSpot** — **must be de-Replit'd.** Current auth uses `REPLIT_CONNECTORS_HOSTNAME`/`REPL_IDENTITY`,
  which only works on Replit. Replace with a HubSpot **private-app token** (`HUBSPOT_ACCESS_TOKEN`).
- **Kit / Mercury** — already env-var based; port as-is.

---

## 7. UI & design system

### Theme: `swayzio`
The Linear dark look becomes a **custom daisyUI theme** defined in `globals.css` (Tailwind 4
CSS-first). No `tailwind.config.ts` theme object to maintain. OKLCH tokens map our palette:
near-black `base-100/200/300`, purple `primary`, semantic `success/warning/error/info`.

```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "daisyui/theme" {
  name: "swayzio";
  default: true;
  color-scheme: dark;
  --color-base-100: oklch(/* near-black surface */);
  --color-primary:  oklch(/* Swayzio purple */);
  /* …full token set derived from the current theme… */
}
```

### Components
- **daisyUI primitives** for buttons, cards, tabs, tables, badges, inputs, etc. Replaces shadcn.
- **Radix** retained only where daisyUI lacks an accessible primitive (complex popovers/command
  menu). They coexist; not a hard rule to purge Radix.
- **Charts** — ApexCharts. Because ApexCharts touches `window`, the chart component is a Client
  Component dynamically imported with `ssr: false`:

```tsx
// src/components/charts/Chart.tsx
"use client";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
// wrap in ChartWrapper (daisyUI token classes for tooltips/grid) from the skill
```

Chart configs are generated/edited via the **daisyui-charts skill** (`skills/daisyui-charts/`),
which an AI session reads to pick and emit a variant. Colors use `var(--color-*)` so charts
re-theme automatically.

---

## 8. Auth (Clerk, founders-only)

- `middleware.ts` runs at the edge, protects the `(dashboard)` route group and all `/api/*` except
  public webhooks and the Clerk routes.
- **Founders-only enforcement:** restrict via Clerk allowlist (specific emails) **and** a
  middleware check on `publicMetadata.role === "founder"` (defense in depth). New sign-ups are off.
- **The route group guard is the UX layer; the real boundary is middleware + per-handler checks.**
  Never trust client-side route guards as the security boundary.
- Webhooks (`/api/webhooks/stripe`) are explicitly public but verified by Stripe signature.

---

## 9. Background jobs & long-running work on Vercel

The current app relied on a long-lived Node process (6h interval timer, multi-minute Stripe jobs).
Serverless changes this:

- **Scheduled refresh:** `vercel.json` cron hits `/api/cron/refresh` (e.g. every 6h). The handler is
  secured by a `CRON_SECRET` bearer check and warms the caches.
- **Long Stripe jobs:** run on **Fluid Compute** with an elevated `maxDuration`. The overhaul
  already brought core stats to <20s and revenue history to <75s, which fits Fluid limits. If any job
  ever exceeds limits, escalate to a Vercel **Queue** / background function — do not block a request.
- **No job runs in the request path** of a user-facing route. Users always get cached data.

---

## 10. AI agent layer (eve.dev) — later phase

Goal: founders ask the dashboard questions in natural language ("what's MRR trend vs last quarter,
and which churned accounts were highest-value?") and get answers grounded in our real data.

- **Framework:** eve.dev — filesystem-first durable agent under `src/agent/` (`instructions.md`,
  `agent.ts`, `tools/`, `skills/`, `channels/`). Built on the Workflow SDK (crash-safe, resumable).
- **Tools = our service layer.** The agent's tools are thin wrappers over the *same* cached
  integration services the dashboard uses (read-only): `getStripeMetrics`, `getChurnCohort`,
  `getHubspotCatalog`, etc. The agent reads from cache/DB, never hammers third-party APIs directly.
- **Channel:** a web channel embedded as a panel/route in the dashboard; auth piggybacks on Clerk.
- **MCP:** eve can connect MCP servers for extra capabilities later.
- **Boundary:** the agent is read-only over business data in v1. Any write/action (e.g. trigger a
  sync) is an explicit, separately-authorized tool.

---

## 11. Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe (note: `NEXT_PUBLIC_` prefix replaces `VITE_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `HUBSPOT_ACCESS_TOKEN` | **New** — HubSpot private-app token (replaces Replit connector) |
| `KIT_API_KEY`, `MERCURY_API_KEY` | Kit / Mercury |
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CRON_SECRET` | Secures the Vercel Cron refresh endpoint |
| `ANTHROPIC_API_KEY` (or provider) | eve.dev agent model — later phase |

All env prefixes change `VITE_` → `NEXT_PUBLIC_` for client-exposed values.

---

## 12. Performance budget

- **TTFB / navigation:** instant from cache; never block on third-party APIs.
- **First load JS:** keep charts behind dynamic import; lean on RSC for static shell.
- **HMR:** sub-second via Turbopack.
- **No layout shift:** `<Suspense>` boundaries with skeletons sized to final content; placeholder
  caches in TanStack Query to avoid screen-clearing on param changes.

---

## 13. Open questions / future
- Real data for socials/SEO/GitHub/Vercel (currently mock) — connect real APIs or persist to Drizzle.
- Whether to adopt TanStack Router inside Next (likely unnecessary — App Router covers routing).
- Agent write-actions and approval UX.
- Multi-founder roles / audit log if the team grows beyond founders.
```
