// Step 2 · Sailing cards — expanded card redesign
// Sections: Upgrade Packages (multi-select) · Cabin Category · Farecodes & Promotions · Supplements chips
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

// ── Package comparison data ──
// These are reference values for 4 guests, IS cabin, NR-SAVER farecode
const PKG_COMPARE = {
  relaxation: { baseSupplements: 1044, gratuities: 270 },
  adventure: { baseSupplements: 864, gratuities: 270 },
  anniversary: { baseSupplements: 1164, gratuities: 270 },
  family: { baseSupplements: 744, gratuities: 270 }
};
const BASE_COMPARE = { total: 3020, cabinPP: 825, taxes: 300 };

// ── Step-2 data ──
const S2_PKG = [
{ id: 'relaxation', emoji: '🧖', name: 'Relaxation',
  tagline: 'Spa day passes, thermal access & slow mornings.',
  items: ['Spa Day Pass Window', 'Aromatherapy Tier Access', 'Thermal Suite Pass Included', 'Beach Club Allocation'],
  includedSupps: ['aroma', 'thermal', 'dining', 'fitness'],
  rate: 18 },
{ id: 'adventure', emoji: '🎿', name: 'Adventure',
  tagline: 'Reef snorkelling, zip-lines & excursions.',
  items: ['Snorkelling Excursion', 'Zip-Line Canopy Entry', 'Watersports Equipment', 'ATV Safari Slot'],
  includedSupps: ['shore', 'wifi', 'photo', 'theater'],
  rate: 16 },
{ id: 'anniversary', emoji: '💍', name: 'Anniversary',
  tagline: 'Champagne, couples massage & private dinners.',
  items: ['Champagne Welcome Kit', 'Couples Massage Session', 'Private Veranda Dinner', 'Sunset Helicopter Flight'],
  includedSupps: ['drinks', 'dining', 'wine', 'heli'],
  rate: 20 },
{ id: 'family', emoji: '👨‍👩‍👧‍👦', name: 'Family',
  tagline: 'Kids club access, photo packages & events.',
  items: ['Unlimited Kids Club Pass', 'Family Photo Album', 'Nature Wildlife Tour', 'Kids Dining Premium Pkg'],
  includedSupps: ['photo', 'fitness', 'arcade', 'laundry'],
  rate: 14 }];


const S2_CAB = [
{ id: 'IS', name: 'Interior', blurb: 'Cozy inside cabin, no window', deltaPP: 0 },
{ id: 'OV', name: 'Oceanview', blurb: 'Picture window, sea views', deltaPP: 218 },
{ id: 'BAL', name: 'Balcony', blurb: 'Private veranda', deltaPP: 551 },
{ id: 'STE', name: 'Suite', blurb: 'Suite + butler-ready', deltaPP: 1377 }];


// Prices keyed to SAIL-77834 (fareIndex 1.15), 4 guests
const S2_FC = [
{ id: 'NR-SAVER', code: 'NR–SAVER', refundable: false, pricePP: 778, deposit: 0.25,
  note: 'Non-refundable saver rate · 25% deposit due down.' },
{ id: 'FLEX-STD', code: 'FLEX–STD', refundable: true, pricePP: 863, deposit: 0.25,
  note: 'Refundable standard rate · 25% deposit due down.' },
{ id: 'EARLY-IS', code: 'EARLY–IS', refundable: false, pricePP: 738, deposit: 0.20,
  note: 'Early booking interior saver · 20% deposit due down.' }];


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
const S2_DARK = '#0D2533';
const BASE_FARE_IDX = 1.15; // SAIL-77834 reference fareIndex

// ── Tiny section label ──
function S2Label({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.9,
      color: '#6B7280', textTransform: 'uppercase', marginBottom: 8
    }}>{children}</div>);

}

// ───────────────────────────────────────────────────────────────────────────
// 1. Package card (multi-select toggle)
// ───────────────────────────────────────────────────────────────────────────
// `bundleTotalOverride` exists because this card's own `rate × guests × nights`
// is not what computeBookingPricing actually bills (Σ includedSupps.pricePP ×
// guests, with no nights factor). Anywhere the real charge is shown alongside
// it — Step 3's picker puts a live "Price change" in the same dialog — the two
// numbers would contradict each other, so that caller passes the real one.
function PackageCard({ pkg, selected, previewing, onClick, totalGuests, nights, bundleTotalOverride }) {
  const bundleTotal = bundleTotalOverride != null ? bundleTotalOverride : pkg.rate * totalGuests * nights;
  const highlighted = selected || previewing;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', padding: 16,
        borderRadius: 10, cursor: 'pointer', position: 'relative',
        transition: 'border-color 0.12s, box-shadow 0.12s',
        border: `1.5px solid ${highlighted ? S2_TEAL : WF.line}`,
        background: highlighted ? S2_TEAL_TINT : WF.panel,
        boxShadow: highlighted ? `0 0 0 3px ${S2_TEAL_TINT}` : '0 1px 3px rgba(15,23,42,0.04)'
      }}
      onMouseEnter={(e) => {if (!highlighted) e.currentTarget.style.borderColor = '#9CA3AF';}}
      onMouseLeave={(e) => {if (!highlighted) e.currentTarget.style.borderColor = WF.line;}}>
      
      {/* top-right circle checkbox */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 20, height: 20, borderRadius: 10,
        border: `1.5px solid ${highlighted ? S2_TEAL : '#D1D5DB'}`,
        background: highlighted ? S2_TEAL : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s', flexShrink: 0
      }}>
        {highlighted && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>

      {/* header: emoji + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, paddingRight: 28 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{pkg.emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>{pkg.name}</span>
      </div>

      {/* tagline */}
      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.45, marginBottom: 14 }}>
        {pkg.tagline}
      </div>

      {/* checklist */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {pkg.items.map((item, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: WF.inkSoft }}>
            <span style={{ color: highlighted ? S2_TEAL : '#9CA3AF', fontWeight: 700, fontSize: 12, lineHeight: 1 }}>✓</span>
            <span>{item}</span>
          </div>
        )}
      </div>

      {/* footer pricing. The nightly-rate row is dropped when the total is
          overridden — `pkg.rate` does not multiply out to the real charge, so
          printing both would show a sum that doesn't add up. */}
      <div style={{ borderTop: `1px solid ${highlighted ? '#B2E0E0' : WF.lineSoft}`, paddingTop: 12 }}>
        {bundleTotalOverride == null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>Per guest / night</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
              +${pkg.rate.toFixed(2)}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11.5, color: WF.inkSoft, fontWeight: 600 }}>
            {bundleTotalOverride == null ? 'Total Bundle' : `Total · ${totalGuests} guest${totalGuests === 1 ? '' : 's'}`}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
            +${bundleTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>);

}

function UpgradePackagesSection({ selectedPackages, onToggle, previewPkgId, onPkgPreview, guests, nights }) {
  const totalGuests = guests.adults + (guests.youngAdults || 0) + guests.children + guests.infants;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {S2_PKG.map((pkg) =>
        <PackageCard
          key={pkg.id} pkg={pkg} totalGuests={totalGuests} nights={nights}
          selected={(selectedPackages || []).includes(pkg.id)}
          previewing={previewPkgId === pkg.id}
          onClick={() => {
            // Toggle: if already selected, deselect; otherwise preview it
            if ((selectedPackages || []).includes(pkg.id)) {
              onToggle(pkg.id); // deselect
            } else {
              if (onPkgPreview) onPkgPreview(pkg.id); // preview
            }
          }} />

        )}
      </div>
    </div>);

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
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                transition: 'border-color 0.12s, box-shadow 0.12s',
                border: `1.5px solid ${on ? S2_TEAL : WF.line}`,
                background: WF.panel,
                boxShadow: on ? `0 0 0 3px ${S2_TEAL_TINT}` : 'none'
              }}
              onMouseEnter={(e) => {if (!on) e.currentTarget.style.borderColor = '#9CA3AF';}}
              onMouseLeave={(e) => {if (!on) e.currentTarget.style.borderColor = WF.line;}}>
              
              {/* Radio indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{c.name}</div>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${on ? S2_TEAL : '#CBD5E1'}`,
                  background: on ? WF.accentOn : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.12s', marginLeft: 6, marginTop: 1
                }}>
                  {on && <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <polyline points="1.5,4 3,5.5 6.5,2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.3, marginBottom: 6 }}>{c.blurb}</div>
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
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 6 }}>Deck</div>
      <div style={{ display: 'flex', gap: 6 }}>
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
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 6 }}>Assignment</div>
      <div style={{ display: 'flex', gap: 6 }}>
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
                <span style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
                  {f.code}
                </span>
                {/* refundability badge segment */}
                <span style={{
                  padding: '6px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  background: on ?
                  'rgba(255,255,255,0.10)' :
                  f.refundable ? S2_TEAL_TINT : '#F3F4F6',
                  color: on ?
                  f.refundable ? '#7DD3D3' : '#94A3B8' :
                  f.refundable ? S2_TEAL : '#6B7280'
                }}>
                  {f.refundable ? 'REFUNDABLE' : 'NON-REFUND'}
                </span>
                {/* price */}
                <span style={{ padding: '8px 13px', fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                  ${f.pricePP.toFixed(2)}
                </span>
              </button>);

          })}
        </div>
        {active &&
        <div style={{ fontSize: 12, color: '#9CA3AF', paddingTop: 8, borderTop: `1px solid ${WF.lineSoft}` }}>
            <span style={{ color: WF.inkSoft, fontWeight: 500 }}>Selected Rate Plan</span>
            {' · '}{active.note}
          </div>
        }
      </div>
    </div>);

}

// ── Guest roster helper — flattens party guests into an assignable list ──
// Age is no longer captured per-guest; each of the 4 guest-count categories
// already implies an age band, so eligibility is derived from `minAge` here.
const SUPP_GUEST_CATS = [
  { key: 'adults', heading: 'ADULTS', prefix: 'Guest', minAge: 21, ageLabel: '21+' },
  { key: 'youngAdults', heading: 'YOUNG ADULTS', prefix: 'Guest', minAge: 13, ageLabel: '13-21' },
  { key: 'children', heading: 'CHILDREN', prefix: 'Child', minAge: 3, ageLabel: '3-12' },
  { key: 'infants', heading: 'INFANTS', prefix: 'Infant', minAge: 0, ageLabel: '0-3' }
];

function buildGuestRoster(guests) {
  const g = guests || {};
  return SUPP_GUEST_CATS.map(({ key, heading, prefix, minAge, ageLabel }) => {
    const count = g[key] || 0;
    const list = Array.from({ length: count }, (_, i) => (
      { guestKey: `${key}-${i}`, label: `${prefix} ${i + 1}`, minAge, ageLabel }
    ));
    return { key, heading, count, list };
  }).filter((cat) => cat.count > 0);
}

// ── Compact per-guest quantity stepper (flat, screenshot style) ──
function GuestSupplyStepper({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.4 : 1 }}>
      <button
        onClick={() => !disabled && value > 0 && onChange(value - 1)}
        disabled={disabled || value === 0}
        style={{
          width: 24, height: 24, borderRadius: '50%', border: `1px solid ${WF.line}`,
          background: '#fff', color: value === 0 || disabled ? WF.inkFaint : WF.ink,
          cursor: disabled || value === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>−</button>
      <div style={{ width: 16, textAlign: 'center', fontSize: 13, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>{value}</div>
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

// ── Human-readable occupancy for a cabin, e.g. "2 Adults · 1 Child" ──
const CABIN_OCC_LABELS = [
  { key: 'adults', one: 'Adult', many: 'Adults' },
  { key: 'youngAdults', one: 'Young Adult', many: 'Young Adults' },
  { key: 'children', one: 'Child', many: 'Children' },
  { key: 'infants', one: 'Infant', many: 'Infants' }
];

function cabinOccupancyText(guests) {
  const g = guests || {};
  const parts = CABIN_OCC_LABELS.
    filter(({ key }) => (g[key] || 0) > 0).
    map(({ key, one, many }) => `${g[key]} ${g[key] === 1 ? one : many}`);
  return parts.length > 0 ? parts.join(' · ') : 'No guests assigned';
}

// ── Assignment mode pills — "per guest" vs "per cabin", shown only inside
// the expanded supplement panel ──
function AssignModePills({ mode, onMode }) {
  const opts = [{ id: 'guest', label: 'Assign per guest' }, { id: 'cabin', label: 'Assign per cabin' }];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 7 }}>
        Assignment
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {opts.map((o) => {
          const on = mode === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onMode(o.id)}
              style={{
                padding: '5px 11px', borderRadius: 20, fontSize: 11.5, fontWeight: on ? 700 : 500,
                border: `1.5px solid ${on ? '#1B2434' : WF.line}`,
                background: on ? '#1B2434' : WF.panel,
                color: on ? '#fff' : WF.ink,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s'
              }}>
              {o.label}
            </button>);
        })}
      </div>
    </div>
  );
}

// ── Per-cabin assignment list — one row per confirmed cabin, charged flat
// once per cabin. Age restrictions do not apply to cabin-level items. ──
function AssignCabinsList({ sup, cabins, assignment, onGuestQty, onGoToCabins, locked }) {
  if (!cabins || cabins.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
        fontSize: 12, color: '#92400E', fontWeight: 500
      }}>
        <span>⚠</span>
        <span>
          No cabins confirmed yet — assign staterooms on the Stateroom Assignment tab to charge this supplement per cabin.
          {onGoToCabins && (
            <button
              onClick={onGoToCabins}
              style={{
                marginLeft: 8, padding: 0, border: 'none', background: 'none',
                color: '#92400E', fontWeight: 700, fontSize: 12, textDecoration: 'underline',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
              Go to Stateroom Assignment
            </button>
          )}
        </span>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden' }}>
      {cabins.map((cab, i) => {
        const added = (assignment[cabinSuppKey(cab.id)] || 0) > 0;
        return (
          <div key={cab.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '10px 14px', background: added ? S2_TEAL_TINT : '#fff',
            borderBottom: i < cabins.length - 1 ? `1px solid ${WF.lineSoft}` : 'none'
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: WF.ink }}>Cabin {i + 1}</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, color: WF.inkSoft, background: '#F1F5F9',
                  borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap'
                }}>{cab.label} · Room {cab.num}</span>
              </div>
              <div style={{ fontSize: 11, color: WF.inkSoft }}>{cabinOccupancyText(cab.guests)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: locked ? WF.inkFaint : (added ? S2_TEAL : WF.inkSoft),
                fontFamily: 'ui-monospace, monospace', textDecoration: locked ? 'line-through' : 'none'
              }}>
                +${sup.pricePP.toFixed(2)}
              </span>
              <button
                onClick={() => !locked && onGuestQty(cabinSuppKey(cab.id), added ? 0 : 1)}
                disabled={locked}
                title={locked ? 'Included in your package' : undefined}
                style={{
                  padding: '6px 14px', fontSize: 11.5, fontWeight: 700, borderRadius: 6,
                  border: `1.5px solid ${added ? S2_TEAL : WF.line}`,
                  background: added ? S2_TEAL : '#fff',
                  color: added ? '#fff' : WF.ink,
                  cursor: locked ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap',
                  opacity: locked ? 0.85 : 1
                }}>
                {added ? '✓ Added' : 'Add to cabin'}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{ padding: '8px 14px', background: '#F8FAFC', borderTop: `1px solid ${WF.lineSoft}`, fontSize: 11, color: WF.inkSoft }}>
        {locked
          ? 'Included in your package — assigned to every cabin at no extra charge.'
          : 'Charged once per cabin, regardless of how many guests are in the room.'}
      </div>
    </div>
  );
}

// ── Per-guest assignment panel — appears under a supplement once "Assign supplements" is clicked ──
function AssignGuestsPanel({ sup, roster, assignment, onGuestQty, onDone }) {
  return (
    <div style={{ padding: '4px 16px 16px', background: '#fff' }}>
      <div style={{ border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden' }}>
        {roster.map((cat, ci) => (
          <div key={cat.key}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', background: '#F8FAFC',
              borderTop: ci > 0 ? `1px solid ${WF.lineSoft}` : 'none',
              borderBottom: `1px solid ${WF.lineSoft}`
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase' }}>{cat.heading}</span>
              <span style={{ fontSize: 11, color: WF.inkSoft }}>{cat.count} guest{cat.count === 1 ? '' : 's'}</span>
            </div>
            {cat.list.map((guest, gi) => {
              const restricted = sup.minAge != null && guest.minAge < sup.minAge;
              const qty = (assignment[guest.guestKey]) || 0;
              return (
                <div key={guest.guestKey} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '10px 14px', borderBottom: gi < cat.list.length - 1 ? `1px solid ${WF.lineSoft}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: WF.ink }}>{guest.label}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, color: WF.inkSoft, background: '#F1F5F9',
                      borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap'
                    }}>Age {guest.ageLabel}</span>
                    {restricted && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B45309', whiteSpace: 'nowrap' }}>
                        {sup.minAge}+ only
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
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
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
// 4. Supplements cards (multi-select grid)
// ───────────────────────────────────────────────────────────────────────────
function SupplementsSection({ selectedSupps, guests, suppAssignments, onToggle }) {
  const suppQtys = selectedSupps || {}; // { suppId: totalQty, ... }
  const assignments = suppAssignments || {}; // { suppId: { guestKey → qty } }
  const [catFilter, setCatFilter] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedSuppId, setExpandedSuppId] = React.useState(null);

  const roster = buildGuestRoster(guests);
  const hasGuests = roster.length > 0;

  // Filter the individual supplement catalog by category and search.
  const filteredSupps = S2_SUPP.filter((s) => {
    if (catFilter && s.category !== catFilter) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique categories from supplements
  const categories = ['All', ...new Set(S2_SUPP.map((s) => s.category))];

  const setGuestQty = (suppId, guestKey, qty) => {
    const suppAssign = { ...(assignments[suppId] || {}) };
    if (qty <= 0) delete suppAssign[guestKey]; else suppAssign[guestKey] = qty;
    const nextAssignments = { ...assignments };
    if (Object.keys(suppAssign).length === 0) delete nextAssignments[suppId]; else nextAssignments[suppId] = suppAssign;
    const totalQty = Object.values(suppAssign).reduce((a, b) => a + b, 0);
    const nextQtys = { ...suppQtys };
    if (totalQty <= 0) delete nextQtys[suppId]; else nextQtys[suppId] = totalQty;
    onToggle(nextQtys, nextAssignments);
  };

  return (
    <div>
      {!hasGuests && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 14,
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
          fontSize: 12, color: '#92400E', fontWeight: 500
        }}>
          ⚠ Add guest count &amp; ages in Step 1 or Step 3 to assign supplements per guest.
        </div>
      )}

      {/* Available to add section — search + category pills above the list */}
      <div>
        {/* Search bar */}
        <div style={{ marginBottom: 12, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
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
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: `1.5px solid ${WF.line}`, background: WF.panel, color: WF.ink,
              fontSize: 13, fontFamily: 'inherit', transition: 'border-color 0.12s'
            }}
            onFocus={(e) => e.target.style.borderColor = S2_TEAL}
            onBlur={(e) => e.target.style.borderColor = WF.line} />
          
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const on = cat === 'All' && catFilter === null || catFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat === 'All' ? null : cat)}
                style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: on ? 700 : 500,
                  border: `1.5px solid ${on ? '#1B2434' : WF.line}`,
                  background: on ? '#1B2434' : WF.panel,
                  color: on ? '#fff' : WF.ink,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s'
                }}>
                {cat}
              </button>);

          })}
        </div>
      </div>

      {/* Supplements list with assign-guests controls */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden' }}>
          {filteredSupps.length > 0 ? filteredSupps.map((sup, idx) => {
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
                  // Hairline dividers carry the row separation on their own —
                  // zebra fills on top of them added a second, competing rhythm
                  // and made disabled/expanded states harder to distinguish.
                  borderBottom: idx < filteredSupps.length - 1 ? `1px solid ${WF.lineSoft}` : 'none',
                  background: expanded ? '#fff' : WF.panel
                }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px'
                }}>
                  {/* Supplement info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{sup.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: WF.ink }}>{sup.name}</div>
                        {sup.minAge != null && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: 4, padding: '1px 6px' }}>
                            {sup.minAge}+
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: WF.inkSoft }}>
                        ${sup.pricePP.toFixed(2)} pp
                      </div>
                    </div>
                  </div>

                  {/* Right side: price + assign button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    {qty > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>+${lineTotal.toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: S2_TEAL, fontWeight: 600 }}>{assignedCaption}</div>
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedSuppId(expanded ? null : sup.id)}
                      disabled={!hasGuests}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 34, height: 34, borderRadius: '50%',
                        border: `1px solid ${!hasGuests ? '#E2E8F0' : (expanded ? S2_TEAL : WF.line)}`,
                        background: !hasGuests ? '#F8FAFC' : (expanded ? S2_TEAL : '#fff'),
                        color: !hasGuests ? '#B0B8C4' : (expanded ? '#fff' : WF.inkSoft),
                        cursor: hasGuests ? 'pointer' : 'not-allowed',
                        boxShadow: expanded ? `0 0 0 3px ${S2_TEAL_TINT}` : '0 1px 2px rgba(15,23,42,0.05)',
                        transition: 'all 0.15s', flexShrink: 0
                      }}
                      onMouseEnter={(e) => { if (hasGuests && !expanded) { e.currentTarget.style.borderColor = S2_TEAL; e.currentTarget.style.color = S2_TEAL; } }}
                      onMouseLeave={(e) => { if (hasGuests && !expanded) { e.currentTarget.style.borderColor = WF.line; e.currentTarget.style.color = WF.inkSoft; } }}
                      title={hasGuests ? 'Assign to guests' : 'Add guests first'}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M19 8v6M22 11h-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expanded && hasGuests && (
                    <AssignGuestsPanel
                      sup={sup}
                      roster={roster}
                      assignment={suppAssign}
                      onGuestQty={(guestKey, v) => setGuestQty(sup.id, guestKey, v)}
                      onDone={() => setExpandedSuppId(null)} />
                )}
              </div>);

          }) :
          <div style={{
            fontSize: 11.5, color: WF.inkFaint, textAlign: 'center',
            padding: '16px 0'
          }}>
              No supplements match your filters.
            </div>
          }
        </div>
      </div>
      
      {Object.keys(suppQtys).length === 0 &&
      <div style={{
        fontSize: 11.5, color: WF.inkFaint, textAlign: 'center',
        padding: '10px 0', borderTop: `1px solid ${WF.lineSoft}`
      }}>
          No supplements added — base fare only.
        </div>
      }
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// Progressive disclosure wrapper
// ───────────────────────────────────────────────────────────────────────────
function DisclosureSection({ label, badge, badgeColor, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', background: 'none', border: 'none',
          padding: '0 0 12px 0', cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left'
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ flexShrink: 0, color: WF.inkSoft, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }}>
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: WF.inkLabel }}>
          {label}
        </span>
        {badge &&
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
          background: badgeColor ? `${badgeColor}20` : WF.fill,
          color: badgeColor || WF.inkSoft,
          border: `1px solid ${badgeColor ? `${badgeColor}40` : WF.line}`
        }}>{badge}</span>
        }
      </button>
      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>);

}

// ───────────────────────────────────────────────────────────────────────────
// Sailing card — collapsed header + expandable body
// ───────────────────────────────────────────────────────────────────────────
function SailingCard({ s, update, sailing, expanded, onToggle, previewPkgId, onPkgPreview }) {
  const g = s.guests;
  const DeckMap = window.CabinDeckMapSection;
  const avail = availabilityOf(sailing);
  const selectedHere = s.selectedSailingCode === sailing.code;
  const nights = sailing.nights;
  const guestCount = g.adults + (g.youngAdults || 0) + g.children + g.infants;

  // Collapsed "from" price — cheapest farecode, IS cabin, via priceQuote.
  // Falls back to double occupancy before the party is entered, so the lead-in
  // rate reads as a real "from" price rather than $0.
  const fromPP = (() => {
    const quoteGuests = payCount(g) > 0 ? g : { adults: 2, children: 0, infants: 0 };
    const p = priceQuote({
      sailing, cabinId: 'IS', farecodeId: null,
      guests: quoteGuests, bundleLines: [], gratuityRemoved: true, intentId: null
    });
    return perPerson(p.baseFareTotal, quoteGuests);
  })();

  // Expanded header price — selected farecode scaled to this sailing's fareIndex
  const expandedPP = (() => {
    if (!s.farecodeId) return null;
    const fc = S2_FC.find((f) => f.id === s.farecodeId);
    return fc ? Math.round(fc.pricePP * sailing.fareIndex / BASE_FARE_IDX) : null;
  })();

  const handleToggle = () => {
    // Only clear the downstream selections when the sailing actually changes.
    // Re-opening the sailing you already picked used to wipe cabin, farecode,
    // packages and supplements — and left suppAssignments/cabins pointing at
    // rooms that no longer had a cabinId.
    if (sailing.code !== s.selectedSailingCode) {
      update({
        selectedSailingCode: sailing.code,
        cabinId: null,
        farecodeId: null,
        selectedPackages: [],
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

  const togglePkg = (id) => {
    const curr = s.selectedPackages || [];
    update({ selectedPackages: curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id] });
  };

  const toggleSupp = (qtyObj, assignments) => {
    update({ selectedSupps: qtyObj, suppAssignments: assignments !== undefined ? assignments : s.suppAssignments });
  };

  // Get availability badge color
  const availBgColor = avail.kind === 'active' ? '#D1FAE5' : avail.kind === 'draft' ? '#FEF3C7' : '#FEE2E2';
  const availTextColor = avail.kind === 'active' ? '#065F46' : avail.kind === 'draft' ? '#92400E' : '#DC2626';

  return (
    <div style={{
      borderLeft: selectedHere ? `3px solid ${S2_TEAL}` : '3px solid transparent',
      background: selectedHere ? 'rgba(13,148,136,0.04)' : WF.panel,
      transition: 'background 0.15s, border-color 0.15s',
      overflow: 'hidden'
    }}>
      {/* ── Collapsed header (always visible) — Row layout ── */}
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          textAlign: 'left',
          padding: '9px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }} data-comment-anchor="f0c77595d9-button-605-7">

        {/* Col 1: Nights pill */}
        <div style={{
          flexShrink: 0,
          background: WF.accent,
          color: '#fff',
          borderRadius: 5,
          padding: '4px 8px',
          fontSize: 10.5,
          fontWeight: 700,
          textAlign: 'center',
          minWidth: 44,
          lineHeight: 1.2
        }}>
          {nights}N
        </div>

        {/* Col 2: Route + ship info — route always gets its own full-width
              line (ellipsized rather than squeezed to nothing by the ship/
              date info sharing a line at narrower widths). */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {routeOf(sailing)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ fontSize: 11, color: WF.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {sailing.ship} <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span> {sailing.code}
            </div>
            {(() => {
              const win = getWindowForSailing(sailing.code);
              return win ?
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  {win.discount && <span style={{ fontSize: 9, fontWeight: 700, background: '#FF6B35', color: '#fff', padding: '1px 5px', borderRadius: 3, letterSpacing: 0.3 }}>50% OFF</span>}
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: WF.inkLabel, background: WF.fill, border: `1px solid ${WF.line}`, borderRadius: 4, padding: '1px 6px', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
                    {win.display}
                  </span>
                </div> :
              null;
            })()}
          </div>
        </div>

        {/* Col 3: Price (right) */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: WF.ink, letterSpacing: -0.3 }}>
            ${fromPP.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 600 }}>/pp</span>
          </div>
          <div style={{ fontSize: 10.5, color: WF.inkFaint }}>avg</div>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded &&
      <div style={{ padding: '16px 20px 20px', borderTop: `1px solid ${WF.lineSoft}` }}>
          {/* 1. Farecodes */}
          <FarecodesSection2
          farecodeId={s.farecodeId}
          onSelect={(id) => update({ farecodeId: id })} />
        

          <div style={{ height: 1, background: WF.lineSoft, margin: '14px 0' }} />

          {/* 2. Cabin category */}
          <CabinSection2
          cabinId={s.cabinId}
          onSelect={(id) => update({ cabinId: id })} />

          {/* 2b. Selected room summary — shown after picking a room */}
          {s.cabinId && s.selectedCabinNum &&
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', marginTop: 10,
          background: '#F0F9FF', border: '1.5px solid #3B82F6',
          borderRadius: 8
        }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#3B82F6', flexShrink: 0 }}>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: WF.accentInk }}>Room {s.selectedCabinNum}</span>
                {s.selectedCabinDeck &&
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', padding: '2px 7px', borderRadius: 4, background: '#DBEAFE' }}>
                    Deck {s.selectedCabinDeck}
                  </span>
            }
                {s.selectedCabinStratum &&
            <span style={{ fontSize: 11, color: '#3B82F6' }}>{s.selectedCabinStratum}</span>
            }
              </div>
              <button
            onClick={() => update({ selectedCabinNum: null, selectedCabinDeck: null, selectedCabinStratum: null })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
              color: WF.accentOn, fontFamily: 'inherit', fontWeight: 700, padding: '3px 8px',
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

          <div style={{ height: 1, background: WF.lineSoft, margin: '14px 0' }} />

          {/* 3. Upgrade packages — progressive disclosure */}
          <DisclosureSection
          label="Upgrade Packages"
          badge={s.selectedPackages?.length > 0 ? `${s.selectedPackages.length} selected` : 'Optional'}
          badgeColor={s.selectedPackages?.length > 0 ? S2_TEAL : null}>
            <UpgradePackagesSection
            selectedPackages={s.selectedPackages}
            onToggle={togglePkg}
            previewPkgId={previewPkgId}
            onPkgPreview={onPkgPreview}
            guests={g}
            nights={nights} />
          </DisclosureSection>

          <div style={{ height: 1, background: WF.lineSoft, margin: '14px 0' }} />

          {/* 4. Supplements — progressive disclosure */}
          <DisclosureSection
          label="Supplements"
          badge={Object.keys(s.selectedSupps || {}).length > 0 ? `${Object.keys(s.selectedSupps || {}).length} added` : 'Optional'}
          badgeColor={Object.keys(s.selectedSupps || {}).length > 0 ? S2_TEAL : null}>
            <SupplementsSection
            selectedSupps={s.selectedSupps}
            selectedPackages={s.selectedPackages}
            guests={s.guests}
            cabins={s.cabins}
            suppAssignments={s.suppAssignments}
            onToggle={toggleSupp} />
          </DisclosureSection>
        
        </div>
      }
    </div>);

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
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 10 }}>
        Select booking window block
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {BOOKING_WINDOWS.map((window) => {
          const isSelected = selectedWindow === window.id;
          return (
            <button
              key={window.id}
              onClick={() => setSelectedWindow(window.id)}
              style={{
                position: 'relative',
                padding: '12px 11px',
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
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4
              }}>
                50% OFF
              </div>
              }
              
              <div style={{ fontSize: 9.5, fontWeight: 600, color: WF.inkLabel, textTransform: 'uppercase', letterSpacing: 0.2 }}>
                {window.dayRange}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, lineHeight: 1.2 }}>
                {window.display}
              </div>
            </button>);

        })}
      </div>
    </div>);

}

function Step2App({ booking, update, navigate }) {
  const SFPanel = window.SearchFilterPanel;

  // Bound to the router's booking. Previously this step rebuilt itself from two
  // localStorage keys and then overwrote sessionStorage['bookingState'] on every
  // change — which is what wiped guest names, coupons and payment terms whenever
  // the agent stepped backwards into Step 2.
  const state = booking;
  const handleUpdate = update;


  // Resume straight into the sailing-detail view (farecode/stateroom/supplements
  // tabs) whenever a sailing was already locked in — otherwise every remount of
  // Step2App (e.g. bouncing back from Step 4) drops the user back on the coarse
  // sailing list, making a fully-configured booking look like it needs redoing.
  const [expandedCard, setExpandedCard] = React.useState(() => state.selectedSailingCode || null);
  const [previewPkgId, setPreviewPkgId] = React.useState(null);
  const [selectedBookingWindow] = React.useState(null);
  const [showItinerary, setShowItinerary] = React.useState(false);

  const sailing = getSailing(state.selectedSailingCode);
  const guestCount = state.guests.adults + (state.guests.youngAdults || 0) + state.guests.children + state.guests.infants;

  // Get sailings for the selected booking window
  const selectedWindow = BOOKING_WINDOWS.find((w) => w.id === selectedBookingWindow);
  const sailingCodesForWindow = selectedWindow?.sailingCodes || [];

  // Filter sailings based on filter panel selections. Lives in intent-data.jsx
  // beside SAILINGS so the predicate stays with the data it filters.
  const filteredSailings = filterSailings(state);

  const handleContinue = () => navigate(2);

  // Blocked continues used to only console.log, so the disabled CTA gave the
  // agent no idea what was still missing. Name the first unmet requirement.
  const [blockedMsg, setBlockedMsg] = React.useState(null);
  const handleBlocked = () => {
    setBlockedMsg(
      !state.selectedSailingCode ? 'Select a sailing to continue.' :
      !state.cabinId ? 'Choose a cabin category to continue.' :
      'Choose a farecode to continue.'
    );
  };

  const handleConfirmPkg = (pkgId) => {
    // Route through handleUpdate (not a raw setState) so the selection is
    // persisted immediately — otherwise it only survives until the user
    // clicks "Continue to guests" and any earlier navigation loses it.
    handleUpdate({ selectedPackages: [pkgId] });
    setPreviewPkgId(null);
  };

  const handleClearPkg = () => {
    setPreviewPkgId(null);
  };

  // Continue only enabled once sailing, cabin and farecode are all chosen.
  const continueEnabled = !!(state.selectedSailingCode && state.cabinId && state.farecodeId);

  React.useEffect(() => { if (continueEnabled) setBlockedMsg(null); }, [continueEnabled]);

  return (
    <>
      <WFAppShell
        activeGroup="bookings"
        active="create-booking"
        breadcrumb={['CRM', 'Bookings', 'Create', 'Sailing, fare & cabin']}
        rightRail={
        <BookingSummaryPanel
          booking={state}
          update={handleUpdate}
          step={1}
          continueEnabled={continueEnabled}
          ctaLabel="Continue to guests →"
          onContinue={handleContinue}
          onBlocked={handleBlocked}
          pkgPreviewId={previewPkgId}
          onConfirmPkg={handleConfirmPkg}
          onClearPkg={handleClearPkg} />
        }
        progressBar={<StepProgress2 current={1} />}>

        <div data-screen-label="Step 1 · Sailing, fare & cabin">
          {!expandedCard &&
          <div>
              <div style={{ fontWeight: 700, color: WF.ink, letterSpacing: -0.3, marginBottom: 6, fontSize: "20px" }}>
                Select a sailing
              </div>

              <div style={{ fontSize: 13, color: WF.inkSoft, marginBottom: 16 }}>
                Pick a departure, duration, and ship that match your client's travel dates.
              </div>

              {/* ── SEARCH FILTER PANEL ── */}
              {SFPanel && <SFPanel state={state} onUpdate={handleUpdate} />}
            </div>
          }

          {/* ── SAILING RESULTS — always live; they update as filters change
                rather than hiding behind a "Confirm & view dates" click. ── */}
          {(
          expandedCard ? (
          /* ── DETAIL VIEW: toolbar band + single expanded card. The toolbar is
                part of the container's chrome — a filled band with its own
                hairline — rather than two buttons floating in a padding zone
                that didn't line up with the content gutter below them. ── */
          <div style={{
            border: `1px solid ${WF.line}`, borderRadius: 10, background: WF.panel, padding: 0, marginBottom: 0, marginTop: 16
          }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: WF.fill,
                  borderBottom: `1px solid ${WF.line}`, borderRadius: '10px 10px 0 0'
                }}>
                  <button
                onClick={() => setExpandedCard(null)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#fff', border: `1px solid ${WF.line}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  padding: '6px 12px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, color: WF.inkSoft
                }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to all sailings
                  </button>

                  {window.CruiseItineraryButton &&
                  <window.CruiseItineraryButton
                    sailingCode={expandedCard}
                    open={showItinerary}
                    onToggle={() => setShowItinerary((v) => !v)}
                    onClose={() => setShowItinerary(false)} />
                  }
                </div>
                <div style={{ borderRadius: 10, overflow: 'hidden', background: WF.panel }}>
                  {filteredSailings.filter((sail) => sail.code === expandedCard).map((sail) => {
                const DetailView = window.SailingDetailView;
                return DetailView ?
                <DetailView
                  key={sail.code}
                  sailing={sail}
                  s={state}
                  update={handleUpdate}
                  previewPkgId={previewPkgId}
                  onPkgPreview={setPreviewPkgId}
                  onContinue={handleContinue} /> :

                <SailingCard
                  key={sail.code}
                  s={state}
                  update={handleUpdate}
                  sailing={sail}
                  expanded={true}
                  onToggle={() => {}}
                  previewPkgId={previewPkgId}
                  onPkgPreview={setPreviewPkgId} />;

              })}
                </div>
              </div>) : (

          /* ── LIST VIEW: match count + collapsed rows, both growing with the page ── */
          <div style={{
            border: `1px solid ${WF.line}`, borderRadius: 10, background: WF.panel, padding: 14, marginBottom: 0, marginTop: 16
          }}>
                <div style={{ fontSize: 12.5, color: WF.inkSoft, marginBottom: 14 }}>
                  <strong style={{ color: WF.ink, fontWeight: 700 }}>{filteredSailings.length} sailings</strong> match · all fit your party
                </div>
                {filteredSailings.length > 0 ? (
                <div style={{ borderRadius: 10, overflow: 'hidden', background: WF.panel }}>
                  {filteredSailings.filter((sail) => sail.code !== expandedCard).map((sail, idx, arr) =>
              <React.Fragment key={sail.code}>
                      {idx > 0 && <div style={{ height: 1, background: WF.line, margin: '0 16px' }} />}
                      <SailingCard
                  s={state}
                  update={(changes) => {
                    handleUpdate(changes);
                    setExpandedCard(sail.code);
                  }}
                  sailing={sail}
                  expanded={false}
                  onToggle={() => setExpandedCard(sail.code)}
                  previewPkgId={previewPkgId}
                  onPkgPreview={setPreviewPkgId} />
                    </React.Fragment>
              )}
                </div>
                ) : (
                <div style={{ fontSize: 11.5, color: WF.inkFaint, textAlign: 'center', padding: '16px 0' }}>
                  No sailings match your filters.
                </div>
                )}
              </div>))

          }

          {blockedMsg &&
          <div style={{ marginTop: 10, fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>
              {blockedMsg}
            </div>
          }
        </div>
      </WFAppShell>


    </>);

}

window.Step2App = Step2App;
