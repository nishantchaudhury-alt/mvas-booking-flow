# MVAS Unified Booking Flow

A high-fidelity React prototype for the Margaritaville at Sea booking workflow. It covers sailing selection, fare and stateroom configuration, guest profiles, supplements, pricing, and final booking review in one persistent three-step flow.

## Current experience

At entry, agents choose whether they are creating an individual booking or a
group reservation. Group reservations collect the parent context first, open a
persistent group workspace, and then hand off into the same sailing, cabin,
guest, and confirmation flow with the group and sailing already attached.

1. **Sailing, fare & cabin**
   - Search and filter sailing inventory.
   - Select a sailing, farecode, guest count, staterooms, and supplements.
   - Assign rooms manually or automatically across Decks 3–8, with high-density room inventory and room-feature filters.
2. **Add guests**
   - Review cabin-grouped travelers in a single-column list.
   - Add, replace, or edit guest profiles and assign a primary guest.
   - Apply trip protection and review cabin-level pricing.
3. **Review & confirm**
   - Validate the booking snapshot, guests, supplements, payment terms, and promotions.
   - Switch between order-summary and price-breakdown views.
   - Confirm the booking from the pricing panel; hold and discard actions live in a compact overflow menu.

The booking state is owned by one router and persisted under `localStorage['farecode-booking-v2']`, so moving backward or refreshing does not discard completed work.

## Navigation pattern

- The progress stepper supports direct movement between completed steps.
- Back and Continue actions use the shared full-width bottom bar.
- In the selected-sailing view, **Back to all sailings** appears at the bottom-left and **Continue to guests** remains at the bottom-right.
- The final **Confirm booking** action stays inside the pricing panel beside the amount being approved.

## Run locally

This repository is a static React/Babel prototype. It has no package installation or build step.

From the repository root, run:

```bash
python3 -m http.server 8123 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8123/Unified%20Booking%20Flow%20Final.html
```

Internet access is required for Inter, React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0, which are loaded from CDNs.

## Project structure

| Path | Purpose |
| --- | --- |
| `Unified Booking Flow Final.html` | Application entry point, global accessibility styles, review-and-confirm screen, and router |
| `wireframe-primitives.jsx` | MVAS tokens, application shell, shared controls, and full-width bottom bar |
| `screens/booking-store.jsx` | Persistent booking state, normalization, migration, and shared pricing calculations |
| `screens/group-booking.jsx` | Reservation-scope choice, Group setup, persistent workspace, and group-to-booking handoff |
| `screens/step2-sailing.jsx` | Sailing search, selected-sailing view, fare and cabin workflow |
| `screens/step2-sailing-detail.jsx` | Expanded sailing details and itinerary UI |
| `screens/step2-stateroom-matrix.jsx` | Stateroom category matrix and deck-based room assignment modal |
| `screens/step3-guests.jsx` | Guest profile and cabin traveler workflow |
| `screens/summary-panel.jsx` | Shared booking and pricing summary rail |
| `screens/intent-data.jsx` | Demo sailing, fare, cabin, and supplement inventory |
| `MVas Logo.png` | Local MVAS wordmark used by the application shell |

Keep the HTML file, `screens/`, `wireframe-primitives.jsx`, and `MVas Logo.png` in their current relative locations because the entry point loads them directly.

## Portable components

Two standalone React components are available for reuse in other projects:

- `AssignStateroom.portable.jsx` — stateroom category, guest placement, deck navigation, filters, and room assignment.
- `SupplementCatalog.portable.jsx` — searchable supplement list and per-guest assignment workflow.

Integration details and data contracts are documented in:

- [`ASSIGN_STATEROOM_HANDOFF.md`](ASSIGN_STATEROOM_HANDOFF.md)
- [`SUPPLEMENT_CATALOG_HANDOFF.md`](SUPPLEMENT_CATALOG_HANDOFF.md)
- [`ACCESSIBILITY_TEXT_FIXES_HANDOFF.md`](ACCESSIBILITY_TEXT_FIXES_HANDOFF.md)

## Design and accessibility

The prototype follows the MVAS operations UI language: navy interactions, white working surfaces, cool-grey structure, restrained status colors, compact typography, and hairline borders.

Current accessibility work includes visible keyboard focus, stronger editable-control boundaries, readable compact text, modal focus handling, accessible control names, and discoverable scrolling within the stateroom assignment flow.

Product whitespace follows a strict 4px scale for margins, padding, and gaps. Typography uses 12, 14, 16, 20, 24, 32, and 40px with paired 4px-grid line heights and only the loaded 400, 500, 600, and 700 Inter weights. Borders, radii, icon geometry, and component dimensions remain separate scales.

Run the design-foundation guard before handoff:

```sh
node design-system/validate-foundation.mjs
```

## Prototype scope

All inventory, traveler, pricing, hold, discard, and confirmation behavior is local demo data. No reservation, payment, customer profile, or production API is connected.
