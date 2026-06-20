# Radial Chart Two

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: 300,
      maxWeight: "100%",
      type: "radialBar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },

    colors: [
      "var(--color-base-content)",
      "var(--color-base-content-30)",
      "var(--color-base-content-50)",
      "var(--color-base-content-70)",
    ],

    stroke: {
      lineCap: "round",
    },
    series: [80, 70, 60, 50],

    labels: ["Free Plan", "Basic Plan", "Premium Plan", "Enterprise Plan"],

    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 350,
        track: {
          show: false,
        },
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
          image: undefined,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -15,
          fontSize: "10px",
          formatter: function (seriesName: any, opts: any) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
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
  <div
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
  >
    <div>
      <h2 class="text-md font-semibold text-base-content/50">Total Revenue</h2>
      <div class="flex items-center gap-2">
        <p class="text-base-content font-semibold text-3xl">$45,864</p>

        <div
          class="flex items-center px-2 py-1 bg-success/10 rounded-selector mt-2"
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
