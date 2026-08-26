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
        overflow: 'hidden', marginBottom: 10, background: WF.panel
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
  const availability = availabilityOf(sailing);
  const bookingWindow = getWindowForSailing(sailing.code);
  const availabilityBg = availability.kind === 'active' ? '#D1FAE5' : availability.kind === 'draft' ? '#FEF3C7' : '#FEE2E2';
  const availabilityText = availability.kind === 'active' ? '#065F46' : availability.kind === 'draft' ? '#92400E' : '#DC2626';

  const toggleSupp = (qtyObj, assignments) => {
    // qtyObj is { suppId: qty, ... }; assignments remains guest-level even
    // though the panel visually groups those guests by cabin.
    update({
      selectedSupps: qtyObj,
      suppAssignments: assignments !== undefined ? assignments : s.suppAssignments
    });
  };

  const DeckMap = window.CabinDeckMapSection;

  return (
    <div style={{ padding: '14px 16px 18px' }}>
      {/* ── SAILING SUMMARY ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '58px minmax(150px, 1.15fr) minmax(240px, 1.45fr) 112px',
        alignItems: 'center', gap: 14, marginBottom: 14, padding: '11px 12px',
        border: `1px solid ${WF.line}`, borderRadius: 9, background: WF.fill,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}>
        <div style={{
          width: 56, height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${WF.line}`, borderRadius: 7, background: '#FFFFFF', color: WF.ink,
        }}>
          <span className="s4-money" style={{ fontSize: 16, lineHeight: 1, fontWeight: 800 }}>{nights}</span>
          <span style={{ marginTop: 3, fontSize: 8, lineHeight: 1, fontWeight: 750, letterSpacing: 0.55, color: WF.inkLabel }}>NIGHTS</span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: WF.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route}</div>
            <span style={{
              flexShrink: 0, padding: '2px 6px', borderRadius: 999,
              background: availabilityBg, color: availabilityText,
              fontSize: 8.5, lineHeight: 1.15, fontWeight: 750,
            }}>{availability.label}</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10.5, color: WF.inkSoft }}>Selected sailing</div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '0.85fr 0.95fr 1.45fr', gap: 12,
          minWidth: 0, paddingLeft: 14, borderLeft: `1px solid ${WF.line}`,
        }}>
          {[
            ['Ship', sailing.ship],
            ['Sailing', sailing.code],
            ['Dates', bookingWindow ? bookingWindow.display : sailing.depart],
          ].map(([label, value]) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 8.5, lineHeight: 1, fontWeight: 750, letterSpacing: 0.5, color: WF.inkLabel, textTransform: 'uppercase' }}>{label}</div>
              <div className={label === 'Sailing' ? 's4-money' : undefined} style={{
                marginTop: 5, fontSize: label === 'Dates' ? 10 : 10.5, lineHeight: 1.2,
                fontWeight: 650, color: WF.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'right', paddingLeft: 12, borderLeft: `1px solid ${WF.line}` }}>
          <div style={{ fontSize: 8.5, lineHeight: 1, fontWeight: 750, letterSpacing: 0.5, color: WF.inkLabel, textTransform: 'uppercase' }}>Average fare</div>
          <div className="s4-money" style={{ marginTop: 5, fontSize: 17, lineHeight: 1, fontWeight: 800, color: WF.ink }}>$451</div>
          <div style={{ marginTop: 3, fontSize: 9, color: WF.inkFaint }}>per guest</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <SailingDetailTabs activeTab={activeTab} onTabChange={setActiveTab} s={s}>
        {activeTab === 'fare' && (
          <div style={{ display: 'grid', gap: 10 }}>
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
            <div style={{
              border: `1px solid ${WF.line}`, borderRadius: 9,
              background: '#FFFFFF', overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: `1px solid ${WF.line}`, background: WF.fill }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase' }}>
                  Available Farecodes & Promotions ({S2_FC.length})
                </div>
                <div style={{ fontSize: 11, color: WF.inkSoft, marginTop: 2 }}>Sets the per-person fare, deposit due now, and refund policy</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8, padding: '11px 12px' }}>
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
                        border: `1.5px solid ${on ? WF.accent : WF.line}`,
                        background: on ? WF.accentTint : '#fff',
                        boxShadow: on ? '0 1px 3px rgba(13,37,51,0.10)' : 'none',
                        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => { if (!on) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; } }}
                      onMouseLeave={(e) => { if (!on) { e.currentTarget.style.borderColor = WF.line; e.currentTarget.style.background = '#fff'; } }}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${WF.accentLine}`; }}
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
                        background: WF.accent, color: WF.accentText, fontSize: 9.5, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(0.4)',
                        transition: 'opacity 0.15s, transform 0.15s'
                      }}>✓</span>
                    </button>);
                })}
              </div>
              {s.farecodeId &&
              <div style={{
                padding: '8px 12px', borderTop: `1px solid ${WF.accentLine}`,
                background: WF.accentTint, fontSize: 10.5, color: WF.inkSoft,
              }}>
                  <span style={{ color: WF.ink, fontWeight: 700 }}>Selected rate plan</span>
                  {' · '}{S2_FC.find(f => f.id === s.farecodeId)?.note}
                </div>
              }
            </div>

            {/* Guest count + guest ages */}
            <div style={{ padding: 12, border: `1px solid ${WF.line}`, borderRadius: 9, background: '#FFFFFF' }}>
              <GuestCountAgesSection s={s} update={update} />
            </div>
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
              cabins={s.cabins}
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
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            padding: '10px 12px', marginTop: 10,
            border: `1px solid ${WF.line}`, borderRadius: 9, background: WF.fill,
          }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 750, color: WF.ink }}>
                {ready ? 'Fare and guest count complete' : 'Complete fare and guest count'}
              </div>
              <div style={{ marginTop: 2, fontSize: 9.5, color: WF.inkSoft }}>
                {ready ? `${totalGuests} guests ready for room assignment` : 'Required before choosing staterooms'}
              </div>
            </div>
            <button
              onClick={() => ready && setActiveTab('stateroom')}
              disabled={!ready}
              style={{
                padding: '9px 16px', fontSize: 12, fontWeight: 700,
                border: 'none', borderRadius: 8,
                background: ready ? WF.accent : WF.fillStrong, color: ready ? WF.accentText : WF.inkFaint,
                cursor: ready ? 'pointer' : 'not-allowed', fontFamily: 'inherit', letterSpacing: 0.1,
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={(e) => { if (ready) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Continue to staterooms →
            </button>
          </div>
        );
      })()}
    </div>
  );
}

window.SailingDetailView = SailingDetailView;
