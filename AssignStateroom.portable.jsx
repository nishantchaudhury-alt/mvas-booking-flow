import React from 'react';

/**
 * Portable MVAS stateroom assignment experience.
 *
 * External dependency: React 18+
 * Styling dependency: none
 *
 * Props:
 * - s: booking state (see DEMO_BOOKING_STATE at the end of this file)
 * - update: receives a shallow booking-state patch
 * - onConfirmRooms: optional callback after rooms are confirmed
 *
 * This is the same category matrix and Assign Stateroom modal used by the
 * booking-flow prototype, with its shared tokens and cleanup helper embedded.
 */

const WF = Object.freeze({
  ink: '#0F172A',
  inkSoft: '#475569',
  inkLabel: '#64748B',
  inkFaint: '#94A3B8',
  panel: '#FFFFFF',
  fill: '#F8FAFC',
  fillStrong: '#E2E8F0',
  line: '#E2E8F0',
  lineSoft: '#EEF2F6',
  controlLine: '#7C8B9F',
  accent: '#1B2434',
  accentInk: '#1B2434',
  accentTint: '#EFF6FF',
  accentLine: '#DBEAFE',
});

function PortableSelect({
  value,
  options = [],
  onValueChange,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  width = '100%',
  menuMinWidth = 200,
  height = 32,
  fontSize = 12,
  fontWeight = 600,
  showSelectedMeta = true,
  menuZIndex = 'var(--ds-layer-popover, 40)',
}) {
  const normalizedValue = value == null ? '' : String(value);
  const selectedIndex = options.findIndex((option) => String(option.value) === normalizedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const enabledIndices = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(selectedIndex);
  const [triggerHovered, setTriggerHovered] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState(null);
  const triggerRef = React.useRef(null);
  const rootRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const reactId = React.useId();
  const menuId = `portable-select-${reactId.replace(/:/g, '')}`;

  const moveActive = (direction) => {
    if (!enabledIndices.length) return;
    const currentPosition = enabledIndices.indexOf(activeIndex);
    const nextPosition = currentPosition < 0
      ? (direction > 0 ? 0 : enabledIndices.length - 1)
      : (currentPosition + direction + enabledIndices.length) % enabledIndices.length;
    setActiveIndex(enabledIndices[nextPosition]);
  };

  const openMenu = (direction = 0) => {
    if (disabled || !enabledIndices.length) return;
    const fallback = direction < 0 ? enabledIndices[enabledIndices.length - 1] : enabledIndices[0];
    setActiveIndex(selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : fallback);
    setOpen(true);
  };

  const chooseOption = (index) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onValueChange && onValueChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current && triggerRef.current.focus());
  };

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;
    const placeMenu = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = Math.min(Math.max(rect.width, menuMinWidth), window.innerWidth - 16);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < 200 && rect.top > spaceBelow;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
      setMenuPosition(openAbove
        ? { left, bottom: window.innerHeight - rect.top + 4, width: menuWidth }
        : { left, top: rect.bottom + 4, width: menuWidth });
    };
    placeMenu();
    window.addEventListener('resize', placeMenu);
    window.addEventListener('scroll', placeMenu, true);
    return () => {
      window.removeEventListener('resize', placeMenu);
      window.removeEventListener('scroll', placeMenu, true);
    };
  }, [open, width, menuMinWidth]);

  React.useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && rootRef.current.contains(event.target)) return;
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    const activeOption = document.getElementById(`${menuId}-option-${activeIndex}`);
    if (activeOption) activeOption.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, menuId]);

  const onTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu(event.key === 'ArrowUp' ? -1 : 1);
      else moveActive(event.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      if (!open) openMenu();
      else if (activeIndex >= 0) chooseOption(activeIndex);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      if (!open) return;
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1]);
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'Tab') setOpen(false);
  };

  const menu = open && menuPosition && (
    <div
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-label={ariaLabel}
      style={{
        position: 'fixed', ...menuPosition, zIndex: menuZIndex,
        maxHeight: 240, overflowY: 'auto', padding: 4,
        border: `1px solid ${WF.line}`, borderRadius: 8,
        background: WF.panel, boxShadow: '0 8px 24px rgba(15,23,42,.14)',
        fontFamily: 'inherit',
      }}>
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        const active = index === activeIndex;
        return (
          <button
            key={`${option.value}-${index}`}
            id={`${menuId}-option-${index}`}
            type="button"
            role="option"
            aria-selected={selected}
            aria-disabled={option.disabled || undefined}
            disabled={option.disabled}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
            onClick={() => chooseOption(index)}
            style={{
              width: '100%', minHeight: 36, display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', border: 0, borderRadius: 6, textAlign: 'left',
              background: active || selected ? WF.accentTint : 'transparent',
              color: option.disabled ? WF.inkFaint : WF.ink,
              fontFamily: 'inherit', fontSize, fontWeight: selected ? 700 : 500,
              cursor: option.disabled ? 'not-allowed' : 'pointer', opacity: option.disabled ? 0.56 : 1,
            }}>
            <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
            {option.meta != null && (
              <span style={{ padding: '4px 8px', borderRadius: 999, background: WF.fill, color: WF.inkSoft, fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>
                {option.meta}
              </span>
            )}
            {selected && (
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: WF.accent }}>
                <path d="M2.5 7.2 5.4 10 11.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} style={{ position: 'relative', width, minWidth: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-autocomplete="none"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open && activeIndex >= 0 ? `${menuId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={onTriggerKeyDown}
        onMouseEnter={() => setTriggerHovered(true)}
        onMouseLeave={() => setTriggerHovered(false)}
        style={{
          width: '100%', height, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          borderRadius: 6, border: `1px solid ${open ? WF.accent : WF.controlLine}`,
          background: disabled ? WF.fill : triggerHovered ? WF.fill : WF.panel,
          color: selectedOption && !selectedOption.placeholder ? WF.ink : WF.inkFaint,
          boxShadow: open ? `0 0 0 2px ${WF.accentLine}` : 'none',
          fontFamily: 'inherit', fontSize, fontWeight,
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.64 : 1,
          transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
        }}>
        <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          {selectedOption ? selectedOption.label : 'Select an option'}
        </span>
        {showSelectedMeta && selectedOption && selectedOption.meta != null && (
          <span style={{ padding: '4px 8px', borderRadius: 999, background: WF.fill, color: WF.inkSoft, fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>
            {selectedOption.meta}
          </span>
        )}
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: WF.inkSoft, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' }}>
          <path d="m3 5 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {menu && typeof ReactDOM !== 'undefined' ? ReactDOM.createPortal(menu, document.body) : menu}
    </div>
  );
}

const PORTABLE_CABIN_SUPP_PREFIX = 'cabin:';
const portableCabinSuppKey = (cabinId) => PORTABLE_CABIN_SUPP_PREFIX + cabinId;
const portableIsCabinSuppKey = (key) =>
  typeof key === 'string' && key.indexOf(PORTABLE_CABIN_SUPP_PREFIX) === 0;

// Removing a cabin must also remove any supplement quantity owned by it.
function pruneCabinSuppAssignments(suppAssignments, cabins) {
  const valid = new Set((cabins || []).map((cabin) => portableCabinSuppKey(cabin.id)));
  const nextAssignments = {};
  const nextQuantities = {};

  Object.entries(suppAssignments || {}).forEach(([supplementId, assignment]) => {
    const kept = {};
    Object.entries(assignment || {}).forEach(([key, value]) => {
      if (portableIsCabinSuppKey(key) && !valid.has(key)) return;
      kept[key] = value;
    });
    if (Object.keys(kept).length > 0) {
      nextAssignments[supplementId] = kept;
      nextQuantities[supplementId] = Object.values(kept).reduce((sum, value) => sum + value, 0);
    }
  });

  return { suppAssignments: nextAssignments, selectedSupps: nextQuantities };
}

// Stateroom Assignment Matrix — Live Global Category Availability
// Table + quantity controls + select room panel + accessibility filters

// ── Data ──────────────────────────────────────────────────────────
const STATEROOM_ROWS = [
  { id: 'I6',  cat: 'IS',  label: 'Interior Stateroom – I6',    color: '#F59E0B', price: 472,  total: 2,  single: 0, double: 2, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'mid' },
  { id: 'I7',  cat: 'IS',  label: 'Interior Stateroom – I7',    color: '#EAB308', price: 472,  total: 6,  single: 0, double: 5, dbinf: 0, triple: 1, trinf: 0, quad: 0, location: 'aft' },
  { id: 'I8',  cat: 'IS',  label: 'Interior Stateroom – I8',    color: '#84CC16', price: 472,  total: 1,  single: 0, double: 1, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'fwd' },
  { id: 'O4',  cat: 'OV',  label: 'Ocean View – O4',            color: '#A855F7', price: 512,  total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'mid' },
  { id: 'O5',  cat: 'OV',  label: 'Ocean View – O5',            color: '#EF4444', price: 512,  total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'fwd' },
  { id: 'I8G', cat: 'BAL', label: 'Category I8-G',              color: '#8B5CF6', price: 499,  total: 13, single: 0, double: 0, dbinf: 0, triple: 13, trinf: 0, quad: 0, location: 'mid' },
  { id: 'B2',  cat: 'BAL', label: 'Balcony Deluxe – B2',        color: '#6366F1', price: 549,  total: 8,  single: 0, double: 4, dbinf: 2, triple: 2, trinf: 0, quad: 0, location: 'fwd' },
  { id: 'B3',  cat: 'BAL', label: 'Balcony Premium – B3',       color: '#0EA5E9', price: 579,  total: 5,  single: 0, double: 3, dbinf: 0, triple: 2, trinf: 0, quad: 0, location: 'aft' },
  { id: 'S1',  cat: 'STE', label: 'Grand Terrace Suite – S1',   color: '#7C3AED', price: 1932, total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'fwd' },
  { id: 'S3',  cat: 'STE', label: 'Jr Suite – S3',              color: '#6D28D9', price: 1732, total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'mid' },
  { id: 'S5',  cat: 'STE', label: 'Owner Suite – S5',           color: '#5B21B6', price: 2250, total: 2,  single: 0, double: 2, dbinf: 0, triple: 0, trinf: 0, quad: 0, location: 'aft' },
];

// Rooms per category with accessibility flags
const STATEROOM_ROOMS = {
  IS:  [
    { num: '3104', deck: 3, a11y: [], infantFriendly: true },  { num: '3106', deck: 3, a11y: ['wheelchair'], infantFriendly: false },
    { num: '3108', deck: 3, a11y: [], infantFriendly: false }, { num: '3110', deck: 3, a11y: [], infantFriendly: true },
    { num: '4104', deck: 4, a11y: [], infantFriendly: true },  { num: '4106', deck: 4, a11y: ['wheelchair'], infantFriendly: false },
    { num: '4108', deck: 4, a11y: [], infantFriendly: true },  { num: '4110', deck: 4, a11y: [], infantFriendly: false },
    { num: '4112', deck: 4, a11y: ['hearing'], infantFriendly: true }, { num: '4114', deck: 4, a11y: [], infantFriendly: false },
    { num: '4116', deck: 4, a11y: [], infantFriendly: true },  { num: '4118', deck: 4, a11y: ['visual'], infantFriendly: false },
    { num: '4204', deck: 4, a11y: [], infantFriendly: false }, { num: '4206', deck: 4, a11y: [], infantFriendly: true },
    { num: '4208', deck: 4, a11y: ['wheelchair', 'hearing'], infantFriendly: true }, { num: '4210', deck: 4, a11y: [], infantFriendly: false },
    { num: '5304', deck: 5, a11y: [], infantFriendly: false }, { num: '5306', deck: 5, a11y: [], infantFriendly: true },
    { num: '5308', deck: 5, a11y: ['visual'], infantFriendly: false },
  ],
  OV:  [
    { num: '5110', deck: 5, a11y: [], infantFriendly: true },  { num: '5112', deck: 5, a11y: ['wheelchair'], infantFriendly: false },
    { num: '5114', deck: 5, a11y: [], infantFriendly: false }, { num: '5116', deck: 5, a11y: [], infantFriendly: true },
    { num: '5118', deck: 5, a11y: ['hearing'], infantFriendly: false }, { num: '5210', deck: 5, a11y: [], infantFriendly: true },
    { num: '5212', deck: 5, a11y: [], infantFriendly: false }, { num: '5214', deck: 5, a11y: ['visual'], infantFriendly: false },
  ],
  BAL: [
    { num: '6110', deck: 6, a11y: [], infantFriendly: true },  { num: '6112', deck: 6, a11y: [], infantFriendly: true },
    { num: '6114', deck: 6, a11y: ['wheelchair'], infantFriendly: false }, { num: '6116', deck: 6, a11y: [], infantFriendly: false },
    { num: '6118', deck: 6, a11y: [], infantFriendly: true },  { num: '6120', deck: 6, a11y: ['hearing'], infantFriendly: false },
    { num: '6122', deck: 6, a11y: [], infantFriendly: false }, { num: '6124', deck: 6, a11y: [], infantFriendly: true },
    { num: '6126', deck: 6, a11y: ['visual'], infantFriendly: false }, { num: '6128', deck: 6, a11y: [], infantFriendly: true },
    { num: '6130', deck: 6, a11y: [], infantFriendly: false }, { num: '6132', deck: 6, a11y: [], infantFriendly: false },
    { num: '6134', deck: 6, a11y: ['wheelchair', 'hearing'], infantFriendly: true }, { num: '6136', deck: 6, a11y: [], infantFriendly: false },
    { num: '6210', deck: 6, a11y: [], infantFriendly: true },  { num: '6212', deck: 6, a11y: [], infantFriendly: false },
    { num: '6214', deck: 6, a11y: [], infantFriendly: false }, { num: '6216', deck: 6, a11y: ['visual'], infantFriendly: true },
    { num: '6218', deck: 6, a11y: [], infantFriendly: false }, { num: '6220', deck: 6, a11y: [], infantFriendly: true },
    { num: '6222', deck: 6, a11y: ['wheelchair'], infantFriendly: false }, { num: '6224', deck: 6, a11y: [], infantFriendly: false },
    { num: '6226', deck: 6, a11y: [], infantFriendly: true },  { num: '6228', deck: 6, a11y: [], infantFriendly: false },
    { num: '6310', deck: 6, a11y: [], infantFriendly: false }, { num: '6312', deck: 6, a11y: [], infantFriendly: true },
    { num: '6314', deck: 6, a11y: ['hearing'], infantFriendly: false }, { num: '6316', deck: 6, a11y: [], infantFriendly: false },
  ],
  STE: [
    { num: '8101', deck: 8, a11y: [], infantFriendly: true },  { num: '8102', deck: 8, a11y: ['wheelchair'], infantFriendly: true },
    { num: '8103', deck: 8, a11y: [], infantFriendly: false }, { num: '8201', deck: 8, a11y: [], infantFriendly: true },
    { num: '8202', deck: 8, a11y: ['hearing'], infantFriendly: false }, { num: '8203', deck: 8, a11y: ['visual'], infantFriendly: false },
  ],
};

// Fare inventory (`row.total`) limits how many cabins can be sold under the
// selected rate. It is not the same thing as the physical room pool an agent
// can choose from. Model the high-density case explicitly: six decks, each
// carrying 28 eligible rooms for every fare row. Only the active deck is
// rendered later, so this realistic pool does not create a 168-card wall.
const STATEROOM_DECKS = [3, 4, 5, 6, 7, 8];
const ROOMS_PER_DECK = 28;
const ROW_ROOM_BANDS = {
  I6: 100, I7: 130, I8: 160,
  O4: 200, O5: 230,
  I8G: 300, B2: 330, B3: 360,
  S1: 400, S3: 430, S5: 460,
};

const STATEROOM_ROOMS_BY_ROW = STATEROOM_ROWS.reduce((byRow, row) => {
  const band = ROW_ROOM_BANDS[row.id];
  byRow[row.id] = STATEROOM_DECKS.flatMap((deck) =>
    Array.from({ length: ROOMS_PER_DECK }, (_, index) => {
      const ordinal = index + 1;
      const a11y = [];
      if (ordinal % 11 === 0) a11y.push('wheelchair');
      if (ordinal % 13 === 0) a11y.push('hearing');
      if (ordinal % 17 === 0) a11y.push('visual');
      return {
        num: `${deck}${String(band + ordinal).padStart(3, '0')}`,
        deck,
        // 10 Forward, 9 Mid Ship and 9 Aft gives every deck a stable physical
        // orientation while still exercising uneven high-density groups.
        loc: index < 10 ? 'fwd' : index < 19 ? 'mid' : 'aft',
        a11y,
        infantFriendly: ordinal % 4 === 0 || ordinal % 9 === 0,
        rollawayBed: ordinal % 3 === 0,
        connectedRoom: ordinal % 7 === 0,
      };
    })
  );
  return byRow;
}, {});

const roomsForRow = (row) => STATEROOM_ROOMS_BY_ROW[row.id] || [];

const CAT_LABELS = { IS: 'Interior', OV: 'Ocean View', BAL: 'Balcony', STE: 'Suite' };
const LOC_LABELS = { fwd: 'Forward', mid: 'Mid Ship', aft: 'Aft Ship' };
const STATEROOM_DECK_NAMES = {
  4: 'Coastal Confessions',
  5: 'Changes in Attitude',
  6: 'Last Mango',
  7: 'Painted Sky',
  8: 'Limes and Salt',
  9: "5 O'Clock Somewhere",
  10: 'Lucky Star',
};

// ── Design scale ───────────────────────────────────────────────────
// One spacing/radius/type scale for the room picker, so padding and gaps stop
// drifting (they previously ran 6/8/10/14/16 with nothing behind them).
const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };
const RD = { sm: 6, md: 10, lg: 14 };
// Teal is the single interaction accent. The stepper's old near-black "+"
// (#0D2533) folds into it so the modal carries one accent hue, not four.
// Name kept for its call sites; the value is the shared WF accent family now.
const TEAL = { base: WF.accentInk, tint: WF.accentTint, border: WF.accentLine };
// Semantic colours, reserved for what they mean: green = done, red = invalid.
// Amber is deliberately unused now — it used to be the *resting* state of the
// guest banner, which made "you haven't started yet" look like a warning.
const OK = '#15803D', BAD = '#B91C1C';

const GUEST_TYPES = [
  { key: 'adults',      label: 'Adults',       sub: '21+',   short: 'A'  },
  { key: 'youngAdults', label: 'Young Adults', sub: '13–21', short: 'YA' },
  { key: 'children',    label: 'Children',     sub: '3–12',  short: 'C'  },
  { key: 'infants',     label: 'Infants',      sub: '0–3',   short: 'I'  },
];
const ZERO_GUESTS = { adults: 0, youngAdults: 0, children: 0, infants: 0 };
const cabinGuestTotal = (g) => GUEST_TYPES.reduce((n, t) => n + ((g && g[t.key]) || 0), 0);

// ── Occupancy rules ────────────────────────────────────────────────
// The only ceiling on a cabin's guest count is the party itself — an agent
// can never assign more of a guest type than Step 1 actually booked. There is
// deliberately no berth/capacity cap: real cabins take rollaways, pull-down
// bunks and cots beyond their nominal bed count, and blocking the "+" at the
// nominal number stopped agents from doing that. `berths`/`cap.berths` below
// stay only as an informational readout (e.g. "2/2 berths"), never as a block.

// Berth capacity, derived from the occupancy columns the category actually
// stocks — a `quad` room sleeps 4, `triple`/`trinf` 3, `double` 2. The infant
// occupancy variants allow one infant in a cot beyond the nominal berths.
// Display-only: see above.
const cabinCapacity = (row) => ({
  berths: row.quad > 0 ? 4 : (row.triple > 0 || row.trinf > 0) ? 3 : (row.double > 0 || row.dbinf > 0) ? 2 : row.single > 0 ? 1 : 4,
  cotInfants: row.dbinf > 0 || row.trinf > 0 ? 1 : 0,
});

// Guests occupying a nominal berth. Informational only — feeds the "X/Y
// berths" readout, not a ceiling. Infants only count once the cabin's cot
// allowance is used up.
const berthedCount = (g, cap) => {
  const gg = g || ZERO_GUESTS;
  return (gg.adults || 0) + (gg.youngAdults || 0) + (gg.children || 0)
    + Math.max(0, (gg.infants || 0) - cap.cotInfants);
};

// Per-cabin validation. No capacity `error` — a cabin can hold more guests
// than its nominal berths and that is not a blocking condition. `warning` is
// advisory: an empty cabin is normal mid-flow (rooms may legitimately be
// confirmed before guests are distributed), and an adult-less cabin is a fare
// rule the agent may be overriding deliberately.
const validateCabin = (g, cap) => {
  const gg = g || ZERO_GUESTS;
  const total = cabinGuestTotal(gg);
  const berths = berthedCount(gg, cap);
  return {
    total,
    berths,
    warning: total > 0 && (gg.adults || 0) === 0 ? 'No adult 21+' : null,
  };
};

// Guests already seated in *other* categories' cabins. The room panel opens one
// category at a time, but the party is shared across all of them. Without this,
// every panel measured the whole Step-1 party against only its own columns: a
// second category read all ten guests as unassigned and would happily seat them
// a second time, while the first category could never explain where the guests
// it had no berths for were supposed to go.
const assignedInOtherRows = (selections, exceptRowId) => {
  const out = { ...ZERO_GUESTS };
  Object.keys(selections || {}).forEach((rowId) => {
    if (rowId === exceptRowId) return;
    Object.values((selections[rowId] && selections[rowId].cabinGuests) || {}).forEach((g) => {
      GUEST_TYPES.forEach(({ key }) => { out[key] += (g && g[key]) || 0; });
    });
  });
  return out;
};

// Physical rooms already claimed by another fare row. Rows are priced
// separately (I6 / I7 / I8) but draw from one shared pool of cabin numbers, so
// without this the same room can be sold twice — which becomes easy to hit now
// that spilling a large party across rows is the supported path.
const categoryIdForSlot = (originRowId, selection, slot) =>
  ((selection && selection.categoryBySlot) || {})[slot] || originRowId;

const categoryRowForSlot = (originRow, categoryBySlot, slot) =>
  STATEROOM_ROWS.find((candidate) => candidate.id === ((categoryBySlot || {})[slot] || originRow.id)) || originRow;

const roomsTakenByOtherAssignments = (selections, exceptRowId, exceptSlot, categoryRowId) => {
  const out = [];
  Object.keys(selections || {}).forEach((rowId) => {
    const selection = selections[rowId] || {};
    Object.entries(selection.roomsBySlot || {}).forEach(([slotKey, num]) => {
      const slot = parseInt(slotKey, 10);
      if (!num || (rowId === exceptRowId && slot === exceptSlot)) return;
      if (categoryIdForSlot(rowId, selection, slot) === categoryRowId) out.push(num);
    });
  });
  return out;
};

// Seats one cabin of this category sells, cot included. Used to size a category
// to the party and to say how many more cabins a shortfall needs.
const cabinSeats = (cap) => cap.berths + cap.cotInfants;


// One source of truth for room features, consumed by both the filter chips and
// the tags on each room card. A shared emoji component keeps the filter legend
// and the room-level metadata visually consistent.
const ROOM_FEATURES = [
  { key: 'infant',     label: 'Crib',       test: (r) => !!r.infantFriendly },
  { key: 'rollaway',   label: 'Rollaway',   test: (r) => !!r.rollawayBed },
  { key: 'wheelchair', label: 'Accessible', test: (r) => r.a11y.includes('wheelchair') },
  { key: 'connected',  label: 'Connecting', test: (r) => !!r.connectedRoom },
];

const ROOM_FEATURE_EMOJIS = {
  infant: '👶',
  rollaway: '🛏️',
  wheelchair: '♿',
  connected: '🔗',
};

function RoomFeatureEmoji({ feature, size = 16 }) {
  return (
    <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>
      {ROOM_FEATURE_EMOJIS[feature]}
    </span>
  );
}

function AutoAssignIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false">
      <path d="M2.25 4.25h7.5M2.25 8h5.5M2.25 11.75h7.5" />
      <path d="m11.25 2.75 2.5 2.5-2.5 2.5M9.25 8.25l2.5 2.5-2.5 2.5" />
    </svg>
  );
}

function EditIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false">
      <path d="M10.75 2.25 13.75 5.25 6 13H3v-3l7.75-7.75Z" />
      <path d="m9.5 3.5 3 3" />
    </svg>
  );
}

function SailboatIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false">
      <path d="M10 2.5v10.25" />
      <path d="M9.75 3.25 4.5 11h5.25V3.25Z" />
      <path d="m10.75 5 4 6h-4V5Z" />
      <path d="M3 13h14l-1.2 2.25a3.1 3.1 0 0 1-2.75 1.65h-6.1a3.1 3.1 0 0 1-2.75-1.65L3 13Z" />
    </svg>
  );
}

const cabinBooleanLabel = (value) => value === true ? 'Yes' : value === false ? 'No' : 'Not provided';

function CabinFact({ label, value, detail, mono = false }) {
  return (
    <div style={{ minWidth: 0, padding: '12px 12px', border: `1px solid ${WF.line}`, borderRadius: RD.sm, background: WF.fill }}>
      <dt style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>{label}</dt>
      <dd style={{ margin: '4px 0 0', fontSize: 14, lineHeight: '20px', fontWeight: 700, color: WF.ink, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit' }}>
        {value || 'Not provided'}
      </dd>
      {detail && <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>{detail}</div>}
    </div>
  );
}

function CabinSectionLabel({ id, children }) {
  return (
    <div id={id} style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function CabinDetailsDialog({ room, row, onClose }) {
  const cap = cabinCapacity(row);
  const derivedBaseOccupancy = row.single > 0 ? 1 : Math.min(2, cap.berths);
  const baseOccupancy = room.baseOccupancy != null ? room.baseOccupancy : derivedBaseOccupancy;
  const derivedTotalOccupancy = Math.min(4, Math.max(baseOccupancy, cap.berths)
    + (room.rollawayBed ? 1 : 0) + (room.infantFriendly ? 1 : 0));
  const totalOccupancy = room.totalOccupancy != null ? room.totalOccupancy : derivedTotalOccupancy;
  const deckName = room.deckName || STATEROOM_DECK_NAMES[room.deck];
  const deckLabel = deckName ? `Deck ${room.deck} · ${deckName}` : `Deck ${room.deck}`;
  const bedConfiguration = room.baseBedConfiguration || 'Twin beds / queen conversion';
  const connectedCabins = Array.isArray(room.connectedCabins)
    ? (room.connectedCabins.length ? room.connectedCabins.join(', ') : 'None')
    : room.connectedRoom === true
      ? 'Available — cabin number not provided'
      : room.connectedRoom === false ? 'None' : 'Not provided';
  const accessibility = (room.a11y || []).map((feature) => ({
    wheelchair: 'Wheelchair-accessible layout',
    hearing: 'Hearing assistance',
    visual: 'Visual alert system',
  })[feature]).filter(Boolean);
  const gallery = Array.isArray(room.gallery) ? room.gallery.filter(Boolean) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 520, display: 'grid', placeItems: 'center', padding: 24,
        background: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(2px)'
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`cabin-details-title-${room.num}`}
        aria-describedby={`cabin-details-summary-${room.num}`}
        style={{
          width: 'min(760px, 100%)', maxHeight: '82vh', overflowY: 'auto',
          background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: RD.lg,
          boxShadow: '0 24px 64px rgba(15,23,42,0.30)'
        }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: SP.lg,
          padding: `${SP.lg}px ${SP.xl}px`, borderBottom: `1px solid ${WF.line}`, background: WF.panel
        }}>
          <div style={{ minWidth: 0 }}>
            <div id={`cabin-details-title-${room.num}`} style={{ fontSize: 20, lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em', color: WF.ink }}>
              Cabin {room.num}
            </div>
            <div id={`cabin-details-summary-${room.num}`} style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>
              {CAT_LABELS[row.cat]} Stateroom · {row.id}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cabin details"
            autoFocus
            style={{
              marginLeft: 'auto', width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${WF.line}`, borderRadius: RD.sm, background: WF.panel,
              color: WF.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, lineHeight: 1, flexShrink: 0
            }}>×</button>
        </div>

        <div style={{ padding: SP.xl }}>
          <section aria-labelledby={`cabin-core-details-${room.num}`}>
            <CabinSectionLabel id={`cabin-core-details-${room.num}`}>Cabin details</CabinSectionLabel>
            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: SP.sm, margin: `${SP.sm}px 0 0` }}>
              <CabinFact label="Cabin number" value={room.num} mono />
              <CabinFact label="Total occupancy" value={`${totalOccupancy}`} />
              <CabinFact label="Deck" value={deckLabel} />
              <CabinFact label="Cabin location" value={LOC_LABELS[room.loc]} />
              <CabinFact label="Base bed configuration" value={bedConfiguration} />
              <CabinFact label="Base occupancy" value={`${baseOccupancy}`} />
            </dl>
          </section>

          <section aria-labelledby={`cabin-suitability-${room.num}`} style={{ marginTop: SP.lg }}>
            <CabinSectionLabel id={`cabin-suitability-${room.num}`}>Sleeping &amp; suitability</CabinSectionLabel>
            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: SP.sm, margin: `${SP.sm}px 0 0` }}>
              <CabinFact label="Infant friendly" value={cabinBooleanLabel(room.infantFriendly)} />
              <CabinFact label="Rollaway" value={cabinBooleanLabel(room.rollawayBed)} />
              <CabinFact label="Sofa bed" value={cabinBooleanLabel(room.sofaBed)} />
              <CabinFact label="Pullman" value={cabinBooleanLabel(room.pullmanBed)} />
              <CabinFact label="Single cabin" value={cabinBooleanLabel(room.singleCabin)} />
              <CabinFact label="Connected cabins" value={connectedCabins} />
            </dl>
          </section>

          {accessibility.length > 0 && (
            <section aria-labelledby={`cabin-accessibility-${room.num}`} style={{ marginTop: SP.lg }}>
              <CabinSectionLabel id={`cabin-accessibility-${room.num}`}>Accessibility</CabinSectionLabel>
              <ul style={{ margin: `${SP.sm}px 0 0`, padding: `0 0 0 ${SP.lg}px`, color: WF.inkSoft, fontSize: 14, lineHeight: '20px' }}>
                {accessibility.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
          )}

          <section aria-labelledby={`cabin-gallery-${room.num}`} style={{ marginTop: SP.lg }}>
            <CabinSectionLabel id={`cabin-gallery-${room.num}`}>Gallery</CabinSectionLabel>
            {gallery.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: SP.sm, marginTop: SP.sm }}>
                {gallery.map((image, index) => {
                  const source = typeof image === 'string' ? image : image.src;
                  const alt = typeof image === 'string' ? `${CAT_LABELS[row.cat]} cabin ${room.num}` : (image.alt || `${CAT_LABELS[row.cat]} cabin ${room.num}`);
                  return <img key={`${source}-${index}`} src={source} alt={alt} style={{ width: '100%', height: 140, objectFit: 'cover', border: `1px solid ${WF.line}`, borderRadius: RD.sm }} />;
                })}
              </div>
            ) : (
              <div style={{
                minHeight: 112, marginTop: SP.sm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: SP.sm,
                padding: SP.lg, border: `1px dashed ${WF.line}`, borderRadius: RD.md, background: WF.fill, color: WF.inkSoft, textAlign: 'center'
              }}>
                <SailboatIcon size={24} />
                <div>
                  <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: WF.ink }}>No cabin images available</div>
                  <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px' }}>Gallery content has not been provided for this cabin.</div>
                </div>
              </div>
            )}
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: SP.xl, paddingTop: SP.lg, borderTop: `1px solid ${WF.line}` }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                minHeight: 36, padding: '8px 16px', border: 'none', borderRadius: RD.sm,
                background: WF.accent, color: WF.accentText, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}>Close details</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quantity control. `max` is the category's remaining inventory; without it
// the "+" incremented forever and a category with 2 rooms left would accept 5
// cabins, stranding three that could never be filled. ──
function QtyControl({ value, onChange, disabled, max }) {
  const atMax = max != null && value >= max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <button
        onClick={() => value > 0 && onChange(value - 1)}
        disabled={value === 0 || disabled}
        style={{
          width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: '4px 0 0 4px',
          background: value === 0 ? WF.fill : WF.panel, color: value === 0 ? WF.inkFaint : WF.ink,
          cursor: value === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1
        }}>−</button>
      <div style={{
        width: 28, height: 22, border: `1px solid ${WF.line}`, borderLeft: 'none', borderRight: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: WF.ink, background: WF.panel
      }}>{value}</div>
      <button
        onClick={() => !atMax && onChange(value + 1)}
        disabled={disabled || atMax}
        title={atMax ? `Only ${max} room${max === 1 ? '' : 's'} left in this category` : undefined}
        style={{
          width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: '0 4px 4px 0',
          background: atMax ? WF.fill : WF.panel, color: atMax ? WF.inkFaint : WF.ink,
          cursor: atMax || disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1
        }}>+</button>
    </div>
  );
}

// ── Numeric cell (muted neutral if 0, teal if > 0) ──────────────────────────
function NumCell({ val }) {
  const isZero = val === 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      color: isZero ? WF.inkSoft : WF.accentInk,
      fontFamily: 'ui-monospace, monospace'
    }}>{val}</span>
  );
}

// ── Overall guest assignment summary (total + per-type breakdown).
// Sits inside the cabin-distribution workspace above its table: the per-type got/need pairs are the only place
// the agent can see "0/4 Adults" at a glance, which a single progress bar
// can't convey. ──
function GuestAssignmentSummary({ partyGuests, assignedTotals, otherAssigned }) {
  // Guests seated in another category count as assigned here too — the party is
  // shared, so "4 of 10" has to mean 4 of the whole party, not 4 of this panel.
  const other = otherAssigned || ZERO_GUESTS;
  const totalParty = GUEST_TYPES.reduce((n, t) => n + (partyGuests[t.key] || 0), 0);
  const totalOther = GUEST_TYPES.reduce((n, t) => n + (other[t.key] || 0), 0);
  const totalAssigned = GUEST_TYPES.reduce((n, t) => n + (assignedTotals[t.key] || 0), 0) + totalOther;
  const complete = totalParty > 0 && totalAssigned === totalParty;
  // Steppers are capped at the party count now, so `over` is only reachable by
  // shrinking the party after assigning. It still has to read as an error.
  const over = totalAssigned > totalParty;
  const tone = over ? BAD : complete ? OK : '#92400E';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      gap: SP.md, padding: `${SP.md}px ${SP.lg}px`, borderRadius: RD.md,
      background: over ? '#FEF2F2' : complete ? '#F0FDF4' : '#FFFBEB',
      border: `1px solid ${over ? '#FECACA' : complete ? '#BBF7D0' : '#FDE68A'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: SP.sm }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: tone }}>
          {totalAssigned} of {totalParty} guest{totalParty === 1 ? '' : 's'} assigned
        </span>
        <span style={{ fontSize: 12, color: tone }}>
          {over ? '· Too many guests assigned' : complete ? '· All guests placed' : `· ${totalParty - totalAssigned} remaining`}
          {totalOther > 0 ? ` · ${totalOther} in other categories` : ''}
        </span>
      </div>
      {/* Per-type got/need. This is the readout the single progress bar lost —
          with the party split across cabins, "8 of 10" alone never says *which*
          two guests still have nowhere to sleep. */}
      <div style={{ display: 'flex', gap: SP.lg, flexWrap: 'wrap' }}>
        {GUEST_TYPES.map(({ key, label }) => {
          const need = partyGuests[key] || 0;
          const got = (assignedTotals[key] || 0) + (other[key] || 0);
          if (need === 0 && got === 0) return null;
          const done = got === need;
          return (
            <div key={key} style={{ fontSize: 12, color: done ? WF.inkSoft : '#92400E', whiteSpace: 'nowrap' }}>
              <span style={{
                fontWeight: 700, color: got > need ? BAD : done ? WF.ink : '#92400E',
                fontFamily: 'ui-monospace, monospace'
              }}>{got}/{need}</span> {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Compact stepper for use inside a table cell.
// `canAdd` / `addBlockedReason` are supplied per cell by the table: the "+"
// used to increment without any ceiling, which is how a party of 10 could be
// assigned twice over, or four guests booked into a double. ──
function CabinCellStepper({ value, onChange, canAdd, addBlockedReason }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label="Remove one"
        style={{
          width: 26, height: 26, border: `1px solid ${WF.line}`, borderRadius: `${RD.sm}px 0 0 ${RD.sm}px`,
          background: '#fff', color: value === 0 ? WF.inkFaint : WF.ink,
          cursor: value === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>−</button>
      <div style={{
        width: 30, height: 26, border: `1px solid ${WF.line}`, borderLeft: 'none', borderRight: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: value > 0 ? WF.ink : WF.inkFaint,
        background: '#F8FAFC', fontFamily: 'ui-monospace, monospace'
      }}>{value}</div>
      <button
        onClick={() => canAdd && onChange(value + 1)}
        disabled={!canAdd}
        title={canAdd ? undefined : addBlockedReason}
        aria-label="Add one"
        style={{
          width: 26, height: 26, border: 'none', borderRadius: `0 ${RD.sm}px ${RD.sm}px 0`,
          background: canAdd ? TEAL.base : WF.fillStrong, color: canAdd ? '#fff' : WF.inkFaint,
          cursor: canAdd ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>+</button>
    </div>
  );
}

// ── Cabin assignment table. Cabins are columns, guest types are rows, so the
// whole distribution is legible at once — which is the thing the accordion
// rail could not do: it expanded one cabin at a time, so "are these 10 guests
// spread sensibly across 3 rooms?" required scrolling and memory.
// Columns are narrow and the first one is sticky, so the many-cabin case
// scrolls sideways *inside* the table rather than widening the modal. ──
function CabinAssignmentTable({ row, qty, categoryBySlot, roomsBySlot, cabinGuests, activeSlot, partyGuests, otherAssigned, onSelectSlot, onGuestChange, onSwitchCategory }) {
  const TYPES = [
    { key: 'adults', icon: '🧑', label: 'Adults', sub: 'Age 21+' },
    { key: 'youngAdults', icon: '🧑', label: 'Young Adults', sub: 'Age 13-21' },
    { key: 'children', icon: '🧒', label: 'Children', sub: 'Age 3-12' },
    { key: 'infants', icon: '👶', label: 'Infants', sub: 'Age 0-3' }
  ];
  const LABEL_COL = 132;
  const CABIN_COL = 208;
  const categoryOptions = STATEROOM_ROWS.map((category) => ({
    value: category.id,
    label: category.label,
    meta: category.total === 0 ? 'Sold out' : `$${category.price.toLocaleString()} / room`,
    disabled: category.total === 0,
  }));

  // Headroom left in the party, per guest type. A cell may never push the
  // running total past what Step 1 actually booked — counting guests seated in
  // *other* categories too, or the same guest gets a berth in two of them.
  const other = otherAssigned || ZERO_GUESTS;
  const partyRemaining = {};
  TYPES.forEach(({ key }) => {
    const assigned = Array.from({ length: qty }, (_, i) => (cabinGuests[i] || ZERO_GUESTS)[key] || 0)
      .reduce((a, b) => a + b, 0);
    partyRemaining[key] = ((partyGuests || ZERO_GUESTS)[key] || 0) - (other[key] || 0) - assigned;
  });
  const scrollRef = React.useRef(null);
  const [scrollState, setScrollState] = React.useState({ left: false, right: false });

  const updateScrollShadows = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2
    });
  }, []);

  React.useEffect(() => {
    updateScrollShadows();
    window.addEventListener('resize', updateScrollShadows);
    return () => window.removeEventListener('resize', updateScrollShadows);
  }, [updateScrollShadows, qty]);

  // Keep the active cabin's column in view when it changes (e.g. via room grid click)
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const colLeft = LABEL_COL + activeSlot * CABIN_COL;
    const colRight = colLeft + CABIN_COL;
    if (colLeft < el.scrollLeft) el.scrollTo({ left: colLeft, behavior: 'smooth' });
    else if (colRight > el.scrollLeft + el.clientWidth) el.scrollTo({ left: colRight - el.clientWidth, behavior: 'smooth' });
  }, [activeSlot]);

  return (
    <div>
      {qty > 6 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: WF.inkSoft }}>
          <span>↔</span> Scroll to see all {qty} cabins
        </div>
      )}
      <div style={{ position: 'relative', border: `1px solid ${WF.line}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
        <div
          ref={scrollRef}
          onScroll={updateScrollShadows}
          style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <table style={{ width: '100%', minWidth: LABEL_COL + qty * CABIN_COL, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: LABEL_COL }} />
              {Array.from({ length: qty }, (_, i) => <col key={i} style={{ width: CABIN_COL }} />)}
            </colgroup>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky', left: 0, zIndex: 2,
                  padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                  color: WF.inkLabel, textTransform: 'uppercase', background: '#F8FAFC', borderBottom: `1px solid ${WF.line}`,
                  boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                }}>Guest Type</th>
                {Array.from({ length: qty }, (_, i) => {
                  const roomNum = roomsBySlot[i];
                  const isActive = activeSlot === i;
                  const slotRow = categoryRowForSlot(row, categoryBySlot, i);
                  const slotCap = cabinCapacity(slotRow);
                  const v = validateCabin(cabinGuests[i], slotCap);
                  return (
                    <th key={i} style={{
                      padding: 8, textAlign: 'center', verticalAlign: 'top',
                      background: isActive ? TEAL.tint : '#F8FAFC',
                      borderBottom: `2px solid ${isActive ? TEAL.base : WF.line}`,
                      borderLeft: `1px solid ${WF.lineSoft}`,
                      transition: 'background-color 120ms ease'
                    }}>
                      <button
                        type="button"
                        onClick={() => onSelectSlot(i)}
                        aria-pressed={isActive}
                        aria-label={`Work on Cabin ${i + 1}${roomNum ? `, room ${roomNum}` : ', no room yet'}`}
                        style={{
                          width: '100%', minHeight: 32, padding: 0, border: 0, background: 'transparent',
                          color: isActive ? TEAL.base : WF.ink, cursor: 'pointer', fontFamily: 'inherit'
                        }}>
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>Cabin {i + 1}</span>
                      </button>
                      <div style={{ marginTop: 4, textAlign: 'left' }}>
                        <PortableSelect
                          value={slotRow.id}
                          onValueChange={(newRowId) => { onSelectSlot(i); onSwitchCategory(i, newRowId); }}
                          ariaLabel={`Stateroom category for Cabin ${i + 1}`}
                          width="100%"
                          menuMinWidth={300}
                          menuZIndex="var(--ds-layer-modal-nested, 520)"
                          showSelectedMeta={false}
                          fontWeight={700}
                          options={categoryOptions}
                        />
                        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: WF.inkSoft, fontSize: 12 }}>
                          <span>{CAT_LABELS[slotRow.cat]}</span>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: WF.ink }}>${slotRow.price.toLocaleString()} / room</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 12, fontWeight: roomNum ? 700 : 500, color: roomNum ? TEAL.base : WF.inkFaint, fontStyle: roomNum ? 'normal' : 'italic', fontFamily: roomNum ? 'ui-monospace, monospace' : 'inherit', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {roomNum ? `Room ${roomNum}` : 'No room yet'}
                        </div>
                      </div>
                      {/* Occupancy against this category's berth count, plus the
                          one-line reason when the cabin can't be sold as filled.
                          Fixed height so a flagged column doesn't jog the header
                          taller than its neighbours. */}
                      {v.warning && (
                        <div style={{ height: 13, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap' }}>⚠ {v.warning}</span>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TYPES.map(({ key, icon, label, sub }, ri) => (
                <tr key={key}>
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 1, background: '#fff',
                    padding: '12px 16px', borderBottom: ri < TYPES.length - 1 ? `1px solid ${WF.lineSoft}` : 'none',
                    boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink, whiteSpace: 'nowrap' }}>{label}</div>
                        <div style={{ fontSize: 12, color: WF.inkSoft, whiteSpace: 'nowrap' }}>{sub}</div>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: qty }, (_, i) => {
                    const g = cabinGuests[i] || ZERO_GUESTS;
                    const isActive = activeSlot === i;
                    // Only ceiling left: the party itself. A cabin can take as
                    // many guests as the agent wants to put in it — rollaways,
                    // pull-downs and cots aren't modeled per-room here, so there
                    // is nothing to cap against.
                    const partyOk = partyRemaining[key] > 0;
                    return (
                      <td key={i} style={{
                        padding: `${SP.md}px ${SP.sm}px`, textAlign: 'center',
                        borderBottom: ri < TYPES.length - 1 ? `1px solid ${WF.lineSoft}` : 'none',
                        borderLeft: `1px solid ${WF.lineSoft}`,
                        background: isActive ? '#F0FDFB' : '#fff'
                      }}>
                        <CabinCellStepper
                          value={g[key] || 0}
                          canAdd={partyOk}
                          addBlockedReason={`All ${label.toLowerCase()} in this party are already assigned`}
                          onChange={(v) => onGuestChange(i, key, v)} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {/* Per-cabin totals. With the party split across columns this is the
                line that answers "is this room actually full?" without adding
                four numbers up by eye. */}
            <tfoot>
              <tr>
                <td style={{
                  position: 'sticky', left: 0, zIndex: 1, background: '#F8FAFC',
                  padding: `${SP.sm}px ${SP.lg}px`, borderTop: `1px solid ${WF.line}`,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                  color: WF.inkLabel, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                }}>In cabin</td>
                {Array.from({ length: qty }, (_, i) => {
                  const slotCap = cabinCapacity(categoryRowForSlot(row, categoryBySlot, i));
                  const v = validateCabin(cabinGuests[i], slotCap);
                  const full = v.total > 0 && v.berths === slotCap.berths;
                  const tone = full ? OK : v.total > 0 ? WF.ink : WF.inkFaint;
                  return (
                    <td key={i} style={{
                      padding: `${SP.sm}px`, textAlign: 'center', borderTop: `1px solid ${WF.line}`,
                      borderLeft: `1px solid ${WF.lineSoft}`,
                      background: activeSlot === i ? '#F0FDFB' : '#F8FAFC'
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: tone, fontFamily: 'ui-monospace, monospace' }}>
                        {v.total}{full ? ' ✓' : ''}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Right-edge scroll affordance */}
        {scrollState.right && (
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 28, pointerEvents: 'none',
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(15,23,42,0.06))'
          }} />
        )}
      </div>
    </div>
  );
}

// ── Feature filter chip. Icon and label stay together: these operational
// filters must be recognizable without remembering an icon legend. ──
function FeatureChip({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 4, height: 30, padding: '0 8px', borderRadius: 6,
        fontSize: 12, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap', fontFamily: 'inherit',
        border: `1px solid ${active ? TEAL.border : WF.line}`,
        background: active ? TEAL.tint : WF.panel,
        color: active ? TEAL.base : WF.inkSoft,
        cursor: 'pointer', transition: 'all 0.12s', flexShrink: 0
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = TEAL.border; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = WF.line; }}>
      {icon && <RoomFeatureEmoji feature={icon} />}
      {label}
    </button>
  );
}

// ── One room in the grid. `state` collapses what used to be four nested
// ternaries per style property into a single lookup. Every card is the same
// width and height regardless of how many feature tags it carries, so the
// grid actually aligns. ──
const ROOM_STATE_STYLE = {
  selected:  { border: WF.accent,    bg: WF.accentTint, num: WF.accent, opacity: 1 },
  taken:     { border: WF.line,      bg: WF.fill,   num: WF.inkFaint, opacity: 1 },
  available: { border: WF.line,      bg: WF.panel,  num: WF.ink,      opacity: 1 },
  filtered:  { border: WF.lineSoft,  bg: WF.fill,   num: WF.inkFaint, opacity: 0.58 },
};
function RoomCard({ room, state, ownerSlot, onClick, onShowDetails, disabled }) {
  const s = ROOM_STATE_STYLE[state];
  const tags = ROOM_FEATURES.filter((f) => f.test(room));
  const statusLabel = state === 'selected'
    ? `✓ Cabin ${ownerSlot + 1}`
    : state === 'taken'
      ? `Cabin ${ownerSlot + 1}`
      : state === 'filtered'
        ? 'Doesn’t match'
        : 'Available';
  const statusColor = state === 'selected'
    ? WF.accent
    : state === 'taken' || state === 'filtered'
      ? WF.inkSoft
      : '#047857';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 116,
      borderRadius: RD.sm, border: `1px solid ${s.border}`, background: s.bg, opacity: s.opacity,
      overflow: 'hidden',
      boxShadow: state === 'selected' ? `inset 0 0 0 1px ${WF.accent}` : '0 1px 1px rgba(15,23,42,0.03)',
      transition: 'background-color 0.12s, border-color 0.12s, box-shadow 0.12s'
    }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={state === 'selected'}
        aria-label={`Room ${room.num}, deck ${room.deck}, ${LOC_LABELS[room.loc]}, ${statusLabel}${
          tags.length ? `, ${tags.map((f) => f.label).join(', ')}` : ''
        }`}
        style={{
          display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left', width: '100%',
          minHeight: 84, padding: '8px 12px', border: 'none', background: 'transparent',
          color: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          transition: 'background-color 0.12s'
        }}
        onMouseEnter={(e) => { if (!disabled && state !== 'selected') e.currentTarget.style.background = WF.accentTint; }}
        onMouseLeave={(e) => { if (!disabled && state !== 'selected') e.currentTarget.style.background = 'transparent'; }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
        <div style={{
          fontSize: 16, fontWeight: 700, lineHeight: '24px', letterSpacing: '-0.01em',
          color: s.num, fontFamily: 'ui-monospace, monospace'
        }}>{room.num}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0,
          color: statusColor, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
        }}>
          <span aria-hidden="true" style={{
            width: 6, height: 6, borderRadius: 999, flexShrink: 0,
            background: state === 'selected' ? WF.accent : state === 'available' ? '#059669' : WF.inkFaint
          }} />
          {statusLabel}
        </span>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: WF.inkSoft }}>
        {LOC_LABELS[room.loc]}
      </div>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, width: '100%' }}>
        {tags.length === 0 && (
          <span style={{ fontSize: 12, color: WF.inkFaint }}>Standard room</span>
        )}
        {tags.map((f) => (
          <span
            key={f.key}
            title={f.label}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              minHeight: 20, padding: '4px 4px', borderRadius: 4,
              border: `1px solid ${state === 'selected' ? WF.accentLine : WF.line}`,
              background: state === 'selected' ? '#FFFFFF' : WF.fill,
              color: state === 'selected' ? WF.accent : WF.inkSoft,
              fontSize: 12, fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap'
            }}>
            <RoomFeatureEmoji feature={f.key} size={12} />
            {f.label}
          </span>
        ))}
      </div>
      </button>
      <button
        type="button"
        onClick={onShowDetails}
        aria-label={`View details for room ${room.num}`}
        title={`View details for room ${room.num}`}
        style={{
          width: '100%', minHeight: 31, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '4px 8px', border: 'none', borderTop: `1px solid ${state === 'selected' ? WF.accentLine : WF.line}`,
          background: state === 'selected' ? '#FFFFFF' : WF.fill, color: WF.accent,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = WF.accentTint; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = state === 'selected' ? '#FFFFFF' : WF.fill; }}>
        <SailboatIcon size={14} />
        Room details
      </button>
    </div>
  );
}

// ── Select Room Panel — focused modal overlay ─────────────────────
// One column, read top to bottom: how much of the party is placed → which
// guests are in which cabin → which room the selected cabin gets.
//
// This replaces a two-pane version whose left rail listed cabins vertically
// and expanded one at a time. That shape was fine for a single cabin and
// unusable past it: with 3 cabins the rail could show one cabin's steppers,
// so "are these 10 guests spread sensibly?" meant scrolling and remembering.
// Cabins are columns of one table here, so the whole distribution — plus each
// cabin's berth count and any rule it breaks — is visible at once.
function SelectRoomPanel({ row, qty, categoryBySlot, roomsBySlot, cabinGuests, activeSlot, partyGuests, otherAssigned, takenRooms, onToggleRoom, onAutoAssign, onSelectSlot, onGuestChange, onConfirm, onBack, onClose, onQtyChange, onSwitchCategory }) {
  const activeRow = categoryRowForSlot(row, categoryBySlot, activeSlot);
  // Joined rather than passed as an array so the memo has a stable dependency —
  // a fresh array literal every render would rebuild this list each time.
  const takenKey = (takenRooms || []).join(',');
  const selectedRoomKey = (roomsBySlot || {})[activeSlot] || '';
  const rooms = React.useMemo(() => {
    const taken = new Set(takenKey ? takenKey.split(',') : []);
    const selected = new Set(selectedRoomKey ? selectedRoomKey.split(',') : []);
    const rowPool = roomsForRow(activeRow);
    // Keep a previously-saved room visible if it predates row-level inventory.
    // That lets an agent release or replace it instead of stranding an invisible
    // assignment after this normalization.
    const legacySelected = (STATEROOM_ROOMS[activeRow.cat] || []).filter((room) =>
      selected.has(room.num) && !rowPool.some((candidate) => candidate.num === room.num));
    return [...rowPool, ...legacySelected].filter(r => !taken.has(r.num)).map(r => ({
      ...r,
      loc: r.loc || activeRow.location,
      rollawayBed: r.rollawayBed !== undefined ? r.rollawayBed : parseInt(r.num, 10) % 4 === 0,
      connectedRoom: r.connectedRoom !== undefined ? r.connectedRoom : parseInt(r.num, 10) % 5 === 0,
    }));
  }, [activeRow.id, selectedRoomKey, takenKey]);
  // Group by deck without recalculating position. Position belongs to the
  // row-level inventory above; deriving it from the remaining list made rooms
  // jump between Forward/Mid/Aft whenever another cabin claimed a room.
  const roomsByDeck = React.useMemo(() => {
    const groups = {};
    rooms.forEach(r => { (groups[r.deck] = groups[r.deck] || []).push(r); });
    return Object.keys(groups).map(Number).sort((a, b) => a - b).map(deck => ({
      deck,
      rooms: groups[deck].slice().sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true })),
    }));
  }, [rooms]);
  // One set of active feature keys replaces four parallel booleans, which is
  // what makes the "All" reset and the chip row a one-liner each.
  const [activeFilters, setActiveFilters] = React.useState(() => new Set());
  // Ship position, moved here from the matrix toolbar: it narrows the room grid
  // below, where an agent is actually choosing a physical room, rather than
  // narrowing the category table. null = All.
  const [locFilter, setLocFilter] = React.useState(null);
  const [activeDeck, setActiveDeck] = React.useState(() => roomsByDeck[0]?.deck || STATEROOM_DECKS[0]);
  const [detailRoom, setDetailRoom] = React.useState(null);

  const toggleFilter = (key) => setActiveFilters((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (detailRoom) setDetailRoom(null); else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, detailRoom]);

  // A fare-row switch is a new inventory context. Return to the first deck and
  // clear stale filters instead of carrying a hidden Deck 8 / room-number query
  // into a category that has just opened.
  React.useEffect(() => {
    setActiveDeck(roomsByDeck[0]?.deck || STATEROOM_DECKS[0]);
    setLocFilter(null);
    setActiveFilters(new Set());
    setDetailRoom(null);
  }, [activeRow.id]);

  // Filters AND together. Non-matches are hidden in the high-density deck
  // pane, while assigned rooms are re-added below so a filter can never strand
  // a room that still needs to be released or replaced.
  const isRoomActive = (room) => (!locFilter || room.loc === locFilter)
    && ROOM_FEATURES.every((f) => !activeFilters.has(f.key) || f.test(room));

  // Berth capacity for this category — informational only (the "X/Y berths"
  // readout and the "no adult" warning), never a Confirm gate or an add-block.
  const filledCount = Object.values(roomsBySlot).filter(Boolean).length;

  const assignedTotals = Object.values(cabinGuests).reduce((acc, g) => ({
    adults: acc.adults + (g?.adults || 0),
    youngAdults: acc.youngAdults + (g?.youngAdults || 0),
    children: acc.children + (g?.children || 0),
    infants: acc.infants + (g?.infants || 0)
  }), { adults: 0, youngAdults: 0, children: 0, infants: 0 });

  const totalParty = partyGuests ? (partyGuests.adults || 0) + (partyGuests.youngAdults || 0) + (partyGuests.children || 0) + (partyGuests.infants || 0) : 0;
  const assignedHere = assignedTotals.adults + assignedTotals.youngAdults + assignedTotals.children + assignedTotals.infants;
  // Guests seated in other categories are still seated. Counting only this
  // panel's columns made a correctly-split party look permanently unfinished
  // here, and let the same guest be seated again in the next category.
  const other = otherAssigned || ZERO_GUESTS;
  const assignedElsewhere = (other.adults || 0) + (other.youngAdults || 0) + (other.children || 0) + (other.infants || 0);
  const totalAssignedGuests = assignedHere + assignedElsewhere;
  const overAssigned = totalAssignedGuests > totalParty;
  const guestsFullyDistributed = totalParty > 0 && totalAssignedGuests === totalParty && !overAssigned;
  const [distributionExpanded, setDistributionExpanded] = React.useState(() => !guestsFullyDistributed);
  const distributionStateRef = React.useRef({ rowId: row.id, complete: guestsFullyDistributed });

  // Give the room inventory the full working area as soon as the last guest is
  // placed. The summary row remains visible and can reopen the table for edits.
  React.useEffect(() => {
    const previous = distributionStateRef.current;
    if (previous.rowId !== row.id) {
      setDistributionExpanded(!guestsFullyDistributed);
    } else if (guestsFullyDistributed && !previous.complete) {
      setDistributionExpanded(false);
    }
    distributionStateRef.current = { rowId: row.id, complete: guestsFullyDistributed };
  }, [row.id, guestsFullyDistributed]);

  // Display-only: a cabin is "configured" once it has both a room and a guest.
  // It does NOT gate Confirm — a cabin may legitimately be confirmed before its
  // guests are distributed, so an *incomplete* assignment stays confirmable.
  const configuredCount = Array.from({ length: qty }, (_, i) => i)
    .filter((i) => roomsBySlot[i] && cabinGuestTotal(cabinGuests[i]) > 0).length;

  // Confirm gate. Rooms gate it as they always did. The one addition describes
  // a state that is not merely unfinished but *wrong* and so must not be
  // written to the booking: more guests placed than the party actually
  // contains, reachable when Step 1's guest count is reduced after cabins were
  // configured. There is no per-cabin capacity check — a cabin holding more
  // guests than its nominal berths is not an error.
  const canConfirm = filledCount === qty && !overAssigned;
  const filtersActive = !!locFilter || activeFilters.size > 0;
  const matchingRoomCount = rooms.filter(isRoomActive).length;
  const assignedRoomNums = new Set(Object.entries(roomsBySlot || {})
    .filter(([slot, num]) => num && categoryIdForSlot(row.id, { categoryBySlot }, parseInt(slot, 10)) === activeRow.id)
    .map(([, num]) => num));
  const activeDeckGroup = roomsByDeck.find((group) => group.deck === activeDeck) || roomsByDeck[0] || { deck: activeDeck, rooms: [] };
  const activeDeckRooms = activeDeckGroup.rooms;
  const activeDeckMatches = activeDeckRooms.filter(isRoomActive);
  const visibleActiveDeckRooms = activeDeckRooms.filter((room) => isRoomActive(room) || assignedRoomNums.has(room.num));
  const activeDeckAssignedCount = activeDeckRooms.filter((room) => assignedRoomNums.has(room.num)).length;

  const renderRoomOption = (room) => {
    const active = isRoomActive(room);
    const ownerSlotEntry = Object.entries(roomsBySlot).find(([slot, num]) =>
      num === room.num && categoryIdForSlot(row.id, { categoryBySlot }, parseInt(slot, 10)) === activeRow.id);
    const ownerSlot = ownerSlotEntry ? parseInt(ownerSlotEntry[0], 10) : null;
    const selected = ownerSlot != null;
    const isCurrentSlot = ownerSlot === activeSlot;
    const state = isCurrentSlot ? 'selected' : selected ? 'taken' : active ? 'available' : 'filtered';
    return (
      <RoomCard
        key={room.num}
        room={room}
        state={state}
        ownerSlot={ownerSlot}
        disabled={!active && !selected}
        onShowDetails={() => setDetailRoom({ room, state, ownerSlot })}
        onClick={() => (active || selected) && onToggleRoom(room.num)} />
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(1px)',
        display: 'grid', placeItems: 'center', padding: 24
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-staterooms-title"
        aria-describedby="assign-staterooms-description"
        style={{
          width: 'min(1120px, 100%)', maxHeight: '90vh', margin: 'auto',
          display: 'flex', flexDirection: 'column',
          background: WF.panel, borderRadius: RD.lg, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,23,42,0.28)', border: `1px solid ${WF.line}`
        }}>
        {/* ── Header: establish the task. Assignment facts live with the
            distribution section they control rather than in a detached strip. ── */}
        <div style={{
          flexShrink: 0, padding: `${SP.md}px ${SP.lg}px`,
          borderBottom: `1px solid ${WF.line}`, background: WF.panel
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: SP.lg }}>
            <div style={{ minWidth: 0 }}>
              <div id="assign-staterooms-title" style={{ fontSize: 16, fontWeight: 700, color: WF.ink, letterSpacing: '-0.01em' }}>Assign staterooms</div>
              <div id="assign-staterooms-description" style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>Choose a category for each cabin, place guests, then confirm a room.</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              title="Close · your selections are kept"
              style={{
                marginLeft: 'auto', width: 30, height: 30, borderRadius: RD.sm,
                border: `1px solid ${WF.line}`, background: WF.panel, color: WF.inkSoft,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = WF.fill; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = WF.panel; }}>×</button>
          </div>
        </div>

        {/* ── Body: one column, scrolled as a whole. `minHeight: 0` is
            load-bearing — a flex item defaults to `min-height: auto` and won't
            shrink below its content, so without it the scroller never engages
            and the footer gets pushed past 90vh.

            Stacked rather than two panes: guest distribution has to be read
            *across* cabins, and a 344px rail could only ever show one cabin's
            steppers at a time. Here every cabin is a column of one table. ── */}
        <div
          className="stateroom-modal-scroll"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarGutter: 'auto', background: WF.panel }}>

          {/* ══ Which guests go in which cabin ══ */}
          <div style={{ padding: `${SP.md}px ${SP.lg}px 0` }}>
            <div style={{
              border: `1px solid ${WF.line}`, borderRadius: RD.md, overflow: 'hidden',
              background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,0.08)'
            }}>
              <div
                role="group"
                aria-label="Cabin distribution settings"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 16, padding: '8px 12px',
                  borderBottom: distributionExpanded ? `1px solid ${WF.line}` : 'none',
                  background: WF.fill, color: WF.ink
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>Distribute guests by cabin</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>
                    {distributionExpanded
                      ? 'Each cabin starts with the category you selected. Change a cabin independently, then assign its guests and room.'
                      : `${totalAssignedGuests} guests placed across ${qty} cabin${qty === 1 ? '' : 's'}.`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12, flexShrink: 0 }}>
                  <div style={{ minWidth: 104 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>Cabins</div>
                    <div style={{ marginTop: 4 }}>
                      <QtyControl
                        value={qty}
                        max={row.total}
                        onChange={(val) => val >= 1 && val <= row.total && onQtyChange(val)} />
                    </div>
                  </div>
                  <div role="status" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                    border: `1px solid ${filledCount === qty ? '#BBF7D0' : WF.accentLine}`,
                    borderRadius: RD.sm, background: filledCount === qty ? '#F0FDF4' : WF.accentTint
                  }}>
                    <span aria-hidden="true" style={{
                      width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 999, flexShrink: 0, background: filledCount === qty ? '#047857' : WF.accent,
                      color: '#FFFFFF', fontSize: 12, fontWeight: 700
                    }}>{filledCount === qty ? '✓' : '!'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: filledCount === qty ? '#047857' : WF.ink, whiteSpace: 'nowrap' }}>
                        {filledCount === qty ? 'Ready to confirm' : `${qty - filledCount} remaining`}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft, whiteSpace: 'nowrap' }}>{filledCount} of {qty} rooms assigned</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDistributionExpanded((expanded) => !expanded)}
                    aria-expanded={distributionExpanded}
                    aria-controls={`guest-distribution-${row.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 32,
                      padding: '4px 8px', border: `1px solid ${WF.line}`, borderRadius: RD.sm,
                      background: WF.panel, color: WF.accent, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                    {distributionExpanded ? 'Collapse' : <React.Fragment><EditIcon /> Edit</React.Fragment>}
                  </button>
                </div>
              </div>
              {distributionExpanded && (
                <div id={`guest-distribution-${row.id}`} style={{ display: 'grid', gap: SP.sm, padding: SP.sm, background: WF.panel }}>
                  <GuestAssignmentSummary
                    partyGuests={partyGuests || ZERO_GUESTS}
                    assignedTotals={assignedTotals}
                    otherAssigned={other} />
                  <CabinAssignmentTable
                    row={row}
                    qty={qty}
                    categoryBySlot={categoryBySlot}
                    roomsBySlot={roomsBySlot}
                    cabinGuests={cabinGuests}
                    activeSlot={activeSlot}
                    partyGuests={partyGuests || ZERO_GUESTS}
                    otherAssigned={other}
                    onSelectSlot={onSelectSlot}
                    onGuestChange={onGuestChange}
                    onSwitchCategory={onSwitchCategory} />
                </div>
              )}
            </div>
          </div>

          {/* ══ Which room ══ */}
          <div style={{ padding: `${SP.lg}px` }}>
            <div style={{ border: `1px solid ${WF.line}`, borderRadius: RD.md, overflow: 'hidden', background: WF.panel }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: SP.md, padding: '8px 12px',
                background: WF.fill, borderBottom: `1px solid ${WF.line}`
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: WF.accent, color: '#FFFFFF', fontSize: 12, fontWeight: 700,
                  fontFamily: 'ui-monospace, monospace', flexShrink: 0
                }}>{activeSlot + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>Room inventory for Cabin {activeSlot + 1}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>
                    <span style={{ fontWeight: 700, color: WF.ink }}>{activeRow.label}</span>
                    {' · $'}{activeRow.price.toLocaleString()}{' per room · '}
                    {filtersActive
                      ? `${matchingRoomCount} of ${rooms.length} eligible rooms match across ${roomsByDeck.length} decks`
                      : `${rooms.length} eligible rooms across ${roomsByDeck.length} decks · ${activeDeckRooms.length} on Deck ${activeDeck}`}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: filledCount === qty ? '#047857' : WF.ink, fontFamily: 'ui-monospace, monospace' }}>{filledCount} / {qty}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: WF.inkFaint }}>Rooms assigned</div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: SP.md, flexWrap: 'wrap',
                padding: '8px 12px', borderBottom: `1px solid ${WF.line}`, background: '#FFFFFF'
              }}>
                <button
                  onClick={onAutoAssign}
                  title="Assign the first available room in each cabin’s selected category, then distribute the party"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 30, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    border: `1px solid ${WF.accentLine}`,
                    background: WF.accentTint,
                    color: WF.accent,
                    cursor: 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap'
                  }}>
                  <AutoAssignIcon size={13} />
                  Auto-assign rooms
                </button>
                <div style={{ width: 1, height: 20, background: WF.line }} />
                <SegmentedFilter
                  label="Ship position"
                  value={locFilter}
                  onChange={setLocFilter}
                  activeColor={WF.accent}
                  options={['fwd', 'mid', 'aft'].map(loc => ({ key: loc, label: LOC_LABELS[loc] }))} />
                <div style={{ width: 1, height: 20, background: WF.line }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ marginRight: 4, fontSize: 12, fontWeight: 600, color: WF.inkSoft, whiteSpace: 'nowrap' }}>Filters</span>
                  <FeatureChip
                    label="All"
                    active={activeFilters.size === 0}
                    onClick={() => setActiveFilters(new Set())} />
                  {ROOM_FEATURES.map((f) => (
                    <FeatureChip
                      key={f.key}
                      icon={f.key}
                      label={f.label}
                      active={activeFilters.has(f.key)}
                      onClick={() => toggleFilter(f.key)} />
                  ))}
                </div>
                {filtersActive && (
                  <button
                    onClick={() => { setLocFilter(null); setActiveFilters(new Set()); }}
                    style={{
                      minHeight: 30, padding: '0 8px', border: 'none', background: 'transparent',
                      color: WF.accent, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
                    }}>Clear filters</button>
                )}
              </div>

              <div style={{ background: WF.fill }}>
                <div
                  role="tablist"
                  aria-label="Available decks"
                  style={{
                    display: 'grid', gridTemplateColumns: `repeat(${roomsByDeck.length}, minmax(0, 1fr))`,
                    gap: 8, padding: 8, borderBottom: `1px solid ${WF.line}`, background: '#FFFFFF'
                  }}>
                  {roomsByDeck.map(({ deck, rooms: deckRooms }) => {
                    const selected = deck === activeDeck;
                    const deckMatches = deckRooms.filter(isRoomActive).length;
                    const deckAssigned = deckRooms.filter((room) => assignedRoomNums.has(room.num)).length;
                    return (
                      <button
                        key={deck}
                        id={`deck-tab-${activeRow.id}-${deck}`}
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`deck-panel-${activeRow.id}-${deck}`}
                        onClick={() => setActiveDeck(deck)}
                        style={{
                          minHeight: 48, padding: '8px 8px', borderRadius: RD.sm,
                          border: `1px solid ${selected ? WF.accent : WF.line}`,
                          background: selected ? WF.accent : WF.panel,
                          color: selected ? '#FFFFFF' : WF.ink, cursor: 'pointer',
                          fontFamily: 'inherit', textAlign: 'left'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>Deck {deck}</span>
                          <span style={{
                            minWidth: 22, padding: '4px 4px', borderRadius: 999, textAlign: 'center',
                            background: selected ? 'rgba(255,255,255,0.14)' : WF.fill,
                            fontSize: 12, fontWeight: 700, fontFamily: 'ui-monospace, monospace'
                          }}>{filtersActive ? `${deckMatches}/${deckRooms.length}` : deckRooms.length}</span>
                        </div>
                        <div style={{ marginTop: 4, minHeight: 13, fontSize: 12, color: selected ? '#CBD5E1' : WF.inkSoft }}>
                          {deckAssigned > 0 ? `✓ ${deckAssigned} assigned` : filtersActive ? `${deckMatches} matching` : 'Available rooms'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <section
                  id={`deck-panel-${activeRow.id}-${activeDeck}`}
                  role="tabpanel"
                  aria-labelledby={`deck-tab-${activeRow.id}-${activeDeck}`}
                  style={{
                    width: 'auto', margin: '12px 16px 12px',
                    border: `1px solid ${WF.line}`, borderRadius: RD.sm,
                    background: '#FFFFFF', overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.08)'
                  }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '8px 12px', borderBottom: `1px solid ${WF.line}`, background: WF.panel
                  }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>Deck {activeDeck}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: WF.inkSoft }}>
                        {filtersActive ? `${activeDeckMatches.length} matching · ${activeDeckRooms.length} total` : `${activeDeckRooms.length} eligible rooms`}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: WF.inkSoft }}>
                      10 Forward · 9 Mid Ship · 9 Aft Ship
                      {activeDeckAssignedCount > 0 ? ` · ${activeDeckAssignedCount} assigned` : ''}
                    </div>
                  </div>

                  <div
                    className="stateroom-deck-scroll"
                    style={{ maxHeight: 330, overflowY: 'auto', scrollbarGutter: 'auto', padding: 12, background: WF.fill }}>
                    {visibleActiveDeckRooms.length > 0 ? (
                      <div
                        role="group"
                        aria-label={`Rooms on deck ${activeDeck}`}
                        style={{
                          display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                          gap: 8, alignItems: 'stretch'
                        }}>
                        {visibleActiveDeckRooms.map(renderRoomOption)}
                      </div>
                    ) : (
                      <div role="status" style={{
                        minHeight: 116, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                        border: `1px dashed ${WF.line}`, borderRadius: RD.sm, background: '#FFFFFF'
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>No rooms match on Deck {activeDeck}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>Choose another deck or clear the current filters.</div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: SP.lg,
          padding: `${SP.md}px ${SP.lg}px`, borderTop: `1px solid ${WF.line}`, background: WF.panel
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP.sm, marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px', fontSize: 14, fontWeight: 600, borderRadius: RD.sm,
                border: `1px solid ${WF.line}`, background: WF.panel, color: WF.ink,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Cancel</button>
            {/* Gate stays rooms-only, as it always was — a cabin may legitimately
                be confirmed before its guests are distributed. The title just
                says so out loud instead of blocking. */}
            <button
              onClick={() => canConfirm && onConfirm()}
              disabled={!canConfirm}
              title={overAssigned
                ? `${totalAssignedGuests} guests placed but the party has ${totalParty} — remove ${totalAssignedGuests - totalParty}`
                : filledCount !== qty ? 'Assign a room to every cabin first'
                : configuredCount < qty ? 'Some cabins have no guests assigned yet' : undefined}
              style={{
                padding: '8px 20px', fontSize: 14, fontWeight: 700, borderRadius: RD.sm,
                border: 'none', background: canConfirm ? TEAL.base : WF.fillStrong,
                color: canConfirm ? '#fff' : WF.inkFaint,
                cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}>Confirm Selection</button>
          </div>
        </div>

        {detailRoom && (
          <CabinDetailsDialog
            room={detailRoom.room}
            row={activeRow}
            onClose={() => setDetailRoom(null)} />
        )}
      </div>
    </div>
  );
}

// ── Segmented filter control — compact "All / option / option" group used by
// Category in the matrix toolbar and Location in the room picker ──
function SegmentedFilter({ label, options, value, onChange, activeColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: WF.inkSoft, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <div
        role="group"
        aria-label={`${label} filter`}
        style={{ display: 'inline-flex', border: `1px solid ${WF.line}`, borderRadius: 7, overflow: 'hidden', background: WF.panel }}>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
          style={{
            padding: '4px 12px', fontSize: 12, fontWeight: value === null ? 700 : 500,
            border: 'none', borderRight: `1px solid ${WF.line}`,
            background: value === null ? activeColor : 'transparent',
            color: value === null ? '#fff' : WF.inkSoft,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s'
          }}>All</button>
        {options.map(({ key, label: optLabel }, i) => {
          const on = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(on ? null : key)}
              aria-pressed={on}
              style={{
                padding: '4px 12px', fontSize: 12, fontWeight: on ? 700 : 500,
                border: 'none', borderRight: i < options.length - 1 ? `1px solid ${WF.line}` : 'none',
                background: on ? activeColor : 'transparent',
                color: on ? '#fff' : WF.inkSoft,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap'
              }}>{optLabel}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Cabin record helpers ──────────────────────────────────────────
// Builds the lossless per-cabin record the supplements step needs. Reads
// roomsBySlot by slot index directly rather than walking a filtered room
// list, so cabin ids stay stable even if a middle slot is empty.
const buildRowCabins = (row, sel, qty) =>
  Array.from({ length: qty }, (_, slot) => ({
    slot,
    num: ((sel && sel.roomsBySlot) || {})[slot],
    categoryRow: categoryRowForSlot(row, (sel && sel.categoryBySlot) || {}, slot),
  })).
    filter((x) => x.num).
    map(({ slot, num, categoryRow }) => ({
      id: `${row.id}-${slot}`,
      rowId: row.id,
      categoryRowId: categoryRow.id,
      cat: categoryRow.cat,
      label: categoryRow.label,
      num,
      // A cabin can legitimately be confirmed with no guests distributed yet,
      // so default every category before spreading whatever was entered.
      guests: { adults: 0, youngAdults: 0, children: 0, infants: 0, ...(((sel && sel.cabinGuests) || {})[slot] || {}) }
    }));

// Replaces this row's cabins while preserving other categories', then sorts
// into a stable order so guestKey→cabin allocation stays deterministic.
const mergeRowCabins = (prev, rowId, rowCabins) =>
  [...(prev || []).filter((c) => c.rowId !== rowId), ...rowCabins].sort((a, b) =>
    (STATEROOM_ROWS.findIndex((r) => r.id === a.rowId) - STATEROOM_ROWS.findIndex((r) => r.id === b.rowId)) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

// Rebuilds the matrix's local UI state (qty selected, room-per-slot picks,
// confirmed room numbers) from the persisted `cabins` record. Without this,
// every remount of the matrix — switching away from and back to this tab,
// or bouncing through Step 3/4 and back — starts these mirrors blank even
// though the real cabin assignment is still sitting in `s.cabins`, making a
// confirmed stateroom look unassigned and inviting the user to redo it.
const deriveMatrixStateFromCabins = (cabins) => {
  const qtys = {};
  const selections = {};
  const confirmedRooms = {};
  (cabins || []).forEach((c) => {
    const slot = parseInt(c.id.slice(c.rowId.length + 1), 10);
    if (!selections[c.rowId]) selections[c.rowId] = { categoryBySlot: {}, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
    selections[c.rowId].categoryBySlot[slot] = c.categoryRowId || c.rowId;
    selections[c.rowId].roomsBySlot[slot] = c.num;
    selections[c.rowId].cabinGuests[slot] = c.guests;
    qtys[c.rowId] = (qtys[c.rowId] || 0) + 1;
  });
  Object.keys(selections).forEach((rowId) => {
    confirmedRooms[rowId] = Object.keys(selections[rowId].roomsBySlot)
      .sort((a, b) => a - b)
      .map((slot) => selections[rowId].roomsBySlot[slot]);
  });
  return { qtys, selections, confirmedRooms };
};

// ── Main matrix component ─────────────────────────────────────────
function StateRoomMatrix({ update, s, onConfirmRooms }) {
  const [catFilter, setCatFilter] = React.useState(null);
  const [qtys, setQtys] = React.useState(() => deriveMatrixStateFromCabins(s.cabins).qtys);
  const [openPanel, setOpenPanel] = React.useState(null);
  const [selections, setSelections] = React.useState(() => deriveMatrixStateFromCabins(s.cabins).selections); // origin rowId → { categoryBySlot, roomsBySlot, cabinGuests, activeSlot }
  const [confirmedRooms, setConfirmedRooms] = React.useState(() => deriveMatrixStateFromCabins(s.cabins).confirmedRooms);

  const filteredRows = STATEROOM_ROWS.filter(r => !catFilter || r.cat === catFilter);
  const categoryInventory = ['IS', 'OV', 'BAL', 'STE'].reduce((totals, cat) => {
    totals[cat] = STATEROOM_ROWS.filter((row) => row.cat === cat).reduce((sum, row) => sum + row.total, 0);
    return totals;
  }, {});
  const assignedRoomCount = Object.values(confirmedRooms).reduce((sum, rooms) => sum + rooms.length, 0);

  // Single write path for the cabin record. Always reconciles supplement
  // assignments in the same update so a removed cabin can never leave an
  // orphaned `cabin:` charge behind.
  const writeCabins = (nextCabins, extra) => {
    const pruned = pruneCabinSuppAssignments(s.suppAssignments, nextCabins);
    update({ cabins: nextCabins, ...pruned, ...(extra || {}) });
  };

  // Drops every cabin belonging to a row that's been emptied or abandoned.
  const dropRowCabins = (rowId) => {
    writeCabins((s.cabins || []).filter((c) => c.rowId !== rowId));
  };

  const handleQtyChange = (row, rawVal) => {
    // Clamp here as well as in the control: the matrix's own row stepper calls
    // this directly, so a category with 2 rooms left must not accept 3 cabins
    // from either entry point.
    let val = Math.max(0, Math.min(rawVal, row.total));
    const prev = qtys[row.id] || 0;
    // First cabin of a category: size it to the guests still needing a berth
    // rather than opening at 1. A party of 10 against a 2-berth category used to
    // open one column, fill it, and only then reveal — eight steppers later —
    // that the category could never hold them.
    if (prev === 0 && val > 0) {
      const seats = cabinSeats(cabinCapacity(row));
      const seated = assignedInOtherRows(selections, row.id);
      const unseated = GUEST_TYPES.reduce((n, t) => n + ((s.guests || ZERO_GUESTS)[t.key] || 0) - (seated[t.key] || 0), 0);
      if (seats > 0 && unseated > 0) val = Math.min(row.total, Math.max(val, Math.ceil(unseated / seats)));
    }
    if (val === prev) return;
    setQtys(q => ({ ...q, [row.id]: val }));
    if (val > 0) {
      setSelections(sel => {
        const cur = sel[row.id] || { categoryBySlot: {}, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
        const categoryBySlot = {};
        const roomsBySlot = {};
        const cabinGuests = {};
        for (let i = 0; i < val; i++) {
          categoryBySlot[i] = (cur.categoryBySlot && cur.categoryBySlot[i]) || row.id;
          if (cur.roomsBySlot[i] != null) roomsBySlot[i] = cur.roomsBySlot[i];
          if (cur.cabinGuests[i] != null) cabinGuests[i] = cur.cabinGuests[i];
        }
        const activeSlot = cur.activeSlot < val ? cur.activeSlot : 0;
        return { ...sel, [row.id]: { categoryBySlot, roomsBySlot, cabinGuests, activeSlot } };
      });
      if (prev === 0) setOpenPanel(row.id);
    }
    // close panel and clear rooms if qty drops to 0
    if (val === 0) {
      setOpenPanel(null);
      setSelections(sel => { const n = { ...sel }; delete n[row.id]; return n; });
      setConfirmedRooms(r => { const n = { ...r }; delete n[row.id]; return n; });
      dropRowCabins(row.id);
    }
  };

  // Open assignment from the category row and keep cabin-count decisions in
  // the dialog where their guest and room impact is visible.
  const openCategoryAssignment = (row) => {
    const currentQty = qtys[row.id] || 0;
    if (row.total < 1) return;
    if (currentQty < 1) {
      setQtys((current) => ({ ...current, [row.id]: 1 }));
      setSelections((current) => ({
        ...current,
        [row.id]: { categoryBySlot: { 0: row.id }, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 },
      }));
    }
    setOpenPanel(row.id);
  };

  const handleToggleRoom = (rowId, roomNum, qty) => {
    setSelections(sel => {
      const cur = sel[rowId] || { categoryBySlot: {}, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
      const activeSlot = cur.activeSlot || 0;
      const roomsBySlot = { ...cur.roomsBySlot };
      const ownerEntry = Object.entries(roomsBySlot).find(([, num]) => num === roomNum);
      const ownerSlot = ownerEntry ? parseInt(ownerEntry[0], 10) : null;
      let nextActiveSlot = activeSlot;
      if (ownerSlot === activeSlot) {
        // clicking the room already assigned to the active cabin — remove it
        delete roomsBySlot[activeSlot];
      } else {
        // free it from wherever it was, then assign to the active cabin
        if (ownerSlot != null) delete roomsBySlot[ownerSlot];
        roomsBySlot[activeSlot] = roomNum;
        // auto-advance to the next unfilled cabin so the user can keep
        // assigning rooms without manually re-selecting each slot
        if (qty > 0) {
          for (let i = 1; i < qty; i++) {
            const candidate = (activeSlot + i) % qty;
            if (!roomsBySlot[candidate]) { nextActiveSlot = candidate; break; }
          }
        }
      }
      return { ...sel, [rowId]: { ...cur, roomsBySlot, activeSlot: nextActiveSlot } };
    });
  };

  // Fills rooms *and* spreads the party across cabins. It used to do only the
  // former, and was gated on the guests already being placed by hand — which
  // left the genuinely tedious half of a multi-cabin booking (balancing 10
  // guests across 3 rooms without overfilling any) entirely manual.
  const handleAutoAssign = (rowId, row, qty) => {
    setSelections(sel => {
      const cur = sel[rowId] || { categoryBySlot: {}, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
      const categoryBySlot = { ...(cur.categoryBySlot || {}) };
      const usedRooms = new Set();
      Object.entries(sel || {}).forEach(([groupId, selection]) => {
        Object.entries((selection && selection.roomsBySlot) || {}).forEach(([slotKey, num]) => {
          if (!num || groupId === rowId) return;
          usedRooms.add(num);
        });
      });
      const roomsBySlot = {};
      Array.from({ length: qty }, (_, slot) => slot).forEach((slot) => {
        const slotRow = categoryRowForSlot(row, categoryBySlot, slot);
        categoryBySlot[slot] = slotRow.id;
        const room = roomsForRow(slotRow).find((candidate) => !usedRooms.has(candidate.num));
        if (!room) return;
        roomsBySlot[slot] = room.num;
        usedRooms.add(room.num);
      });

      // Seed empty cabins, then deal guests out one at a time into whichever
      // cabin currently has the most room left. Adults go first so every cabin
      // that can have one does — dealing children first would strand minors in
      // an adult-less cabin, which is the rule the table warns about.
      const cabinGuests = Array.from({ length: qty }, () => ({ ...ZERO_GUESTS }));
      // Only deal out guests who don't already have a berth in another
      // category, otherwise auto-assign re-seats the whole party here and
      // double-books everyone already placed elsewhere.
      const party = s.guests || ZERO_GUESTS;
      const seated = assignedInOtherRows(sel, rowId);
      GUEST_TYPES.forEach(({ key }) => {
        const toPlace = Math.max(0, (party[key] || 0) - (seated[key] || 0));
        for (let n = 0; n < toPlace; n++) {
          // Every cabin is a candidate — there's no capacity ceiling to filter
          // against. Still prefer a cabin with no adult yet when placing
          // adults, so the first pass spreads them one-per-cabin rather than
          // piling into cabin 1, and otherwise prefer the least-full cabin.
          const candidates = cabinGuests.map((g, i) => ({ g, i }));
          if (!candidates.length) break;  // qty is 0 — nothing to deal into
          const best = candidates.reduce((a, b) => {
            if (key === 'adults') {
              const aHas = a.g.adults > 0, bHas = b.g.adults > 0;
              if (aHas !== bHas) return aHas ? b : a;
            }
            return cabinGuestTotal(b.g) < cabinGuestTotal(a.g) ? b : a;
          });
          best.g[key] += 1;
        }
      });

      const nextGuests = {};
      cabinGuests.forEach((g, i) => { nextGuests[i] = g; });
      return { ...sel, [rowId]: { ...cur, categoryBySlot, roomsBySlot, cabinGuests: nextGuests } };
    });
  };

  const handleSelectSlot = (rowId, slotIdx) => {
    setSelections(sel => ({ ...sel, [rowId]: { ...(sel[rowId] || { categoryBySlot: {}, roomsBySlot: {}, cabinGuests: {} }), activeSlot: slotIdx } }));
  };

  const handleGuestChange = (rowId, slotIdx, field, val) => {
    setSelections(sel => {
      const cur = sel[rowId];
      if (!cur) return sel;
      const guests = { ...(cur.cabinGuests[slotIdx] || { adults: 0, youngAdults: 0, children: 0, infants: 0 }), [field]: Math.max(0, val) };
      return { ...sel, [rowId]: { ...cur, cabinGuests: { ...cur.cabinGuests, [slotIdx]: guests } } };
    });
  };

  const handleConfirmRoom = (rowId, row, qty) => {
    const cur = selections[rowId] || { categoryBySlot: {}, roomsBySlot: {} };
    const roomNums = Array.from({ length: qty }, (_, i) => cur.roomsBySlot[i]).filter(Boolean);
    setConfirmedRooms(r => ({ ...r, [row.id]: roomNums }));
    setOpenPanel(null);
    // Persist the full per-cabin record (rooms + guest split) so the
    // supplements step can group its per-guest assignments by room. The first
    // cabin remains the base-fare summary while every cabin record retains its
    // own selected category.
    const rowCabins = buildRowCabins(row, cur, qty);
    writeCabins(
      mergeRowCabins(s.cabins, row.id, rowCabins),
      { cabinId: (rowCabins[0] && rowCabins[0].cat) || row.cat, selectedCabinNum: roomNums[0], selectedRoomCount: roomNums.length }
    );
    // auto-navigate to supplements tab after room confirmation
    if (onConfirmRooms) onConfirmRooms();
  };

  const handleBackPanel = (rowId) => {
    setQtys(q => ({ ...q, [rowId]: 0 }));
    setOpenPanel(null);
    setSelections(sel => { const n = { ...sel }; delete n[rowId]; return n; });
    dropRowCabins(rowId);
  };

  // Category is a per-cabin choice. Changing it keeps that cabin's guest split,
  // clears only its now-invalid room, and leaves every other cabin untouched.
  const handleSlotCategoryChange = (rowId, slotIdx, newRowId) => {
    const nextRow = STATEROOM_ROWS.find((candidate) => candidate.id === newRowId);
    if (!nextRow || nextRow.total < 1) return;
    setSelections(sel => {
      const cur = sel[rowId];
      if (!cur || categoryIdForSlot(rowId, cur, slotIdx) === newRowId) return sel;
      const roomsBySlot = { ...(cur.roomsBySlot || {}) };
      delete roomsBySlot[slotIdx];
      return {
        ...sel,
        [rowId]: {
          ...cur,
          categoryBySlot: { ...(cur.categoryBySlot || {}), [slotIdx]: newRowId },
          roomsBySlot,
          activeSlot: slotIdx,
        },
      };
    });
  };

  const TH = ({ children, right }) => (
    <th scope="col" style={{
      padding: '8px 4px', fontSize: 12, lineHeight: '16px', fontWeight: 600,
      color: WF.inkLabel, textAlign: right ? 'center' : 'left',
      borderBottom: `1px solid ${WF.line}`, whiteSpace: 'nowrap', verticalAlign: 'bottom', background: WF.fill
    }}>{children}</th>
  );

  return (
    <div className="assign-stateroom-portable" style={{
      border: `1px solid ${WF.line}`, borderRadius: 9, overflow: 'hidden',
      background: '#FFFFFF', boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
    }}>
      <style>{`
        .assign-stateroom-portable {
          color: ${WF.ink};
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 20px;
        }
        .assign-stateroom-portable *,
        .assign-stateroom-portable *::before,
        .assign-stateroom-portable *::after { box-sizing: border-box; }
        .assign-stateroom-portable button,
        .assign-stateroom-portable input,
        .assign-stateroom-portable textarea,
        .assign-stateroom-portable select { font: inherit; }
        .assign-stateroom-portable button:focus-visible,
        .assign-stateroom-portable input:focus-visible,
        .assign-stateroom-portable [role="button"]:focus-visible,
        .assign-stateroom-portable [role="tab"]:focus-visible {
          outline: 2px solid ${WF.accent};
          outline-offset: 2px;
        }
        .assign-stateroom-portable .stateroom-category-row[data-interactive="true"]:hover,
        .assign-stateroom-portable .stateroom-category-row[data-interactive="true"]:focus-within {
          background: ${WF.fill} !important;
        }
        .assign-stateroom-portable .stateroom-category-row[data-interactive="true"]:focus-within {
          box-shadow: inset 0 0 0 2px ${WF.accent} !important;
        }
        .assign-stateroom-portable .stateroom-category-row[data-confirmed="true"]:hover,
        .assign-stateroom-portable .stateroom-category-row[data-confirmed="true"]:focus-within {
          background: ${WF.accentTint} !important;
        }
        .assign-stateroom-portable .stateroom-modal-scroll,
        .assign-stateroom-portable .stateroom-deck-scroll {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        .assign-stateroom-portable .stateroom-modal-scroll::-webkit-scrollbar { width: 6px; }
        .assign-stateroom-portable .stateroom-deck-scroll::-webkit-scrollbar { width: 5px; }
        .assign-stateroom-portable .stateroom-modal-scroll::-webkit-scrollbar-track,
        .assign-stateroom-portable .stateroom-deck-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin-block: 8px;
        }
        .assign-stateroom-portable .stateroom-modal-scroll::-webkit-scrollbar-thumb,
        .assign-stateroom-portable .stateroom-deck-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.38);
          border-radius: 999px;
        }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        padding: '12px', background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: WF.ink }}>
            Choose a stateroom category
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>Live fare inventory by occupancy · select a row to choose cabins and rooms</div>
        </div>
        {assignedRoomCount > 0 && (
          <div
            role="status"
            aria-label={`${assignedRoomCount} ${assignedRoomCount === 1 ? 'room' : 'rooms'} assigned`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
              padding: '8px 8px', borderRadius: 7,
              border: `1px solid ${WF.accentLine}`,
              background: WF.accentTint, color: WF.ink
            }}>
            <span aria-hidden="true" style={{
              width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 999, background: WF.accent, color: '#FFFFFF',
              fontSize: 12, fontWeight: 700, lineHeight: 1
            }}>✓</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: WF.inkSoft, whiteSpace: 'nowrap' }}>
              <strong style={{ color: WF.ink }}>{assignedRoomCount}</strong> {assignedRoomCount === 1 ? 'room' : 'rooms'} assigned
            </span>
          </div>
        )}
      </div>
      {/* The portable product select keeps this filter compact and keyboard
          complete while preserving the inventory count for each option. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '8px 12px', background: '#FFFFFF', borderBottom: `1px solid ${WF.line}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Cabin type</span>
          <PortableSelect
            value={catFilter || ''}
            onValueChange={(nextValue) => setCatFilter(nextValue || null)}
            ariaLabel="Filter staterooms by cabin type"
            width={200}
            options={[
              { value: '', label: 'All types', meta: STATEROOM_ROWS.reduce((sum, row) => sum + row.total, 0) },
              ...['IS', 'OV', 'BAL', 'STE'].map((cat) => ({ value: cat, label: CAT_LABELS[cat], meta: categoryInventory[cat] })),
            ]}
          />
        </div>
      </div>

      {/* ── Table — grows to its full height with the page. overflowX stays so the
             wide column set scrolls sideways here rather than widening the page. ── */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <TH>Category name</TH>
              <TH right>
                <span style={{ display: 'block', color: WF.inkLabel }}>Price</span>
                <span style={{ display: 'block', color: WF.inkFaint, fontWeight: 400 }}>Double occupancy</span>
              </TH>
              <TH right>Total</TH>
              <TH right>Single</TH>
              <TH right>Double</TH>
              <TH right>Double + infant</TH>
              <TH right>Triple</TH>
              <TH right>Triple + infant</TH>
              <TH right>Quad</TH>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const qty = qtys[row.id] || 0;
              const confirmed = confirmedRooms[row.id];
              const soldOut = row.total === 0;
              const interactive = !soldOut;
              const categoryName = row.label.includes(' – ') ? row.label.split(' – ')[0] : row.label;
              const actionLabel = confirmed
                ? `Edit ${confirmed.length} assigned ${confirmed.length === 1 ? 'room' : 'rooms'} for ${row.label}`
                : `Select ${row.label} and choose cabin count`;
              return (
                <React.Fragment key={row.id}>
                  <tr
                    className="stateroom-category-row"
                    data-interactive={interactive ? 'true' : 'false'}
                    data-confirmed={confirmed ? 'true' : 'false'}
                    onClick={interactive ? () => openCategoryAssignment(row) : undefined}
                    style={{
                      background: confirmed ? WF.accentTint : soldOut ? WF.fill : WF.panel,
                      boxShadow: confirmed ? `inset 3px 0 ${WF.accent}` : 'none',
                      opacity: soldOut ? 0.66 : 1,
                      transition: 'background 0.12s', cursor: interactive ? 'pointer' : 'not-allowed'
                    }}>
                    {/* Category name */}
                    <td style={{ position: 'relative', padding: '8px', borderBottom: `1px solid ${WF.lineSoft}`, minWidth: 188 }}>
                      {interactive && (
                        <button
                          type="button"
                          aria-label={actionLabel}
                          onClick={(event) => { event.stopPropagation(); openCategoryAssignment(row); }}
                          style={{
                            position: 'absolute', width: 1, height: 1, padding: 0, margin: 0,
                            overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0
                          }}>
                          {actionLabel}
                        </button>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ width: 9, height: 28, borderRadius: 3, background: row.color, flexShrink: 0 }}></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{categoryName}</div>
                            <span style={{
                              padding: '4px 4px', borderRadius: 4, border: `1px solid ${WF.line}`,
                              background: '#FFFFFF', fontSize: 12, fontWeight: 700,
                              color: WF.inkSoft, fontFamily: 'ui-monospace, monospace'
                            }}>{row.id}</span>
                          </div>
                          {soldOut && (
                            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: BAD }}>Unavailable</div>
                          )}
                          {confirmed && (
                            <div style={{ fontSize: 12, color: WF.accentInk, fontWeight: 700, marginTop: 4, cursor: 'pointer' }}>
                              ✓ {confirmed.length} assigned · {confirmed.join(', ')} <span style={{ color: WF.inkFaint, fontWeight: 600 }}>· Edit rooms</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
                        ${row.price.toLocaleString()}.00
                      </span>
                    </td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.total} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.single} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.double} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.dbinf} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.triple} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.trinf} /></td>
                    <td style={{ padding: '8px 4px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.quad} /></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Room-selection modal — rendered outside the table so it never
          grows the table or pushes rows off-screen ── */}
      {openPanel && (() => {
        const row = STATEROOM_ROWS.find(r => r.id === openPanel);
        if (!row) return null;
        const qty = qtys[row.id] || 0;
        if (qty < 1) return null;
        const sel = selections[row.id] || { categoryBySlot: { 0: row.id }, roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
        const activeSlot = sel.activeSlot || 0;
        const activeCategoryId = categoryIdForSlot(row.id, sel, activeSlot);
        const taken = roomsTakenByOtherAssignments(selections, row.id, activeSlot, activeCategoryId);
        return (
          <SelectRoomPanel
            row={row}
            qty={qty}
            categoryBySlot={sel.categoryBySlot || {}}
            roomsBySlot={sel.roomsBySlot}
            cabinGuests={sel.cabinGuests}
            activeSlot={activeSlot}
            partyGuests={s.guests}
            otherAssigned={assignedInOtherRows(selections, row.id)}
            takenRooms={taken}
            onToggleRoom={(roomNum) => handleToggleRoom(row.id, roomNum, qty)}
            onAutoAssign={() => handleAutoAssign(row.id, row, qty)}
            onSelectSlot={(slotIdx) => handleSelectSlot(row.id, slotIdx)}
            onGuestChange={(slotIdx, field, val) => handleGuestChange(row.id, slotIdx, field, val)}
            onConfirm={() => handleConfirmRoom(row.id, row, qty)}
            onQtyChange={(val) => handleQtyChange(row, val)}
            onSwitchCategory={(slotIdx, newRowId) => handleSlotCategoryChange(row.id, slotIdx, newRowId)}
            onBack={() => handleBackPanel(row.id)}
            onClose={() => setOpenPanel(null)}
          />
        );
      })()}
    </div>
  );
}

export const AssignStateroom = StateRoomMatrix;

export {
  StateRoomMatrix,
  SelectRoomPanel,
  STATEROOM_ROWS,
  STATEROOM_ROOMS_BY_ROW,
  ROOM_FEATURES,
};

export const DEMO_BOOKING_STATE = {
  guests: { adults: 4, youngAdults: 2, children: 2, infants: 2 },
  cabins: [],
  suppAssignments: {},
  selectedSupps: {},
  cabinId: null,
  selectedCabinNum: null,
  selectedRoomCount: 0,
};

export default AssignStateroom;
