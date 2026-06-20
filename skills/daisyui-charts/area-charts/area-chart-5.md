# Area Chart Five

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
        name: "Basic Plan",
        data: [5500, 5200, 4000, -500, -1000, -1500],
      },
      {
        name: "Premium Plan",
        data: [4900, 5000, 4000, 3200, 4000, 5800],
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
  class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex gap-2 items-start mt-1">
        <p class="text-base-content font-semibold text-3xl">$25,823</p>
        <div class="flex items-center mt-auto gap-1 mb-1">
          <span class="text-success text-sm font-semibold">+14.5%</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <div class="size-2 bg-base-content rounded-selector"></div>
        <p class="text-base-content text-xs">Basic plan</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="size-2 bg-base-content/50 rounded-selector"></div>
        <p class="text-base-content text-xs">Premium plan</p>
      </div>
    </div>
  </div>

  <div id="chart" class="w-full"></div>
</div>
```
