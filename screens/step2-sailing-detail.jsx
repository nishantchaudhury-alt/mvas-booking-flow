// Sailing Detail View — Redesigned with tabs and new header layout
// Retains original design language and component styles

// See step2-sailing.jsx — same shared accent, name kept for its call sites.
const S2_TEAL = WF.accentInk;
const S2_TEAL_TINT = WF.accentTint;

// ──────────────────────────────────────────────────────────────────
// Cruise Itinerary — derived live from the sailing's own port stops.
// This used to be a hand-written narrative keyed to one sailing code,
// which left every other sailing with an empty dropdown and went stale
// the moment itineraries changed; the day-by-day now comes from the
// same `ports` array the route label and detail tabs read.
// ──────────────────────────────────────────────────────────────────
function itineraryOf(sailingCode) {
  const s = getSailing(sailingCode);
  if (!s || !s.ports || !s.ports.length) return [];
  const lastDay = s.ports[s.ports.length - 1].day;
  return s.ports.map((p) => {
    const short = p.port.split(',')[0];
    if (p.day === 1) return { day: 1, port: `Depart ${short}`, type: 'depart', icon: '⚓', description: `Board and set sail from ${p.port} at ${p.dep}.` };
    if (p.day === lastDay) return { day: p.day, port: `Return to ${short}`, type: 'return', icon: '⚓', description: `Arrive back in ${p.port} at ${p.arr}. Disembarkation follows breakfast.` };
    if (p.port === 'At sea') return { day: p.day, port: 'At Sea', type: 'sea', icon: '〰️', description: 'Full day at sea — dining, entertainment and ship activities.' };
    return { day: p.day, port: p.port, type: 'port', icon: '🏝️', description: `Arrive ${p.arr} · Depart ${p.dep}` };
  });
}

// ──────────────────────────────────────────────────────────────────
// Cruise Itinerary top-right button + dial-up dropdown panel
// ──────────────────────────────────────────────────────────────────
function CruiseItineraryButton({ sailingCode, open, onToggle, onClose }) {
  const itinerary = itineraryOf(sailingCode);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff', border: `1px solid ${WF.line}`,
          cursor: 'pointer', fontFamily: 'inherit',
          padding: '6px 12px', borderRadius: 6,
          fontSize: 12, fontWeight: 600,
          color: WF.inkSoft
        }}>
        <span style={{ fontSize: 13 }}>⚓</span>
        Cruise Itinerary
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 40,
          width: 340, maxHeight: 380, overflowY: 'auto',
          background: '#fff', border: `1px solid ${WF.line}`, borderRadius: 10,
          boxShadow: '0 12px 32px rgba(15,23,42,0.16)', padding: 12
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 10, padding: '0 2px' }}>
            Cruise Itinerary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itinerary.map((day) => (
              <div key={day.day} style={{ padding: '10px 12px', borderRadius: 6, border: `1.5px solid ${WF.line}`, background: WF.panel }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, marginBottom: 3 }}>
                  Day {day.day}: {day.port}
                </div>
                <div style={{ fontSize: 10, color: WF.inkSoft, lineHeight: 1.4 }}>
                  {day.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.CruiseItineraryButton = CruiseItineraryButton;

// ──────────────────────────────────────────────────────────────────
// Tab navigation (using existing design language)
// ──────────────────────────────────────────────────────────────────
function SailingDetailTabs({ activeTab, onTabChange, s, children }) {
  // The three tabs are a sequence — pick a fare, assign rooms, add extras —
  // so each carries its step number, which flips to a check once that step
  // holds real data. Free navigation is unchanged; the chips only *report*.
  const g = (s && s.guests) || {};
  const totalGuests = (g.adults || 0) + (g.youngAdults || 0) + (g.children || 0) + (g.infants || 0);
  const extrasCount = Object.keys((s && s.selectedSupps) || {}).length;
  const tabs = [
    { id: 'fare', label: 'Farecode & Guest Count', n: 1, done: !!(s && s.farecodeId && totalGuests > 0) },
    { id: 'stateroom', label: 'Stateroom Assignment', n: 2, done: !!(s && (s.cabins || []).length > 0) },
    { id: 'supplements', label: 'Supplements', n: 3, done: extrasCount > 0 }
  ];

  return (
    <div>
      {/* A single continuous segmented track (equal-width segments spanning the
          full row) rather than free-floating rounded pills — this is a step
          navigator, not a selector, and the old left-clustered pills read as
          just another pill row stacked on top of the farecode pills below it. */}
      <div style={{
        display: 'flex', border: `1px solid ${WF.line}`, borderRadius: 8,
        overflow: 'hidden', marginBottom: 20, background: WF.panel
      }}>
        {tabs.map((tab, i) => {
          const on = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={on ? 'step' : undefined}
              style={{
                flex: 1, padding: '9px 12px', fontSize: 12, fontWeight: on ? 700 : 500,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                border: 'none', borderRight: i < tabs.length - 1 ? `1px solid ${WF.line}` : 'none',
                background: on ? WF.accentOn : 'transparent',
                color: on ? '#fff' : WF.inkSoft,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'background 0.12s'
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = WF.fill; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{
                width: 16, height: 16, borderRadius: 8, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9.5, fontWeight: 700, lineHeight: 1,
                background: on ? 'rgba(255,255,255,0.22)' : (tab.done ? S2_TEAL_TINT : WF.fill),
                color: on ? '#fff' : (tab.done ? S2_TEAL : WF.inkFaint),
                border: on ? 'none' : `1px solid ${tab.done ? WF.accentLine : WF.line}`
              }}>{tab.done ? '✓' : tab.n}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* Deliberately unstyled: each tab panel sizes to its own content and the
          page scrolls. Nothing here may clip — the itinerary popover opens
          upward out of this subtree. */}
      <div>
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Guest Count + Guest Ages capture (Farecode & Guest Count tab)
// ──────────────────────────────────────────────────────────────────
const S2_GUEST_TYPES = [
  { key: 'adults',      label: 'Adults',       sub: 'Age 21+',   heading: 'ADULTS' },
  { key: 'youngAdults', label: 'Young Adults', sub: 'Age 13-21', heading: 'YOUNG ADULTS' },
  { key: 'children',    label: 'Children',     sub: 'Age 3-12',  heading: 'CHILDREN' },
  { key: 'infants',     label: 'Infants',      sub: 'Age 0-3',   heading: 'INFANTS' }
];

// Age bands are captured by guest-type selection now, so there's no
// per-guest age field left to validate — any count is a complete count.
function guestAgesComplete(s) {
  return true;
}

function GuestCountAgesSection({ s, update }) {
  const g = s.guests || { adults: 0, youngAdults: 0, children: 0, infants: 0 };

  const setCount = (key, val) => {
    update({ guests: { ...g, [key]: val } });
  };

  const totalGuests = (g.adults || 0) + (g.youngAdults || 0) + (g.children || 0) + (g.infants || 0);

  return (
    <div>
      {/* ── Section header — same eyebrow treatment as "Available Farecodes"
          above it (neutral grey, not teal): teal is reserved for interactive
          state (active tab, filled guest card) so it stays meaningful there
          instead of also decorating static labels. ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase' }}>
            Guests
          </div>
          <div style={{ fontSize: 11, color: WF.inkSoft, marginTop: 2 }}>Set the count for each guest type</div>
        </div>
        {totalGuests > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: WF.ink, background: '#F1F5F9', border: `1px solid ${WF.line}`, borderRadius: 20, padding: '4px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'} total
          </div>
        )}
      </div>

      {/* ── One card per guest type, side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
        {S2_GUEST_TYPES.map(({ key, label, sub }) => {
          const count = g[key] || 0;
          return (
            <div key={key} style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '10px 12px', borderRadius: 6,
              border: `1px solid ${WF.line}`,
              background: WF.panel
            }}>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{label}</div>
                <div style={{ fontSize: 10, color: WF.inkFaint, marginTop: 2 }}>{sub}</div>
              </div>
              <GuestCountStepper value={count} min={0} onChange={(v) => setCount(key, v)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Compact +/- stepper for guest-count cards — refined proportions ──
function GuestCountStepper({ value, min, onChange }) {
  const atMin = value <= min;
  const btnStyle = {
    width: 34, height: 34, borderRadius: 5, border: 'none', background: WF.fill,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 600, color: WF.inkSoft, fontFamily: 'inherit', cursor: 'pointer', lineHeight: 1
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        style={{ ...btnStyle, color: atMin ? WF.inkFaint : WF.inkSoft, cursor: atMin ? 'not-allowed' : 'pointer' }}>
        −
      </button>
      <span style={{ fontSize: 22, fontWeight: 700, color: WF.ink, flex: 1, textAlign: 'center' }}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        style={btnStyle}>
        +
      </button>
    </div>
  );
}

window.guestAgesComplete = guestAgesComplete;

// ──────────────────────────────────────────────────────────────────
// Main Sailing Detail Component (tabbed layout, original design)
// ──────────────────────────────────────────────────────────────────
function SailingDetailView({ sailing, s, update, previewPkgId, onPkgPreview, onContinue }) {
  // Resume on the furthest tab the user had already completed, instead of
  // always restarting at "Farecode" — otherwise every remount of this view
  // (e.g. bouncing back from Step 4) makes a fully-configured booking look
  // like it needs to be redone from the top.
  const [activeTab, setActiveTab] = React.useState(() => {
    if (s.cabins && s.cabins.length > 0) return 'supplements';
    if (s.farecodeId) return 'stateroom';
    return 'fare';
  });
  const [selectedDay, setSelectedDay] = React.useState(1);

  const nights = sailing.nights;
  const route = routeOf(sailing);
  const g = s.guests;
  const canContinue = !!(s.selectedSailingCode && s.cabinId && s.farecodeId);

  const toggleSupp = (qtyObj, assignments) => {
    // qtyObj is { suppId: qty, ... }; assignments is
    // { suppId: { guestKey|cabin:id: qty } }.
    update({
      selectedSupps: qtyObj,
      suppAssignments: assignments !== undefined ? assignments : s.suppAssignments
    });
  };

  const DeckMap = window.CabinDeckMapSection;

  return (
    <div style={{ padding: '18px 20px 22px' }}>
      {/* ── HEADER (compact row layout) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${WF.line}` }}>
        {/* Col 1: Nights pill */}
        <div style={{
          flexShrink: 0, background: WF.accent, color: '#fff', borderRadius: 5,
          padding: '4px 8px', fontSize: 10.5, fontWeight: 700,
          textAlign: 'center', minWidth: 44, lineHeight: 1.2
        }}>
          {nights}N
        </div>

        {/* Col 2: Route + ship info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: WF.ink, marginBottom: 2 }}>
            {route}
          </div>
          <div style={{ fontSize: 11, color: WF.inkSoft }}>
            {sailing.ship} <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span> {sailing.code}
          </div>
          <div style={{ fontSize: 10.5, color: WF.inkFaint, marginTop: 3 }}>
            {sailing.code === 'SAIL-77821' ? 'FRI - MON · Sep 11 - Sep 14' : `${sailing.depart}`}
          </div>
        </div>

        {/* Col 3: Price (right) */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: WF.ink, letterSpacing: -0.3 }}>
            $451<span style={{ fontSize: 11, fontWeight: 600 }}>/pp</span>
          </div>
          <div style={{ fontSize: 10.5, color: WF.inkFaint }}>avg</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <SailingDetailTabs activeTab={activeTab} onTabChange={setActiveTab} s={s}>
        {activeTab === 'fare' && (
          <div>
            {/* ── Rate plan cards ──
                The farecode decides price, deposit rate AND refund policy —
                the most consequential commercial choice on this tab — yet it
                used to be a one-line pill smaller than the category filter
                chips on the next tab. Cards give each plan's three facts a
                fixed slot (code+policy / price / deposit), so plans are
                compared by scanning aligned rows rather than parsing
                variable-length pill text. Selection styling matches the
                destination filter cards: navy border, light-blue tint, ✓
                badge — one "selected card" pattern across the product. */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase' }}>
                  Available Farecodes & Promotions ({S2_FC.length})
                </div>
                <div style={{ fontSize: 11, color: WF.inkSoft, marginTop: 2 }}>Sets the per-person fare, deposit due now, and refund policy</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8, marginBottom: 12 }}>
                {S2_FC.map((f) => {
                  const on = s.farecodeId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update({ farecodeId: on ? null : f.id })}
                      style={{
                        position: 'relative', textAlign: 'left',
                        padding: '12px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${on ? '#0D2533' : WF.line}`,
                        background: on ? '#EBF2FF' : '#fff',
                        boxShadow: on ? '0 1px 3px rgba(13,37,51,0.10)' : 'none',
                        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => { if (!on) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; } }}
                      onMouseLeave={(e) => { if (!on) { e.currentTarget.style.borderColor = WF.line; e.currentTarget.style.background = '#fff'; } }}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.35)'; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = on ? '0 1px 3px rgba(13,37,51,0.10)' : 'none'; }}>
                      {/* Code + refund policy */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.2, color: WF.ink }}>{f.code}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: 0.3, padding: '2px 6px', borderRadius: 4,
                          background: f.refundable ? S2_TEAL_TINT : WF.fill,
                          color: f.refundable ? S2_TEAL : WF.inkSoft,
                          border: `1px solid ${f.refundable ? WF.accentLine : WF.line}`
                        }}>{f.refundable ? 'REFUNDABLE' : 'NON-REFUND'}</span>
                      </div>
                      {/* Price — the comparison number, aligned across cards */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: WF.ink, letterSpacing: -0.3, fontFamily: 'ui-monospace, monospace' }}>
                          ${f.pricePP.toFixed(0)}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: WF.inkSoft }}>/pp</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: WF.inkSoft, marginTop: 3 }}>
                        {Math.round(f.deposit * 100)}% deposit due now
                      </div>
                      {/* Selected badge — colour-independent signal, same as the
                          destination cards */}
                      <span aria-hidden="true" style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 16, height: 16, borderRadius: 8,
                        background: '#0D2533', color: '#fff', fontSize: 9.5, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(0.4)',
                        transition: 'opacity 0.15s, transform 0.15s'
                      }}>✓</span>
                    </button>);
                })}
              </div>
              {s.farecodeId &&
              <div style={{ fontSize: 11, color: '#9CA3AF', paddingTop: 2 }}>
                  <span style={{ color: WF.inkSoft, fontWeight: 500 }}>Selected Rate Plan</span>
                  {' · '}{S2_FC.find(f => f.id === s.farecodeId)?.note}
                </div>
              }
            </div>

            <div style={{ height: 1, background: WF.lineSoft, margin: '20px 0' }} />

            {/* Guest count + guest ages */}
            <GuestCountAgesSection s={s} update={update} />
          </div>
        )}

        {activeTab === 'stateroom' && (
          <div>
            {window.StateRoomMatrix
              ? <window.StateRoomMatrix update={update} s={s} onConfirmRooms={() => setActiveTab('supplements')} />
              : <div style={{ fontSize: 13, color: WF.inkSoft }}>Loading stateroom matrix…</div>
            }
          </div>
        )}

        {activeTab === 'supplements' && (
          <div>
            {/* Packages have been retired. Room confirmation lands directly
                on the individual supplement catalog. */}
            <SupplementsSection
              selectedSupps={s.selectedSupps}
              guests={s.guests}
              suppAssignments={s.suppAssignments}
              onToggle={toggleSupp} />
          </div>
        )}
      </SailingDetailTabs>

      {/* Tab action button — navigate to Stateroom Assignment */}
      {activeTab === 'fare' && s.farecodeId && (() => {
        const totalGuests = (g.adults || 0) + (g.youngAdults || 0) + (g.children || 0) + (g.infants || 0);
        const ready = totalGuests > 0 && guestAgesComplete(s);
        return (
          <div style={{ padding: '20px 0 0', borderTop: `1px solid ${WF.line}`, marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => ready && setActiveTab('stateroom')}
              disabled={!ready}
              style={{
                padding: '9px 18px', fontSize: 13, fontWeight: 600,
                border: 'none', borderRadius: 8,
                background: ready ? '#0D2533' : '#E2E8F0', color: ready ? '#fff' : '#94A3B8',
                cursor: ready ? 'pointer' : 'not-allowed', fontFamily: 'inherit', letterSpacing: 0.1,
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={(e) => { if (ready) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Proceed to Stateroom Assignment →
            </button>
          </div>
        );
      })()}
    </div>
  );
}

window.SailingDetailView = SailingDetailView;
