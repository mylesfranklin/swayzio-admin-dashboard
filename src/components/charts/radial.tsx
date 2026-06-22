"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

/** Generic single-value radial gauge (label + %). */
export function Radial({ pct, label, color = "#3b5bdb", height = 220 }: { pct: number; label: string; color?: string; height?: number }) {
  const options: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "Inter, sans-serif", background: "transparent", sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "62%" },
        track: { background: "#1e2024" },
        dataLabels: {
          name: { show: true, color: "#6b6f76", fontSize: "12px", offsetY: 22 },
          value: { show: true, color: "#ffffff", fontSize: "26px", fontWeight: 700, offsetY: -12, formatter: (v: number) => `${Math.round(Number(v) * 10) / 10}%` },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: [label],
  };
  return <Chart options={options} series={[Math.min(100, Math.max(0, pct))]} type="radialBar" height={height} />;
}
