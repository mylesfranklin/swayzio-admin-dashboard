# Radial Chart Eight

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
  class="w-full h-44 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex items-stretch justify-between">
    <div class="flex flex-col justify-between flex-1">
      <div>
        <p class="text-base-content/60 text-sm font-semibold mb-2">
          Available Balance
        </p>
        <h3 class="text-3xl font-bold text-base-content leading-tight">
          $25,867
        </h3>
      </div>

      <div class="mt-2">
        <button
          class="btn btn-sm rounded-full bg-base-300 border-(length:--border) border-base-content/10"
        >
          Withdraw
          <svg class="w-3 h-3" viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M4 12h16m0 0l-6-6m6 6l-6 6"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="w-36 h-24 shrink-0">
      <div id="chart" class="w-full h-full"></div>
    </div>
  </div>
</div>
```
