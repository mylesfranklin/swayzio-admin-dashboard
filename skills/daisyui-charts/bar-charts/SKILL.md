# Bar Charts

## Bar Chart One
### Description

6-Month Revenue Horizontal Bar Chart - Full layout with time period filter tabs

Visual Appearance:

- Horizontal bar chart displaying 6 months of revenue data
- Single series with 6 horizontal bars (one per month)
- Bar color: var(--color-base-content) - theme adaptive
- Bar style: 50% column width with 5px border radius on end
- Bars extend left to right showing increasing/decreasing values
- No grid, no background, no data labels visible
- Y-axis visible showing category labels (Jan through Jun) with 50% opacity
- X-axis hidden from view
- Interactive tooltip on hover with formatted currency

Layout Structure:

- Full layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
    - Tab styling: DaisyUI tab component
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content) - theme adaptive
- Background: Transparent
- Y-axis text: base-content with 0.5 opacity, text-xs
- Border radius: 5px on bar ends
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching bar color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive design (tabs hidden on mobile)

Use Cases:

- Monthly revenue performance tracking
- Sales comparison dashboard
- Period-over-period analysis
- Executive dashboard metric
- Performance metrics with filtering
- Time-based comparison view

### path
bar-chart-1.md


## Bar Chart Two
### Description

6-Month Revenue Horizontal Bar Chart with Progress Indicator - Card layout with background bars

Visual Appearance:

- Horizontal bar chart displaying 6 months of revenue data
- Single series with 6 horizontal bars (one per month)
- Bar color: var(--color-base-content) - theme adaptive
- Background bars visible beneath actual data (progress bar style)
- Background bar color: color-mix base-content 90% transparent (light gray)
- Bar style: 25% column width with 4px border radius all around (borderRadiusApplication: "around")
- Bars show progress/completion visualization
- Y-axis visible showing category labels (Jan through Jun) with 50% opacity
- X-axis hidden from view
- Interactive tooltip on hover with formatted currency

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content) - theme adaptive, full opacity
- Background bar color: color-mix 90% transparent (light, subtle background)
- Bar width: 25% (narrower bars than Chart 1)
- Border radius: 4px all around (more rounded appearance)
- Y-axis text: base-content with 0.5 opacity, text-xs
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching bar color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Progress visualization with background bars
- Growth indicator badge
- Responsive design

Use Cases:

- Goal vs actual progress tracking
- Completion/progress visualization
- Target achievement display
- Sales quota tracking
- Progress monitoring dashboard

### path
bar-chart-2.md


## Bar Chart Three
### Description

6-Month Dual Plan Comparison Horizontal Bar Chart - Card layout with legend

Visual Appearance:

- Horizontal bar chart comparing two subscription plans across 6 months
- Two series displayed side-by-side (not stacked)
- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent (lighter shade)
- Bar style: 25% column width with 4px border radius on end
- Bars extend left to right for comparison visualization
- Y-axis visible showing category labels (Jan through Jun) with 50% opacity
- X-axis hidden from view
- Interactive tooltip on hover with formatted currency

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, w-fit)
      - Responsive: Vertical on mobile, horizontal on desktop
  - Right side: Legend (vertical flex, gap-2)
    - "Basic plan" legend item:
      - Color dot: size-2, bg-base-content (solid dark)
      - Label: "Basic plan" (text-base-content, text-xs)
    - "Premium plan" legend item:
      - Color dot: size-2, bg-base-content/50 (semi-transparent)
      - Label: "Premium plan" (text-base-content, text-xs)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Bar width: 25% (narrow bars for comparison)
- Border radius: 4px on ends
- Y-axis text: base-content with 0.5 opacity, text-xs
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)
- Legend dots: Match series colors

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot matching bar color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Visual legend to distinguish plans
- Growth indicator badge
- Responsive layout (responsive gap and flex direction)

Use Cases:

- Plan comparison across months
- Basic vs Premium performance
- Subscription tier comparison
- Plan distribution analysis
- Comparative metrics dashboard

### path
bar-chart-3.md


## Bar Chart Four
### Description

6-Month Stacked Dual Plan Revenue Horizontal Bar Chart - Card layout with dual metric display

Visual Appearance:

- Horizontal stacked bar chart comparing two subscription plans across 6 months
- Bars stacked horizontally (Basic Plan + Premium Plan in each bar)
- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent (lighter)
- Bar style: 50% column width with 5px border radius on end
- Stacked bars show combined total and individual contributions
- Y-axis visible showing category labels (Jan through Jun) with 50% opacity
- X-axis hidden from view
- Interactive shared tooltip showing both series values

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with items-start alignment
  - Two columns of metric displays (flex items-start gap-7 md:gap-10, mb-6):
    - Column 1 - Basic Plan metrics:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content (solid dark)
        - Label: "Basic Plan" (text-xs, font-semibold, base-content/50)
      - Value: "$25,864" (text-2xl, font-semibold, base-content)
      - Growth indicator (flex):
        - Plus sign: "+" (text-success, text-xs, font-semibold)
        - Percentage: "14.5%" (text-success, text-xs, font-semibold)
    - Column 2 - Premium Plan metrics:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content/70 (semi-transparent)
        - Label: "Premium Plan" (text-xs, font-semibold, base-content/50)
      - Value: "$14,258" (text-2xl, font-semibold, base-content)
      - Growth indicator (flex items-center):
        - Plus sign: "+" (text-success, text-xs, font-semibold)
        - Percentage: "14.5%" (text-success, text-xs, font-semibold)
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Stacked bar width: 50%
- Border radius: 5px on ends
- Y-axis text: base-content with 0.5 opacity, text-xs
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Labels: base-content/50 (muted)
  - Values: base-content (prominent, text-2xl)
  - Growth: text-success (green)

Interactive Features:

- Shared tooltip on hover:
  - Shows both plan values simultaneously
  - Color-coded dots matching plan colors
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Dual metric displays with separate values and growth indicators
- Visual legend with color indicators
- Responsive design

Use Cases:

- Stacked plan revenue comparison
- Total revenue breakdown by plan
- Plan contribution to total revenue
- SaaS subscription tier analysis
- Revenue distribution tracking

### path
bar-chart-4.md


## Bar Chart Five
### Description

6-Month Stacked Dual Plan Revenue Horizontal Bar Chart - Card layout with dropdown filter and bottom legend

Visual Appearance:

- Horizontal stacked bar chart comparing two subscription plans across 6 months
- Bars stacked horizontally (Basic Plan + Premium Plan in each bar)
- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent (lighter)
- Bar style: 50% column width with 5px border radius on end
- Stacked bars show combined total and individual contributions
- Y-axis visible showing category labels (Jan through Jun) with 50% opacity
- X-axis hidden from view
- Interactive tooltip on hover with formatted currency

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between and responsive alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
  - Right side (hidden on mobile, md:flex): Time period filter dropdown
    - Select element: select-sm, w-32, hidden md:flex
    - Background: bg-base-300, shadow-2xl
    - Border: border-base-content/10
    - No outline or focus ring
    - Options: "Last 12 months", "Last 6 months" (selected), "Last 3 months"
    - Font: font-semibold
- Middle section: Full-width chart area
- Bottom section: Legend indicators (flex gap-2, ml-2)
  - Two legend items in horizontal row: - "Basic plan" legend:
    _ Color dot: h-2.5 w-2.5, bg-base-content (solid dark, larger than mini dots)
    _ Label: "Basic plan" (text-base-content, text-sm) - "Premium plan" legend:
    _ Color dot: h-2.5 w-2.5, bg-base-content/50 (semi-transparent)
    _ Label: "Premium plan" (text-base-content, text-sm)

Colors & Styling:

- Series 1 (Basic Plan): var(--color-base-content) - full opacity
- Series 2 (Premium Plan): color-mix base-content 50% transparent
- Stacked bar width: 50%
- Border radius: 5px on ends
- Y-axis text: base-content with 0.5 opacity, text-xs
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)
  - Legend: base-content (text-sm)
- Legend dots: h-2.5 w-2.5 (larger than mini dots, match series colors)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot matching bar color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Time period filter dropdown (responsive: hidden on mobile, visible on md)
- Visual legend at bottom with larger color indicators
- Growth indicator badge
- Responsive layout

Use Cases:

- Stacked plan revenue with time filtering
- SaaS revenue tracking with period selection
- Plan contribution analysis with filtering
- Multi-plan dashboard with flexible time periods
- Revenue breakdown by plan and time

### path
bar-chart-5.md


## Bar Chart Six
### Description

Geographic Revenue Distribution Horizontal Bar Chart - Full layout with data labels and tab filters

Visual Appearance:

- Horizontal bar chart displaying revenue by geographic location (6 countries)
- Single series with 6 horizontal bars (one per country)
- Bar color: var(--color-base-content) - theme adaptive
- Data labels visible on bars showing country name and value
- Bar style: 50% column width with 5px border radius all around
- Bars extend left to right with values labeled directly on bars
- Y-axis hidden from view (no axis labels)
- X-axis hidden from view
- Interactive tooltip on hover with formatted currency
- Special feature: Data labels show both country name and revenue value directly on bars

Layout Structure:

- Full layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-medium, base-content/50)
    - Metric display (flex items-center gap-2 sm:gap-3):
      - Value: "$25,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
    - Tab styling: DaisyUI tab component
- Bottom section: Full-width chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content) - theme adaptive
- Data label color: var(--color-base-100) (light text on dark bars for contrast)
- Data label style: text-anchor: "start" (labels start from left)
- Bar width: 50%
- Border radius: 5px all around
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching bar color
  - "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI (text-base-content, p-3, text-xs)
- Data labels visible on bars showing geography and value
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive design (tabs hidden on mobile)

Use Cases:

- Geographic revenue distribution
- Regional sales performance
- Country-by-country metrics
- Global sales dashboard
- International revenue analysis

### path
bar-chart-6.md

