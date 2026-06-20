# Linear Design System Documentation

## Overview

Linear is a project management and issue tracking application with a sophisticated dark-mode interface. This documentation captures the design system elements, patterns, and specifications observed in the Linear web application.

—

1. ## Color Palette

### Background Colors (Dark Mode)

| Token | Hex Value | Usage |  
|-------|-----------|-------|  
| sidebar | \#090909 | Sidebar background, near black |  
| base | \#101012 | Main content area background |  
| card | \#17181a | Cards, elevated surfaces |  
| hover | \#1e2024 | Hover states on surfaces |  
| border | \#23252a | Border lines, dividers |

### Text Colors

| Token | Hex Value | Usage |  
|-------|-----------|-------|  
| primary | \#ffffff | Primary text, headings |  
| secondary | \#6b6f76 | Secondary text, muted content |  
| tertiary | \#545760 | Disabled text, placeholders |  
| link | \#5e6ad2 | Links, interactive text |

### Brand Colors

| Token | Hex Value | Usage |  
|-------|-----------|-------|  
| purple | \#5e6ad2 | Primary brand color, buttons |  
| purpleHover | \#6c77db | Hover state for purple |

### Semantic Colors

| Token | Hex Value | Usage |  
|-------|-----------|-------|  
| success | \#59a200 | Success states, Active status |  
| warning | \#f2c94c | Warning states, In Progress |  
| error | \#eb5757 | Error states, Bug labels |  
| info | \#2f80ed | Information, Done status |

### Status Colors

| Status | Hex Value | Icon Style |  
|--------|-----------|------------|  
| Backlog | \#95979d | Dotted circle |  
| Todo | \#e8e8e8 | Empty circle outline |  
| In Progress | \#f2c94c | Yellow filled circle |  
| In Review | \#f2c94c | Yellow filled circle |  
| Done | \#5e6ad2 | Blue checkmark |  
| Canceled | \#95979d | Gray X |  
| Duplicate | \#95979d | Gray icon |

### Priority Colors

| Priority | Hex Value | Icon |  
|----------|-----------|------|  
| Urgent | \#eb5757 | Red/orange signal bars |  
| High | \#f2994a | Orange signal bars |  
| Medium | \#f2c94c | Yellow signal bars |  
| Low | \#6fcf97 | Green signal bars |  
| None | \#95979d | Gray dashes |

### Label Colors

Labels in Linear use a color palette including: \#eb5757 (red), \#f2994a (orange), \#f2c94c (yellow), \#6fcf97 (green), \#56ccf2 (teal), \#2f80ed (blue), \#9b51e0 (purple), \#f178b6 (pink)

—

2. ## Typography

### Font Families

**Primary Font (Sans-serif):**  
`”Inter Variable”, “SF Pro Display”, -apple-system, system-ui, “Segoe UI”, Roboto, Oxygen, Ubuntu, Cantarell, “Open Sans”, “Helvetica Neue”, sans-serif`

**Monospace Font:**  
`”Berkeley Mono”, “SFMono Regular”, Consolas, “Liberation Mono”, Menlo, Courier, monospace`

### Font Sizes

| Token | Size | Usage |  
|-------|------|-------|  
| xs | 11px | Labels, badges, timestamps |  
| sm | 12px | Secondary text, captions |  
| base | 13px | Default body text |  
| md | 14px | Slightly larger body text |  
| lg | 16px | Section headers, nav items |  
| xl | 18px | Page subtitles |  
| 2xl | 20px | Page titles |  
| 3xl | 24px | Large headings |

### Font Weights

| Weight | Value | Usage |  
|--------|-------|-------|  
| normal | 400 | Body text |  
| medium | 500 | Emphasized text |  
| semibold | 600 | Buttons, navigation |  
| bold | 700 | Headings |

### Line Heights

| Token | Value | Usage |  
|-------|-------|-------|  
| tight | 1.2 | Headings |  
| base | 1.4 | Default text |  
| relaxed | 1.5 | Paragraph text |

—

3. ## Spacing System

Linear uses a 4px base spacing unit.

| Token | Value | Usage |  
|-------|-------|-------|  
| 0 | 0px | No spacing |  
| 1 | 4px | Tight spacing |  
| 2 | 8px | Small gaps |  
| 3 | 12px | Default component padding |  
| 4 | 16px | Standard spacing |  
| 5 | 20px | Medium spacing |  
| 6 | 24px | Section gaps |  
| 8 | 32px | Large spacing |  
| 10 | 40px | Extra large spacing |  
| 12 | 48px | Maximum spacing |

### Sidebar Width

- Default: 244px

—

4. ## Border Radius

| Token | Value | Usage |  
|-------|-------|-------|  
| none | 0px | Sharp corners |  
| sm | 2px | Subtle rounding |  
| base | 4px | Default (buttons, inputs) |  
| md | 6px | Cards, dropdowns |  
| lg | 8px | Modals, dialogs |  
| xl | 12px | Large cards |  
| full | 9999px | Pills, avatars, badges |

—

5. ## Shadows & Elevation

| Token | Value | Usage |  
|-------|-------|-------|  
| sm | 0 1px 2px rgba(0,0,0,0.3) | Subtle elevation |  
| base | 0 2px 4px rgba(0,0,0,0.3) | Default cards |  
| md | 0 4px 8px rgba(0,0,0,0.3) | Dropdowns |  
| lg | 0 8px 16px rgba(0,0,0,0.4) | Popovers |  
| modal | 0 16px 48px rgba(0,0,0,0.5) | Modals, dialogs |

—

6. ## Components

### Buttons

**Primary Button:**

- Background: \#5e6ad2 (purple)  
- \- Text: \#ffffff  
- \- Border Radius: 4px  
- \- Padding: 4px 12px  
- \- Font Weight: 500

**Secondary/Ghost Button:**

- Background: transparent or \#23252a  
- \- Text: \#ffffff or \#6b6f76  
- \- Border: 1px solid \#23252a  
- \- Border Radius: 4px

**Destructive Button:**

- Background: \#eb5757  
- \- Text: \#ffffff

### Button States

- Hover: Lighter shade (10% lightened)  
- \- Active: Slightly darker  
- \- Disabled: opacity 0.5, cursor not-allowed  
- \- Focus: Ring outline (2px)

### Inputs

**Text Input:**

- Background: \#17181a  
- \- Border: 1px solid \#23252a  
- \- Border Radius: 4px  
- \- Padding: 8px 12px  
- \- Placeholder Color: \#545760

**Search Input:**

- Same as text input  
- \- Left icon (search magnifying glass)  
- \- Keyboard shortcut badge (“/”)

### Dropdowns & Select

**Dropdown Menu:**

- Background: \#17181a  
- \- Border: 1px solid \#23252a  
- \- Border Radius: 6px  
- \- Shadow: md shadow  
- \- Item Padding: 8px 12px  
- \- Hover State: \#1e2024 background

**Select/Combobox:**

- Search input at top  
- \- Grouped items with section headers  
- \- Keyboard navigation supported  
- \- Checkmark for selected item

### Toggles & Switches

- Track width: 36px  
- \- Track height: 20px  
- \- Border radius: full (pill shape)  
- \- Off state: \#23252a background  
- \- On state: \#5e6ad2 (purple) background  
- \- Knob: white circle

### Tabs

**Pill Tabs (segmented control):**

- Background: \#17181a  
- \- Active tab: \#ffffff text, \#23252a background  
- \- Inactive: \#6b6f76 text  
- \- Border radius: 4px

**Underline Tabs:**

- Active: white text, purple underline  
- \- Inactive: gray text

### Badges & Tags

**Status Badge:**

- Background: status color at \~20% opacity  
- \- Text: status color  
- \- Border radius: 4px  
- \- Padding: 2px 6px

**Label Badge:**

- Colored dot (circle) \+ text  
- \- Dot size: 8px

### Cards

**Issue Card/Row:**

- Background: transparent (inherits)  
- \- Hover: \#1e2024 background  
- \- Border bottom: 1px solid \#23252a  
- \- Padding: 12px

**Project Card:**

- Background: \#17181a  
- \- Border radius: 8px  
- \- Padding: 16px

### Modals & Dialogs

**Modal:**

- Background: \#17181a  
- \- Border radius: 8px  
- \- Shadow: modal shadow  
- \- Max width: 560px (default), 720px (large)  
- \- Header with close button (X)  
- \- Footer with action buttons

**Command Palette:**

- Centered modal  
- \- Search input at top  
- \- Grouped action items  
- \- Keyboard shortcuts displayed

### Navigation

**Sidebar:**

- Width: 244px  
- \- Background: \#090909  
- \- Collapsible sections  
- \- Tree structure for teams

**Sidebar Item:**

- Padding: 6px 12px  
- \- Border radius: 4px  
- \- Hover: \#1e2024  
- \- Active: \#23252a  
- \- Icon \+ text

**Breadcrumbs:**

- Text: secondary color  
- \- Separator: “›” chevron  
- \- Clickable links

### Avatars

- Sizes: 20px, 24px, 32px, 40px  
- \- Border radius: full (circle)  
- \- Fallback: initials on colored background

### Icons

**Icon Style:**

- Outline/stroke style  
- \- Stroke width: 1.5px  
- \- Sizes: 16px, 20px, 24px  
- \- Color: inherits text color

**Common Icons:**

- Search (magnifying glass)  
- \- Plus (create new)  
- \- X (close)  
- \- Chevron (expand/collapse)  
- \- Three dots (more actions)

### Empty States

**Empty State Pattern:**

- Centered illustration (line art style)  
- \- Heading text  
- \- Description paragraph  
- \- Primary action button  
- \- Optional secondary button

### Loading States

- Spinner: circular, purple/white  
- \- Skeleton: subtle gray rectangles with pulse animation

### Tooltips

- Background: \#23252a  
- \- Text: \#ffffff  
- \- Border radius: 4px  
- \- Padding: 4px 8px  
- \- Small arrow pointing to trigger  
- \- Delay: \~300ms

—

7. ## Interaction Patterns

### Hover States

- Background lightens by \~5%  
- \- Text may become brighter  
- \- Action buttons appear (e.g., more menu)

### Focus States

- Focus ring: 2px solid purple outline  
- \- Offset: 2px

### Active/Pressed States

- Slightly darker background  
- \- Scale: 0.98 (subtle press effect)

### Disabled States

- Opacity: 0.5  
- \- Cursor: not-allowed  
- \- No hover effects

### Transitions & Animations

- Duration: 150ms (fast), 200ms (default), 300ms (slow)  
- \- Easing: ease-out (default)  
- \- Properties: background-color, color, opacity, transform

—

8. ## Layout Patterns

### Page Structure

- Fixed sidebar (244px)  
- \- Main content area (flexible)  
- \- Optional right panel (properties, 300px)

### Issue List

- Group headers (collapsible)  
- \- Issue rows with status, ID, title, metadata  
- \- Inline quick actions on hover

### Table/Grid View

- Column headers (sortable)  
- \- Row hover states  
- \- Action column (more menu)

### Properties Panel (Issue Detail)

- Right-aligned sidebar  
- \- Field groups: Status, Priority, Assignee, Labels, Project  
- \- Clickable fields open dropdown selectors

—

9. ## Keyboard Shortcuts

Linear heavily supports keyboard navigation:

- `Cmd+K` / `Ctrl+K`: Command palette  
- \- `C`: Create new issue  
- \- `V`: Create issue in fullscreen  
- \- `G then S`: Go to settings  
- \- `N then P`: New project  
- \- `/`: Focus search

—

10. ## Dark Mode Observations

Linear’s design is dark-mode first. Key observations:

- Near-black backgrounds (\#090909 to \#101012)  
- \- High contrast white text (\#ffffff)  
- \- Purple as primary accent (\#5e6ad2)  
- \- Subtle borders (\#23252a)  
- \- Reduced opacity for hover states  
- \- Consistent use of semantic colors across status, priority, and labels

### Light Mode (observed in settings)

Light mode uses inverted values:

- Sidebar: \#f5f5f5  
- \- Base: \#fcfcfc  
- \- Border: \#e0e0e0  
- \- Text: \#23252a (dark gray)

—

## Summary

Linear’s design system demonstrates a polished, modern SaaS aesthetic with consistent spacing based on a 4px grid system, Inter font family, and a sophisticated dark color palette. The purple brand color provides strong visual identity while semantic colors maintain clear meaning for status indicators and priority levels. Components are minimalist yet functional, with careful attention to interaction states and keyboard accessibility.