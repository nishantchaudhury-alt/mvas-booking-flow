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
function itineraryDate(departure, day) {
  const date = new Date(`${departure} 12:00:00`);
  if (Number.isNaN(date.getTime())) return `Day ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

function itineraryTime(value) {
  if (!value || value === '—') return '—';
  const [hourString, minute = '00'] = String(value).split(':');
  const hour = Number(hourString);
  if (!Number.isFinite(hour)) return value;
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function itineraryOf(sailingCode) {
  const sailing = getSailing(sailingCode);
  if (!sailing || !sailing.ports || !sailing.ports.length) return [];
  const lastDay = sailing.ports[sailing.ports.length - 1].day;
  return sailing.ports.map((stop) => {
    const isDeparture = stop.day === 1;
    const isReturn = stop.day === lastDay;
    const isSeaDay = stop.port === 'At sea';
    const type = isDeparture ? 'departure' : isReturn ? 'return' : isSeaDay ? 'sea' : 'port';
    const status = isDeparture ? 'Embarkation' : isReturn ? 'Return' : isSeaDay ? 'Sea day' : 'Port day';
    const timingLabel = isDeparture ? 'Departure' : isReturn ? 'Arrival' : isSeaDay ? 'Schedule' : 'Port hours';
    const timing = isDeparture
      ? itineraryTime(stop.dep)
      : isReturn
        ? itineraryTime(stop.arr)
        : isSeaDay
          ? 'Cruising'
          : `${itineraryTime(stop.arr)} – ${itineraryTime(stop.dep)}`;
    return {
      ...stop,
      type,
      status,
      timingLabel,
      timing,
      date: itineraryDate(sailing.depart, stop.day),
    };
  });
}

// ──────────────────────────────────────────────────────────────────
// Itinerary action + dial-up dropdown panel
// ──────────────────────────────────────────────────────────────────
function CruiseItineraryButton({ sailingCode, open, onToggle, onClose, fitContainer = false }) {
  const sailing = getSailing(sailingCode);
  const itinerary = itineraryOf(sailingCode);
  const triggerRef = React.useRef(null);
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(null);
  const dialogId = `sailing-itinerary-${String(sailingCode || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const itineraryProduct = sailing ? getGroupCruiseForSailing(sailing.code) : null;
  const destinationStops = itinerary.filter((day) => day.type === 'port');
  const seaDays = itinerary.filter((day) => day.type === 'sea').length;
  const voyageStops = itineraryProduct && itineraryProduct.portSummary
    ? itineraryProduct.portSummary.replace(/ · /g, ' & ')
    : destinationStops.map((day) => day.port.split(',')[0]).join(' & ');
  const voyageTitle = sailing ? `${sailing.nights}N ${voyageStops || sailing.region}` : 'Sailing itinerary';
  const firstDay = itinerary[0];
  const lastDay = itinerary[itinerary.length - 1];

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeRef.current && closeRef.current.focus());
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter((element) => !element.disabled && element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => triggerRef.current && triggerRef.current.focus());
    };
  }, [open, onClose]);

  const dialog = open && sailing && ReactDOM.createPortal(
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'grid', placeItems: 'center', padding: 20,
        background: 'rgba(15,23,42,.52)',
      }}>
      <section
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-subtitle`}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(720px, 100%)', maxHeight: 'calc(100vh - 40px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: `1px solid ${WF.line}`, borderRadius: 10,
          background: WF.panel, boxShadow: '0 24px 64px rgba(15,23,42,.28)',
        }}>
        <header style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          borderBottom: `1px solid ${WF.line}`, background: WF.panel,
        }}>
          <div style={{ minWidth: 0 }}>
            <h2 id={`${dialogId}-title`} style={{ margin: 0, color: WF.ink, fontSize: 16, lineHeight: '24px', fontWeight: 700 }}>
              Full itinerary
            </h2>
            <div id={`${dialogId}-subtitle`} style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>
              {sailing.ship} · {sailing.nights}-night sailing
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close itinerary"
            onClick={onClose}
            style={{
              width: 40, height: 40, flex: '0 0 auto', borderRadius: 20,
              border: `1px solid ${WF.controlLine}`, background: WF.panel,
              color: WF.ink, fontFamily: 'inherit', fontSize: 20, lineHeight: 1, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}>×</button>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20, background: WF.fill }}>
          <section aria-label="Voyage overview" style={{
            border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden',
            background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,.06)',
          }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${WF.lineSoft}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: WF.inkLabel, fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Voyage</div>
                <div style={{ marginTop: 4, color: WF.ink, fontSize: 16, lineHeight: '24px', fontWeight: 700 }}>{voyageTitle}</div>
              </div>
              <span style={{ flex: '0 0 auto', padding: '8px 12px', borderRadius: 99, border: `1px solid ${WF.accentLine}`, background: WF.accentTint, color: WF.accent, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>
                {sailing.nights} nights
              </span>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 100px minmax(0, 1fr)', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ color: WF.inkLabel, fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Departure</div>
                <div style={{ marginTop: 4, color: WF.ink, fontSize: 14, lineHeight: '20px', fontWeight: 700 }}>{firstDay && firstDay.date}</div>
                <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>{firstDay && firstDay.port}</div>
              </div>
              <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 8, color: WF.inkFaint }}>
                <span style={{ height: 1, flex: 1, background: WF.line }} />
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h9M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ height: 1, flex: 1, background: WF.line }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: WF.inkLabel, fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Return</div>
                <div style={{ marginTop: 4, color: WF.ink, fontSize: 14, lineHeight: '20px', fontWeight: 700 }}>{lastDay && lastDay.date}</div>
                <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>{lastDay && lastDay.port}</div>
              </div>
            </div>
          </section>

          <section aria-labelledby={`${dialogId}-schedule-title`} style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
              <div>
                <h3 id={`${dialogId}-schedule-title`} style={{ margin: 0, color: WF.ink, fontSize: 16, lineHeight: '24px', fontWeight: 700 }}>Day-by-day schedule</h3>
                <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>
                  {destinationStops.length} port {destinationStops.length === 1 ? 'day' : 'days'} · {seaDays} sea {seaDays === 1 ? 'day' : 'days'} · All times local
                </div>
              </div>
              <span style={{ flex: '0 0 auto', padding: '4px 8px', borderRadius: 99, border: `1px solid ${WF.line}`, background: WF.panel, color: WF.inkSoft, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>
                {itinerary.length} days
              </span>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {itinerary.map((day) => (
                <article key={day.day} style={{
                  minHeight: 80, display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr) 150px',
                  alignItems: 'stretch', border: `1px solid ${WF.line}`, borderRadius: 8,
                  background: WF.panel, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,.04)',
                }}>
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: day.type === 'departure' || day.type === 'return' ? WF.accentTint : WF.fill, borderRight: `1px solid ${WF.lineSoft}` }}>
                    <div style={{ color: WF.inkLabel, fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Day {day.day}</div>
                    <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>{day.date}</div>
                  </div>
                  <div style={{ minWidth: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ alignSelf: 'flex-start', padding: '4px 8px', borderRadius: 99, border: `1px solid ${day.type === 'departure' || day.type === 'return' ? WF.accentLine : WF.line}`, background: day.type === 'departure' || day.type === 'return' ? WF.accentTint : WF.fill, color: WF.inkSoft, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>
                      {day.status}
                    </span>
                    <div style={{ marginTop: 4, color: WF.ink, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>{day.port}</div>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', borderLeft: `1px solid ${WF.lineSoft}` }}>
                    <div style={{ color: WF.inkLabel, fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{day.timingLabel}</div>
                    <div className="s4-money" style={{ marginTop: 4, color: WF.ink, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>{day.timing}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: fitContainer ? '100%' : 'auto' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? dialogId : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: fitContainer ? 'center' : 'flex-start', gap: 8,
          background: '#fff', border: `1px solid ${WF.line}`,
          cursor: 'pointer', fontFamily: 'inherit',
          width: fitContainer ? '100%' : 'auto',
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
      {dialog}
    </div>
  );
}

window.CruiseItineraryButton = CruiseItineraryButton;

// ──────────────────────────────────────────────────────────────────
// Selected sailing context — compact, persistent summary for the right rail.
// It is intentionally the one sailing summary in the booking workspace: the
// main canvas is reserved for the task at hand, while this rail remains visible
// throughout fare, room, supplement and guest work.
// ──────────────────────────────────────────────────────────────────
function SelectedSailingRailSummary({ sailing }) {
  const [showItinerary, setShowItinerary] = React.useState(false);
  const nights = sailing.nights;
  const route = routeOf(sailing);
  const itineraryProduct = getGroupCruiseForSailing(sailing.code);
  const destination = (itineraryProduct && itineraryProduct.region) || sailing.region || route;
  const tripTitle = `${nights} ${nights === 1 ? 'Night' : 'Nights'} in ${destination}`;
  const bookingWindow = getWindowForSailing(sailing.code);

  return (
    <section aria-label="Selected sailing summary" style={{
      border: `1px solid ${WF.line}`, borderRadius: 8,
      background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
    }}>
      <div style={{ padding: 12, borderBottom: `1px solid ${WF.line}`, background: WF.fill, borderRadius: '8px 8px 0 0' }}>
        <div style={{
          fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '0.04em',
          color: WF.inkLabel, textTransform: 'uppercase',
        }}>Selected sailing</div>
        <div style={{
          marginTop: 4, fontSize: 16, lineHeight: '24px', fontWeight: 700, color: WF.ink,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{tripTitle}</div>
      </div>

      <div style={{ display: 'grid', gap: 8, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 12, lineHeight: '16px', color: WF.inkSoft }}>Ship</span>
          <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, color: WF.ink, textAlign: 'right' }}>{sailing.ship}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 12, lineHeight: '16px', color: WF.inkSoft, flexShrink: 0 }}>Sailing dates</span>
          <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, color: WF.ink, textAlign: 'right' }}>
            {bookingWindow ? bookingWindow.display : sailing.depart}
          </span>
        </div>
        <CruiseItineraryButton
          sailingCode={sailing.code}
          open={showItinerary}
          onToggle={() => setShowItinerary((value) => !value)}
          onClose={() => setShowItinerary(false)}
          fitContainer />
      </div>
    </section>
  );
}

window.SelectedSailingRailSummary = SelectedSailingRailSummary;

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
          page scrolls. Nothing here may clip; the itinerary renders in a
          document-level dialog portal outside this subtree. */}
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
    // Read the newest booking snapshot inside the router update. Using the
    // render-time `g` object here can lose a fast consecutive change when React
    // batches events, leaving the summary rail one interaction behind.
    update((current) => ({
      guests: {
        ...(current.guests || { adults: 0, youngAdults: 0, children: 0, infants: 0 }),
        [key]: Math.max(0, Math.floor(Number(val) || 0)),
      },
    }));
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

  const toggleSupp = (qtyObj, assignments, birthDates) => {
    // qtyObj is { suppId: qty, ... }; assignments remains guest-level even
    // though the panel visually groups those guests by cabin.
    update({
      selectedSupps: qtyObj,
      suppAssignments: assignments !== undefined ? assignments : s.suppAssignments,
      guestBirthDates: birthDates !== undefined ? birthDates : s.guestBirthDates
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
              guestBirthDates={s.guestBirthDates}
              referenceDate={sailing.depart}
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
