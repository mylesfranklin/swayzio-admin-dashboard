# Column Chart Twelve

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
    },
    series: [
      {
        name: "Basic Plan",
        type: "column",
        data: [
          5500, 6400, 7600, 5900, 5800, 7600, 7000, 6400, 7200, 8000, 8200,
          8500,
        ],
      },
      {
        name: "Premium Plan",
        type: "line",
        data: [
          3500, 3200, 3400, 4000, 4300, 4300, 4000, 5200, 5500, 4500, 5200,
          5800,
        ],
      },
    ],

    colors: [
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 50%)",
    ],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [0, 4],
      curve: "smooth",
    },

    markers: {
      size: 5,
      hover: { size: 7 },
      colors: "var(--color-base-100)",
      strokeColors: "var(--color-base-100)",
    },

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
          colors: "var(--color-base-content)",
          opacity: 0.5,
          fontSize: "12px",
        },
      },

      axisBorder: {
        show: true,
        color: "color-mix(in srgb, var(--color-base-content), transparent 90%)",
      },

      axisTicks: {
        show: true,
        color: "color-mix(in srgb, var(--color-base-content), transparent 90%)",
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
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

    grid: {
      borderColor:
        "color-mix(in srgb, var(--color-base-content), transparent 95%)",
    },

    legend: {
      show: false,
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
    <div class="flex flex-col">
      <h2 class="text-lg font-medium text-base-content/50">Total Revenue</h2>
      <div class="flex items-center gap-2">
        <p class="text-base-content font-semibold text-3xl">$25,864</p>

        <div
          class="flex items-center w-fit px-2 py-1 bg-success/10 rounded-selector"
        >
          <span class="text-success text-xs font-semibold">+</span>
          <span class="text-success text-xs font-semibold">14.5%</span>
        </div>
      </div>
    </div>
    <select
      class="select select-sm w-40 mb-auto hidden md:flex font-semibold rounded-field bg-base-300 shadow-2xl border-base-content/10 outline-none focus:ring-0 focus:border-none "
    >
      <option selected>Last 12 months</option>
      <option>Last 6 months</option>
      <option>Last 3 months</option>
    </select>
  </div>
  <div id="chart" class="w-full"></div>
</div>
```
