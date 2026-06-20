# Area Chart Nine

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "300px",
      maxWidth: "100%",
      type: "area",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      area: { stacked: true },
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
    stroke: {
      curve: "monotoneCubic",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        gradientToColors: "transparent",
      },
    },
    colors: [
      "var(--color-secondary)",
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 50%)",
    ],
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "center",
    },
    series: [
      {
        name: "Basic Plan",
        data: [
          4000, 3400, 4100, 3200, 3700, 4000, 5000, 5500, 5000, 5800, 6200,
          6400,
        ],
      },
      {
        name: "Premium Plan",
        data: [
          3500, 3200, 3400, 4000, 4300, 4300, 4000, 5200, 5500, 4500, 5200,
          5800,
        ],
      },
      {
        name: "Enterprise Plan",
        data: [
          2200, 2700, 1700, 2100, 3500, 3100, 2000, 3500, 3000, 3900, 3500,
          3900,
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
          fontWeight: 400,
          colors: "var(--color-base-content)",
        },
      },

      axisBorder: {
        show: false,
        color: "color-mix(in srgb, var(--color-base-content), transparent 90%)",
      },

      axisTicks: {
        show: false,
        color: "color-mix(in srgb, var(--color-base-content), transparent 90%)",
      },
    },
    yaxis: {
      show: false,
      labels: {
        formatter: function (value: number) {
          return "$" + value;
        },
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor:
        "color-mix(in srgb, var(--color-base-content), transparent 95%)",
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
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-md font-medium text-base-content/50">Total Revenue</h2>
      <div class="flex gap-2 items-start mt-1">
        <p class="text-base-content font-semibold text-3xl">$45,864</p>

        <div class="flex mt-auto gap-2">
          <span class="text-success text-sm font-semibold"> +14.5% </span>

          <p class="text-base-content/50 text-sm font-semibold">vs Last Year</p>
        </div>
      </div>
    </div>

    <div class="hidden items-center space-x-4 md:block">
      <select
        class="select select-sm w-28 mb-auto rounded-field bg-base-300 shadow-2xl border-base-content/10 outline-none focus:ring-0 focus:border-none "
      >
        <option selected>Revenue</option>
        <option>Sales</option>
      </select>

      <select
        class="select select-sm w-36 mb-auto rounded-field bg-base-300 shadow-2xl border-base-content/10 outline-none focus:ring-0 focus:border-none "
      >
        <option selected>Last 12 months</option>
        <option>Last 6 months</option>
        <option>Last 3 months</option>
      </select>
    </div>
  </div>

  <div id="chart" class="w-full"></div>
</div>
```
