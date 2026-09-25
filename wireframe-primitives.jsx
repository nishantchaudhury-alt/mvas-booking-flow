// Wireframe primitives — clean, productiony theme.
// Matches the reference: white surfaces, dark navy ink, muted uppercase labels,
// soft pill badges, dark navy primary buttons, hairline dividers.

const WF = {
  // ── Ink (text) ──
  ink: 'var(--ds-color-text-primary, #0F172A)',         // primary text (navy near-black)
  inkSoft: 'var(--ds-color-text-secondary, #475569)',   // secondary text / row values
  // Accessible compact-text greys. The former #94A3B8 tertiary token was only
  // 2.45:1 on the cool-grey fill, and #64748B labels dipped below 4.5:1 on the
  // blue selected surface. These retain the cool-grey hierarchy while clearing
  // AA contrast on every working surface used by the flow.
  inkFaint: 'var(--ds-color-text-muted, #5F6F85)',      // tertiary / placeholders / icon glyphs
  inkLabel: 'var(--ds-color-text-label, #5B6B80)',      // section-header label grey
  // ── Surfaces ──
  bg: 'var(--ds-color-canvas, #F1F5F9)',                // app background behind cards
  panel: 'var(--ds-color-surface, #FFFFFF)',             // card / table surface
  fill: 'var(--ds-color-surface-subtle, #F8FAFC)',       // subtle fill (table header, section head)
  fillStrong: 'var(--ds-color-surface-strong, #E2E8F0)', // strong fill (active states, accents)
  // ── Lines ──
  line: 'var(--ds-color-border, #E2E8F0)',               // primary divider
  lineSoft: 'var(--ds-color-divider, #EEF2F6)',          // soft inner row divider
  controlLine: 'var(--ds-color-control-border, #7C8B9F)', // 3:1+ boundary for editable/custom controls
  // ── Brand / accent ──
  accent: 'var(--ds-color-action, #1B2434)',             // dark navy primary
  accentText: 'var(--ds-color-on-action, #FFFFFF)',
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
  accentOn: 'var(--ds-color-action, #1B2434)',           // filled interactive / on / done  (= accent)
  accentInk: 'var(--ds-color-action, #1B2434)',          // accent text & icons — same navy, not a lighter shade
  accentTint: 'var(--ds-color-selection, #EFF6FF)',      // accent surface
  accentLine: 'var(--ds-color-selection-border, #DBEAFE)', // accent surface border
  // ── Callouts (BRD annotations) ──
  callout: 'var(--ds-color-warning-bg, #FEF3C7)',
  calloutBorder: 'var(--ds-color-callout-border, #FCD34D)',
  calloutInk: 'var(--ds-color-warning-strong, #78350F)',
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
      color: WF.inkFaint, fontSize: 12, ...style,
    }}>
      {label && <span style={{ background: WF.fill, padding: '4px 8px' }}>{label}</span>}
    </div>
  );
}

function WFLine({ width = '100%', height = 8, style = {} }) {
  return <div style={{ width, height, background: WF.lineSoft, borderRadius: 4, ...style }} />;
}

function WFLines({ count = 3, widths, gap = 8 }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: WF.inkSoft, fontWeight: 500 }}>
        <span>{label}{required && <span style={{ color: '#DC2626' }}> *</span>}</span>
        {badge && <WFBadge>{badge}</WFBadge>}
      </div>
      <div
        style={{
          border: `1px solid ${WF.line}`, borderRadius: 6,
          background: WF.panel,
          height: kind === 'textarea' ? 64 : 34,
          padding: '8px 12px',
          fontSize: 14, color: value ? WF.ink : WF.inkFaint,
          display: 'flex', alignItems: kind === 'textarea' ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          fontFamily: kind === 'mono' ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
        }}
      >
        <span>{value || <span style={{ color: WF.inkFaint }}>—</span>}</span>
        {kind === 'select' && <span style={{ color: WF.inkFaint, fontSize: 12 }}>▾</span>}
        {kind === 'date' && <span style={{ color: WF.inkFaint, fontSize: 12 }}>📅</span>}
      </div>
      {hint && <div style={{ fontSize: 12, color: WF.inkFaint }}>{hint}</div>}
    </div>
  );
}

let WF_SELECT_ID = 0;

function WFSelect({
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
  placeholder = 'Select an option',
  style = {},
}) {
  const normalizedOptions = options.map((option) => (
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  ));
  const normalizedValue = value == null ? '' : String(value);
  const selectedIndex = normalizedOptions.findIndex((option) => String(option.value) === normalizedValue);
  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(selectedIndex);
  const [triggerHovered, setTriggerHovered] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const rootRef = React.useRef(null);
  const typeaheadRef = React.useRef({ value: '', timer: null });
  const menuIdRef = React.useRef(null);
  if (!menuIdRef.current) menuIdRef.current = `wf-select-${++WF_SELECT_ID}`;
  const menuId = menuIdRef.current;

  const enabledIndices = normalizedOptions
    .map((option, index) => (!option.disabled ? index : -1))
    .filter((index) => index >= 0);

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
    setActiveIndex(selectedIndex >= 0 && !normalizedOptions[selectedIndex].disabled ? selectedIndex : fallback);
    setOpen(true);
  };

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current && triggerRef.current.focus());
  };

  const chooseOption = (index) => {
    const option = normalizedOptions[index];
    if (!option || option.disabled) return;
    onValueChange && onValueChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current && triggerRef.current.focus());
  };

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;
    const placeMenu = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = Math.min(Math.max(rect.width, menuMinWidth), viewportWidth - 16);
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
      const left = Math.max(8, Math.min(rect.left, viewportWidth - menuWidth - 8));
      setMenuPosition(openAbove
        ? { left, bottom: viewportHeight - rect.top + 4, width: menuWidth }
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

  React.useEffect(() => () => {
    if (typeaheadRef.current.timer) window.clearTimeout(typeaheadRef.current.timer);
  }, []);

  const onTriggerKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu(event.key === 'ArrowUp' ? -1 : 1);
      else moveActive(event.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      if (!open) return;
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1]);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) openMenu();
      else if (activeIndex >= 0) chooseOption(activeIndex);
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const query = `${typeaheadRef.current.value}${event.key}`.toLowerCase();
      typeaheadRef.current.value = query;
      if (typeaheadRef.current.timer) window.clearTimeout(typeaheadRef.current.timer);
      typeaheadRef.current.timer = window.setTimeout(() => { typeaheadRef.current.value = ''; }, 500);
      const match = normalizedOptions.findIndex((option) => !option.disabled && String(option.label).toLowerCase().startsWith(query));
      if (match >= 0) {
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(match);
      }
    }
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
        border: '1px solid var(--ds-select-menu-border, #E2E8F0)',
        borderRadius: 'var(--ds-select-menu-radius, 8px)',
        background: 'var(--ds-select-menu-bg, #FFFFFF)',
        boxShadow: 'var(--ds-select-menu-shadow, 0 8px 24px rgba(15,23,42,.14))',
        fontFamily: 'inherit',
      }}>
      {normalizedOptions.map((option, index) => {
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
              background: active || selected ? 'var(--ds-select-option-bg-active, #EFF6FF)' : 'transparent',
              color: option.disabled ? WF.inkFaint : 'var(--ds-select-option-text, #0F172A)',
              fontFamily: 'inherit', fontSize, fontWeight: selected ? 700 : 500,
              cursor: option.disabled ? 'not-allowed' : 'pointer', opacity: option.disabled ? 0.56 : 1,
            }}>
            <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
            {option.meta != null && (
              <span style={{
                flexShrink: 0, padding: '4px 8px', borderRadius: 999,
                background: 'var(--ds-select-option-meta-bg, #F8FAFC)',
                color: 'var(--ds-select-option-meta-text, #475569)',
                fontSize: 12, fontWeight: 600, lineHeight: '16px',
              }}>{option.meta}</span>
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
    <div ref={rootRef} style={{ position: 'relative', width, minWidth: 0, ...style }}>
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
        onClick={() => open ? closeMenu() : openMenu()}
        onKeyDown={onTriggerKeyDown}
        onMouseEnter={() => setTriggerHovered(true)}
        onMouseLeave={() => setTriggerHovered(false)}
        style={{
          width: '100%', height, display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 12px', borderRadius: 'var(--ds-field-radius, 6px)',
          border: `1px solid ${open ? 'var(--ds-select-trigger-border-open, #1B2434)' : 'var(--ds-select-trigger-border, #7C8B9F)'}`,
          background: disabled
            ? WF.fill
            : triggerHovered
              ? 'var(--ds-select-trigger-bg-hover, #F8FAFC)'
              : 'var(--ds-select-trigger-bg, #FFFFFF)',
          color: selectedOption && !selectedOption.placeholder ? 'var(--ds-select-trigger-text, #0F172A)' : WF.inkFaint,
          boxShadow: open ? '0 0 0 2px var(--ds-color-selection-border, #DBEAFE)' : 'none',
          fontFamily: 'inherit', fontSize, fontWeight,
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.64 : 1,
          transition: 'background-color var(--ds-motion-fast, 120ms) ease, border-color var(--ds-motion-fast, 120ms) ease, box-shadow var(--ds-motion-fast, 120ms) ease',
        }}>
        <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          {selectedOption ? (selectedOption.triggerLabel || selectedOption.label) : placeholder}
        </span>
        {showSelectedMeta && selectedOption && selectedOption.meta != null && (
          <span style={{
            flexShrink: 0, padding: '4px 8px', borderRadius: 999,
            background: WF.fill, color: WF.inkSoft,
            fontSize: 12, fontWeight: 600, lineHeight: '16px',
          }}>{selectedOption.triggerMeta || selectedOption.meta}</span>
        )}
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: WF.inkSoft, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--ds-motion-fast, 120ms) ease' }}>
          <path d="m3 5 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {menu && typeof ReactDOM !== 'undefined' ? ReactDOM.createPortal(menu, document.body) : menu}
    </div>
  );
}

// Read-only definition-list label/value (matches the reference exactly)
function WFKV({ label, value, badge, mono, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: WF.inkLabel, fontWeight: 500 }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        fontSize: 14, color: WF.ink, fontWeight: 500,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: WF.ink }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        width: 32, height: 18, borderRadius: 9,
        // An "on" state is an interactive accent, not a status — so it runs on
        // the accent family like every other toggle in the flow (the trip
        // protection switch was already blue while this one was green).
        background: on ? WF.accentOn : WF.fillStrong,
        border: `1px solid ${on ? WF.accentOn : WF.controlLine}`,
        boxSizing: 'border-box',
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
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: WF.ink, cursor: 'pointer' }}>
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${on ? WF.accent : WF.controlLine}`,
        background: on ? WF.accent : WF.panel,
        position: 'relative', flexShrink: 0,
      }}>
        {on && <span style={{ position: 'absolute', inset: 0, color: WF.panel, fontSize: 12, lineHeight: '16px', textAlign: 'center', fontWeight: 700 }}>✓</span>}
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
    default:   { bg: 'var(--ds-badge-neutral-bg, #F8FAFC)', fg: 'var(--ds-badge-neutral-text, #475569)', border: 'var(--ds-color-border, #E2E8F0)' },
    inherit:   { bg: 'var(--ds-badge-info-bg, #EFF6FF)', fg: 'var(--ds-badge-info-text, #1D4ED8)', border: 'var(--ds-badge-info-border, #BFDBFE)' },
    override:  { bg: 'var(--ds-badge-warning-bg, #FEF3C7)', fg: 'var(--ds-badge-warning-text, #92400E)', border: 'var(--ds-badge-warning-border, #FDE68A)' },
    locked:    { bg: 'var(--ds-color-canvas, #F1F5F9)', fg: 'var(--ds-primitive-color-slate-500, #64748B)', border: 'var(--ds-color-border, #E2E8F0)' },
    active:    { bg: 'var(--ds-badge-success-bg, #D1FAE5)', fg: 'var(--ds-badge-success-text, #047857)', border: 'var(--ds-badge-success-border, #A7F3D0)' },
    inactive:  { bg: 'var(--ds-badge-danger-bg, #FEE2E2)', fg: 'var(--ds-badge-danger-text, #B91C1C)', border: 'var(--ds-badge-danger-border, #FECACA)' },
    draft:     { bg: 'var(--ds-badge-warning-bg, #FEF3C7)', fg: 'var(--ds-primitive-color-warning-700, #A16207)', border: 'var(--ds-badge-warning-border, #FDE68A)' },
    new:       { bg: WF.accent, fg: WF.accentText, border: WF.accent },
  }[kind];
  const pad = size === 'xs' ? '4px 8px' : '4px 12px';
  const fs = 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: styles.bg, color: styles.fg,
      border: `1px solid ${styles.border}`,
      borderRadius: 999, padding: pad, fontSize: fs,
      lineHeight: '16px', whiteSpace: 'nowrap',
      fontWeight: 600, letterSpacing: '0.04em',
    }}>{children}</span>
  );
}

// ──────────────────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────────────────
function WFButton({ children, primary, danger, ghost, size = 'md', icon }) {
  const pad = size === 'sm' ? '4px 12px' : '8px 16px';
  const fs = size === 'sm' ? 12 : 14;
  const bg = primary ? WF.accent : ghost ? 'transparent' : WF.panel;
  const fg = primary ? WF.accentText : danger ? 'var(--ds-color-danger-text, #B91C1C)' : WF.ink;
  const border = primary ? WF.accent : danger ? 'var(--ds-color-danger-border, #FECACA)' : WF.line;
  return (
    <button style={{
      padding: pad, fontSize: fs,
      border: `1px solid ${border}`, background: bg, color: fg,
      cursor: 'pointer', borderRadius: 6,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontWeight: primary ? 600 : 500,
      fontFamily: 'inherit',
      boxShadow: primary ? 'var(--ds-button-shadow, 0 1px 2px rgba(15,23,42,0.08))' : 'none',
    }}>
      {icon && <span style={{ fontSize: fs, opacity: 0.85 }}>{icon}</span>}
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
        borderRadius: 6, padding: '8px 12px',
        fontSize: 12, color: WF.calloutInk, lineHeight: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        display: 'flex', gap: 8,
      }}>
        <div style={{
          flexShrink: 0, width: 18, height: 18, borderRadius: 9,
          background: '#78350F', color: '#fff',
          fontSize: 12, fontWeight: 700,
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
      fontSize: 12, fontWeight: 700,
      ...style,
    }}>{n}</span>
  );
}

// ──────────────────────────────────────────────────────────
// Margaritaville at Sea — sidebar brand tokens, wordmark & nav icons
// ──────────────────────────────────────────────────────────
const MV_NAVY = 'var(--ds-color-shell-bg, #1B2436)';
const MV_ACCENT = 'var(--ds-color-shell-nav-active, #C03A2B)';
// The deep brand red remains the active group fill. On the navy sidebar it was
// only 2.87:1, so sub-navigation uses a lighter coral that clears AA for text.
const MV_ACCENT_TEXT = 'var(--ds-color-shell-nav-current, #FF7A6B)';
// #A8B2BE on MV_NAVY (#1B2436) is ~7.2:1 — clears WCAG AAA (7:1) for normal
// text, not just AA (4.5:1) the previous #9CA7B4 (~6.4:1) landed on.
const MV_INK_MUTED = 'var(--ds-color-shell-text-muted, #A8B2BE)';

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
// Three columns: sidebar | content | rail. The rail keeps its own grid track so
// it remains visible while the content scrolls, but its working surface is
// inset as a floating card instead of reading like a full-height page column.
// The progress bar sits pinned above the content scrollport; only the content
// beneath it moves.
// Give the summary more room on large desktops without taking that width away
// from the booking canvas at the app's minimum desktop size.
const RAIL_TRACK = 'clamp(320px, 22vw, 344px)';

function WFAppShell({ active = 'fares', activeGroup = 'fares', breadcrumb, title, actions, children, rightRail, progressBar, bottomBar, contentPaddingTop }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', label: 'Bookings', children: [
      { id: 'all-bookings', label: 'All bookings' },
      { id: 'create-booking', label: 'Create booking' },
      { id: 'group-reservations', label: 'Group reservations' },
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
  const cols = rightRail ? `200px minmax(0, 1fr) ${RAIL_TRACK}` : '200px minmax(0, 1fr)';
  const resolvedContentPaddingTop = contentPaddingTop == null
    ? (progressBar ? 16 : 20)
    : contentPaddingTop;
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateColumns: cols, gridTemplateRows: '52px minmax(0, 1fr) auto',
      background: 'var(--ds-color-workspace, #F9FAFC)', color: WF.ink,
      fontFamily: 'var(--ds-type-family-body, "Inter", system-ui, -apple-system, sans-serif)', fontSize: 14,
      overflow: 'hidden',
    }}>
      {/* Top bar — spans the content area and the rail. `-1` is the last explicit
          line, so this covers column 2 alone when there is no rail, and columns
          2-3 when there is. */}
      <div style={{
        gridColumn: '2 / -1', gridRow: 1,
        borderBottom: `1px solid ${WF.line}`, background: WF.panel,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', border: `1px solid ${WF.line}`, borderRadius: 8,
          fontSize: 14, color: WF.inkFaint, background: WF.fill, minWidth: 280,
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
          fontSize: 12, fontWeight: 700,
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
        <div style={{ padding: '0 16px 28px', display: 'flex', justifyContent: 'center' }}>
          <MVLogo width={150} />
        </div>
        {navItems.map((it) => {
          const isActiveGroup = it.id === activeGroup;
          return (
            <div key={it.id} style={{ padding: '0 12px', marginBottom: 4 }}>
              <div style={{
                position: 'relative',
                padding: '12px 16px', borderRadius: 8,
                color: isActiveGroup ? '#fff' : MV_INK_MUTED,
                background: isActiveGroup ? MV_ACCENT : 'transparent',
                fontWeight: isActiveGroup ? 700 : 500,
                fontSize: 14,
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
                <div style={{ padding: '8px 0 4px 44px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {it.children.map((c) => {
                    const on = c.id === active;
                    return (
                      <div key={c.id} style={{
                        padding: '8px 0 8px 12px', fontSize: 14,
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
          <div className="booking-progress-shell" style={{ padding: '20px 20px 0 28px', flexShrink: 0, background: 'var(--ds-color-workspace, #F9FAFC)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ minWidth: 0, width: '100%' }}>
              {progressBar}
            </div>
          </div>
        )}
        {/* The scroll container. Deliberately a plain block, not a flex column —
            WebKit drops padding-bottom at scroll end on flex scrollports. */}
        <div style={{
          padding: `${resolvedContentPaddingTop}px 20px 20px 28px`,
          flex: 1, minHeight: 0,
          // overflowY: auto alone would compute overflow-x to auto as well, so
          // anything escaping sideways would raise a horizontal scrollbar.
          overflowY: 'auto', overflowX: 'hidden',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {actions && !title && (
            <div style={{ display: 'flex', marginBottom: 16 }}>
              {actions}
            </div>
          )}
          {title && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
              <div>{title}</div>
              {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
      {/* Summary rail — its grid track preserves the main-content width while
          the inset card creates a clearly separate, floating workspace. */}
      {rightRail && (
        <div style={{
          gridColumn: 3, gridRow: 2,
          padding: '16px 12px 16px 8px', background: 'var(--ds-color-workspace, #F9FAFC)',
          minHeight: 0, overflow: 'hidden', boxSizing: 'border-box',
        }}>
          <div style={{
            height: '100%', minHeight: 0, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 10,
            boxShadow: 'var(--ds-panel-shadow, 0 2px 8px rgba(15,23,42,0.06))',
          }}>
            {rightRail}
          </div>
        </div>
      )}
      {bottomBar && (
        <div style={{
          gridColumn: '2 / -1', gridRow: 3,
          padding: '12px 28px 16px', borderTop: `1px solid ${WF.line}`,
          background: WF.panel,
        }}>
          <div style={{ maxWidth: 1460, width: '100%', margin: '0 auto' }}>
            {bottomBar}
          </div>
        </div>
      )}
    </div>
  );
}

// Page title
function WFTitle({ eyebrow, title, sub }) {
  return (
    <div>
      {eyebrow && <div style={{ fontSize: 12, color: WF.inkLabel, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>{eyebrow}</div>}
      <div style={{ fontSize: 24, fontWeight: 700, color: WF.ink, lineHeight: '32px', letterSpacing: '-0.01em' }}>{title}</div>
      {sub && <div style={{ fontSize: 14, color: WF.inkSoft, marginTop: 8 }}>{sub}</div>}
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
        fontSize: 12, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.04em',
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
          padding: '12px 16px', fontSize: 14,
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
    <div style={{ width: '100%', fontSize: 14 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns.map(c => c.w || '1fr').join(' '),
        background: WF.fill,
        borderBottom: `1px solid ${WF.line}`,
        fontSize: 12, fontWeight: 600, color: WF.inkLabel,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {columns.map((c, i) => (
          <div key={i} style={{ padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
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
              fontSize: c.mono ? 12 : 14,
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
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', borderRadius: 6,
      border: `1px solid ${hasValue ? '#CBD5E1' : WF.line}`,
      background: hasValue ? WF.fill : WF.panel,
      fontSize: 12,
    }}>
      <span style={{ color: WF.inkFaint }}>{label}:</span>
      <span style={{ color: WF.ink, fontWeight: 500 }}>{value}</span>
      {dropdown && <span style={{ color: WF.inkFaint, fontSize: 12 }}>▾</span>}
    </div>
  );
}

// Search input
function WFSearch({ placeholder, width = 280 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      width, padding: '8px 12px', borderRadius: 6,
      border: `1px solid ${WF.line}`, background: WF.panel,
      fontSize: 14, color: WF.inkFaint,
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
      padding: '12px 16px', alignItems: 'center', gap: 12,
      background: overridden ? '#FFFBEB' : WF.panel,
    }}>
      <div style={{ fontSize: 14, color: WF.inkSoft, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
        {marker && <WFMarker n={marker} />}
        {label}
      </div>
      <div style={{ fontSize: 14, color: WF.inkFaint, fontStyle: overridden ? 'italic' : 'normal' }}>
        {parentValue}
      </div>
      <div style={{ fontSize: 14, color: WF.ink, fontWeight: overridden ? 600 : 500 }}>
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
              color: WF.inkSoft, fontSize: 24, flexShrink: 0,
            }}>{icon}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: WF.ink, lineHeight: '28px', letterSpacing: '-0.01em' }}>{title}</div>
            {badges && <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{badges}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {actions}
            {onClose && (
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: 'none', background: 'transparent',
                color: WF.inkSoft, fontSize: 20, cursor: 'pointer',
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
            padding: '16px 28px', borderTop: `1px solid ${WF.line}`,
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          color: WF.inkLabel,
        }}>{title}</div>
        {action}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        rowGap: 16, columnGap: 32,
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
      <div style={{ fontSize: 14, color: WF.inkSoft, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{label}</span>
        {badge && <WFBadge size="xs">{badge}</WFBadge>}
      </div>
      <div style={{
        fontSize: 14, color: WF.ink, fontWeight: 500,
        fontFamily: mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
        display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right',
      }}>
        {icon && <span style={{ color: WF.inkFaint, fontSize: 14 }}>{icon}</span>}
        <span>{value ?? '—'}</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  WF, WFBox, WFPlaceholder, WFLine, WFLines, WFField, WFSelect, WFKV,
  WFToggle, WFCheckbox, WFBadge, WFButton,
  WFCallout, WFMarker, WFAppShell, WFTitle, WFSectionHead, WFCard,
  WFTabs, WFTable, WFChip, WFSearch, WFInheritedRow,
  WFSidePanel, WFPanelSection, WFDLRow,
  MVLogo, MVIcon,
});
