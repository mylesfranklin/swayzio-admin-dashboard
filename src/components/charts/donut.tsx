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
    legend: { show: false }, // custom pill legend below
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
  return (
    <div>
      <Chart options={options} series={data.map((d) => d.value)} type="donut" height={260} />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {data.map((d, i) => (
          <span
            key={d.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-300/40 px-2.5 py-1 text-xs text-ink-muted"
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
