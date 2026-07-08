"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const PALETTE = ["#3b5bdb", "#2f80ed", "#59a200", "#f2c94c", "#eb5757", "#9b6bdb"];

export function ComboTrendChart({
  categories,
  series,
  height = 320,
  format = (v: number) => v.toLocaleString(),
}: {
  categories: string[];
  series: Array<{ name: string; type: "area" | "column" | "line"; data: number[] }>;
  height?: number;
  format?: (v: number) => string;
}) {
  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      animations: { enabled: true, speed: 400 },
    },
    colors: PALETTE,
    dataLabels: { enabled: false },
    stroke: {
      width: series.map((s) => (s.type === "column" ? 0 : 2.5)),
      curve: "smooth",
      lineCap: "round",
    },
    fill: {
      type: series.map((s) => (s.type === "column" ? "gradient" : "gradient")),
      gradient: { opacityFrom: 0.55, opacityTo: 0.05, stops: [0, 95] },
    },
    plotOptions: {
      bar: { columnWidth: "54%", borderRadius: 5, borderRadiusApplication: "end" },
    },
    markers: { size: 0, hover: { size: 5 } },
    grid: { borderColor: "rgba(255,255,255,0.06)", strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "11px" } },
    },
    yaxis: { show: false },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#6b6f76" },
      fontSize: "12px",
      markers: { strokeWidth: 0 },
    },
    tooltip: { y: { formatter: (v: number) => format(v) } },
  };

  return <Chart options={options} series={series} type="line" height={height} />;
}
