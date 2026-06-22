"use client";

import { useEffect, useState } from "react";
import { Database, Table2, Layers, Users, Music, Sparkles } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { BarList } from "@/components/charts/bar-list";
import { Donut } from "@/components/charts/donut";
import { AreaTrend } from "@/components/charts/area-trend";
import { Treemap } from "@/components/charts/treemap";
import { StackedBar } from "@/components/charts/stacked-bar";
import { Radial } from "@/components/charts/radial";
import { SchemaHub } from "@/components/database/schema-hub";
import { TableExplorer } from "@/components/database/table-explorer";
import { formatNumber, formatBytes } from "@/lib/utils";
import type { DbStats, MonthlyIngest } from "@/server/integrations/app-db-stats";

function useAgo(iso: string | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export function DatabaseClient({
  stats,
  ingestion,
  error,
}: {
  stats: DbStats | null;
  ingestion: MonthlyIngest[] | null;
  error: string | null;
}) {
  const ago = useAgo(stats?.overview.latestWrite ?? null);

  if (error || !stats) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load database stats{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const o = stats.overview;
  const byRows = [...stats.tables].sort((a, b) => b.rows - a.rows);
  const bySize = stats.tables; // already sorted by total bytes desc
  const topSize = bySize.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Neon Data Lake</h1>
          <p className="mt-1 text-sm text-ink-muted">Swayzio-Core database · live introspection (read-only)</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-base-200 px-3 py-1.5 text-xs text-ink-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          live · last write {ago}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Database Size" value={o.dbSize} subtitle={`${o.indexes} indexes`} icon={Database} accent="brand" />
        <KpiCard title="Tables" value={formatNumber(o.tables)} subtitle={`${o.foreignKeys} foreign keys`} icon={Table2} accent="brand" animationDelay={60} />
        <KpiCard title="Total Rows" value={formatNumber(o.totalRows)} subtitle="across all tables" icon={Layers} accent="brand" animationDelay={120} />
        <KpiCard title="Live Tracks" value={formatNumber(o.liveTracks)} subtitle={`${formatNumber(o.events)} events`} icon={Music} accent="success" animationDelay={180} />
        <KpiCard title="Owners" value={formatNumber(o.owners)} subtitle="distinct creators" icon={Users} accent="brand" animationDelay={240} />
        <KpiCard title="Vector Embeddings" value={formatNumber(o.embeddings)} subtitle={`${stats.pipeline.embeddingCoveragePct}% of tracks`} icon={Sparkles} accent="brand" animationDelay={300} />
      </div>

      {/* tech badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-line bg-base-300/40 px-2.5 py-1 text-ink-muted">PostgreSQL {o.pgVersion}</span>
        {o.extensions.map((e) => (
          <span key={e} className="rounded-full border border-line bg-base-300/40 px-2.5 py-1 text-ink-muted">{e}</span>
        ))}
      </div>

      {/* storage treemap */}
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-medium text-ink-muted">Storage Footprint</h3>
        <p className="mb-3 text-xs text-ink-faint">{o.dbSize} across {o.tables} tables · sized by total relation size</p>
        <Treemap data={bySize.slice(0, 18).map((t) => ({ x: t.name, y: t.totalBytes }))} format={formatBytes} />
      </Card>

      {/* rows by table + table/index split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-ink-muted">Rows by Table (top 12)</h3>
          <BarList data={byRows.slice(0, 12).map((t) => ({ label: t.name, value: t.rows }))} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-medium text-ink-muted">Table vs Index Size (top 10)</h3>
          <StackedBar
            categories={topSize.map((t) => t.name)}
            series={[
              { name: "Table", data: topSize.map((t) => t.tableBytes) },
              { name: "Index", data: topSize.map((t) => t.indexBytes) },
            ]}
            format={formatBytes}
          />
        </Card>
      </div>

      {/* domain donut + schema hub */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Data by Domain</h3>
          <p className="mb-2 text-xs text-ink-faint">rows grouped across {stats.domains.length} product domains</p>
          <Donut data={stats.domains.map((d) => ({ label: d.domain, value: d.rows }))} centerLabel="Rows" />
        </Card>
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-medium text-ink-muted">Schema Gravity</h3>
          <p className="mb-2 text-xs text-ink-faint">most-referenced tables (foreign-key in-degree) · {o.foreignKeys} FKs total</p>
          <SchemaHub nodes={stats.schemaHub} />
        </Card>
      </div>

      {/* catalog ingestion */}
      <Card className="p-5">
        <h3 className="text-sm font-medium text-ink-muted">Catalog Ingestion</h3>
        <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatNumber(o.liveTracks)}</p>
        <p className="mb-4 text-xs text-ink-faint">tracks created per month · last 18 months</p>
        {ingestion && <AreaTrend data={ingestion.map((m) => ({ label: m.month, value: m.tracks }))} label="Tracks" />}
      </Card>

      {/* pipeline health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Processing Jobs</h3>
          <Donut data={stats.pipeline.processingJobs.map((s) => ({ label: s.status, value: s.n }))} centerLabel="Jobs" />
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Ingestion Runs</h3>
          <Donut data={stats.pipeline.ingestionRuns.map((s) => ({ label: s.status, value: s.n }))} centerLabel="Runs" />
        </Card>
        <Card className="flex flex-col p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Audio Embedding Coverage</h3>
          <Radial pct={stats.pipeline.embeddingCoveragePct} label="Embedded" color="#9b6bdb" />
          <p className="mt-2 text-center text-xs text-ink-faint">{formatNumber(o.embeddings)} of {formatNumber(o.liveTracks)} tracks (pgvector)</p>
        </Card>
      </div>

      {/* table explorer */}
      <TableExplorer tables={stats.tables} />
    </div>
  );
}
