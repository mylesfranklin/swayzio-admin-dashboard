/**
 * build-theme.ts — generate src/app/theme.generated.css from design/swayzio.DESIGN.md.
 *
 * Reads the DESIGN.md front matter directly (the normative format) for full fidelity:
 * the @google/design.md@0.3.0 exporters drop unitless lineHeight, and our color/
 * typography/rounded values are all literal (no {refs} to resolve), so parsing the
 * source YAML is both lossless and more future-proof than the alpha export shape.
 *
 * Emits two blocks:
 *   1. @plugin "daisyui/theme" { … }  ← daisyUI-owned colors + radii + injected meta
 *   2. @theme { … }                   ← custom colors + paired Tailwind type scale
 *
 * Usage:  tsx scripts/build-theme.ts          # write the artifact
 *         tsx scripts/build-theme.ts --check   # exit 1 if the artifact is stale (CI)
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "design/swayzio.DESIGN.md");
const OUT = resolve(ROOT, "src/app/theme.generated.css");
const TOKENS_OUT = resolve(ROOT, "src/app/design-tokens.generated.json"); // consumed by the /design-system page
const HTML_SRC = resolve(ROOT, "design/components.html");
const PUBLIC_DIR = resolve(ROOT, "public/design");

// Colors daisyUI owns → routed into @plugin "daisyui/theme"; everything else → @theme.
const DAISY_COLORS = new Set([
  "base-100", "base-200", "base-300", "base-content",
  "primary", "primary-content", "secondary", "secondary-content",
  "accent", "accent-content", "neutral", "neutral-content",
  "info", "info-content", "success", "success-content",
  "warning", "warning-content", "error", "error-content",
]);

// daisyUI theme metadata that isn't a DESIGN.md token (structural config).
const DAISY_META = {
  name: '"swayzio"',
  default: true,
  prefersdark: true,
  "color-scheme": "dark",
  "--size-selector": "0.25rem",
  "--size-field": "0.25rem",
  "--border": "1px",
  "--depth": "0",
  "--noise": "0",
};

interface Typography {
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string | number;
  letterSpacing?: string;
  fontWeight?: string | number;
}

function frontMatter(md: string): string {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("No YAML front matter found in DESIGN.md");
  return m[1];
}

interface Tokens {
  name?: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, Typography>;
  rounded?: Record<string, string>;
  components?: Record<string, Record<string, string>>;
}

function parseTokens(): Tokens {
  return parse(frontMatter(readFileSync(SRC, "utf8"))) as Tokens;
}

function generate(tokens: Tokens): string {
  const colors = tokens.colors ?? {};
  const typography = tokens.typography ?? {};
  const rounded = tokens.rounded ?? {};

  // ── daisyUI theme block ──
  const daisy: string[] = [];
  for (const [k, v] of Object.entries(DAISY_META)) daisy.push(`  ${k}: ${v};`);
  daisy.push("");
  for (const [name, value] of Object.entries(colors)) {
    if (DAISY_COLORS.has(name)) daisy.push(`  --color-${name}: ${value};`);
  }
  daisy.push("");
  for (const level of ["selector", "field", "box"]) {
    if (rounded[level]) daisy.push(`  --radius-${level}: ${rounded[level]};`);
  }

  // ── @theme block: custom colors + paired type scale ──
  const theme: string[] = [];
  for (const [name, value] of Object.entries(colors)) {
    if (!DAISY_COLORS.has(name)) theme.push(`  --color-${name}: ${value};`);
  }
  theme.push("");
  for (const [name, t] of Object.entries(typography)) {
    if (t.fontSize) theme.push(`  --text-${name}: ${t.fontSize};`);
    if (t.lineHeight != null) theme.push(`  --text-${name}--line-height: ${t.lineHeight};`);
    if (t.letterSpacing) theme.push(`  --text-${name}--letter-spacing: ${t.letterSpacing};`);
    if (t.fontWeight != null) theme.push(`  --text-${name}--font-weight: ${t.fontWeight};`);
  }

  return [
    "/* AUTO-GENERATED from design/swayzio.DESIGN.md by scripts/build-theme.ts.",
    "   Do not edit by hand — run `npm run design:build`. */",
    "",
    `@plugin "daisyui/theme" {`,
    ...daisy,
    "}",
    "",
    "@theme {",
    ...theme,
    "}",
    "",
  ].join("\n");
}

const tokens = parseTokens();
const css = generate(tokens);
const tokensJson = JSON.stringify(tokens, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { /* missing → stale */ }
  if (current !== css) {
    console.error("✗ theme.generated.css is stale. Run `npm run design:build`.");
    process.exit(1);
  }
  console.log("✓ theme.generated.css is up to date.");
} else {
  writeFileSync(OUT, css);
  writeFileSync(TOKENS_OUT, tokensJson); // page reads this so the styleguide reflects the source
  // Publish the source + gallery as static, downloadable assets for the in-app Design System page.
  mkdirSync(PUBLIC_DIR, { recursive: true });
  copyFileSync(SRC, resolve(PUBLIC_DIR, "swayzio.DESIGN.md"));
  copyFileSync(HTML_SRC, resolve(PUBLIC_DIR, "components.html"));
  console.log(`✓ wrote ${OUT.replace(ROOT + "/", "")}, design-tokens.generated.json, and public/design/*`);
}
