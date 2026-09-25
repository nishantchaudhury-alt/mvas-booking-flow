# Portable Supplement Catalog Handoff

This package recreates the MVAS supplement catalog shown in the booking-flow prototype. It is designed to be shared with Codex in another project without requiring the original booking store or global styling files.

## Included file

- `SupplementCatalog.portable.jsx` — standalone React 18 component, sample catalog data, demo cabins, search, filters, assignment list, eligibility rules, and the per-guest assignment dialog.

## What the component includes

- Search across supplement name and category.
- Dynamic category filters.
- Scan-friendly single-column catalog with aligned product, assignment, price, and action columns.
- Responsive rows that stack assignment and action details at narrow widths.
- Per-guest price before assignment.
- Total assigned price after assignment.
- Assigned-product and assignment-count summaries.
- `Assign` and `Edit` states.
- Cabin-grouped guest assignment dialog.
- Per-guest quantity controls.
- `Assign to all` for unrestricted products and `Remove all` across all product types.
- Conditional date-of-birth verification opens only after a restricted guest's increase action.
- Canceling verification leaves that guest's quantity unchanged; successful verification returns to the compact assignment rows with age on departure.
- Age-restricted products never expose the bulk **Assign to all** action. For 21+ products, guests in younger age bands are disabled before DOB verification.
- For 13+ products, the 21+ cohort is eligible immediately; DOB verification is requested only from the 13–21 cohort.
- **Remove all** remains available. For an age-restricted product it clears the cabin's restricted assignments and the DOB values that were collected for those guests, returning their counts to zero.
- Reducing an individual age-restricted assignment to zero also removes the DOB collected by this workflow when no other restricted assignment still depends on it, so the age-on-departure state disappears with the quantity.
- Eligibility calculated on the supplied sailing departure date.
- Invalid restricted assignments are removed when a DOB changes.
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
  const [birthDates, setBirthDates] = React.useState({});

  return (
    <SupplementCatalog
      products={DEFAULT_SUPPLEMENTS}
      cabins={DEMO_CABINS}
      assignments={assignments}
      onAssignmentsChange={setAssignments}
      birthDates={birthDates}
      onBirthDatesChange={setBirthDates}
      eligibilityDate="2026-09-19"
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
| `birthDates` | `Record<guestId, YYYY-MM-DD>` | `undefined` | Controlled guest-level DOB state used only by age-restricted products. |
| `initialBirthDates` | `Record<guestId, YYYY-MM-DD>` | `{}` | Initial DOB state when using the component uncontrolled. |
| `onBirthDatesChange` | `(next) => void` | `undefined` | Persists DOB changes to the parent/store. |
| `eligibilityDate` | `string \| Date` | Current date | Date on which the guest must meet the product's minimum age; pass the sailing departure date. |
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
  birthDates={booking.guestBirthDates}
  eligibilityDate={booking.sailingDepartureDate}
  onAssignmentsChange={(nextAssignments) =>
    updateBooking({ supplementAssignments: nextAssignments })
  }
  onBirthDatesChange={(nextBirthDates) =>
    updateBooking({ guestBirthDates: nextBirthDates })
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

Representative ages are sufficient for unrestricted-product demos. Products with `minAge` require a date of birth in `birthDates`; the component does not treat a representative age as age verification.

## MVAS visual rules preserved

- Navy `#1B2434` is the interaction color.
- White panels sit on cool-grey structure.
- Blue-tinted surfaces indicate selection without adding another interaction color.
- Green is reserved for successful assignment status.
- Amber is reserved for age restrictions and warnings.
- Red is reserved for removal/destructive actions.
- Visible text is at least 12px and uses the shared even-number type scale.
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
- [ ] An age-restricted increase opens DOB verification when that guest has no verified DOB.
- [ ] Canceling DOB verification leaves the guest quantity at its prior value.
- [ ] Age-restricted products omit **Assign to all**, and 21+ products disable guests outside the 21+ age band by default.
- [ ] On 13+ products, 21+ guests can be assigned without DOB while 13–21 guests are routed through DOB verification.
- [ ] **Remove all** on an age-restricted product clears its quantities and the collected DOB values for guests who had that product in the selected cabin.
- [ ] Successful verification increments quantity and shows the guest's age on departure.
- [ ] Infants remain in the roster but show `Not eligible`.
- [ ] For unrestricted products, `Assign to all` affects only eligible guests in that cabin.
- [ ] `Remove all` affects only the selected cabin.
- [ ] Escape closes the dialog.
- [ ] Tab focus remains inside the open dialog.
- [ ] Closing restores focus to the product row.
- [ ] At narrow widths, catalog rows stack cleanly and the cabin grid collapses to one column.

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
