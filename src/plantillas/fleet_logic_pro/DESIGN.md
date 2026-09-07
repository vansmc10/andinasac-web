# Design System Document: Logistics Fleet Management

## 1. Overview & Creative North Star: "The Kinetic Architect"

In the world of high-stakes logistics, data is often treated as a burden to be managed. This design system refines that data into a tool for mastery. Our Creative North Star, **"The Kinetic Architect,"** moves away from the static, boxy layouts of traditional SaaS dashboards and toward a fluid, editorial experience. 

We prioritize **Data Density with Grace**. Instead of overwhelming the user with a "cockpit" of borders and lines, we use sophisticated tonal layering and intentional asymmetry to guide the eye. The experience should feel like a high-end architectural blueprint: precise, authoritative, and breathable. We break the "template" look by using exaggerated typographic scales and overlapping surfaces that suggest movement and momentum.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

This design system utilizes a sophisticated palette of deep blues and airy neutrals. The goal is to create a UI that feels "carved" rather than "assembled."

### Color Roles
- **Primary (`#4f6073` / `primary`):** Used for critical actions and brand presence.
- **Surface (`#f7fafc` / `surface`):** The canvas. A clean, cool-toned base.
- **Surface Containers (`lowest` to `highest`):** Our primary tool for hierarchy.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or cards. 
Boundaries are created exclusively through background color shifts. For example:
- A `surface-container-low` section sitting on a `surface` background.
- A `surface-container-highest` card to denote high-priority alerts.
This creates a seamless, modern aesthetic that feels significantly more premium than standard grid-based layouts.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the following nesting logic:
1. **The Base:** `surface` (Global background).
2. **The Section:** `surface-container-low` (Sidebars or grouping containers).
3. **The Component:** `surface-container-lowest` (White cards/interactive items).
4. **The Detail:** `surface-container-high` (In-card nesting or data tables).

### The Glass & Gradient Rule
For floating elements, such as map tooltips or mobile overlays, use **Glassmorphism**. Apply `surface-container-lowest` with a 70-80% opacity and a `backdrop-filter: blur(12px)`. For main CTAs, use a subtle linear gradient from `primary` to `primary-dim` (top-to-bottom) to add "soul" and weight.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance character with utility.

- **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-lg` and `headline-md` for high-level fleet metrics. These should feel intentional and bold, creating an editorial "header" feel for every page.
- **Body & Interface (Inter):** The workhorse. Inter’s tall x-height ensures readability at the high data densities required for fleet management.

**Hierarchy as Brand:** Use `label-sm` in all-caps with `0.05em` letter-spacing for metadata (e.g., "TRUCK ID", "LAT/LONG"). This contrasts against `title-lg` values to create an immediate sense of professional hierarchy.

---

## 4. Elevation & Depth: Tonal Layering

We reject the traditional drop-shadow. Instead, we use light and tone.

### The Layering Principle
Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a "natural lift" that is easier on the eyes than a heavy shadow.

### Ambient Shadows
If a floating effect is required (e.g., a "Live Fleet" map overlay):
- **Blur:** 24px - 40px.
- **Opacity:** 4% - 6%.
- **Color:** Use a tinted version of `on-surface` (never pure black).

### The "Ghost Border" Fallback
If accessibility requirements demand a container boundary, use the **Ghost Border**: `outline-variant` at 15% opacity. It provides a visual hint without breaking the "No-Line" philosophy.

---

## 5. Components

### Sidebar Navigation
- **Structure:** No border. Use `surface-container-low` to distinguish from the main stage. 
- **Active State:** Instead of a full-color box, use a vertical "pill" indicator (4px width) of `primary` and a `surface-container-high` background for the row.

### Data Cards & Tables
- **Forbid Dividers:** Do not use horizontal lines between rows. Use `8px` of vertical white space and a 1-step tonal shift (`surface-container-low` vs `surface-container-lowest`) on hover.
- **Data Density:** Use `body-sm` for table data to maximize information density without clutter.

### Interactive Map Elements
- **Containers:** Use Glassmorphism (80% opacity `surface`) for map controls.
- **Roundedness:** Apply `xl` (0.75rem) to map overlays to contrast against the more rigid `sm` (0.125rem) used for data tables.

### Input Fields
- **Style:** Understated. Use `surface-container-highest` for the field background with a `Ghost Border`.
- **States:** On focus, transition the border to `primary` with a 2px thickness.

### Buttons
- **Primary:** `primary` fill, `on-primary` text. No border. `md` (0.375rem) roundedness.
- **Secondary:** `surface-container-high` background with `on-surface` text.
- **Tertiary:** Purely typographic, using `primary` for the text color and `label-md` for the scale.

---

## 6. Do’s and Don’ts

### Do
- **Use White Space as a Separator:** Let the `surface` colors do the work.
- **Prioritize Alignment:** In a "No-Line" system, alignment is the only thing maintaining order. Use a strict 8px grid.
- **Embrace Asymmetry:** Place a large `display-sm` metric in the top left, but balance it with a dense `surface-container-low` table in the bottom right.

### Don’t
- **Don’t use 100% Black:** It kills the "architectural" depth of the dark blue and gray palette. Use `on-surface` instead.
- **Don’t use High-Contrast Dividers:** If you feel the need for a line, add 16px of padding instead.
- **Don’t Over-Shadow:** If more than two elements have shadows, the layout will feel "pasted on" rather than integrated.