"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const BRAND = "#3b5bdb";

/** Generic single-series area trend (label + value), daisyUI-styled. */
export function AreaTrend({
  data,
  label = "Value",
  color = BRAND,
  format = (n: number) => n.toLocaleString(),
}: {
  data: Array<{ label: string; value: number }>;
  label?: string;
  color?: string;
  format?: (n: number) => string;
}) {
  const options: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "Inter, sans-serif", background: "transparent", animations: { enabled: true, speed: 400 } },
    colors: [color],
    fill: { type: "gradient", gradient: { opacityFrom: 0.5, opacityTo: 0, shade: color, gradientToColors: [color], stops: [0, 95] } },
    dataLabels: { enabled: false },
    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },
    markers: { size: 0, colors: ["#101012"], strokeColors: color, strokeWidth: 2.5, hover: { size: 6 } },
    grid: { show: true, borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: { categories: data.map((d) => d.label), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    yaxis: { show: false },
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      custom: ({ series, seriesIndex, dataPointIndex }: any) =>
        `<div class="text-base-content p-3 text-xs"><div class="flex items-center gap-2">
           <span class="size-2 rounded-selector" style="background-color:${color}"></span>
           <span>${label}: <b>${format(series[seriesIndex][dataPointIndex])}</b></span>
         </div></div>`,
    },
  };
  return <Chart options={options} series={[{ name: label, data: data.map((d) => d.value) }]} type="area" height={300} />;
}
