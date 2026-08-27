// Stateroom Assignment Matrix — Live Global Category Availability
// Table + quantity controls + select room panel + accessibility filters

// ── Data ──────────────────────────────────────────────────────────
const STATEROOM_ROWS = [
  { id: 'I6',  cat: 'IS',  label: 'Interior Stateroom – I6',    color: '#F59E0B', price: 472,  total: 2,  single: 0, double: 2, dbinf: 0, triple: 0, quad: 0, location: 'mid' },
  { id: 'I7',  cat: 'IS',  label: 'Interior Stateroom – I7',    color: '#EAB308', price: 472,  total: 6,  single: 0, double: 5, dbinf: 0, triple: 1, quad: 0, location: 'aft' },
  { id: 'I8',  cat: 'IS',  label: 'Interior Stateroom – I8',    color: '#84CC16', price: 472,  total: 1,  single: 0, double: 1, dbinf: 0, triple: 0, quad: 0, location: 'fwd' },
  { id: 'O4',  cat: 'OV',  label: 'Ocean View – O4',            color: '#A855F7', price: 512,  total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, quad: 0, location: 'mid' },
  { id: 'O5',  cat: 'OV',  label: 'Ocean View – O5',            color: '#EF4444', price: 512,  total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, quad: 0, location: 'fwd' },
  { id: 'I8G', cat: 'BAL', label: 'Category I8-G',              color: '#8B5CF6', price: 499,  total: 13, single: 0, double: 0, dbinf: 0, triple: 13, quad: 0, location: 'mid' },
  { id: 'B2',  cat: 'BAL', label: 'Balcony Deluxe – B2',        color: '#6366F1', price: 549,  total: 8,  single: 0, double: 4, dbinf: 2, triple: 2, quad: 0, location: 'fwd' },
  { id: 'B3',  cat: 'BAL', label: 'Balcony Premium – B3',       color: '#0EA5E9', price: 579,  total: 5,  single: 0, double: 3, dbinf: 0, triple: 2, quad: 0, location: 'aft' },
  { id: 'S1',  cat: 'STE', label: 'Grand Terrace Suite – S1',   color: '#7C3AED', price: 1932, total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, quad: 0, location: 'fwd' },
  { id: 'S3',  cat: 'STE', label: 'Jr Suite – S3',              color: '#6D28D9', price: 1732, total: 0,  single: 0, double: 0, dbinf: 0, triple: 0, quad: 0, location: 'mid' },
  { id: 'S5',  cat: 'STE', label: 'Owner Suite – S5',           color: '#5B21B6', price: 2250, total: 2,  single: 0, double: 2, dbinf: 0, triple: 0, quad: 0, location: 'aft' },
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
// stocks — a `quad` room sleeps 4, `triple` 3, `double` 2. `dbinf` is
// "double + infant", so a category stocking those lets one infant travel in a
// cot *beyond* the berths rather than consuming one. Display-only: see above.
const cabinCapacity = (row) => ({
  berths: row.quad > 0 ? 4 : row.triple > 0 ? 3 : (row.double > 0 || row.dbinf > 0) ? 2 : row.single > 0 ? 1 : 4,
  cotInfants: row.dbinf > 0 ? 1 : 0,
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
const roomsTakenByOtherRows = (selections, exceptRowId, cat) => {
  const out = [];
  Object.keys(selections || {}).forEach((rowId) => {
    if (rowId === exceptRowId) return;
    const other = STATEROOM_ROWS.find((r) => r.id === rowId);
    if (!other || other.cat !== cat) return;
    Object.values((selections[rowId] && selections[rowId].roomsBySlot) || {})
      .forEach((num) => { if (num) out.push(num); });
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

function RoomFeatureEmoji({ feature, size = 13 }) {
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
// Sits above the cabin table: the per-type got/need pairs are the only place
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
      gap: SP.md, padding: `${SP.sm + 2}px ${SP.lg}px`, borderRadius: RD.md,
      background: over ? '#FEF2F2' : complete ? '#F0FDF4' : '#FFFBEB',
      border: `1px solid ${over ? '#FECACA' : complete ? '#BBF7D0' : '#FDE68A'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: SP.sm }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: tone }}>
          {totalAssigned} of {totalParty} guest{totalParty === 1 ? '' : 's'} assigned
        </span>
        <span style={{ fontSize: 11.5, color: tone }}>
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
            <div key={key} style={{ fontSize: 11.5, color: done ? WF.inkSoft : '#92400E', whiteSpace: 'nowrap' }}>
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
        fontSize: 13, fontWeight: 700, color: value > 0 ? WF.ink : WF.inkFaint,
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
function CabinAssignmentTable({ qty, roomsBySlot, cabinGuests, activeSlot, partyGuests, otherAssigned, cap, onSelectSlot, onGuestChange }) {
  const TYPES = [
    { key: 'adults', icon: '🧑', label: 'Adults', sub: 'Age 21+' },
    { key: 'youngAdults', icon: '🧑', label: 'Young Adults', sub: 'Age 13-21' },
    { key: 'children', icon: '🧒', label: 'Children', sub: 'Age 3-12' },
    { key: 'infants', icon: '👶', label: 'Infants', sub: 'Age 0-3' }
  ];
  const LABEL_COL = 132;
  const CABIN_COL = 112;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11, color: WF.inkSoft }}>
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
                  padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  color: WF.inkLabel, textTransform: 'uppercase', background: '#F8FAFC', borderBottom: `1px solid ${WF.line}`,
                  boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                }}>Guest Type</th>
                {Array.from({ length: qty }, (_, i) => {
                  const roomNum = roomsBySlot[i];
                  const isActive = activeSlot === i;
                  const v = validateCabin(cabinGuests[i], cap);
                  return (
                    <th
                      key={i}
                      onClick={() => onSelectSlot(i)}
                      // Keyboard-reachable. As a clickable <th> this column head
                      // could previously only be reached with a mouse.
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`Cabin ${i + 1}${roomNum ? `, room ${roomNum}` : ', no room yet'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectSlot(i); }
                      }}
                      style={{
                        padding: `${SP.sm}px ${SP.sm}px`, textAlign: 'center', cursor: 'pointer',
                        background: isActive ? TEAL.tint : '#F8FAFC',
                        borderBottom: `2px solid ${isActive ? TEAL.base : WF.line}`,
                        borderLeft: `1px solid ${WF.lineSoft}`,
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F1F5F9'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: isActive ? TEAL.base : WF.ink, marginBottom: 3, whiteSpace: 'nowrap' }}>
                        Cabin {i + 1}
                      </div>
                      {roomNum ? (
                        <div style={{
                          display: 'inline-flex', fontSize: 10.5, fontWeight: 700, color: TEAL.base,
                          background: '#fff', border: `1px solid ${TEAL.border}`, borderRadius: RD.sm, padding: '2px 8px',
                          fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap'
                        }}>{roomNum}</div>
                      ) : (
                        <div style={{ fontSize: 9.5, color: WF.inkFaint, fontStyle: 'italic', whiteSpace: 'nowrap' }}>No room yet</div>
                      )}
                      {/* Occupancy against this category's berth count, plus the
                          one-line reason when the cabin can't be sold as filled.
                          Fixed height so a flagged column doesn't jog the header
                          taller than its neighbours. */}
                      {v.warning && (
                        <div style={{ height: 13, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap' }}>⚠ {v.warning}</span>
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
                    padding: '10px 14px', borderBottom: ri < TYPES.length - 1 ? `1px solid ${WF.lineSoft}` : 'none',
                    boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: WF.ink, whiteSpace: 'nowrap' }}>{label}</div>
                        <div style={{ fontSize: 10, color: WF.inkSoft, whiteSpace: 'nowrap' }}>{sub}</div>
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
                        padding: `${SP.sm + 2}px ${SP.sm}px`, textAlign: 'center',
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
                  padding: `${SP.sm}px ${SP.lg - 2}px`, borderTop: `1px solid ${WF.line}`,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  color: WF.inkLabel, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  boxShadow: scrollState.left ? '2px 0 6px rgba(15,23,42,0.08)' : 'none'
                }}>In cabin</td>
                {Array.from({ length: qty }, (_, i) => {
                  const v = validateCabin(cabinGuests[i], cap);
                  const full = v.total > 0 && v.berths === cap.berths;
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
        gap: 5, height: 30, padding: '0 9px', borderRadius: 6,
        fontSize: 11, fontWeight: active ? 750 : 600, whiteSpace: 'nowrap', fontFamily: 'inherit',
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
function RoomCard({ room, state, ownerSlot, onClick, disabled }) {
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
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      aria-label={`Room ${room.num}, deck ${room.deck}, ${LOC_LABELS[room.loc]}, ${statusLabel}${
        tags.length ? `, ${tags.map((f) => f.label).join(', ')}` : ''
      }`}
      style={{
        display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%', height: '100%',
        minHeight: 90, padding: '9px 10px', borderRadius: RD.sm, fontFamily: 'inherit',
        border: `1px solid ${s.border}`, background: s.bg, opacity: s.opacity,
        cursor: disabled ? 'not-allowed' : 'pointer',
        // Inset ring instead of an outer glow: it thickens the selected edge
        // without changing the tile's footprint, so the grid stays on its rhythm.
        boxShadow: state === 'selected' ? `inset 0 0 0 1px ${WF.accent}` : '0 1px 1px rgba(15,23,42,0.03)',
        transition: 'background-color 0.12s, border-color 0.12s, box-shadow 0.12s'
      }}
      onMouseEnter={(e) => {
        if (!disabled && state !== 'selected') {
          e.currentTarget.style.borderColor = WF.accent;
          e.currentTarget.style.background = WF.accentTint;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && state !== 'selected') {
          e.currentTarget.style.borderColor = s.border;
          e.currentTarget.style.background = s.bg;
        }
      }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
        <div style={{
          fontSize: 15, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.2,
          color: s.num, fontFamily: 'ui-monospace, monospace'
        }}>{room.num}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0,
          color: statusColor, fontSize: 11, fontWeight: 750, whiteSpace: 'nowrap'
        }}>
          <span aria-hidden="true" style={{
            width: 6, height: 6, borderRadius: 999, flexShrink: 0,
            background: state === 'selected' ? WF.accent : state === 'available' ? '#059669' : WF.inkFaint
          }} />
          {statusLabel}
        </span>
      </div>

      <div style={{ marginTop: 7, fontSize: 11, fontWeight: 600, color: WF.inkSoft }}>
        {LOC_LABELS[room.loc]}
      </div>

      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, width: '100%' }}>
        {tags.length === 0 && (
          <span style={{ fontSize: 11, color: WF.inkFaint }}>Standard room</span>
        )}
        {tags.map((f) => (
          <span
            key={f.key}
            title={f.label}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              minHeight: 20, padding: '2px 5px', borderRadius: 4,
              border: `1px solid ${state === 'selected' ? WF.accentLine : WF.line}`,
              background: state === 'selected' ? '#FFFFFF' : WF.fill,
              color: state === 'selected' ? WF.accent : WF.inkSoft,
              fontSize: 11, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap'
            }}>
            <RoomFeatureEmoji feature={f.key} size={12} />
            {f.label}
          </span>
        ))}
      </div>
    </button>
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
function SelectRoomPanel({ row, qty, roomsBySlot, cabinGuests, activeSlot, partyGuests, otherAssigned, takenRooms, onToggleRoom, onAutoAssign, onSelectSlot, onGuestChange, onConfirm, onBack, onClose, onQtyChange, onSwitchCategory }) {
  // Joined rather than passed as an array so the memo has a stable dependency —
  // a fresh array literal every render would rebuild this list each time.
  const takenKey = (takenRooms || []).join(',');
  const selectedRoomKey = Object.values(roomsBySlot || {}).filter(Boolean).sort().join(',');
  const rooms = React.useMemo(() => {
    const taken = new Set(takenKey ? takenKey.split(',') : []);
    const selected = new Set(selectedRoomKey ? selectedRoomKey.split(',') : []);
    const rowPool = roomsForRow(row);
    // Keep a previously-saved room visible if it predates row-level inventory.
    // That lets an agent release or replace it instead of stranding an invisible
    // assignment after this normalization.
    const legacySelected = (STATEROOM_ROOMS[row.cat] || []).filter((room) =>
      selected.has(room.num) && !rowPool.some((candidate) => candidate.num === room.num));
    return [...rowPool, ...legacySelected].filter(r => !taken.has(r.num)).map(r => ({
      ...r,
      loc: r.loc || row.location,
      rollawayBed: r.rollawayBed !== undefined ? r.rollawayBed : parseInt(r.num, 10) % 4 === 0,
      connectedRoom: r.connectedRoom !== undefined ? r.connectedRoom : parseInt(r.num, 10) % 5 === 0,
    }));
  }, [row.id, selectedRoomKey, takenKey]);
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
  const [switcherOpen, setSwitcherOpen] = React.useState(false);

  const toggleFilter = (key) => setActiveFilters((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // A fare-row switch is a new inventory context. Return to the first deck and
  // clear stale filters instead of carrying a hidden Deck 8 / room-number query
  // into a category that has just opened.
  React.useEffect(() => {
    setActiveDeck(roomsByDeck[0]?.deck || STATEROOM_DECKS[0]);
    setLocFilter(null);
    setActiveFilters(new Set());
  }, [row.id]);

  // Filters AND together. Non-matches are hidden in the high-density deck
  // pane, while assigned rooms are re-added below so a filter can never strand
  // a room that still needs to be released or replaced.
  const isRoomActive = (room) => (!locFilter || room.loc === locFilter)
    && ROOM_FEATURES.every((f) => !activeFilters.has(f.key) || f.test(room));

  // Berth capacity for this category — informational only (the "X/Y berths"
  // readout and the "no adult" warning), never a Confirm gate or an add-block.
  const cap = cabinCapacity(row);

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
  const assignedRoomNums = new Set(Object.values(roomsBySlot).filter(Boolean));
  const activeDeckGroup = roomsByDeck.find((group) => group.deck === activeDeck) || roomsByDeck[0] || { deck: activeDeck, rooms: [] };
  const activeDeckRooms = activeDeckGroup.rooms;
  const activeDeckMatches = activeDeckRooms.filter(isRoomActive);
  const visibleActiveDeckRooms = activeDeckRooms.filter((room) => isRoomActive(room) || assignedRoomNums.has(room.num));
  const activeDeckAssignedCount = activeDeckRooms.filter((room) => assignedRoomNums.has(room.num)).length;

  const renderRoomOption = (room) => {
    const active = isRoomActive(room);
    const ownerSlotEntry = Object.entries(roomsBySlot).find(([, num]) => num === room.num);
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
        {/* ── Header: establish the task, then present the four decisions as a
            compact summary. Category is the primary object; fare, requested
            quantity and completion are supporting facts rather than one long
            sentence competing for attention. ── */}
        <div style={{
          flexShrink: 0, padding: `${SP.md}px ${SP.lg}px`,
          borderBottom: `1px solid ${WF.line}`, background: WF.panel
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: SP.lg }}>
            <div style={{ minWidth: 0 }}>
              <div id="assign-staterooms-title" style={{ fontSize: 15.5, fontWeight: 750, color: WF.ink, letterSpacing: -0.25 }}>Assign staterooms</div>
              <div id="assign-staterooms-description" style={{ marginTop: 2, fontSize: 10.5, color: WF.inkSoft }}>Choose the category, place guests, then confirm a room for each cabin.</div>
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

          <div
            role="group"
            aria-label="Stateroom assignment settings"
            style={{
              display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1px 116px 1px 132px auto',
              alignItems: 'center', gap: 12, marginTop: SP.md, padding: 8,
              border: `1px solid ${WF.line}`, borderRadius: RD.md, background: WF.fill
            }}>
            {/* Category identity — click to switch to a different category */}
            <div style={{ position: 'relative', minWidth: 0, alignSelf: 'center' }}>
              <button
                onClick={() => setSwitcherOpen(o => !o)}
                aria-expanded={switcherOpen}
                aria-haspopup="listbox"
                style={{
                  width: '100%', minHeight: 50,
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 8px 7px 10px', borderRadius: RD.sm,
                  border: `1px solid ${switcherOpen ? WF.accent : WF.line}`,
                  background: switcherOpen ? WF.accentTint : WF.panel,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                }}
                onMouseEnter={(e) => { if (!switcherOpen) e.currentTarget.style.borderColor = WF.accentLine; }}
                onMouseLeave={(e) => { if (!switcherOpen) e.currentTarget.style.borderColor = WF.line; }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: row.color, flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>Stateroom category</div>
                  <div style={{ marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
                    <span style={{ minWidth: 0, fontSize: 12.5, fontWeight: 750, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.label}</span>
                    <span style={{ fontSize: 11, color: WF.inkSoft, whiteSpace: 'nowrap', flexShrink: 0 }}>{CAT_LABELS[row.cat]} · {LOC_LABELS[row.location]}</span>
                  </div>
                </div>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: WF.inkSoft, background: '#FFFFFF', border: `1px solid ${WF.line}`,
                  transform: switcherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              {switcherOpen && (
                <React.Fragment>
                  <div onClick={() => setSwitcherOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 41,
                    width: 380, maxHeight: 360, overflowY: 'auto',
                    background: WF.panel, borderRadius: 10, border: `1px solid ${WF.line}`,
                    boxShadow: '0 16px 40px rgba(15,23,42,0.22)', padding: 6
                  }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', padding: '6px 8px 4px' }}>Switch to another category</div>
                    {STATEROOM_ROWS.map(r => {
                      const isCurrent = r.id === row.id;
                      const soldOut = r.total === 0;
                      const disabled = soldOut && !isCurrent;
                      return (
                        <button
                          key={r.id}
                          onClick={() => { if (!disabled && !isCurrent) onSwitchCategory(r.id); setSwitcherOpen(false); }}
                          disabled={disabled}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '8px', borderRadius: 7, border: 'none', textAlign: 'left',
                            background: isCurrent ? WF.accentTint : 'transparent',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.45 : 1, fontFamily: 'inherit'
                          }}
                          onMouseEnter={(e) => { if (!isCurrent && !disabled) e.currentTarget.style.background = WF.fill; }}
                          onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>
                          <div style={{ width: 11, height: 11, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
                            <div style={{ fontSize: 10, color: WF.inkSoft, marginTop: 1 }}>{CAT_LABELS[r.cat]} · {LOC_LABELS[r.location]}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>${r.price.toLocaleString()}</div>
                            <div style={{ fontSize: 9.5, fontWeight: 600, color: soldOut ? BAD : OK, marginTop: 1 }}>{soldOut ? 'Sold out' : `${r.total} fare units`}</div>
                          </div>
                          {isCurrent && <span style={{ fontSize: 12, color: WF.accentInk, flexShrink: 0 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </React.Fragment>
              )}
            </div>

            <div aria-hidden="true" style={{ width: 1, height: 36, background: WF.line }} />

            <div style={{ minWidth: 0, padding: '2px 4px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>Fare per room</div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>${row.price.toLocaleString()}.00</div>
            </div>

            <div aria-hidden="true" style={{ width: 1, height: 36, background: WF.line }} />

            <div style={{ minWidth: 0, padding: '2px 4px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>Staterooms</div>
              <div style={{ marginTop: 5 }}>
                <QtyControl
                  value={qty}
                  max={row.total}
                  onChange={(val) => val >= 1 && val <= row.total && onQtyChange(val)} />
              </div>
            </div>

            <div role="status" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
              border: `1px solid ${filledCount === qty ? '#BBF7D0' : WF.accentLine}`,
              borderRadius: RD.sm, background: filledCount === qty ? '#F0FDF4' : WF.accentTint
            }}>
              <span aria-hidden="true" style={{
                width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 999, flexShrink: 0, background: filledCount === qty ? '#047857' : WF.accent,
                color: '#FFFFFF', fontSize: 11, fontWeight: 800
              }}>{filledCount === qty ? '✓' : '!'}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 750, color: filledCount === qty ? '#047857' : WF.ink }}>
                  {filledCount === qty ? 'Ready to confirm' : `${qty - filledCount} remaining`}
                </div>
                <div style={{ marginTop: 1, fontSize: 11, color: WF.inkSoft, whiteSpace: 'nowrap' }}>{filledCount} of {qty} rooms assigned</div>
              </div>
            </div>
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

          {/* ══ Party progress — the per-type got/need banner ══ */}
          <div style={{ padding: `${SP.md}px ${SP.lg}px 0` }}>
            <GuestAssignmentSummary
              partyGuests={partyGuests || ZERO_GUESTS}
              assignedTotals={assignedTotals}
              otherAssigned={other} />
          </div>


          {/* ══ Which guests go in which cabin ══ */}
          <div style={{ padding: `${SP.md}px ${SP.lg}px 0` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP.md, marginBottom: SP.sm }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 750, color: WF.ink }}>Distribute guests by cabin</div>
                <div style={{ marginTop: 2, fontSize: 9.5, color: WF.inkSoft }}>Use the cabin header to choose which room you are assigning.</div>
              </div>
              <span style={{
                padding: '4px 7px', borderRadius: 6, border: `1px solid ${WF.line}`,
                background: WF.fill, fontSize: 9, fontWeight: 800, color: WF.inkSoft
              }}>{qty} cabin{qty === 1 ? '' : 's'} in this category</span>
            </div>
            <CabinAssignmentTable
              qty={qty}
              roomsBySlot={roomsBySlot}
              cabinGuests={cabinGuests}
              activeSlot={activeSlot}
              partyGuests={partyGuests || ZERO_GUESTS}
              otherAssigned={other}
              cap={cap}
              onSelectSlot={onSelectSlot}
              onGuestChange={onGuestChange} />
          </div>

          {/* ══ Which room ══ */}
          <div style={{ padding: `${SP.lg}px` }}>
            <div style={{ border: `1px solid ${WF.line}`, borderRadius: RD.md, overflow: 'hidden', background: WF.panel }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: SP.md, padding: '9px 11px',
                background: WF.fill, borderBottom: `1px solid ${WF.line}`
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: WF.accent, color: '#FFFFFF', fontSize: 11, fontWeight: 800,
                  fontFamily: 'ui-monospace, monospace', flexShrink: 0
                }}>{activeSlot + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 750, color: WF.ink }}>Room inventory for Cabin {activeSlot + 1}</div>
                  <div style={{ marginTop: 2, fontSize: 11, color: WF.inkSoft }}>
                    {filtersActive
                      ? `${matchingRoomCount} of ${rooms.length} eligible rooms match across ${roomsByDeck.length} decks`
                      : `${rooms.length} eligible rooms across ${roomsByDeck.length} decks · ${activeDeckRooms.length} on Deck ${activeDeck}`}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: filledCount === qty ? '#047857' : WF.ink, fontFamily: 'ui-monospace, monospace' }}>{filledCount} / {qty}</div>
                  <div style={{ marginTop: 1, fontSize: 8.5, color: WF.inkFaint }}>Rooms assigned</div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: SP.md, flexWrap: 'wrap',
                padding: '8px 11px', borderBottom: `1px solid ${WF.line}`, background: '#FFFFFF'
              }}>
                <button
                  onClick={() => onAutoAssign(activeDeckMatches.map((room) => room.num))}
                  disabled={activeDeckMatches.length < qty}
                  title={activeDeckMatches.length < qty
                    ? `Only ${activeDeckMatches.length} rooms match on Deck ${activeDeck}—clear a filter or choose another deck`
                    : `Spread the party across cabins, then choose matching rooms from Deck ${activeDeck}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 30, padding: '0 10px', borderRadius: 6, fontSize: 11, fontWeight: 750,
                    border: `1px solid ${activeDeckMatches.length < qty ? WF.line : WF.accentLine}`,
                    background: activeDeckMatches.length < qty ? WF.fill : WF.accentTint,
                    color: activeDeckMatches.length < qty ? WF.inkFaint : WF.accent,
                    cursor: activeDeckMatches.length < qty ? 'not-allowed' : 'pointer',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  <span style={{ marginRight: 2, fontSize: 11, fontWeight: 600, color: WF.inkSoft, whiteSpace: 'nowrap' }}>Filters</span>
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
                      color: WF.accent, fontSize: 11, fontWeight: 700,
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
                    gap: 6, padding: 8, borderBottom: `1px solid ${WF.line}`, background: '#FFFFFF'
                  }}>
                  {roomsByDeck.map(({ deck, rooms: deckRooms }) => {
                    const selected = deck === activeDeck;
                    const deckMatches = deckRooms.filter(isRoomActive).length;
                    const deckAssigned = deckRooms.filter((room) => assignedRoomNums.has(room.num)).length;
                    return (
                      <button
                        key={deck}
                        id={`deck-tab-${row.id}-${deck}`}
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`deck-panel-${row.id}-${deck}`}
                        onClick={() => setActiveDeck(deck)}
                        style={{
                          minHeight: 48, padding: '7px 9px', borderRadius: RD.sm,
                          border: `1px solid ${selected ? WF.accent : WF.line}`,
                          background: selected ? WF.accent : WF.panel,
                          color: selected ? '#FFFFFF' : WF.ink, cursor: 'pointer',
                          fontFamily: 'inherit', textAlign: 'left'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 750 }}>Deck {deck}</span>
                          <span style={{
                            minWidth: 22, padding: '2px 5px', borderRadius: 999, textAlign: 'center',
                            background: selected ? 'rgba(255,255,255,0.14)' : WF.fill,
                            fontSize: 10.5, fontWeight: 750, fontFamily: 'ui-monospace, monospace'
                          }}>{filtersActive ? `${deckMatches}/${deckRooms.length}` : deckRooms.length}</span>
                        </div>
                        <div style={{ marginTop: 3, minHeight: 13, fontSize: 10.5, color: selected ? '#CBD5E1' : WF.inkSoft }}>
                          {deckAssigned > 0 ? `✓ ${deckAssigned} assigned` : filtersActive ? `${deckMatches} matching` : 'Available rooms'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <section
                  id={`deck-panel-${row.id}-${activeDeck}`}
                  role="tabpanel"
                  aria-labelledby={`deck-tab-${row.id}-${activeDeck}`}
                  style={{
                    width: 'auto', margin: '10px 16px 12px',
                    border: `1px solid ${WF.line}`, borderRadius: RD.sm,
                    background: '#FFFFFF', overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.08)'
                  }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '9px 11px', borderBottom: `1px solid ${WF.line}`, background: WF.panel
                  }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 750, color: WF.ink }}>Deck {activeDeck}</span>
                      <span style={{ marginLeft: 7, fontSize: 11, color: WF.inkSoft }}>
                        {filtersActive ? `${activeDeckMatches.length} matching · ${activeDeckRooms.length} total` : `${activeDeckRooms.length} eligible rooms`}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: WF.inkSoft }}>
                      10 Forward · 9 Mid Ship · 9 Aft Ship
                      {activeDeckAssignedCount > 0 ? ` · ${activeDeckAssignedCount} assigned` : ''}
                    </div>
                  </div>

                  <div
                    className="stateroom-deck-scroll"
                    style={{ maxHeight: 330, overflowY: 'auto', scrollbarGutter: 'auto', padding: 10, background: WF.fill }}>
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
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: WF.ink }}>No rooms match on Deck {activeDeck}</div>
                        <div style={{ marginTop: 4, fontSize: 11, color: WF.inkSoft }}>Choose another deck or clear the current filters.</div>
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
                padding: '9px 18px', fontSize: 12.5, fontWeight: 600, borderRadius: RD.sm,
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
                padding: '9px 20px', fontSize: 12.5, fontWeight: 700, borderRadius: RD.sm,
                border: 'none', background: canConfirm ? TEAL.base : WF.fillStrong,
                color: canConfirm ? '#fff' : WF.inkFaint,
                cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}>Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Segmented filter control — compact "All / option / option" group used by
// Category in the matrix toolbar and Location in the room picker ──
function SegmentedFilter({ label, options, value, onChange, activeColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: WF.inkSoft, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <div
        role="group"
        aria-label={`${label} filter`}
        style={{ display: 'inline-flex', border: `1px solid ${WF.line}`, borderRadius: 7, overflow: 'hidden', background: WF.panel }}>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
          style={{
            padding: '5px 11px', fontSize: 11.5, fontWeight: value === null ? 700 : 500,
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
                padding: '5px 11px', fontSize: 11.5, fontWeight: on ? 700 : 500,
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
  Array.from({ length: qty }, (_, slot) => ({ slot, num: ((sel && sel.roomsBySlot) || {})[slot] })).
    filter((x) => x.num).
    map(({ slot, num }) => ({
      id: `${row.id}-${slot}`,
      rowId: row.id,
      cat: row.cat,
      label: row.label,
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
    if (!selections[c.rowId]) selections[c.rowId] = { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
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
  const [selections, setSelections] = React.useState(() => deriveMatrixStateFromCabins(s.cabins).selections); // rowId → { roomsBySlot: {slotIdx: roomNum}, cabinGuests: {slotIdx: {adults,children,infants}}, activeSlot }
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
    // open panel when going from 0 → 1, initialize selection
    if (prev === 0 && val > 0) {
      setOpenPanel(row.id);
      setSelections(sel => ({ ...sel, [row.id]: { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 } }));
    }
    // trim slots if qty is reduced below current slot count
    if (val > 0 && val < prev) {
      setSelections(sel => {
        const cur = sel[row.id];
        if (!cur) return sel;
        const roomsBySlot = {};
        const cabinGuests = {};
        for (let i = 0; i < val; i++) {
          if (cur.roomsBySlot[i] != null) roomsBySlot[i] = cur.roomsBySlot[i];
          if (cur.cabinGuests[i] != null) cabinGuests[i] = cur.cabinGuests[i];
        }
        const activeSlot = cur.activeSlot < val ? cur.activeSlot : 0;
        return { ...sel, [row.id]: { roomsBySlot, cabinGuests, activeSlot } };
      });
    }
    // close panel and clear rooms if qty drops to 0
    if (val === 0) {
      setOpenPanel(null);
      setSelections(sel => { const n = { ...sel }; delete n[row.id]; return n; });
      setConfirmedRooms(r => { const n = { ...r }; delete n[row.id]; return n; });
      dropRowCabins(row.id);
    }
  };

  const handleToggleRoom = (rowId, roomNum, qty) => {
    setSelections(sel => {
      const cur = sel[rowId] || { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
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
  const handleAutoAssign = (rowId, row, qty, availableRoomNums) => {
    const cap = cabinCapacity(row);
    setSelections(sel => {
      const cur = sel[rowId] || { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };

      const roomsBySlot = {};
      availableRoomNums.slice(0, qty).forEach((num, i) => { roomsBySlot[i] = num; });

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
            return berthedCount(b.g, cap) < berthedCount(a.g, cap) ? b : a;
          });
          best.g[key] += 1;
        }
      });

      const nextGuests = {};
      cabinGuests.forEach((g, i) => { nextGuests[i] = g; });
      return { ...sel, [rowId]: { ...cur, roomsBySlot, cabinGuests: nextGuests } };
    });
  };

  const handleSelectSlot = (rowId, slotIdx) => {
    setSelections(sel => ({ ...sel, [rowId]: { ...(sel[rowId] || { roomsBySlot: {}, cabinGuests: {} }), activeSlot: slotIdx } }));
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
    const cur = selections[rowId] || { roomsBySlot: {} };
    const roomNums = Array.from({ length: qty }, (_, i) => cur.roomsBySlot[i]).filter(Boolean);
    setConfirmedRooms(r => ({ ...r, [row.id]: roomNums }));
    setOpenPanel(null);
    // Persist the full per-cabin record (rooms + guest split) so the
    // supplements step can group its per-guest assignments by room. cabinId /
    // selectedCabinNum / selectedRoomCount keep their existing single-category
    // behaviour for the base fare.
    writeCabins(
      mergeRowCabins(s.cabins, row.id, buildRowCabins(row, cur, qty)),
      { cabinId: row.cat, selectedCabinNum: roomNums[0], selectedRoomCount: roomNums.length }
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

  // Switch the open panel to a different category, carrying over the
  // stateroom qty and resetting the abandoned category back to zero.
  const handleSwitchCategory = (fromRowId, newRowId) => {
    if (newRowId === fromRowId) return;
    const nextRow = STATEROOM_ROWS.find((candidate) => candidate.id === newRowId);
    if (!nextRow || nextRow.total < 1) return;
    const carryQty = Math.min(nextRow.total, Math.max(1, qtys[fromRowId] || 1));
    setQtys(q => { const n = { ...q }; delete n[fromRowId]; n[newRowId] = carryQty; return n; });
    setSelections(sel => {
      const n = { ...sel };
      delete n[fromRowId];
      n[newRowId] = { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
      return n;
    });
    setConfirmedRooms(r => { const n = { ...r }; delete n[fromRowId]; return n; });
    dropRowCabins(fromRowId);
    setOpenPanel(newRowId);
  };

  const TH = ({ children, right }) => (
    <th style={{
      padding: '6px 12px', fontSize: 9, fontWeight: 800, letterSpacing: 0.55,
      color: WF.inkLabel, textTransform: 'uppercase', textAlign: right ? 'center' : 'left',
      borderBottom: `1px solid ${WF.line}`, whiteSpace: 'nowrap', background: WF.fill
    }}>{children}</th>
  );

  return (
    <div style={{
      border: `1px solid ${WF.line}`, borderRadius: 9, overflow: 'hidden',
      background: '#FFFFFF', boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18,
        padding: '12px', background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 750, letterSpacing: -0.15, color: WF.ink }}>
            Choose a stateroom category
          </div>
          <div style={{ marginTop: 3, fontSize: 10, color: WF.inkSoft }}>Live fare inventory by category and occupancy · select a quantity, then choose exact rooms</div>
        </div>
        {/* Availability is already exposed by the cabin-type counts and each
            category row. Keep only completion progress here so the header
            answers one question: has the agent assigned the requested rooms? */}
        <div
          role="status"
          aria-label={assignedRoomCount > 0 ? `${assignedRoomCount} rooms assigned` : 'No rooms assigned'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
            padding: '6px 9px', borderRadius: 7,
            border: `1px solid ${assignedRoomCount > 0 ? WF.accentLine : WF.line}`,
            background: assignedRoomCount > 0 ? WF.accentTint : '#FFFFFF', color: WF.ink
          }}>
          <span aria-hidden="true" style={{
            width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 999, background: assignedRoomCount > 0 ? WF.accent : WF.fillStrong,
            color: assignedRoomCount > 0 ? '#FFFFFF' : WF.inkSoft,
            fontSize: 10.5, fontWeight: 800, lineHeight: 1
          }}>{assignedRoomCount > 0 ? '✓' : '—'}</span>
          <span style={{ fontSize: 11.5, fontWeight: 650, color: WF.inkSoft, whiteSpace: 'nowrap' }}>
            {assignedRoomCount > 0 ? <><strong style={{ color: WF.ink }}>{assignedRoomCount}</strong> rooms assigned</> : 'No rooms assigned'}
          </span>
        </div>
      </div>
      {/* Inventory-aware category filters: counts explain the effect of a
          filter before the agent commits to it, including sold-out groups. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        padding: '8px 12px', background: '#FFFFFF', borderBottom: `1px solid ${WF.line}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: WF.inkLabel, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Cabin type</span>
          {[{ key: null, label: 'All types', count: STATEROOM_ROWS.reduce((sum, row) => sum + row.total, 0) },
            ...['IS', 'OV', 'BAL', 'STE'].map((cat) => ({ key: cat, label: CAT_LABELS[cat], count: categoryInventory[cat] }))
          ].map((option) => {
            const active = catFilter === option.key;
            return (
              <button
                key={option.key || 'all'}
                onClick={() => setCatFilter(option.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 8px',
                  borderRadius: 6, border: `1px solid ${active ? WF.accent : WF.line}`,
                  background: active ? WF.accent : WF.panel, color: active ? '#FFFFFF' : WF.ink,
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 10.5, fontWeight: active ? 750 : 600,
                  opacity: option.count === 0 && !active ? 0.58 : 1
                }}>
                {option.label}
                <span style={{
                  minWidth: 18, padding: '1px 5px', borderRadius: 999, textAlign: 'center',
                  background: active ? 'rgba(255,255,255,0.16)' : WF.fill,
                  color: active ? '#FFFFFF' : option.count === 0 ? BAD : WF.inkSoft,
                  fontSize: 9, fontWeight: 800, fontFamily: 'ui-monospace, monospace'
                }}>{option.count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 9.5, color: WF.inkFaint }}>Counts show fare inventory currently bookable</div>
      </div>

      {/* ── Table — grows to its full height with the page. overflowX stays so the
             wide column set scrolls sideways here rather than widening the page. ── */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <TH>Category &amp; status</TH>
              <TH>Rooms to add</TH>
              <TH right>Fare / room</TH>
              <TH right>Fare inventory</TH>
              <TH right>Sleeps 1</TH>
              <TH right>Sleeps 2</TH>
              <TH right>2 + infant</TH>
              <TH right>Sleeps 3</TH>
              <TH right>Sleeps 4</TH>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const qty = qtys[row.id] || 0;
              const confirmed = confirmedRooms[row.id];
              const soldOut = row.total === 0;
              const categoryName = row.label.includes(' – ') ? row.label.split(' – ')[0] : row.label;
              return (
                <React.Fragment key={row.id}>
                  <tr 
                    onClick={() => qty > 0 && setOpenPanel(row.id)}
                    style={{
                      background: confirmed ? WF.accentTint : soldOut ? WF.fill : WF.panel,
                      boxShadow: confirmed ? `inset 3px 0 ${WF.accent}` : 'none',
                      opacity: soldOut ? 0.66 : 1,
                      transition: 'background 0.1s', cursor: qty > 0 ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => { if (qty > 0 && !confirmed) e.currentTarget.style.background = WF.fill; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = confirmed ? WF.accentTint : soldOut ? WF.fill : WF.panel; }}>
                    {/* Category name */}
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, minWidth: 218 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 9, height: 28, borderRadius: 3, background: row.color, flexShrink: 0 }}></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{categoryName}</div>
                            <span style={{
                              padding: '1px 5px', borderRadius: 4, border: `1px solid ${WF.line}`,
                              background: '#FFFFFF', fontSize: 8.5, fontWeight: 800,
                              color: WF.inkSoft, fontFamily: 'ui-monospace, monospace'
                            }}>{row.id}</span>
                          </div>
                          <div style={{ marginTop: 2, fontSize: 9, color: WF.inkFaint }}>{CAT_LABELS[row.cat]} · {LOC_LABELS[row.location]}</div>
                          {confirmed && (
                            <div style={{ fontSize: 9.5, color: WF.accentInk, fontWeight: 700, marginTop: 3, cursor: 'pointer' }}>
                              ✓ {confirmed.length} assigned · {confirmed.join(', ')} <span style={{ color: WF.inkFaint, fontWeight: 600 }}>· Edit rooms</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Qty control — stop row-click so +/- don't also open the modal */}
                    <td onClick={(e) => e.stopPropagation()} style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {soldOut ? (
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: BAD }}>Unavailable</span>
                      ) : (
                        <QtyControl
                          value={qty}
                          max={row.total}
                          onChange={(val) => handleQtyChange(row, val)} />
                      )}
                    </td>
                    {/* Price */}
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 750, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
                        ${row.price.toLocaleString()}.00
                      </span>
                    </td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', minWidth: 52, justifyContent: 'center', padding: '3px 6px', borderRadius: 999,
                        background: soldOut ? '#FEF2F2' : '#F0FDF4', color: soldOut ? BAD : '#047857',
                        fontSize: 9.5, fontWeight: 800
                      }}>{soldOut ? 'Sold out' : `${row.total} bookable`}</span>
                    </td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.single} /></td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.double} /></td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.dbinf} /></td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.triple} /></td>
                    <td style={{ padding: '7px 12px', borderBottom: `1px solid ${WF.lineSoft}`, textAlign: 'center' }}><NumCell val={row.quad} /></td>
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
        const sel = selections[row.id] || { roomsBySlot: {}, cabinGuests: {}, activeSlot: 0 };
        // Rooms another row in this same cabin category has already claimed are
        // off the table here — for the picker and for auto-assign alike.
        const taken = roomsTakenByOtherRows(selections, row.id, row.cat);
        const takenSet = new Set(taken);
        const rooms = roomsForRow(row).filter((room) => !takenSet.has(room.num));
        return (
          <SelectRoomPanel
            row={row}
            qty={qty}
            roomsBySlot={sel.roomsBySlot}
            cabinGuests={sel.cabinGuests}
            activeSlot={sel.activeSlot || 0}
            partyGuests={s.guests}
            otherAssigned={assignedInOtherRows(selections, row.id)}
            takenRooms={taken}
            onToggleRoom={(roomNum) => handleToggleRoom(row.id, roomNum, qty)}
            onAutoAssign={(roomNums) => handleAutoAssign(row.id, row, qty, roomNums)}
            onSelectSlot={(slotIdx) => handleSelectSlot(row.id, slotIdx)}
            onGuestChange={(slotIdx, field, val) => handleGuestChange(row.id, slotIdx, field, val)}
            onConfirm={() => handleConfirmRoom(row.id, row, qty)}
            onQtyChange={(val) => handleQtyChange(row, val)}
            onSwitchCategory={(newRowId) => handleSwitchCategory(row.id, newRowId)}
            onBack={() => handleBackPanel(row.id)}
            onClose={() => setOpenPanel(null)}
          />
        );
      })()}
    </div>
  );
}

window.StateRoomMatrix = StateRoomMatrix;
