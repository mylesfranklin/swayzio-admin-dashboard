"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

/** Horizontal stacked bar — e.g. table vs index size per table. */
export function StackedBar({
  categories,
  series,
  colors = ["#3b5bdb", "#9b6bdb"],
  format = (v: number) => v.toLocaleString(),
  height = 360,
}: {
  categories: string[];
  series: Array<{ name: string; data: number[] }>;
  colors?: string[];
  format?: (v: number) => string;
  height?: number;
}) {
  const options: ApexOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    colors,
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: "62%" } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    grid: { borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3 },
    xaxis: {
      categories,
      labels: { style: { colors: "#6b7280", fontSize: "11px" }, formatter: (v: string) => format(Number(v)) },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9aa0a6", fontSize: "11px" } } },
    legend: { position: "top", horizontalAlign: "right", labels: { colors: "#6b6f76" }, fontSize: "12px", markers: { strokeWidth: 0 } },
    tooltip: { y: { formatter: (v: number) => format(v) } },
  };
  return <Chart options={options} series={series} type="bar" height={height} />;
}
