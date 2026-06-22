# Swayzio Design System

The visual identity lives in **`swayzio.DESIGN.md`** ([DESIGN.md format](https://github.com/google-labs-code/design.md)) — tokens (YAML front matter) + rationale (prose). It is the single source of truth; the Tailwind 4 + daisyUI 5 theme is generated from it.

## Edit the look
1. Change tokens or prose in `swayzio.DESIGN.md`.
2. `npm run design:build` → regenerates `../src/app/theme.generated.css` (committed artifact; imported by `globals.css`). HMR picks it up.
3. `npm run design:lint` → WCAG contrast + reference checks (must be 0 errors).
4. `npm run design:check` → CI guard: fails if the generated CSS is stale.

## Files
- `swayzio.DESIGN.md` — source of truth (tokens + prose).
- `spec.md` — the DESIGN.md format spec (vendored; the v0.3.0 CLI `spec` command is broken).
- `../scripts/build-theme.ts` — the generator (parses front matter, emits the daisyUI theme block + `@theme` block). See `../docs/DESIGN-SYSTEM.md` for the full pipeline + rationale.

## Notes
- CLI pinned at `@google/design.md@0.3.0` (alpha). Bump deliberately; `designmd diff` gates theme PRs in CI.
- Component tokens (`button-*`, `badge-*`, `card`, …) drive the contrast linter + agent guidance + DTCG/Figma — they are **not** codegen'd into CSS. The React vocabulary is in `../src/components/ui/`.
- The remaining lint warnings are structural "orphaned token" notices for surface/daisyUI colors used via Tailwind utilities (e.g. `bg-sidebar`, `border-line`) — expected and non-blocking.
