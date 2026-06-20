"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// ApexCharts touches `window`, so it must never render on the server.
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Thin wrapper around react-apexcharts. The surrounding classes restyle
 * ApexCharts' internal tooltip/grid DOM with daisyUI tokens (from the
 * daisyui-charts skill convention) so every chart matches the theme and
 * re-themes automatically via var(--color-*).
 */
export function Chart({
  options,
  series,
  type,
  height = "100%",
}: {
  options: ApexOptions;
  series: ApexOptions["series"];
  type: NonNullable<ApexOptions["chart"]>["type"];
  height?: number | string;
}) {
  return (
    <div
      className="
        w-full
        [&_.apexcharts-tooltip]:!rounded-box
        [&_.apexcharts-tooltip]:!border-base-content/10
        [&_.apexcharts-tooltip]:!bg-base-200
        [&_.apexcharts-tooltip]:!shadow-xl
        [&_.apexcharts-tooltip-title]:!border-base-content/10
        [&_.apexcharts-tooltip-title]:!bg-base-300
        [&_.apexcharts-svg]:outline-none
      "
    >
      <ReactApexChart options={options} series={series} type={type} height={height} />
    </div>
  );
}
