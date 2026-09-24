# MVAS Booking Flow — Design System Foundation

Status: foundation v0.1  
Scope: desktop booking operations prototype  
Runtime source: [`tokens.css`](tokens.css)  
Visual reference: [`index.html`](index.html)

## Product character

This is a compact travel-operations workspace, not a consumer cruise-marketing site. The interface should optimize for scan speed, comparison, state clarity, and price confidence.

The visual language is calm and production-oriented:

- one navy interaction language;
- white work surfaces on a cool-grey shell;
- compact Inter typography with clear neutral hierarchy;
- hairline borders and restrained elevation;
- green, amber, and red reserved for status meaning.

The active red/coral sidebar treatment is a scoped brand-shell exception. It must not become a general action, form, selection, or error color.

## Architecture

Tokens use three layers:

1. **Primitive** — raw values such as navy, spacing steps, radii, and durations.
2. **Semantic** — purpose aliases such as `--ds-color-action` and `--ds-color-text-secondary`.
3. **Component** — contracts such as `--ds-button-primary-bg` and `--ds-field-border`.

Components should consume component tokens first and semantic tokens when no component contract exists. Product code should not consume primitive tokens directly.

## Color roles

| Role | Token | Value | Use |
|---|---|---:|---|
| Canvas | `--ds-color-canvas` | `#F1F5F9` | App background behind work surfaces |
| Workspace | `--ds-color-workspace` | `#F9FAFC` | Shell and rail gutters |
| Surface | `--ds-color-surface` | `#FFFFFF` | Cards, tables, inputs, dialogs |
| Subtle surface | `--ds-color-surface-subtle` | `#F8FAFC` | Quiet headers and hover fills |
| Primary text | `--ds-color-text-primary` | `#0F172A` | Titles, key values, prices |
| Secondary text | `--ds-color-text-secondary` | `#475569` | Supporting copy and values |
| Label text | `--ds-color-text-label` | `#5B6B80` | Compact uppercase labels |
| Muted text | `--ds-color-text-muted` | `#5F6F85` | Placeholders and tertiary metadata |
| Border | `--ds-color-border` | `#E2E8F0` | Cards and structural boundaries |
| Divider | `--ds-color-divider` | `#EEF2F6` | Inner row separators |
| Control border | `--ds-color-control-border` | `#7C8B9F` | Editable-control boundaries |
| Action | `--ds-color-action` | `#1B2434` | Primary actions and active controls |
| Selection | `--ds-color-selection` | `#EFF6FF` | Selected light surfaces |
| Selection border | `--ds-color-selection-border` | `#DBEAFE` | Selected light-surface boundary |

### Status families

| Meaning | Text | Background | Border |
|---|---|---|---|
| Success/bookable/savings | `--ds-color-success-text` | `--ds-color-success-bg` | `--ds-color-success-border` |
| Warning/override | `--ds-color-warning-text` | `--ds-color-warning-bg` | `--ds-color-warning-border` |
| Error/destructive | `--ds-color-danger-text` | `--ds-color-danger-bg` | `--ds-color-danger-border` |
| Informational | `--ds-color-info-text` | `--ds-color-info-bg` | `--ds-color-info-border` |

Never communicate status by color alone. Pair it with text, an icon, or a state label.

Inventory category and deck colors are data visualization values. Keep them in feature-local `data-color-*` maps rather than treating them as UI accents.

## Typography

Use Inter with system sans-serif fallbacks. Use the data font stack for prices, codes, dates in columns, and tabular quantities.

| Role | Size | Weight | Line height |
|---|---:|---:|---:|
| Caption / metadata | 12px | 400–600 | 16px |
| Compact body | 12px | 400–600 | 16px |
| Standard body / control | 14px | 400–600 | 20px |
| Body large / section title | 16px | 600–700 | 24px |
| Dialog / workspace title | 20px | 700 | 28px |
| Page title | 24px | 700 | 32px |
| Display | 32px | 700 | 40px |
| Hero | 40px | 700 | 48px |

Only weights 400, 500, 600, and 700 are loaded. Do not request synthetic weights such as 650, 750, or 850.

## Spacing, shape, and elevation

- Every margin, padding, and layout gap uses the strict 4px scale: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, and 64px.
- Borders, focus rings, radii, icons, SVG geometry, transforms, and fixed component dimensions use their own scales. They must not be rounded merely to resemble spacing values.
- The two `-1px` tab/control overlap seams are explicit geometry exceptions; do not introduce new off-grid spacing exceptions.
- Standard control radius: 6px.
- Card radius: 8px.
- Panel radius: 10px.
- Dialog compatibility radius: 14px; prefer 10px for new desktop dialogs.
- Pills are limited to compact badges, counts, and filters.
- Standard surface shadow: `--ds-elevation-surface`.
- Floating content uses `--ds-elevation-floating`; dialogs use `--ds-elevation-dialog`.

Keep compact visual controls, but separate visible size from hit area. New pointer targets should expose a 44px hit region where layout permits; never go below 24px.

## Motion and layers

- Fast feedback: 120ms.
- Standard state change: 150ms.
- Deliberate reveal: 200ms.
- Animate color, opacity, transform, or shadow explicitly; avoid `transition: all`.
- Reduced-motion preferences collapse system durations to 1ms.
- Use semantic layers for sticky content, popovers, tooltips, dialogs, and nested dialogs instead of arbitrary z-index values.

## Core component contracts

### Button and IconButton

Variants: primary, secondary, quiet, danger, text, icon, overflow.  
States: default, hover, pressed, focus-visible, disabled, loading.  
Sizes: compact 32px and default 40px; target hit area 44px.

Primary actions use navy with white text. Secondary actions use a white surface, neutral border, and primary text. Destructive actions remain visually separate from primary actions.

### Field

An accessible field includes a persistent label, optional required marker, control, helper or error text, and programmatic association.

States: default, hover, focus, filled, read-only, disabled, error, success.  
Variants: text, search, select, date, and grouped promo/quantity control.

Use `--ds-field-border`, not the lighter structural border, for editable controls.

### Select

Use the shared `WFSelect` pattern for product dropdowns instead of a native
expanded menu. The trigger follows the field contract; the floating list uses
the popover layer, surface tokens, and floating elevation. Options support a
primary label, optional right-aligned metadata, selected checkmark, disabled
state, hover/active state, and type-ahead matching.

Keyboard behavior: Enter or Space opens/selects, Arrow Up/Down moves the active
option, Home/End jumps to the first/last enabled option, Escape closes and
returns focus, and Tab closes without trapping focus. Keep a persistent visual
label near the trigger and provide an accessible name programmatically.

### Surface and card

Variants: panel, section card, selectable card, disclosure card, amount card.  
Interactive cards must use native button/link semantics or an equivalent keyboard contract. Selected cards need a non-color cue.

### Badge and status tag

Variants: neutral, accent, info, success, warning, danger, and count. Badges describe state; filter chips are separate interactive components.

### List row and data table

Use left alignment for text, right alignment plus tabular numerals for currency and quantities, and centered status only when scan efficiency improves. Support hover, selected, disabled, unavailable, and confirmed states without relying on color alone.

### Dialog, popover, and menu

Dialogs share one scrim, header/body/footer anatomy, Escape behavior, initial focus, focus containment, and trigger-focus restoration. Popovers and menus share outside-click, keyboard navigation, and semantic layer tokens.

### Progress stepper

Support pending, current, complete, and clickable-complete states. The visible step number/check, label, and programmatic state must agree. Route changes should update the page title and move focus to the new screen heading.

## Accessibility baseline

- Text contrast: at least 4.5:1 for normal text.
- UI boundaries and focus indicators: at least 3:1 against adjacent colors.
- A visible `:focus-visible` treatment on every interactive control.
- Real headings and `header`, `nav`, `main`, and `aside` landmarks.
- Labels associated with inputs; inline errors explain cause and recovery.
- Dialog focus management and keyboard-complete selection patterns.
- Status never communicated by color alone.
- Usable reflow or a documented desktop-only policy with discoverable horizontal scrolling.
- Reduced-motion support.

## Adoption and enforcement

The product source now uses the strict spacing and typography scales. New work must use semantic or component tokens where a role exists, and raw values must still resolve to an approved scale step.

Run the foundation check before handing off a design-system change:

```sh
node design-system/validate-foundation.mjs
```

The validator checks visible font sizes, paired line heights, loaded weights, margin/padding/gap values, legacy tokens, and undefined `--ds-*` references. It deliberately excludes border widths, radii, `aria-hidden` icon/SVG geometry, transforms, and component dimensions from the 4px spacing rule.

Continue component adoption in this order:

1. shared buttons, fields, badges, and selectable cards;
2. dialogs, popovers, and progress steppers;
3. data tables and pricing rows;
4. portable components, using CSS-variable fallbacks so they remain standalone.

See [`AUDIT.md`](AUDIT.md) for the evidence and remediation backlog.
