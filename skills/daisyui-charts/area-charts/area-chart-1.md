# Area Chart One

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
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "var(--color-base-content)",
        gradientToColors: ["var(--color-base-content)"],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: "smooth" },
    grid: {
      show: true,
      borderColor:
        "color-mix(in srgb, var(--color-base-content), transparent 95%)",
    },
    colors: ["var(--color-base-content)"],
    series: [
      {
        name: "Revenue",
        data: [
          4400, 3400, 3700, 4900, 4600, 5000, 5500, 4000, 4500, 5000, 4000,
          5500,
        ],
      },
    ],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "var(--color-base-content)",
          fontSize: "12px",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      show: false,
      labels: {
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
      <h2 class="text-lg font-medium text-base-content/50">Total Revenue</h2>
      <div class="flex gap-2">
        <p class="text-base-content font-semibold text-3xl mt-1">$45,864</p>
        <div class="flex items-center mt-auto gap-1 mb-1">
          <span class="text-success text-sm font-semibold">+14.5%</span>
        </div>
      </div>
    </div>
    <div
      class="tabs tabs-box tabs-xs bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto hidden md:block"
    >
      <input type="radio" name="my_tabs_1" class="tab" aria-label="Weekly" />
      <input type="radio" name="my_tabs_1" class="tab" aria-label="Monthly" />
      <input
        type="radio"
        name="my_tabs_1"
        class="tab"
        aria-label="Annually"
        checked="checked"
      />
    </div>
  </div>

  <div id="chart" class="w-full"></div>
</div>
```
