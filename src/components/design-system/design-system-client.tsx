"use client";

import { useState } from "react";
import { Download, ExternalLink, Bot, Music, Users, Database, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoHint } from "@/components/ui/info-hint";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BarList } from "@/components/charts/bar-list";
import { Donut } from "@/components/charts/donut";
import { cn } from "@/lib/utils";
import tokens from "@/app/design-tokens.generated.json";

const colors = tokens.colors as Record<string, string>;
const typography = tokens.typography as Record<string, { fontSize?: string; lineHeight?: number | string }>;
const rounded = tokens.rounded as Record<string, string>;

const COLOR_GROUPS: Array<{ label: string; names: string[] }> = [
  { label: "Surfaces", names: ["base-100", "base-200", "base-300", "sidebar"] },
  { label: "Text / ink ladder", names: ["base-content", "ink-muted", "ink-faint"] },
  { label: "Accent", names: ["primary", "brand", "brand-hover", "accent"] },
  { label: "Semantic", names: ["info", "success", "warning", "error"] },
  { label: "Structure", names: ["line", "neutral", "secondary"] },
];

const CHART_PALETTE = ["#3b5bdb", "#2f80ed", "#59a200", "#f2c94c", "#eb5757", "#9b6bdb", "#5570ec", "#2f9e8f"];

const AGENT_PROMPT = `You are building UI for the Swayzio admin dashboard. Match its design system EXACTLY — read design/swayzio.DESIGN.md (the source of truth) and follow it precisely:

• Linear-inspired near-black UI; ONE deep-blue accent (#3b5bdb), used only for interaction/brand — never decoration.
• Surfaces ladder: base-100 #101012 (app bg) → base-200 #17181a (cards) → base-300 #1e2024 (raised/hover). Separate surfaces with hairline borders (line #23252a), NOT shadows.
• Text on the ink ladder: #ffffff → ink-muted #6b6f76 → ink-faint #545760 (never fake greys with opacity).
• Inter, tight leading; ~13px body; uppercase micro-labels (tracking-wider). Global density = html{font-size:90%}.
• Radii: 4px controls / 6px cards. Spacing rhythm: space-y-6 sections · p-5 cards · gap-4 KPIs / gap-6 content · px-4 py-2 table cells.
• Motion: staggered fadeInUp entrance (~60–75ms steps); KPI hover = -translate-y-0.5 + a growing accent bar; 200–300ms ease-out.
• Charts: ApexCharts re-themed via var(--color-*); use a BarList for ranked categories; no hardcoded hex outside the documented palette.
• Use the exact component recipes in DESIGN.md (Card, KpiCard, Badge, pill chip, segmented control, table, InfoHint). Maintain WCAG AA (badges are dark-on-color).`;

function Swatch({ name }: { name: string }) {
  const hex = colors[name];
  if (!hex) return null;
  return (
    <div className="flex items-center gap-3 rounded-box border border-line bg-base-200 p-2.5">
      <div className="h-9 w-9 shrink-0 rounded-md border border-line" style={{ backgroundColor: hex }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-ink">{name}</p>
        <p className="font-mono text-[0.625rem] text-ink-faint">{hex}</p>
      </div>
      <CopyButton value={hex} title={`Copy ${hex}`} />
    </div>
  );
}

const RANGES = ["12M", "6M", "3M", "1M"];

export function DesignSystemClient() {
  const [range, setRange] = useState("12M");

  return (
    <div className="space-y-8">
      {/* Header + export actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-ink">Design System</h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {tokens.description as string} The visual identity is defined once in{" "}
            <span className="font-mono text-ink-faint">design/swayzio.DESIGN.md</span> and generated into the
            theme — this page is its live, in-app reference.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/design/swayzio.DESIGN.md"
            download="swayzio.DESIGN.md"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-content shadow-glow-brand transition-colors hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" /> Download DESIGN.md
          </a>
          <a
            href="/design/components.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3.5 text-sm font-medium text-ink-muted transition-colors hover:bg-base-300 hover:text-ink"
          >
            <ExternalLink className="h-4 w-4" /> Open HTML gallery
          </a>
        </div>
      </div>

      {/* Agent handoff */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bot className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-medium text-ink">For agents — replicate this system</h2>
          <InfoHint text="Hand any of these to an AI agent (or eve.dev) and it can reproduce the look exactly: download DESIGN.md, copy the prompt below, or read the recipes here." />
          <div className="ml-auto">
            <CopyButton label="Copy agent prompt" value={AGENT_PROMPT} title="Copy a ready-made agent instruction" />
          </div>
        </div>
        <ol className="space-y-1.5 text-xs leading-relaxed text-ink-muted">
          <li><span className="text-ink-faint">1.</span> Point the agent at <span className="font-mono text-ink-faint">design/swayzio.DESIGN.md</span> — tokens (YAML) + the full prose spec (spacing, density, motion, component recipes).</li>
          <li><span className="text-ink-faint">2.</span> Or hit <span className="font-mono text-ink-faint">Copy agent prompt</span> for a ready-made instruction summarizing the system.</li>
          <li><span className="text-ink-faint">3.</span> Theme pipeline: edit tokens → <span className="font-mono text-ink-faint">npm run design:build</span> → <span className="font-mono text-ink-faint">design:lint</span> (WCAG AA). The CSS is a committed artifact.</li>
        </ol>
      </Card>

      {/* Foundations — color */}
      <section className="space-y-3">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint">Color tokens · click to copy</h2>
        {COLOR_GROUPS.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-xs text-ink-muted">{g.label}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {g.names.map((n) => <Swatch key={n} name={n} />)}
            </div>
          </div>
        ))}
      </section>

      {/* Foundations — type + radii + density */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-ink-muted">Typography · Inter</h3>
          <div className="space-y-2.5">
            {Object.entries(typography).reverse().map(([name, t]) => (
              <div key={name} className="flex items-baseline justify-between gap-4 border-b border-line/50 pb-2 last:border-0">
                <span className="truncate text-ink" style={{ fontSize: t.fontSize, lineHeight: String(t.lineHeight) }}>
                  {name} — The quick brown fox
                </span>
                <span className="shrink-0 font-mono text-[0.625rem] text-ink-faint">{t.fontSize} / {t.lineHeight}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-medium text-ink-muted">Radii &amp; density</h3>
          <div className="space-y-3">
            {Object.entries(rounded).map(([name, v]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="h-10 w-10 border border-line bg-base-300" style={{ borderRadius: v }} />
                <div><p className="text-xs text-ink">{name}</p><p className="font-mono text-[0.625rem] text-ink-faint">{v}</p></div>
              </div>
            ))}
            <div className="mt-2 rounded-box border border-line bg-base-300/40 p-3 text-xs text-ink-muted">
              Density root: <span className="font-mono text-ink-faint">html {`{ font-size: 90% }`}</span> — the whole rem-based UI renders at 90%.
            </div>
          </div>
        </Card>
      </section>

      {/* Live components */}
      <section className="space-y-4">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint">Live components</h2>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="Live Tracks" value="128,886" subtitle="11,208 owners" icon={Music} accent="success" />
          <KpiCard title="Database Size" value="952 MB" subtitle="167 indexes" icon={Database} accent="brand" animationDelay={75} />
          <KpiCard title="Owners" value="11,208" subtitle="distinct creators" icon={Users} accent="brand" animationDelay={150} />
          <KpiCard title="Embeddings" value="8,883" subtitle="6.9% of tracks" icon={Sparkles} accent="brand" animationDelay={225} />
        </div>

        {/* controls */}
        <Card className="p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <span className="text-xs text-ink-faint">one primary action per view · hover lifts to brand-hover + glow</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Yes</Badge>
              <Badge tone="error">No</Badge>
              <Badge tone="info">Info</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="neutral">Neutral</Badge>
              <span className="text-xs text-ink-faint">badges are dark-on-color (WCAG AA)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["#3b5bdb", "#59a200", "#7e93f0"].map((c, i) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-300/40 px-2.5 py-1 text-xs text-ink-muted">
                  <span className="size-2 rounded-full" style={{ backgroundColor: c }} />{["Last active", "High-value", "Cumulative"][i]}
                </span>
              ))}
              <span className="text-xs text-ink-faint">pill chips / custom legend</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-line bg-base-200 p-0.5">
                {RANGES.map((r) => (
                  <button key={r} type="button" onClick={() => setRange(r)}
                    className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", range === r ? "bg-base-300 text-ink" : "text-ink-faint hover:text-ink-muted")}>
                    {r}
                  </button>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-200 px-3 py-1.5 text-xs text-ink-muted">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
                live pulse
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">eye hint <InfoHint text="An eye icon reveals explanatory copy on hover — keeps prose off the surface. Named-group CSS so it never fires on a parent card hover." /></span>
              <CopyButton value="hello@swayzio.com" label="copy value" />
            </div>
          </div>
        </Card>

        {/* charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-medium text-ink-muted">BarList (ranked categories)</h3>
            <BarList data={[
              { label: "events", value: 187886 },
              { label: "assets", value: 130398 },
              { label: "tracks", value: 129299 },
              { label: "pack_tracks", value: 70412 },
              { label: "packs", value: 25353 },
            ]} />
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-medium text-ink-muted">Donut (part-to-whole)</h3>
            <Donut centerLabel="Registered" data={[
              { label: "BMI", value: 579 }, { label: "ASCAP", value: 352 },
              { label: "PRS", value: 98 }, { label: "SOCAN", value: 65 }, { label: "SESAC", value: 9 },
            ]} />
          </Card>
        </div>

        {/* chart palette */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-medium text-ink-muted">Canonical chart palette</h3>
          <div className="flex flex-wrap gap-2">
            {CHART_PALETTE.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 rounded-box border border-line bg-base-200 px-2.5 py-1.5">
                <span className="size-4 rounded" style={{ backgroundColor: c }} />
                <span className="font-mono text-[0.625rem] text-ink-muted">{c}</span>
              </span>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
