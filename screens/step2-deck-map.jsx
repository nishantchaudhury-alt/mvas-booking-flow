// screens/step2-deck-map.jsx
// Deck map / cabin picker — shown below cabin category when a category is selected

const ORIENT_OPTS = ['Forward', 'Mid Ship', 'Aft Ship'];

const DECK_DEFS = [
{ num: 4, name: 'COASTAL CONFESSIONS', color: '#0ABAB5', bg: 'rgba(10,186,181,0.07)', textColor: '#0A7C79' },
{ num: 5, name: 'CHANGES IN ATTITUDE', color: '#22C55E', bg: 'rgba(34,197,94,0.07)', textColor: '#15803D' },
{ num: 6, name: 'LAST MANGO', color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', textColor: '#B45309' },
{ num: 7, name: 'PAINTED SKY', color: '#818CF8', bg: 'rgba(129,140,248,0.07)', textColor: '#4338CA' },
{ num: 8, name: 'LIMES AND SALT', color: '#A78BFA', bg: 'rgba(167,139,250,0.07)', textColor: '#6D28D9' },
{ num: 9, name: "5 O'CLOCK SOMEWHERE", color: '#F87171', bg: 'rgba(248,113,113,0.07)', textColor: '#B91C1C' },
{ num: 10, name: 'LUCKY STAR', color: '#334155', bg: 'rgba(51,65,85,0.05)', textColor: '#1E293B' }];


const CABIN_STRATA = {
  IS: ['Interior — Standard Inside', 'Interior — Large Inside'],
  OV: ['Oceanview — Standard Oceanview', 'Oceanview — Picture Window'],
  BAL: ['Balcony — Standard Balcony', 'Balcony — Premium Balcony', 'Premium Extended Balcony', 'Wake View Balcony', 'Extended Balcony', 'Breezy Balcony Quad', 'Breezy Balcony'],
  STE: ['Suite — Grand Terrace Suite', 'Suite — Corner Suite', 'Grand Terrace Corner Suite', 'Grand Terrace Suite', 'Serene Junior Suite']
};

// Which decks have cabins for each category
const CAT_ACTIVE_DECKS = {
  IS: [4, 5, 6, 7, 8],
  OV: [5, 6, 7, 8, 9],
  BAL: [6, 7, 8, 9, 10],
  STE: [9, 10]
};

const CAT_CABIN_COUNTS = { IS: 21, OV: 12, BAL: 14, STE: 7 };

// ── Live Availability Matrix mock data ───────────────────────────────────
const AVAIL_MATRIX_ROWS = [
{ color: '#DC2626', name: 'Category I8–G', code: 'I8G', price: 499, total: 13, single: 0, double: 0, dbInf: 0, triple: 13, quad: 0, tax: 266 },
{ color: '#F97316', name: 'Grand Terrace Suite – S1', code: 'S1', price: 1932, total: 0, single: 0, double: 0, dbInf: 0, triple: 0, quad: 0, tax: 266 },
{ color: '#A855F7', name: 'Jr Suite – S3', code: 'S3', price: 1732, total: 0, single: 0, double: 0, dbInf: 0, triple: 0, quad: 0, tax: 266 },
{ color: '#EAB308', name: 'Ocean View – O4', code: 'O4', price: 512, total: 0, single: 0, double: 0, dbInf: 0, triple: 0, quad: 0, tax: 266 },
{ color: '#F59E0B', name: 'Ocean View – O5', code: 'O5', price: 512, total: 0, single: 0, double: 0, dbInf: 0, triple: 0, quad: 0, tax: 266 },
{ color: '#86EFAC', name: 'Interior Stateroom – I6', code: 'I6', price: 472, total: 2, single: 0, double: 2, dbInf: 0, triple: 0, quad: 0, tax: 266 },
{ color: '#22C55E', name: 'Interior Stateroom – I7', code: 'I7', price: 472, total: 6, single: 0, double: 5, dbInf: 1, triple: 0, quad: 0, tax: 266 },
{ color: '#15803D', name: 'Interior Stateroom – I8', code: 'I8', price: 472, total: 1, single: 0, double: 1, dbInf: 0, triple: 0, quad: 0, tax: 266 }];


function LiveAvailMatrix({ onClose }) {
  const COLS = ['CATEGORY NAME', 'PRICE', 'TOTAL', 'SINGLE', 'DOUBLE', 'DB + INF', 'TRIPLE', 'QUAD'];
  const headerStyle = { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: WF.inkSoft,
    textTransform: 'uppercase', padding: '7px 8px', textAlign: 'right', whiteSpace: 'nowrap',
    borderBottom: `1.5px solid ${WF.line}` };
  const cellStyle = (val, isTotal) => ({
    padding: '9px 10px', fontSize: 13, textAlign: 'right', fontWeight: isTotal ? 700 : 400,
    color: isTotal && val === 0 ? '#EF4444' : isTotal && val > 0 ? WF.ink : val === 0 ? WF.inkSoft : WF.ink,
    background: isTotal && val === 0 ? '#FEF2F2' : isTotal && val > 0 ? '#F0FDF4' : 'transparent',
    borderBottom: `1px solid ${WF.lineSoft}`
  });
  return (
    <div style={{ margin: '0 0 16px 0', border: `1px solid ${WF.line}`, borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px 8px', borderBottom: `1px solid ${WF.line}` }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: '#4338CA', textTransform: 'uppercase' }}>
          Live Global Category Availability Matrix
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: WF.inkSoft, fontFamily: 'inherit', display: 'flex',
          alignItems: 'center', gap: 4, padding: '3px 6px' }}>
          <span style={{ fontSize: 14 }}>✕</span> Close
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: 'left', paddingLeft: 14 }}>Category Name</th>
              {['PRICE', 'TOTAL', 'SINGLE', 'DOUBLE', 'DB + INF', 'TRIPLE', 'QUAD'].map((col) =>
              <th key={col} style={headerStyle}>{col}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {AVAIL_MATRIX_ROWS.map((row, i) =>
            <tr key={row.code} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '7px 8px 7px 14px', borderBottom: `1px solid ${WF.lineSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 22, borderRadius: 2, background: row.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: WF.ink }}>{row.name}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle(null, false), padding: '7px 8px' }}><span style={{ color: WF.ink, fontWeight: 500, fontSize: 12 }}>${row.price.toFixed(2)}</span></td>
                <td style={{ ...cellStyle(row.total, true), padding: '7px 8px', fontSize: 12 }}>{row.total}</td>
                <td style={{ ...cellStyle(row.single, false), padding: '7px 8px', fontSize: 12 }}>{row.single === 0 ? <span style={{ color: WF.inkSoft }}>0</span> : row.single}</td>
                <td style={{ ...cellStyle(row.double, false), padding: '7px 8px', fontSize: 12 }}>{row.double === 0 ? <span style={{ color: WF.inkSoft }}>0</span> : row.double}</td>
                <td style={{ ...cellStyle(row.dbInf, false), padding: '7px 8px', fontSize: 12 }}>{row.dbInf === 0 ? <span style={{ color: WF.inkSoft }}>0</span> : row.dbInf}</td>
                <td style={{ ...cellStyle(row.triple, false), padding: '7px 8px', fontSize: 12 }}>{row.triple === 0 ? <span style={{ color: WF.inkSoft }}>0</span> : row.triple}</td>
                <td style={{ ...cellStyle(row.quad, false), padding: '7px 8px', fontSize: 12 }}>{row.quad === 0 ? <span style={{ color: WF.inkSoft }}>0</span> : row.quad}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}

const CAT_TYPE_LABEL = {
  IS: 'STANDARD I...',
  OV: 'OCEANVIEW S...',
  BAL: 'BALCONY STD...',
  STE: 'SUITE · GTR...'
};

function generateCabins(deckNum, cabinCategory) {
  const activeDecks = CAT_ACTIVE_DECKS[cabinCategory] || [];
  if (!activeDecks.includes(deckNum)) return [];
  const count = CAT_CABIN_COUNTS[cabinCategory] || 12;
  const base = deckNum * 1000 + 100;
  return Array.from({ length: count }, (_, i) => {
    const seed = i * 7 + deckNum * 3;
    return {
      num: base + i * 2 + 10,
      occupied: seed % 13 < 4,
      accessible: (i * 5 + deckNum) % 11 === 0,
      linked: (i * 3 + deckNum * 2) % 9 === 0,
      area: i < Math.floor(count / 3) ? 'Forward' :
      i < Math.floor(count * 2 / 3) ? 'Mid Ship' :
      'Aft Ship'
    };
  });
}

// ── Stratum picker with search modal ────────────────────────────────────
function StratumPickerButton({ selected, options, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filtered = options.filter((opt) =>
  opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '5px 26px 5px 9px', fontSize: 12, fontWeight: 500,
          border: `1px solid ${WF.line}`, borderRadius: 6,
          background: WF.panel, color: WF.ink, fontFamily: 'inherit',
          cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
        {selected}
      </button>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <path d="M2 4l4 4 4-4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Modal overlay */}
      {open &&
      <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
          <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          marginTop: 4, background: '#fff', border: `1px solid ${WF.line}`,
          borderRadius: 7, boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
          maxHeight: 220, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 200
        }}>
            {/* Search input */}
            <div style={{ padding: '7px 8px', borderBottom: `1px solid ${WF.lineSoft}` }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, padding: '5px 26px 5px 8px', fontSize: 12, border: `1px solid ${WF.line}`,
                  borderRadius: 5, fontFamily: 'inherit', background: WF.fill, color: WF.ink,
                  boxSizing: 'border-box'
                }} />

                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 8, color: WF.inkSoft, pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Options list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.length > 0 ?
            filtered.map((opt) =>
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
                setSearch('');
              }}
              style={{
                width: '100%', padding: '7px 10px', textAlign: 'left', border: 'none',
                background: opt === selected ? WF.fill : 'transparent',
                color: WF.ink, fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', borderBottom: `1px solid ${WF.lineSoft}`,
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => {if (opt !== selected) e.currentTarget.style.background = WF.fill;}}
              onMouseLeave={(e) => {if (opt !== selected) e.currentTarget.style.background = 'transparent';}}>
                    {opt}
                  </button>
            ) :

            <div style={{ padding: '16px 14px', textAlign: 'center', color: WF.inkFaint, fontSize: 12 }}>No matches</div>
            }
            </div>
          </div>
        </>
      }
    </div>);

}

// ── Single cabin card ────────────────────────────────────────────────────
function CabinCard({ cabin, selected, typeLabel, onSelect }) {
  const available = !cabin.occupied;
  const barColor = selected ? '#3B82F6' : available ? '#10B981' : '#E5E7EB';
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={() => available && onSelect(cabin.num)}
      onMouseEnter={() => available && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        padding: '8px 9px 10px',
        borderRadius: 8,
        border: `1px solid ${selected ? '#3B82F6' : hovered ? '#CBD5E1' : available ? '#E5E7EB' : '#F1F5F9'}`,
        background: selected ? '#F0F9FF' : hovered && available ? '#F9FAFB' : '#fff',
        cursor: available ? 'pointer' : 'default',
        opacity: cabin.occupied ? 0.45 : 1,
        position: 'relative',
        minWidth: 0,
        transition: 'all 0.1s',
        boxShadow: available && !selected && hovered ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
        fontFamily: 'inherit'
      }}>

      {/* Type label + icons — compact row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, minHeight: 0 }}>
        <span style={{ fontSize: 8, fontWeight: 600, color: '#94A3B8', letterSpacing: 0.1, textTransform: 'uppercase', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {typeLabel}
        </span>
        <div style={{ display: 'flex', gap: 1.5, flexShrink: 0, marginLeft: 2 }}>
          {cabin.accessible &&
          <div style={{
            width: 13, height: 13, borderRadius: 2, background: '#3B82F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, color: '#fff', flexShrink: 0, lineHeight: 1
          }}>♿</div>
          }
          {cabin.linked &&
          <span style={{ fontSize: 9, color: '#94A3B8', lineHeight: 1, flexShrink: 0 }}>🔗</span>
          }
        </div>
      </div>

      {/* Cabin number — large, centered */}
      <div style={{
        fontSize: 16, fontWeight: 800,
        color: cabin.occupied ? '#9CA3AF' : '#1F2937',
        textAlign: 'center', letterSpacing: -0.4, lineHeight: 1.1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {cabin.num}
      </div>

      {/* Bottom availability bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, borderRadius: '0 0 7px 7px', background: barColor,
        transition: 'background 0.15s'
      }} />
    </button>);

}

// ── Single deck row (collapsible) ────────────────────────────────────────
function DeckRow({ deck, cabinCategory, orientation, selectedCabin, onSelectCabin, isExpanded, onToggle }) {
  // Use controlled expanded state if passed, otherwise local
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;
  const setExpanded = isExpanded !== undefined ? onToggle : setLocalExpanded;

  const allCabins = React.useMemo(
    () => generateCabins(deck.num, cabinCategory),
    [deck.num, cabinCategory]
  );

  const visibleCabins = orientation === 'All Areas' ?
  allCabins :
  allCabins.filter((c) => c.area === orientation);

  const available = visibleCabins.filter((c) => !c.occupied).length;
  const occupied = visibleCabins.filter((c) => c.occupied).length;
  const typeLabel = CAT_TYPE_LABEL[cabinCategory] || 'CABIN';
  const hasCabins = visibleCabins.length > 0;

  return (
    <div style={{
      borderBottom: `1px solid ${WF.line}`,
      background: '#fff',
      '&:last-child': { borderBottom: 'none' }
    }}>
      {/* Header row — compact */}
      <button
        onClick={() => hasCabins && (isExpanded !== undefined ? onToggle() : setLocalExpanded((e) => !e))}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '12px 16px', background: 'none', border: 'none',
          cursor: hasCabins ? 'pointer' : 'default',
          fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s'
        }}
        onMouseEnter={(e) => hasCabins && (e.currentTarget.style.background = '#F8FAFC')}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>

        {/* Deck name badge */}
        <div style={{
          padding: '4px 10px', borderRadius: 5,
          border: `1.5px solid ${deck.color}`, background: deck.bg,
          color: deck.textColor, fontSize: 10, fontWeight: 700,
          letterSpacing: 0.3, whiteSpace: 'nowrap', flexShrink: 0
        }}>
          DECK {deck.num}: {deck.name}
        </div>

        {/* Available pill */}
        <div style={{
          padding: '3px 8px', borderRadius: 16,
          border: `1px solid ${hasCabins && available > 0 ? '#22C55E' : WF.line}`,
          background: hasCabins && available > 0 ? '#F0FFF4' : WF.fill,
          fontSize: 10, fontWeight: 600,
          color: hasCabins && available > 0 ? '#15803D' : WF.inkSoft,
          flexShrink: 0
        }}>
          {available} Available
        </div>

        {/* Occupied pill */}
        <div style={{
          padding: '3px 8px', borderRadius: 16,
          border: `1px solid ${WF.line}`, background: WF.fill,
          fontSize: 10, fontWeight: 600, color: WF.inkSoft,
          flexShrink: 0
        }}>
          {occupied} Occupied
        </div>

        {/* Expand / collapse toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, color: hasCabins ? WF.inkSoft : WF.inkFaint, fontWeight: 500
          }}>
            {expanded ? 'Collapse' : 'Expand'}
          </span>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: WF.inkSoft }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded cabin grid */}
      {expanded && hasCabins &&
      <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${WF.lineSoft}`, background: deck.bg }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {visibleCabins.map((cabin) =>
          <CabinCard
            key={cabin.num}
            cabin={cabin}
            selected={selectedCabin === cabin.num}
            typeLabel={typeLabel}
            onSelect={onSelectCabin} />

          )}
          </div>
        </div>
      }
    </div>);

}

// ── Main section component ───────────────────────────────────────────────
function CabinDeckMapSection({ cabinId, selectedCabin, onSelectCabin, deckPreference, onDeckPreference, assignmentMethod, onAssignmentMethod }) {
  const [orientation, setOrientation] = React.useState('All Areas');
  const stratumOpts = CABIN_STRATA[cabinId] || [];
  const [stratum, setStratum] = React.useState(stratumOpts[0] || '');
  const [expandedDeck, setExpandedDeck] = React.useState(null);
  const [showDeckMap, setShowDeckMap] = React.useState(true);
  const [showAvailMatrix, setShowAvailMatrix] = React.useState(false);

  // Derive deck number from cabin number (e.g. 5112 → deck 5)
  const selectedDeckNum = selectedCabin ? Math.floor(selectedCabin / 1000) : null;
  const selectedDeckDef = selectedDeckNum ? DECK_DEFS.find((d) => d.num === selectedDeckNum) : null;

  // Reset stratum when cabin category changes
  React.useEffect(() => {
    const opts = CABIN_STRATA[cabinId] || [];
    setStratum(opts[0] || '');
    setOrientation('All Areas');
    setExpandedDeck(null);
    setShowDeckMap(true);
  }, [cabinId]);

  // Wrap onSelectCabin to pass stratum + deckNum up
  const handleSelectCabin = (num) => {
    const deckNum = num ? Math.floor(num / 1000) : null;
    onSelectCabin({ num, stratum, deckNum });
    setExpandedDeck(null);
    setShowDeckMap(false);
  };

  const S2_DARK_LOCAL = '#0D2533';
  const S2_TEAL_LOCAL = WF.accentInk;
  const S2_TEAL_TINT_LOCAL = WF.accentTint;

  return (
    <div style={{
      marginTop: 16, padding: '16px', background: '#fff',
      border: `1px solid ${WF.line}`, borderRadius: 10
    }}>

      {/* ── Top row: Deck + Location + Auto-Assign button ── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16 }}>

        {/* Ship orientation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: WF.inkLabel, whiteSpace: 'nowrap' }}>Location:</div>
          <div style={{ display: 'inline-flex', border: `1px solid ${WF.line}`, borderRadius: 6, overflow: 'hidden', background: WF.fill }}>
            {ORIENT_OPTS.map((opt, i) =>
            <button
              key={opt}
              onClick={() => setOrientation(opt)}
              style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 600,
                border: 'none',
                borderRight: i < ORIENT_OPTS.length - 1 ? `1px solid ${WF.line}` : 'none',
                background: orientation === opt ? '#1B2434' : 'transparent',
                color: orientation === opt ? '#fff' : WF.ink,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.1s'
              }}>
                {opt}
              </button>
            )}
          </div>
        </div>

        {/* Room Category — inline with Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: WF.inkLabel, whiteSpace: 'nowrap' }}>Room Category</div>
          <StratumPickerButton
            selected={stratum}
            options={stratumOpts}
            onSelect={(val) => setStratum(val)} />

          {/* View Live Availability icon button */}
          <div style={{ position: 'relative' }}>
            <button
              title="View Category Availability Matrix"
              onClick={() => setShowAvailMatrix((v) => !v)}
              style={{
                width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${showAvailMatrix ? '#4338CA' : WF.line}`,
                borderRadius: 6, background: showAvailMatrix ? '#4338CA' : WF.panel,
                cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              style={{ color: showAvailMatrix ? '#fff' : WF.inkSoft }}>
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {/* Tooltip */}
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
              transform: 'translateX(-50%)', background: '#1B2434', color: '#fff',
              fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 5,
              whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0,
              transition: 'opacity 0.15s', zIndex: 10
            }} className="avail-tooltip">
              View Category Availability Matrix
            </div>
          </div>
        </div>

        {/* Auto-Assign button (right-aligned) */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => onAssignmentMethod && onAssignmentMethod('auto')}
            style={{
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${(assignmentMethod || 'manual') === 'auto' ? S2_TEAL_LOCAL : WF.line}`,
              background: (assignmentMethod || 'manual') === 'auto' ? S2_TEAL_TINT_LOCAL : WF.panel,
              color: (assignmentMethod || 'manual') === 'auto' ? S2_TEAL_LOCAL : WF.ink,
              transition: 'all 0.12s',
              whiteSpace: 'nowrap', padding: "8px"
            }}>
            <span style={{ fontSize: 10, marginRight: 4 }}>⚙️</span>Auto-Assign Room
          </button>
        </div>
      </div>



      {/* ── Live Availability Matrix panel ── */}
      {showAvailMatrix && <LiveAvailMatrix onClose={() => setShowAvailMatrix(false)} />}

      {/* ── Selected room summary (shows below Room Category when picked) ── */}
      {selectedCabin && !showDeckMap &&
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', marginBottom: 4,
        background: '#F0F9FF', border: '1.5px solid #3B82F6',
        borderRadius: 8
      }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#3B82F6', flexShrink: 0 }}>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: WF.accentInk }}>Room {selectedCabin}</span>
            {selectedDeckDef &&
          <span style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6',
            padding: '2px 7px', borderRadius: 4, background: '#DBEAFE' }}>
                Deck {selectedDeckNum}
              </span>
          }
            <span style={{ fontSize: 11, color: '#3B82F6' }}>{stratum}</span>
          </div>
          <button
          onClick={() => {onSelectCabin(null);setShowDeckMap(true);}}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
            color: WF.accentOn, fontFamily: 'inherit', fontWeight: 700, padding: '3px 8px',
            borderRadius: 4, letterSpacing: 0.1 }}>
            Change
          </button>
        </div>
      }

      {/* ── Section label + legend (hidden when room selected) ── */}
      {showDeckMap && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }} data-comment-anchor="fefab165bf-div-552-23">
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, color: WF.inkLabel, textTransform: 'uppercase' }}>
          Active Structural Deck Levels
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
          { label: 'Available', color: '#22C55E', border: false },
          { label: 'Selected', color: '#3B82F6', border: false },
          { label: 'Occupied', color: '#E2E8F0', border: true }].
          map(({ label, color, border }) =>
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: WF.inkSoft }}>
              <div style={{ width: 11, height: 11, borderRadius: 2, background: color, border: border ? '1px solid #CBD5E1' : 'none' }} />
              {label}
            </div>
          )}
        </div>
      </div>}

      {/* ── Deck accordion list (hidden when room is selected) ── */}
      {showDeckMap && <div style={{ border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        {DECK_DEFS.map((deck, idx) =>
        <React.Fragment key={deck.num}>
            {idx > 0 && <div style={{ height: 0 }} />}
            <DeckRow
            deck={deck}
            cabinCategory={cabinId}
            orientation={orientation}
            selectedCabin={selectedCabin}
            onSelectCabin={handleSelectCabin}
            isExpanded={expandedDeck === deck.num}
            onToggle={() => setExpandedDeck(expandedDeck === deck.num ? null : deck.num)} />
          </React.Fragment>
        )}
      </div>}

    </div>);

}

window.CabinDeckMapSection = CabinDeckMapSection;
