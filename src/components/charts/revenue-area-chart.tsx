"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const BRAND = "#3b5bdb";

/**
 * Collected-revenue area chart — adapted from the daisyui-charts "Area Chart One"
 * pattern (gradient fill, smooth curve, hidden y-axis, custom daisyUI tooltip).
 * Shows REAL money collected per month (not reconstructed MRR).
 */
export function RevenueAreaChart({
  data,
  label = "Collected",
}: {
  data: Array<{ month: string; revenue: number }>;
  label?: string;
}) {
  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
      dropShadow: { enabled: false },
      background: "transparent",
      animations: { enabled: true, speed: 400 },
    },
    colors: [BRAND],
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.5, opacityTo: 0, shade: BRAND, gradientToColors: [BRAND], stops: [0, 95] },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },
    markers: {
      size: 0,
      colors: ["#101012"],
      strokeColors: BRAND,
      strokeWidth: 2.5,
      hover: { size: 6 },
    },
    grid: { show: true, borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: data.map((d) => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: { show: false },
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      custom: ({ series, seriesIndex, dataPointIndex }: any) =>
        `<div class="text-base-content p-3 text-xs"><div class="flex items-center gap-2">
           <span class="size-2 rounded-selector" style="background-color:${BRAND}"></span>
           <span>${label}: <b>$${series[seriesIndex][dataPointIndex].toLocaleString()}</b></span>
         </div></div>`,
    },
  };
  return <Chart options={options} series={[{ name: label, data: data.map((d) => d.revenue) }]} type="area" height={300} />;
}
