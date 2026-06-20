# Column Chart Eight

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript

chart: {
      height: "300px",
      maxWidth: "100%",
      type: "rangeBar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    series: [
      {
        name: "Revenue",
        data: [
          { x: "Jan", y: [2500, 4000] },
          { x: "Feb", y: [2200, 3400] },
          { x: "Mar", y: [2800, 4100] },
          { x: "Apr", y: [2100, 3200] },
          { x: "May", y: [2600, 3700] },
          { x: "Jun", y: [2900, 4000] },
        ],
      },
    ],

    colors: ["var(--color-base-content)"],

    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        colorStops: [
          {
            offset: 0,
            color: "var(--color-base-content)",
          },
          {
            offset: 100,
            color: "var(--color-base-content)",
            opacity: 0,
          },
        ],
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        isDumbbell: true,
        dumbbellColors: [
          ["var(--color-base-content)", "var(--color-base-content)"],
        ],
        columnWidth: 7,
      },
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
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
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex items-center gap-2 sm:gap-3">
        <p class="text-base-content font-semibold text-3xl">$25,864</p>

        <div
          class="flex items-center w-fit px-2 py-1 bg-success/10 rounded-selector"
        >
          <span class="text-success text-xs font-semibold">+</span>
          <span class="text-success text-xs font-semibold">14.5%</span>
        </div>
      </div>
    </div>
  </div>
  <div id="chart" class="w-full"></div>
</div>
```
