# Portable Supplement Catalog Handoff

This package recreates the MVAS supplement catalog shown in the booking-flow prototype. It is designed to be shared with Codex in another project without requiring the original booking store or global styling files.

## Included file

- `SupplementCatalog.portable.jsx` — standalone React 18 component, sample catalog data, demo cabins, search, filters, assignment cards, eligibility rules, and the per-guest assignment dialog.

## What the component includes

- Search across supplement name and category.
- Dynamic category filters.
- Responsive two-column catalog grid.
- Per-guest price before assignment.
- Total assigned price after assignment.
- Assigned-product and assignment-count summaries.
- `Assign` and `Edit` states.
- Cabin-grouped guest assignment dialog.
- Per-guest quantity controls.
- `Assign to all` and `Remove all` cabin actions.
- Minimum-age eligibility rules.
- Infants excluded by default unless a product sets `allowInfants: true`.
- Escape-to-close, focus trapping, focus restoration, and accessible control labels.
- MVAS colors, typography, borders, radii, and restrained scrollbar styling.
- Controlled or uncontrolled assignment state.

## Install and import

The component only requires React 18 or newer.

```jsx
import SupplementCatalog, {
  DEFAULT_SUPPLEMENTS,
  DEMO_CABINS,
} from "./SupplementCatalog.portable.jsx";
```

## Quick start

```jsx
import React from "react";
import SupplementCatalog, {
  DEFAULT_SUPPLEMENTS,
  DEMO_CABINS,
} from "./SupplementCatalog.portable.jsx";

export default function SupplementsPage() {
  const [assignments, setAssignments] = React.useState({});

  return (
    <SupplementCatalog
      products={DEFAULT_SUPPLEMENTS}
      cabins={DEMO_CABINS}
      assignments={assignments}
      onAssignmentsChange={setAssignments}
    />
  );
}
```

## Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `products` | `SupplementProduct[]` | `DEFAULT_SUPPLEMENTS` | Products displayed in the catalog. |
| `cabins` | `Cabin[]` | `DEMO_CABINS` | Cabin-grouped guest roster used by the assignment dialog. |
| `assignments` | `AssignmentMap` | `undefined` | Controlled assignment state. |
| `initialAssignments` | `AssignmentMap` | `{}` | Initial state when using the component uncontrolled. |
| `onAssignmentsChange` | `(next) => void` | `undefined` | Persists assignment changes to the parent/store. |
| `currency` | `string` | `"$"` | Currency prefix used for display. |
| `title` | `string` | `"Supplement catalog"` | Catalog heading. |
| `description` | `string` | Assignment helper copy | Catalog description. |

## Data contracts

### Supplement product

```js
{
  id: "drinks",                  // unique, stable string
  emoji: "🍹",
  name: "Premium Beverage Pkg",
  pricePerGuest: 62.5,
  category: "Food & Drink",
  minAge: 21,                    // optional
  allowInfants: false            // optional; defaults to false
}
```

### Cabins and guests

```js
[
  {
    id: "cabin-1",
    label: "Cabin 1 · Room 3118",
    guests: [
      { id: "adult-1", name: "Adult 1", age: 34 },
      { id: "child-1", name: "Child 1", age: 9 },
      { id: "infant-1", name: "Infant 1", age: 1, type: "infant" }
    ]
  }
]
```

Guest IDs must remain stable. Assignments are keyed by guest ID, so regenerating IDs during render will lose or misattribute selections.

### Assignment state

```js
{
  drinks: {
    "adult-1": 1,
    "adult-2": 1
  },
  wifi: {
    "adult-1": 2
  }
}
```

The outer key is the product ID. The inner key is the guest ID. The value is the quantity assigned to that guest.

## Connecting it to an existing store

Keep one source of truth. Do not maintain a separate selected-products list if it can be derived from the assignment map.

```jsx
const assignments = booking.supplementAssignments;

<SupplementCatalog
  products={supplementsFromApi}
  cabins={booking.cabins}
  assignments={assignments}
  onAssignmentsChange={(nextAssignments) =>
    updateBooking({ supplementAssignments: nextAssignments })
  }
/>
```

Selected products and totals can be derived as follows:

```js
const selectedProductIds = Object.keys(assignments).filter((productId) =>
  Object.values(assignments[productId]).some((quantity) => quantity > 0)
);

const assignedUnits = Object.values(assignments).reduce(
  (total, productAssignment) =>
    total + Object.values(productAssignment).reduce((sum, quantity) => sum + quantity, 0),
  0
);
```

## Adapting existing guest data

If the other project stores counts rather than individual guests, convert them to stable guest records before rendering the component.

```js
function buildGuestsFromCounts(counts) {
  const groups = [
    ["adults", "Adult", 30],
    ["youngAdults", "Young Adult", 17],
    ["children", "Child", 9],
    ["infants", "Infant", 1],
  ];

  return groups.flatMap(([key, label, representativeAge]) =>
    Array.from({ length: counts[key] || 0 }, (_, index) => ({
      id: `${key}-${index}`,
      name: `${label} ${index + 1}`,
      age: representativeAge,
      type: key === "infants" ? "infant" : undefined,
    }))
  );
}
```

Use actual date-of-birth or age data when it exists. Representative ages are only a prototype fallback.

## MVAS visual rules preserved

- Navy `#1B2434` is the interaction color.
- White panels sit on cool-grey structure.
- Blue-tinted surfaces indicate selection without adding another interaction color.
- Green is reserved for successful assignment status.
- Amber is reserved for age restrictions and warnings.
- Red is reserved for removal/destructive actions.
- Visible text is at least 11px.
- Controls use thin borders, 6–10px radii, and restrained shadows.

## Important integration decisions

1. Decide whether a supplement quantity may exceed one per guest. The portable component allows it.
2. Decide whether infants are eligible for any products. They are excluded by default.
3. Use product IDs and guest IDs from the backend when available.
4. Revalidate age eligibility on the server before checkout.
5. Calculate authoritative prices on the server. UI totals are display-only.
6. If cabins are not assigned yet, either provide one temporary `Cabin assignment pending` group or disable the catalog until a roster is available.

## Acceptance checks

- [ ] Search filters by product name and category.
- [ ] Category chips expose `aria-pressed`.
- [ ] Assigned counts update immediately.
- [ ] Product cards change from `Assign` to `Edit` after assignment.
- [ ] Product total equals `pricePerGuest × assigned units`.
- [ ] Age-restricted guests cannot increment quantity.
- [ ] Infants remain in the roster but show `Not eligible`.
- [ ] `Assign to all` affects only eligible guests in that cabin.
- [ ] `Remove all` affects only the selected cabin.
- [ ] Escape closes the dialog.
- [ ] Tab focus remains inside the open dialog.
- [ ] Closing restores focus to the product card.
- [ ] At narrow widths, catalog and cabin grids collapse to one column.

## Ready-to-paste request for Codex in the other project

```text
Implement the attached SupplementCatalog.portable.jsx in this project.

Requirements:
- Preserve the current project’s framework and build system.
- Adapt the component’s product, cabin, guest, and assignment contracts to the existing domain/store instead of creating duplicate state.
- Keep the MVAS interaction hierarchy and accessibility behavior from the component.
- Use backend product and guest IDs where available.
- Keep pricing authoritative on the server; the component’s totals are display values.
- Verify search, category filters, per-guest assignment, age restrictions, cabin bulk actions, keyboard focus, Escape dismissal, and responsive one-column behavior.
- Do not copy demo data into production state.
```

## Original implementation reference

The source implementation in this prototype lives in:

- `screens/step2-sailing.jsx`
  - `S2_SUPP`
  - `buildCabinGuestRoster`
  - `GuestSupplyStepper`
  - `AssignGuestsPanel`
  - `SupplementsSection`

