# Line Chart Two

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
      colors: ["var(--color-base-content)"],
    },
    series: [
      {
        name: "Revenue",
        data: [4400, 3400, 3700, 4900, 4600, 5000],
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
    tooltip: {
      enabled: true,
      custom: function ({
        series,
        seriesIndex,
        dataPointIndex,
        w,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
        w: { globals: { colors: string[] } };
      }) {
        const value = series[seriesIndex][dataPointIndex];
        const color = w.globals.colors[seriesIndex];

        return `
        <div class="text-base-content p-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-selector" style="background-color: ${color}"></span>
            <span>Revenue: <b>$${value.toLocaleString()}</b></span>
          </div>
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
    colors: ["var(--color-base-content)"],
    fill: {
      type: "gradient",
      gradient: {
        colorStops: [
          {
            offset: 0,
            color: "var(--color-base-content)",
            opacity: 0,
          },
          {
            offset: 50,
            color: "var(--color-base-content)",
          },
        ],
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
  <div class="flex flex-col justify-between items-start gap-4 mb-6">
    <div class="flex flex-col">
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex items-center gap-2">
        <p class="text-base-content font-semibold text-3xl mt-1">$25,864</p>
        <div class="flex sm:items-center gap-2 sm:gap-3">
          <div
            class="flex items-center px-2 py-1 bg-success/10 rounded-selector mt-2"
          >
            <span class="text-success text-xs font-semibold">+</span>
            <span class="text-success text-xs font-semibold">14.5%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="chart" class="w-full"></div>
</div>
```
