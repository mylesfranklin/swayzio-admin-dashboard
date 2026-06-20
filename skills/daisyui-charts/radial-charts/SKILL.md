# Radial Charts

## Radial Chart One
### Description

Multi-Series Radial Bar Chart (4 Plans) - Card layout with time period filter tabs

Visual Appearance:

- Circular radial bar chart displaying 4 concentric bars (one per plan)
- Bar 1 (Free Plan - 80%): var(--color-base-content) - full opacity, outermost
- Bar 2 (Basic Plan - 70%): color-mix base-content 30% transparent
- Bar 3 (Premium Plan - 60%): color-mix base-content 50% transparent
- Bar 4 (Enterprise Plan - 50%): var(--color-secondary) - secondary color, innermost
- Bars have rounded line caps (lineCap: "round") for smooth edges
- Hollow center (30% of diameter)
- No track background visible
- No data labels shown on chart
- Interactive tooltip on hover showing plan name and percentage

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between on desktop, column on mobile
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
- Bottom section: Full circular radial chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar colors: As described with varying opacity and secondary color
- Line cap: Rounded for smooth appearance
- Hollow center: 30% (small central hollow)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching bar color
  - "[Plan Name]: [percentage]%" format
  - Styled with daisyUI (bg-base-100, border-base-content/10, shadow-xl, rounded-box, p-3, text-xs)
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive layout (tabs hidden on mobile)

Use Cases:

- Multi-tier plan distribution visualization
- Plan tier comparison
- User distribution across plans
- Subscription tier performance

### path
radial-chart-1.md


## Radial Chart Two
### Description

Multi-Series Radial Bar Chart with Bar Labels (4 Plans) - Card layout with metrics

Visual Appearance:

- Circular radial bar chart displaying 4 concentric bars
- Bar 1 (Free Plan - 80%): var(--color-base-content) - full opacity
- Bar 2 (Basic Plan - 70%): color-mix base-content 30% transparent
- Bar 3 (Premium Plan - 60%): color-mix base-content 50% transparent
- Bar 4 (Enterprise Plan - 50%): color-mix base-content 70% transparent
- Bars have rounded line caps (lineCap: "round")
- Hollow center (30% of diameter)
- Special feature: Bar labels enabled - text labels displayed outside bars
- Bar labels show plan name and value (e.g., "Free Plan: 80")
- Labels use series colors (useSeriesColors: true)
- Labels offset left with custom positioning (offsetX: -15)
- Full 360-degree rotation (startAngle: 0, endAngle: 350)
- No track background
- No inner data labels

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
- Bottom section: Full circular radial chart with external labels
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar colors: As described with varying opacity
- Line cap: Rounded
- Hollow center: 30% (transparent background)
- Bar labels: Color-matched to series, offset positioned
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)
  - Bar labels: Match series colors

Interactive Features:

- Bar labels visible on chart showing plan names and values
- Growth indicator badge
- Responsive layout

Use Cases:

- Plan distribution with external labels
- Tier comparison with visible metrics
- Plan tier breakdown with values
- Multi-series radial comparison

### path
radial-chart-2.md


## Radial Chart Three
### Description

Single-Series Semi-Circular Gauge (55%) - Card layout with gradient fill and time tabs

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single filled bar representing progress/metric (55%)
- Bar color: var(--color-base-content) with gradient fill
- Gradient: Smooth transition from opacityFrom: 1 → opacityTo: 0
- Gradient colors transition to: var(--color-base-content)
- Line caps rounded (lineCap: "round")
- Hollow center (70% of diameter - very large hollow)
- Track background visible: var(--color-base-content-20) (light background showing unfilled portion)

- Data labels enabled:
  - Name (label): "Sales" displayed above value
  - Value: "250" displayed prominently in center
  - Name offset: 25px below center
  - Value offset: -10px above center

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between on desktop, column on mobile
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
- Bottom section: Semi-circular gauge with central data labels
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content) with gradient fill (opacityFrom: 1 → 0)
- Track background: var(--color-base-content-20) (20% opacity)
- Line cap: Rounded
- Hollow center: 70% (very large, showing gauge ring only)
- Data labels: Name "Sales" (16px, text-base-content/50), Value "250" (42px, text-base-content)
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Data labels visible showing "Sales" label and "250" value
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive layout (tabs hidden on mobile)

Use Cases:

- Performance gauge visualization
- KPI progress tracking (55% complete)
- Sales performance dashboard
- Progress indicator with goal
- Single metric gauge display

### path
radial-chart-3.md


## Radial Chart Four
### Description

Single-Series Semi-Circular Gauge with Action Buttons (75%) - Card layout with report and export buttons

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single filled bar showing 75% progress
- Bar color: var(--color-base-content) with gradient fill
- Gradient: Smooth transition from opacityFrom: 1 → opacityTo: 0
- Line caps rounded for smooth edges
- Hollow center (50% of diameter)
- Track background visible: var(--color-base-content-20) (light unfilled portion)
- Data labels enabled:
  - Name: "Sales" displayed above value
  - Value: "250" displayed prominently
  - Name offset: 15px from center
  - Value offset: -25px from center
  - Font sizes: Name 16px, Value 42px

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
  - Right side: Two action buttons
    - Button 1: "View report" (DaisyUI btn btn-sm, rounded-field, bg-base-300, border-base-content/10)
    - Button 2: Export with SVG icon (w-4 h-4, download/export arrow icon, bg-base-300, border-base-content/10, ml-2)
- Bottom section: Semi-circular gauge with central labels
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content) with gradient fill
- Track background: var(--color-base-content-20) (20% opacity)
- Line cap: Rounded
- Hollow center: 50%
- Data labels: Name "Sales" (16px, text-base-content/50), Value "250" (42px, text-base-content)
- Buttons: bg-base-300, border-base-content/10
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Data labels visible showing "Sales" and "250"
- "View report" button for detailed view
- Export button with icon for data export
- Growth indicator badge
- Action-oriented layout with CTAs

Use Cases:

- Dashboard with actionable metrics
- Performance gauge with report access
- Executive metrics with drill-down
- Sales tracking with export capability

### path
radial-chart-4.md


## Radial Chart Five
### Description

Single-Series Semi-Circular Dashed Gauge (70%) - Card layout with dropdown filter

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single bar showing 70% progress
- Bar color: var(--color-base-content)
- Special feature: Dashed stroke (dashArray: 7) - bar appears as dashed segments
- Line caps rounded
- Hollow center (50% of diameter)
- No gradient fill (solid color)
- No track background shown
- Data labels enabled:
  - Name: "Sales" displayed above value
  - Value: "250" displayed prominently
  - Name offset: 5px from center
  - Value offset: -35px from center

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 400px (h-100)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
  - Right side: Export action button
    - Button: Export with SVG icon (bg-base-300, border-base-content/10, ml-2)
    - Icon: w-4 h-4 download/export arrow
- Bottom section: Semi-circular dashed gauge
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content)
- Bar stroke: Dashed (7px dash pattern)
- Line cap: Rounded
- Hollow center: 50%
- No track background
- Data labels: Name "Sales" (16px, text-base-content/50), Value "250" (42px, text-base-content)
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Dashed stroke creates unique visual style
- Export button for data export
- Time period filter dropdown
- Growth indicator badge

Use Cases:

- Distinct dashed gauge visualization
- Progress tracking with unique style
- Sales metrics with export
- Downloadable performance data

### path
radial-chart-5.md


## Radial Chart Six
### Description

Single-Series Semi-Circular Dashed Gauge (70%) - Card layout with dropdown filter and no background track

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single bar showing 70% progress
- Bar color: var(--color-base-content)
- Dashed stroke: dashArray: 7 - bar appears as dashed segments
- Line caps rounded
- Hollow center (50% of diameter)
- No track background (show: false) - only the dashed bar visible
- Data labels enabled:
  - Name: "Sales" displayed
  - Value: "250" displayed prominently
  - Name offset: 5px
  - Value offset: -35px

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 400px (h-100)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 14.5%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector, mt-2)
  - Right side: Time period filter dropdown
    - Select element: select-sm, w-36
    - Background: bg-base-300, shadow-2xl
    - Border: border-base-content/10
    - Font: font-semibold
    - Options: "Last 12 months" (selected), "Last 6 months", "Last 3 months"
- Bottom section: Semi-circular dashed gauge (no background track)
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Bar color: var(--color-base-content)
- Bar stroke: Dashed (7px)
- Line cap: Rounded
- Hollow center: 50%
- No track background shown
- Data labels: Name "Sales" (16px, text-base-content/50), Value "250" (42px, text-base-content)
- Dropdown styling: bg-base-300, shadow-2xl, border-base-content/10
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Dashed gauge with minimal background
- Time period filter dropdown (Last 12mo/6mo/3mo)
- Growth indicator badge
- Clean gauge appearance without track

Use Cases:

- Minimal dashed gauge design
- Period-based metrics tracking
- Clean performance visualization
- Sales metrics with period filtering

### path
radial-chart-6.md


## Radial Chart Seven
### Description

Compact Single-Series Semi-Circular Gauge (75%) - Sparkline widget layout

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single bar showing 75% progress
- Bar color: var(--color-base-content) with gradient fill
- Gradient: Smooth transition from opacityFrom: 1 → opacityTo: 0
- Line caps rounded
- Hollow center (50% of diameter)
- Track background visible: var(--color-base-content-20)
- Compact data labels: Much smaller fonts
  - Name: "Sales" (8px font, text-base-content/50)
  - Value: "250" (14px font, text-base-content)
  - Name offset: 5px
  - Value offset: -22px

Layout Structure:

- Compact layout (no card padding)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- No explicit height set (flexible)
- Horizontal flex layout (flex items-stretch justify-between):
  - Left section (flex flex-col justify-between flex-1):
    - Top: Metric info
      - Label: "Total Revenue" (text-base-content/60, text-sm, font-semibold, mb-2)
      - Value: "$25,867" (text-3xl, font-bold, text-base-content, leading-tight)
    - Bottom: Growth indicator
      - Icon: Upward arrow SVG (w-3.5 h-3.5, text-success)
      - Growth: "14.5%" (text-sm, font-semibold, text-success)
  - Right section (w-36 h-24 shrink-0):
    - Compact gauge: 144px × 96px
    - Chart fills available space

Colors & Styling:

- Bar color: var(--color-base-content) with gradient
- Track background: var(--color-base-content-20)
- Line cap: Rounded
- Hollow center: 50%
- Data labels: Compact sizes (8px/14px)
- Card background: base-200/80
- Border: base-content/10
- Text colors: base-content/60 (label), base-content (value), text-success (growth)

Interactive Features:

- Compact gauge visualization
- Growth indicator with icon
- Side-by-side layout (metric + gauge)
- Responsive design

Use Cases:

- Dashboard widget
- Quick metrics glance
- Mobile dashboard
- KPI tracking card

### path
radial-chart-7.md


## Radial Chart Eight
### Description

Compact Single-Series Semi-Circular Gauge with Withdraw Action (75%) - Balance widget layout

Visual Appearance:

- Semi-circular gauge (half circle, -90° to 90°)
- Single bar showing 75% progress
- Bar color: var(--color-base-content) with gradient fill
- Gradient: Smooth transition from opacityFrom: 1 - opacityTo: 0
- Line caps rounded
- Hollow center (50% of diameter)
- Track background visible: var(--color-base-content-20)
- Compact data labels:
  - Name: "Sales" (8px, text-base-content/50)
  - Value: "250" (14px, text-base-content)

Layout Structure:

- Compact layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 176px (h-44)
- Horizontal flex layout (flex items-stretch justify-between):
  - Left section (flex flex-col justify-between flex-1):
    - Top: Metric info
      - Label: "Available Balance" (text-base-content/60, text-sm, font-semibold, mb-2)
      - Value: "$25,867" (text-3xl, font-bold, text-base-content, leading-tight)
    - Bottom: Withdrawal action button (mt-2)
      - Button: DaisyUI btn btn-sm rounded-full
      - Style: bg-base-300, border-base-content/10
      - Content: "Withdraw" text + right arrow icon (w-3 h-3)
      - Icon: SVG with stroke style showing right arrow →
  - Right section (w-36 h-24 shrink-0):
    - Compact gauge: 144px × 96px
    - Chart fills available space

Colors & Styling:

- Bar color: var(--color-base-content) with gradient
- Track background: var(--color-base-content-20)
- Line cap: Rounded
- Hollow center: 50%
- Data labels: Compact (8px/14px)
- Button: bg-base-300, border-base-content/10, rounded-full
- Card background: base-200/80
- Border: base-content/10

Interactive Features:

- Compact gauge visualization
- "Withdraw" action button with arrow icon
- Clickable withdrawal CTA
- Responsive side-by-side layout
- Action-oriented design

Use Cases:

- Wallet/balance display widget
- Payment account interface
- Savings account dashboard
- Financial app balance card
- Quick action metrics card

### path
radial-chart-8.md
