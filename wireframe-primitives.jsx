// Wireframe primitives — clean, productiony theme.
// Matches the reference: white surfaces, dark navy ink, muted uppercase labels,
// soft pill badges, dark navy primary buttons, hairline dividers.

const WF = {
  // ── Ink (text) ──
  ink: '#0F172A',         // primary text (navy near-black)
  inkSoft: '#475569',     // secondary text / row values
  inkFaint: '#94A3B8',    // tertiary / placeholders / icon glyphs
  inkLabel: '#64748B',    // section-header label grey
  // ── Surfaces ──
  bg: '#F1F5F9',          // app background behind cards
  panel: '#FFFFFF',       // card / table surface
  fill: '#F8FAFC',        // subtle fill (table header, section head)
  fillStrong: '#E2E8F0',  // strong fill (active states, accents)
  // ── Lines ──
  line: '#E2E8F0',        // primary divider
  lineSoft: '#EEF2F6',    // soft inner row divider
  // ── Brand / accent ──
  accent: '#1B2434',      // dark navy primary
  accentText: '#FFFFFF',
  // ── Interactive accent (one blue family for the whole booking flow) ──
  // Every affirmative / interactive state runs on these four: completed step
  // markers, row-level actions, selected chips, toggles, accent surfaces.
  //
  // They exist because there was no such token. The flow's interactive accent
  // was a teal (#0F766E) hardcoded in four separate files, while the totals
  // panel and toggles had independently drifted to blue — so the product was
  // carrying two competing accent colours at once. Add to this family rather
  // than introducing a second one; a hardcoded accent hex outside these tokens
  // is how the split happened the first time.
  //
  // ONE flat navy for the whole family — fills, text, icons, borders. Same
  // value as `accent` above, everywhere, no second shade.
  //
  // An earlier version split this into a navy fill (accentOn) and a lighter
  // blue-900 for text/icons (accentInk), reasoning that navy-on-white text
  // (15.57:1) sits too close to body text (17.85:1) to read as an affordance.
  // The user pointed at the primary button's exact navy and said "use this
  // color... across now" — i.e. one literal colour everywhere, not a family
  // with a lighter member. That instruction overrides the contrast nuance:
  // don't reintroduce a second shade (e.g. #1E3A8A) for "readability" without
  // asking first, even though the reasoning above isn't wrong in isolation.
  //
  // NOTE: green is still used in this app, but only for *status* — availability
  // (green = bookable) and savings (green = money off). That is semantics, not
  // brand accent; don't fold those into this family or the meaning is lost.
  accentOn: '#1B2434',    // filled interactive / on / done  (= accent)
  accentInk: '#1B2434',   // accent text & icons — same navy, not a lighter shade
  accentTint: '#EFF6FF',  // accent surface
  accentLine: '#DBEAFE',  // accent surface border
  // ── Callouts (BRD annotations) ──
  callout: '#FEF3C7',
  calloutBorder: '#FCD34D',
  calloutInk: '#78350F',
};

// ──────────────────────────────────────────────────────────
// Box / placeholder / faux text
// ──────────────────────────────────────────────────────────
function WFBox({ children, dashed, fill, height, width, style = {}, ...rest }) {
  return (
    <div
      style={{
        border: `1px ${dashed ? 'dashed' : 'solid'} ${WF.line}`,
        background: fill ? WF.fill : 'transparent',
        height, width, borderRadius: 6,
        ...style,
      }}
      {...rest}
    >{children}</div>
  );
}

function WFPlaceholder({ width = '100%', height = 60, label, style = {} }) {
  return (
    <div style={{
      position: 'relative', width, height,
      border: `1px dashed ${WF.line}`, background: WF.fill,
      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: WF.inkFaint, fontSize: 11, ...style,
    }}>
      {label && <span style={{ background: WF.fill, padding: '2px 6px' }}>{label}</span>}
    </div>
  );
}

function WFLine({ width = '100%', height = 8, style = {} }) {
  return <div style={{ width, height, background: WF.lineSoft, borderRadius: 4, ...style }} />;
}

function WFLines({ count = 3, widths, gap = 6 }) {
  const w = widths || Array.from({ length: count }, (_, i) => i === count - 1 ? '60%' : '100%');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {w.map((width, i) => <WFLine key={i} width={width} />)}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Form field — label + input
// ──────────────────────────────────────────────────────────
function WFField({ label, value, hint, kind = 'text', width, badge, required, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: WF.inkSoft, fontWeight: 500 }}>
        <span>{label}{required && <span style={{ color: '#DC2626' }}> *</span>}</span>
        {badge && <WFBadge>{badge}</WFBadge>}
      </div>
      <div
        style={{
          border: `1px solid ${WF.line}`, borderRadius: 6,
          background: WF.panel,
          height: kind === 'textarea' ? 64 : 34,
          padding: '8px 10px',
          fontSize: 13, color: value ? WF.ink : WF.inkFaint,
          display: 'flex', alignItems: kind === 'textarea' ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          fontFamily: kind === 'mono' ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
        }}
      >
        <span>{value || <span style={{ color: WF.inkFaint }}>—</span>}</span>
        {kind === 'select' && <span style={{ color: WF.inkFaint, fontSize: 10 }}>▾</span>}
        {kind === 'date' && <span style={{ color: WF.inkFaint, fontSize: 10 }}>📅</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: WF.inkFaint }}>{hint}</div>}
    </div>
  );
}

// Read-only definition-list label/value (matches the reference exactly)
function WFKV({ label, value, badge, mono, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: WF.inkLabel, fontWeight: 500 }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        fontSize: 13.5, color: WF.ink, fontWeight: 500,
        fontFamily: mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
      }}>{value ?? '—'}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Toggle / checkbox
// ──────────────────────────────────────────────────────────
function WFToggle({ label, on, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${WF.lineSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: WF.ink }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        width: 32, height: 18, borderRadius: 9,
        // An "on" state is an interactive accent, not a status — so it runs on
        // the accent family like every other toggle in the flow (the trip
        // protection switch was already blue while this one was green).
        background: on ? WF.accentOn : WF.fillStrong,
        position: 'relative', transition: 'background 0.15s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 14, height: 14, borderRadius: 7,
          background: WF.panel, boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }} />
      </div>
    </div>
  );
}

function WFCheckbox({ label, on }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: WF.ink, cursor: 'pointer' }}>
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${on ? WF.accent : '#CBD5E1'}`,
        background: on ? WF.accent : WF.panel,
        position: 'relative', flexShrink: 0,
      }}>
        {on && <span style={{ position: 'absolute', inset: 0, color: WF.panel, fontSize: 11, lineHeight: '13px', textAlign: 'center', fontWeight: 700 }}>✓</span>}
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}

// ──────────────────────────────────────────────────────────
// Badge — pill
// ──────────────────────────────────────────────────────────
function WFBadge({ children, kind = 'default', size = 'sm' }) {
  const styles = {
    default:   { bg: '#F1F5F9', fg: '#475569', border: '#E2E8F0' },
    inherit:   { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
    override:  { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
    locked:    { bg: '#F1F5F9', fg: '#64748B', border: '#E2E8F0' },
    active:    { bg: '#D1FAE5', fg: '#047857', border: '#A7F3D0' },
    inactive:  { bg: '#FEE2E2', fg: '#B91C1C', border: '#FECACA' },
    draft:     { bg: '#FEF3C7', fg: '#A16207', border: '#FDE68A' },
    new:       { bg: WF.accent, fg: WF.accentText, border: WF.accent },
  }[kind];
  const pad = size === 'xs' ? '1px 7px' : '3px 9px';
  const fs = size === 'xs' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: styles.bg, color: styles.fg,
      border: `1px solid ${styles.border}`,
      borderRadius: 999, padding: pad, fontSize: fs,
      lineHeight: 1.3, whiteSpace: 'nowrap',
      fontWeight: 600, letterSpacing: 0.1,
    }}>{children}</span>
  );
}

// ──────────────────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────────────────
function WFButton({ children, primary, danger, ghost, size = 'md', icon }) {
  const pad = size === 'sm' ? '5px 11px' : '8px 14px';
  const fs = size === 'sm' ? 12 : 13;
  const bg = primary ? WF.accent : ghost ? 'transparent' : WF.panel;
  const fg = primary ? WF.accentText : danger ? '#B91C1C' : WF.ink;
  const border = primary ? WF.accent : danger ? '#FCA5A5' : WF.line;
  return (
    <button style={{
      padding: pad, fontSize: fs,
      border: `1px solid ${border}`, background: bg, color: fg,
      cursor: 'pointer', borderRadius: 6,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontWeight: primary ? 600 : 500,
      fontFamily: 'inherit',
      boxShadow: primary ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
    }}>
      {icon && <span style={{ fontSize: fs - 1, opacity: 0.85 }}>{icon}</span>}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────
// BRD callout — kept yellow so it doesn't blend with the UI
// ──────────────────────────────────────────────────────────
function WFCallout({ n, children, top, left, right, bottom, width = 220, anchor }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      pointerEvents: 'none', zIndex: 5,
    }}>
      <div style={{
        background: WF.callout, border: `1px solid ${WF.calloutBorder}`,
        borderRadius: 6, padding: '8px 10px',
        fontSize: 11, color: WF.calloutInk, lineHeight: 1.4,
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        display: 'flex', gap: 8,
      }}>
        <div style={{
          flexShrink: 0, width: 18, height: 18, borderRadius: 9,
          background: '#78350F', color: '#fff',
          fontSize: 10.5, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{n}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function WFMarker({ n, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 16, height: 16, borderRadius: 8,
      background: '#78350F', color: '#fff',
      fontSize: 10, fontWeight: 700,
      ...style,
    }}>{n}</span>
  );
}

// ──────────────────────────────────────────────────────────
// Margaritaville at Sea — sidebar brand tokens, wordmark & nav icons
// ──────────────────────────────────────────────────────────
const MV_NAVY = '#1B2436';
const MV_ACCENT = '#C03A2B';
const MV_ACCENT_TEXT = '#C03A2B';
// #A8B2BE on MV_NAVY (#1B2436) is ~7.2:1 — clears WCAG AAA (7:1) for normal
// text, not just AA (4.5:1) the previous #9CA7B4 (~6.4:1) landed on.
const MV_INK_MUTED = '#A8B2BE';

function MVLogo({ width = 150 }) {
  return (
    <img
      src="MVas Logo.png"
      alt="Margaritaville at Sea"
      style={{
        width: width,
        height: 'auto',
        maxWidth: '100%',
        display: 'block',
      }}
    />
  );
}

function MVIcon({ id, size = 18 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'dashboard':
      return (<svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></svg>);
    case 'bookings':
      return (<svg {...p}><path d="M6.5 4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15l-5.5-3.6L6.5 19.5v-15z" /></svg>);
    case 'sailings':
      return (<svg {...p}><circle cx="12" cy="5" r="1.6" /><path d="M12 7v10" /><path d="M8 10h8" /><path d="M5 14c0 3.6 3 6.6 7 7 4-0.4 7-3.4 7-7" /></svg>);
    case 'inventory':
      return (<svg {...p}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>);
    case 'fares':
      return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9.5h18" /><path d="M7 14h4" /></svg>);
    case 'supplements':
      return (<svg {...p}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12v9" /><path d="M4 7.5L12 12l8-4.5" /></svg>);
    case 'channels':
      return (<svg {...p}><path d="M12 4l8 4.5-8 4.5-8-4.5L12 4z" /><path d="M4 13l8 4.5 8-4.5" /></svg>);
    case 'reports':
      return (<svg {...p}><path d="M4 20V10" /><path d="M11 20V4" /><path d="M18 20v-7" /></svg>);
    case 'audit':
      return (<svg {...p}><path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z" /></svg>);
    default:
      return null;
  }
}

// ──────────────────────────────────────────────────────────
// App shell — sidebar + topbar + content + summary rail
// ──────────────────────────────────────────────────────────
// Three columns: sidebar | content | rail. The rail is a real grid track, so it
// spans the full height between the top bar and the bottom edge on its own —
// nothing measures it or reserves space for it. The progress bar sits pinned
// above the content scrollport; only the content beneath it moves.
const RAIL_W = 320;

function WFAppShell({ active = 'fares', activeGroup = 'fares', breadcrumb, title, actions, children, rightRail, progressBar }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', label: 'Bookings', children: [
      { id: 'all-bookings', label: 'All bookings' },
      { id: 'create-booking', label: 'Create booking' },
      { id: 'holds', label: 'Holds & waitlist' },
      { id: 'guests', label: 'Guest profiles' },
    ]},
    { id: 'sailings', label: 'Sailings' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'fares', label: 'Fares & Pricing', children: [
      { id: 'faretypes', label: 'Faretypes' },
      { id: 'farecodes', label: 'Farecodes' },
      { id: 'policies', label: 'Deposit & Cancel' },
      { id: 'coupons', label: 'Coupons' },
    ]},
    { id: 'supplements', label: 'Supplements' },
    { id: 'channels', label: 'Channels' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit Log' },
  ];
  // minmax(0, 1fr) rather than 1fr: a bare 1fr is minmax(auto, 1fr), which lets a
  // wide min-content child (the 9-column stateroom table) push the middle column
  // past its share and squeeze the rail.
  const cols = rightRail ? `200px minmax(0, 1fr) ${RAIL_W}px` : '200px minmax(0, 1fr)';
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateColumns: cols, gridTemplateRows: '52px 1fr',
      background: '#F9FAFC', color: WF.ink,
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif', fontSize: 13,
      overflow: 'hidden',
    }}>
      {/* Top bar — spans the content area and the rail. `-1` is the last explicit
          line, so this covers column 2 alone when there is no rail, and columns
          2-3 when there is. */}
      <div style={{
        gridColumn: '2 / -1', gridRow: 1,
        borderBottom: `1px solid ${WF.line}`, background: WF.panel,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', border: `1px solid ${WF.line}`, borderRadius: 8,
          fontSize: 12.5, color: WF.inkFaint, background: WF.fill, minWidth: 280,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span>Search bookings, farecodes…</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          width: 30, height: 30, borderRadius: 15,
          background: '#DCEFEC', color: '#16324A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11.5, fontWeight: 700,
        }}>JD</div>
      </div>
      {/* Sidebar */}
      <div style={{
        gridColumn: 1, gridRow: '1 / -1',
        borderRight: `1px solid ${MV_NAVY}`, background: MV_NAVY,
        padding: '20px 0 16px', overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column',
        height: '100%', minHeight: '100%', alignSelf: 'stretch', boxSizing: 'border-box',
      }}>
        <div style={{ padding: '0 16px 26px', display: 'flex', justifyContent: 'center' }}>
          <MVLogo width={150} />
        </div>
        {navItems.map((it) => {
          const isActiveGroup = it.id === activeGroup;
          return (
            <div key={it.id} style={{ padding: '0 12px', marginBottom: 2 }}>
              <div style={{
                position: 'relative',
                padding: '10px 14px', borderRadius: 8,
                color: isActiveGroup ? '#fff' : MV_INK_MUTED,
                background: isActiveGroup ? MV_ACCENT : 'transparent',
                fontWeight: isActiveGroup ? 700 : 500,
                fontSize: 13.5,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {isActiveGroup && (
                  <span style={{ position: 'absolute', left: 4, top: '22%', bottom: '22%', width: 3, borderRadius: 2, background: 'rgba(255,255,255,0.55)' }} />
                )}
                <span style={{ display: 'flex', flexShrink: 0, color: isActiveGroup ? '#fff' : MV_INK_MUTED }}>
                  <MVIcon id={it.id} size={18} />
                </span>
                <span>{it.label}</span>
              </div>
              {it.children && isActiveGroup && (
                <div style={{ padding: '6px 0 4px 44px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {it.children.map((c) => {
                    const on = c.id === active;
                    return (
                      <div key={c.id} style={{
                        padding: '6px 0 6px 12px', fontSize: 12.5,
                        color: on ? MV_ACCENT_TEXT : MV_INK_MUTED,
                        fontWeight: on ? 700 : 500,
                        borderLeft: `2px solid ${on ? MV_ACCENT_TEXT : 'transparent'}`,
                      }}>{c.label}</div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Main */}
      <div style={{ gridColumn: 2, gridRow: '2', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {progressBar && (
          // Pinned above the scrollport below. Needs its own opaque background:
          // the bar card carries a 20px marginBottom, and without this the
          // scrolling content would show through that gap.
          // Width-constrained to match the content below so they align.
          <div style={{ padding: '20px 28px 0 28px', flexShrink: 0, background: '#F9FAFC', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: 1140, width: '100%' }}>
              {progressBar}
            </div>
          </div>
        )}
        {/* The scroll container. Deliberately a plain block, not a flex column —
            WebKit drops padding-bottom at scroll end on flex scrollports. */}
        <div style={{
          padding: `${progressBar ? 16 : 20}px 28px 20px 28px`,
          flex: 1, minHeight: 0,
          // overflowY: auto alone would compute overflow-x to auto as well, so
          // anything escaping sideways would raise a horizontal scrollbar.
          overflowY: 'auto', overflowX: 'hidden',
          scrollbarWidth: 'thin', scrollbarGutter: 'stable',
        }}>
          {actions && !title && (
            <div style={{ display: 'flex', marginBottom: 14 }}>
              {actions}
            </div>
          )}
          {title && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
              <div>{title}</div>
              {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
      {/* Summary rail — a real grid cell, flush under the top bar and flush to the
          bottom edge. Rendered last, so it paints over Main without a zIndex. */}
      {rightRail && (
        <div style={{
          gridColumn: 3, gridRow: 2,
          background: WF.panel, borderLeft: `1px solid ${WF.line}`,
          display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
        }}>
          {rightRail}
        </div>
      )}
    </div>
  );
}

// Page title
function WFTitle({ eyebrow, title, sub }) {
  return (
    <div>
      {eyebrow && <div style={{ fontSize: 11, color: WF.inkLabel, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>{eyebrow}</div>}
      <div style={{ fontSize: 22, fontWeight: 700, color: WF.ink, lineHeight: 1.2, letterSpacing: -0.2 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: WF.inkSoft, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// Section header inside a card
function WFSectionHead({ children, action, num }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: `1px solid ${WF.line}`,
      background: WF.panel,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11.5, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 0.8,
        color: WF.inkLabel,
      }}>
        {num && <WFMarker n={num} />}
        {children}
      </div>
      {action}
    </div>
  );
}

function WFCard({ children, style = {} }) {
  return (
    <div style={{
      background: WF.panel,
      border: `1px solid ${WF.line}`,
      borderRadius: 8,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

// ──────────────────────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────────────────────
function WFTabs({ tabs, active }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${WF.line}`, gap: 4 }}>
      {tabs.map((t) => (
        <div key={t} style={{
          padding: '10px 14px', fontSize: 13,
          color: t === active ? WF.ink : WF.inkSoft,
          fontWeight: t === active ? 600 : 500,
          borderBottom: t === active ? `2px solid ${WF.accent}` : '2px solid transparent',
          marginBottom: -1, cursor: 'pointer',
        }}>{t}</div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Table — dense
// ──────────────────────────────────────────────────────────
function WFTable({ columns, rows, dense = true, selected = -1 }) {
  const rowH = dense ? 36 : 44;
  return (
    <div style={{ width: '100%', fontSize: 12.5 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns.map(c => c.w || '1fr').join(' '),
        background: WF.fill,
        borderBottom: `1px solid ${WF.line}`,
        fontSize: 11, fontWeight: 600, color: WF.inkLabel,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {columns.map((c, i) => (
          <div key={i} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {c.label} {c.sort && <span style={{ color: WF.inkFaint }}>↕</span>}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{
          display: 'grid',
          gridTemplateColumns: columns.map(c => c.w || '1fr').join(' '),
          borderBottom: `1px solid ${WF.lineSoft}`,
          background: ri === selected ? '#EFF6FF' : WF.panel,
          minHeight: rowH, alignItems: 'center',
        }}>
          {columns.map((c, ci) => (
            <div key={ci} style={{
              padding: '8px 12px',
              fontFamily: c.mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
              fontSize: c.mono ? 12 : 12.5,
              color: ci === 0 ? WF.ink : WF.inkSoft,
              fontWeight: ci === 0 ? 500 : 400,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>{row[c.key]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Filter chip
function WFChip({ label, value, hasValue, dropdown = true }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 6,
      border: `1px solid ${hasValue ? '#CBD5E1' : WF.line}`,
      background: hasValue ? WF.fill : WF.panel,
      fontSize: 12,
    }}>
      <span style={{ color: WF.inkFaint }}>{label}:</span>
      <span style={{ color: WF.ink, fontWeight: 500 }}>{value}</span>
      {dropdown && <span style={{ color: WF.inkFaint, fontSize: 9 }}>▾</span>}
    </div>
  );
}

// Search input
function WFSearch({ placeholder, width = 280 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      width, padding: '7px 10px', borderRadius: 6,
      border: `1px solid ${WF.line}`, background: WF.panel,
      fontSize: 12.5, color: WF.inkFaint,
    }}>
      <span>⌕</span><span>{placeholder}</span>
    </div>
  );
}

// Inheritance row — used in farecode-detail variant A
function WFInheritedRow({ label, parentValue, value, overridden, locked, marker }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '180px 1fr 1fr 110px',
      borderBottom: `1px solid ${WF.lineSoft}`,
      padding: '10px 16px', alignItems: 'center', gap: 12,
      background: overridden ? '#FFFBEB' : WF.panel,
    }}>
      <div style={{ fontSize: 12.5, color: WF.inkSoft, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        {marker && <WFMarker n={marker} />}
        {label}
      </div>
      <div style={{ fontSize: 13, color: WF.inkFaint, fontStyle: overridden ? 'italic' : 'normal' }}>
        {parentValue}
      </div>
      <div style={{ fontSize: 13, color: WF.ink, fontWeight: overridden ? 600 : 500 }}>
        {value}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {locked ? <WFBadge kind="locked">🔒 Locked</WFBadge>
          : overridden ? <WFBadge kind="override">Override</WFBadge>
          : <WFBadge kind="inherit">Inherited</WFBadge>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Side panel / drawer — view + edit pattern (matches reference)
// Composes over a faded list page in the background.
// ──────────────────────────────────────────────────────────
function WFSidePanel({ width = 720, icon, title, badges, actions, children, footer, onClose = true }) {
  return (
    <>
      {/* Scrim — fades the list page behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,42,0.18)', zIndex: 50,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width,
        background: WF.panel, borderLeft: `1px solid ${WF.line}`,
        boxShadow: '-12px 0 32px rgba(15,23,42,0.10)',
        zIndex: 51, display: 'flex', flexDirection: 'column',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        color: WF.ink,
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px', borderBottom: `1px solid ${WF.line}`,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {icon && (
            <div style={{
              width: 56, height: 56, borderRadius: 8,
              background: WF.fill, border: `1px solid ${WF.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: WF.inkSoft, fontSize: 22, flexShrink: 0,
            }}>{icon}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: WF.ink, lineHeight: 1.2, letterSpacing: -0.2 }}>{title}</div>
            {badges && <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{badges}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {actions}
            {onClose && (
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: 'none', background: 'transparent',
                color: WF.inkSoft, fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            )}
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 28px', borderTop: `1px solid ${WF.line}`,
            background: WF.fill, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>{footer}</div>
        )}
      </div>
    </>
  );
}

// Definition-list section — group header + 2-col key/value pairs
// Matches the reference exactly: uppercase label · hairline · grid of label/value.
function WFPanelSection({ title, action, columns = 2, children, style = {} }) {
  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${WF.line}`, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 1,
          color: WF.inkLabel,
        }}>{title}</div>
        {action}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        rowGap: 14, columnGap: 32,
      }}>{children}</div>
    </div>
  );
}

// Definition-list row — label left, value right (like the reference)
function WFDLRow({ label, value, mono, icon, span = 1, badge, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gridColumn: `span ${span}`, gap: 12, ...style,
    }}>
      <div style={{ fontSize: 13, color: WF.inkSoft, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        fontSize: 13.5, color: WF.ink, fontWeight: 500,
        fontFamily: mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
        display: 'flex', alignItems: 'center', gap: 6, textAlign: 'right',
      }}>
        {icon && <span style={{ color: WF.inkFaint, fontSize: 13 }}>{icon}</span>}
        <span>{value ?? '—'}</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  WF, WFBox, WFPlaceholder, WFLine, WFLines, WFField, WFKV,
  WFToggle, WFCheckbox, WFBadge, WFButton,
  WFCallout, WFMarker, WFAppShell, WFTitle, WFSectionHead, WFCard,
  WFTabs, WFTable, WFChip, WFSearch, WFInheritedRow,
  WFSidePanel, WFPanelSection, WFDLRow,
  MVLogo, MVIcon,
});
