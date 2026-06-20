# Pie Chart Three

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "300px",
      maxWidth: "100%",
      type: "pie",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },

    colors: [
      "var(--color-base-content)",
      "var(--color-base-content-30)",
      "var(--color-base-content-50)",
    ],

    series: [45, 35, 20],
    labels: ["Basic Plan", "Premium Plan", "Enterprise Plan"],
    stroke: {
      show: true,
      colors: ["var(--color-base-200)"],
      width: 1,
    },
    plotOptions: {
      pie: {
        labels: {
          show: true,
        },
        size: "100%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      custom: function ({
        series,
        seriesIndex,
        w,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
        w: { globals: { colors: string[]; labels: string[] } };
      }) {
        const value = series[seriesIndex];
        const color = w.globals.colors[seriesIndex];

        return `
        <div class="bg-base-100 border-(length:--border) border-base-content/10 shadow-xl rounded-box p-3 text-xs font-['Outfit']">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-selector" style="background-color: ${color}"></span>
            <span class="text-base-content/70">${w.globals.labels[seriesIndex]}: <b class="text-base-content ml-1">${value}%</b></span>
          </div>
        </div>
      `;
      },
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
  <div class="flex items-start gap-7 md:gap-10 mb-6">
    <div class="flex flex-col">
      <div class="flex gap-1 items-center">
        <div class="size-2 bg-base-content rounded-selector"></div>
        <h2 class="text-xs font-semibold text-base-content/50">Basic Plan</h2>
      </div>
      <div class="flex flex-col">
        <p class="text-base-content font-semibold text-2xl">$25,864</p>
        <span class="text-xs font-semibold text-base-content/50">(45%)</span>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex gap-1 items-center">
        <div class="size-2 bg-base-content/70 rounded-selector"></div>
        <h2 class="text-xs font-semibold text-base-content/50">Premium Plan</h2>
      </div>
      <div class="flex flex-col">
        <p class="text-base-content font-semibold text-2xl">$14,258</p>
        <span class="text-xs font-semibold text-base-content/50">(35%)</span>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex gap-1 items-center">
        <div class="size-2 bg-base-content/50 rounded-selector"></div>
        <h2 class="text-xs font-semibold text-base-content/50">
          Enterprise Plan
        </h2>
      </div>
      <div class="flex flex-col">
        <p class="text-base-content font-semibold text-2xl">$5,258</p>
        <span class="text-xs font-semibold text-base-content/50">(20%)</span>
      </div>
    </div>
  </div>

  <div id="chart" class="w-full"></div>
</div>
```
