# Area Chart Six

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "300px",
      maxWidth: "100%",
      type: "area",
      dropShadow: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Outfit, sans-serif",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0,
        shade: "var(--color-base-content)",
        gradientToColors: ["var(--color-base-content)"],
      },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "right",
      fontWeight: 500,
      labels: {
        colors: "var(--color-base-content)",
      },
      markers: {
        strokeWidth: 0,
      },
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
    },
    colors: [
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 50%)",
    ],
    series: [
      {
        name: "This Year",
        data: [5500, 5200, 5400, 5500, 5800, 6200],
      },
      {
        name: "Last Year",
        data: [4100, 4000, 4400, 4300, 4500, 5000],
      },
    ],

    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: {
        show: true,
        style: {
          fontSize: "12px",
          fontWeight: 400,
          colors: "var(--color-base-content)",
        },
      },

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      show: false,
      labels: {
        formatter: function (value: number) {
          return "$" + value;
        },

        style: {
          colors: "var(--color-base-content)",
          fontSize: "12px",
          fontWeight: 400,
        },
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
  class="w-full h-120 bg-base-200/80 rounded-box p-10 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex flex-col mb-6">
    <div class="flex items-center gap-2">
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div
        class="bg-success/10 flex items-center text-xs font-semibold text-success text-center px-2.5 py-0.5 rounded-selector"
      >
        +10.5%
      </div>
    </div>

    <div class="flex gap-4 mt-3">
      <div class="flex flex-col">
        <span class="text-lg font-semibold mt-0.5">$35,442 </span>
        <div class="flex items-center gap-1">
          <div class="size-2 bg-base-content rounded-selector"></div>
          <p class="text-base-content/80 text-xs">This Year</p>
        </div>
      </div>

      <div class="flex flex-col">
        <span class="text-lg font-semibold mt-0.5">$25,252 </span>
        <div class="flex items-center gap-1">
          <div class="size-2 bg-base-content/50 rounded-selector"></div>
          <p class="text-base-content/80 text-xs">Last Year</p>
        </div>
      </div>
    </div>

    <div id="chart" class="w-full"></div>
  </div>
</div>
```
