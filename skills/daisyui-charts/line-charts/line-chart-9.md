# Line Chart Nine

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "300px",
      maxWidth: "100%",
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        opacity: 0.3,
        blur: 8,
        top: 20,
      },
    },
    stroke: {
      width: 4,
      curve: "smooth",
    },
    colors: [
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 30%)",
      "var(--color-secondary)",
    ],
    series: [
      {
        name: "This Year",
        data: [
          4400, 3400, 3700, 4900, 4600, 5000, 4400, 3400, 3700, 4900, 4600,
          6000,
        ],
      },
      {
        name: "Last Year",
        data: [
          4000, 4400, 3100, 4500, 4900, 4000, 4000, 4400, 3100, 4500, 4900,
          5500,
        ],
      },
      {
        name: "Target",
        data: [
          5200, 5400, 5100, 5000, 5700, 5500, 6200, 6400, 6100, 5000, 6700,
          6500,
        ],
      },
    ],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          fontSize: "12px",
          colors: "var(--color-base-content)",
          fontWeight: 400,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
      labels: {
        formatter: function (value: number) {
          return "$" + value;
        },
      },
    },

    legend: {
      show: false,
    },

    tooltip: {
      shared: true,
      custom: function ({
        series,
        dataPointIndex,
        w,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
        w: {
          globals: { colors: string[] };
          config: { series: Array<{ name: string }> };
        };
      }) {
        const rows = w.config.series
          .map((s: { name: string }, i: number) => {
            const val = series[i][dataPointIndex];
            const color = w.globals.colors[i];
            return `
            <div class="flex items-center justify-between gap-4 py-1">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-selector" style="background-color: ${color}"></span>
                <span class="text-base-content/60 text-xs">${s.name}</span>
              </div>
              <span class="text-base-content font-semibold text-xs">$${val.toLocaleString()}</span>
            </div>
          `;
          })
          .join("");

        return `
          <div class="p-3">
            ${rows}
          </div>
        `;
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor:
        "color-mix(in srgb, var(--color-base-content), transparent 95%)",
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
```

## Wrapper Classes

```html
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```

## HTML Layout

```html
<div
  class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex justify-between items-start gap-4 mb-6">
    <div
      class="tabs tabs-box tabs-xs py-1 bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto"
    >
      <input
        type="radio"
        name="my_tabs_4"
        class="tab"
        aria-label="Basic"
        checked="checked"
      />
      <input type="radio" name="my_tabs_4" class="tab" aria-label="Premium" />
      <input
        type="radio"
        name="my_tabs_4"
        class="tab"
        aria-label="Enterprise"
      />
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-base-content"></span>
        <span class="text-xs text-base-content"
          >This Year: <span class="font-semibold">$200.26k</span></span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-base-content/70"></span>
        <span class="text-xs text-base-content"
          >Last Year: <span class="font-semibold">$140.60k</span></span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
        <span class="text-xs text-base-content"
          >Target: <span class="font-semibold">$250K</span></span
        >
      </div>
    </div>
  </div>
  <div id="chart" class="w-full"></div>
</div>
```
