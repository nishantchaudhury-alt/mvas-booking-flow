# MVAS Booking Flow — UI/UX Audit

Audit date: 2026-09-23  
Scope: live sailing-selection screen plus booking-flow source  
Method: UI/UX Pro Max review, MVAS visual-language check, live browser inspection, source inspection, and contrast calculation

## Executive summary

The design already has a strong product direction: a calm, compact operations UI with a clear navy interaction language, white work surfaces, persistent booking context, and thoughtful focus treatment.

The largest design-system risk is not the visual direction; it is fragmentation. Core colors exist in `WF`, but screens restate colors, sizes, shadows, states, and components inline. The baseline contains 444 six-digit color occurrences representing 104 unique values. That makes accessibility improvements and visual consistency expensive to maintain.

The new foundation keeps the current visual language, centralizes the high-value decisions, and gives future component work a stable contract. The product-wide migration now enforces a strict 4px rhythm for margins, padding, and gaps, plus an even-number type scale with a 12px floor.

## Foundation migration evidence

- Visible text sizes are restricted to 12, 14, 16, 20, 24, 32, and 40px.
- Text roles pair those sizes with 16, 20, 24, 28, 32, 40, and 48px line heights; `line-height: 1` remains limited to single-line glyph/control geometry.
- Font weights are restricted to the loaded Inter weights: 400, 500, 600, and 700.
- Margins, padding, and layout gaps use 4px increments throughout the integrated flow and both portable components.
- Borders, radii, icon/SVG geometry, transforms, and component dimensions remain independent scales.
- Two `-1px` border-overlap seams are intentionally allowlisted as geometry, not spacing.
- `node design-system/validate-foundation.mjs` prevents the old 11px/13px type, unpaired text leading, and off-grid whitespace from returning.

## What is working well

- The interaction hierarchy is easy to read: navy actions, light selected surfaces, and semantic status colors.
- White panels on a cool-grey canvas create clear work zones without heavy decoration.
- The persistent stepper and summary rail support orientation and price confidence.
- Core ink values are contrast-aware: primary, secondary, label, and muted text pairs meet AA on their intended surfaces.
- The global `:focus-visible` treatment is strong and editable controls use a clearer boundary than passive cards.
- Many controls already expose useful `aria-expanded`, `aria-pressed`, `aria-checked`, and descriptive labels.
- The logo has meaningful alternative text, and most status treatments pair color with text or shape.
- The live prototype produced no application errors; only the expected Babel-in-browser development warning was present.

## Evidence snapshot

| Check | Result |
|---|---|
| Live viewport | 1327 × 969; no horizontal overflow |
| 1024px viewport | Document remains 1180px wide; horizontal pan required |
| 768px viewport | Document remains 1180px wide; horizontal pan required |
| Visible interactive elements on audited screen | 35 |
| Controls under 32px high | 17 |
| Controls under 24px high | 3 |
| Six-digit color occurrences | 444 |
| Unique six-digit colors | 104 |
| Core text contrast | 4.71:1–17.85:1 on intended light surfaces |
| Control boundary contrast | 3.47:1 on white |
| Sidebar active white/red | 5.41:1 |
| Sidebar coral/navy | 6.10:1 |

## Prioritized findings

### P0 — Correct before production

1. **Two small-text color pairs miss WCAG AA.** Blue `#3B82F6` on the informational tint is about 3.45:1, and green `#059669` on the success tint is about 3.60:1. Evidence: `screens/step2-deck-map.jsx` selected-room summary and `screens/summary-panel.jsx` applied-promotion row.  
   **Foundation action:** introduced tested `info` and `success` text roles and applied them to those two states.

2. **Small-screen reflow is intentionally replaced with a fixed 1180px canvas.** At 1024px and 768px, the interface requires horizontal panning while global scrollbar styling hides the affordance. Evidence: the `@media (max-width: 1100px)` block in `Unified Booking Flow Final.html`.  
   **Recommendation:** define an adaptive shell mode: collapse or overlay the sidebar first, then stack or drawer the summary rail. Until then, keep horizontal scrolling discoverable and describe the app as desktop-only.

3. **Dialog focus management is incomplete.** Guest and supplement dialogs handle Escape and body scroll, but do not consistently set initial focus, contain focus, inert the background, or restore trigger focus. The review edit overlay also lacks a complete dialog contract.  
   **Recommendation:** build one shared `Dialog` primitive before adding more modals.

4. **A customer-result selection pattern is mouse-only.** Clickable result rows in the review editor are styled `div` elements without button/listbox semantics or keyboard activation.  
   **Recommendation:** render results as buttons or implement a complete listbox/option interaction.

### P1 — Foundation and workflow quality

5. **Blank guest records can satisfy the Review gate.** Completion is inferred from stored keys rather than validated required identity fields.  
   **Recommendation:** validate required fields, place errors beside fields, announce them, and focus the first invalid control.

6. **Control sizes are inconsistent and frequently very small.** Visible examples include 20px steppers, 28px segmented controls, and 30px calendar navigation. Compact desktop controls are appropriate, but visual size and hit area are not separated.  
   **Foundation action:** established compact/default control heights and a 44px hit-target contract.

7. **The shell lacks semantic landmarks and includes false affordances.** Sidebar items and the top search treatment look interactive but are generic elements; page titles are often styled `div` elements.  
   **Recommendation:** use `header`, `nav`, `main`, and `aside`; convert navigation to links/buttons; make the search functional or clearly noninteractive; use real headings.

8. **Step changes do not participate in browser history or route focus.** The flow mutates state without changing the URL, document title, or focus target.  
   **Recommendation:** add hash/history routing, a per-step document title, and heading focus after navigation.

### P2 — Consistency and maintainability

9. **Motion values are ad hoc and reduced-motion support was missing.** Transitions span roughly 100–250ms and often use `transition: all`.  
   **Foundation action:** added motion tokens and a global reduced-motion override. Future migration should replace `all` with explicit properties.

10. **The live flow rebuilds common components inline.** The repository contains nominal primitives, but buttons, fields, steppers, cards, badges, dialogs, and progress indicators are repeatedly reimplemented. Type sizes, radii, shadows, opacity, and z-index drift as a result.  
    **Foundation action:** created primitive → semantic → component tokens and documented the first component contracts in `MASTER.md`.

## Design recommendation reconciliation

UI/UX Pro Max correctly classified the product as a **data-dense operations dashboard** and reinforced the need for scannability, status colors, visible focus, progress, and responsive checks.

Its generic palette and font recommendation were intentionally not adopted. A green CTA, a second blue interaction family, and Fira typography would conflict with the MVAS product language. The project-specific direction takes precedence:

- Inter remains the only body/display family.
- `#1B2434` remains the only general action/selection color.
- Green remains status-only.
- The existing brand-red sidebar treatment is documented as a shell-only exception.

## Recommended implementation sequence

1. Keep the foundation validator green and use semantic/component tokens in new work.
2. Build shared Button, Field, Badge, Surface, and ProgressStepper components.
3. Build an accessible Dialog/Popover layer and migrate existing overlays.
4. Fix guest validation and keyboard-complete selection patterns.
5. Define an adaptive shell behavior for widths below 1180px.
6. Continue replacing repeated color, radius, shadow, and layer literals with token contracts.

## Audit boundaries

This pass did not redesign the booking workflow, change pricing/business behavior, round borders or icon geometry, or alter the desktop shell model. It normalized product whitespace and typography; component consolidation and layout adaptation remain deliberate follow-up work.
