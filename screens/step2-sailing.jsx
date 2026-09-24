// Step 2 · Sailing cards — expanded card redesign
// Sections: Cabin Category · Farecodes & Promotions · Individual Supplements
// ───────────────────────────────────────────────────────────────────────────

// ── Helpers ──
const payCount = (g) => g.adults + (g.youngAdults || 0) + g.children;
const perPerson = (total, g) => Math.round(total / Math.max(1, payCount(g)));

function routeOf(sailing) {
  // Home port is dropped by position (day 1 and the final day), not by name —
  // itineraries now depart Palm Beach or New Orleans, so a name test would
  // either leak the return port into the route or hide a genuine NOLA call.
  const lastDay = sailing.ports.length ? sailing.ports[sailing.ports.length - 1].day : 0;
  const stops = sailing.ports.
  filter((p) => p.day > 1 && p.day < lastDay && p.port !== 'At sea').
  map((p) => p.port.split(',')[0]);
  if (stops.length <= 3) return stops.join(' → ');
  return stops.slice(0, 3).join(' → ') + ' +' + (stops.length - 3);
}

function availabilityOf(sailing) {
  if (sailing.low) return { label: 'Low inventory', kind: 'inactive' };
  if (sailing.holdCount) return { label: 'On hold', kind: 'draft' };
  return { label: 'Available', kind: 'active' };
}

// ── Step-2 data ──
const S2_CAB = [
{ id: 'IS', name: 'Interior', blurb: 'Cozy inside cabin, no window', deltaPP: 0 },
{ id: 'OV', name: 'Oceanview', blurb: 'Picture window, sea views', deltaPP: 218 },
{ id: 'BAL', name: 'Balcony', blurb: 'Private veranda', deltaPP: 551 },
{ id: 'STE', name: 'Suite', blurb: 'Suite + butler-ready', deltaPP: 1377 }];


// Prices keyed to SAIL-77834 (fareIndex 1.15), 4 guests
const S2_FC = [
{ id: 'NR-SAVER', code: 'NR–SAVER', refundable: false, pricePP: 778, deposit: 0.25,
  note: 'Non-refundable saver rate · 25% deposit due now.' },
{ id: 'FLEX-STD', code: 'FLEX–STD', refundable: true, pricePP: 863, deposit: 0.25,
  note: 'Refundable standard rate · 25% deposit due now.' },
{ id: 'EARLY-IS', code: 'EARLY–IS', refundable: false, pricePP: 738, deposit: 0.20,
  note: 'Early booking interior saver · 20% deposit due now.' }];


const S2_SUPP = [
{ id: 'aroma', emoji: '🌸', name: 'Aromatherapy Package', pricePP: 33.75, priceTotal: 135, category: 'Wellness' },
{ id: 'thermal', emoji: '🔥', name: 'Thermal Suite Pass', pricePP: 27.50, priceTotal: 110, category: 'Wellness' },
{ id: 'drinks', emoji: '🍹', name: 'Premium Beverage Pkg', pricePP: 62.50, priceTotal: 250, category: 'Food & Drink', minAge: 21 },
{ id: 'shore', emoji: '⚓', name: 'Shore Excursion Access', pricePP: 45.00, priceTotal: 180, category: 'Activities' },
{ id: 'wifi', emoji: '📶', name: 'High-Speed Wi-Fi (4 Devices)', pricePP: 23.75, priceTotal: 95, category: 'Connectivity' },
{ id: 'dining', emoji: '🍽️', name: 'Specialty Dining Pass', pricePP: 40.00, priceTotal: 160, category: 'Food & Drink' },
{ id: 'photo', emoji: '📸', name: 'Digital Photo Package', pricePP: 18.75, priceTotal: 75, category: 'Experiences' },
{ id: 'fitness', emoji: '🏋️', name: 'Master Fitness Classes', pricePP: 30.00, priceTotal: 120, category: 'Wellness' },
{ id: 'wine', emoji: '🍷', name: 'Sommelier Reserve Tasting', pricePP: 52.50, priceTotal: 210, category: 'Food & Drink', minAge: 21 },
{ id: 'laundry', emoji: '🧺', name: 'Express Laundry Service', pricePP: 16.25, priceTotal: 65, category: 'Services' },
{ id: 'golf', emoji: '⛳', name: 'Golf Simulator Rental', pricePP: 35.00, priceTotal: 140, category: 'Activities' },
{ id: 'theater', emoji: '🎭', name: 'Backstage VIP Theater Tour', pricePP: 21.25, priceTotal: 85, category: 'Experiences' },
{ id: 'heli', emoji: '🚁', name: 'Port Heli-Adventures', pricePP: 47.50, priceTotal: 190, category: 'Activities' },
{ id: 'arcade', emoji: '👾', name: 'Arcade All-Access Pass', pricePP: 12.50, priceTotal: 50, category: 'Activities' },
{ id: 'stateroom', emoji: '🛏️', name: 'Stateroom Premium Setup', pricePP: 75.00, priceTotal: 300, category: 'Services' }];


// Interactive accent for step 1. Points at the shared WF accent family — the
// name is kept only because ~30 call sites read it; the value is no longer teal.
const S2_TEAL = WF.accentInk;
const S2_TEAL_TINT = WF.accentTint;
const S2_DARK = WF.accentOn;
const BASE_FARE_IDX = 1.15; // SAIL-77834 reference fareIndex

// ── Tiny section label ──
function S2Label({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
      color: '#6B7280', textTransform: 'uppercase', marginBottom: 8
    }}>{children}</div>);

}

// ───────────────────────────────────────────────────────────────────────────
// 2. Cabin category (single-select)
// ───────────────────────────────────────────────────────────────────────────
function CabinSection2({ cabinId, onSelect }) {
  return (
    <div>
      <S2Label>Cabin Category</S2Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {S2_CAB.map((c) => {
          const on = cabinId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                padding: '12px 12px', borderRadius: 8, cursor: 'pointer',
                transition: 'border-color 0.12s, box-shadow 0.12s',
                border: `1.5px solid ${on ? S2_TEAL : WF.line}`,
                background: WF.panel,
                boxShadow: on ? `0 0 0 3px ${S2_TEAL_TINT}` : 'none'
              }}
              onMouseEnter={(e) => {if (!on) e.currentTarget.style.borderColor = '#9CA3AF';}}
              onMouseLeave={(e) => {if (!on) e.currentTarget.style.borderColor = WF.line;}}>
              
              {/* Radio indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{c.name}</div>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${on ? S2_TEAL : '#CBD5E1'}`,
                  background: on ? WF.accentOn : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.12s', marginLeft: 8, marginTop: 4
                }}>
                  {on && <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <polyline points="1.5,4 3,5.5 6.5,2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: '16px', marginBottom: 8 }}>{c.blurb}</div>
              <div style={{
                fontSize: 12, fontWeight: 700, fontFamily: 'ui-monospace, monospace',
                color: c.deltaPP === 0 ? S2_TEAL : WF.ink
              }}>
                {c.deltaPP === 0 ? 'Included' : `+$${c.deltaPP.toLocaleString()} pp`}
              </div>
            </div>);

        })}
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// 2b. Deck Preference (upper / lower)
// ───────────────────────────────────────────────────────────────────────────
function DeckPreferenceSection({ deckPreference, onSelect }) {
  const opts = [
  { id: 'upper', label: 'Upper' },
  { id: 'lower', label: 'Lower' }];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 8 }}>Deck</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {opts.map((opt) => {
          const on = deckPreference === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${on ? S2_DARK : WF.line}`,
                background: on ? S2_DARK : WF.panel,
                color: on ? '#fff' : WF.ink,
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {if (!on) {e.currentTarget.style.borderColor = '#9CA3AF';}}}
              onMouseLeave={(e) => {if (!on) {e.currentTarget.style.borderColor = WF.line;}}}>
              {opt.label}
            </button>);

        })}
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// 2c. Assignment Method (auto-assign / manual)
// ───────────────────────────────────────────────────────────────────────────
function AssignmentMethodSection({ assignmentMethod, onSelect }) {
  const opts = [
  { id: 'auto', label: 'Auto-Assign' },
  { id: 'manual', label: 'Manual Select' }];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 8 }}>Assignment</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {opts.map((opt) => {
          const on = assignmentMethod === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${on ? S2_TEAL : WF.line}`,
                background: on ? S2_TEAL_TINT : WF.panel,
                color: on ? S2_TEAL : WF.ink,
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {if (!on) {e.currentTarget.style.borderColor = '#9CA3AF';}}}
              onMouseLeave={(e) => {if (!on) {e.currentTarget.style.borderColor = WF.line;}}}>
              {opt.label}
            </button>);

        })}
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// 3. Farecodes & Promotions (pill buttons, single-select)
// ───────────────────────────────────────────────────────────────────────────
function FarecodesSection2({ farecodeId, onSelect }) {
  const active = S2_FC.find((f) => f.id === farecodeId);

  return (
    <div>
      <S2Label>Available Farecodes & Promotions ({S2_FC.length})</S2Label>

      {/* Expanded content */}
      <div style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {S2_FC.map((f) => {
            const on = farecodeId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelect(on ? null : f.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: 0,
                  borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${on ? S2_DARK : WF.line}`,
                  background: on ? S2_DARK : WF.panel,
                  color: on ? '#fff' : WF.ink,
                  overflow: 'hidden', transition: 'all 0.12s'
                }}>
                
                {/* code */}
                <span style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                  {f.code}
                </span>
                {/* refundability badge segment */}
                <span style={{
                  padding: '8px 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                  background: on ?
                  'rgba(255,255,255,0.10)' :
                  f.refundable ? S2_TEAL_TINT : '#F3F4F6',
                  color: on ?
                  f.refundable ? '#7DD3D3' : '#CBD5E1' :
                  f.refundable ? S2_TEAL : '#6B7280'
                }}>
                  {f.refundable ? 'REFUNDABLE' : 'NON-REFUND'}
                </span>
                {/* price */}
                <span style={{ padding: '8px 12px', fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                  ${f.pricePP.toFixed(2)}
                </span>
              </button>);

          })}
        </div>
        {active &&
        <div style={{ fontSize: 12, color: WF.inkSoft, paddingTop: 8, borderTop: `1px solid ${WF.lineSoft}` }}>
            <span style={{ color: WF.inkSoft, fontWeight: 500 }}>Selected Rate Plan</span>
            {' · '}{active.note}
          </div>
        }
      </div>
    </div>);

}

// ── Guest roster helper ──────────────────────────────────────────────────
// Age is no longer captured per-guest; each of the 4 guest-count categories
// already implies an age band, so eligibility is derived from `minAge` here.
const SUPP_GUEST_CATS = [
  { key: 'adults', heading: 'ADULTS', prefix: 'Guest', minAge: 21, ageLabel: '21+' },
  { key: 'youngAdults', heading: 'YOUNG ADULTS', prefix: 'Guest', minAge: 13, ageLabel: '13-21' },
  { key: 'children', heading: 'CHILDREN', prefix: 'Child', minAge: 3, ageLabel: '3-12' },
  { key: 'infants', heading: 'INFANTS', prefix: 'Infant', minAge: 0, ageLabel: '0-3' }
];

function buildGuestList(guests) {
  const g = guests || {};
  return SUPP_GUEST_CATS.reduce((list, { key, prefix, minAge, ageLabel }) => {
    const count = g[key] || 0;
    return list.concat(Array.from({ length: count }, (_, i) => ({
      guestKey: `${key}-${i}`,
      categoryKey: key,
      label: `${prefix} ${i + 1}`,
      minAge,
      ageLabel
    })));
  }, []);
}

// Supplement quantities remain assigned to individual guest keys. Cabins only
// provide the visual grouping and ordering requested for this screen.
function buildCabinGuestRoster(guests, cabins) {
  const allGuests = buildGuestList(guests);
  const cabinList = Array.isArray(cabins) ? cabins : [];

  // Until rooms are confirmed there is no honest cabin grouping to show. Keep
  // the guests together under a neutral pending header rather than falling back
  // to the retired age-category sections.
  if (cabinList.length === 0) {
    return allGuests.length > 0 ? [{
      key: 'unassigned',
      heading: 'CABIN ASSIGNMENT PENDING',
      count: allGuests.length,
      list: allGuests
    }] : [];
  }

  const byCategory = {};
  SUPP_GUEST_CATS.forEach(({ key }) => {
    byCategory[key] = allGuests.filter((guest) => guest.categoryKey === key);
  });
  const cursor = Object.fromEntries(SUPP_GUEST_CATS.map(({ key }) => [key, 0]));

  const groups = cabinList.map((cabin, cabinIndex) => {
    const list = [];
    SUPP_GUEST_CATS.forEach(({ key }) => {
      const count = (cabin && cabin.guests && cabin.guests[key]) || 0;
      const start = cursor[key];
      list.push(...byCategory[key].slice(start, start + count));
      cursor[key] += count;
    });
    return {
      key: cabin.id || `cabin-${cabinIndex}`,
      heading: `CABIN ${cabinIndex + 1} · ROOM ${cabin.num || '—'}`,
      count: list.length,
      list
    };
  }).filter((group) => group.count > 0);

  // A partially distributed party can exist while the room matrix is still
  // being edited. Keep those guests visible and assignable without pretending
  // they belong to a confirmed room.
  const distributed = new Set(groups.flatMap((group) => group.list.map((guest) => guest.guestKey)));
  const unassigned = allGuests.filter((guest) => !distributed.has(guest.guestKey));
  if (unassigned.length > 0) {
    groups.push({
      key: 'unassigned',
      heading: 'CABIN ASSIGNMENT PENDING',
      count: unassigned.length,
      list: unassigned
    });
  }

  return groups;
}

// ── Compact per-guest quantity stepper (flat, screenshot style) ──
function GuestSupplyStepper({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: disabled ? 0.4 : 1 }}>
      <button
        onClick={() => !disabled && value > 0 && onChange(value - 1)}
        disabled={disabled || value === 0}
        style={{
          width: 24, height: 24, borderRadius: '50%', border: `1px solid ${WF.line}`,
          background: '#fff', color: value === 0 || disabled ? WF.inkFaint : WF.ink,
          cursor: disabled || value === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>−</button>
      <div style={{ width: 16, textAlign: 'center', fontSize: 14, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>{value}</div>
      <button
        onClick={() => !disabled && onChange(value + 1)}
        disabled={disabled}
        style={{
          width: 24, height: 24, borderRadius: '50%', border: 'none',
          background: disabled ? '#E2E8F0' : S2_DARK, color: '#fff',
          cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>+</button>
    </div>
  );
}

// ── Per-guest assignment panel, visually grouped by cabin ──
function AssignGuestsPanel({ sup, roster, assignment, onGuestQty, onAddCabin, onClearCabin, onDone }) {
  return (
    <div style={{ padding: '4px 16px 16px', background: '#fff' }}>
      {/* Cabin cards use a two-column grid instead of one long vertical roster.
          Each card remains a per-guest assignment surface; the grid only
          changes how the cabin groups are presented. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, alignItems: 'start' }}>
        {roster.map((cabin) => {
          const cabinQty = cabin.list.reduce((sum, guest) => sum + (assignment[guest.guestKey] || 0), 0);
          const eligibleGuests = cabin.list.filter((guest) =>
            guest.categoryKey !== 'infants' && (sup.minAge == null || guest.minAge >= sup.minAge)
          );
          const allEligibleAssigned = eligibleGuests.length > 0 && eligibleGuests.every((guest) => (assignment[guest.guestKey] || 0) > 0);
          return (
          <div key={cabin.key} style={{ border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, padding: '8px 16px', background: '#F8FAFC',
              borderBottom: `1px solid ${WF.lineSoft}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>{cabin.heading}</span>
                <span style={{ fontSize: 12, color: WF.inkSoft }}>· {cabin.count} guest{cabin.count === 1 ? '' : 's'}</span>
              </span>
            </div>
            {cabin.list.map((guest, gi) => {
              const isInfant = guest.categoryKey === 'infants';
              const restricted = isInfant || (sup.minAge != null && guest.minAge < sup.minAge);
              const qty = isInfant ? 0 : (assignment[guest.guestKey] || 0);
              return (
                <div key={guest.guestKey} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 16px', borderBottom: gi < cabin.list.length - 1 ? `1px solid ${WF.lineSoft}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>{guest.label}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: WF.inkSoft, background: '#F1F5F9',
                      borderRadius: 4, padding: '4px 8px', whiteSpace: 'nowrap'
                    }}>Age {guest.ageLabel}</span>
                    {restricted && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: isInfant ? WF.inkFaint : '#B45309', whiteSpace: 'nowrap' }}>
                        {isInfant ? 'Not eligible' : `${sup.minAge}+ only`}
                      </span>
                    )}
                  </div>
                  <GuestSupplyStepper
                    value={qty}
                    disabled={restricted}
                    onChange={(v) => onGuestQty(guest.guestKey, v)} />
                </div>
              );
            })}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              padding: '8px 12px', background: '#F8FAFC', borderTop: `1px solid ${WF.lineSoft}`
            }}>
              <button
                type="button"
                disabled={cabinQty === 0}
                onClick={() => onClearCabin(cabin.list.map((guest) => guest.guestKey))}
                aria-label={`Remove ${sup.name} from all guests in ${cabin.heading}`}
                title={cabinQty > 0 ? `Remove ${sup.name} from every guest in this cabin` : `No ${sup.name} assigned in this cabin`}
                style={{
                  padding: '4px 8px', borderRadius: 5, fontFamily: 'inherit',
                  border: `1px solid ${cabinQty > 0 ? '#FCA5A5' : WF.line}`,
                  background: cabinQty > 0 ? '#FEF2F2' : '#fff',
                  fontSize: 12, fontWeight: 700, color: cabinQty > 0 ? '#B91C1C' : WF.inkLabel,
                  cursor: cabinQty > 0 ? 'pointer' : 'default', whiteSpace: 'nowrap'
                }}>
                Remove all
              </button>
              <button
                type="button"
                disabled={allEligibleAssigned || eligibleGuests.length === 0}
                onClick={() => onAddCabin(eligibleGuests.map((guest) => guest.guestKey))}
                aria-label={`Assign ${sup.name} to all eligible guests in ${cabin.heading}`}
                title={allEligibleAssigned ? `${sup.name} is already assigned to every eligible guest` : `Assign one ${sup.name} to every eligible guest in this cabin`}
                style={{
                  padding: '4px 8px', borderRadius: 5, fontFamily: 'inherit',
                  border: `1px solid ${allEligibleAssigned || eligibleGuests.length === 0 ? WF.line : WF.accentLine}`,
                  background: allEligibleAssigned || eligibleGuests.length === 0 ? '#fff' : WF.accentTint,
                  fontSize: 12, fontWeight: 700, color: allEligibleAssigned || eligibleGuests.length === 0 ? WF.inkLabel : WF.accentInk,
                  cursor: allEligibleAssigned || eligibleGuests.length === 0 ? 'default' : 'pointer', whiteSpace: 'nowrap'
                }}>
                  Assign to all
              </button>
            </div>
          </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          onClick={onDone}
          style={{
            padding: '8px 20px', fontSize: 12, fontWeight: 700, borderRadius: 6,
            border: 'none', background: S2_DARK, color: '#fff',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>Done</button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 4. Supplements catalog (single-column assignment list)
// ───────────────────────────────────────────────────────────────────────────
function SupplementsSection({ selectedSupps, guests, cabins, suppAssignments, onToggle }) {
  const suppQtys = selectedSupps || {}; // { suppId: totalQty, ... }
  const assignments = suppAssignments || {}; // { suppId: { guestKey → qty } }
  const [catFilter, setCatFilter] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedSuppId, setExpandedSuppId] = React.useState(null);

  const roster = buildCabinGuestRoster(guests, cabins);
  const hasGuests = roster.length > 0;
  const activeSup = expandedSuppId ? S2_SUPP.find((supp) => supp.id === expandedSuppId) : null;

  React.useEffect(() => {
    if (!expandedSuppId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setExpandedSuppId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expandedSuppId]);

  // Filter the individual supplement catalog by category and search.
  const filteredSupps = S2_SUPP.filter((s) => {
    if (catFilter && s.category !== catFilter) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique categories from supplements
  const categories = ['All', ...new Set(S2_SUPP.map((s) => s.category))];
  const selectedProductCount = Object.keys(suppQtys).length;
  const totalAssignedUnits = Object.values(suppQtys).reduce((sum, qty) => sum + qty, 0);
  const activeAssignment = activeSup ? (assignments[activeSup.id] || {}) : {};
  const activeAssignedGuests = Object.values(activeAssignment).filter((qty) => qty > 0).length;
  const activeAssignedUnits = activeSup ? (suppQtys[activeSup.id] || 0) : 0;

  const setGuestQty = (suppId, guestKey, qty) => {
    const suppAssign = { ...(assignments[suppId] || {}) };
    if (guestKey.startsWith('infants-')) {
      delete suppAssign[guestKey];
      commitSuppAssignment(suppId, suppAssign);
      return;
    }
    if (qty <= 0) delete suppAssign[guestKey]; else suppAssign[guestKey] = qty;
    commitSuppAssignment(suppId, suppAssign);
  };

  const addCabinQty = (suppId, guestKeys) => {
    const suppAssign = { ...(assignments[suppId] || {}) };
    guestKeys.forEach((guestKey) => {
      if (!guestKey.startsWith('infants-')) suppAssign[guestKey] = Math.max(1, suppAssign[guestKey] || 0);
    });
    commitSuppAssignment(suppId, suppAssign);
  };

  const clearCabinQty = (suppId, guestKeys) => {
    const suppAssign = { ...(assignments[suppId] || {}) };
    guestKeys.forEach((guestKey) => delete suppAssign[guestKey]);
    commitSuppAssignment(suppId, suppAssign);
  };

  const commitSuppAssignment = (suppId, suppAssign) => {
    const validAssignment = Object.fromEntries(
      Object.entries(suppAssign).filter(([guestKey, qty]) => !guestKey.startsWith('infants-') && qty > 0)
    );
    const nextAssignments = { ...assignments };
    if (Object.keys(validAssignment).length === 0) delete nextAssignments[suppId]; else nextAssignments[suppId] = validAssignment;
    const totalQty = Object.values(validAssignment).reduce((a, b) => a + b, 0);
    const nextQtys = { ...suppQtys };
    if (totalQty <= 0) delete nextQtys[suppId]; else nextQtys[suppId] = totalQty;
    onToggle(nextQtys, nextAssignments);
  };

  return (
    <div className="mvas-step2-supplements">
      <style>{`
        @media (max-width: 1100px) {
          .mvas-step2-supplements .mvas-supplement-list-header { display: none !important; }
          .mvas-step2-supplements .mvas-supplement-list-row {
            grid-template-columns: minmax(0, 1fr) auto !important;
            row-gap: 8px !important;
          }
          .mvas-step2-supplements .mvas-supplement-product-cell { grid-column: 1; grid-row: 1; }
          .mvas-step2-supplements .mvas-supplement-assignment-cell { grid-column: 1; grid-row: 2; }
          .mvas-step2-supplements .mvas-supplement-price-cell { grid-column: 2; grid-row: 1; }
          .mvas-step2-supplements .mvas-supplement-action-cell { grid-column: 2; grid-row: 2; }
        }
      `}</style>
      {!hasGuests && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 16,
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
          fontSize: 12, color: '#92400E', fontWeight: 500
        }}>
          ⚠ Add guest count &amp; ages in Step 1 or Step 3 to assign supplements per guest.
        </div>
      )}

      {/* Available to add section — search + category pills above the list */}
      <div style={{
        marginBottom: 12, border: `1px solid ${WF.line}`, borderRadius: 9,
        overflow: 'hidden', background: '#FFFFFF',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '8px 12px', background: WF.fill, borderBottom: `1px solid ${WF.line}`,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>Supplement catalog</div>
            <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>Assign optional products to eligible guests</div>
          </div>
          {selectedProductCount > 0 && (
            <span style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${WF.accentLine}`, background: WF.accentTint, fontSize: 12, fontWeight: 700, color: WF.accent }}>
              {selectedProductCount} products · {totalAssignedUnits} assignments
            </span>
          )}
        </div>
        <div style={{ padding: '12px 12px 8px' }}>
        {/* Search bar */}
        <div style={{ marginBottom: 8, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: WF.inkSoft, pointerEvents: 'none'
          }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search supplements…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
              border: `1px solid ${WF.line}`, background: WF.panel, color: WF.ink,
              fontSize: 14, fontFamily: 'inherit', transition: 'border-color 0.12s'
            }}
            onFocus={(e) => e.target.style.borderColor = S2_TEAL}
            onBlur={(e) => e.target.style.borderColor = WF.line} />
          
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const on = cat === 'All' && catFilter === null || catFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat === 'All' ? null : cat)}
                style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: on ? 700 : 500,
                  border: `1px solid ${on ? WF.accent : WF.line}`,
                  background: on ? WF.accent : WF.panel,
                  color: on ? '#fff' : WF.ink,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s'
                }}>
                {cat}
              </button>);

          })}
        </div>
        </div>

      {/* Supplements list with assign-guests controls */}
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{
          border: `1px solid ${WF.line}`, borderRadius: 8,
          overflow: 'hidden', background: WF.panel,
        }}>
          <div className="mvas-supplement-list-header" aria-hidden="true" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(130px, 0.42fr) 92px 72px',
            alignItems: 'center', gap: 12, padding: '8px 12px',
            borderBottom: `1px solid ${WF.line}`, background: WF.fill,
            color: WF.inkSoft, fontSize: 12, fontWeight: 600,
          }}>
            <span>Product</span>
            <span>Assignment</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span />
          </div>
          {filteredSupps.length > 0 ? filteredSupps.map((sup, index) => {
            const suppAssign = assignments[sup.id] || {};
            const qty = suppQtys[sup.id] || 0;
            const lineTotal = sup.pricePP * qty;
            const expanded = expandedSuppId === sup.id;
            const assignedGuestCount = Object.values(suppAssign).filter((v) => v > 0).length;
            const assignedCaption = `${assignedGuestCount} guest${assignedGuestCount === 1 ? '' : 's'}`;

            return (
              <div
                key={sup.id}
                style={{
                  borderBottom: index < filteredSupps.length - 1 ? `1px solid ${WF.lineSoft}` : 'none',
                  overflow: 'hidden',
                  background: expanded ? WF.accentTint : '#FFFFFF',
                  boxShadow: qty > 0 ? `inset 3px 0 ${WF.accent}` : 'none',
                  transition: 'border-color 0.12s, background 0.12s'
                }}>
                <button
                  className="mvas-supplement-list-row"
                  type="button"
                  onClick={() => hasGuests && setExpandedSuppId(sup.id)}
                  disabled={!hasGuests}
                  aria-expanded={expanded}
                  aria-haspopup="dialog"
                  aria-label={`${qty > 0 ? 'Review assignment for' : 'Assign guests to'} ${sup.name}`}
                  style={{
                    width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(130px, 0.42fr) 92px 72px',
                    alignItems: 'center', padding: '8px 12px', gap: 12,
                    cursor: hasGuests ? 'pointer' : 'not-allowed',
                    opacity: hasGuests ? 1 : 0.55, transition: 'background 0.12s'
                  }}
                  onMouseEnter={(e) => { if (hasGuests && !expanded) e.currentTarget.style.background = WF.fill; }}
                  onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}>
                  {/* Supplement info */}
                  <div className="mvas-supplement-product-cell" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{
                      width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${WF.line}`, borderRadius: 7, background: '#FFFFFF',
                      fontSize: 16, flexShrink: 0
                    }}>{sup.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: WF.ink }}>{sup.name}</div>
                        {sup.minAge != null && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: 4, padding: '4px 4px' }}>
                            {sup.minAge}+
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: WF.inkSoft }}>{sup.category}</div>
                    </div>
                  </div>

                  <div className="mvas-supplement-assignment-cell" style={{ minWidth: 0, fontSize: 12 }}>
                    {qty > 0 ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', borderRadius: 999,
                        background: '#F0FDF4', border: '1px solid #BBF7D0',
                        color: '#047857', fontSize: 12, fontWeight: 700,
                        lineHeight: '16px', whiteSpace: 'nowrap'
                      }}>
                        <span aria-hidden="true">✓</span>
                        {assignedCaption}
                      </span>
                    ) : (
                      <span style={{ color: WF.inkSoft }}>Not assigned</span>
                    )}
                  </div>

                  {/* One commercial summary per list row: assigned products lead
                      with the actual total, while unassigned products lead
                      with their unit price. */}
                  <div className="mvas-supplement-price-cell" style={{ minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>
                        {qty > 0 ? 'Total' : 'Per guest'}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>
                        {qty > 0 ? `+$${lineTotal.toFixed(2)}` : `$${sup.pricePP.toFixed(2)}`}
                      </div>
                  </div>
                    <span className="mvas-supplement-action-cell" style={{
                      width: 72, height: 30, padding: '0 8px 0 12px', borderRadius: 6,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                      border: `1px solid ${qty > 0 ? WF.accentLine : WF.line}`,
                      background: qty > 0 ? WF.accentTint : '#FFFFFF', color: WF.accent,
                      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                      {qty > 0 ? 'Edit' : 'Assign'}
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                </button>
              </div>);

          }) :
          <div style={{
            fontSize: 12, color: WF.inkFaint, textAlign: 'center',
            padding: '24px 0'
          }}>
              No supplements match your filters.
            </div>
          }
        </div>
      </div>
      </div>

      {activeSup && hasGuests && (
        <div
          onClick={() => setExpandedSuppId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500, padding: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(1px)'
          }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Assign ${activeSup.name} to guests`}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(940px, 100%)', maxHeight: '86vh', display: 'flex', flexDirection: 'column',
              background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 10,
              overflow: 'hidden', boxShadow: '0 24px 64px rgba(15,23,42,0.28)'
            }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexShrink: 0,
              background: WF.fill, borderBottom: `1px solid ${WF.line}`
            }}>
              <span style={{
                width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${WF.line}`, borderRadius: 8, background: '#FFFFFF', fontSize: 20, flexShrink: 0
              }}>{activeSup.emoji}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>{activeSup.category}</div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>{activeSup.name}</span>
                  {activeSup.minAge != null && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: 4, padding: '4px 4px' }}>{activeSup.minAge}+</span>
                  )}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>Assign quantities by cabin and eligible guest.</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>Per guest</div>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>${activeSup.pricePP.toFixed(2)}</div>
                {activeAssignedUnits > 0 && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#047857', fontWeight: 700 }}>
                    {activeAssignedGuests} guest{activeAssignedGuests === 1 ? '' : 's'} · +${(activeSup.pricePP * activeAssignedUnits).toFixed(2)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setExpandedSuppId(null)}
                aria-label="Close supplement assignment"
                style={{
                  width: 30, height: 30, marginLeft: 4, borderRadius: 6, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${WF.line}`, background: '#FFFFFF', color: WF.inkSoft,
                  fontSize: 16, fontFamily: 'inherit', cursor: 'pointer'
                }}>×</button>
            </div>
            <div style={{ minHeight: 0, overflowY: 'auto', paddingTop: 8 }}>
              <AssignGuestsPanel
                sup={activeSup}
                roster={roster}
                assignment={activeAssignment}
                onGuestQty={(guestKey, value) => setGuestQty(activeSup.id, guestKey, value)}
                onAddCabin={(guestKeys) => addCabinQty(activeSup.id, guestKeys)}
                onClearCabin={(guestKeys) => clearCabinQty(activeSup.id, guestKeys)}
                onDone={() => setExpandedSuppId(null)} />
            </div>
          </div>
        </div>
      )}
      
      {Object.keys(suppQtys).length === 0 &&
      <div style={{
        fontSize: 12, color: WF.inkFaint, textAlign: 'center',
        padding: '12px 0', borderTop: `1px solid ${WF.lineSoft}`
      }}>
          No supplements added — base fare only.
        </div>
      }
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// Progressive disclosure wrapper
// ───────────────────────────────────────────────────────────────────────────
function DisclosureSection({ label, badge, badgeColor, badgeTint, badgeLine, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', background: 'none', border: 'none',
          padding: '0 0 12px 0', cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left'
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ flexShrink: 0, color: WF.inkSoft, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }}>
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: WF.inkLabel }}>
          {label}
        </span>
        {badge &&
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 10,
          background: badgeColor ? (badgeTint || WF.fill) : WF.fill,
          color: badgeColor || WF.inkSoft,
          border: `1px solid ${badgeColor ? (badgeLine || WF.line) : WF.line}`
        }}>{badge}</span>
        }
      </button>
      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// Sailing card — collapsed header + expandable body
// ───────────────────────────────────────────────────────────────────────────
function sailingLeadFare(sailing, guests) {
  const quoteGuests = payCount(guests) > 0 ? guests : { adults: 2, children: 0, infants: 0 };
  const price = priceQuote({
    sailing, cabinId: 'IS', farecodeId: null,
    guests: quoteGuests, bundleLines: [], gratuityRemoved: true, intentId: null
  });
  return perPerson(price.baseFareTotal, quoteGuests);
}

function sailingDateSummary(sailing, bookingWindow) {
  const match = bookingWindow && bookingWindow.display.match(
    /^([A-Z]{3})\s*-\s*([A-Z]{3})\s+(\d{2})\/(\d{2})\s*-\s*(\d{2})\/(\d{2})$/
  );
  if (!match) {
    return {
      primary: sailing.depart,
      secondary: sailing.ret ? `Returns ${sailing.ret}` : 'Departure date',
    };
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, startDay, endDay, startMonth, startDate, endMonth, endDate] = match;
  const startMonthLabel = months[Number(startMonth) - 1];
  const endMonthLabel = months[Number(endMonth) - 1];
  const range = startMonth === endMonth
    ? `${startMonthLabel} ${Number(startDate)}–${Number(endDate)}`
    : `${startMonthLabel} ${Number(startDate)} – ${endMonthLabel} ${Number(endDate)}`;
  const year = (sailing.depart.match(/\b\d{4}\b/) || [])[0];
  const dayLabel = `${startDay[0]}${startDay.slice(1).toLowerCase()}–${endDay[0]}${endDay.slice(1).toLowerCase()}`;
  return { primary: range, secondary: year ? `${dayLabel} · ${year}` : dayLabel };
}

function SailingCard({ s, update, sailing, expanded, onToggle, resultRow = false }) {
  const g = s.guests;
  const DeckMap = window.CabinDeckMapSection;
  const selectedHere = s.selectedSailingCode === sailing.code;
  const nights = sailing.nights;
  const guestCount = g.adults + (g.youngAdults || 0) + g.children + g.infants;
  const bookingWindow = getWindowForSailing(sailing.code);
  const dateSummary = sailingDateSummary(sailing, bookingWindow);

  // Collapsed "from" price — cheapest farecode, IS cabin, via priceQuote.
  // Falls back to double occupancy before the party is entered, so the lead-in
  // rate reads as a real "from" price rather than $0.
  const fromPP = sailingLeadFare(sailing, g);

  // Expanded header price — selected farecode scaled to this sailing's fareIndex
  const expandedPP = (() => {
    if (!s.farecodeId) return null;
    const fc = S2_FC.find((f) => f.id === s.farecodeId);
    return fc ? Math.round(fc.pricePP * sailing.fareIndex / BASE_FARE_IDX) : null;
  })();

  const handleToggle = () => {
    // Only clear the downstream selections when the sailing actually changes.
    // Re-opening the sailing you already picked used to wipe cabin, farecode,
    // supplements — and left suppAssignments/cabins pointing at
    // rooms that no longer had a cabinId.
    if (sailing.code !== s.selectedSailingCode) {
      update({
        selectedSailingCode: sailing.code,
        cabinId: null,
        farecodeId: null,
        selectedSupps: {},
        suppAssignments: {},
        cabins: [],
        selectedCabinNum: null,
        selectedCabinDeck: null,
        selectedCabinStratum: null
      });
    }
    onToggle();
  };

  const toggleSupp = (qtyObj, assignments) => {
    update({ selectedSupps: qtyObj, suppAssignments: assignments !== undefined ? assignments : s.suppAssignments });
  };

  return (
    <div
      className={resultRow ? 'sailing-result' : undefined}
      role={resultRow ? 'listitem' : undefined}
      style={{
      border: resultRow ? undefined : `1px solid ${selectedHere ? WF.accent : WF.line}`,
      borderRadius: resultRow ? 0 : 9,
      background: resultRow ? WF.panel : selectedHere ? WF.accentTint : WF.panel,
      boxShadow: resultRow
        ? 'none'
        : selectedHere ? `0 0 0 1px ${WF.accentLine}` : '0 1px 2px rgba(15,23,42,0.05)',
      transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      overflow: 'hidden'
    }}>
      {/* ── Collapsed header (always visible) — aligned comparison row ── */}
      <button
        type="button"
        className="sailing-result__button"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label={`${nights} ${nights === 1 ? 'night' : 'nights'}, ${routeOf(sailing)}, ${sailing.ship}, ${dateSummary.primary}, from $${fromPP.toLocaleString()} per guest. ${expanded ? 'Close details' : 'Book this sailing'}`}
        data-comment-anchor="f0c77595d9-button-605-7">

        {/* Col 1: Duration */}
        <div className="sailing-result__duration" style={{ minWidth: 0 }}>
          <div className="s4-money" style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: WF.ink }}>{nights}</div>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>{nights === 1 ? 'night' : 'nights'}</div>
        </div>

        {/* Col 2: Sailing identity */}
        <div className="sailing-result__identity" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {routeOf(sailing)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: WF.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sailing.ship}</span>
            <span aria-hidden="true" style={{ color: WF.line, fontSize: 12 }}>•</span>
            <span className="s4-money" style={{ fontSize: 12, color: WF.inkLabel, whiteSpace: 'nowrap' }}>{sailing.code}</span>
          </div>
        </div>

        {/* Col 3: Departure window and offer */}
        <div className="sailing-result__departure" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {dateSummary.primary}
            </span>
            {bookingWindow && bookingWindow.discount && (
              <span style={{
                flexShrink: 0, padding: '4px 8px', borderRadius: 4,
                background: WF.accentTint, border: `1px solid ${WF.accentLine}`,
                color: WF.accent, fontSize: 12, lineHeight: '16px', fontWeight: 700,
              }}>50% OFF</span>
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>{dateSummary.secondary}</div>
        </div>

        {/* Col 4: Price */}
        <div className="sailing-result__price" style={{ textAlign: 'right', minWidth: 0 }}>
          <div className="s4-money" style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: WF.ink }}>
            ${fromPP.toLocaleString()}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>per guest</div>
        </div>

        {/* Col 5: booking action */}
        <div className="sailing-result__action" aria-hidden="true" style={{
          minHeight: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 8px', borderRadius: 6, border: `1px solid ${resultRow ? WF.line : selectedHere ? WF.accentLine : WF.line}`,
          background: '#FFFFFF', color: WF.ink, fontSize: 12, lineHeight: '16px', fontWeight: 600,
        }}>
          <span>{expanded ? 'Close' : 'Book'}</span>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded &&
      <div style={{ padding: '16px 20px 20px', borderTop: `1px solid ${WF.lineSoft}` }}>
          {/* 1. Farecodes */}
          <FarecodesSection2
          farecodeId={s.farecodeId}
          onSelect={(id) => update({ farecodeId: id })} />
        

          <div style={{ height: 1, background: WF.lineSoft, margin: '16px 0' }} />

          {/* 2. Cabin category */}
          <CabinSection2
          cabinId={s.cabinId}
          onSelect={(id) => update({ cabinId: id })} />

          {/* 2b. Selected room summary — shown after picking a room */}
          {s.cabinId && s.selectedCabinNum &&
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', marginTop: 12,
          background: '#F0F9FF', border: '1.5px solid #3B82F6',
          borderRadius: 8
        }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#3B82F6', flexShrink: 0 }}>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: WF.accentInk }}>Room {s.selectedCabinNum}</span>
                {s.selectedCabinDeck &&
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', padding: '4px 8px', borderRadius: 4, background: '#DBEAFE' }}>
                    Deck {s.selectedCabinDeck}
                  </span>
            }
                {s.selectedCabinStratum &&
            <span style={{ fontSize: 12, color: '#3B82F6' }}>{s.selectedCabinStratum}</span>
            }
              </div>
              <button
            onClick={() => update({ selectedCabinNum: null, selectedCabinDeck: null, selectedCabinStratum: null })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
              color: WF.accentOn, fontFamily: 'inherit', fontWeight: 700, padding: '4px 8px',
              borderRadius: 4, whiteSpace: 'nowrap' }}>
                Change
              </button>
            </div>
        }

          {/* 2c. Deck map — only when manually selecting and no room chosen yet */}
          {s.cabinId && !s.selectedCabinNum && (s.assignmentMethod || 'manual') === 'manual' && DeckMap &&
        <DeckMap
          cabinId={s.cabinId}
          selectedCabin={null}
          onSelectCabin={({ num, stratum, deckNum }) => update({ selectedCabinNum: num, selectedCabinStratum: stratum, selectedCabinDeck: deckNum })}
          deckPreference={s.deckPreference || 'upper'}
          onDeckPreference={(val) => update({ deckPreference: val })}
          assignmentMethod={s.assignmentMethod || 'manual'}
          onAssignmentMethod={(val) => update({ assignmentMethod: val })} />

        }

          <div style={{ height: 1, background: WF.lineSoft, margin: '16px 0' }} />

          {/* 3. Individual supplements — progressive disclosure */}
          <DisclosureSection
          label="Supplements"
          badge={Object.keys(s.selectedSupps || {}).length > 0 ? `${Object.keys(s.selectedSupps || {}).length} added` : 'Optional'}
          badgeColor={Object.keys(s.selectedSupps || {}).length > 0 ? S2_TEAL : null}
          badgeTint={S2_TEAL_TINT}
          badgeLine={WF.accentLine}>
            <SupplementsSection
            selectedSupps={s.selectedSupps}
            guests={s.guests}
            cabins={s.cabins}
            suppAssignments={s.suppAssignments}
            onToggle={toggleSupp} />
          </DisclosureSection>
        
        </div>
      }
    </div>);

}

const SAILING_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SAILING_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sailingDepartureDate(sailing) {
  const parts = String(sailing && sailing.depart || '').replace(',', '').split(/\s+/);
  const month = SAILING_MONTHS.indexOf(parts[0]);
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  return month >= 0 && day && year ? new Date(year, month, day) : null;
}

function sailingMonthKey(date) {
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '';
}

function SailingCalendarView({ state, sailings, onSelect }) {
  const datedSailings = sailings
    .map((sailing) => ({ sailing, date: sailingDepartureDate(sailing) }))
    .filter((item) => item.date)
    .sort((a, b) => a.date - b.date);
  const monthKeys = [...new Set(datedSailings.map((item) => sailingMonthKey(item.date)))];
  const [activeMonth, setActiveMonth] = React.useState(monthKeys[0] || '');

  React.useEffect(() => {
    if (!monthKeys.includes(activeMonth)) setActiveMonth(monthKeys[0] || '');
  }, [activeMonth, monthKeys.join('|')]);

  if (!activeMonth) return null;

  const activeIndex = monthKeys.indexOf(activeMonth);
  const [yearValue, monthValue] = activeMonth.split('-').map(Number);
  const monthIndex = monthValue - 1;
  const firstDayOffset = new Date(yearValue, monthIndex, 1).getDay();
  const daysInMonth = new Date(yearValue, monthIndex + 1, 0).getDate();
  const monthSailings = datedSailings.filter((item) => sailingMonthKey(item.date) === activeMonth);
  const byDay = monthSailings.reduce((map, item) => {
    const day = item.date.getDate();
    if (!map[day]) map[day] = [];
    map[day].push(item.sailing);
    return map;
  }, {});
  const calendarCells = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7) calendarCells.push(null);

  return (
    <div style={{ background: WF.panel }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '12px 12px', borderBottom: `1px solid ${WF.line}`,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>
            {SAILING_MONTHS[monthIndex]} {yearValue}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>
            {monthSailings.length} {monthSailings.length === 1 ? 'departure' : 'departures'} in this preview
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Previous month', delta: -1, disabled: activeIndex <= 0, icon: 'M7.5 2L3.5 6L7.5 10' },
            { label: 'Next month', delta: 1, disabled: activeIndex >= monthKeys.length - 1, icon: 'M4.5 2L8.5 6L4.5 10' },
          ].map((control) => (
            <button
              key={control.label}
              type="button"
              aria-label={control.label}
              disabled={control.disabled}
              onClick={() => setActiveMonth(monthKeys[activeIndex + control.delta])}
              style={{
                width: 30, height: 30, padding: 0, borderRadius: 7,
                display: 'grid', placeItems: 'center',
                border: `1px solid ${WF.line}`, background: WF.panel,
                color: control.disabled ? WF.inkFaint : WF.inkSoft,
                cursor: control.disabled ? 'not-allowed' : 'pointer',
              }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d={control.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', background: WF.fill }}>
        {SAILING_WEEKDAYS.map((day) => (
          <div key={day} style={{
            padding: '8px 8px', borderRight: `1px solid ${WF.lineSoft}`,
            color: WF.inkLabel, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center',
          }}>{day}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
        {calendarCells.map((day, index) => {
          const daySailings = day ? (byDay[day] || []) : [];
          return (
            <div key={`${day || 'blank'}-${index}`} style={{
              minHeight: 104, padding: 8,
              borderTop: `1px solid ${WF.lineSoft}`,
              borderRight: (index + 1) % 7 ? `1px solid ${WF.lineSoft}` : 'none',
              background: day ? WF.panel : WF.fill,
            }}>
              {day && <div style={{ fontSize: 12, fontWeight: daySailings.length ? 700 : 600, color: daySailings.length ? WF.ink : WF.inkFaint }}>{day}</div>}
              {daySailings.map((sailing) => {
                const availability = availabilityOf(sailing);
                const availabilityColor = availability.kind === 'active' ? '#047857' : availability.kind === 'draft' ? '#92400E' : '#B91C1C';
                return (
                  <button
                    key={sailing.code}
                    type="button"
                    onClick={() => onSelect(sailing)}
                    aria-label={`${routeOf(sailing)}, ${sailing.depart}, ${sailing.nights} nights`}
                    style={{
                      width: '100%', marginTop: 4, padding: '8px 8px', borderRadius: 6,
                      border: `1px solid ${WF.accentLine}`, background: WF.accentTint,
                      color: WF.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: availabilityColor, flexShrink: 0 }} />
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 }}>
                        {routeOf(sailing)}
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sailing.ship}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 4, color: WF.inkLabel, fontSize: 12 }}>
                      <span>{sailing.nights} nights</span>
                      <span className="s4-money" style={{ color: WF.ink, fontWeight: 700 }}>${sailingLeadFare(sailing, state.guests).toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main app
// ───────────────────────────────────────────────────────────────────────────

// ── Booking Window lookup ──
const BOOKING_WINDOWS = [
{ id: 1, dayRange: 'FRI–MON', display: 'FRI - MON 09/11 - 09/14', discount: false, sailingCodes: ['SAIL-77821', 'SAIL-77822', 'SAIL-77823', 'SAIL-77824', 'SAIL-77825', 'SAIL-77826', 'SAIL-77827', 'SAIL-77828', 'SAIL-77829', 'SAIL-77830'] },
{ id: 2, dayRange: 'FRI–MON', display: 'FRI - MON 09/18 - 09/21', discount: false, sailingCodes: ['SAIL-77831', 'SAIL-77832'] },
{ id: 3, dayRange: 'FRI–MON', display: 'FRI - MON 09/25 - 09/28', discount: true, sailingCodes: ['SAIL-77833', 'SAIL-77834', 'SAIL-77835', 'SAIL-77836'] },
{ id: 4, dayRange: 'MON–FRI', display: 'MON - FRI 09/29 - 10/03', discount: false, sailingCodes: ['SAIL-77837', 'SAIL-77838', 'SAIL-77839', 'SAIL-77840', 'SAIL-77841', 'SAIL-77842', 'SAIL-77843', 'SAIL-77844', 'SAIL-77845', 'SAIL-77846'] },
{ id: 5, dayRange: 'MON–FRI', display: 'MON - FRI 10/01 - 10/05', discount: false, sailingCodes: ['SAIL-77847', 'SAIL-77848', 'SAIL-77849', 'SAIL-77850', 'SAIL-77851', 'SAIL-77852', 'SAIL-77853', 'SAIL-77854'] },
{ id: 6, dayRange: 'THU–SUN', display: 'THU - SUN 09/10 - 09/13', discount: false, sailingCodes: ['SAIL-77855', 'SAIL-77856', 'SAIL-77857', 'SAIL-77858', 'SAIL-77859', 'SAIL-77860', 'SAIL-77861', 'SAIL-77862', 'SAIL-77863'] },
{ id: 7, dayRange: 'SAT–WED', display: 'SAT - WED 09/19 - 09/23', discount: true, sailingCodes: ['SAIL-77864', 'SAIL-77865', 'SAIL-77866', 'SAIL-77867'] },
{ id: 8, dayRange: 'TUE–SAT', display: 'TUE - SAT 09/28 - 10/02', discount: false, sailingCodes: ['SAIL-77868', 'SAIL-77869', 'SAIL-77870', 'SAIL-77871', 'SAIL-77872', 'SAIL-77873', 'SAIL-77874', 'SAIL-77875', 'SAIL-77876'] },
{ id: 9, dayRange: 'WED–SUN', display: 'WED - SUN 10/01 - 10/05', discount: false, sailingCodes: ['SAIL-77877', 'SAIL-77878', 'SAIL-77879', 'SAIL-77880', 'SAIL-77881', 'SAIL-77882', 'SAIL-77883', 'SAIL-77884'] },
{ id: 10, dayRange: 'SUN–THU', display: 'SUN - THU 10/05 - 10/09', discount: true, sailingCodes: ['SAIL-77885', 'SAIL-77886', 'SAIL-77887', 'SAIL-77888', 'SAIL-77889', 'SAIL-77890', 'SAIL-77891', 'SAIL-77892', 'SAIL-77893'] }];

function getWindowForSailing(code) {
  return BOOKING_WINDOWS.find((w) => w.sailingCodes.includes(code)) || null;
}


function BookingWindowBlock() {
  const [selectedWindow, setSelectedWindow] = React.useState(1);

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, background: WF.panel, padding: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 12 }}>
        Select booking window block
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {BOOKING_WINDOWS.map((window) => {
          const isSelected = selectedWindow === window.id;
          return (
            <button
              key={window.id}
              onClick={() => setSelectedWindow(window.id)}
              style={{
                position: 'relative',
                padding: '12px 12px',
                borderRadius: 10,
                border: isSelected ? `2.5px solid ${WF.ink}` : `1.5px solid ${WF.line}`,
                background: WF.fill,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
              
              {window.discount &&
              <div style={{
                position: 'absolute',
                top: -8,
                right: 12,
                background: '#FF6B35',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 4
              }}>
                50% OFF
              </div>
              }
              
              <div style={{ fontSize: 12, fontWeight: 600, color: WF.inkLabel, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {window.dayRange}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, lineHeight: '16px' }}>
                {window.display}
              </div>
            </button>);

        })}
      </div>
    </div>);

}

function Step2App({ booking, update, navigate }) {
  const SFPanel = window.SearchFilterPanel;
  const GroupProgress = window.GroupSetupProgress;
  const GroupSummaryRail = window.GroupSetupSummaryRail;
  const GroupContext = window.GroupContextBar;

  // Bound to the router's booking. Previously this step rebuilt itself from two
  // localStorage keys and then overwrote sessionStorage['bookingState'] on every
  // change — which is what wiped guest names, coupons and payment terms whenever
  // the agent stepped backwards into Step 2.
  const state = booking;
  const handleUpdate = update;
  const editingGroupSetup = state.surface === 'group-setup' && !!state.groupId;
  const groupSetupActive = state.reservationScope === 'group' && (!state.groupId || editingGroupSetup);


  // Resume straight into the sailing-detail view (farecode/stateroom/supplements
  // tabs) whenever a sailing was already locked in — otherwise every remount of
  // Step2App (e.g. bouncing back from Step 4) drops the user back on the coarse
  // sailing list, making a fully-configured booking look like it needs redoing.
  const [expandedCard, setExpandedCard] = React.useState(() => groupSetupActive ? null : (state.selectedSailingCode || null));
  const [selectedBookingWindow] = React.useState(null);
  const [inventoryView, setInventoryView] = React.useState('list');

  const sailing = getSailing(state.selectedSailingCode);
  const expandedSailing = getSailing(expandedCard);
  const guestCount = state.guests.adults + (state.guests.youngAdults || 0) + state.guests.children + state.guests.infants;

  // Get sailings for the selected booking window
  const selectedWindow = BOOKING_WINDOWS.find((w) => w.id === selectedBookingWindow);
  const sailingCodesForWindow = selectedWindow?.sailingCodes || [];

  // Filter sailings based on filter panel selections. Lives in intent-data.jsx
  // beside SAILINGS so the predicate stays with the data it filters.
  const filteredSailings = filterSailings(state);
  const visibleSailings = filteredSailings.slice(0, 10);
  const selectedGroupCruise = getGroupCruise(state.groupCruiseId) || getGroupCruiseForSailing(state.selectedSailingCode);

  const handleContinue = () => navigate(2);
  const openSailing = (nextSailing) => {
    if (nextSailing.code !== state.selectedSailingCode) {
      handleUpdate({
        selectedSailingCode: nextSailing.code,
        cabinId: null,
        farecodeId: null,
        selectedSupps: {},
        suppAssignments: {},
        cabins: [],
        selectedCabinNum: null,
        selectedCabinDeck: null,
        selectedCabinStratum: null,
      });
    }
    setExpandedCard(nextSailing.code);
  };
  const groupSetupEnabled = !!(
    (state.groupName || '').trim() &&
    (state.groupContactName || '').trim() &&
    selectedGroupCruise &&
    state.selectedSailingCode
  );
  const saveGroupSetup = () => {
    if (!groupSetupEnabled) return;
    handleUpdate({
      groupId: state.groupId || 'GRP-4734',
      groupStatus: state.groupStatus || 'Draft',
      groupCreatedAt: state.groupCreatedAt || 'Sep 22, 2026 · 12:30 PM',
      groupCruiseId: selectedGroupCruise.id,
      groupSailingCode: state.selectedSailingCode,
      groupBookingCount: state.groupBookingCount || 0,
      surface: 'group-workspace',
      step: 1,
    });
  };

  // Blocked continues used to only console.log, so the disabled CTA gave the
  // agent no idea what was still missing. Name the first unmet requirement.
  const [blockedMsg, setBlockedMsg] = React.useState(null);
  const handleBlocked = () => {
    if (groupSetupActive) {
      setBlockedMsg(
        !(state.groupName || '').trim() ? 'Enter a group name to continue.' :
        !(state.groupContactName || '').trim() ? 'Add the master contact to continue.' :
        !selectedGroupCruise ? 'Select a cruise to continue.' :
        !state.selectedSailingCode ? 'Select a sailing date to continue.' :
        'Complete the required group details to continue.'
      );
      return;
    }
    setBlockedMsg(
      !state.selectedSailingCode ? 'Select a sailing to continue.' :
      !state.cabinId ? 'Choose a cabin category to continue.' :
      'Choose a farecode to continue.'
    );
  };

  // Continue only enabled once sailing, cabin and farecode are all chosen.
  const continueEnabled = groupSetupActive
    ? groupSetupEnabled
    : !!(state.selectedSailingCode && state.cabinId && state.farecodeId);

  React.useEffect(() => { if (continueEnabled) setBlockedMsg(null); }, [continueEnabled]);

  return (
    <>
      <WFAppShell
        activeGroup="bookings"
        active="create-booking"
        breadcrumb={['CRM', 'Bookings', 'Create', expandedCard ? 'Cabin & Supplements' : 'Sailing']}
        contentPaddingTop={!groupSetupActive && expandedCard ? 0 : undefined}
        rightRail={groupSetupActive && GroupSummaryRail
          ? <GroupSummaryRail
              booking={state}
              actionLabel={editingGroupSetup ? 'Save group changes' : 'Create group'}
              actionEnabled={groupSetupEnabled}
              onAction={saveGroupSetup}
              onBlocked={handleBlocked}
              actionError={blockedMsg} />
          : <BookingSummaryPanel
              booking={state}
              update={handleUpdate}
              step={1}
              continueEnabled={continueEnabled}
              ctaLabel="Continue to guests"
              onContinue={handleContinue}
              onBlocked={handleBlocked}
              showFlowNavigation={false} />
        }
        bottomBar={!groupSetupActive && expandedCard ? (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: !state.groupId && expandedCard ? 'space-between' : 'flex-end', gap: 12
          }}>
            {!state.groupId && expandedCard && (
              <button
                type="button"
                onClick={() => setExpandedCard(null)}
                aria-label="Back to all sailings"
                style={{
                  minHeight: 40, padding: '8px 16px', border: `1px solid ${WF.line}`,
                  borderRadius: 8, background: WF.panel, color: WF.inkSoft,
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                Back to all sailings
              </button>
            )}
            <button
              type="button"
              onClick={() => (continueEnabled ? handleContinue() : handleBlocked())}
              aria-disabled={!continueEnabled}
              title={continueEnabled ? undefined : 'Complete the sailing, cabin and fare selection to continue'}
              style={{
                minWidth: 210, minHeight: 40, padding: '8px 20px', border: 'none',
                borderRadius: 8,
                background: continueEnabled ? WF.accent : WF.fillStrong,
                color: continueEnabled ? WF.accentText : WF.inkFaint,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                cursor: continueEnabled ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
              }}>
              Continue to guests
            </button>
          </div>
        ) : null}
        progressBar={groupSetupActive && GroupProgress
          ? <GroupProgress />
          : <StepProgress2
              current={expandedCard ? 2 : 1}
              onBack={expandedCard ? () => setExpandedCard(null) : undefined} />}>

        <div data-screen-label={expandedCard ? 'Step 2 · Cabin & Supplements' : 'Step 1 · Sailing'}>
          {state.groupId && !editingGroupSetup && GroupContext && <GroupContext booking={state} update={handleUpdate} />}
          {!expandedCard &&
          <div>
              <div style={{ fontWeight: 700, color: WF.ink, letterSpacing: '-0.01em', marginBottom: 8, fontSize: "20px" }}>
                {groupSetupActive ? (editingGroupSetup ? 'Edit group reservation' : 'Create a group reservation') : 'Select a sailing'}
              </div>

              <div style={{ fontSize: 14, color: WF.inkSoft, marginBottom: 16 }}>
                {groupSetupActive
                  ? (editingGroupSetup
                    ? 'Review the group details, cruise and sailing date, then save your changes.'
                    : 'Add the group context, then choose the cruise and sailing date this reservation will own.')
                  : 'Pick a departure, duration, and ship that match your client\'s travel dates.'}
              </div>

              {/* ── SEARCH FILTER PANEL ── */}
              {SFPanel && <SFPanel
                state={state}
                onUpdate={handleUpdate} />}
            </div>
          }

          {/* ── SAILING RESULTS — Individual booking always starts with a
                useful ten-item inventory preview. Filters keep the preview
                live; Group setup continues to use its dedicated selectors. ── */}
          {!groupSetupActive && (
          expandedCard ? (
          /* ── DETAIL VIEW: trip context sits above, outside the transactional
                fare / stateroom / supplement workspace. ── */
          <div style={{ marginTop: 16 }}>
            {expandedSailing && window.SelectedSailingSummary &&
              <window.SelectedSailingSummary sailing={expandedSailing} />}
            <div style={{
              border: `1px solid ${WF.line}`, borderRadius: 10, background: WF.panel,
              padding: 0, marginTop: 16, marginBottom: 0
            }}>
                <div style={{ borderRadius: 10, background: WF.panel }}>
                  {expandedSailing && (() => {
                    const DetailView = window.SailingDetailView;
                    return DetailView ?
                      <DetailView
                        key={expandedSailing.code}
                        sailing={expandedSailing}
                        s={state}
                        update={handleUpdate}
                        onContinue={handleContinue} /> :
                      <SailingCard
                        key={expandedSailing.code}
                        s={state}
                        update={handleUpdate}
                        sailing={expandedSailing}
                        expanded={true}
                        onToggle={() => {}} />;
                  })()}
                </div>
            </div>
          </div>) : (

          /* ── LIST VIEW: match count + collapsed rows, both growing with the page ── */
          <div style={{
            border: `1px solid ${WF.line}`, borderRadius: 10, background: WF.panel,
            overflow: 'hidden', marginBottom: 0, marginTop: 16,
            boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
          }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 12px', background: WF.panel, borderBottom: `1px solid ${WF.line}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, color: WF.ink }}>Sailing options</div>
                      <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>
                        {filteredSailings.length > 10
                          ? `Showing 10 of ${filteredSailings.length} available sailings`
                          : 'Compare itinerary, dates, and average fare'}
                      </div>
                    </div>
                  </div>
                  <div role="group" aria-label="Sailing results view" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: 4, borderRadius: 8,
                    border: `1px solid ${WF.line}`, background: WF.panel,
                  }}>
                    {[
                      { id: 'calendar', label: 'Calendar', icon: 'M2 4H10M3.5 2V4M8.5 2V4M2 3H10V10H2V3Z' },
                      { id: 'list', label: 'List', icon: 'M2 3H10M2 6H10M2 9H10' },
                    ].map((view) => {
                      const selected = inventoryView === view.id;
                      return (
                        <button
                          key={view.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setInventoryView(view.id)}
                          style={{
                            minHeight: 28, padding: '4px 8px', borderRadius: 6,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            border: `1px solid ${selected ? WF.accent : 'transparent'}`,
                            background: selected ? WF.accent : 'transparent',
                            color: selected ? WF.accentText : WF.inkSoft,
                            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                            fontWeight: selected ? 700 : 600,
                          }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d={view.icon} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {view.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {visibleSailings.length > 0 ? (
                  inventoryView === 'list' ? (
                    <div className="sailing-results-list">
                      <div className="sailing-results__columns" aria-hidden="true">
                        <div>Nights</div>
                        <div>Itinerary</div>
                        <div>Departure</div>
                        <div style={{ textAlign: 'right' }}>From / guest</div>
                        <div></div>
                      </div>
                      <div role="list" aria-label="Available sailings">
                        {visibleSailings.map((sail) =>
                          <SailingCard
                            key={sail.code}
                            s={state}
                            update={(changes) => {
                              handleUpdate(changes);
                              if (!groupSetupActive) setExpandedCard(sail.code);
                            }}
                            sailing={sail}
                            expanded={false}
                            resultRow
                            onToggle={() => { if (!groupSetupActive) setExpandedCard(sail.code); }} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <SailingCalendarView
                      state={state}
                      sailings={visibleSailings}
                      onSelect={openSailing} />
                  )
                ) : (
                <div style={{ fontSize: 12, color: WF.inkFaint, textAlign: 'center', padding: '16px 0' }}>
                  No sailings match your filters.
                </div>
                )}
              </div>))

          }

          {blockedMsg && !groupSetupActive &&
          <div style={{ marginTop: 12, fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>
              {blockedMsg}
            </div>
          }
        </div>
      </WFAppShell>


    </>);

}

window.Step2App = Step2App;
