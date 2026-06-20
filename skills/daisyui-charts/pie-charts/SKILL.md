# Pie Charts

## Pie Chart One
### Description

4-Plan Revenue Distribution Pie Chart - Card layout with time period filter tabs

Visual Appearance:

- Full pie chart displaying revenue distribution across 4 subscription plans
- Four pie slices with distinct opacity levels
- Slice 1 (Free Plan - 40%): var(--color-base-content) - full opacity, largest slice
- Slice 2 (Basic Plan - 20%): color-mix base-content 30% transparent
- Slice 3 (Premium Plan - 20%): color-mix base-content 50% transparent (lighter)
- Slice 4 (Enterprise Plan - 20%): var(--color-secondary) - secondary theme color
- Pie stroke: 1px border with var(--color-base-200) separating slices
- All slices have labels displayed directly on pie (show: true)
- Pie fills 100% of available space
- Interactive tooltip on hover showing plan name and percentage

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between on desktop, column on mobile (flex flex-col md:flex-row)
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 10%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
  - Right side (hidden on mobile, md:block): Time period filter tabs
    - Tab buttons: Weekly, Monthly, Annually (Annually selected)
    - Tab style: tabs-box tabs-xs
    - Background: bg-base-300/80
    - Border: border-base-content/10
    - DaisyUI tab component
- Bottom section: Full-width pie chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Slice colors: As described above with varying opacity
- Slice stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching slice color
  - "[Plan Name]: [percentage]%" format
  - Styled with DaisyUI (bg-base-100, border-base-content/10, shadow-xl, rounded-box, p-3, text-xs)
- Time period filter tabs (Weekly/Monthly/Annually)
- Growth indicator badge
- Responsive layout (tabs hidden on mobile)

Use Cases:

- User distribution across plan tiers
- Subscription plan breakdown
- Freemium model visualization
- User tier analysis
- Revenue distribution by plan

### path
pie-chart-1.md


## Pie Chart Two
### Description

4-Plan Revenue Distribution Pie Chart - Card layout with bottom legend

Visual Appearance:

- Full pie chart displaying revenue distribution across 4 subscription plans
- Four pie slices with distinct opacity levels
- Slice 1 (Free Plan - 40%): var(--color-base-content) - full opacity, largest slice
- Slice 2 (Basic Plan - 20%): color-mix base-content 30% transparent
- Slice 3 (Premium Plan - 20%): color-mix base-content 50% transparent (lighter)
- Slice 4 (Enterprise Plan - 20%): color-mix base-content 90% transparent (very light)
- Pie stroke: 1px border with var(--color-base-200) separating slices
- All slices have labels displayed directly on pie (show: true)
- Pie fills 100% of available space
- Interactive tooltip on hover with plan name and percentage

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
      - Growth badge: "+ 10%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
  - Right side (hidden on mobile, md:flex): Time period filter dropdown
    - Select element: select-sm, w-32
    - Background: bg-base-300, shadow-2xl
    - Border: border-base-content/10
    - Font: font-semibold
    - Options: "Last 12 months", "Last 6 months" (selected), "Last 3 months"
- Middle section: Full-width pie chart area
- Bottom section: Legend indicators (flex gap-2, ml-2)
  - Four legend items in horizontal row:
    - Each item: flex items-center gap-1
    - Color dots: size-2 (small dots) with plan-matching colors
    - Labels: text-base-content, text-sm
    - Layout: Four columns side-by-side with gap-2
- Gap between sections: 24px (mb-4)

Colors & Styling:

- Slice colors: As described with varying opacity levels
- Slice stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Legend dot colors: Match slice colors
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green)
  - Legend: base-content (text-sm)

Interactive Features:

- Custom tooltip on hover showing plan name and percentage
- Time period filter dropdown (responsive: hidden on mobile, visible on md)
- Visual legend at bottom with color-matched indicators
- Growth indicator badge
- Responsive design

Use Cases:

- Plan distribution visualization with filtering
- User tier breakdown with time period selection
- Subscription metrics with flexible time periods
- Plan adoption with period filtering

### path
pie-chart-2.md


## Pie Chart Three
### Description

3-Plan Revenue Distribution Pie Chart - Card layout with top legend metrics

Visual Appearance:

- Full pie chart displaying revenue distribution across 3 subscription plans
- Three pie slices with distinct opacity levels
- Slice 1 (Basic Plan - 45%): var(--color-base-content) - full opacity, largest slice
- Slice 2 (Premium Plan - 35%): color-mix base-content 30% transparent
- Slice 3 (Enterprise Plan - 20%): color-mix base-content 50% transparent (lighter)
- Pie stroke: 1px border with var(--color-base-200) separating slices
- All slices have labels displayed directly on pie (show: true)
- Pie fills 100% of available space
- Interactive tooltip on hover with plan name and percentage

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with items-start alignment (flex items-start gap-7 md:gap-10, mb-6)
  - Three columns of plan metrics (flex flex-col):
    - Column 1 - Basic Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content (solid dark)
        - Label: "Basic Plan" (text-xs, font-semibold, base-content/50)
      - Metric display:
        - Value: "$25,864" (text-2xl, font-semibold, base-content)
        - Percentage: "(45%)" (text-xs, font-semibold, base-content/50)
    - Column 2 - Premium Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content/70 (semi-transparent)
        - Label: "Premium Plan" (text-xs, font-semibold, base-content/50)
      - Metric display:
        - Value: "$14,258" (text-2xl, font-semibold, base-content)
        - Percentage: "(35%)" (text-xs, font-semibold, base-content/50)
    - Column 3 - Enterprise Plan:
      - Legend indicator (flex gap-1 items-center):
        - Color dot: size-2, bg-base-content/50 (lighter transparent)
        - Label: "Enterprise Plan" (text-xs, font-semibold, base-content/50)
      - Metric display:
        - Value: "$5,258" (text-2xl, font-semibold, base-content)
        - Percentage: "(20%)" (text-xs, font-semibold, base-content/50)
    - Gap between columns: 28px-40px (gap-7 md:gap-10)
- Bottom section: Full-width pie chart area
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Slice colors: As described with varying opacity
- Slice stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Labels: base-content/50 (muted, text-xs)
  - Values: base-content (prominent, text-2xl)
  - Percentages: base-content/50 (muted, text-xs)

Interactive Features:

- Custom tooltip on hover showing plan name and percentage
- Visual legend with color indicators at top
- Plan values and percentages displayed prominently
- Responsive layout (responsive gap sizing)

Use Cases:

- 3-tier plan revenue comparison
- Subscription plan distribution
- Revenue breakdown by plan tier
- Tier performance metrics

### path
pie-chart-3.md


## Pie Chart Four
### Description

3-Plan Revenue Distribution Pie Chart - Card layout with individual plan metric cards

Visual Appearance:

- Full pie chart displaying revenue distribution across 3 subscription plans
- Three pie slices with distinct opacity levels
- Slice 1 (Basic Plan - 45%): var(--color-base-content) - full opacity, largest slice
- Slice 2 (Premium Plan - 35%): color-mix base-content 30% transparent (medium opacity)
- Slice 3 (Enterprise Plan - 20%): color-mix base-content 50% transparent (lighter)
- Pie stroke: 1px border with var(--color-base-200) separating slices
- All slices have labels displayed directly on pie (show: true)
- Pie fills 100% of available space
- Height: 200px (compact pie size)
- Interactive tooltip on hover showing plan name and percentage

Layout Structure:

- Card layout with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-md, font-semibold, base-content/50)
    - Metric display (flex flex-row sm:items-center gap-2 sm:gap-3):
      - Value: "$45,864" (text-3xl, font-semibold, base-content)
      - Growth badge: "+ 10%" (bg-success/10, text-success, text-xs, font-semibold, px-2 py-1, rounded-selector)
      - Responsive: Vertical on mobile, horizontal on desktop
- Middle section (flex flex-col):
  - Pie chart area (shrink-0)
    - Chart height: 200px (h-200)
    - Full width pie visualization
- Bottom section: Plan metric cards (flex items-center justify-center gap-2, mt-2)
  - Three plan cards displayed horizontally:
    - Each card: flex flex-col gap-1, p-6, bg-base-300, border-base-content/10, rounded-field
    - Card 1 - Basic Plan:
      - Header (flex items-center gap-1):
        - Color dot: size-2, bg-base-content (solid dark)
        - Label: "Basic plan" (text-base-content, text-xs)
      - Value section (flex items-center gap-1):
        - Value: "$25,864" (text-base-content, font-semibold, text-xl)
        - Growth: "+10%" (text-success, text-xs, font-semibold, mt-1)
    - Card 2 - Premium Plan:
      - Header (flex items-center gap-1):
        - Color dot: size-2, bg-base-content/70 (darker semi-transparent)
        - Label: "Premium plan" (text-base-content, text-xs)
      - Value section (flex items-center gap-1):
        - Value: "$14,258" (text-base-content, font-semibold, text-xl)
        - Growth: "+5.4%" (text-success, text-xs, font-semibold, mt-1)
    - Card 3 - Enterprise Plan:
      - Header (flex items-center gap-1):
        - Color dot: size-2, bg-base-content/50 (lighter semi-transparent)
        - Label: "Enterprise plan" (text-base-content, text-xs)
      - Value section (flex gap-1 items-center):
        - Value: "$5,258" (text-base-content, font-semibold, text-xl)
        - Growth: "+2.5%" (text-success, text-xs, font-semibold, mt-1)
    - Gap between cards: 8px (gap-2)
- All sections vertically stacked with mb-4 between header and chart, mt-2 between chart and cards

Colors & Styling:

- Slice colors: As described above with varying opacity
- Slice stroke: var(--color-base-200), 1px width
- Card background: base-300 for metric cards
- Card border: base-content/10
- Card padding: p-6 (comfortable spacing inside cards)
- Card border radius: rounded-field
- Top badge background: success/10 (light green)
- Text colors:
  - Label: base-content/50 (muted, text-md)
  - Value: base-content (prominent, text-3xl)
  - Growth: text-success (green, text-xs)
  - Card labels: base-content (text-xs)
  - Card values: base-content (text-xl)

Interactive Features:

- Custom tooltip on hover:
  - Colored indicator dot (size-2) matching slice color
  - "[Plan Name]: [percentage]%" format
  - Styled with DaisyUI (bg-base-100, border-base-content/10, shadow-xl, rounded-box, p-3, text-xs)
- Plan metric cards showing individual values and growth percentages
- Color-coded indicators on cards matching pie slices
- Responsive layout (responsive flex direction on mobile)
- Growth badges on each plan card

Use Cases:

- 3-tier plan revenue with individual metrics
- Plan performance dashboard with detailed breakdown
- Subscription metrics with per-plan growth tracking
- Plan distribution with financial details
- Revenue breakdown by plan tier with growth analysis

### path
pie-chart-4.md


## Pie Chart Five
### Description

Compact 3-Plan Donut Chart - Compact layout with bottom legend table

Visual Appearance:

- Donut (pie with hole in center) displaying 3 subscription plan distribution
- Three donut slices with distinct opacity levels
- Slice 1 (Basic Plan - 45%): var(--color-base-content) - full opacity
- Slice 2 (Premium Plan - 35%): color-mix base-content 30% transparent
- Slice 3 (Enterprise Plan - 20%): color-mix base-content 50% transparent
- Donut stroke: 1px border with var(--color-base-200) separating slices
- Slices have labels displayed on donut (show: true)
- Donut height: 220px (h-220)
- Interactive tooltip on hover

Layout Structure:

- Compact layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with responsive direction (flex flex-col md:flex-row)
  - Left side:
    - Label: "Total Revenue" (text-sm, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-2xl, font-semibold, base-content)
      - Growth: "+ 10%" (text-success, text-xs, font-semibold, mt-2)
- Middle section: Donut chart area (shrink-0)
  - Donut height: 220px
- Bottom section: Legend table layout (flex flex-col gap-7)
  - Three rows with plan information:
    - Row 1 - Basic Plan (flex justify-between):
      - Left: Legend indicator (flex items-center gap-1)
        - Color dot: size-2, bg-base-content
        - Label: "Basic plan" (text-base-content, text-xs)
      - Right: Value display (flex items-center gap-1)
        - Value: "$25,864" (text-base-content, font-semibold, text-xs)
        - Percentage: "(45%)" (text-xs, font-semibold, base-content/50)
    - Row 2 - Premium Plan (flex justify-between):
      - Left: Legend indicator (flex items-center gap-1)
        - Color dot: size-2, bg-base-content/70
        - Label: "Premium plan" (text-base-content, text-xs)
      - Right: Value display (flex items-center gap-1)
        - Value: "$14,258" (text-base-content, font-semibold, text-xs)
        - Percentage: "(35%)" (text-xs, font-semibold, base-content/50)
    - Row 3 - Enterprise Plan (flex justify-between):
      - Left: Legend indicator (flex items-center gap-1)
        - Color dot: size-2, bg-base-content/50
        - Label: "Enterprise plan" (text-base-content, text-xs)
      - Right: Value display (flex items-center gap-1)
        - Value: "$5,258" (text-base-content, font-semibold, text-xs)
        - Percentage: "(20%)" (text-xs, font-semibold, base-content/50)
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Donut slice colors: As described with varying opacity
- Donut stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted, text-sm)
  - Value: base-content (prominent, text-2xl)
  - Growth: text-success (green, text-xs)
  - Table rows: base-content (text-xs)
  - Percentages: base-content/50 (text-xs)

Interactive Features:

- Custom tooltip on hover showing plan name and percentage
- Legend table showing all plan details
- Color-coded indicators in legend
- Responsive layout (responsive flex direction)

Use Cases:

- Compact plan revenue dashboard
- Plan distribution with detailed breakdown table
- Subscription metrics in tabular format
- Plan comparison dashboard
- Revenue by plan tier visualization

### path
pie-chart-5.md


## Pie Chart Six
### Description

Compact 3-Plan Donut Chart - Compact layout with radio filter and bottom legend

Visual Appearance:

- Donut (pie with hole in center) displaying 3 subscription plan distribution
- Three donut slices with distinct opacity levels
- Slice 1 (Basic Plan - 45%): var(--color-base-content) - full opacity
- Slice 2 (Premium Plan - 35%): color-mix base-content 30% transparent
- Slice 3 (Enterprise Plan - 20%): color-mix base-content 50% transparent
- Donut stroke: 1px border with var(--color-base-200) separating slices
- Slices have labels displayed on donut (show: true)
- Donut height: 200px
- Interactive tooltip on hover

Layout Structure:

- Compact layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side: Dual metric display with radio selection (flex flex-col gap-2)
    - Column 1 - This Year:
      - Value: "$25,864" (text-2xl, font-semibold, base-content)
      - Radio button (flex gap-1 items-center cursor-pointer):
        - Radio: radio radio-xs, checked by default
        - Label: "This Year" (text-xs, font-semibold, base-content/50)
    - Column 2 - Last Year:
      - Value: "$14,258" (text-2xl, font-semibold, base-content)
      - Radio button (flex gap-1 items-center cursor-pointer):
        - Radio: radio radio-xs
        - Label: "Last Year" (text-xs, font-semibold, base-content/50)
    - Both columns: flex flex-col gap-2
    - Gap between columns: 16px (gap-4 in parent flex)
- Middle section: Donut chart area (shrink-0)
  - Donut height: 200px
- Bottom section: Legend table layout (flex flex-col gap-7)
  - Three rows with plan information:
    - Each row: flex justify-between
    - Left side: Legend indicator (flex items-center gap-1)
      - Color dot: size-2 (small)
      - Label: text-base-content, text-xs
    - Right side: Value display (flex items-center gap-1)
      - Value: text-base-content, font-semibold, text-xs
      - Percentage: text-xs, font-semibold, base-content/50
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Donut slice colors: As described with varying opacity
- Donut stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Values: base-content (prominent, text-2xl)
  - Labels: base-content/50 (muted, text-xs)
  - Table: base-content (text-xs)
  - Percentages: base-content/50 (text-xs)

Data:

- Series: 3 values [45, 35, 20]
- This Year: $25,864 (selected by default)
- Last Year: $14,258
- Basic Plan: $25,864 (45%)
- Premium Plan: $14,258 (35%)
- Enterprise Plan: $5,258 (20%)

Interactive Features:

- Custom tooltip on hover showing plan and percentage
- Year-over-year comparison radio buttons (This Year/Last Year)
- Legend table showing plan details
- Responsive layout

Use Cases:

- Year-over-year plan comparison
- Period comparison donut visualization
- Plan distribution with temporal selection
- Revenue by plan with historical comparison
- Trend analysis by plan tier

### path
pie-chart-6.md


## Pie Chart Seven
### Description

Donut Chart with Data Labels and Export Button - Compact layout with action button

Visual Appearance:

- Donut (pie with hole in center) displaying 3 subscription plan distribution
- Three donut slices with distinct opacity levels
- Slice 1 (Basic Plan - 45%): var(--color-base-content) - full opacity
- Slice 2 (Premium Plan - 35%): color-mix base-content 30% transparent
- Slice 3 (Enterprise Plan - 20%): color-mix base-content 50% transparent
- Special feature: Data labels ENABLED (enabled: true) - percentage values shown directly on slices
- Data label color: var(--color-base-100) - light text for contrast on dark background
- Donut stroke: 1px border with var(--color-base-200) separating slices
- Donut height: 220px
- Interactive tooltip on hover

Layout Structure:

- Compact layout type with responsive padding (p-7 mobile, p-10 desktop)
- Background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Horizontal flex with space-between alignment
  - Left side:
    - Label: "Total Revenue" (text-sm, font-semibold, base-content/50)
    - Metric display (flex items-center gap-2):
      - Value: "$45,864" (text-2xl, font-semibold, base-content)
      - Growth: "+ 10%" (text-success, text-xs, font-semibold, mt-2)
  - Right side (hidden on mobile, md:block): Export action
    - Button: DaisyUI btn btn-sm rounded-field
    - Style: bg-base-300, border-base-content/10
    - Content: "Export" text + upload/download SVG icon (w-4 h-4)
    - Icon: SVG with stroke style showing arrow pointing up and out
    - Margin: ml-2
- Middle section: Donut chart area (shrink-0)
  - Donut height: 220px
  - Feature: Percentage values visible directly on donut slices
- Bottom section: Legend table layout (flex flex-col gap-7)
  - Three rows with plan information (same structure as Chart 5):
    - Row structure: flex justify-between
    - Left: Color dot + label
    - Right: Value + percentage
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Donut slice colors: As described with varying opacity
- Data labels: var(--color-base-100) (light text for contrast)
- Donut stroke: var(--color-base-200), 1px width
- Card background: base-200/80
- Border: base-content/10
- Button styling: bg-base-300, border-base-content/10
- Text colors:
  - Label: base-content/50 (muted, text-sm)
  - Value: base-content (prominent, text-2xl)
  - Growth: text-success (green, text-xs)
  - Table: base-content (text-xs)
  - Percentages: base-content/50 (text-xs)

Interactive Features:

- Custom tooltip on hover showing plan name and percentage
- Data labels visible on donut slices - percentage values displayed directly
- Export button for downloading/exporting chart data
- Legend table showing plan details
- Responsive layout (export button hidden on mobile)

Use Cases:

- Shareable donut chart visualization
- Reporting dashboard with download functionality
- Plan metrics with exportable data
- Professional analytics visualization

### path
pie-chart-7.md

