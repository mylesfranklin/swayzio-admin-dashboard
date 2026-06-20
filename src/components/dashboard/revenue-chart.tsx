"use client";

import type { ApexOptions } from "apexcharts";
import { DollarSign, Users } from "lucide-react";
import { Chart } from "@/components/charts/chart";
import { formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/lib/fixtures/dashboard";

const BRAND = "#3b5bdb"; // deep-blue MRR line
const GREEN = "#10b981"; // subscribers line

export function RevenueChart({
  data,
  totalRevenue,
  mrr,
  subscribers,
}: {
  data: DashboardData["revenueSubscriberData"];
  totalRevenue: number;
  mrr: number;
  subscribers: number;
}) {
  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      animations: { enabled: true, speed: 400 },
    },
    theme: { mode: "dark" },
    colors: [BRAND, GREEN],
    stroke: { width: [2, 2], curve: "smooth" },
    fill: {
      type: ["gradient", "solid"],
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 95] },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(255,255,255,0.06)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories: data.map((d) => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "11px" } },
    },
    yaxis: [
      {
        seriesName: "MRR",
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (v: number) => `$${Math.round(v / 1000)}k`,
        },
      },
      {
        seriesName: "Subscribers",
        opposite: true,
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (v: number) => Math.round(v).toLocaleString(),
        },
      },
    ],
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (v: number, opts?: { seriesIndex: number }) =>
          opts?.seriesIndex === 0 ? formatCurrency(v) : v.toLocaleString(),
      },
    },
  };

  const series = [
    { name: "MRR", type: "area", data: data.map((d) => d.mrr) },
    { name: "Subscribers", type: "line", data: data.map((d) => d.subscribers) },
  ];

  return (
    <div className="w-full rounded-box border border-line bg-base-200">
      <div className="flex items-center justify-between border-b border-line p-4">
        <h3 className="text-sm font-medium text-ink">Revenue &amp; Subscriber Growth</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="text-ink-muted">MRR</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
            <span className="text-ink-muted">Subscribers</span>
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="h-72">
          <Chart options={options} series={series} type="line" height="100%" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <SummaryTile
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign className="h-3 w-3 text-ink-faint" />}
          />
          <SummaryTile
            label="MRR"
            value={formatCurrency(mrr)}
            icon={<span className="h-1.5 w-1.5 rounded-full bg-brand" />}
          />
          <SummaryTile
            label="Subscribers"
            value={subscribers.toLocaleString()}
            icon={<Users className="h-3 w-3" style={{ color: GREEN }} />}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-base-300/50 p-3">
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
      </div>
      <p className="text-base font-semibold text-ink">{value}</p>
    </div>
  );
}
