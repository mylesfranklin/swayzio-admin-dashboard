# Decision Log (ADR-style)

Short, dated records of architectural decisions and *why*. Newest first.

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
ApexCharts + Clerk + Drizzle/Neon + eve.dev, all on Vercel.**
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

## 2026-06-20 — Keep Neon + Drizzle (no D1)
**Decision:** Stay on Neon Postgres with Drizzle.
**Why:** Already built and accurate; native Vercel integration; D1 buys nothing for this workload.
