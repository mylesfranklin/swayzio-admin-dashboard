---
version: alpha
name: Swayzio
description: Internal admin "brain" dashboard — Linear-inspired near-black UI with a single deep-blue accent.
colors:
  # ── daisyUI-owned (routed into @plugin "daisyui/theme" by scripts/build-theme.ts) ──
  base-100: "#101012"        # app background
  base-200: "#17181a"        # cards
  base-300: "#1e2024"        # hover / raised
  base-content: "#ffffff"    # primary text
  primary: "#3b5bdb"         # deep-blue accent
  primary-content: "#ffffff"
  accent: "#3b5bdb"
  accent-content: "#ffffff"
  secondary: "#1e2024"
  secondary-content: "#ffffff"
  neutral: "#17181a"
  neutral-content: "#ffffff"
  info: "#2f80ed"
  info-content: "#ffffff"
  success: "#59a200"
  success-content: "#ffffff"
  warning: "#f2c94c"
  warning-content: "#101012"
  error: "#eb5757"
  error-content: "#ffffff"
  # ── custom (routed into @theme: bg-sidebar, border-line, text-ink-muted, …) ──
  sidebar: "#090909"
  line: "#23252a"
  ink: "#ffffff"
  ink-muted: "#6b6f76"
  ink-faint: "#545760"
  brand: "#3b5bdb"
  brand-hover: "#3450cf"     # deepen-on-hover — keeps white text at WCAG AA
typography:
  # token names match Tailwind's text-* scale → export lands drop-in (text-xs … text-3xl)
  xs:   { fontFamily: Inter, fontSize: 0.6875rem, lineHeight: 1.4 }
  sm:   { fontFamily: Inter, fontSize: 0.75rem,   lineHeight: 1.4 }
  base: { fontFamily: Inter, fontSize: 0.8125rem, lineHeight: 1.4 }
  md:   { fontFamily: Inter, fontSize: 0.875rem,  lineHeight: 1.4 }
  lg:   { fontFamily: Inter, fontSize: 1rem,      lineHeight: 1.2 }
  xl:   { fontFamily: Inter, fontSize: 1.125rem,  lineHeight: 1.2 }
  2xl:  { fontFamily: Inter, fontSize: 1.25rem,   lineHeight: 1.2 }
  3xl:  { fontFamily: Inter, fontSize: 1.5rem,    lineHeight: 1.2 }
rounded:
  selector: 0.25rem
  field: 0.25rem
  box: 0.375rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    rounded: "{rounded.field}"
    padding: 0.5rem
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.primary-content}"
  button-ghost:
    backgroundColor: "{colors.base-300}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
  card:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.box}"
  kpi-card:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.box}"
    padding: 1.25rem
  input:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.base-100}"      # dark text on mid-green for AA
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning-content}"
  badge-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.base-100}"      # dark text on coral-red for AA
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.base-100}"      # dark text on bright blue for AA (badges are uniformly dark-on-color)
  table-row-hover:
    backgroundColor: "{colors.base-300}"
    textColor: "{colors.base-content}"
  nav-item:
    textColor: "{colors.ink-muted}"
  nav-item-active:
    backgroundColor: "{colors.base-300}"
    textColor: "{colors.base-content}"
---

# Swayzio Design System

> **This document is the single source of truth.** The YAML front matter above is machine-parsed by
> `scripts/build-theme.ts` into `src/app/theme.generated.css`; the prose below specifies everything the
> tokens can't (spacing, density, motion, charts, component recipes, and the judgment calls that make
> the UI feel good). An agent should be able to read this file and reproduce the system pixel-for-pixel.
> The token pipeline is detailed under **Implementation** at the end.

## Overview

Swayzio's internal "brain" — the analytics surface the founders live in. The mood is **Linear-inspired**:
a calm, dense, near-black workspace where data is the hero and chrome recedes. Premium and engineered,
never flashy. A single deep-blue accent carries all interaction and brand emphasis; everything else is a
quiet ladder of dark neutrals.

**The one-line feel:** dense, calm, precise — generous data, tight chrome.

## Design principles (why it feels good)

1. **Lead with borders, not shadows.** Surfaces are separated by 1px hairlines (`line #23252a`) and the
   surface ladder — not drop-shadows. This is the biggest single reason it reads "engineered." Shadows are
   reserved for floating/transient UI only.
2. **One accent, reserved for meaning.** Deep blue (`#3b5bdb`) appears *only* on interaction and brand
   (primary buttons, active nav, focus, the lead chart series). Never decorative. Everything else is neutral.
3. **Density by a single knob.** The whole rem-based UI renders at **90% of browser default**
   (`html { font-size: 90% }`) — the density that previously required zooming the browser to 90%. One root
   value, not per-component tuning.
4. **Tight, quiet typography.** Inter throughout, ~13px body, tight leading, uppercase micro-labels. Text
   lives on a three-step ink ladder so hierarchy is legible without weight noise.
5. **Restrained geometry.** Small radii (4px controls / 6px cards), hairline borders, a flat plane. Pills
   (`9999px`) only for status dots, avatars, and chips.
6. **Motion that confirms, never decorates.** Content rises in with a subtle staggered `fadeInUp`;
   interactive surfaces lift a hair on hover. Durations are short (200–300ms, `ease-out`).
7. **Charts re-theme themselves.** Every chart pulls `var(--color-*)`, so a token change reflows the whole
   visual language. Hardcoded hex is forbidden except the documented chart palette.

## Color system

A near-black surface ladder with one accent.

**Surface ladder (depth by elevation, lightest = most raised):**
- `base-100 #101012` — app background, the deepest working surface.
- `base-200 #17181a` — cards & panels (one step up).
- `base-300 #1e2024` — hover / raised states, inset tiles, neutral chips.
- `sidebar #090909` — the nav rail, intentionally *darker* than the app (anchors the left edge).

**Ink ladder (text):** `base-content/ink #ffffff` (primary) → `ink-muted #6b6f76` (secondary/labels) →
`ink-faint #545760` (tertiary/captions/disabled). Never use opacity to fake a third grey — use the ladder.

**Accent:** `primary / brand / accent #3b5bdb`. Hover deepens to `brand-hover #3450cf` (chosen to keep white
text at WCAG AA). Interaction + brand only.

**Hairline:** `line #23252a` — the border on essentially every surface; also used at `/60` opacity for table
row dividers and `/40` for chip borders.

**Semantic:** `info #2f80ed` · `success #59a200` · `warning #f2c94c` (dark text) · `error #eb5757`. Badges are
**uniformly dark-on-color** (`text-base-100`) for AA — verified by `design:lint`.

## Typography

**Inter** everywhere (`--font-sans` adds SF Pro Display / system fallbacks; `--font-mono` = Berkeley Mono).
Global feature settings `"cv02","cv03","cv04","cv11"` + antialiasing are applied on `body`, not per-token.

Scale (token = Tailwind `text-*`, sizes are at the 90% root so multiply by 0.9 for px):

| Token | rem | ~px | line-height | Use |
|---|---|---|---|---|
| `xs` | 0.6875 | 11 | 1.4 | micro-labels (KPI titles, table headers, captions) |
| `sm` | 0.75 | 12 | 1.4 | labels, secondary text, pills |
| `base` | 0.8125 | 13 | 1.4 | body |
| `md` | 0.875 | 14 | 1.4 | emphasized body |
| `lg` | 1.0 | 16 | 1.2 | card titles |
| `xl`–`2xl` | 1.125–1.25 | 18–20 | 1.2 | section heads |
| `3xl` | 1.5 | 24 | 1.2 | page titles & hero numbers |

Conventions: **micro-labels** are `text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint`
(KPI titles, table `<th>`). **Hero numbers** are `text-[1.75rem] font-bold leading-none tracking-tight`
(KPI values) or `text-3xl font-bold tracking-tight` (page/section headline figures). Headings use leading 1.2,
body/labels 1.4. `tabular-nums` on all numeric table cells.

## Spacing & density

**Density root:** `html { font-size: 90% }`. This is the master density control — do not fight it with
per-component overrides. All spacing uses Tailwind's 4px rem grid (`gap-4` = 1rem = 0.9rem effective, etc.).

**Canonical spacing (memorize these — they create the rhythm):**
- **Page section rhythm:** `space-y-6` between major sections (the dominant vertical beat).
- **Card padding:** `p-5` (1.25rem) for content cards; tables use a `p-4` header + `px-4 py-2` cells.
- **KPI grid:** `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4` (or `-5/-6` when more tiles); KPI gaps
  are `gap-4`, chart/content rows are `gap-6`.
- **Chart rows:** `grid gap-6 lg:grid-cols-2` (two-up) or `lg:grid-cols-3` (three-up); a wide chart spans
  `lg:col-span-2`.
- **Table cells:** `px-4 py-2`; header row `px-4 py-2`; row dividers `border-t border-line/60`.
- **Pills / chips:** `px-2.5 py-1` with `gap-1.5` and a `size-2` dot.
- **Segmented controls:** outer `p-0.5`, buttons `px-2.5 py-1`.
- **Icon tiles (KPI):** `h-10 w-10 rounded-xl`; inline icons `h-3.5 w-3.5` (chips) to `h-4 w-4` (headers).

## Layout & shell

Fixed left **sidebar at `w-[15.25rem]`** (`fixed left-0 top-0 h-full border-r border-line bg-sidebar`,
hidden below `md`, mobile nav replaces it) over a fluid content area. The dashboard pages live in the
`(dashboard)` route group behind the founders-only gate. Page bodies are a vertical stack (`space-y-6`)
opening with a title block (`text-2xl font-bold text-ink` + `text-sm text-ink-muted` subtitle), then KPI
row, then chart/table sections. Responsive: stack to 1 column on mobile, expand to the documented grids at
`sm`/`lg`/`xl`.

## Elevation & depth

**Flat by design** (`--depth: 0`, `--noise: 0`). Hierarchy = surface ladder + hairline borders, never faux
depth. Shadow ladder (hand-authored, transient/floating only): `--shadow-linear-sm/-linear/-md/-lg`
(`0 1–8px … rgba(0,0,0,.3–.4)`). A subtle **brand glow** (`shadow-glow-brand`:
`0 0 20px rgba(59,91,219,.15)`) appears only on primary actions; `shadow-glow-success` for positive emphasis.
`glass-card` (135° base-200 gradient + 20px backdrop-blur) is reserved for overlays. The `stat-card` utility
adds a faint top-right radial brand glow (`rgba(59,91,219,.08)`) behind KPI cards.

## Shape & radii

`selector`/`field` = **0.25rem (4px)** (buttons, inputs, selectors, small chips like badges `rounded` and
the segmented control's `rounded-md`); `box` = **0.375rem (6px)** (cards, panels, `rounded-box`). Fully round
(`rounded-full` / `9999px`) only for status dots, avatars/logos, and pill chips. Icon tiles use `rounded-xl`.

## Motion & interaction

Keyframes (in `globals.css`): `fadeInUp` (opacity 0→1, `translateY(8px)→0`, 0.3s ease-out),
`scaleIn` (0.95→1, 0.2s), `shimmer` (skeleton sweep, 1.5s loop). Transitions are `200–300ms ease-out`.

**Entrance:** content cards animate in with `animate-[fadeInUp_0.4s_ease-out_forwards] opacity-0` and a
**staggered `animationDelay`** (~60–75ms steps: 0, 75, 150, 225…) so a KPI row cascades in.

**KPI card hover (the signature interaction):** `hover:-translate-y-0.5 hover:border-brand/40
hover:shadow-linear-md` over `transition-all duration-300 ease-out`, plus an **animated accent bar** —
a bottom `h-0.5 w-0` brand bar that grows to `w-full` on `group-hover` (300ms). The accent icon tile shifts
from `bg-{accent}/10` to `/20` on hover.

**Nav items:** a 2px left bar (`.nav-item::before`) grows from `height:0` to `16px` on hover/active; active =
`base-300` fill + brand text. **Interactive cards** (`.card-interactive`) lift `translateY(-2px)` + shadow on
hover, settle to `scale(0.995)` on active. **Skeletons:** `.skeleton-shimmer` (base-300 + animated sheen).
`::selection` is brand at 30% alpha. Scrollbars are thin Linear-style: `8px`, thumb `#2a2c32`
`rounded-full`, hover `#34373e`, transparent track.

## Charts

ApexCharts only (**no Recharts**), always via `src/components/charts/chart.tsx` — a dynamic `ssr:false`
wrapper that restyles ApexCharts' internal tooltip/grid DOM with daisyUI tokens (`bg-base-200`,
`rounded-box`, `border-base-content/10`). Charts re-theme via `var(--color-*)`; the only sanctioned hex is the
**canonical chart palette**:

`#3b5bdb` brand · `#2f80ed` info-blue · `#59a200` success · `#f2c94c` warning · `#eb5757` error ·
`#9b6bdb` violet · `#5570ec`/`#7e93f0` light-blue · `#2f9e8f` teal · greys `#6b6f76`/`#545760`.

Per-type conventions (all live in `components/charts/`):
- **Area** (`AreaTrend`): 2.5px smooth brand stroke, vertical gradient fill `0.5→0`, hidden y-axis,
  custom token tooltip.
- **Donut** (`Donut`): hollow `72%`, center total label, **built-in legend disabled** in favor of a custom
  **pill legend** below (dot + label chips). Used for ≤~6 part-to-whole categories.
- **Column** (`ColumnChart`): vertical gradient bars (`opacity 0.95→0.12`), `borderRadius 5`,
  `borderRadiusApplication: end`, 55% width.
- **Bar list** (`BarList`): the preferred ranked-category primitive — label left, value right (`tabular-nums`),
  subtle proportional `bg-brand/15` fill behind. Use this over a donut when one category dominates.
- **Treemap / StackedBar / Radial**: treemap `distributed` for storage maps; horizontal stacked bars for
  part-vs-part (e.g. table vs index); radial hollow `62%` for coverage gauges.
- **Combo** (e.g. `ReacquireCard`): columns + lines on a dual axis; legend rendered as pill chips flush-left
  under the plot; range filter (`12M/6M/3M/1M`) top-right.

Chart cards: `Card p-5` + a `text-sm font-medium text-ink-muted` title + optional `text-xs text-ink-faint`
subtitle; the chart height is fixed (260–360px) per component.

## Component recipes (copy these exactly)

- **Card:** `rounded-box border border-line bg-base-200` (padding added per use, usually `p-5`).
- **KPI card:** `rounded-box border border-line bg-base-200 p-5` + `stat-card group relative overflow-hidden`
  + the hover/entrance/accent-bar described in Motion. Title = micro-label; value = `text-[1.75rem] font-bold
  leading-none tracking-tight text-ink`; subtitle = `text-[0.6875rem] text-ink-faint`; accent icon tile
  top-right.
- **Badge:** `inline-flex items-center rounded px-1.5 py-0.5 text-[0.625rem] font-medium`; tones — `success`
  `bg-success text-base-100`, `error` `bg-error text-base-100`, `info` `bg-info text-base-100`, `warning`
  `bg-warning text-warning-content`, `neutral` `bg-base-300 text-ink-faint`. (Boolean cells render green
  **Yes** / red **No**, never a bare "—".)
- **Pill chip / custom legend:** `inline-flex items-center gap-1.5 rounded-full border border-line
  bg-base-300/40 px-2.5 py-1 text-xs text-ink-muted` + `<span class="size-2 rounded-full" style=bg>`.
- **Segmented control (range/filter):** wrapper `inline-flex rounded-lg border border-line bg-base-200 p-0.5`;
  button `rounded-md px-2.5 py-1 text-xs font-medium transition-colors`; active `bg-base-300 text-ink`,
  inactive `text-ink-faint hover:text-ink-muted`.
- **Table:** container `rounded-box border border-line bg-base-200`; header block `border-b border-line p-4`;
  `<thead>` row `text-left text-xs uppercase tracking-wide text-ink-faint`, `<th>` `px-4 py-2 font-medium`;
  rows `border-t border-line/60 transition-colors hover:bg-base-300/40`, cells `px-4 py-2`. Sortable headers
  are buttons with an `ArrowUp/ArrowDown` (lucide, `h-3 w-3`) shown on the active column. Long tables paginate
  (25/page) or use a sticky-header `max-h` scroll.
- **InfoHint (eye tooltip):** an `Eye` icon (`h-3.5 w-3.5 text-ink-faint`) with a CSS-only tooltip on a
  **named group** (`group/hint` + `group-hover/hint:`) so it never fires on a parent card's `group` hover;
  popover `rounded-lg border border-line bg-base-300 p-3 text-[0.6875rem]`. Use it to keep explanatory copy
  off the surface.
- **Copy button:** `lucide Copy`→`Check` on click (1.2s), `text-ink-faint hover:text-ink`; labeled variant for
  "copy all".
- **Live pulse:** a `size-2` success dot with an `animate-ping` halo inside a pill, for "live / last write Xs".
- **Logo/avatar:** favicon via Google's service with a monogram fallback; `h-5 w-5 rounded`.

Iconography: **lucide-react** for UI glyphs; **react-icons/si** (Simple Icons) for brand logos (Stripe,
HubSpot, GitHub, socials) since lucide has none.

## Implementation (token pipeline)

`design/swayzio.DESIGN.md` (this file) → `npm run design:build` (`scripts/build-theme.ts` parses the YAML front
matter via the `yaml` package) → `src/app/theme.generated.css` (committed) → `@import`'d by
`src/app/globals.css`. The build **partitions** tokens: daisyUI-owned colors (`base-*`, `primary`, semantic…)
go into the `@plugin "daisyui/theme"` block; custom colors (`sidebar`, `line`, `ink-*`, `brand*`) and the
type/radii tokens go into `@theme` so they become Tailwind utilities (`bg-sidebar`, `border-line`,
`text-ink-muted`, `text-xs`, `rounded-box`). Typography emits paired `--text-X` / `--text-X--line-height`.

**What lives where:** tokens (color, type, radii) → here, in the YAML. Everything the tokens can't model
(font stacks, the shadow ladder, motion/keyframes, the 90% density root, scrollbars, `@utility`/`@layer
components` "feel" helpers) → hand-authored in `globals.css`. Component tokens drive **contrast linting +
agent guidance only** — they are not codegen'd into CSS.

**To change the look:** edit tokens here → `npm run design:build` → commit the regenerated
`theme.generated.css`. `npm run design:lint` checks token contrast (WCAG AA); `npm run design:check` fails CI
if the generated CSS is stale vs this file. CLI is `@google/design.md@0.3.0` (known v0.3.0 quirks documented in
`docs/DESIGN-SYSTEM.md`; the build glue parses front matter directly to route around them).

## Do's and Don'ts

- **Do** use the accent (`primary`/`brand`) only for interaction and brand — one primary action per view.
  **Don't** use it decoratively.
- **Do** define surfaces with the base ladder + `line` borders. **Don't** reach for drop-shadows to separate
  content.
- **Do** let charts re-theme via `var(--color-*)` and the documented palette. **Don't** hardcode other hex.
- **Do** keep text on the ink ladder (`base-content` → `ink-muted` → `ink-faint`). **Don't** fake greys with
  opacity.
- **Do** respect the spacing rhythm (`space-y-6` sections, `p-5` cards, `gap-4` KPIs / `gap-6` content,
  `px-4 py-2` cells) and the 90% density root.
- **Do** keep motion short and confirming (staggered `fadeInUp`, `-translate-y-0.5` hovers).
- **Do** maintain WCAG AA contrast (4.5:1 normal text) — badges are dark-on-color by rule.
