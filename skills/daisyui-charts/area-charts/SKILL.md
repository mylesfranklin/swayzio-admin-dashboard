# Area Charts

## Area Chart One
### Description

Annual Revenue Trend Area Chart - Full width dashboard card with time period filters

Visual Appearance:

- Full-width area chart displaying 12 months of revenue data
- Smooth curved line connecting monthly data points
- Gradient fill below the line: opaque at top (55% opacity), fading to transparent at bottom
- Fill color: var(--color-base-content) adapting to light/dark theme
- Line stroke: 2px width with smooth curve interpolation
- Visible grid with subtle horizontal lines (color-mix 95% transparency)
- X-axis shows all 12 months (Jan through Dec) with labels
- Y-axis hidden from view for clean appearance
- No drop shadow or toolbar effects
- Interactive tooltip on hover showing formatted currency values

Layout Structure:

- Vertical flex container with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex, responsive direction
  - Left side: Metric information
    - Label: "Total Revenue" (text-lg, base-content/50, font-medium)
    - Value: "$45,864" (text-3xl, font-semibold, base-content)
    - Growth indicator: "+14.5%" (text-success green color, text-sm, font-semibold)
  - Right side: Time period filter tabs (hidden on mobile, visible md:block)
    - Three tab buttons: "Weekly", "Monthly", "Annually"
    - "Annually" tab is pre-selected (checked)
    - Background: base-300/80 with subtle border
    - Tab styling: tabs-box, tabs-xs classes for compact appearance
- Bottom section: Full width chart container
- Gap between header and chart: 24px (mb-6)

Colors & Styling:

- Area fill gradient: var(--color-base-content) at top → transparent at bottom
- Fill opacity: 55% to 0% (smooth fade)
- Line color: var(--color-base-content) - theme adaptive
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted gray)
  - Value: base-content (prominent, full opacity)
  - Growth indicator: text-success (green for positive)
  - X-axis labels: base-content with 12px font size
- Font family: Outfit throughout
- Chart height: 300px

Data Series:

- Series Name: "Revenue"
- Data Points: 12 monthly values
- Values: [4400, 3400, 3700, 4900, 4600, 5000, 5500, 4000, 4500, 5000, 4000, 5500]
- Range: $3,400 to $5,500
- Categories: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
- Represents: Monthly revenue trend across a full year

Interactive Features:

- Custom tooltip on hover:
  - Shows colored indicator dot matching line color
  - Displays: "Revenue: $[value]" with thousand separators ($5,500 format)
  - Styled with DaisyUI: text-base-content, p-3, text-xs
  - Background color adapts to theme
  - Positioned near cursor on data point
- Tab switching for time period selection (Weekly, Monthly, Annually)
  - UI prepared with three tab options
  - Default selection: "Annually" (for 12-month view)
  - Clicking tabs ready for filtering data (logic to be implemented)
- Responsive visibility: Tabs hidden on mobile, visible on desktop

Use Cases:

- Main dashboard chart showing annual revenue performance
- Executive overview of yearly trends
- Revenue analysis and forecasting
- Financial performance review
- Annual business metrics display

### path
area-chart-1.md


## Area Chart Two
### Description

6-Month Revenue Trend Area Chart - Card layout with growth comparison indicator

Visual Appearance:

- Full-width area chart displaying 6 months of revenue data (Jan to Jun)
- Single filled area under smooth curve line
- Area fill: Gradient fill with opacity transition (opacityFrom: 0.55 → opacityTo: 0)
- Gradient colors: var(--color-base-content) - theme adaptive
- Line stroke: 2px width with smooth curve interpolation
- Grid visible with subtle borders (color-mix 95% transparent)
- X-axis: Shows all 6 months labeled (Jan, Feb, Mar, Apr, May, Jun) with 12px labels
- Y-axis: Hidden from view for clean appearance
- No drop shadow, no toolbar, no zoom effects
- Interactive tooltip on hover with colored indicator dot and formatted currency

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Value: "$18,864" (text-3xl, font-semibold, base-content, mt-1)
  - Right side:
    - Growth metric display (vertical flex, ml-auto)
    - Upward arrow icon + percentage: "18%" (text-md, font-semibold, text-success green color)
    - Arrow icon: SVG with green stroke (w-4 h-4, stroke-width 3)
    - Subtitle: "vs Last 6 months" (text-base-content/50, text-sm, font-semibold)
    - Layout: Icon and percentage on one line, subtitle below
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Area fill color: var(--color-base-content) - adapts to theme
- Gradient fill: Smooth transition from 0.55 opacity → 0 (transparent at bottom)
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted gray)
  - Value: base-content (prominent)
  - Growth: text-success (green for positive trend)
- Arrow icon: Green (matches success color)

Interactive Features:

- Tooltip on hover showing:
  - Colored indicator dot (size-2) matching area color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI classes (text-base-content, p-3, text-xs)
- Growth comparison display (non-interactive indicator)
- Responsive design

Use Cases:

- 6-month performance dashboard
- Revenue trend analysis card
- Quarterly performance metrics
- Sales dashboard widget with growth comparison
- Mid-year performance review
- Compact metric card for executive dashboard

### path
area-chart-2.md


## Area Chart Three
### Description

6-Month Dual Plan Revenue Comparison Area Chart - Card layout with legend

Visual Appearance:

- Stacked area chart displaying 6 months of dual revenue streams
- Two overlapping filled areas under smooth curves
- Top area: "Basic Plan" with full color (var(--color-base-content))
- Bottom area: "Premium Plan" with semi-transparent color (base-content/50 opacity)
- Area fills: Gradient with opacity transition (opacityFrom: 0.45 → opacityTo: 0)
- Line strokes: 2px width with smooth curve interpolation
- Grid visible with subtle borders (color-mix 95% transparent)
- X-axis: Shows all 6 months labeled (Jan through Jun) with 12px labels
- Y-axis: Hidden from view
- No drop shadow, no toolbar, no zoom effects
- Interactive tooltip showing both series values simultaneously (shared tooltip)

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex gap-2, items-start, mt-1):
      - Value: "$25,823" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (text-success, text-sm, font-semibold, green color)
      - Badge styling: Flex items with gap-1, mt-auto, mb-1
  - Right side: Legend (vertical flex, gap-2)
    - "Basic plan" legend item:
      - Color dot: size-2, bg-base-content (solid dark)
      - Label: "Basic plan" (text-base-content, text-xs)
    - "Premium plan" legend item:
      - Color dot: size-2, bg-base-content/50 (semi-transparent gray)
      - Label: "Premium plan" (text-base-content, text-xs)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix (base-content with 50% transparency)
- Gradient fill: Smooth transition from 0.45 opacity → 0
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Values: base-content (prominent)
  - Growth: text-success (green)
- Legend dots: Match series colors

Interactive Features:

- Shared tooltip on hover:
  - Shows both series values simultaneously
  - Displays: "Basic Plan: $[value]" and "Premium Plan: $[value]"
  - Color-coded with dots matching area colors
  - Formatted with thousand separators
  - Styled with DaisyUI (p-3, text-xs)
- Visual legend to distinguish plans
- Responsive design

Use Cases:

- Dual plan revenue comparison
- Business tier performance dashboard
- 6-month subscription plan analysis
- SaaS revenue breakdown by plan type
- Comparative metrics dashboard
- Plan migration tracking

### path
area-chart-3.md


## Area Chart Four
### Description

12-Month Three-Plan Stacked Revenue Chart - Full layout with dropdown filter and legend

Visual Appearance:

- Stacked area chart displaying 12 months of stacked revenue from three subscription plans
- Three overlapping filled areas creating stacked visualization
- Areas stack on top of each other showing total and individual contributions
- Area fills: Gradient with opacity transition (opacityFrom: 0.55 → opacityTo: 0, transparent)
- Line strokes:
  - Series 1-2: 2px solid width
  - Series 3: 2px dashed (dashArray: [0, 0, 5]) - Enterprise Plan shown as dashed line
- Stroke curve: monotoneCubic (smooth cubic spline)
- Grid visible with subtle borders (color-mix 95% transparent)
- X-axis: Shows all 12 months labeled (Jan through Dec) with 12px labels
- Y-axis: Hidden from view
- No toolbar, no zoom effects
- Interactive tooltip showing all three series values simultaneously (shared)

Layout Structure:

- Full layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex gap-2, items-start, mt-1):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (text-success, text-sm, font-semibold, green)
  - Middle side (hidden on mobile, md:flex): Legend - 3 plan indicators
    - Three badge-style legend items in horizontal row (gap-2)
    - Each legend item: Flex, gap-1, px-4 py-1, rounded-field
    - Background: base-200/50 with base-content/10 border
    - Content:
      - Color dot: size-2, rounded-selector
      - Label: text-base-content, text-xs
    - Legend 1: "Basic plan" - Secondary color dot (bg-secondary)
    - Legend 2: "Premium plan" - Dark color dot (bg-base-content/70)
    - Legend 3: "Enterprise plan" - Semi-transparent dot (bg-base-content/50)
  - Right side (mb-auto): Dropdown filter
    - Select element: select-sm, w-36, rounded-field
    - Background: bg-base-300, shadow-2xl
    - Border: border-base-content/10
    - No outline or focus ring
    - Options: "Last 12 months" (selected), "Last 6 months", "Last 3 months"
    - Text: text-base-content, text-sm
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-secondary) - secondary theme color
- Series 2 (Premium Plan): var(--color-base-content) - full opacity
- Series 3 (Enterprise Plan): color-mix (base-content 50% transparent)
- Gradient fill: Smooth transition from 0.55 opacity → 0 (transparent)
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Values: base-content (prominent)
  - Growth: text-success (green)
- Legend styling: Bordered badges with plan-matching colors

  Interactive Features:

- Shared tooltip on hover:
  - Shows all three series values simultaneously
  - Displays: "Basic Plan: $[value]", "Premium Plan: $[value]", "Enterprise Plan: $[value]"
  - Color-coded dots matching plan colors
  - Formatted with thousand separators
  - Styled with DaisyUI (p-3, text-xs)
- Dropdown filter to change time period (12mo/6mo/3mo)
- Visual legend with badges
- Responsive layout (legend hidden on mobile, visible on md screens)

  Use Cases:

- Full-year SaaS revenue analysis by subscription tier
- Multi-plan revenue tracking
- Enterprise plan monitoring
- Annual subscription performance dashboard
- Plan distribution analysis
- Year-round revenue projections

### path
area-chart-4.md


## Area Chart Five
### Description

6-Month Dual Plan Comparison Area Chart - Card layout with growth indicator and legend

Visual Appearance:

- Overlapping area chart displaying 6 months comparing two subscription plans
- Two filled areas under smooth curves
- Top area: "Basic Plan" with full color (var(--color-base-content))
- Bottom area: "Premium Plan" with semi-transparent color (base-content/50 opacity)
- Area fills: Gradient with opacity transition (opacityFrom: 0.45 → opacityTo: 0)
- Line strokes: 2px width with smooth curve interpolation
- Grid visible with subtle borders (color-mix 95% transparent)
- X-axis: Shows all 6 months labeled (Jan through Jun) with 12px labels
- Y-axis: Hidden from view
- No drop shadow, no toolbar, no zoom effects
- Interactive shared tooltip showing both series values simultaneously
- Note: Basic Plan series includes negative values (Apr: -500, May: -1000, Jun: -1500) creating dips below zero, showing refund periods

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex gap-2, items-start, mt-1):
      - Value: "$25,823" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (text-success, text-sm, font-semibold, green color)
      - Badge layout: flex items-center, mt-auto, mb-1, gap-1
  - Right side: Legend (vertical flex, gap-2)
    - "Basic plan" legend item:
      - Color dot: size-2, bg-base-content (solid dark)
      - Label: "Basic plan" (text-base-content, text-xs)
    - "Premium plan" legend item:
      - Color dot: size-2, bg-base-content/50 (semi-transparent gray)
      - Label: "Premium plan" (text-base-content, text-xs)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix (base-content with 50% transparency)
- Gradient fill: Smooth transition from 0.45 opacity → 0
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Values: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Shared tooltip on hover:
  - Shows both series values simultaneously
  - Displays: "Basic Plan: $[value]" and "Premium Plan: $[value]"
  - Color-coded with dots matching plan colors
  - Formatted with thousand separators (handles negative values)
  - Styled with DaisyUI (p-3, text-xs)
- Visual legend to distinguish plans
- Responsive design

Use Cases:

- Plan comparison with retention tracking
- Subscription metrics with cancellation periods
- Revenue tracking showing refund periods
- Quarterly retention vs growth comparison

### path
area-chart-5.md


## Area Chart Six
### Description

6-Month Year-over-Year Comparison Area Chart - Card layout with dual metric display

Visual Appearance:

- Overlapping area chart comparing 6 months between two years
- Two filled areas under smooth curves
- Top area: "This Year" with full color (var(--color-base-content))
- Bottom area: "Last Year" with semi-transparent color (base-content/50 opacity)
- Area fills: Gradient with opacity transition (opacityFrom: 0.45 → opacityTo: 0)
- Line strokes: 2px width with smooth curve interpolation
- Grid visible with subtle borders (color-mix 95% transparent)
- X-axis: Shows all 6 months labeled (Jan through Jun) with 12px labels
- Y-axis: Hidden from view
- No drop shadow, no toolbar, no zoom effects
- Interactive shared tooltip showing both year values simultaneously

Layout Structure:

- Card layout with responsive padding (p-10 on both mobile and desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Vertical flex structure
  - Section 1 (flex items-center gap-2):
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Growth indicator badge: "+10.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2.5 py-0.5, rounded-selector)
  - Section 2 (flex gap-4, mt-3): Year comparison display with metrics and legends
    - Column 1 - "This Year":
      - Value: "$35,442" (text-lg, font-semibold, mt-0.5)
      - Legend item below value:
        - Color dot: size-2, bg-base-content (full opacity)
        - Label: "This Year" (text-base-content/80, text-xs)
      - Container: flex flex-col
    - Column 2 - "Last Year":
      - Value: "$25,252" (text-lg, font-semibold, mt-0.5)
      - Legend item below value:
        - Color dot: size-2, bg-base-content/50 (semi-transparent)
        - Label: "Last Year" (text-base-content/80, text-xs)
      - Container: flex flex-col
    - Gap between columns: 16px (gap-4)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (This Year): var(--color-base-content) - full opacity
- Series 2 (Last Year): color-mix (base-content with 50% transparency)
- Gradient fill: Smooth transition from 0.45 opacity → 0
- Grid color: color-mix 95% transparent
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Values: base-content (prominent, text-lg)
  - Comparison labels: base-content/80 (slightly muted, text-xs)
  - Growth: text-success (green)

Data:

- Series 1 - "This Year": [5500, 5200, 5400, 5500, 5800, 6200]
- Series 2 - "Last Year": [4100, 4000, 4400, 4300, 4500, 5000]
- Categories: Jan, Feb, Mar, Apr, May, Jun
- "This Year" total: $35,442
- "Last Year" total: $25,252
- Growth: +10.5% year-over-year
- Range: $4,000 to $6,200

Interactive Features:

- Shared tooltip on hover:
  - Shows both year values simultaneously
  - Displays: "This Year: $[value]" and "Last Year: $[value]"
  - Color-coded dots matching year colors
  - Formatted with thousand separators
  - Styled with DaisyUI (p-3, text-xs)
- Metric comparisons with legend indicators
- Growth indicator badge
- Responsive design

Use Cases:

- Year-over-year performance comparison
- Annual growth visualization
- YoY revenue tracking
- Growth analysis dashboard
- Performance benchmarking
- Executive dashboard metrics

### path
area-chart-6.md


## Area Chart Seven
### Description

Compact Sparkline Revenue Widget - Inline metric card with small embedded chart

Visual Appearance:

- Minimal compact area sparkline (no axes, no grid, no tooltip)
- Single smooth curved area line showing 6-month trend
- Embedded chart: w-36 h-24 (small, 144px wide × 96px tall)
- Area fill: Gradient with opacity transition (opacityFrom: 0.55 → opacityTo: 0)
- Line stroke: 2px width with smooth curve interpolation
- Color: var(--color-base-content) - theme adaptive
- No grid, no axes, no labels, no toolbar, no tooltip
- Pure visual trend representation - minimal design

Layout Structure:

- Card layout: Full width with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Container: flex items-stretch justify-between (aligns left content with right chart)
- Left section (flex flex-col justify-between flex-1):
  - Top metric info:
    - Label: "Total Revenue" (text-base-content/60, text-sm, font-semibold, mb-2)
    - Value: "$25,867" (text-3xl, font-bold, text-base-content, leading-tight)
  - Bottom growth indicator (flex items-center, text-success):
    - Upward arrow icon: SVG (w-3.5 h-3.5, green stroke, stroke-width 3)
    - Growth percentage: "14.5%" (text-sm, font-semibold, text-success)
    - Icon and text styled as inline flex with matching green color
- Right section (w-36 h-24 shrink-0):
  - Sparkline chart embedded in fixed-size container
  - Size: 144px wide × 96px tall (w-36 h-24)
  - Chart fills available space
- Layout: Two columns side-by-side (flex items-stretch justify-between)

Colors & Styling:

- Area fill color: var(--color-base-content) - theme adaptive
- Gradient fill: Smooth transition from 0.55 opacity → 0
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/60 (muted gray)
  - Value: base-content (prominent, text-3xl font-bold)
  - Growth: text-success (green)
- Icon color: Inherited from text-success (green)
- No grid or axis colors visible (disabled)

Interactive Features:

- No tooltip (disabled for minimal design)
- No interactions - purely visual representation
- Responsive design adapts to container size
- Static trend visualization

Use Cases:

- Dashboard widget showing quick metrics
- Executive dashboard quick glance metrics
- Sidebar metrics panel
- Mobile dashboard compact view
- KPI indicator cards
- Quick trend visualization
- Multiple metric cards layout

### path
area-chart-7.md


## Area Chart Eight
### Description

Compact Sparkline Revenue Widget - Inline metric card with small embedded chart

Visual Appearance:

- Minimal compact area sparkline (no axes, no grid, no tooltip)
- Single smooth curved area line showing 6-month trend
- Embedded chart: w-36 h-24 (small, 144px wide × 96px tall)
- Area fill: Gradient with opacity transition (opacityFrom: 0.55 → opacityTo: 0)
- Line stroke: 2px width with smooth curve interpolation
- Color: var(--color-base-content) - theme adaptive
- No grid, no axes, no labels, no toolbar, no tooltip
- Pure visual trend representation - minimal design

Layout Structure:

- Card layout: Full width with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Container: flex items-stretch justify-between (aligns left content with right chart)
- Left section (flex flex-col justify-between flex-1):
  - Top metric info:
    - Label: "Total Revenue" (text-base-content/60, text-sm, font-semibold, mb-2)
    - Value: "$25,867" (text-3xl, font-bold, text-base-content, leading-tight)
  - Bottom growth indicator (flex items-center, text-success):
    - Upward arrow icon: SVG (w-3.5 h-3.5, green stroke, stroke-width 3)
    - Growth percentage: "14.5%" (text-sm, font-semibold, text-success)
    - Icon and text styled as inline flex with matching green color
- Right section (w-36 h-24 shrink-0):
  - Sparkline chart embedded in fixed-size container
  - Size: 144px wide × 96px tall (w-36 h-24)
  - Chart fills available space
- Layout: Two columns side-by-side (flex items-stretch justify-between)

Colors & Styling:

- Area fill color: var(--color-base-content) - theme adaptive
- Gradient fill: Smooth transition from 0.55 opacity → 0
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/60 (muted gray)
  - Value: base-content (prominent, text-3xl font-bold)
  - Growth: text-success (green)
- Icon color: Inherited from text-success (green)
- No grid or axis colors visible (disabled)

Interactive Features:

- No tooltip (disabled for minimal design)
- No interactions - purely visual representation
- Responsive design adapts to container size
- Static trend visualization

Use Cases:

- Dashboard widget showing quick metrics
- Executive dashboard quick glance metrics
- Sidebar metrics panel
- Mobile dashboard compact view
- KPI indicator cards
- Quick trend visualization
- Multiple metric cards layout

### path
area-chart-8.md


## Area Chart Nine
### Description

12-Month Stacked Three-Plan Revenue Chart - Full layout with dual filter dropdowns

Visual Appearance:

- Stacked area chart displaying 12 months of stacked revenue from three subscription plans
- Three overlapping filled areas creating stacked visualization (plotOptions.area.stacked: true)
- Areas stack on top of each other showing total and individual contributions
- Area fills: Gradient with opacity transition (opacityFrom: 0.55 → opacityTo: 0, transparent)
- Line strokes: 2px width with monotoneCubic curve (smooth cubic spline)
- Grid: Hidden from view (show: false)
- X-axis: Shows all 12 months labeled (Jan through Dec) with 12px labels
- Y-axis: Hidden from view
- No toolbar, no zoom effects, no drop shadow
- Interactive shared tooltip showing all three series values simultaneously

Layout Structure:

- Full layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex gap-2, items-start, mt-1):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth display (flex mt-auto gap-2):
        - Growth: "+14.5%" (text-success, text-sm, font-semibold, green)
        - Comparison: "vs Last Year" (text-base-content/50, text-sm, font-semibold)
  - Right side (hidden on mobile, md:block): Filter dropdowns
    - Two select dropdowns in horizontal row
    - Dropdown 1: Metric filter
      - Label: "Revenue" (selected default)
      - Options: "Revenue", "Sales"
      - Size: select-sm, w-28
      - Style: rounded-field, bg-base-300, shadow-2xl, border-base-content/10
      - No outline or focus ring
    - Dropdown 2: Time period filter
      - Label: "Last 12 months" (selected default)
      - Options: "Last 12 months", "Last 6 months", "Last 3 months"
      - Size: select-sm, w-36
      - Style: rounded-field, bg-base-300, shadow-2xl, border-base-content/10
      - No outline or focus ring
    - Dropdowns styled consistently with DaisyUI selects
    - Layout: Horizontal flex row with gap between
    - Responsive: Hidden on mobile (hidden class), visible on md screens (md:block)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-secondary) - secondary theme color
- Series 2 (Premium Plan): var(--color-base-content) - full opacity
- Series 3 (Enterprise Plan): color-mix (base-content 50% transparent)
- Gradient fill: Smooth transition from 0.55 opacity → 0 (transparent)
- Grid: Hidden (show: false)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Values: base-content (prominent)
  - Growth: text-success (green)
  - Comparison: base-content/50 (muted)
- Select styling:
  - Background: bg-base-300
  - Border: border-base-content/10
  - Shadow: shadow-2xl
  - No focus ring or outline

Interactive Features:

- Shared tooltip on hover:
  - Shows all three series values simultaneously
  - Displays: "Basic Plan: $[value]", "Premium Plan: $[value]", "Enterprise Plan: $[value]"
  - Color-coded dots matching plan colors
  - Formatted with thousand separators
  - Styled with DaisyUI (p-3, text-xs)
- Metric filter dropdown to switch metrics (Revenue/Sales)
- Time period filter dropdown to change time range (12mo/6mo/3mo)
- Both filters functional for data updates
- Growth indicator with comparison text
- Responsive layout (dropdowns hidden on mobile, visible on md screens)

Use Cases:

- Full-year comprehensive SaaS revenue analysis by plan
- Multi-metric dashboard with flexible filtering
- Annual financial planning and forecasting
- Plan distribution and growth analysis
- Year-round metrics dashboard

### path
area-chart-9.md
