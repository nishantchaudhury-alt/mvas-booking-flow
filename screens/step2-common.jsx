// ───────────────────────────────────────────────────────────────────────────
// Step 2 · Sailing, fare & cabin — agent booking flow
// Reuses WF tokens/primitives + intent-data (SAILINGS, CABINS, FARECODES, priceQuote)
// Self-contained page: carries Step-1 selections from the shared store.
// ───────────────────────────────────────────────────────────────────────────

// ── 4-step progress bar (step 2 active, step 1 done) ──
const FLOW4 = [
  { n: 1, label: 'Sailing, fare & cabin' },
  { n: 2, label: 'Add guests' },
  { n: 3, label: 'Review & confirm' },
];

function StepProgress2({ current, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: WF.panel, border: `1px solid ${WF.line}`,
      borderRadius: 8, padding: '6px 8px', marginBottom: 20,
    }}>
      {FLOW4.map((st, i) => {
        const state = st.n < current ? 'done' : st.n === current ? 'current' : 'pending';
        const clickable = st.n === 1 && onBack;
        return (
          <React.Fragment key={st.n}>
            <button onClick={() => clickable && onBack()} style={{
              display: 'flex', alignItems: 'center', gap: 8, border: 'none',
              padding: '6px 10px', borderRadius: 6, fontFamily: 'inherit',
              background: state === 'current' ? WF.fill : 'transparent',
              cursor: clickable ? 'pointer' : 'default',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                // Done and current are both the brand navy now, so the two are
                // told apart by treatment rather than hue: current wears a halo
                // ring, done is the bare fill (and carries a ✓ instead of a
                // number). Pending stays grey.
                background: state === 'pending' ? WF.fillStrong : WF.accent,
                boxShadow: state === 'current' ? `0 0 0 3px ${WF.accentLine}` : 'none',
                color: state === 'pending' ? WF.inkSoft : '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{state === 'done' ? '✓' : st.n}</div>
              <div style={{
                fontSize: 12, fontWeight: state === 'current' ? 600 : 500,
                color: state === 'pending' ? WF.inkFaint : WF.ink, whiteSpace: 'nowrap',
              }}>{st.label}</div>
            </button>
            {i < FLOW4.length - 1 && <div style={{ flex: 1, height: 1, minWidth: 8, background: st.n < current ? WF.accentOn : WF.line, opacity: st.n < current ? 0.4 : 1 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Header source pill (carried over) ──
const SRC_OPTS = ['Phone', 'CRM · Contact Center', 'Partner', 'Web Assist'];
function SourcePill2({ source, onChange, fullWidth = false }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const place = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const width = Math.max(196, rect.width);
      setPos({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        width,
      });
    };
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    place();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, width: fullWidth ? '100%' : 'auto' }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto', height: fullWidth ? 40 : 38,
        padding: fullWidth ? '6px 11px' : '0 14px', borderRadius: fullWidth ? 8 : 10, whiteSpace: 'nowrap',
        cursor: 'pointer', border: `${fullWidth ? 1 : 1.5}px solid ${open ? WF.accent : WF.line}`,
        background: open && fullWidth ? WF.accentTint : WF.panel,
        fontFamily: 'inherit', fontSize: 13, color: WF.ink, outline: 'none',
        transition: 'border-color 0.15s, background 0.15s',
      }}>
        {fullWidth ? (
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
            <span style={{
              fontSize: 9, lineHeight: 1, fontWeight: 750, letterSpacing: 0.45,
              textTransform: 'uppercase', color: WF.inkLabel,
            }}>Source</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.2, color: WF.ink, fontWeight: 650 }}>{source}</span>
          </span>
        ) : (
          <>
            <span style={{ color: WF.inkSoft }}>Source</span>
            <span style={{ color: WF.ink, fontWeight: 600, textAlign: 'left' }}>{source}</span>
          </>
        )}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            flexShrink: 0, color: WF.inkLabel,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s ease',
          }}>
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round" />
        </svg>
      </button>
      {open && pos && (
        <div style={{
          position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 60,
          background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(15,23,42,0.14)', padding: 4, boxSizing: 'border-box'
        }}>
          {SRC_OPTS.map(opt => {
            const on = opt === source;
            return (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5,
                background: on ? WF.accentTint : 'transparent', color: on ? WF.ink : WF.inkSoft, fontWeight: on ? 600 : 500,
              }}>
                <span>{opt}</span>
                {on && <span style={{ color: WF.accent, fontSize: 12, fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── shared atoms (single-select pills, mini stepper, calendar) ──
const MON_FULL2 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_ABBR2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW2 = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TODAY2 = (() => { const d = new Date(2026, 5, 8); d.setHours(0, 0, 0, 0); return d; })();
const ymd2 = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseYmd2 = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays2 = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtShort2 = (d) => `${MON_ABBR2[d.getMonth()]} ${d.getDate()}`;
const sameDay2 = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const durNights = (dur) => ({ '5 nights': 5, '6 nights': 6, '7 nights': 7 }[dur] || null);

// ── Cabin-level supplement helpers ────────────────────────────────────────
// A supplement can be assigned either per-guest or per-cabin. Both live in the
// same `suppAssignments[suppId]` map; cabin entries are namespaced with a
// `cabin:` prefix and always carry qty 1, so the existing `pricePP * qty`
// rollups charge them exactly once per cabin.
const CABIN_SUPP_PREFIX = 'cabin:';
const cabinSuppKey = (cabinId) => CABIN_SUPP_PREFIX + cabinId;
const isCabinSuppKey = (k) => typeof k === 'string' && k.indexOf(CABIN_SUPP_PREFIX) === 0;

// The guest-facing room category name — "Interior Stateroom", "Balcony Deluxe"
// — read off the cabin record. `cab.label` is the stateroom-matrix row's own
// label ("Interior Stateroom – I6"), which carries a trailing " – <rowId>" that
// identifies the row internally for inventory/pricing but means nothing to a
// guest. Stripped here rather than at each call site, so every screen that
// names a room's category strips it the same way instead of three screens
// drifting into three slightly different formats.
function cabinCategoryName(cab) {
  if (!cab) return null;
  const label = cab.label || '';
  const suffix = cab.rowId ? ` – ${cab.rowId}` : null;
  return suffix && label.endsWith(suffix) ? label.slice(0, -suffix.length) : label || null;
}

// Must stay in lockstep with SUPP_GUEST_CATS (step2-sailing.jsx) and the CATS
// array in s4BuildPassengers (Unified Booking Flow Final.html) — all three mint
// the same `${category}-${index}` guest keys.
const CABIN_ALLOC_CATS = ['adults', 'youngAdults', 'children', 'infants'];

// guestKey → cabin key. Deals each category out across cabins in array order,
// counting per-category so the allocation lines up with the "Guest 1 / Child 2"
// labels buildGuestRoster mints. Relies on `cabins` being in a stable order.
function buildCabinGuestMap(guests, cabins) {
  const map = {};
  const list = Array.isArray(cabins) ? cabins : [];
  CABIN_ALLOC_CATS.forEach((key) => {
    let n = 0;
    list.forEach((cab) => {
      const count = (cab && cab.guests && cab.guests[key]) || 0;
      for (let j = 0; j < count; j++) { map[`${key}-${n}`] = cabinSuppKey(cab.id); n++; }
    });
  });
  return map;
}

// Drops cabin assignments whose cabin no longer exists and recomputes the
// derived qty cache, so both stay consistent after a cabin is removed.
function pruneCabinSuppAssignments(suppAssignments, cabins) {
  const valid = new Set((cabins || []).map((c) => cabinSuppKey(c.id)));
  const nextAssign = {};
  const nextQtys = {};
  Object.entries(suppAssignments || {}).forEach(([suppId, byKey]) => {
    const kept = {};
    Object.entries(byKey || {}).forEach(([k, v]) => {
      if (isCabinSuppKey(k) && !valid.has(k)) return;
      kept[k] = v;
    });
    if (Object.keys(kept).length > 0) {
      nextAssign[suppId] = kept;
      nextQtys[suppId] = Object.values(kept).reduce((a, b) => a + b, 0);
    }
  });
  return { suppAssignments: nextAssign, selectedSupps: nextQtys };
}

function Pills({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? '6px 12px' : '8px 15px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const on = value === opt;
        return (
          <button key={opt} onClick={() => onChange(on ? null : opt)} style={{
            padding: pad, fontSize: fs, fontFamily: 'inherit', borderRadius: 999, cursor: 'pointer',
            border: `1px solid ${on ? WF.accent : WF.line}`, background: on ? WF.accent : WF.panel,
            color: on ? '#fff' : WF.inkSoft, whiteSpace: 'nowrap', fontWeight: on ? 600 : 500, transition: 'all 0.12s',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function MiniStep({ value, min, onChange }) {
  const [inputValue, setInputValue] = React.useState(String(value));

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= min) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < min) {
      setInputValue(String(value));
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      style={{
        width: 50,
        padding: '6px 8px',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'ui-monospace, monospace',
        border: `1px solid ${WF.line}`,
        borderRadius: 6,
        textAlign: 'center',
        color: WF.ink,
        outline: 'none',
      }}
    />
  );
}

function MiniCalendar({ departDate, nights, onPick }) {
  const initView = departDate ? (() => { const d = parseYmd2(departDate); return { year: d.getFullYear(), month: d.getMonth() }; })() : { year: 2026, month: 9 };
  const [view, setView] = React.useState(initView);
  const first = new Date(view.year, view.month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const dep = departDate ? parseYmd2(departDate) : null;
  const end = dep && nights ? addDays2(dep, nights) : null;
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));
  const step = (delta) => setView(v => { let m = v.month + delta, y = v.year; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { year: y, month: m }; });
  const Arrow = ({ dir }) => (
    <button onClick={() => step(dir === 'prev' ? -1 : 1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${WF.line}`, background: WF.panel, color: WF.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dir === 'prev' ? '‹' : '›'}</button>
  );
  return (
    <div style={{ width: 250 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Arrow dir="prev" /><div style={{ fontSize: 13, fontWeight: 600, color: WF.ink }}>{MON_FULL2[view.month]} {view.year}</div><Arrow dir="next" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {DOW2.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: WF.inkFaint, letterSpacing: 0.5, padding: '2px 0' }}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const past = date < TODAY2;
          const isStart = sameDay2(date, dep), isEnd = end && sameDay2(date, end);
          const inRange = end && date > dep && date < end, endpoint = isStart || isEnd;
          return (
            <button key={i} onClick={() => !past && onPick(date)} disabled={past} style={{
              height: 30, border: 'none', cursor: past ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: endpoint ? 700 : 500,
              borderRadius: endpoint ? 6 : (inRange ? 0 : 6), background: endpoint ? WF.accent : inRange ? WF.fillStrong : 'transparent',
              color: past ? '#CBD5E1' : endpoint ? '#fff' : WF.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{date.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Editable search context bar
// ───────────────────────────────────────────────────────────────────────────
function ContextBar({ s, update }) {
  const [editing, setEditing] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!editing) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setEditing(null); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [editing]);

  const g = s.guests;
  const total = g.adults + (g.youngAdults || 0) + g.children + g.infants;
  const nights = durNights(s.duration);
  const dateText = (s.departMonth && s.departMonth !== 'Any') ? s.departMonth : 'Any month';
  const MONTH_OPTS = ['September 2026', 'October 2026', 'November 2026', 'December 2026', 'Any'];

  const chips = [
    { key: 'dest', label: s.region || 'Any destination', icon: '◍' },
    { key: 'duration', label: s.duration || 'Any length', icon: '◷' },
    { key: 'dates', label: dateText, icon: '▦' },
    { key: 'guests', label: `${total} guest${total !== 1 ? 's' : ''}`, icon: '☻' },
  ];

  const Chip = ({ c }) => {
    const on = editing === c.key;
    return (
      <button onClick={() => setEditing(on ? null : c.key)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, fontFamily: 'inherit',
        border: `1px solid ${on ? WF.accent : WF.line}`, background: on ? WF.fill : WF.panel, cursor: 'pointer', fontSize: 12.5,
      }}>
        <span style={{ color: WF.inkFaint, fontSize: 12 }}>{c.icon}</span>
        <span style={{ color: WF.ink, fontWeight: 600 }}>{c.label}</span>
        <span style={{ color: WF.inkFaint, fontSize: 9 }}>▾</span>
      </button>
    );
  };

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 12px', background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginRight: 2 }}>Search</span>
        {chips.map((c, i) => (
          <React.Fragment key={c.key}>
            {i > 0 && <span style={{ color: WF.inkFaint, fontSize: 12 }}>·</span>}
            <Chip c={c} />
          </React.Fragment>
        ))}
      </div>

      {editing && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 10, boxShadow: '0 12px 32px rgba(15,23,42,0.16)', padding: 16, minWidth: 280 }}>
          {editing === 'dest' && (<>
            <div style={{ fontSize: 11, color: WF.inkLabel, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Destination</div>
            <Pills options={(window.MVAS_REGIONS || []).map((r) => r.name)} value={s.region} onChange={(v) => update({ region: v })} size="sm" />
          </>)}
          {editing === 'duration' && (<>
            <div style={{ fontSize: 11, color: WF.inkLabel, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Duration</div>
            <Pills options={[...(window.DURATION_BANDS || []).map((b) => b.label), 'Any']} value={s.duration} onChange={(v) => update({ duration: v })} size="sm" />
          </>)}
          {editing === 'dates' && (<>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.7, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 8 }}>Months</div>
            <Pills options={MONTH_OPTS} value={s.departMonth || 'Any'} onChange={(v) => update({ departMonth: v })} size="sm" />
          </>)}
          {editing === 'guests' && (<>
            <div style={{ fontSize: 11, color: WF.inkLabel, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Guests</div>
            {[['Adults', 'adults', 1], ['Children', 'children', 0], ['Infants', 'infants', 0]].map(([lbl, k, min]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: WF.ink, fontWeight: 500 }}>{lbl}</span>
                <input
                  type="number"
                  min={min}
                  value={g[k]}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    if (!isNaN(num) && num >= min) update({ guests: { ...g, [k]: num } });
                  }}
                  style={{
                    width: 56, padding: '6px 8px', fontSize: 13, fontWeight: 700,
                    fontFamily: 'ui-monospace, monospace', border: `1px solid ${WF.line}`,
                    borderRadius: 6, textAlign: 'center', color: WF.ink, outline: 'none',
                    background: WF.panel
                  }}
                />
              </div>
            ))}
          </>)}
        </div>
      )}
    </div>
  );
}

window.Step2_common = true;
window.CABIN_SUPP_PREFIX = CABIN_SUPP_PREFIX;
window.cabinSuppKey = cabinSuppKey;
window.isCabinSuppKey = isCabinSuppKey;
window.cabinCategoryName = cabinCategoryName;
window.CABIN_ALLOC_CATS = CABIN_ALLOC_CATS;
window.buildCabinGuestMap = buildCabinGuestMap;
window.pruneCabinSuppAssignments = pruneCabinSuppAssignments;
