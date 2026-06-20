# Line Charts

## Line Chart One
### Description
Monthly Revenue Line Chart - Full width dashboard card with metrics and filters
 
Visual Appearance:
- Full-width line chart with drop shadow effect (8px blur, 0.3 opacity, 20px offset)
- Single curved line representing monthly revenue data
- Line stroke: 4px width with smooth curve interpolation
- Color: var(--color-base-content) - adapts to light/dark theme
- Gradient fill below line: starts transparent, peaks at 10-90% offset, fades to transparent
- Grid visible with subtle borders (color-mix 95% transparency)
- X-axis shows 12 months (Jan to Dec) with 12px labels
- Y-axis hidden from view
- No toolbar, zoom, or sparkline effects
- Interactive tooltip on hover with formatted values

Layout Structure:
- Vertical flex container with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Top section (header): Flex row, responsive to column on mobile
  * Left side: Metric information
    - Label: "Total Revenue" (text-md, base-content/50, font-semibold)
    - Value: "$45,864" (text-3xl, font-semibold, base-content)
    - Growth indicator: "+10% vs Last Year" (text-success, text-xs)
  * Right side: Time period filter tabs (hidden on mobile, visible md:block)
    - Three tab buttons: "Weekly", "Monthly", "Annually"
    - "Annually" tab is pre-selected (checked)
    - Background: base-300/80 with subtle border
    - Tab styling: tabs-box, tabs-xs classes
- Bottom section: Full width chart container
- Height: 480px (h-120 in Tailwind)
- Gap between sections: 24px (mb-6)
 
Colors & Styling:
- Line color: var(--color-base-content) - theme adaptive
- Fill gradient: Multiple color stops from transparent to solid
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  * Title: base-content/50 (muted)
  * Value: base-content (prominent)
  * Growth: text-success (positive indicator)
  * Supporting text: base-content/80

Interactive Features:
- Custom tooltip on hover:
  * Shows colored indicator dot matching line color
  * Displays: "Revenue: $[value]" with thousand separators
  * Styled with DaisyUI: text-base-content, p-3, text-xs
  * Positioned near cursor
- Tooltip formatter: adds dollar sign and thousand separators
- Tab switching (for time period selection) - UI prepared, logic to be implemented

Use Cases:
- Main dashboard chart showing annual revenue trend
- Revenue tracking with time period filtering
- Business intelligence and analytics dashboard
- Sales reporting with trend visualization

### path
line-chart-1.md


## Line Chart two
### Description

Quarterly Revenue Trend Line Chart - Card layout with growth indicator

Visual Appearance:

- Full-width line chart with drop shadow effect (8px blur, 0.3 opacity, 20px offset)
- Single curved line representing 6-month revenue trend
- Line stroke: 4px width with smooth curve interpolation
- Color: var(--color-base-content) - adapts to light/dark theme
- Gradient fill below line: starts transparent at top, becomes solid at 50% offset
- Grid visible with subtle borders (color-mix 95% transparency)
- X-axis shows 6 months (Jan to Jun) with 12px labels
- Y-axis hidden from view
- No toolbar, zoom, or sparkline effects
- Interactive tooltip on hover showing formatted dollar amounts with thousand separators

Layout Structure:

- Vertical flex container with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Top section (header): Vertical flex with metric information
  - Label: "Total Revenue" (text-md, base-content/50, font-semibold)
  - Value: "$25,864" (text-3xl, font-semibold, base-content)
  - Growth indicator badge: "+14.5%" (green success color badge)
    - Background: success/10 (light green background)
    - Text: text-success (green text)
    - Padding: px-2 py-1 with rounded corners (rounded-selector)
    - Font: text-xs font-semibold
    - Responsive: mt-2 on mobile, aligned on desktop
- Bottom section: Full width chart container
- Gap between sections: 24px (mb-6) with gap-4

Colors & Styling:

- Line color: var(--color-base-content) - theme adaptive
- Fill gradient: Transparent → solid at 50% offset
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted gray)
  - Value: base-content (prominent, full opacity)
  - Growth: text-success (green for positive trend)
  - Badge background: success/10 (light green)
- All text uses Outfit font family

Interactive Features:

- Custom tooltip on hover:
  - Shows colored indicator dot (size-2) matching line color
  - Displays: "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI: text-base-content, p-3, text-xs
  - Background uses theme colors
  - Positioned near data point
- Tooltip formatter: converts numeric values to currency format ($)
- No click handlers or selections

Use Cases:

- Quarterly performance dashboard
- 6-month revenue tracking
- Mid-year performance review card
- Compact performance metric widget
- Sales dashboard with growth indicator

### path
line-chart-2.md


## Line Chart three
### Description

Multi-Series Revenue Comparison Line Chart - Card layout comparing two subscription plans

Visual Appearance:

- Card-contained line chart displaying 6 months of revenue data for two subscription plans
- Two smooth curved lines representing different plan types:
  - Line 1 (Basic Plan): Full opacity dark line (var(--color-base-content))
  - Line 2 (Premium Plan): 50% transparent lighter line (color-mix 50% transparency)
- Line stroke: 4px width with smooth curve interpolation
- Drop shadow effect: 8px blur, 0.3 opacity, 20px offset on lines
- Visible grid with subtle horizontal lines (color-mix 95% transparency)
- X-axis shows 6 months (Jan to Jun) with 12px labels
- Y-axis hidden from view for clean appearance
- No toolbar, zoom, or legend (uses custom legend below chart)
- Interactive shared tooltip on hover showing both plan values simultaneously

Layout Structure:

- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Responsive padding: p-7 mobile, p-10 desktop
- Height: 480px (h-120)
- Three sections arranged vertically:
  1. Top metric section: Label, value, growth badge, action button
     - Label: "Total Revenue" (text-md, base-content/50, font-semibold)
     - Value: "$25,864" (text-3xl, font-semibold, base-content)
     - Growth badge: "+14.5%" (success/10 background, text-success, px-2 py-1, rounded-selector)
     - Action button: "View report" on the top-right (btn btn-sm, bg-base-300, rounded-field)
     - Responsive: Stacks on mobile (flex-col), horizontal on desktop (sm:flex-row)
  2. Middle: Full width chart container
  3. Bottom: Custom legend with two items
     - Item 1: Dark square + "Basic plan" label
     - Item 2: 50% transparent square + "Premium plan" label
     - Layout: Horizontal flex with gap-4

Colors & Styling:

- Line 1 (Basic Plan): var(--color-base-content) - adapts to theme
- Line 2 (Premium Plan): color-mix(in srgb, var(--color-base-content), transparent 50%) - 50% opacity
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (green badge with success/10 background)
  - Legend: base-content (text-xs)
- Button: bg-base-300 with border-base-content/10
- Legend indicators: size-2 rounded squares matching line colors
- Font family: Outfit throughout

Interactive Features:

- Shared tooltip on hover (shows both plans simultaneously):
  - Displays both series values on the same tooltip
  - For each series shows:
    - Color indicator dot (size-2, rounded-selector)
    - Series name (Basic Plan / Premium Plan)
    - Value with thousand separators and dollar sign ($4,400 format)
  - Styles: p-3, text-xs, py-1 spacing between items
  - Shows gap-4 separation between metric and value
  - Color-coded with matching line colors
- No individual series legend (uses custom legend below)
- Responsive tooltip positioning near cursor

Use Cases:

- Plan performance comparison dashboard
- Revenue tracking across subscription tiers
- 6-month performance review
- Executive summary of plan revenues
- Sales team KPI tracking
- Plan comparison for stakeholder review

### path
line-chart-3.md


## Line Chart Four
### Description

Three-Plan Revenue Comparison Line Chart - Full width dashboard with time period filters and export controls

Visual Appearance:

- Full-width line chart displaying 12 months of annual revenue data for three subscription plans
- Three smooth curved lines with distinct styling for plan differentiation:
  - Line 1 (Basic Plan): Full opacity secondary color solid line (var(--color-secondary))
  - Line 2 (Premium Plan): Full opacity dark line solid line (var(--color-base-content))
  - Line 3 (Enterprise Plan): 30% opacity lighter line with dashed pattern (color-mix 70% transparency)
- Line stroke: 4px width with smooth curve interpolation
- Dash pattern: Enterprise Plan has 5px dashes (dashArray: [0, 0, 5]) for visual distinction
- Drop shadow effect: 8px blur, 0.3 opacity, 20px offset on all lines for depth
- Grid visible with subtle horizontal lines (color-mix 95% transparency)
- X-axis shows all 12 months (Jan through Dec) with 12px labels
- Y-axis hidden from view for clean appearance
- No toolbar, zoom, or sparkline effects
- Interactive shared tooltip on hover showing all three plan values simultaneously

Layout Structure:

- Full-width card layout with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Three sections arranged responsively:
  1. Top-left header section: Title, time period tabs
     - Title: "Total Revenue" (text-lg, font-semibold, base-content)
     - Time period tabs: "Weekly", "Monthly", "Annually" (tabs-box, tabs-xs)
     - "Annually" tab pre-selected (checked)
     - Background: base-300/80 with subtle border
     - Responsive: Stacks on mobile (flex-col), horizontal on tablet+ (md:flex-row)
  2. Top-right action buttons section:
     - Two buttons with rounded corners (rounded-field)
     - Button 1: "View report" (btn btn-sm, bg-base-300)
     - Button 2: "Export" with download icon (btn btn-sm, bg-base-300, ml-2)
     - Icon: SVG download icon (w-4 h-4, geometric precision)
     - Both: Border base-content/10
  3. Middle: Full width chart container (mt spacing)
  4. Gap between header and chart: md:mb-6 (responsive)
- Responsive design: Tabs and buttons flex on desktop, stack on mobile

Colors & Styling:

- Line 1 (Basic Plan): var(--color-secondary) - distinct secondary color
- Line 2 (Premium Plan): var(--color-base-content) - theme adaptive dark color
- Line 3 (Enterprise Plan): color-mix(in srgb, var(--color-base-content), transparent 70%) - 30% opacity lighter
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Card border: base-content/10
- Tab background: base-300/80
- Tab border: base-content/10
- Button background: bg-base-300
- Button border: base-content/10
- Text colors:
  - Title: text-lg, font-semibold, base-content
  - Tooltip text: text-base-content, text-xs
  - Tooltip values: font-semibold
- Font family: Outfit throughout
- Chart height: 300px
- Stroke width: 4px
- Button size: btn-sm (compact)

Interactive Features:

- **Shared tooltip** on hover (shows all three plans simultaneously):
  - Displays all three series values on the same tooltip
  - For each plan shows:
    - Color indicator dot (size-2, rounded-selector, matching line color)
    - Plan name (Basic Plan / Premium Plan / Enterprise Plan)
    - Value with thousand separators and dollar sign ($4,400 format)
  - Layout: Flex row with gap-4 between name and value
  - Vertical spacing: py-1 between items
  - Styled container: p-3 padding, no background specified
  - Text colors: base-content/60 for names, text-base-content font-semibold for values
  - Text size: text-xs
- Time period filter tabs: "Weekly", "Monthly", "Annually"
  - Default selection: "Annually" (for 12-month view)
  - Clicking tabs ready for filtering data (logic to be implemented)
- Export button: Downloads chart/report data (functionality to be implemented)
- View report button: Opens detailed report view (functionality to be implemented)
- Responsive visibility: Tabs and buttons visible on all screen sizes

Use Cases:

- Quarterly subscription plan performance review
- Revenue comparison across all subscription tiers
- Plan adoption and growth tracking
- Executive KPI dashboard
- Sales team performance reporting
- Annual business metrics and planning
- Time-period based revenue analysis (weekly/monthly/annual views)
- Plan tier profitability analysis
- Stakeholder reporting and presentations

### path
line-chart-4.md


## Line Chart Five
### Description

Monthly Revenue Line Chart - Full width dashboard card with metrics and filters

Visual Appearance:

- Full-width line chart with drop shadow effect (8px blur, 0.3 opacity, 20px offset)
- Single curved line representing monthly revenue data
- Line stroke: 4px width with smooth curve interpolation
- Color: var(--color-base-content) - adapts to light/dark theme
- Gradient fill below line: starts transparent, peaks at 10-90% offset, fades to transparent
- Grid visible with subtle borders (color-mix 95% transparency)
- X-axis shows 12 months (Jan to Dec) with 12px labels
- Y-axis hidden from view
- No toolbar, zoom, or sparkline effects
- Interactive tooltip on hover with formatted values

Layout Structure:

- Vertical flex container with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Top section (header): Flex row, responsive to column on mobile
  - Left side: Metric information
    - Label: "Total Revenue" (text-md, base-content/50, font-semibold)
    - Value: "$45,864" (text-3xl, font-semibold, base-content)
    - Growth indicator: "+10% vs Last Year" (text-success, text-xs)
  - Right side: Time period filter tabs (hidden on mobile, visible md:block)
    - Three tab buttons: "Weekly", "Monthly", "Annually"
    - "Annually" tab is pre-selected (checked)
    - Background: base-300/80 with subtle border
    - Tab styling: tabs-box, tabs-xs classes
- Bottom section: Full width chart container
- Height: 480px (h-120 in Tailwind)
- Gap between sections: 24px (mb-6)

Colors & Styling:

- Line color: var(--color-base-content) - theme adaptive
- Fill gradient: Multiple color stops from transparent to solid
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Title: base-content/50 (muted)
  - Value: base-content (prominent)
  - Growth: text-success (positive indicator)
  - Supporting text: base-content/80

Interactive Features:

- Custom tooltip on hover:
  - Shows colored indicator dot matching line color
  - Displays: "Revenue: $[value]" with thousand separators
  - Styled with DaisyUI: text-base-content, p-3, text-xs
  - Positioned near cursor
- Tooltip formatter: adds dollar sign and thousand separators
- Tab switching (for time period selection) - UI prepared, logic to be implemented

Use Cases:

- Main dashboard chart showing annual revenue trend
- Revenue tracking with time period filtering
- Business intelligence and analytics dashboard
- Sales reporting with trend visualization

### path
line-chart-5.md


## Line Chart Six
### Description

Multi-Series Revenue Comparison Line Chart - Card layout comparing two subscription plans

Visual Appearance:

- Card-contained line chart displaying 6 months of revenue data for two subscription plans
- Two smooth curved lines representing different plan types:
  - Line 1 (Basic Plan): Full opacity dark line (var(--color-base-content))
  - Line 2 (Premium Plan): 50% transparent lighter line (color-mix 50% transparency)
- Line stroke: 4px width with smooth curve interpolation
- Drop shadow effect: 8px blur, 0.3 opacity, 20px offset on lines
- Visible grid with subtle horizontal lines (color-mix 95% transparency)
- X-axis shows 6 months (Jan to Jun) with 12px labels
- Y-axis hidden from view for clean appearance
- No toolbar, zoom, or legend
- Interactive shared tooltip on hover showing both plan values simultaneously

Layout Structure:

- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Responsive padding: p-7 mobile, p-10 desktop
- Height: 480px (h-120)
- Top section (header): Horizontal flex with Label, value, growth badge on left, dropdown on right
  - Left side:
    - Label: "Total Revenue" (text-md, base-content/50, font-semibold)
    - Value: "$25,864" (text-3xl, font-semibold, base-content)
    - Growth badge: "+14.5%" (text-xs, font-semibold, text-success, bg-success/10, rounded-selector)
  - Right side:
    - Dropdown: With options for different time ranges "Last 12 months" is pre-selected (checked) (select-sm, w-36, rounded-field, bg-base-200, shadow-2xl, border-base-content/10)
- Bottom section: Full width chart container

Colors & Styling:

- Line 1 (Basic Plan): var(--color-base-content) - adapts to theme
- Line 2 (Premium Plan): color-mix(in srgb, var(--color-base-content), transparent 50%) - 50% opacity
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Border: base-content/10
- Text colors:
  - Label: base-content/50
  - Value: base-content
  - Growth: text-success (green badge with success/10 background)
- Font family: Outfit throughout

Interactive Features:

- Shared tooltip on hover (shows both plans simultaneously):
  - Displays both series values on the same tooltip
  - For each series shows:
    - Color indicator dot (size-2, rounded-selector)
    - Series name (Basic Plan / Premium Plan)
    - Value with thousand separators and dollar sign ($4,400 format)
  - Styles: p-3, text-xs, py-1 spacing between items
  - Shows gap-4 separation between metric and value
  - Color-coded with matching line colors
- Responsive tooltip positioning near cursor

Use Cases:

- Plan performance comparison dashboard
- Revenue tracking across subscription tiers
- 6-month performance review
- Executive summary of plan revenues
- Sales team KPI tracking
- Plan comparison for stakeholder review

### path
line-chart-6.md


## Line Chart Seven
### Description

Compact Revenue Sparkline Widget - Mini chart in dashboard card

Visual Appearance:

- Minimal 144px × 96px line chart
- No axes, grid, or labels - extremely clean
- Single curved line in base-content color
- 3px stroke width with smooth curves
- Embedded in card next to metric info

Layout Structure:

- Horizontal flex: metrics on left, chart on right
- Left: "Total Revenue" label, "$25,867" title, "14.5%" growth
- Right: Mini chart in 144px × 96px container
- Responsive: stays same size on all screens

Colors & Styling:

- Line color: var(--color-base-content) - adapts to theme
- Card background: base-200/80
- Border: base-content/10
- Text: base-content / base-content/60

Data Series:

- Series: "Revenue"
- Range: 4000 to 5000

Interactive Behavior:

- No interactions - static display
- Tooltip disabled
- Zoom disabled

Use Cases:

- Dashboard KPI widget
- Metric card showing trend
- Mobile-friendly performance display
- At-a-glance revenue overview

### path
line-chart-7.md


## Line Chart Eight
### Description

Compact Revenue Sparkline Widget with a payout button - Mini chart in dashboard card

Visual Appearance:

- Minimal 144px × 96px line chart
- No axes, grid, or labels - extremely clean
- Single curved line in base-content color
- 3px stroke width with smooth curves
- Embedded in card next to metric info

Layout Structure:

- Horizontal flex: metrics on left, chart on right
- Left: "Total Revenue" label, "$25,867" title, "payout" button
- Right: Mini chart in 144px × 96px container
- Responsive: stays same size on all screens

Colors & Styling:

- Line color: var(--color-base-content) - adapts to theme
- Card background: base-200/80
- Border: base-content/10
- Text: base-content / base-content/60

Data Series:

- Series: "Revenue"
- Range: 4000 to 5000

Interactive Behavior:

- No interactions - static display
- Tooltip disabled
- Zoom disabled

Use Cases:

- Dashboard KPI widget
- Metric card showing trend
- Mobile-friendly performance display
- At-a-glance revenue overview

### path
line-chart-8.md


## Line Chart Nine
### Description

Year-over-Year Revenue Comparison Line Chart - Full width dashboard with plan filters and legend

Visual Appearance:

- Full-width line chart displaying 12 months of annual revenue data for three performance metrics
- Three smooth curved lines representing different time periods and targets:
  - Line 1 (This Year): Full opacity dark line (var(--color-base-content)) - current year performance
  - Line 2 (Last Year): 30% transparent lighter line (color-mix 30% transparency) - previous year comparison
  - Line 3 (Target): Full opacity secondary color line (var(--color-secondary)) - goal line
- Line stroke: 4px width with smooth curve interpolation
- Drop shadow effect: 8px blur, 0.3 opacity, 20px offset on all lines for depth
- Grid visible with subtle horizontal lines (color-mix 95% transparency)
- X-axis shows all 12 months (Jan through Dec) with 12px labels
- Y-axis hidden from view for clean appearance
- No toolbar, zoom, or sparkline effects
- Interactive shared tooltip on hover showing all three metrics simultaneously

Layout Structure:

- Full-width card layout with responsive padding (p-7 mobile, p-10 desktop)
- Card background: base-200/80 with rounded corners (rounded-box)
- Border: base-content/10 subtle border
- Height: 480px (h-120)
- Gap between sections: mb-6
- Top section (header): Horizontal flex with plan tabs on left, legend on right
  - Left side: Tab filter buttons (Basic, Premium, Enterprise)
    - Background: base-300/80 with border
    - Styling: tabs-box, tabs-xs classes for compact appearance
    - "Basic" tab pre-selected (checked)
    - Padding: py-1 for vertical spacing
  - Right side: Three legend items stacked vertically
    - Item 1: Dark circle indicator + "This Year: $200.26k"
    - Item 2: 70% opacity circle + "Last Year: $140.60k"
    - Item 3: Secondary color circle + "Target: $250K"
    - Layout: flex-col with gap-3
    - Gap between indicator and text: gap-2
- Bottom section: Full width chart container
- Responsive: Tabs on left, legend on right (horizontal layout maintained)

Colors & Styling:

- Line 1 (This Year): var(--color-base-content) - theme adaptive dark color
- Line 2 (Last Year): color-mix(in srgb, var(--color-base-content), transparent 30%) - 70% opacity
- Line 3 (Target): var(--color-secondary) - distinct secondary color for goal line
- Grid color: color-mix(in srgb, var(--color-base-content), transparent 95%)
- Card background: base-200/80
- Card border: base-content/10
- Tab background: base-300/80
- Tab border: base-content/10
- Text colors:
  - Legend items: text-xs, base-content (full opacity)
  - Values: font-semibold for emphasis
  - Tooltip: text-base-content, text-xs
- Legend indicators: w-2.5 h-2.5 rounded-full (circular dots)
  - This Year: bg-base-content (full opacity)
  - Last Year: bg-base-content/70 (70% opacity)
  - Target: bg-secondary (secondary color)
- Font family: Outfit throughout
- Chart height: 300px

Interactive Features:

- **Shared tooltip** on hover (shows all three metrics simultaneously):
  - Displays all three series values on the same tooltip
  - For each series shows:
    - Color indicator dot (size-2, rounded-selector)
    - Series name (This Year / Last Year / Target)
    - Value with thousand separators and dollar sign ($4,400 format)
  - Layout: Flex row with gap-4 between name and value
  - Vertical spacing: py-1 between items
  - Styled container: p-3 padding
  - Text colors: base-content/60 for names, text-base-content font-semibold for values
  - Text size: text-xs
- Tab filter on hover/click (UI prepared for switching between Basic, Premium, Enterprise plans)
- Responsive tooltip positioning near cursor

Use Cases:

- Annual performance review dashboard
- Year-over-year revenue comparison
- Target achievement tracking
- Sales plan performance analysis
- Subscription tier comparison (Basic, Premium, Enterprise)
- Goal tracking across the full year
- Multi-plan revenue visualization
- Forecast vs actual reporting
- Annual business metrics review

### path
line-chart-9.md

