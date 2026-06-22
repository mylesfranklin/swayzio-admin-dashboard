# Design System Pipeline — DESIGN.md as Source of Truth

> **Status: adopted & live (2026-06).** The Swayzio visual identity is defined in
> [`design/swayzio.DESIGN.md`](../design/swayzio.DESIGN.md) and generated into the Tailwind 4 + daisyUI 5
> theme. **`DESIGN.md` is the human/agent-facing spec** (read it to replicate the look); **this file**
> documents the build pipeline, the token→CSS mapping, and the CLI gotchas we route around.
>
> Stack (proven in this repo): **tailwindcss 4.2.2 + daisyui 5.5.19**, `@google/design.md ^0.3.0`
> (dev-only, used for **lint** — not for the build).

---

## 1. What DESIGN.md is

A file format: **YAML front matter (design tokens) + markdown prose (rationale + the full spec)**. Tokens
are normative; prose specifies everything tokens can't (spacing, density, motion, component recipes). It
ships a CLI; we use exactly one command of it (`lint`):

- **`lint`** (we use this) — resolves token refs and **checks WCAG AA contrast** on component
  `backgroundColor`/`textColor` pairs, flags missing `primary`, orphaned/typo'd keys. JSON output. Wired as
  `npm run design:lint`.
- `export` / `diff` / `spec` — **not used in our build.** The v0.3.0 `export` drops unitless `lineHeight` and
  can't emit the daisyUI block, and `spec` is broken in v0.3.0 — so our glue parses the front matter directly
  instead (§3). `design/spec.md` is a vendored copy of the format spec for reference.

---

## 2. Why this approach (and the decisions made)

**Fit:** the theme is already Tailwind 4 CSS-first + daisyUI; the format is plain markdown an agent (this
one, or eve.dev later) reads to understand/extend the brand; the contrast linter is real insurance; tokens
stay portable (DTCG → Figma later). No runtime dependency — the generated CSS is a committed artifact.

| Earlier risk | Decision (locked) |
|---|---|
| Format is `alpha`; CLI `v0.3.0` is early | Treat `theme.generated.css` as a **committed artifact**; CLI used only for `lint`. |
| `export` drops `lineHeight`, can't emit daisyUI, `spec` broken | **Don't use `export`.** The glue parses the front matter directly via the `yaml` package — lossless and version-proof. |
| Export shape could change between alpha versions | Irrelevant now — we don't ride the export. If `lint` ever breaks, the theme still builds (glue is independent). |

---

## 3. The build — one source, generated theme

```
  design/swayzio.DESIGN.md              ← SINGLE SOURCE OF TRUTH (tokens + full prose spec)
        │  npm run design:build
        ▼
  scripts/build-theme.ts                ← parses the YAML front matter directly (yaml pkg),
        │                                  resolves {refs}, then applies 3 deterministic transforms:
        │     (a) PARTITION  daisyUI-owned color/radius tokens → `@plugin "daisyui/theme"` block
        │                    (+ injected meta: name/default/prefersdark/color-scheme/
        │                       --size-*/--border/--depth/--noise)
        │     (b) TYPOGRAPHY emit Tailwind's PAIRED form `--text-X` + `--text-X--line-height`
        │                    (so `text-X` keeps its leading); collapse per-level fonts → `--font-sans`
        │     (c) REMAINDER  custom colors + type sizes → `@theme` block
        ▼
  src/app/theme.generated.css           ← committed artifact (daisyUI block + @theme block)
        │
  src/app/globals.css = @import "tailwindcss"; @plugin "daisyui";
                        @import "./theme.generated.css";
                        + hand-authored: font stacks, shadow ladder, motion/keyframes,
                          @utility/@layer-components feel helpers, scrollbars,
                          and the `html { font-size: 90% }` density root.
```

**Partition rule (a):** the daisyUI set — `base-100/200/300`, `base-content`, `primary`(+`-content`),
`secondary`(+), `accent`(+), `neutral`(+), `info`/`success`/`warning`/`error`(+`-content`), and
`rounded.selector`/`field`/`box` — routes to the daisyUI block. Everything else (custom colors
`sidebar`/`line`/`ink`/`ink-muted`/`ink-faint`/`brand`/`brand-hover`, the type scale) routes to `@theme`
and becomes Tailwind utilities (`bg-sidebar`, `border-line`, `text-ink-muted`, `text-xs`, `rounded-box`).
daisyUI **meta** that isn't a token (`name: swayzio`, `default: true`, `prefersdark: true`,
`color-scheme: dark`, `--size-*`, `--border`, `--depth: 0`, `--noise: 0`) is injected as constants.

---

## 4. Token → CSS reference

Our glue emits (matching Tailwind 4 / daisyUI 5 semantics, verified live):

| DESIGN.md token | Emitted | Tailwind utility |
|---|---|---|
| daisyUI `colors.X` | `--color-X` in the daisyUI block | `bg-X` / `text-X` / `border-X` |
| custom `colors.X` | `--color-X` in `@theme` | `bg-X` / `text-X` / `border-X` |
| `typography.X.fontSize` | `--text-X` (+ paired `--text-X--line-height`) | `text-X` (carries its leading) |
| `rounded.X` | `--radius-X` (daisyUI) | `rounded-X` |
| `components.*` | *(none — not codegen'd)* | drives `lint` contrast + agent guidance + DTCG/Figma only |

**Tailwind 4 fact:** for `text-X` to carry a default line-height, the var must be the **paired**
`--text-X--line-height` (not a standalone `--leading-X`). The glue emits the paired form.

**daisyUI 5 fact:** themes are `@plugin "daisyui/theme" { name; default; prefersdark; color-scheme;
--color-base-100/200/300; --color-base-content; --color-primary(+-content); secondary; accent; neutral;
info; success; warning; error(+-content); --radius-selector/field/box; --size-*; --border; --depth; --noise }`.

---

## 5. Components = lint + guidance (not codegen)

Component tokens (`button-*`, `card`, `kpi-card`, `badge-*`, `input`, `nav-item*`, `table-row-hover`) are
**not** turned into CSS. They earn their keep by (1) the linter checking each `backgroundColor`/`textColor`
pair for **WCAG AA contrast** (badges are dark-on-color by rule), (2) giving agents a canonical component
vocabulary mirrored by `src/components/ui/*` (`Card`, `Badge`, `Button`), (3) DTCG → Figma later. The
concrete, copy-exact class recipes for every component live in **DESIGN.md → Component recipes**.

---

## 6. Repo layout & scripts

```
design/swayzio.DESIGN.md        # source of truth (tokens + full spec)
design/components.html          # standalone visual gallery (open in a browser)
design/spec.md                  # vendored DESIGN.md format spec (reference)
design/README.md                # edit + rebuild instructions
scripts/build-theme.ts          # glue → theme.generated.css (parses front matter directly)
src/app/theme.generated.css     # committed artifact — do NOT hand-edit; regenerate
src/app/globals.css             # tailwind + daisyui + theme.generated.css + bespoke feel utilities
```
```jsonc
"devDependencies": { "@google/design.md": "^0.3.0" },   // used only by design:lint
"scripts": {
  "design:lint":  "designmd lint design/swayzio.DESIGN.md",
  "design:build": "tsx scripts/build-theme.ts",
  "design:check": "tsx scripts/build-theme.ts --check"    // CI: fail if artifact stale
}
```

## 7. Workflow & CI
- Edit tokens/prose in `design/swayzio.DESIGN.md` → `npm run design:build` → commit the regenerated
  `theme.generated.css` (HMR picks it up locally).
- `npm run design:lint` before commit (contrast + refs) — gate on **errors** (warnings are advisory).
- CI runs `design:lint` + `design:check` (artifact fresh) alongside `tsc`/`next build`; the GitHub workflow
  also runs a `designmd diff` on PRs to catch a token pair dropping below AA.
- Update `design/components.html` when adding a component so the visual gallery stays complete.

## 8. Status — fully rolled out
1. ✅ **Authored + wired, zero visual change** — `swayzio.DESIGN.md` written, `build-theme.ts` glue,
   `theme.generated.css` emitted, `globals.css` imports it, pixel-identical, `lint` 0 errors.
2. ✅ **Componentized** — component tokens added; contrast fixed to AA; `ui/` vocabulary
   (Card/Badge/Button) + KPI/tables/charts refactored to it; `design:lint` + `design:check` in CI.
3. ✅ **Leverage** — `designmd diff` on theme PRs; `DESIGN.md` + `design/spec.md` are the eve.dev agent
   hand-off (`AGENTS.md`); `design/components.html` is the visual reference.

**Settled decisions:** glue parses front matter directly (not `export`); `@google/design.md` stays
`^0.3.0` (lint-only, bump deliberately); ship `swayzio` dark theme only (a 2nd palette can live in DESIGN.md
later); density stays the `html{font-size:90%}` global knob, not a token.

### Current `swayzio` token values (mirror of DESIGN.md, for quick reference)
Colors: base-100 `#101012` · base-200 `#17181a` · base-300 `#1e2024` · base-content `#ffffff` ·
primary `#3b5bdb` (+content `#fff`) · info `#2f80ed` · success `#59a200` · warning `#f2c94c`
(content `#101012`) · error `#eb5757` · sidebar `#090909` · line `#23252a` · ink-muted `#6b6f76` ·
ink-faint `#545760` · **brand-hover `#3450cf`** (deepened for AA). Type: Inter, sizes
0.6875/0.75/0.8125/0.875/1/1.125/1.25/1.5rem, line-height 1.4 body / 1.2 headings. Rounded:
selector/field 0.25rem, box 0.375rem. Density: `html{font-size:90%}`. Inter features
`"cv02","cv03","cv04","cv11"` are set on `body` in `globals.css` (not a token).
