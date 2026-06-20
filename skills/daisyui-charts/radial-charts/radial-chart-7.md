# Radial Chart Seven

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

    series: [75],

    stroke: {
      lineCap: "round",
    },
    colors: ["var(--color-base-content)"],

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 1,
        opacityTo: 0,
        gradientToColors: ["var(--color-base-content)"],
      },
    },

    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "50%",
        },
        track: {
          background: "var(--color-base-content-20)",
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: "8px",
            fontWeight: 500,
            color: "var(--color-base-content-50)",
            offsetY: 5,
          },
          value: {
            show: true,
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--color-base-content)",
            offsetY: -22,
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
