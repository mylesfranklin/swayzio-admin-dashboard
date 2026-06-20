# Line Chart Five

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
            offset: 10,
            color: "var(--color-base-content)",
          },
          {
            offset: 90,
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
        <div class="flex items-center mt-auto gap-1">
          <div>
            <span class="text-success text-xs font-semibold"> + 10% </span>
          </div>
          <div>
            <span class="text-base-content/80 text-xs font-medium">
              vs Last Year
            </span>
          </div>
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
