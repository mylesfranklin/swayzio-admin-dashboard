"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const BRAND = "#3b5bdb";

/** Generic single-series vertical column chart (daisyui-charts "Column Two" style:
 *  vertical gradient fill, rounded column ends). */
export function ColumnChart({
  data,
  label = "Count",
  color = BRAND,
  format = (n: number) => n.toLocaleString(),
}: {
  data: Array<{ label: string; value: number }>;
  label?: string;
  color?: string;
  format?: (n: number) => string;
}) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent", animations: { enabled: true, speed: 400 } },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: { type: "vertical", colorStops: [{ offset: 0, color, opacity: 0.95 }, { offset: 100, color, opacity: 0.12 }] },
    },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: false },
    grid: { borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3 },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: { show: false },
    legend: { show: false },
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      custom: ({ series, seriesIndex, dataPointIndex }: any) =>
        `<div class="text-base-content p-3 text-xs"><div class="flex items-center gap-2">
           <span class="size-2 rounded-selector" style="background-color:${color}"></span>
           <span>${label}: <b>${format(series[seriesIndex][dataPointIndex])}</b></span>
         </div></div>`,
    },
  };
  return <Chart options={options} series={[{ name: label, data: data.map((d) => d.value) }]} type="bar" height={300} />;
}
