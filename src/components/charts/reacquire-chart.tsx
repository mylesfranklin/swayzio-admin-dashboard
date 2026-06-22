"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const BARS = "#3b5bdb"; // monthly volume
const HIGH = "#59a200"; // high-value subset (green)
const CUM = "#7e93f0";  // cumulative pool (lighter blue)

/**
 * Reacquire candidates — line + volume combo (daisyUI-styled, dual-axis):
 *  - column "volume": candidates by last-activity month (recency)
 *  - line: high-value (50+ tracks) candidates per month (left axis)
 *  - line: cumulative pool over the window (right axis)
 */
export function ReacquireChart({
  data,
}: {
  data: Array<{ month: string; candidates: number; highValue: number }>;
}) {
  let run = 0;
  const cumulative = data.map((d) => (run += d.candidates));

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
      categories: data.map((d) => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: [
      { seriesName: "Last active", labels: { style: { colors: "#6b7280", fontSize: "11px" }, formatter: (v: number) => Math.round(v).toLocaleString() } },
      { seriesName: "Last active", show: false },
      { opposite: true, seriesName: "Cumulative pool", labels: { style: { colors: "#6b7280", fontSize: "11px" }, formatter: (v: number) => Math.round(v).toLocaleString() } },
    ],
    legend: { show: true, position: "top", horizontalAlign: "right", labels: { colors: "#6b6f76" }, fontSize: "12px", markers: { strokeWidth: 0 } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => Math.round(v).toLocaleString() } },
  };

  const series = [
    { name: "Last active", type: "column", data: data.map((d) => d.candidates) },
    { name: "High-value (50+)", type: "line", data: data.map((d) => d.highValue) },
    { name: "Cumulative pool", type: "line", data: cumulative },
  ];

  return <Chart options={options} series={series} type="line" height={320} />;
}
