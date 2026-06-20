"use client";

import type { ApexOptions } from "apexcharts";
import { Chart } from "./chart";

const COLORS: Record<string, string> = {
  active: "#59a200",    // success
  past_due: "#eb5757",  // error — the crisis
  paused: "#f2c94c",    // warning
  trialing: "#3b5bdb",  // brand
  unpaid: "#eb5757",
  incomplete: "#6b6f76",
};

/** Subscriptions-by-status donut — makes the past_due share impossible to miss. */
export function StatusDonut({ byStatus }: { byStatus: Record<string, number> }) {
  const entries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([k]) => k.replace(/_/g, " "));
  const series = entries.map(([, v]) => v);
  const colors = entries.map(([k]) => COLORS[k] ?? "#6b6f76");
  const total = series.reduce((s, v) => s + v, 0);

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif", background: "transparent" },
    labels,
    colors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      labels: { colors: "#6b6f76" },
      fontSize: "12px",
      markers: { strokeWidth: 0 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total subs",
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y: { formatter: (v: number) => `${v.toLocaleString()} (${Math.round((v / total) * 100)}%)` },
    },
  };
  return <Chart options={options} series={series} type="donut" height={300} />;
}
