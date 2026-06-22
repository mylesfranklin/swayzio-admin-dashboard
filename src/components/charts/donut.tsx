"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const PALETTE = ["#3b5bdb", "#2f80ed", "#59a200", "#f2c94c", "#eb5757", "#9b6bdb", "#6b6f76"];

/** Generic category donut (label + value). Used for PRO distribution, etc. */
export function Donut({
  data,
  centerLabel = "Total",
  colors = PALETTE,
}: {
  data: Array<{ label: string; value: number }>;
  centerLabel?: string;
  colors?: string[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif", background: "transparent" },
    labels: data.map((d) => d.label),
    colors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#6b6f76" }, fontSize: "12px", markers: { strokeWidth: 0 } },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: centerLabel,
              color: "#6b6f76",
              fontSize: "12px",
              formatter: () => total.toLocaleString(),
            },
            value: { color: "#ffffff", fontSize: "22px", fontWeight: 700 },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (v: number) => `${v.toLocaleString()} (${total ? Math.round((v / total) * 100) : 0}%)` },
    },
  };
  return <Chart options={options} series={data.map((d) => d.value)} type="donut" height={300} />;
}
