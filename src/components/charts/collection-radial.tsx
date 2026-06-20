"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

/**
 * Collection-rate radial gauge: collected last full month ÷ MRR run-rate.
 * Color flips to red below 50% — surfaces the gap the old dashboard hid.
 */
export function CollectionRadial({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#59a200" : pct >= 50 ? "#f2c94c" : "#eb5757";
  const options: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "Inter, sans-serif", background: "transparent", sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "64%" },
        track: { background: "#1e2024" },
        dataLabels: {
          name: { show: true, color: "#6b6f76", fontSize: "12px", offsetY: 22 },
          value: { show: true, color: "#ffffff", fontSize: "30px", fontWeight: 700, offsetY: -16, formatter: (v: number) => `${Math.round(v)}%` },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Collection rate"],
  };
  return <Chart options={options} series={[Math.min(100, Math.max(0, pct))]} type="radialBar" height={240} />;
}
