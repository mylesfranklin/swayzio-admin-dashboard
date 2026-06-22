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
  brand-hover: "#5570ec"
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
    textColor: "{colors.success-content}"
  badge-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.error-content}"
  table-row-hover:
    backgroundColor: "{colors.base-300}"
    textColor: "{colors.base-content}"
  nav-item-active:
    backgroundColor: "{colors.base-300}"
    textColor: "{colors.brand}"
---

## Overview

Swayzio's internal "brain" — the analytics surface the founders live in. The mood is
**Linear-inspired**: a calm, dense, near-black workspace where data is the hero and chrome
recedes. Premium and engineered, never flashy. A single deep-blue accent carries all
interaction and brand emphasis; everything else is a quiet ladder of dark neutrals.

Feel: **dense, calm, precise.** Generous data, tight chrome. The UI renders at 90% of the
browser default density (`html { font-size: 90% }`) so more fits without feeling cramped.

## Colors

A near-black surface ladder with one accent. The accent is reserved for interaction and brand —
never decoration.

- **base-100 (#101012):** App background — the deepest working surface.
- **base-200 (#17181a):** Cards and panels — one step up from the background.
- **base-300 (#1e2024):** Hover / raised states and inset tiles.
- **base-content (#ffffff):** Primary text. Secondary/tertiary text use `ink-muted`/`ink-faint`.
- **primary / brand (#3b5bdb):** Deep blue — the sole driver of interaction (buttons, active nav,
  focus, the primary chart series). `brand-hover (#5570ec)` is the lifted hover.
- **sidebar (#090909):** The navigation rail — intentionally darker than the app background.
- **line (#23252a):** Hairline borders that define every surface (we lead with borders, not shadows).
- **ink-muted (#6b6f76) / ink-faint (#545760):** Secondary and tertiary text.
- **Semantic:** info `#2f80ed`, success `#59a200`, warning `#f2c94c` (dark text), error `#eb5757`.

## Typography

**Inter** throughout, with tight leading. Body is ~13px-equivalent (`base` = 0.8125rem at the 90%
root). Headings use a slightly tighter line-height (1.2) than body/labels (1.4). Micro-labels are
uppercase with wide tracking. Body text keeps Inter's stylistic sets via
`font-feature-settings: "cv02","cv03","cv04","cv11"` (applied globally, not per-token).

Scale (token → use): `xs` micro-labels · `sm` labels · `base` body · `md` emphasized body ·
`lg` card titles · `xl`/`2xl` section heads · `3xl` page titles & hero numbers.

## Layout

Fixed left sidebar (15.25rem) over a fluid content area; content padded on a 4px grid (Tailwind's
numeric rem scale). Cards group related data with comfortable internal padding. Global density is
90% of the browser default — a single root knob, not a token.

## Elevation & Depth

**Flat by design.** Hierarchy comes from the surface ladder (base-100 → 200 → 300) and **hairline
borders** (`line`), not drop-shadows. Shadows are reserved for transient/floating UI; a subtle blue
**glow** appears only on primary (brand) actions. No faux depth (`--depth: 0`, `--noise: 0`).

## Shapes

Restrained, engineered radii: inputs/buttons/selectors at **4px** (`field`/`selector` = 0.25rem),
cards/boxes at **6px** (`box` = 0.375rem). Pills (`9999px`) only for status dots and avatars.

## Components

Buttons (primary = solid blue, hover lifts to `brand-hover`; ghost = base-300 fill), cards/kpi-cards
(base-200 + hairline border + box radius), inputs (base-200 fill, field radius), badges (semantic
fill + content color), table rows (hover to base-300), and nav items (active = brand text). Variants
are separate `*-hover`/`*-active` entries. Component tokens drive contrast linting and agent
guidance — they are not codegen'd into CSS.

## Do's and Don'ts

- **Do** use the accent (`primary`/`brand`) only for interaction and brand emphasis — one primary
  action per view. **Don't** use it decoratively.
- **Do** define surfaces with the base ladder + `line` borders. **Don't** reach for drop-shadows to
  separate content.
- **Do** let charts re-theme via `var(--color-*)`. **Don't** hardcode hex in charts (the two chart
  series colors are the only sanctioned exception).
- **Do** keep text on the `ink` ladder (`base-content` → `ink-muted` → `ink-faint`).
- **Do** maintain WCAG AA contrast (4.5:1 for normal text).
