# Area Chart Seven

To know how this chart looks like visually, first read the visual description of this chart from ./SKILL.md

## Chart Options

```javascript
   chart: {
      height: "100%",
      width: "100%",
      type: "area",
      dropShadow: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Outfit, sans-serif",
    },
    tooltip: {
      enabled: false,
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
      show: false,
    },
    colors: ["var(--color-base-content)"],
    series: [
      {
        name: "Revenue",
        data: [4000, 4500, 4300, 4400, 4900, 5000],
      },
    ],
    xaxis: {
      show: false,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
      labels: { show: false },
    },
```

## Wrapper Classes

```html
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```

## HTML Layout

```html
<div
  class="w-full bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div class="flex items-stretch justify-between">
    <div class="flex flex-col justify-between flex-1">
      <div>
        <p class="text-base-content/60 text-sm font-semibold mb-2">
          Total Revenue
        </p>
        <h3 class="text-3xl font-bold text-base-content leading-tight">
          $25,867
        </h3>
      </div>

      <div class="flex items-center w-fit text-success">
        <svg
          class="w-3.5 h-3.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M12 6v13m0-13 4 4m-4-4-4 4"
          />
        </svg>
        <span class=" text-sm font-semibold">14.5%</span>
      </div>
    </div>
    <div class="w-36 h-24 shrink-0">
      <div id="chart" class="w-full h-full"></div>
    </div>
  </div>
</div>
```
