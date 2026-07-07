# AGENTS.md — Swayzio Admin Dashboard

Guidance for any AI agent working in this repo (Claude Code, the **eve** agent that now lives at
`agent/`, etc.). Claude Code users: `CLAUDE.md` is the primary file; this one is the
cross-agent + design-system entry point.

## The product
Internal founders-only "brain" dashboard unifying Stripe, HubSpot, Kit, Mercury and
social data. Stack: **Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 +
daisyUI 5 · Clerk (founders-only) · Neon Postgres (serverless driver, no ORM) ·
Vercel**. Architecture: `docs/ARCHITECTURE.md`. Status/roadmap: `docs/MIGRATION.md`.
Decisions: `docs/DECISIONS.md`.

## Visual identity — READ BEFORE BUILDING ANY UI
The brand/visual system is a single source of truth:

- **`design/swayzio.DESIGN.md`** — the design tokens (colors, type, radii) **and** the
  prose rationale (Overview, Colors, Typography, Layout, Elevation, Shapes,
  Components, Do's & Don'ts). This is normative. Read it before generating UI.
- **`design/spec.md`** — the DESIGN.md *format* spec (so you can parse/extend it).
- **`docs/DESIGN-SYSTEM.md`** — how tokens become CSS (the generation pipeline).

**Rules for on-brand UI:**
1. Use the token utilities, never hardcoded hex: surfaces `bg-base-100/200/300`,
   text `text-base-content` / `text-ink-muted` / `text-ink-faint`, accent
   `text-primary`/`bg-primary` (+ `bg-brand-hover` on hover), borders `border-line`,
   sidebar `bg-sidebar`. Charts re-theme via `var(--color-*)` (only the 2 chart
   series colors may be literal).
2. Reuse the component vocabulary in **`src/components/ui/`** (`Button`, `Badge`,
   `Card`) — they map to the `components` tokens in DESIGN.md.
3. The accent (deep blue) is for **interaction & brand only** — never decoration.
   Define surfaces with the base ladder + hairline borders, not drop-shadows.
4. Maintain **WCAG AA** contrast. After editing tokens run `npm run design:lint`
   (0 errors required); `npm run design:build` regenerates `src/app/theme.generated.css`.

## To change the look
Edit `design/swayzio.DESIGN.md` → `npm run design:build` → the whole UI updates.
Never hand-edit `src/app/theme.generated.css` (it's generated) or scatter raw colors.

## Guardrails
- Founders-only auth (Clerk) is the boundary — see `CLAUDE.md`.
- All integrations go through the stale-while-revalidate cache; never call a
  third-party API synchronously in a user-facing request.
- Secrets live only in `.env.local`. Never commit them.
