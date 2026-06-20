# Column Charts

## Column Chart One
### Description

12-Month Annual Revenue Column Chart - Full layout with time period filter tabs

Visual Appearance:

- Vertical bar chart displaying 12 months of revenue data
- Single series with 12 vertical columns (one per month)
- Column color: var(--color-base-content) - theme adaptive
- Column width: 55% of available space
- Border radius: 5px on top ends only (borderRadiusApplication: "end")
- Stroke: 2px transparent borders separating columns
- X-axis visible: All 12 months labeled (Jan through Dec)
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden from view
- Grid visible with subtle borders (95% transparent)
- Interactive tooltip on hover with formatted currency

Layout Structure:

- Full layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-lg, font-medium, base-content/50)
    - Metric display (flex items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
- Bottom section: Full-width vertical column chart
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Column color: var(--color-base-content) - theme adaptive
- Column stroke: 2px transparent (creates subtle separation)
- Border radius: 5px on top
- X-axis text: base-content, 0.5 opacity, text-xs
- X-axis border/ticks: color-mix 90% transparent
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching column color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive layout (tabs hidden on mobile)

Use Cases:

- Annual revenue tracking
- 12-month performance dashboard
- Financial performance review
- Full-year revenue analysis
- Executive dashboard metrics

### path
column-chart-1.md


## Column Chart Two
### Description

6-Month Revenue Column Chart with Gradient Fill - Card layout

Visual Appearance:

- Vertical bar chart displaying 6 months of revenue data
- Single series with 6 vertical columns
- Gradient fill: Vertical gradient from full opacity (top) to transparent (bottom)
  - Color start: var(--color-base-content) - solid at top
  - Color end: var(--color-base-content) with 0 opacity - transparent at bottom
  - Creates fading effect from top to bottom
- Column width: 55% of available space
- Border radius: 5px on top ends
- No stroke borders (show: false) - clean appearance
- X-axis visible: 6 months labeled (Jan through Jun)
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive tooltip on hover

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
- Bottom section: Full-width vertical column chart with gradient
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Column gradient: var(--color-base-content) → transparent
- Gradient direction: Vertical (top to bottom)
- Gradient stops: 0% opacity=1, 90% opacity=0
- No column stroke
- Border radius: 5px top
- X-axis text: base-content, 0.5 opacity, text-xs
- X-axis border/ticks: color-mix 90% transparent
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Custom tooltip on hover showing revenue and value
- Gradient fill creates visual depth
- Clean, minimal appearance without borders
- Responsive design

Use Cases:

- 6-month revenue trend
- Quarter performance tracking
- Gradient aesthetic visualization
- Modern dashboard metrics
- Mid-year review charts

### path
column-chart-2.md


## Column Chart Three
### Description

6-Month Dual Plan Comparison Column Chart - Card layout with legend

Visual Appearance:

- Vertical bar chart comparing two subscription plans across 6 months
- Two series displayed side-by-side (grouped columns)
- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent (lighter)
- Column width: 55% of available space
- Border radius: 5px on top ends
- Stroke: 2px transparent borders separating columns
- X-axis visible: 6 months labeled
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive tooltip showing plan name and value

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side: Legend (vertical flex, gap-2)
    - "Basic plan" legend item:
      - Color dot: size-2, bg-base-content (solid dark)
      - Label: "Basic plan" (text-base-content, text-xs)
    - "Premium plan" legend item:
      - Color dot: size-2, bg-base-content/50 (semi-transparent)
      - Label: "Premium plan" (text-base-content, text-xs)
- Bottom section: Full-width grouped column chart
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content)
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Column stroke: 2px transparent
- Border radius: 5px top
- X-axis text: base-content, 0.5 opacity, text-xs
- X-axis border/ticks: color-mix 90% transparent
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Legend dots: Match series colors

Interactive Features:

- Custom tooltip on hover showing plan name and value
- Visual legend with color-matched indicators
- Grouped columns for easy comparison
- Growth indicator badge
- Responsive layout (responsive flex direction on mobile)

Use Cases:

- Plan comparison across months
- Basic vs Premium performance
- Subscription tier comparison
- Plan distribution analysis
- Comparative metrics dashboard

### path
column-chart-3.md


## Column Chart Four
### Description

6-Month Dual Plan Comparison Column Chart - Card layout with action button and bottom legend

Visual Appearance:

- Vertical bar chart comparing two subscription plans across 6 months
- Two series displayed side-by-side (grouped columns)
- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent (lighter)
- Column width: 55% of available space
- Border radius: 5px on top ends
- Stroke: 2px transparent borders
- X-axis visible: 6 months labeled (Jan through Jun)
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive tooltip showing plan name and value

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side: Action button
    - Button: "View report" (DaisyUI btn btn-sm, bg-base-300, rounded-field, border-base-content/10)
- Middle section: Full-width grouped column chart
- Bottom section: Legend indicators (flex items-center justify-center space-x-4)
  - Two legend items:
    - "Basic plan": size-2 dot (bg-base-content), label (text-base-content, text-xs)
    - "Premium plan": size-2 dot (bg-base-content/50), label (text-base-content, text-xs)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content)
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Column stroke: 2px transparent
- Border radius: 5px top
- X-axis text: base-content, 0.5 opacity, text-xs
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Custom tooltip showing plan name and value
- "View report" action button for drill-down
- Visual legend at bottom with color indicators
- Growth badge
- Responsive layout

Use Cases:

- Plan comparison with action access
- Dual stream revenue tracking
- Basic vs Premium performance
- Comparative metrics with CTA

### path
column-chart-4.md


## Column Chart Five
### Description

6-Month Stacked Dual Plan Revenue Column Chart - Card layout with period filter tabs

Visual Appearance:

- Vertical stacked bar chart displaying 6 months of stacked plan revenue
- Two series stacked vertically on each column
- Series 1 (Basic Plan - bottom): var(--color-base-content) - full opacity
- Series 2 (Premium Plan - top): color-mix base-content 50% transparent
- Column width: 55% of available space
- Border radius: 5px on top ends only
- Stroke: 2px transparent borders
- Stacked configuration: Each column shows total (Basic + Premium) with stacked segments
- X-axis visible: 6 months labeled
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive tooltip showing each series value separately

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side (hidden on mobile, md:block): Period filter tabs
    - Tab buttons: Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-sm
    - Background: bg-base-200/80 (subtle, no shadow)
    - Border: none
    - Font: text-xs
    - Responsive: Hidden on mobile, visible on md screens
- Bottom section: Full-width stacked column chart
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - bottom/base color
- Series 2 (Premium Plan): color-mix base-content 50% transparent - top/overlay color
- Column stroke: 2px transparent
- Border radius: 5px top
- X-axis text: base-content, 0.5 opacity, text-xs
- X-axis border/ticks: color-mix 90% transparent
- Grid color: color-mix 95% transparent
- Tab styling: bg-base-200/80, no shadow or border
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Custom tooltip on hover showing plan name and individual value
- Stacked visualization showing total and breakdown
- Period filter tabs (Monthly/Annually) for temporal comparison
- Growth indicator badge
- Responsive layout (tabs hidden on mobile)

Use Cases:

- Stacked plan revenue tracking
- Total revenue with plan breakdown
- Multi-plan dashboard with period filtering
- Subscription revenue distribution
- Plan tier performance analysis

### path
column-chart-5.md


## Column Chart Six
### Description

12-Month Triple Plan Comparison Column Chart - Full layout with top metric display

Visual Appearance:

- Vertical bar chart comparing three subscription plans across 12 months
- Three series displayed side-by-side (grouped columns)
- Series 1 (Basic Plan - 12 months): var(--color-secondary) - secondary color
- Series 2 (Premium Plan): var(--color-base-content) - full opacity
- Series 3 (Enterprise Plan): color-mix base-content 50% transparent
- Column width: 55% of available space
- Border radius: 5px on top ends
- Stroke: 2px transparent borders
- X-axis visible: All 12 months labeled
- X-axis border and ticks visible
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive tooltip showing plan name and value

Layout Structure:

- Full layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with items-start (flex items-start gap-7 md:gap-10, mb-6)
  - Three columns of plan metrics:
    - Column 1 - Basic Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-secondary
        - Label: "Basic Plan" (text-xs, font-semibold, base-content/50)
      - Metrics (flex flex-col):
        - Value: "$25,864" (text-2xl, font-semibold, base-content)
        - Growth: "+ 14.5%" (text-success, text-xs, font-semibold)
    - Column 2 - Premium Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content/70
        - Label: "Premium Plan" (text-xs, font-semibold, base-content/50)
      - Metrics (flex flex-col):
        - Value: "$14,258" (text-2xl, font-semibold, base-content)
        - Growth: "+ 14.5%" (text-success, text-xs, font-semibold)
    - Column 3 - Enterprise Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content/50
        - Label: "Enterprise Plan" (text-xs, font-semibold, base-content/50)
      - Metrics (flex flex-col):
        - Value: "$5,258" (text-2xl, font-semibold, base-content)
        - Growth: "+ 5.4%" (text-success, text-xs, font-semibold)
    - Gap between columns: 28px-40px (gap-7 md:gap-10)
- Bottom section: Full-width grouped column chart

Colors & Styling:

- Series 1 (Basic Plan): var(--color-secondary)
- Series 2 (Premium Plan): var(--color-base-content)
- Series 3 (Enterprise Plan): color-mix base-content 50% transparent
- Column stroke: 2px transparent
- Border radius: 5px top
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Custom tooltip showing plan name and value
- Top metric displays for all three plans with growth
- Color-coded indicators matching plan colors
- Responsive spacing (responsive gap sizing)

Use Cases:

- Full-year three-tier plan comparison
- Annual subscription tier analysis
- Enterprise revenue tracking
- Multi-plan performance dashboard
- Plan tier distribution visualization

### path
column-chart-6.md


## Column Chart Seven
### Description

6-Month Single Plan Column Chart with Progress Bars - Card layout with plan filter buttons

Visual Appearance:

- Vertical bar chart displaying 6 months of single plan revenue
- Single series with 6 vertical columns
- Column color: var(--color-base-content) - theme adaptive
- Background progress bars visible: Each column has a light background bar
- Background bar color: color-mix base-content 90% transparent (very light)
- Column width: 25% of available space (narrow columns)
- Border radius: 4px all around (borderRadiusApplication: "around")
- Stroke: 2px transparent borders
- X-axis visible: 6 months labeled
- X-axis border and ticks visible with 90% transparency
- Y-axis hidden
- Grid visible with 95% transparent borders
- Progress bar aesthetic showing partial completion

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side: Plan filter buttons
    - Form with reset and radio buttons
    - Reset button: btn btn-sm, bg-base-300, btn-square, rounded-field
    - Radio 1: btn btn-sm, bg-base-300, rounded-field, aria-label="Basic"
    - Radio 2: btn btn-sm, bg-base-300, rounded-field, aria-label="Premium"
- Bottom section: Chart with progress bar styling

Colors & Styling:

- Column color: var(--color-base-content)
- Background bar color: color-mix 90% transparent (very light background)
- Column stroke: 2px transparent
- Border radius: 4px all around
- Column width: 25% (narrow for comparison)
- X-axis text: base-content, 0.5 opacity, text-xs
- Grid color: color-mix 95% transparent
- Button styling: bg-base-300, border-base-content/10
- Card background: base-200/80

Interactive Features:

- Progress bar visualization with background reference
- Plan filter buttons (Basic/Premium + reset)
- Custom tooltip on hover
- Growth badge indicator
- Interactive button filters

Use Cases:

- Goal vs actual progress tracking
- Plan selection with comparison
- Performance against benchmark
- Progress indicator visualization
- Interactive plan filtering

### path
column-chart-7.md


## Column Chart Eight
### Description

6-Month Range Bar Chart (Dumbbell Style) - Card layout

Visual Appearance:

- Range bar chart (dumbbell/range visualization)
- Shows min-max range for each month
- Single series with 6 range indicators (one per month)
- Dumbbell style: Vertical bars with dots at top and bottom
- Bar color: var(--color-base-content) with gradient fill
- Gradient: Vertical transition from full opacity (top) to transparent (bottom)
- Column width: 7px (very thin - just the connecting line)
- Border radius: Not specified
- Stroke: 2px transparent
- X-axis visible: Month labels with 90% transparency
- X-axis border and ticks visible
- Y-axis hidden
- Grid visible with 95% transparent borders
- Shows revenue range from minimum to maximum per month

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
- Bottom section: Full-width range bar chart

Colors & Styling:

- Bar color: var(--color-base-content)
- Gradient: Vertical (top to bottom)
- Gradient opacity: 1 to 0
- Dumbbell colors: var(--color-base-content) (both ends)
- Column width: 7px (minimal width showing range only)
- X-axis text: base-content, 0.5 opacity, text-xs
- X-axis border/ticks visible
- Grid color: color-mix 95% transparent
- Card background: base-200/80

Interactive Features:

- Custom tooltip showing range values
- Gradient fill for visual depth
- Growth badge
- Range indicator for min-max visualization

Use Cases:

- Min-max revenue range tracking
- Volatility visualization
- Budget range tracking
- Target vs actual ranges

### path
column-chart-8.md


## Column Chart Nine
### Description

6-Month Single Plan Column Chart (Compact Sparkline) - Compact layout, minimal labels

Visual Appearance:

- Vertical bar chart displaying 6 months of single plan revenue
- Single series with 6 vertical columns
- Column color: var(--color-base-content) - theme adaptive
- Column width: 80% of available space (wide columns)
- Border radius: 2px (minimal rounding)
- Stroke: 2px transparent borders
- Minimal design: No axis labels/borders/ticks visible
- X-axis categories hidden (no month labels shown)
- X-axis border and ticks hidden
- Y-axis hidden
- Grid hidden (show: false) - clean appearance
- Very compact, data-heavy visualization
- Interactive tooltip on hover

Layout Structure:

- Compact layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 288px (h-72)
- Top section (header): Horizontal flex with items-start alignment
  - Left side (flex flex-col gap-1):
    - Label: "Total Revenue" (text-sm, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$14,543" (text-2xl, font-bold, base-content)
      - Growth: "+10.54%" (text-success, font-semibold, text-xs, mt-2)
- Chart area: Full-width with minimal spacing

Colors & Styling:

- Column color: var(--color-base-content)
- Column stroke: 2px transparent
- Border radius: 2px
- Column width: 80% (wide, fills space)
- No grid, no axes visible
- Card background: base-200/80
- Border: base-content/10
- Text colors: base-content/50 (label), base-content (value), text-success (growth)

Interactive Features:

- Custom tooltip on hover showing value
- Minimal, clean design - focus on data
- Growth indicator badge
- Compact size ideal for widgets

Use Cases:

- Dashboard widget/sparkline
- Mobile dashboard
- Sidebar metrics
- KPI tracking card

### path
column-chart-9.md


## Column Chart Ten
### Description

6-Month Stacked Dual Plan Column Chart (Compact) - Compact layout, stacked columns

Visual Appearance:

- Vertical stacked bar chart displaying 6 months of stacked plan revenue
- Two series stacked vertically on each column
- Series 1 (Basic Plan - bottom): var(--color-base-content)
- Series 2 (Premium Plan - top): color-mix base-content 50% transparent
- Column width: 80% of available space
- Border radius: 2px
- Stroke: 2px transparent borders
- Minimal design: No axis labels/borders/ticks visible
- X-axis categories hidden
- X-axis border and ticks hidden
- Y-axis hidden
- Grid hidden (show: false)
- Compact stacked visualization

Layout Structure:

- Compact layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 288px (h-72)
- Top section (header): Horizontal flex with items-start
  - Left side (flex flex-col gap-1):
    - Label: "Total Revenue" (text-sm, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$14,543" (text-2xl, font-bold, base-content)
      - Growth: "+10.54%" (text-success, font-semibold, text-xs, mt-2)
- Chart area: Full-width stacked columns

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content)
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Column stroke: 2px transparent
- Border radius: 2px
- Column width: 80%
- No grid, axes hidden
- Card background: base-200/80

Interactive Features:

- Custom tooltip showing each series value
- Stacked visualization showing total and breakdown
- Growth badge
- Compact, minimal design

Use Cases:

- Compact stacked revenue widget
- Dual plan compact dashboard
- Quick stacked metrics view
- Mobile dashboard compact card

### path
column-chart-10.md


## Column Chart Eleven
### Description

6-Month Single Plan Column Chart with Progress Bars (Compact) - Compact layout with action button

Visual Appearance:

- Vertical bar chart displaying 6 months of single plan revenue
- Single series with 6 vertical columns
- Column color: var(--color-base-content)
- Background bar color: color-mix base-content 90% transparent
- Column width: 50% of available space
- Border radius: 4px all around
- Stroke: 2px transparent borders
- Minimal design: No axis labels/borders/ticks visible
- X-axis categories hidden
- X-axis border and ticks hidden
- Y-axis hidden
- Grid hidden (show: false)
- Progress bar with reference background

Layout Structure:

- Compact layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 288px (h-72)
- Top section (header): Horizontal flex with space-between
  - Left side (flex flex-col gap-1):
    - Label: "Total Revenue" (text-sm, font-semibold, base-content/50)
    - Metric display (flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2):
      - Value: "$14,543" (text-2xl, font-bold, base-content)
      - Growth: "+10.54%" (text-success, font-semibold, text-xs)
  - Right side: Action button
    - Button: "View Report" (DaisyUI btn btn-xs, mt-3)
- Chart area: Full-width with progress bars

Colors & Styling:

- Column color: var(--color-base-content)
- Background bar color: color-mix 90% transparent
- Column stroke: 2px transparent
- Border radius: 4px all
- Column width: 50%
- No grid, axes hidden
- Card background: base-200/80

Interactive Features:

- Progress bar visualization
- "View Report" action button for drill-down
- Custom tooltip on hover
- Growth badge
- Actionable compact widget

Use Cases:

- Compact dashboard with action CTA
- Progress tracking widget
- Performance with report access

### path
column-chart-11.md


## Column Chart Twelve
### Description

12-Month Hybrid Column + Line Chart - Full layout with period filter dropdown

Visual Appearance:

- Hybrid chart: Combines column bars and line chart
- Type: Mixed (line chart base with column override for series 1)
- Series 1 (Basic Plan): Column bars (vertical bars)
  - Color: var(--color-base-content)
  - Column width: 55%
  - Border radius: 5px on top ends
- Series 2 (Premium Plan): Line chart overlay
  - Color: color-mix base-content 50% transparent
  - Line stroke: 4px width with smooth curve
  - Markers visible: 5px size with hover effect (7px)
  - Marker colors: var(--color-base-100)
  - Marker stroke colors: var(--color-base-100)
- X-axis visible: All 12 months labeled
- X-axis border and ticks visible
- Y-axis hidden
- Grid visible with 95% transparent borders
- Interactive shared tooltip showing both series

Layout Structure:

- Full layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between
  - Left side:
    - Label: "Total Revenue" (text-lg, font-medium, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
  - Right side (hidden on mobile, md:flex): Period filter dropdown
    - Select element: select-sm, w-40
    - Background: bg-base-300, shadow-2xl
    - Border: border-base-content/10
    - Font: font-semibold
    - Options: "Last 12 months" (selected), "Last 6 months", "Last 3 months"
- Bottom section: Full-width hybrid column + line chart

Colors & Styling:

- Series 1 (Columns): var(--color-base-content)
- Series 2 (Line): color-mix base-content 50% transparent
- Column stroke: 2px (transparent), width: 0
- Line stroke: 4px, curve: smooth
- Border radius (columns): 5px top
- Markers: 5px (7px on hover), var(--color-base-100)
- X-axis text: base-content, 0.5 opacity, text-xs
- Grid color: color-mix 95% transparent
- Dropdown styling: bg-base-300, shadow-2xl
- Card background: base-200/80

Interactive Features:

- Shared tooltip on hover showing both series values
- Period filter dropdown (Last 12mo/6mo/3mo) for temporal comparison
- Line markers show individual points with hover effect
- Growth indicator badge
- Responsive layout (dropdown hidden on mobile)

Use Cases:

- Hybrid revenue comparison
- Column + trend line visualization
- Plan distribution with trend overlay
- Comparative metrics dashboard
- Executive dashboard hybrid metrics

### path
column-chart-12.md

