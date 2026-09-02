# Assign Stateroom component handoff

The shareable component is in `AssignStateroom.portable.jsx`. It is the same
stateroom category matrix and centered assignment modal used by the MVAS
booking-flow prototype, packaged as an ES module.

## What is included

- Stateroom category and occupancy inventory table
- Multi-cabin quantity selection
- Guest distribution across cabin columns
- Six deck tabs (Decks 3–8)
- 28 eligible rooms per deck in the supplied demo inventory
- Ship-position and room-feature filters
- Crib, rollaway, accessible, and connecting-room indicators
- Automatic guest and room assignment
- Manual room selection with automatic cabin advancement
- Selected, assigned, unavailable, and filtered room states
- Centered modal with an internal scroll region and fixed actions
- MVAS colors, typography, focus states, and scoped scrollbar styling
- Reconciliation of supplement assignments when a cabin is removed

## Install and import

The only runtime dependency is React 18 or newer.

```bash
npm install react react-dom
```

```jsx
import React from "react";
import AssignStateroom, {
  DEMO_BOOKING_STATE,
} from "./AssignStateroom.portable.jsx";

export default function BookingPage() {
  const [booking, setBooking] = React.useState(DEMO_BOOKING_STATE);

  const updateBooking = React.useCallback((patch) => {
    setBooking((current) => ({ ...current, ...patch }));
  }, []);

  return (
    <AssignStateroom
      s={booking}
      update={updateBooking}
      onConfirmRooms={() => {
        // Navigate to the next booking section here.
      }}
    />
  );
}
```

## Booking state shape

```js
{
  guests: {
    adults: 4,
    youngAdults: 2,
    children: 2,
    infants: 2,
  },
  cabins: [
    {
      id: "I6-0",
      rowId: "I6",
      cat: "IS",
      label: "Interior Stateroom – I6",
      num: "3101",
      guests: {
        adults: 2,
        youngAdults: 1,
        children: 1,
        infants: 1,
      },
    },
  ],
  suppAssignments: {},
  selectedSupps: {},
  cabinId: "IS",
  selectedCabinNum: "3101",
  selectedRoomCount: 1,
}
```

`update` receives a shallow patch for this object. The component owns temporary
UI state while the agent is assigning rooms, then writes the confirmed cabin
records through `update`.

## Exported symbols

```js
AssignStateroom             // default export; category matrix + modal
StateRoomMatrix             // named alias of the default component
SelectRoomPanel             // modal-only component for advanced integrations
STATEROOM_ROWS              // supplied category/fare inventory
STATEROOM_ROOMS_BY_ROW      // supplied high-density room inventory
ROOM_FEATURES               // feature definitions used by filters and cards
DEMO_BOOKING_STATE          // ready-to-run initial state
```

Use the default export unless the receiving project already has its own
category matrix and only needs `SelectRoomPanel`.

## Integration notes

- Mount the component outside a native HTML `<form>` because it owns many
  button-driven interactions.
- The supplied inventory is demo data. Replace `STATEROOM_ROWS` and
  `STATEROOM_ROOMS_BY_ROW` with API-backed values when integrating production
  inventory.
- Room numbers must be unique strings. Each room record needs `num`, `deck`,
  and `loc`; the supported positions are `fwd`, `mid`, and `aft`.
- Optional room fields are `a11y`, `infantFriendly`, `rollawayBed`, and
  `connectedRoom`.
- Load Inter in the receiving application for an exact typography match. The
  component falls back to the system sans-serif stack.
