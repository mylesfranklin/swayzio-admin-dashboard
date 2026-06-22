"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import type { ApexOptions } from "apexcharts";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/charts/chart";
import { InfoHint } from "@/components/ui/info-hint";
import { cn, formatNumber } from "@/lib/utils";
import type { ReacquireCandidates } from "@/server/integrations/hubspot";

const BARS = "#3b5bdb"; // monthly volume (last active)
const HIGH = "#59a200"; // high-value subset (50+ tracks)
const CUM = "#7e93f0";  // cumulative pool

const SERIES = [
  { color: BARS, label: "Last active" },
  { color: HIGH, label: "High-value (50+)" },
  { color: CUM, label: "Cumulative pool" },
];
const RANGES = [
  { label: "12M", n: 12 },
  { label: "6M", n: 6 },
  { label: "3M", n: 3 },
  { label: "1M", n: 1 },
];

export function ReacquireCard({ data }: { data: ReacquireCandidates }) {
  const [n, setN] = useState(12);

  // cumulative is computed over the FULL window, then sliced — so a filtered
  // view still shows the true accumulated pool, not a reset running total.
  let run = 0;
  const fullCum = data.byMonth.map((d) => (run += d.candidates));
  const months = data.byMonth.slice(-n);
  const cum = fullCum.slice(-n);

  // "warm" = last 90 days (3 months) of activity — the freshest candidates
  const warmStart = months[Math.max(0, months.length - 3)]?.month;
  const warmEnd = months[months.length - 1]?.month;

  const options: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent", animations: { enabled: true, speed: 450 } },
    colors: [BARS, HIGH, CUM],
    stroke: { width: [0, 2.5, 3], curve: "smooth", lineCap: "round", dashArray: [0, 0, 4] },
    fill: { type: ["gradient", "solid", "solid"], gradient: { shade: "dark", type: "vertical", opacityFrom: 0.85, opacityTo: 0.08, stops: [0, 100] } },
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 4, borderRadiusApplication: "end" } },
    markers: { size: 0, strokeColors: [HIGH, CUM], strokeWidth: 2.5, hover: { size: 5 } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: months.map((d) => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: [
      { seriesName: "Last active", labels: { style: { colors: "#6b7280", fontSize: "11px" }, formatter: (v: number) => Math.round(v).toLocaleString() } },
      { seriesName: "High-value (50+)", opposite: true, labels: { style: { colors: "#7ea33f", fontSize: "11px" }, formatter: (v: number) => Math.round(v).toLocaleString() } },
      { seriesName: "Cumulative pool", opposite: true, show: false },
    ],
    annotations:
      warmStart && warmEnd
        ? {
            xaxis: [
              {
                x: warmStart,
                x2: warmEnd,
                fillColor: HIGH,
                opacity: 0.07,
                borderColor: "transparent",
                label: { text: "Warm · 90d", orientation: "horizontal", position: "top", offsetY: -4, style: { color: "#7ea33f", background: "transparent", fontSize: "10px", fontWeight: 600 } },
              },
            ],
          }
        : undefined,
    legend: { show: false },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => Math.round(v).toLocaleString() } },
  };

  const series = [
    { name: "Last active", type: "column", data: months.map((d) => d.candidates) },
    { name: "High-value (50+)", type: "line", data: months.map((d) => d.highValue) },
    { name: "Cumulative pool", type: "line", data: cum },
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-ink-muted">Reactivation Candidates</h3>
              <InfoHint text="Artists who built a catalog but never subscribed — your warmest win-back pool. Bars are how many were last active per month; the green line is the high-value subset (50+ tracks) and the dashed line the cumulative pool." />
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatNumber(data.totalTargets)}</p>
          </div>
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-line bg-base-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setN(r.n)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                n === r.n ? "bg-base-300 text-ink" : "text-ink-faint hover:text-ink-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Chart options={options} series={series} type="line" height={320} />

      {/* custom legend pills — below the chart, flush-left with the y-axis start */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-300/40 px-2.5 py-1 text-xs text-ink-muted">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
