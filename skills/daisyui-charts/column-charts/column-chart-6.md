# Column Chart Six

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript

chart: {
      height: "300px",
      maxWidth: "100%",
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    series: [
      {
        name: "Basic Plan",
        data: [
          5500, 6400, 7600, 5900, 5800, 7600, 7000, 6400, 7200, 8000, 8200,
          8500,
        ],
      },
      {
        name: "Premium Plan",
        data: [
          3500, 3200, 3400, 4000, 4300, 4300, 4000, 5200, 5500, 4500, 5200,
          5800,
        ],
      },
      {
        name: "Enterprise Plan",
        data: [
          3200, 3700, 2700, 3100, 4500, 4100, 5000, 4500, 4000, 4900, 4500,
          4900,
        ],
      },
    ],

    colors: [
      "var(--color-secondary)",
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 50%)",
    ],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
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
    fill: {
      opacity: 1,
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
        w: any;
      }) {
        const value = series[seriesIndex][dataPointIndex];
        const color = w.globals.colors[seriesIndex];

        const seriesName = w.config.series[seriesIndex].name;

        return `
      <div class="text-base-content p-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-selector" style="background-color: ${color}"></span>
          <span>${seriesName}: <b>$${value.toLocaleString()}</b></span>
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

<div class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10">
        <div class="flex items-start gap-7 md:gap-10 mb-6">
          <div class="flex flex-col">
            <div class="flex gap-1 items-center" >
            <div class="size-2 bg-secondary rounded-selector"></div>
            <h2 class="text-xs font-semibold text-base-content/50">Basic Plan</h2>
            </div>
            <div class="flex flex-col">
              <p class="text-base-content font-semibold text-2xl">$25,864</p>

              <div class="flex">
                <span class="text-success text-xs font-semibold">+</span>
                <span class="text-success text-xs font-semibold">14.5%</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="flex gap-1 items-center" >
            <div class="size-2 bg-base-content/70 rounded-selector"></div>
            <h2 class="text-xs font-semibold text-base-content/50">Premium Plan</h2>
            </div>
            <div class="flex flex-col">
              <p class="text-base-content font-semibold text-2xl">$14,258</p>

              <div class="flex items-center">
                <span class="text-success text-xs font-semibold">+</span>
                <span class="text-success text-xs font-semibold">14.5%</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="flex gap-1 items-center" >
            <div class="size-2 bg-base-content/50 rounded-selector"></div>
            <h2 class="text-xs font-semibold text-base-content/50">Enterprise Plan</h2>
            </div>
            <div class="flex flex-col">
              <p class="text-base-content font-semibold text-2xl">$5,258</p>

              <div class="flex items-center">
                <span class="text-success text-xs font-semibold">+</span>
                <span class="text-success text-xs font-semibold">5.4%</span>
              </div>
            </div>
          </div>

        </div>
        <div id="chart" class="w-full"></div>

      </div>

    </div>

```
