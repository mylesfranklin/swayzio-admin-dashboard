# Line Chart Three

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
      "color-mix(in srgb, var(--color-base-content), transparent 50%)",
    ],
    series: [
      {
        name: "Basic Plan",
        data: [4400, 3400, 3700, 4900, 4600, 5000],
      },
      {
        name: "Premium Plan",
        data: [4000, 4400, 3100, 4500, 4900, 4000],
      },
    ],
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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

```css
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```

## HTML Layout

```html
<div
  class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex justify-between items-start gap-4">
    <div class="flex flex-col">
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <p class="text-base-content font-semibold text-3xl">$25,864</p>

        <div
          class="flex items-center w-fit px-2 py-1 bg-success/10 rounded-selector"
        >
          <span class="text-success text-xs font-semibold">+</span>
          <span class="text-success text-xs font-semibold">14.5%</span>
        </div>
      </div>
    </div>
    <div>
      <button
        class="btn btn-sm bg-base-300 rounded-field border-(length:--border) border-base-content/10"
      >
        View report
      </button>
    </div>
  </div>
  <div id="chart" class="w-full"></div>

  <div class="flex items-center gap-4">
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
```
