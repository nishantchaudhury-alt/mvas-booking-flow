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
// Itinerary action + dial-up dropdown panel
// ──────────────────────────────────────────────────────────────────
function CruiseItineraryButton({ sailingCode, open, onToggle, onClose }) {
  const itinerary = itineraryOf(sailingCode);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff', border: `1px solid ${WF.line}`,
          cursor: 'pointer', fontFamily: 'inherit',
          minHeight: 40, padding: '8px 12px', borderRadius: 6,
          fontSize: 12, fontWeight: 700,
          color: WF.ink
        }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2.5 3.5L5.5 2l5 2 3-1.5v10l-3 1.5-5-2-3 1.5v-10Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M5.5 2v10M10.5 4v10" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        View itinerary
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 40,
          width: 340, maxHeight: 380, overflowY: 'auto',
          background: '#fff', border: `1px solid ${WF.line}`, borderRadius: 10,
          boxShadow: '0 12px 32px rgba(15,23,42,0.16)', padding: 12
        }} role="dialog" aria-label="Sailing itinerary">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 12, padding: '0 4px' }}>
            Sailing itinerary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itinerary.map((day) => (
              <div key={day.day} style={{ padding: '12px 12px', borderRadius: 6, border: `1.5px solid ${WF.line}`, background: WF.panel }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, marginBottom: 4 }}>
                  Day {day.day}: {day.port}
                </div>
                <div style={{ fontSize: 12, color: WF.inkSoft, lineHeight: '16px' }}>
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
// Selected sailing context — page-level summary shown above the
// transactional fare / stateroom / supplement workspace.
// ──────────────────────────────────────────────────────────────────
function SelectedSailingSummary({ sailing }) {
  const [showItinerary, setShowItinerary] = React.useState(false);
  const nights = sailing.nights;
  const route = routeOf(sailing);
  const itineraryProduct = getGroupCruiseForSailing(sailing.code);
  const destination = (itineraryProduct && itineraryProduct.region) || sailing.region || route;
  const tripTitle = `${nights} ${nights === 1 ? 'Night' : 'Nights'} in ${destination}`;
  const routeSummary = route || (itineraryProduct && itineraryProduct.portSummary) || destination;
  const bookingWindow = getWindowForSailing(sailing.code);

  return (
    <section aria-label="Selected sailing summary" style={{
      border: `1px solid ${WF.line}`, borderRadius: 9,
      background: '#FFFFFF', boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '16px 16px',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 20, lineHeight: '24px', fontWeight: 700, color: WF.ink,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{tripTitle}</div>
          <div style={{
            marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkSoft,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{routeSummary}</div>
        </div>
        <CruiseItineraryButton
          sailingCode={sailing.code}
          open={showItinerary}
          onToggle={() => setShowItinerary((value) => !value)}
          onClose={() => setShowItinerary(false)} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '0.8fr 1.4fr 0.8fr',
        padding: '12px 16px', borderTop: `1px solid ${WF.line}`,
        borderRadius: '0 0 9px 9px', background: WF.fill,
      }}>
        <div style={{ minWidth: 0, paddingRight: 16 }}>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: WF.inkLabel }}>Ship</div>
          <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: WF.ink }}>{sailing.ship}</div>
        </div>
        <div style={{ minWidth: 0, padding: '0 16px', borderLeft: `1px solid ${WF.line}` }}>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: WF.inkLabel }}>Sailing dates</div>
          <div style={{
            marginTop: 4, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: WF.ink,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{bookingWindow ? bookingWindow.display : sailing.depart}</div>
        </div>
        <div style={{ minWidth: 0, paddingLeft: 16, borderLeft: `1px solid ${WF.line}` }}>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: WF.inkLabel }}>Average fare</div>
          <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px', color: WF.ink, whiteSpace: 'nowrap' }}>
            <span className="s4-money" style={{ fontWeight: 700 }}>$451</span>
            <span style={{ marginLeft: 4, color: WF.inkSoft }}>per guest</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.SelectedSailingSummary = SelectedSailingSummary;

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
        overflow: 'hidden', marginBottom: 12, background: WF.panel
      }}>
        {tabs.map((tab, i) => {
          const on = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={on ? 'step' : undefined}
              style={{
                flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: on ? 700 : 500,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
                fontSize: 12, fontWeight: 700, lineHeight: 1,
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
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: WF.inkLabel, textTransform: 'uppercase' }}>
            Guests
          </div>
          <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>Set the count for each guest type</div>
        </div>
        {totalGuests > 0 && (
          <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, background: '#F1F5F9', border: `1px solid ${WF.line}`, borderRadius: 20, padding: '4px 12px', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
              display: 'flex', flexDirection: 'column', gap: 12,
              padding: '12px 12px', borderRadius: 6,
              border: `1px solid ${WF.line}`,
              background: WF.panel
            }}>
              <div style={{ lineHeight: '16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{label}</div>
                <div style={{ fontSize: 12, color: WF.inkFaint, marginTop: 4 }}>{sub}</div>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        style={{ ...btnStyle, color: atMin ? WF.inkFaint : WF.inkSoft, cursor: atMin ? 'not-allowed' : 'pointer' }}>
        −
      </button>
      <span style={{ fontSize: 24, fontWeight: 700, color: WF.ink, flex: 1, textAlign: 'center' }}>{value}</span>
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
  const g = s.guests;
  const canContinue = !!(s.selectedSailingCode && s.cabinId && s.farecodeId);

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
    <div style={{ padding: '16px 16px 20px' }}>
      {/* ── TABS ── */}
      <SailingDetailTabs activeTab={activeTab} onTabChange={setActiveTab} s={s}>
        {activeTab === 'fare' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {/* Compact comparison module: the three decision facts stay aligned
                across plans without stacking a section card, header card, and
                three oversized choice cards inside the workflow panel. */}
            <div>
              <div style={{
                padding: '4px 0 8px',
              }}>
                <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, color: WF.inkLabel }}>
                  Farecodes &amp; promotions <span style={{ fontWeight: 600 }}>({S2_FC.length})</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
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
                        minHeight: 64, padding: '8px 12px', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'inherit',
                        border: `1px solid ${on ? WF.accent : WF.line}`,
                        background: on ? WF.accentTint : WF.panel,
                        boxShadow: on ? `inset 0 0 0 1px ${WF.accent}` : 'none',
                        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = WF.fill; }}
                      onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = WF.panel; }}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = `${on ? `inset 0 0 0 1px ${WF.accent}, ` : ''}0 0 0 3px ${WF.accentLine}`; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = on ? `inset 0 0 0 1px ${WF.accent}` : 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, letterSpacing: '0.04em', color: WF.ink }}>{f.code}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                          <span style={{
                            minHeight: 20, display: 'inline-flex', alignItems: 'center',
                            fontSize: 12, lineHeight: '16px', fontWeight: 600, padding: '0 8px', borderRadius: 4,
                            background: f.refundable ? S2_TEAL_TINT : WF.fill,
                            color: f.refundable ? S2_TEAL : WF.inkSoft,
                            border: `1px solid ${f.refundable ? WF.accentLine : WF.line}`,
                            whiteSpace: 'nowrap',
                          }}>{f.refundable ? 'Refundable' : 'Non-refundable'}</span>
                          <span aria-hidden="true" style={{
                            width: 16, height: 16, borderRadius: 8, flexShrink: 0,
                            background: WF.accent, color: WF.accentText, fontSize: 12, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            opacity: on ? 1 : 0,
                          }}>✓</span>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 16, lineHeight: '24px', fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>
                            ${f.pricePP.toFixed(0)}
                          </span>
                          <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: WF.inkSoft }}>/person</span>
                        </span>
                        <span style={{ fontSize: 12, lineHeight: '16px', color: WF.inkSoft, whiteSpace: 'nowrap' }}>
                          {Math.round(f.deposit * 100)}% due now
                        </span>
                      </div>
                    </button>);
                })}
              </div>
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
              : <div style={{ fontSize: 14, color: WF.inkSoft }}>Loading stateroom matrix…</div>
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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            padding: '12px 12px', marginTop: 12,
            border: `1px solid ${WF.line}`, borderRadius: 9, background: WF.fill,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>
                {ready ? 'Fare and guest count complete' : 'Complete fare and guest count'}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>
                {ready ? `${totalGuests} guests ready for room assignment` : 'Required before choosing staterooms'}
              </div>
            </div>
            <button
              onClick={() => ready && setActiveTab('stateroom')}
              disabled={!ready}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 700,
                border: 'none', borderRadius: 8,
                background: ready ? WF.accent : WF.fillStrong, color: ready ? WF.accentText : WF.inkFaint,
                cursor: ready ? 'pointer' : 'not-allowed', fontFamily: 'inherit', letterSpacing: '0.04em',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={(e) => { if (ready) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Continue to staterooms
            </button>
          </div>
        );
      })()}
    </div>
  );
}

window.SailingDetailView = SailingDetailView;
