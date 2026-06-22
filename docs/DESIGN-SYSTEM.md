# Design System Spec — DESIGN.md as Source of Truth

> **Status:** Proposed (2026-06-21). Adopt [`DESIGN.md`](https://github.com/google-labs-code/design.md)
> (Google Labs) as the single, machine-readable source of truth for the Swayzio visual identity, and
> generate our Tailwind 4 + daisyUI 5 theme from it.
>
> **Verified against (2026-06-21):** `@google/design.md` CLI **v0.3.0** (latest on npm; ran `export`/
> `lint` directly), Tailwind CSS docs (`@theme` namespaces + `--text-*--line-height` pairing),
> daisyUI 5 theme docs (`@plugin "daisyui/theme"`). This repo already builds with **tailwindcss
> 4.2.2 + daisyui 5.5.19**, so the daisyUI/Tailwind pairing is proven here, not assumed.

---

## 1. What DESIGN.md is

A file format: **YAML front matter (design tokens) + markdown prose (rationale)**. Tokens are the
normative values; prose explains *why*/*how*. Ships a CLI:

- **`lint`** — resolves token refs, **checks WCAG AA contrast** on component `backgroundColor`/
  `textColor` pairs, flags missing `primary`, orphaned tokens, section-order, typo'd keys. JSON output.
- **`export`** — `css-tailwind` (Tailwind v4 `@theme`), `json-tailwind` (v3 `theme.extend`), `dtcg`
  (W3C Design Tokens). Resolves `{refs}` to concrete values.
- **`diff`** — token-level + contrast regression detection between two files.
- **`spec`** — prints the format spec (injectable into agent prompts).

---

## 2. Why it fits — and the honest risks

**Fit:** our theme is already Tailwind 4 CSS-first + daisyUI; the format is plain markdown an agent
(this one, or the future eve.dev agent) can read to understand/extend the brand; the contrast linter
is real insurance; tokens stay portable (DTCG → Figma later). No runtime dependency.

**Risks & mitigations (this is why the spec is built the way it is):**
| Risk | Mitigation |
|---|---|
| Format is `alpha`; CLI is `v0.3.0` (early) | **Pin `@google/design.md@0.3.0` exactly.** Treat generated CSS as a committed artifact. |
| Export shape may change between alpha versions | Glue rides the **export output** + applies small, named transforms; if export breaks, `globals.css` can be hand-edited (the artifact is normal CSS). |
| Export doesn't know daisyUI | Glue generates the `@plugin "daisyui/theme"` block (§4). |
| Export decouples line-height (`--leading-*`) from `--text-*` | Glue rewrites to Tailwind's **paired** `--text-X--line-height` so `text-X` keeps its defaults (§4). |
| `@google` scope / registry 404s | Documented: ensure `registry=https://registry.npmjs.org/`. |

---

## 3. Verified token → CSS mapping (from CLI v0.3.0)

`export css-tailwind` emits **one `@theme {}` block** using token *names* as Tailwind namespace keys:

| DESIGN.md token | Emitted CSS var | Tailwind utility | Notes |
|---|---|---|---|
| `colors.X` | `--color-X` | `bg-X` / `text-X` / `border-X` | |
| `typography.X.fontSize` | `--text-X` | `text-X` | |
| `typography.X.lineHeight` | `--leading-X` | `leading-X` | **separate** util — not auto-applied to `text-X` |
| `typography.X.letterSpacing` | `--tracking-X` | `tracking-X` | |
| `typography.X.fontWeight` | `--font-weight-X` | `font-weight-X` | |
| `typography.X.fontFamily` | `--font-X` | `font-X` | one per level (redundant if all Inter) |
| `rounded.X` | `--radius-X` | `rounded-X` | |
| `spacing.X` | `--spacing-X` | `p-X`/`gap-X`/… | named utils; does **not** touch the numeric `--spacing` base scale |
| `components.*` | *(none)* | — | **not exported to CSS** — only used by `lint` (contrast) + `dtcg`/Figma + agents |

**Tailwind 4 fact (verified):** to make `text-X` carry a default line-height/tracking/weight, use the
**paired** form `--text-X`, `--text-X--line-height`, `--text-X--letter-spacing`, `--text-X--font-weight`.
The export's `--leading-X` namespace generates *standalone* `leading-X` utilities instead — hence the
glue transform below.

**daisyUI 5 theme (verified):** themes live in `@plugin "daisyui/theme" { name; default; prefersdark;
color-scheme; --color-base-100/200/300; --color-base-content; --color-primary(+ -content); secondary;
accent; neutral; info; success; warning; error (+ -content); --radius-selector/field/box;
--size-selector/field; --border; --depth; --noise; }`. The raw export does not produce this block.

---

## 4. Architecture — one source, generated theme

```
  design/swayzio.DESIGN.md             ← SINGLE SOURCE OF TRUTH (tokens + prose)
        │  npm run design:build
        ▼
  npx @google/design.md@0.3.0 export   ──►  scripts/build-theme.ts  (deterministic glue)
        │ (resolves refs → values)               │
        │                                         │  3 transforms:
        │                                         │  (a) PARTITION: daisyUI-owned color/radius tokens
        │                                         │      → @plugin "daisyui/theme" block (+ injected
        │                                         │      meta: name/default/prefersdark/color-scheme/
        │                                         │      --size-*/--border/--depth/--noise)
        │                                         │  (b) TYPOGRAPHY: rewrite --leading/--tracking/
        │                                         │      --font-weight-X → paired --text-X--line-height
        │                                         │      /--letter-spacing/--font-weight; collapse the
        │                                         │      per-level --font-X to a single --font-sans
        │                                         │  (c) REMAINDER (custom colors, type sizes, spacing)
        │                                         │      → @theme block
        ▼                                         ▼
  src/app/theme.generated.css   ← committed artifact (daisyUI block + @theme block)
        │
  src/app/globals.css =  @import "tailwindcss"; @plugin "daisyui";
                         @import "./theme.generated.css";
                         …hand-written utilities (shadow-glow-brand, keyframes, .nav-item, scrollbars,
                           and `html { font-size: 90% }` density knob)…
```

**Partition rule (a):** token names in the daisyUI set — `base-100`, `base-200`, `base-300`,
`base-content`, `primary`(+`-content`), `secondary`(+), `accent`(+), `neutral`(+), `info`/`success`/
`warning`/`error`(+`-content`), and `rounded.selector`/`field`/`box` — route to the daisyUI block.
Everything else (custom colors `sidebar`/`line`/`ink-muted`/`ink-faint`/`brand-hover`, the type scale,
extra spacing) routes to `@theme`. daisyUI **meta** that isn't a DESIGN.md token (`name: swayzio`,
`default: true`, `prefersdark: true`, `color-scheme: dark`, `--size-selector/field`, `--border`,
`--depth`, `--noise`) is injected as constants by the glue.

**Why glue, not raw `export`:** the export (i) can't emit the daisyUI block, (ii) decouples line-height
into `--leading-*`, (iii) emits N redundant `--font-*`. The glue is ~80 deterministic lines and rides
the official export for value/ref resolution, so it stays correct as long as the export contract holds.

---

## 5. Token naming alignment (so the export lands drop-in)

Name DESIGN.md tokens to match what we already consume — then generated vars equal today's vars:

- **Typography tokens:** `xs, sm, base, md, lg, xl, 2xl, 3xl` → `--text-xs … --text-3xl` (identical to
  current scale). `fontSize` in **rem** (root is `90%`); `lineHeight` unitless.
- **Rounded tokens:** `selector, field, box` → `--radius-selector/field/box` (daisyUI). (Add `lg` if
  needed for non-daisyUI utilities.)
- **Colors:** daisyUI names (`base-100/200/300`, `base-content`, `primary`+`-content`, `info`/`success`/
  `warning`/`error`+`-content`) **plus** customs (`sidebar`, `line`, `ink-muted`, `ink-faint`,
  `brand-hover`). `primary` is required by the linter.
- **Spacing:** keep Tailwind's numeric rem scale for layout (untouched); only add named spacing tokens
  if a semantic one earns its place.

### Current `swayzio` values to encode (verified live)
Colors: base-100 `#101012`, base-200 `#17181a`, base-300 `#1e2024`, base-content `#ffffff`,
primary `#3b5bdb` (+content `#fff`), info `#2f80ed`, success `#59a200`, warning `#f2c94c`
(content `#101012`), error `#eb5757`; sidebar `#090909`, line `#23252a`, ink-muted `#6b6f76`,
ink-faint `#545760`, brand-hover `#5570ec`. Type: Inter; sizes 0.6875/0.75/0.8125/0.875/1/1.125/1.25/
1.5rem; line-height 1.4 (body) / 1.2 (headings). Rounded: selector/field 0.25rem, box 0.375rem.
Density: `html{font-size:90%}` (stays in globals — a global knob, not a token).

> **Inter detail:** encode `fontFeature: "cv02","cv03","cv04","cv11"` on the body typography token
> (DESIGN.md supports `fontFeature`/`fontVariation`) to preserve the current font-feature-settings.

---

## 6. Components = lint + guidance (not codegen)

Component tokens (`button-primary`, `button-primary-hover`, `card`, `kpi-card`, `badge-success`,
`input`, `nav-item`, `nav-item-active`, `table-row`) are **not** turned into CSS. They earn their keep
by: (1) the linter checking each `backgroundColor`/`textColor` pair for **WCAG AA contrast**, (2)
giving agents a canonical component vocabulary, (3) DTCG → Figma. We still author component classes by
hand (or an agent reads the tokens). Valid props: `backgroundColor`, `textColor`, `typography`,
`rounded`, `padding`, `size`, `height`, `width` (others like `borderColor` are accepted *with a warning*).

---

## 7. Prose sections (canonical order)
**Overview** (Linear-inspired near-black, single deep-blue accent, dense & calm) · **Colors** (surface
ladder; accent reserved for interaction/brand) · **Typography** (Inter, tight leading, 13px-equiv body)
· **Layout** (15.25rem sidebar, 4px grid, 90% density) · **Elevation & Depth** (flat: hairline borders
over shadows; glows only on brand actions) · **Shapes** (4–6px radii) · **Components** · **Do's and
Don'ts** ("accent = interaction/brand only, never decoration"; "borders, not drop-shadows, define
surfaces"; "charts re-theme via `var(--color-*)` — no hardcoded hex except the two chart series";
"maintain WCAG AA 4.5:1").

---

## 8. Repo layout & scripts
```
design/swayzio.DESIGN.md            # source of truth
design/README.md                    # edit + rebuild instructions
scripts/build-theme.ts              # glue → theme.generated.css
src/app/theme.generated.css         # committed artifact (do not hand-edit; regenerate)
src/app/globals.css                 # imports tailwind + daisyui + theme.generated.css + bespoke utils
```
```jsonc
// package.json (pin exact version)
"devDependencies": { "@google/design.md": "0.3.0" },
"scripts": {
  "design:lint":  "design.md lint design/swayzio.DESIGN.md",
  "design:build": "tsx scripts/build-theme.ts",
  "design:check": "tsx scripts/build-theme.ts --check"   // CI: fail if artifact stale
}
```

## 9. Workflow & CI
- Edit token/prose → `design/swayzio.DESIGN.md`; `npm run design:build`; HMR picks it up.
- `npm run design:lint` before commit (contrast + refs).
- CI gate: `design:lint` (fail on error) + `design:check` (artifact fresh) + existing `tsc`/`next build`.
- Theme PRs: `design.md diff` to catch regressions (e.g., a pair dropping below AA).

## 10. Phased rollout
1. **Author + wire, zero visual change.** Pin CLI; write `swayzio.DESIGN.md` from §5 values; build
   `scripts/build-theme.ts`; emit `theme.generated.css`; refactor `globals.css` to import it; verify
   **pixel-identical**; `lint` clean (0 errors).
2. **Componentize.** Add component tokens; fix any contrast warnings; refactor KpiCard/buttons/badges/
   tables to a shared vocabulary; wire `design:lint` + `design:check` into CI.
3. **Leverage.** `diff` on theme PRs; expose `swayzio.DESIGN.md` (and `design.md spec`) to the eve.dev
   agent so it builds on-brand UI; optional DTCG → Figma sync.

## 11. Open decisions
- **Glue input:** ride `export css-tailwind` + relocate (recommended — fewest moving parts) vs.
  `export dtcg` + template (more control). Either rides the official ref-resolver.
- **CLI pin:** `0.3.0` now; bump deliberately, gated by `diff` + visual check (alpha format).
- **Light mode:** ship `swayzio` (dark) only; DESIGN.md can hold a 2nd palette later.
- **Density:** keep `html{font-size:90%}` in globals (global knob) rather than a token.
```
