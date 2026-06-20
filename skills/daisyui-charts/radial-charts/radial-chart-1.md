# Radial Chart One

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
      "var(--color-secondary)",
    ],

    series: [40, 20, 20, 20],
    labels: ["Free Plan", "Basic Plan", "Premium Plan", "Enterprise Plan"],
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
  <div
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
  >
    <div>
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex items-center gap-2">
        <p class="text-base-content font-semibold text-3xl">$45,864</p>

        <div class="flex items-center bg-success/10 px-2 py-1 rounded-selector">
          <span class="text-success text-xs font-semibold"> + 10% </span>
        </div>
      </div>
    </div>

    <div
      class="tabs tabs-box tabs-xs bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto hidden md:block"
    >
      <input type="radio" name="my_tabs_2" class="tab" aria-label="Weekly" />
      <input type="radio" name="my_tabs_2" class="tab" aria-label="Monthly" />
      <input
        type="radio"
        name="my_tabs_2"
        class="tab"
        aria-label="Annually"
        checked="checked"
      />
    </div>
  </div>

  <div id="chart" class="w-full"></div>
</div>
```
