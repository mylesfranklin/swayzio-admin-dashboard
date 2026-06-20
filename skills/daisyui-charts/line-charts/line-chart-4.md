# Line Chart Four

## Chart Configuration

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
      dashArray: [0, 0, 5],
    },
    colors: [
      "var(--color-secondary)",
      "var(--color-base-content)",
      "color-mix(in srgb, var(--color-base-content), transparent 70%)",
    ],
    series: [
      {
        name: "Basic Plan",
        data: [
          4400, 3400, 3700, 4900, 4600, 5000, 4400, 3400, 3700, 4900, 4600,
          6000,
        ],
      },
      {
        name: "Premium Plan",
        data: [
          4000, 4400, 3100, 4500, 4900, 4000, 4000, 4400, 3100, 4500, 4900,
          5500,
        ],
      },
      {
        name: "Enterprise Plan",
        data: [
          3200, 3400, 3100, 4000, 3700, 4500, 3200, 3400, 3100, 4000, 3700,
          4500,
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

    legend: {
      show: false,
    },

    tooltip: {
      shared: true,
      custom: function ({
        series,
        dataPointIndex,
        w,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
        w: {
          globals: { colors: string[] };
          config: { series: Array<{ name: string }> };
        };
      }) {
        const rows = w.config.series
          .map((s: { name: string }, i: number) => {
            const val = series[i][dataPointIndex];
            const color = w.globals.colors[i];
            return `
            <div class="flex items-center justify-between gap-4 py-1">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-selector" style="background-color: ${color}"></span>
                <span class="text-base-content/60 text-xs">${s.name}</span>
              </div>
              <span class="text-base-content font-semibold text-xs">$${val.toLocaleString()}</span>
            </div>
          `;
          })
          .join("");

        return `
          <div class="p-3">
            ${rows}
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
```

```css
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```

## HTML Layout

```html
<div
  class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10"
>
  <div
    class="flex flex-col justify-between md:flex-row items-start gap-4 md:mb-6"
  >
    <div>
      <h2 class="text-lg font-semibold text-base-content">Total Revenue</h2>
      <div
        class="flex flex-col sm:flex-row sm:items-center mt-1 gap-2 sm:gap-3"
      >
        <div
          class="tabs tabs-box tabs-xs py-1 bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto"
        >
          <input
            type="radio"
            name="my_tabs_3"
            class="tab"
            aria-label="Weekly"
          />
          <input
            type="radio"
            name="my_tabs_3"
            class="tab"
            aria-label="Monthly"
          />
          <input
            type="radio"
            name="my_tabs_3"
            class="tab"
            aria-label="Annually"
            checked="checked"
          />
        </div>
      </div>
    </div>
    <div>
      <button
        class="btn btn-sm rounded-field bg-base-300 border-(length:--border) border-base-content/10"
      >
        View report
      </button>
      <button
        class="btn btn-sm rounded-field bg-base-300 border-(length:--border) border-base-content/10 ml-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          shape-rendering="geometricPrecision"
          image-rendering="optimizeQuality"
          fill="currentColor"
          viewBox="0 0 512 408.264"
        >
          <path
            fill-rule="nonzero"
            d="M377.763 115.7c-9.421 2.733-18.532 6.86-27.592 12.155-9.256 5.41-18.373 12.03-27.649 19.628l-19.848-22.742c16.719-15.527 33.187-26.463 49.108-33.513-13.06-22.39-31.538-38.532-52.418-48.549-21.339-10.239-45.243-14.172-68.507-11.922-23.123 2.234-45.56 10.619-64.123 25.025-21.451 16.646-37.775 41.521-44.035 74.469l-1.957 10.309-10.271 1.801c-27.993 4.909-49.283 18.792-62.859 36.776-7.186 9.518-12.228 20.161-14.969 31.19-2.728 10.979-3.193 22.398-1.243 33.524 3.291 18.767 13.592 36.737 31.669 50.382 5.467 4.129 11.376 7.709 17.885 10.482 6.214 2.645 13.017 4.61 20.559 5.685h44.24v30.245h-44.809l-1.891-.178c-11.101-1.413-20.985-4.187-29.914-7.989-8.995-3.831-16.991-8.652-24.264-14.142-24.619-18.584-38.692-43.317-43.247-69.287-2.669-15.224-2.027-30.868 1.715-45.928 3.73-15.013 10.524-29.404 20.167-42.177 16.233-21.507 40.499-38.514 71.737-46.241 9.014-35.904 28.299-63.574 53.056-82.786C171.438 13.963 199.327 3.521 228.021.748c28.551-2.76 57.973 2.109 84.338 14.758 28.096 13.479 52.661 35.696 68.986 66.814 13.827-2.2 27.043-1.52 39.421 1.501 18.862 4.603 35.492 14.61 49.211 28.159 13.361 13.192 23.994 29.797 31.217 48.001 16.813 42.377 15.208 93.979-13.362 131.996-9.3 12.37-21.252 22.449-35.572 30.468-13.811 7.735-29.886 13.593-47.949 17.786l-3.368.414h-32.329V310.4h30.711c14.499-3.496 27.298-8.213 38.167-14.3 10.795-6.045 19.621-13.397 26.238-22.199 21.843-29.066 22.745-69.341 9.463-102.816-5.697-14.358-13.998-27.37-24.362-37.604-10.007-9.882-21.907-17.127-35.154-20.36-6.655-1.624-13.721-2.248-21.143-1.705l-14.771 4.284zM182.06 330.8c-5.288-6.392-4.394-15.861 1.997-21.148 6.391-5.288 15.86-4.394 21.148 1.997l33.15 40.027.202-146.582c0-8.273 6.707-14.98 14.98-14.98 8.274 0 14.981 6.707 14.981 14.98l-.202 146.627 34.287-41.255c5.288-6.359 14.731-7.227 21.09-1.939 6.358 5.288 7.226 14.73 1.938 21.089l-60.071 72.279a15.056 15.056 0 01-2.707 2.921c-6.391 5.288-15.86 4.394-21.148-1.997L182.06 330.8z"
          />
        </svg>
        Export
      </button>
    </div>
  </div>

  <div id="chart" className="w-full"></div>
</div>
```
