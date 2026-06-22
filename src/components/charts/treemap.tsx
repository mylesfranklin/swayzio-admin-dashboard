"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const PALETTE = ["#3b5bdb", "#2f80ed", "#59a200", "#f2c94c", "#eb5757", "#9b6bdb", "#5570ec", "#2f9e8f", "#6b6f76"];

/** Treemap (ApexCharts) — sized rectangles. Used for table storage footprint. */
export function Treemap({
  data,
  format = (v: number) => v.toLocaleString(),
  height = 360,
}: {
  data: Array<{ x: string; y: number }>;
  format?: (v: number) => string;
  height?: number;
}) {
  const options: ApexOptions = {
    chart: { type: "treemap", toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    legend: { show: false },
    colors: PALETTE,
    plotOptions: { treemap: { distributed: true, enableShades: false } },
    dataLabels: {
      enabled: true,
      style: { fontSize: "12px", fontFamily: "Inter, sans-serif", fontWeight: 600 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: ((text: string, op: any) => [text, format(op.value)]) as any,
      offsetY: -2,
    },
    stroke: { width: 2, colors: ["#101012"] },
    tooltip: { y: { formatter: (v: number) => format(v) } },
  };
  return <Chart options={options} series={[{ data }]} type="treemap" height={height} />;
}
