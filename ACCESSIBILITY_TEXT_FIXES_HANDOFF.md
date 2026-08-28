# Accessibility and Text Quality Handoff

Last updated: August 27, 2026  
Reference commit: `9d3c64c` (`Refine booking flow and stateroom assignment`)

## Purpose

Use this document to apply the same accessibility and text-quality improvements to another related booking product. The guidance is implementation-oriented and can be adapted to React, another component framework, or server-rendered HTML.

This is not a WCAG certification. It documents the fixes applied to the MVAS booking-flow prototype and identifies the remaining checks required before claiming conformance.

## Outcomes to reproduce

- Small operational text remains readable without browser zoom.
- Keyboard users can identify the currently focused control.
- Inputs remain visually identifiable against white and grey surfaces.
- Controls expose their state and purpose to assistive technology.
- Dynamic status changes use explicit text instead of color alone.
- Labels and actions use consistent sentence case.
- Inventory, availability, assignment, and status terms do not contradict each other.
- Dense or scrollable interfaces keep their continuation discoverable.

## 1. Text size and hierarchy

Do not use microcopy below 11px for visible interface text.

Recommended scale:

| Purpose | Size | Weight |
| --- | ---: | ---: |
| Page title | 19–22px | 700 |
| Modal title | 15–16px | 700–750 |
| Section or card title | 12–14px | 700–750 |
| Standard body and controls | 12–13px | 500–700 |
| Metadata and helper text | 11px minimum | 400–600 |
| Important codes and values | 12–15px | 700–800 |

Use weight, spacing, and neutral color before introducing additional accent colors.

For an existing application with scattered inline font sizes, first inventory every value below 11px. Replace those values in the owning components or typography tokens. A global override can be used temporarily during migration, but it should not be the long-term architecture.

```css
:root {
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-label: #64748b;
  --text-placeholder: #5f6f85;
}

.text-body {
  color: var(--text-primary);
  font-size: 13px;
}

.text-meta {
  color: var(--text-secondary);
  font-size: 11px;
}
```

## 2. Contrast and editable controls

White inputs on white panels need a stronger boundary than passive cards and table rows.

```css
input:not([type="checkbox"]):not([type="radio"]),
textarea,
select {
  border: 1px solid #7c8b9f;
  color: #0f172a;
  background: #ffffff;
}

input::placeholder,
textarea::placeholder {
  color: #5f6f85;
  opacity: 1;
}

input:disabled,
textarea:disabled,
select:disabled {
  background: #f8fafc;
  color: #64748b;
}
```

Do not use color alone to communicate selected, completed, warning, or error states. Combine color with a label, icon, border, checkmark, or shape change.

## 3. Keyboard focus

Every interactive element needs a visible `:focus-visible` state. Keep the ring consistent across native controls and custom interactive roles.

```css
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[role="button"]:focus-visible,
[role="switch"]:focus-visible,
[role="tab"]:focus-visible {
  outline: 2px solid #1b2434;
  outline-offset: 2px;
}
```

Keyboard verification must include:

- Logical Tab and Shift+Tab order.
- Visible focus at every step.
- Enter and Space activation where appropriate.
- Arrow-key behavior for true tab interfaces.
- Escape closing dialogs and popovers.
- Focus restoration to the control that opened a dialog.
- No focus moving behind an open modal.

## 4. Dialog semantics

Dialogs need an accessible name and description, modal semantics, keyboard dismissal, focus containment, and focus restoration.

```jsx
<div className="dialog-backdrop">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <h2 id="dialog-title">Assign staterooms</h2>
    <p id="dialog-description">
      Choose the category, place guests, then confirm a room for each cabin.
    </p>
    <button type="button" aria-label="Close">×</button>
  </div>
</div>
```

The visual container should be centered in the viewport and retain an internal scroll region on shorter screens.

```css
.dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
}

[role="dialog"] {
  width: min(1120px, 100%);
  max-height: 90vh;
  margin: auto;
  display: flex;
  flex-direction: column;
}
```

## 5. Stateful controls

### Toggle and filter buttons

Use `aria-pressed` when clicking the same button toggles a persistent state.

```jsx
<button
  type="button"
  aria-pressed={selected}
  onClick={() => setSelected(!selected)}
>
  Accessible
</button>
```

### Tabs

Use the complete tab relationship rather than styling ordinary buttons to look like tabs.

```jsx
<div role="tablist" aria-label="Available decks">
  <button
    id="deck-tab-3"
    role="tab"
    aria-selected={activeDeck === 3}
    aria-controls="deck-panel-3"
  >
    Deck 3
  </button>
</div>

<section
  id="deck-panel-3"
  role="tabpanel"
  aria-labelledby="deck-tab-3"
>
  {/* Room inventory */}
</section>
```

### Disclosure cards

If the entire card opens its details, make the entire summary one button. Do not present a static-looking card with a small, detached action at the far edge.

```jsx
<button
  type="button"
  aria-expanded={open}
  aria-controls="traveler-profile-A1"
  aria-label="Add profile for Adult 1"
>
  {/* Traveler summary */}
</button>
```

## 6. Accessible names and status announcements

Interactive room cards should expose all information required to make a decision without relying on layout or icons.

Example accessible name:

```text
Room 3109, Deck 3, Forward, Available, Crib, Rollaway
```

Decorative icons and emojis should use `aria-hidden="true"` when their meaning is already present in the accessible label.

Use `role="status"` or a polite live region for meaningful asynchronous changes, such as assignment totals or filter-result counts.

```jsx
<div role="status" aria-live="polite">
  {matchingRooms} of {totalRooms} rooms match
</div>
```

Quantity controls need explicit names:

```jsx
<button type="button" aria-label="Decrease Rollaway quantity">−</button>
<output aria-live="polite" aria-label={`Rollaway quantity ${quantity}`}>
  {quantity}
</output>
<button type="button" aria-label="Increase Rollaway quantity">+</button>
```

## 7. Text and terminology standards

### Use sentence case

Use:

- `Ship position`
- `Filters`
- `Auto-assign rooms`
- `Clear filters`

Avoid mixing uppercase section labels with title-case and sentence-case controls in the same toolbar unless uppercase is part of a documented section-label system.

### Distinguish inventory concepts

Do not use one word for multiple inventory types.

| Concept | Recommended wording |
| --- | --- |
| Fare units that may be sold | `Fare inventory` or `2 bookable` |
| Physical rooms that may be selected | `168 eligible rooms` |
| Rooms on the active deck | `28 rooms on Deck 3` |
| Filter result | `10 matching · 28 total` |
| Assignment progress | `1 of 2 rooms assigned` |

### Write explicit statuses

Prefer:

- `Available`
- `Doesn’t match`
- `Assigned to Cabin 2`
- `No room yet`
- `Profile ready`
- `Add profile`
- `Not assigned`

Avoid ambiguous symbols, color-only badges, unexplained abbreviations, and zero-value financial lines such as `+$0.00` when the intended meaning is `Not assigned`.

### Placeholder records

If temporary traveler names are used, label them clearly and allow correction at the point where the placeholder is visible. Do not make users navigate backward solely to replace a temporary name.

## 8. Dense inventory and scrolling

Scrollable task areas must remain discoverable. Use slim, neutral scrollbars rather than hiding them globally.

```css
.task-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.task-scroll::-webkit-scrollbar {
  width: 5px;
}

.task-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.task-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.38);
  border: 1px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}

.task-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.62);
  background-clip: padding-box;
}
```

Avoid nested scrolling when one task-level scroll region is sufficient. If a dense room list genuinely needs its own scroll region, keep the outer and inner scrollbar treatments consistent and visually restrained.

## 9. Zoom and reflow

Verify the interface at 200% browser zoom. The preferred outcome is responsive reflow without loss of information or functionality.

For desktop-only operational tools with wide comparison tables, horizontal panning may be used as a fallback when reflow would destroy the information architecture. This must be an intentional, documented exception—not the default response to zoom problems.

Check that:

- Fixed navigation does not cover content.
- Dialog headers and footers remain reachable.
- Text does not overlap or clip.
- Controls retain readable labels and usable hit areas.
- Tables and matrices can be panned without trapping keyboard focus.

## 10. Acceptance checklist

### Keyboard

- [ ] Every action is reachable without a mouse.
- [ ] Focus order follows the visual and task order.
- [ ] Focus is visible on every interactive element.
- [ ] Dialog focus stays inside the dialog.
- [ ] Closing a dialog restores focus to its invoker.
- [ ] Escape closes dismissible dialogs and popovers.

### Semantics

- [ ] Every dialog has a programmatic title and description.
- [ ] Toggle buttons expose `aria-pressed`.
- [ ] Disclosure controls expose `aria-expanded` and `aria-controls`.
- [ ] Tabs use `tablist`, `tab`, and `tabpanel` relationships.
- [ ] Icon-only controls have an accessible name.
- [ ] Decorative icons are hidden from assistive technology.
- [ ] Dynamic totals and status changes are announced appropriately.

### Text and visual quality

- [ ] Visible interface text is at least 11px.
- [ ] Placeholder and secondary text remain readable.
- [ ] Inputs are identifiable without hover or focus.
- [ ] State is never communicated through color alone.
- [ ] Labels use consistent sentence case.
- [ ] Inventory and assignment terminology is unambiguous.
- [ ] Error messages explain what happened and how to recover.

### Zoom and layout

- [ ] The flow is usable at 200% zoom.
- [ ] No text or controls are clipped.
- [ ] Fixed headers and footers do not hide task content.
- [ ] Required scroll regions are visible and operable.
- [ ] The design has been checked at a short desktop viewport such as 1280×720.

## 11. Remaining work before claiming WCAG conformance

The related project should still run a dedicated accessibility audit that includes:

- Automated checks with Axe or an equivalent tool.
- Keyboard-only testing across the complete booking flow.
- Screen-reader testing with VoiceOver, NVDA, or JAWS.
- Contrast measurement for every text and state combination.
- Focus-trap and focus-restoration verification for every modal.
- Reduced-motion behavior for non-essential animation.
- Error identification and recovery testing on forms.
- Target-size review for compact desktop controls.
- 200% and 400% zoom/reflow checks where applicable.

## Reference implementation

The primary examples in the MVAS prototype are located in:

- `Unified Booking Flow Final.html` — global text floor, input contrast, focus styles, scrollbar treatment, and review-step semantics.
- `screens/step2-stateroom-matrix.jsx` — dialog, tabs, filters, room accessible names, status text, and dense inventory behavior.
- `screens/step3-guests.jsx` — traveler disclosure cards, profile labels, placeholders, and guest-state copy.
- `screens/where-when-step1.jsx` — filter and tab semantics.
- `screens/summary-panel.jsx` — expanded-state semantics and summary labels.

