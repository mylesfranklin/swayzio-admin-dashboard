# Radial Chart Six

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "400px",
      maxWidth: "100%",
      type: "radialBar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },

    series: [70],

    stroke: {
      dashArray: 7,
    },

    colors: ["var(--color-base-content)"],

    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "50%",
        },
        track: {
          show: false,
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: "16px",
            fontWeight: 500,
            color: "var(--color-base-content-50)",
            offsetY: 5,
          },
          value: {
            show: true,
            fontSize: "42px",
            fontWeight: 700,
            color: "var(--color-base-content)",
            offsetY: -35,
            formatter: function (val: number) {
              return "250";
            },
          },
        },
      },
    },
    labels: ["Sales"],
```

## Wrapper Classes

```html
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```

## HTML Layout

```html
<div
  class="w-full h-100 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
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

    <select
      class="select select-sm w-36 mb-auto rounded-field bg-base-300 shadow-2xl border-base-content/10 outline-none focus:ring-0 focus:border-none "
    >
      <option selected>Last 12 months</option>
      <option>Last 6 months</option>
      <option>Last 3 months</option>
    </select>
  </div>

  <div id="chart" class="w-full"></div
</div>
```
