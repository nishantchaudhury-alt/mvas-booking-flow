// ───────────────────────────────────────────────────────────────────────────
// Booking search + filter panel
// Exports SearchFilterPanel, rendered by Step 1 (Sailing, fare & cabin) in
// step2-sailing.jsx. This was once a standalone "Where & when" step; that
// screen is gone — the panel now lives inline above the sailing results
// instead of behind its own navigation step.
// ───────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL · Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const FP_NAVY = '#1B2434';
const FP_BORDER = '#E2E8F0';
const FP_BG = '#F1F5F9';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL · Constants
// Regions, ports and duration bands come from the MVAS catalog in
// intent-data.jsx — one taxonomy shared with filterSailings, never a copy.
// ─────────────────────────────────────────────────────────────────────────────

const FP_REGIONS = window.MVAS_REGIONS;
const FP_HOME_PORTS = window.MVAS_HOME_PORTS;

const FP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FP_YEARS = ['2026', '2027'];
const FP_BOOKING_TYPES = ['Normal', 'Future', 'Channel Partner Booking'];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fpSelectedMonths(selectedMonth) {
  if (!selectedMonth) return [];
  if (Array.isArray(selectedMonth.months)) return selectedMonth.months;
  return selectedMonth.month ? [selectedMonth.month] : [];
}

function fpBuildChips(selectedDestinations, selectedPorts, selectedHomePorts, selectedDuration, selectedMonth) {
  const chips = [];
  (selectedHomePorts || []).forEach((id) => {
    chips.push({ icon: '🛳️', label: mvasHomePortName(id) });
  });
  selectedDestinations.forEach((dest) => {
    const d = FP_REGIONS.find((x) => x.name === dest);
    if (d) chips.push({ icon: d.emoji, label: dest });
  });
  (selectedPorts || []).forEach((pid) => {
    chips.push({ icon: '⚓', label: mvasPortShort(pid) });
  });
  (selectedDuration || []).forEach((bandId) => {
    const band = getDurationBand(bandId);
    chips.push({ icon: '🗓', label: band ? band.label : bandId });
  });
  fpSelectedMonths(selectedMonth).forEach((month) => {
    chips.push({ icon: '📅', label: `${month}${selectedMonth.year ? ` ${selectedMonth.year}` : ''}` });
  });
  return chips;
}

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN PRIMITIVES
//
// One flat row of dropdown triggers replaces the earlier region-chip grid +
// searchable/counted port popover: simpler to scan, and it scales the same
// way whether a facet has 3 options or 22 — a plain list inside a popover,
// no search box, no live counts. Two flavours of content:
//   - single-select rows auto-apply and close on click (Departing From)
//   - multi-select rows need an explicit Done (Departure Dates,
//     Destination(s), Duration),
//     with a Clear alongside for backing out entirely
// ─────────────────────────────────────────────────────────────────────────────

function FPListRow({ label, icon, selected, onClick, multiSelect = false }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 14px', border: 'none',
        background: selected ? '#EBF2FF' : 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        transition: 'background 0.1s'
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      {icon && <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>}
      {multiSelect && (
        <span aria-hidden="true" style={{
          width: 16, height: 16, flexShrink: 0, borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${selected ? FP_NAVY : '#94A3B8'}`,
          background: selected ? FP_NAVY : '#fff', color: '#fff',
          fontSize: 10, fontWeight: 800, lineHeight: 1
        }}>
          {selected ? '✓' : ''}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: selected ? 600 : 500, color: FP_NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {!multiSelect && selected && <span style={{ color: FP_NAVY, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>}
    </button>
  );
}

// Two-way tab switch inside the Destination(s) popover — Regions and Ports of
// Call used to stack in one long scroll; six regions plus twenty-two ports
// read as a wall even without a search box. Splitting them into tabs keeps
// each list short enough to take in at a glance.
function FPSegmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: 3, margin: '6px 14px 8px', background: '#F1F5F9', border: `1px solid ${FP_BORDER}`, borderRadius: 8 }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt)}
            style={{
              flex: 1, padding: '6px 8px', fontSize: 11.5, fontWeight: on ? 700 : 500,
              border: 'none', borderRadius: 6,
              background: on ? '#fff' : 'transparent', color: on ? FP_NAVY : '#64748B',
              boxShadow: on ? '0 1px 2px rgba(15,31,61,0.14)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// A port row carries a live sailing count alongside the label — how many
// sailings match if this port is added on top of the region/home-port/
// duration/month facets already active — so browsing the list doubles as an
// availability check. Zero-count ports dim and stop responding to clicks
// (adding one would only narrow an already-empty result to itself).
function FPPortRow({ label, selected, count, onClick }) {
  const dead = count === 0 && !selected;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={dead}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 14px', border: 'none',
        background: selected ? '#EBF2FF' : 'transparent',
        cursor: dead ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
        opacity: dead ? 0.45 : 1, transition: 'background 0.1s'
      }}
      onMouseEnter={(e) => { if (!selected && !dead) e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: selected ? 600 : 500, color: FP_NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: count === 0 ? '#CBD5E1' : '#64748B', fontFamily: 'ui-monospace, monospace', minWidth: 16, textAlign: 'right' }}>
        {count}
      </span>
      {selected && <span style={{ color: FP_NAVY, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>}
    </button>
  );
}

function FPDropdownFooter({ onClear, onDone, clearDisabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: `1px solid ${FP_BORDER}`, background: '#F8FAFC' }}>
      <button
        type="button"
        onClick={onClear}
        disabled={clearDisabled}
        style={{ border: 'none', background: 'none', padding: 0, fontSize: 11.5, fontWeight: 600, fontFamily: 'inherit', color: clearDisabled ? '#CBD5E1' : '#64748B', cursor: clearDisabled ? 'default' : 'pointer' }}>
        Clear
      </button>
      <button
        type="button"
        onClick={onDone}
        style={{ padding: '5px 14px', fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit', border: 'none', borderRadius: 6, background: FP_NAVY, color: '#fff', cursor: 'pointer' }}>
        Done
      </button>
    </div>
  );
}

// Generic trigger + popover shell. `open`/`onToggle`/`onClose` are lifted to
// the parent so only one dropdown in the row is ever open at a time.
//
// The popover is `position: fixed`, placed via the trigger's own
// getBoundingClientRect rather than `position: absolute` under the trigger.
// This panel's expand/collapse animation relies on an ancestor with
// `overflow: hidden` (the maxHeight trick), and an absolutely-positioned
// popover is clipped by that ancestor the moment it extends past its box —
// which it does for anything longer than a couple of rows. `fixed` escapes
// that clipping (nothing here applies a CSS transform to the ancestors,
// which is the one thing that would drag a fixed element back into their
// containing block), so the popover renders relative to the viewport instead.
function FPDropdown({ label, trigger, open, onToggle, onClose, footer, width = 260, children }) {
  const btnRef = React.useRef(null);
  const [pos, setPos] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current.getBoundingClientRect();
      const w = Math.min(width, window.innerWidth - 16);
      setPos({
        top: r.bottom + 6,
        left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)),
        minWidth: r.width,
      });
    };
    place();
    // Recompute on resize/scroll — the trigger row itself doesn't scroll, but
    // the page around it can.
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, width]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 170 }}>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          minHeight: 48, padding: '7px 11px', borderRadius: 8,
          border: `1px solid ${open ? FP_NAVY : FP_BORDER}`,
          background: open ? '#EFF6FF' : '#fff', color: FP_NAVY,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s', outline: 'none', textAlign: 'left'
        }}>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {label && (
            <span style={{
              fontSize: 9, lineHeight: 1, fontWeight: 750, letterSpacing: 0.45,
              textTransform: 'uppercase', color: '#64748B',
            }}>{label}</span>
          )}
          <span style={{
            fontSize: 12.5, lineHeight: 1.2, fontWeight: 650, color: FP_NAVY,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{trigger}</span>
        </span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 4L6 8L10 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && pos && (
        <>
          {/* Transparent scrim: any click outside commits-and-closes. */}
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'fixed', top: pos.top, left: pos.left, zIndex: 41,
            width: Math.max(width, pos.minWidth), maxWidth: 'calc(100vw - 16px)',
            background: '#fff', border: `1px solid ${FP_BORDER}`, borderRadius: 10,
            boxShadow: '0 12px 32px rgba(15,31,61,0.16)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
              {children}
            </div>
            {footer}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH FILTER PANEL — main component
// ─────────────────────────────────────────────────────────────────────────────

function SearchFilterPanel({ state, onUpdate }) {
  const {
    isFilterExpanded: isExpanded,
    selectedDestinations,
    selectedPorts,
    selectedHomePorts,
    selectedDuration,
    selectedMonth
  } = state;
  const homePorts = selectedHomePorts || [];
  const ports = selectedPorts || [];
  const durations = selectedDuration || [];
  const selectedMonths = fpSelectedMonths(selectedMonth);
  const bookingType = state.bookingType || 'Normal';

  // Track if user has made any selections in this session
  const [hasEverInteracted, setHasEverInteracted] = React.useState(false);

  // Only one dropdown open at a time — opening a second closes the first.
  const [openKey, setOpenKey] = React.useState(null);
  const closeDropdown = () => setOpenKey(null);

  // Which half of the Destination(s) popover is showing.
  const [destTab, setDestTab] = React.useState('Regions');

  // Toggle — ONLY via the arrow button
  const toggle = (e) => {e.stopPropagation();onUpdate({ isFilterExpanded: !isExpanded });};

  const toggleDest = (name) => {
    setHasEverInteracted(true);
    const next = selectedDestinations.includes(name) ?
    selectedDestinations.filter((d) => d !== name) :
    [...selectedDestinations, name];
    onUpdate({ selectedDestinations: next });
  };

  const togglePort = (pid) => {
    setHasEverInteracted(true);
    const next = ports.includes(pid) ? ports.filter((x) => x !== pid) : [...ports, pid];
    onUpdate({ selectedPorts: next });
  };

  // How many sailings match if this port is added on top of every OTHER
  // active facet — region, home port, duration, month. Standard faceted-
  // search counting: the candidate port replaces the port facet entirely
  // rather than unioning with it, so the number answers "what if I add just
  // this one" rather than restating today's total.
  const portCount = (pid) => filterSailings({
    selectedDestinations, selectedHomePorts: homePorts, selectedDuration: durations,
    selectedMonth, selectedPorts: [pid],
  }).length;

  const toggleDuration = (id) => {
    setHasEverInteracted(true);
    // Derive from the latest booking snapshot. This keeps successive checkbox
    // toggles additive even when React batches updates.
    onUpdate((current) => {
      const selected = Array.isArray(current.selectedDuration) ? current.selectedDuration : [];
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      return { selectedDuration: next };
    });
  };

  // Single-select — picking a home port replaces the selection and closes the
  // dropdown (an agent boards from one city per booking, unlike ports of call
  // which a sailing can visit several of).
  const pickHomePort = (id) => {
    setHasEverInteracted(true);
    onUpdate({ selectedHomePorts: homePorts.length === 1 && homePorts[0] === id ? [] : [id] });
    closeDropdown();
  };

  const setMonthField = (field, val) => {
    setHasEverInteracted(true);
    onUpdate((current) => ({
      selectedMonth: { ...(current.selectedMonth || {}), [field]: val || null }
    }));
  };

  const toggleMonth = (month) => {
    setHasEverInteracted(true);
    onUpdate((current) => {
      const currentMonth = current.selectedMonth || {};
      const months = fpSelectedMonths(currentMonth);
      const next = months.includes(month)
        ? months.filter((m) => m !== month)
        : [...months, month];
      return { selectedMonth: { ...currentMonth, month: null, months: next } };
    });
  };

  const chips = fpBuildChips(selectedDestinations, ports, homePorts, durations, selectedMonth);

  // Trigger labels — state its contents when something is picked, the facet
  // name otherwise.
  const dateLabel = selectedMonths.length === 0
    ? (selectedMonth.year || 'Departure Dates')
    : selectedMonths.length <= 2
      ? `${selectedMonths.join(', ')}${selectedMonth.year ? ` ${selectedMonth.year}` : ''}`
      : `${selectedMonths.length} months${selectedMonth.year ? ` · ${selectedMonth.year}` : ''}`;
  const homeLabel = homePorts.length ? mvasHomePortName(homePorts[0]) : 'Departing From';
  const destCount = selectedDestinations.length + ports.length;
  const destLabel = destCount === 0 ? 'Destination(s)'
    : destCount <= 2 ? [...selectedDestinations, ...ports.map(mvasPortShort)].join(', ')
    : `${destCount} selected`;
  const durationLabel = durations.length === 0 ? 'Duration'
    : durations.length <= 2 ? durations.map((id) => (getDurationBand(id) || {}).short || id).join(', ')
    : `${durations.length} selected`;
  return (
    <>
      <div style={{
        background: '#fff', borderRadius: 10, overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
        border: `1px solid ${FP_BORDER}`
      }}>

      {/* ══ BOOKING TYPE ════════════════════════════════════════════════════
          This sets booking context only; inventory filtering remains driven
          by the date, port, destination and duration facets below. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px',
        background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        <div style={{
          flex: '0 0 auto', fontSize: 10, fontWeight: 750, letterSpacing: 0.65,
          color: WF.inkLabel, textTransform: 'uppercase'
        }}>
          Booking Type
        </div>
        <div role="tablist" aria-label="Booking Type" style={{
          display: 'grid', gridTemplateColumns: '72px 68px 182px', gap: 3,
          width: 334, maxWidth: '100%', padding: 3,
          border: `1px solid ${WF.line}`, borderRadius: 8,
          background: '#FFFFFF'
        }}>
          {FP_BOOKING_TYPES.map((type) => {
            const selected = bookingType === type;
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onUpdate({ bookingType: type })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  minHeight: 27, padding: '4px 8px',
                  border: `1px solid ${selected ? WF.accent : 'transparent'}`, borderRadius: 6,
                  background: selected ? WF.accent : 'transparent',
                  color: selected ? WF.accentText : WF.inkSoft,
                  fontFamily: 'inherit', fontSize: 11.5, fontWeight: selected ? 700 : 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: selected ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                  transition: 'background 0.12s, color 0.12s'
                }}>
                <span aria-hidden="true" style={{
                  width: 12, height: 12, borderRadius: 999, flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  border: `1px solid ${selected ? 'rgba(255,255,255,0.72)' : WF.line}`,
                  background: selected ? 'rgba(255,255,255,0.14)' : '#FFFFFF',
                  color: selected ? '#FFFFFF' : 'transparent', fontSize: 9, fontWeight: 800,
                }}>{selected ? '✓' : ''}</span>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ SEARCH BAR ══════════════════════════════════════════════════════ */}
      <div style={{ padding: '13px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
          <div style={{ fontSize: 10.5, fontWeight: 750, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>
            Search inventory
          </div>
          <div style={{ fontSize: 9.5, color: WF.inkSoft }}>Destination, ship, or sailing code</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search input — clearly typeable */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#FFFFFF', border: `1px solid ${FP_BORDER}`,
          height: 40, borderRadius: 8, padding: '0 12px',
          transition: 'border-color 0.15s'
        }}
        onFocusCapture={(e) => e.currentTarget.style.borderColor = FP_NAVY}
        onBlurCapture={(e) => e.currentTarget.style.borderColor = FP_BORDER}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: '#94A3B8' }}>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search destinations, ships, codes…"
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 13, color: FP_NAVY,
              background: 'transparent', fontFamily: 'inherit',
              '::placeholder': { color: '#94A3B8' }
            }} />
        </div>

        {/* Toggle arrow — only interaction that changes panel state */}
        <button
          onClick={toggle}
          title={isExpanded ? 'Collapse filters' : 'Expand filters'}
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            border: `1px solid ${FP_BORDER}`, background: WF.fill,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748B',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.22s ease, background 0.12s'
          }}>

          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        </div>
      </div>

      {/* ══ ACTIVE CHIPS (collapsed only) ═══════════════════════════════════ */}
      {!isExpanded && chips.length > 0 &&
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chips.map((chip, i) =>
        <button key={i} onClick={toggle} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 999,
          background: '#fff', border: `1px solid ${FP_BORDER}`,
          fontSize: 12, fontWeight: 500, color: FP_NAVY, whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(15,31,61,0.04)',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 0.12s, background 0.12s'
        }}
        onMouseEnter={(e) => {e.currentTarget.style.borderColor = FP_NAVY;e.currentTarget.style.background = '#F8FAFC';}}
        onMouseLeave={(e) => {e.currentTarget.style.borderColor = FP_BORDER;e.currentTarget.style.background = '#fff';}}>
              <span style={{ fontSize: 12 }}>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
        )}
        </div>
      }

      {/* ══ EXPANDED CONTENT ════════════════════════════════════════════════
          maxHeight here is a CSS trick for the expand/collapse transition
          (animating a fixed target stands in for the unanimatable "auto"),
          not a real content cap — it used to be 800px, which silently
          clipped the inventory breakdown once enough destinations were
          selected to push real content past it (e.g. all 4 at once cuts off
          the last one or two with no way to reach them). Raised well past
          any realistic content height, with overflowY:auto as a safety net
          so a future overflow scrolls instead of clipping again. ── */}
      <div style={{
        overflowY: isExpanded ? 'auto' : 'hidden',
        overflowX: 'hidden',
        maxHeight: isExpanded ? '3000px' : '0px',
        opacity: isExpanded ? 1 : 0,
        transition: isExpanded ?
        'max-height 0.25s ease-in-out, opacity 0.18s ease 0.04s' :
        'max-height 0.22s ease-in-out, opacity 0.1s ease'
      }}>
        <div style={{ height: 1, background: FP_BORDER }} />

        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
          padding: '12px 16px 0',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 750, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>
            Itinerary filters
          </div>
          <div style={{ fontSize: 9.5, color: WF.inkSoft }}>Select one or more options</div>
        </div>

        {/* ── Primary row: Departure Dates / Departing From / Destination(s) / Duration ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '8px 16px 14px' }}>

          {/* DEPARTURE DATES */}
          <FPDropdown
            label="Departure date"
            trigger={dateLabel}
            open={openKey === 'dates'}
            onToggle={() => setOpenKey((k) => (k === 'dates' ? null : 'dates'))}
            onClose={closeDropdown}
            width={320}
            footer={
              <FPDropdownFooter
                clearDisabled={selectedMonths.length === 0 && !selectedMonth.year}
                onClear={() => onUpdate({ selectedMonth: { months: [], year: null } })}
                onDone={closeDropdown} />
            }>
            <div style={{ display: 'flex', gap: 6, padding: '6px 14px 8px' }}>
              {FP_YEARS.map((y) => {
                const on = selectedMonth.year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMonthField('year', y)}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 6,
                      border: `1.5px solid ${on ? FP_NAVY : FP_BORDER}`,
                      background: on ? FP_NAVY : '#fff', color: on ? '#fff' : FP_NAVY,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                    {y}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: FP_BORDER, margin: '0 0 4px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(6, auto)', gridAutoFlow: 'column', columnGap: 4 }}>
              {FP_MONTHS.map((m) => (
                <FPListRow
                  key={m}
                  label={m}
                  selected={selectedMonths.includes(m)}
                  multiSelect
                  onClick={() => toggleMonth(m)} />
              ))}
            </div>
          </FPDropdown>

          {/* DEPARTING FROM — single-select, real MVAS embarkation cities */}
          <FPDropdown
            label="Departing from"
            trigger={homeLabel}
            open={openKey === 'home'}
            onToggle={() => setOpenKey((k) => (k === 'home' ? null : 'home'))}
            onClose={closeDropdown}>
            {FP_HOME_PORTS.map((hp) => (
              <FPListRow
                key={hp.id}
                label={hp.name}
                selected={homePorts.includes(hp.id)}
                onClick={() => pickHomePort(hp.id)} />
            ))}
          </FPDropdown>

          {/* DESTINATION(S) — regions and ports of call, tabbed within one
              dropdown. Ports carry a live count against the region/home-port/
              duration/month facets already active, so browsing doubles as an
              availability check the way the old searchable picker's counts
              did — without the search box that made 22 ports feel bigger
              than it is. */}
          <FPDropdown
            label="Destination"
            trigger={destLabel}
            open={openKey === 'dest'}
            onToggle={() => setOpenKey((k) => (k === 'dest' ? null : 'dest'))}
            onClose={closeDropdown}
            width={300}
            footer={
              <FPDropdownFooter
                clearDisabled={destCount === 0}
                onClear={() => { onUpdate({ selectedDestinations: [], selectedPorts: [] }); }}
                onDone={closeDropdown} />
            }>
            <FPSegmented
              options={['Regions', 'Ports of call']}
              value={destTab}
              onChange={setDestTab} />
            {destTab === 'Regions' ? (
              FP_REGIONS.map((r) => (
                <FPListRow
                  key={r.name}
                  icon={r.emoji}
                  label={r.name}
                  selected={selectedDestinations.includes(r.name)}
                  onClick={() => toggleDest(r.name)} />
              ))
            ) : (
              MVAS_PORT_GROUPS.map((g) => (
                <div key={g.group}>
                  <div style={{ padding: '6px 14px 2px', fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#B8C2D4' }}>{g.group}</div>
                  {g.ports.map((p) => (
                    <FPPortRow
                      key={p.id}
                      label={p.name.split(',')[0]}
                      selected={ports.includes(p.id)}
                      count={portCount(p.id)}
                      onClick={() => togglePort(p.id)} />
                  ))}
                </div>
              ))
            )}
          </FPDropdown>

          {/* DURATION — the four bands the product is actually sold in. */}
          <FPDropdown
            label="Duration"
            trigger={durationLabel}
            open={openKey === 'duration'}
            onToggle={() => setOpenKey((k) => (k === 'duration' ? null : 'duration'))}
            onClose={closeDropdown}
            footer={
              <FPDropdownFooter
                clearDisabled={durations.length === 0}
                onClear={() => onUpdate({ selectedDuration: [] })}
                onDone={closeDropdown} />
            }>
            {DURATION_BANDS.map((band) => (
              <FPListRow
                key={band.id}
                label={band.label}
                selected={durations.includes(band.id)}
                multiSelect
                onClick={() => toggleDuration(band.id)} />
            ))}
          </FPDropdown>
        </div>

        {/* ── Secondary row: Booking Source / Promo Code ── */}
        <div style={{ padding: '11px 16px 14px', borderTop: `1px solid ${WF.line}`, background: WF.fill }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
            marginBottom: 7,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 750, letterSpacing: 0.55, color: WF.inkLabel, textTransform: 'uppercase' }}>
              Booking details
            </div>
            <div style={{ fontSize: 9.5, color: WF.inkSoft }}>Source and promotional pricing</div>
          </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {window.SourcePill2 && state.source !== undefined && (
            <div style={{ flex: '1 1 200px', minWidth: 170 }}>
              <window.SourcePill2
                source={state.source}
                onChange={(v) => onUpdate({ source: v })}
                fullWidth />
            </div>
          )}

          <div style={{ flex: '1 1 220px', display: 'flex', gap: 6, minWidth: 200 }}>
            <div style={{
              flex: 1, minWidth: 0, minHeight: 40, display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 11px', border: `1px solid ${FP_BORDER}`, borderRadius: 8,
              color: FP_NAVY, background: '#fff',
            }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label style={{ fontSize: 9, lineHeight: 1, fontWeight: 750, letterSpacing: 0.45, textTransform: 'uppercase', color: WF.inkLabel }}>
                  Promotion code
                </label>
                <input
                  type="text"
                  placeholder="Enter code"
                  style={{
                    width: '100%', padding: 0, fontSize: 12.5, lineHeight: 1.2, fontFamily: 'inherit',
                    border: 'none', color: FP_NAVY, background: 'transparent', outline: 'none'
                  }} />
              </div>
            </div>
            <button style={{
              minHeight: 40, padding: '9px 16px', fontSize: 12, fontWeight: 650, fontFamily: 'inherit',
              border: `1px solid ${FP_BORDER}`, borderRadius: 8,
              background: '#fff', color: FP_NAVY, cursor: 'pointer',
              transition: 'all 0.12s', whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.borderColor = FP_NAVY;e.currentTarget.style.background = FP_NAVY;e.currentTarget.style.color = '#fff';}}
            onMouseLeave={(e) => {e.currentTarget.style.borderColor = FP_BORDER;e.currentTarget.style.background = '#fff';e.currentTarget.style.color = FP_NAVY;}}>
              Apply
            </button>
          </div>
        </div>
        </div>
      </div>

      </div>
    </>);

}

window.SearchFilterPanel = SearchFilterPanel;
// Legacy stub — kept for compatibility with other modules that import this symbol
window.SelectDepartureMonth = () => null;
