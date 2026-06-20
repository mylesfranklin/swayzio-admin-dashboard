---
name: daisyui-charts
description: daisyUI examples of different types of charts using ApexCharts integration
---

# dasiyUI Charts

This document contains path to all charts, and framework-specific code for the daisyUI charts. Use this context to generate, modify charts for the user.

**IMPORTANT**: Always read the full SKILL.md file before making any decision.

## List of charts

### Mandatory chart selection workflow

Before selecting any chart, always complete this checklist in order:

1. Read the full category file from the first chart heading to the final `### path` entry.
2. Build a short candidate list that includes every chart in that category.
3. Compare user request keywords against each candidate description.
4. Pick the best chart only after the full comparison is complete.
5. State why the selected chart wins over at least one close alternative.

Hard rule: never pick a chart after reading only a partial range of a category SKILL file.

If the category file is long, continue reading in additional ranges until the last chart entry is reached.

### Path to charts

For each type of chart, read the `{chart-type}/SKILL.md` file in the respective folder, Decide which chart you want to use based on the visual description specified in the SKILL.md file, and then find the code of that chart in the provided path at `{chart-type}/{chart-name}.md`

- Column Charts: `column-charts/SKILL.md`
- Line Charts: `line-charts/SKILL.md`
- Area Charts: `area-charts/SKILL.md`
- Bar Charts: `bar-charts/SKILL.md`
- Radial Charts: `radial-charts/SKILL.md`
- Pie Charts: `pie-charts/SKILL.md`

## Framework Syntaxes

### React syntax

```typescript
import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

export default function LineChartOne() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const chartDiv = containerRef.current.querySelector("#chart");
    if (chartDiv) {
      const options = {
        CHART_OPTIONS_HERE,
      };
      const chart = new ApexCharts(chartDiv, options);
      chart.render();
      return () => chart.destroy();
    }
  }, []);
  return (
    <div ref={containerRef} className="WRAPPER_CLASSES_HERE">
      HTML_HERE
    </div>
  );
}
```


### Vue syntax

```Vue
<template>
  <div class="WRAPPER_CLASSES_HERE">HTML_HERE</div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import ApexCharts from "apexcharts";
  let chartInstance: ApexCharts | null = null;
  onMounted(() => {
    const chartDiv = document.querySelector("#chart");
    if (chartDiv) {
      const options = {
        CHART_OPTIONS_HERE,
      };
      chartInstance = new ApexCharts(chartDiv, options);
      chartInstance.render();
    }
  });
  onBeforeUnmount(() => {
    if (chartInstance) {
      try {
        chartInstance.destroy();
      } catch (e) {
        // Chart already destroyed
      }
    }
  });
</script>
```

### Svelte syntax

```svelte
<script lang="ts">
import ApexCharts from 'apexcharts';

let el: HTMLElement | null = null;
let chart: ApexCharts | null = null;

$effect(() => {
  
  if (!el) return;

  const options = {
    CHART_OPTIONS_HERE
  };
  chart = new ApexCharts(el, options);
  chart.render();

  return () => chart?.destroy();
});
</script>

<div class="WRAPPER_CLASSES_HERE">HTML_HERE</div>
```

### Vanilla JS syntax

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Line Chart One</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
</head>
<body>
  <div class="WRAPPER_CLASSES_HERE">HTML_HERE</div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const options = {
       CHART_OPTIONS_HERE
      };
      const chartDiv = document.getElementById('chart');
      if (chartDiv) {
        new ApexCharts(chartDiv, options).render();
      }
    });
  </script>
</body>
</html>
```

- CHART_OPTIONS_HERE in the code above must be replaced by the chart options of the chart.
- WRAPPER_CLASSES_HERE in the code above must be replaced by the wrapper class names of the chart
- HTML_HERE in the code above must be replaced by the HTML code of the chart. If it's JSX, use proper JSX syntax such as `className` instead of `class`.


## Real Example:
If wrapper classes is this:
```css
w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none
```
And HTML is this:
```html
<div class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 class="text-md font-semibold text-base-content/50">
              Total Revenue
            </h2>
            <div class="flex items-center gap-2">
              <p class="text-base-content font-semibold text-3xl">
                $45,864
              </p>

              <div class="flex items-center mt-auto gap-1">
                <div>
                  <span class="text-success text-xs font-semibold">
                   + 10%
                  </span>
                </div>
                <div>
                  <span class="text-base-content/80 text-xs font-medium">
                    vs Last Year
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="tabs tabs-box tabs-xs bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto hidden md:block">
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Weekly"
            />
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Monthly"
            />
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Annually"
              checked="checked"
            />
          </div>
        </div>

        <div bind:this={el} id="chart" class="w-full"></div>
      </div>
```

And chart options are these:
```javascript
  "chart": {
    "height": "300px",
    "maxWidth": "100%",
    "type": "line",
    "fontFamily": "Outfit, sans-serif",
    "toolbar": {
      "show": false
    },
    "zoom": {
      "enabled": false
    },
    "dropShadow": {
      "enabled": true,
      "opacity": 0.3,
      "blur": 8,
      "top": 20
    }
  },
  "stroke": {
    "width": 4,
    "curve": "smooth"
  },
  "series": [
    {
      "name": "Revenue",
      "data": [
        4400,
        3400,
        3700,
        4900,
        4600,
        5000,
        5500,
        4000,
        4500,
        5000,
        4000,
        5500
      ]
    }
  ],
  "xaxis": {
    "categories": [
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
      "Dec"
    ],
    "labels": {
      "style": {
        "fontSize": "12px",
        "colors": "var(--color-base-content)",
        "fontWeight": 400
      }
    },
    "axisBorder": {
      "show": false
    },
    "axisTicks": {
      "show": false
    }
  },
  "yaxis": {
    "show": false,
    "labels": {
      "formatter": function(value) {
                    return "$" + value;
                }
    }
  },
  "tooltip": {
    "enabled": true,
    "custom": function({ series, seriesIndex, dataPointIndex, w }) {
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
            }
  },
  "dataLabels": {
    "enabled": false
  },
  "grid": {
    "show": true,
    "borderColor": "color-mix(in srgb, var(--color-base-content), transparent 95%)",
    "padding": {
      "top": 10,
      "right": 0,
      "bottom": 0,
      "left": 10
    }
  },
  "colors": [
    "var(--color-base-content)"
  ],
  "fill": {
    "type": "gradient",
    "gradient": {
      "colorStops": [
        {
          "offset": 0,
          "color": "var(--color-base-content)",
          "opacity": 0
        },
        {
          "offset": 10,
          "color": "var(--color-base-content)"
        },
        {
          "offset": 90,
          "color": "var(--color-base-content)"
        },
        {
          "offset": 100,
          "color": "var(--color-base-content)",
          "opacity": 0
        }
      ]
    }
  }
```

The Svelte Code would be:
```svelte
<script lang="ts">
import ApexCharts from 'apexcharts';

let el: HTMLElement | null = null;
let chart: ApexCharts | null = null;

$effect(() => {
  
  if (!el) return;

  const options = {
  "chart": {
    "height": "300px",
    "maxWidth": "100%",
    "type": "line",
    "fontFamily": "Outfit, sans-serif",
    "toolbar": {
      "show": false
    },
    "zoom": {
      "enabled": false
    },
    "dropShadow": {
      "enabled": true,
      "opacity": 0.3,
      "blur": 8,
      "top": 20
    }
  },
  "stroke": {
    "width": 4,
    "curve": "smooth"
  },
  "series": [
    {
      "name": "Revenue",
      "data": [
        4400,
        3400,
        3700,
        4900,
        4600,
        5000,
        5500,
        4000,
        4500,
        5000,
        4000,
        5500
      ]
    }
  ],
  "xaxis": {
    "categories": [
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
      "Dec"
    ],
    "labels": {
      "style": {
        "fontSize": "12px",
        "colors": "var(--color-base-content)",
        "fontWeight": 400
      }
    },
    "axisBorder": {
      "show": false
    },
    "axisTicks": {
      "show": false
    }
  },
  "yaxis": {
    "show": false,
    "labels": {
      "formatter": function(value) {
                    return "$" + value;
                }
    }
  },
  "tooltip": {
    "enabled": true,
    "custom": function({ series, seriesIndex, dataPointIndex, w }) {
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
            }
  },
  "dataLabels": {
    "enabled": false
  },
  "grid": {
    "show": true,
    "borderColor": "color-mix(in srgb, var(--color-base-content), transparent 95%)",
    "padding": {
      "top": 10,
      "right": 0,
      "bottom": 0,
      "left": 10
    }
  },
  "colors": [
    "var(--color-base-content)"
  ],
  "fill": {
    "type": "gradient",
    "gradient": {
      "colorStops": [
        {
          "offset": 0,
          "color": "var(--color-base-content)",
          "opacity": 0
        },
        {
          "offset": 10,
          "color": "var(--color-base-content)"
        },
        {
          "offset": 90,
          "color": "var(--color-base-content)"
        },
        {
          "offset": 100,
          "color": "var(--color-base-content)",
          "opacity": 0
        }
      ]
    }
  }
};
  chart = new ApexCharts(el, options);
  chart.render();

  return () => chart?.destroy();
});
</script>

<div class="w-full [&_.apexcharts-xaxistooltip]:bg-base-200! [&_.apexcharts-xaxistooltip]:text-base-content! [&_.apexcharts-xaxistooltip]:border-none! [&_.apexcharts-xaxistooltip]:rounded-field! [&_.apexcharts-xaxistooltip]:shadow-lg! [&_.apexcharts-xaxistooltip-bottom:before]:border-b-base-200! [&_.apexcharts-xaxistooltip-bottom:after]:border-b-base-200! [&_.apexcharts-tooltip]:bg-base-200! [&_.apexcharts-tooltip]:border-base-content/5! [&_.apexcharts-tooltip]:shadow-xl! [&_.apexcharts-tooltip]:rounded-box! [&_.apexcharts-tooltip-xaxes]:bg-base-primary! [&_.apexcharts-svg]:outline-none">
  
      <div class="w-full h-120 bg-base-200/80 rounded-box p-7 md:p-10 border-(length:--border) border-base-content/10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 class="text-md font-semibold text-base-content/50">
              Total Revenue
            </h2>
            <div class="flex items-center gap-2">
              <p class="text-base-content font-semibold text-3xl">
                $45,864
              </p>

              <div class="flex items-center mt-auto gap-1">
                <div>
                  <span class="text-success text-xs font-semibold">
                   + 10%
                  </span>
                </div>
                <div>
                  <span class="text-base-content/80 text-xs font-medium">
                    vs Last Year
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="tabs tabs-box tabs-xs bg-base-300/80 border-(length:--border) border-base-content/10 mb-auto hidden md:block">
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Weekly"
            />
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Monthly"
            />
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Annually"
              checked="checked"
            />
          </div>
        </div>

        <div bind:this={el} id="chart" class="w-full"></div>
      </div>
    
</div>
```

