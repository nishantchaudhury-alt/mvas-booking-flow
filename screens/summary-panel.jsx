// ───────────────────────────────────────────────────────────────────────────
// BookingSummaryPanel — the one right-rail panel, used by all four steps.
//
// Replaces four divergent implementations (SummaryPanel / SummaryPanel2 + its
// package-preview takeover / SummaryPanel3 / Step 4's inline ledger) that
// disagreed on section headings, row labels, formats, colours and pricing math.
//
// The skeleton is FIXED: every section and every row renders at every step. A
// value the booking does not have yet shows a dimmed em-dash rather than the
// row disappearing, so the agent watches the same panel fill in as they work
// instead of re-learning a new layout on each screen.
// ───────────────────────────────────────────────────────────────────────────

// Renamed from SP_GREEN: this marks add-ons that are *charging* (supplements,
// packages, the ✓ on included items), so green was doubly wrong — it read as
// savings on money being spent, and it was a third accent colour competing with
// the flow's teal and blue. Now the one shared accent. Genuine savings (the
// coupon discount) keep their own green further down this file; that one is
// semantics, not accent.
const SP_ACCENT = WF.accentInk;
const SP_DASH = '—';

// money() prefixes the sign onto the digits ("$-384.90"). Discounts read as
// currency, so the sign belongs in front.
const spMoney = (n) => (n < 0 ? `-${money(Math.abs(n))}` : money(n));

// ── Section wrapper ──
// `collapsible` turns the heading into a toggle. `summary` is the one-line gist
// shown in its place while collapsed, so the section still carries information
// when closed rather than just hiding.
function SPSection({ title, children, tint, action, collapsible, defaultCollapsed, summary }) {
  const [open, setOpen] = React.useState(!defaultCollapsed);
  const collapsed = collapsible && !open;

  const heading = (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
      color: WF.inkSoft, textTransform: 'uppercase',
    }}>{title}</div>
  );

  return (
    <div style={{
      padding: '12px 16px', borderBottom: `1px solid ${WF.line}`,
      background: tint ? '#fff' : 'transparent',
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, marginBottom: collapsed ? 0 : 8,
        }}>
          {collapsible ? (
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}>
              <span style={{
                fontSize: 12, color: WF.inkFaint, flexShrink: 0,
                transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s',
              }}>▶</span>
              {heading}
              {collapsed && summary && (
                <span style={{
                  fontSize: 12, color: WF.inkSoft, fontWeight: 500, marginLeft: 'auto',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                }}>{summary}</span>
              )}
            </button>
          ) : heading}
          {action}
        </div>
      )}
      {!collapsed && children}
    </div>
  );
}

// ── Label/value row. `dim` renders the em-dash treatment. ──
function SPRow({ label, value, dim, mono, accent, strong }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <div style={{ fontSize: 12, color: WF.inkSoft, flexShrink: 0 }}>{label}</div>
      <div style={{
        fontSize: 12,
        fontWeight: strong ? 700 : 500,
        color: dim ? WF.inkFaint : accent || WF.ink,
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
        textAlign: 'right', minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  );
}

// Compact multi-category disclosure for the narrow summary rail. The first
// booked cabin type remains readable in the row; additional distinct types are
// available from the +N trigger without widening or wrapping the rail.
function SPCabinTypeSummary({ b, p }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const cabinTypes = [];
  const byType = new Map();

  (b.cabins || []).forEach((cabin, index) => {
    if (!cabin) return;
    const key = cabin.categoryRowId || cabin.rowId || cabin.label || cabin.cat || `cabin-${index}`;
    const label = cabin.label || (p.cabin && p.cabin.name) || 'Cabin';
    if (!byType.has(key)) {
      const item = { key, label, rooms: [] };
      byType.set(key, item);
      cabinTypes.push(item);
    }
    if (cabin.num) byType.get(key).rooms.push(cabin.num);
  });

  if (cabinTypes.length === 0 && p.cabin) {
    cabinTypes.push({ key: p.cabin.id || p.cabin.name, label: p.cabin.name, rooms: [] });
  }

  React.useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsidePress = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const first = cabinTypes[0];
  const additionalCount = Math.max(0, cabinTypes.length - 1);
  const compactLabel = first ? first.label.split(' – ')[0] : SP_DASH;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <div style={{ fontSize: 12, color: WF.inkSoft, flexShrink: 0 }}>Cabin types</div>
      <div
        ref={rootRef}
        onMouseEnter={() => additionalCount > 0 && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, minWidth: 0 }}>
        <span
          title={first ? first.label : undefined}
          style={{
            minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontSize: 12, fontWeight: 500, color: first ? WF.ink : WF.inkFaint,
          }}>
          {compactLabel}
        </span>
        {additionalCount > 0 && (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="sp-cabin-types-popover"
            aria-label={`Show all ${cabinTypes.length} cabin types`}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen((value) => !value)}
            style={{
              minWidth: 28, height: 24, padding: '4px 8px', borderRadius: 999,
              border: `1px solid ${WF.line}`, background: open ? WF.accentTint : WF.fill,
              color: WF.accentInk, fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              lineHeight: '16px', cursor: 'pointer', flexShrink: 0,
            }}>
            +{additionalCount}
          </button>
        )}
        {open && additionalCount > 0 && (
          <div
            id="sp-cabin-types-popover"
            role="dialog"
            aria-label="Cabin types in this booking"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 60,
              width: 264, maxWidth: 'calc(100vw - 32px)', padding: 12,
              border: `1px solid ${WF.line}`, borderRadius: 8, background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(15,23,42,0.14)', textAlign: 'left',
            }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink, marginBottom: 8 }}>
              Cabin types ({cabinTypes.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cabinTypes.map((type) => (
                <div key={type.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: WF.ink }}>{type.label}</div>
                    {type.rooms.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace' }}>
                        {type.rooms.map((room) => `#${room}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: WF.inkSoft }}>
                    {type.rooms.length || 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Price row, with an optional before → after comparison for package preview ──
function SPPriceRow({ label, amount, preview, accent, strong, sub }) {
  const changed = preview !== undefined && preview !== null && preview !== amount;
  const fmt = spMoney;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <div style={{ fontSize: 12, color: WF.inkSoft, minWidth: 0 }}>
        {label}
        {sub && <div style={{ fontSize: 12, color: WF.inkFaint, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
        {changed && (
          <>
            <span style={{ fontSize: 12, color: WF.inkFaint, fontFamily: 'ui-monospace, monospace', textDecoration: 'line-through' }}>
              {fmt(amount)}
            </span>
            <span style={{ fontSize: 12, color: WF.inkFaint }}>→</span>
          </>
        )}
        <span style={{
          fontSize: strong ? 14 : 12,
          fontWeight: strong || changed ? 700 : 600,
          color: changed ? '#1B2434' : accent || WF.ink,
          fontFamily: 'ui-monospace, monospace',
        }}>{fmt(changed ? preview : amount)}</span>
      </div>
    </div>
  );
}

// ── Segmented control — for mutually-exclusive VIEWS of the same data. ──
// Distinct from SPPills on purpose: pills set a booking value (coupon, hold,
// payment terms), a segmented control only changes what you're looking at.
// One grey track, equal-width segments, the active one raised on white — the
// standard pattern, so it reads as "toggle" before it's read at all.
function SPSegmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: WF.fill, border: `1px solid ${WF.line}`, borderRadius: 8,
    }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt)}
            style={{
              flex: 1, minWidth: 0, padding: '8px 8px', fontSize: 12,
              fontWeight: on ? 700 : 500, border: 'none', borderRadius: 6,
              background: on ? '#fff' : 'transparent',
              color: on ? WF.ink : WF.inkSoft,
              boxShadow: on ? '0 1px 2px rgba(15,23,42,0.14)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── Row cluster inside "Your selection" ──
// The selection used to be 14 undifferentiated label/value rows; finding
// "Room" meant scanning all of them. Grouping by the question being answered
// (where & who → which sailing → which room → on what terms) gives the eye
// landing points. The header is a label plus an inline rule running to the
// right edge — the rule marks the section boundary and the label names it in
// one line, so neither a bare caption (too quiet) nor a boxed band (too
// heavy) is needed.
function SPGroup({ label, first, children }) {
  return (
    <div style={{ marginTop: first ? 0 : 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
          color: WF.inkSoft, textTransform: 'uppercase', flexShrink: 0,
        }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: WF.line }} />
      </div>
      {children}
    </div>
  );
}

// ── Compact information cards used by the persistent right rail ────────────
// The rail is deliberately narrow. Rather than repeat the desktop pattern of
// uppercase heading + several loose rows, these cards lead with the decision-
// making value and keep its label as supporting metadata. This makes the same
// information readable at a glance without hiding any booking data.
function SPKicker({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
      color: WF.inkLabel || WF.inkSoft, textTransform: 'uppercase', lineHeight: '16px',
    }}>{children}</div>
  );
}

function SPDatum({ label, value, dim, mono, align = 'left' }) {
  return (
    <div style={{ minWidth: 0, textAlign: align }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
        color: WF.inkFaint, textTransform: 'uppercase', lineHeight: '16px',
      }}>{label}</div>
      <div style={{
        marginTop: 4, fontSize: 12, fontWeight: 700,
        color: dim ? WF.inkFaint : WF.ink, lineHeight: '16px',
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
      }}>{value}</div>
    </div>
  );
}

function SPBookingSnapshot({
  b, p, guestStr,
  roomLabel, roomStr, showSupps, setShowSupps,
}) {
  const bookingType = b.bookingType || 'Normal';

  return (
    <>
      <SPGroup label="Trip" first>
        <SPRow label="Booking Type" value={bookingType} />
        <SPRow label="Source" value={b.source || SP_DASH} dim={!b.source} />
        <SPRow label="Guests" value={guestStr} dim={p.guestCount === 0} mono />
      </SPGroup>

      <SPGroup label="Stateroom">
        <SPCabinTypeSummary b={b} p={p} />
        <SPRow
          label="Cabin type delta"
          value={p.cabin ? (p.cabinDeltaPP > 0 ? `+$${p.cabinDeltaPP}pp` : 'Included') : SP_DASH}
          dim={!p.cabin}
          mono={!!p.cabin} />
        <SPRow label={roomLabel} value={roomStr || SP_DASH} dim={!roomStr} />
        <SPRow
          label="Room delta"
          value={roomStr ? (p.roomDeltaTotal > 0 ? `+${money(p.roomDeltaTotal)}` : 'Included') : SP_DASH}
          dim={!roomStr}
          mono={!!roomStr} />
        <SPRow
          label="Assignment"
          value={b.cabinId ? (b.assignmentMethod === 'auto' ? 'Auto-assign' : 'Manual select') : SP_DASH}
          dim={!b.cabinId} />
      </SPGroup>

      <SPGroup label="Fare & extras">
        <SPRow label="Farecode" value={p.fc ? p.fc.code : SP_DASH} dim={!p.fc} mono />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
          <div style={{ fontSize: 12, color: WF.inkSoft }}>Supplements</div>
          {p.suppLines.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowSupps((v) => !v)}
              aria-expanded={showSupps}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
                fontSize: 12, fontWeight: 700, color: SP_ACCENT,
              }}>
              {p.suppLines.length} · {p.suppTotal > 0 ? `+${money(p.suppTotal)}` : 'included'}
              <span aria-hidden="true" style={{
                fontSize: 12,
                transform: showSupps ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.12s',
              }}>▾</span>
            </button>
          ) : (
            <div style={{ fontSize: 12, color: WF.inkFaint }}>None</div>
          )}
        </div>

        {showSupps && p.suppLines.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {p.suppLines.map((ln) => (
              <div key={ln.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                  <span>{ln.emoji}</span>
                  <span style={{ color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ln.name}{ln.qty > 1 ? ` ×${ln.qty}` : ''}
                  </span>
                </div>
                <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
                  {ln.amount > 0 ? `+${money(ln.amount)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </SPGroup>
    </>
  );
}

function SPPriceSummary({ b, p }) {
  const groups = [
    {
      label: 'Cruise & fees',
      rows: [
        { label: 'Cabin fare', sub: p.guestCount > 0 ? `${money(p.cabinFarePP)} per guest × ${p.guestCount}` : null, amount: p.cabinFareTotal },
        ...((b.cabins || []).length > 0 ? [{
          label: 'Room selection delta',
          sub: `${b.cabins.length} selected room${b.cabins.length === 1 ? '' : 's'}`,
          amount: p.roomDeltaTotal,
        }] : []),
        { label: 'Gratuities', amount: p.gratuities },
      ],
    },
    {
      label: 'Add-ons',
      rows: [
        { label: 'Supplements', amount: p.suppTotal },
        { label: 'Trip protection', amount: p.protectionTotal },
      ],
    },
  ];

  if (p.couponDisc !== 0) {
    groups.push({
      label: 'Discounts',
      rows: [{ label: `Coupon · ${b.appliedCoupon}`, amount: p.couponDisc }],
    });
  }

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, overflow: 'hidden', background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,.05)' }}>
      {groups.map((group, groupIndex) => (
        <div key={group.label} style={{ padding: '8px 12px', borderTop: groupIndex === 0 ? 'none' : `1px solid ${WF.line}` }}>
          <SPKicker>{group.label}</SPKicker>
          <div style={{ marginTop: 4 }}>
            {group.rows.map((row) => (
              <SPPriceRow key={row.label} label={row.label} sub={row.sub} amount={row.amount} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SPPromotionControl({ b, p, set, showOffers }) {
  const code = b.customCode || '';
  const applied = b.appliedCoupon && b.appliedCoupon !== 'None';
  const applyCode = () => {
    const nextCode = code.trim().toUpperCase();
    if (nextCode) set({ customCode: nextCode, appliedCoupon: nextCode });
  };

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${WF.line}` }}>
      <label htmlFor="summary-promotion-code" style={{ display: 'block', fontSize: 12, lineHeight: '16px', fontWeight: 600, color: WF.inkSoft }}>
        Promotion code
      </label>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input
          id="summary-promotion-code"
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={(e) => set({ customCode: e.target.value.toUpperCase() })}
          onKeyDown={(e) => { if (e.key === 'Enter') applyCode(); }}
          style={{
            flex: 1, minWidth: 0, padding: '8px 12px', fontSize: 12,
            border: `1px solid ${WF.line}`, borderRadius: 6,
            background: WF.panel, color: WF.ink, fontFamily: 'inherit', outline: 'none',
          }} />
        <button
          type="button"
          onClick={applyCode}
          disabled={!code.trim()}
          style={{
            padding: '8px 12px', fontSize: 12, fontWeight: 700,
            border: 'none', borderRadius: 6,
            background: code.trim() ? WF.accent : WF.fillStrong,
            color: code.trim() ? WF.accentText : WF.inkFaint,
            cursor: code.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>
          Apply
        </button>
      </div>

      {showOffers && (
        <div style={{ marginTop: 8 }}>
          <SPPills
            options={['None', 'SAVE10', 'EARLYBIRD']}
            value={b.appliedCoupon}
            onChange={(coupon) => set({ appliedCoupon: coupon, customCode: coupon === 'None' ? '' : coupon })} />
        </div>
      )}

      {applied && (
        <div style={{
          marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: p.couponIsCustom ? 'var(--ds-primitive-color-warning-50, #FFFBEB)' : 'var(--ds-color-success-bg, #F0FDF4)',
          borderRadius: 7, border: `1px solid ${p.couponIsCustom ? 'var(--ds-color-warning-border, #FDE68A)' : 'var(--ds-color-success-border, #BBF7D0)'}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: p.couponIsCustom ? 'var(--ds-color-warning-text, #92400E)' : 'var(--ds-color-success-text, #047857)' }}>
              {b.appliedCoupon}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: p.couponIsCustom ? 'var(--ds-color-warning-text, #92400E)' : 'var(--ds-color-success-text, #047857)' }}>
              {p.couponIsCustom ? 'Pending validation' : `${Math.round(p.couponPct * 100)}% off eligible fare`}
            </div>
          </div>
          <button
            type="button"
            onClick={() => set({ appliedCoupon: 'None', customCode: '' })}
            aria-label={`Remove promotion ${b.appliedCoupon}`}
            style={{
              flexShrink: 0, padding: '4px 8px', border: 'none', background: 'transparent',
              color: p.couponIsCustom ? 'var(--ds-color-warning-text, #92400E)' : 'var(--ds-color-success-text, #047857)',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function SPAmountDueCard({ p }) {
  const dueShare = p.total > 0 ? Math.max(0, Math.min(100, (p.amountDue / p.total) * 100)) : 0;
  const rateLabel = p.payFull ? 'Full balance' : `${Math.round(p.depositRate * 100)}% deposit`;

  return (
    <div style={{
      borderRadius: 10, background: WF.accentTint || '#EFF6FF',
      border: `1px solid ${WF.accentLine || '#DBEAFE'}`,
      padding: '12px 12px', boxShadow: '0 1px 2px rgba(15,23,42,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <SPKicker>Payment today</SPKicker>
        <span style={{
          padding: '4px 8px', borderRadius: 999, background: WF.panel,
          border: `1px solid ${WF.accentLine || '#DBEAFE'}`,
          color: WF.accentInk, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>{rateLabel}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: WF.inkSoft }}>Amount due now</div>
      <div style={{
        marginTop: 4, fontSize: 24, fontWeight: 700, color: WF.ink,
        fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em', lineHeight: '32px',
      }}>{money(p.amountDue)}</div>
      <div style={{ height: 4, marginTop: 12, borderRadius: 999, background: '#DCE6F3', overflow: 'hidden' }}>
        <div style={{ width: `${dueShare}%`, height: '100%', borderRadius: 999, background: WF.accentInk }} />
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        marginTop: 8, paddingTop: 8, borderTop: `1px solid ${WF.accentLine || '#DBEAFE'}`,
      }}>
        <SPDatum label={p.status === 'partial' ? 'Provisional total' : 'Booking total'} value={money(p.total)} mono />
        <SPDatum label="Remaining" value={money(p.remaining)} mono align="right" />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: WF.inkSoft, lineHeight: '16px' }}>
        {p.payFull
          ? 'Nothing remains after this payment.'
          : p.status === 'partial'
            ? 'Select a fare to confirm the final deposit.'
            : 'Remaining balance is due 45 days before departure.'}
      </div>
    </div>
  );
}

// ── Pill row used by promotions / hold / payment terms ──
function SPPills({ options, value, onChange, dark }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '4px 12px', fontSize: 12, fontWeight: on ? 700 : 500,
            border: `1px solid ${on ? '#1B2434' : WF.line}`, borderRadius: 20,
            background: on ? '#1B2434' : '#fff', color: on ? '#fff' : WF.ink,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── Per-berth fare factors ─────────────────────────────────────────────────
// PLACEHOLDER PRICING. Real cruise fares are not flat per person: berths 1–2
// carry the full occupancy rate, 3rd/4th guests sail at a reduced rate, and
// children/infants price below an adult in the same berth. `cabinFarePP` in
// computeBookingPricing is a single flat rate, so these factors exist only to
// SPLIT a room's fare into a realistic-looking per-person shape for the
// cabin-wise view — they never change what the booking is charged. When real
// per-berth rates arrive they replace these two tables and the split becomes
// the actual quote rather than an allocation of one.
const SP_BERTH_FACTOR = (berth) => (berth <= 2 ? 1 : berth <= 4 ? 0.7 : 0.6);
const SP_PAX_FACTOR = { adults: 1, youngAdults: 1, children: 0.75, infants: 0.25 };
const SP_PAX_CODE = { adults: 'A', youngAdults: 'YA', children: 'C', infants: 'I' };
const SP_PAX_TYPE = { adults: 'Adult', youngAdults: 'Young adult', children: 'Child', infants: 'Infant' };
const SP_ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// Splits `total` across `weights` so the parts re-add to `total` EXACTLY.
// Works in whole cents and hands the rounding residue to the largest
// fractional remainders: the room subtotals feed the Booking total, so a
// per-person list that summed to a cent either side of its own room fare would
// put a visible discrepancy on the receipt.
function spAllocate(total, weights) {
  const sum = weights.reduce((a, w) => a + w, 0);
  if (!(sum > 0) || !(total > 0)) return weights.map(() => 0);
  const cents = Math.round(total * 100);
  const raw = weights.map((w) => (cents * w) / sum);
  const out = raw.map((x) => Math.floor(x));
  const spare = cents - out.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < spare; k++) out[byRemainder[k % byRemainder.length].i] += 1;
  return out.map((c) => c / 100);
}

// ── Cabin-wise breakdown ────────────────────────────────────────────────────
// Splits the booking into the per-stateroom view an agent reads back to a
// guest: each room's fare (rate × its occupants), the guest-level supplements
// assigned to travellers in that room, and its occupancy
// share of the flat taxes & fees figure. Guest→cabin allocation comes from
// the same buildCabinGuestMap Step 1's assignment flow uses, so this view
// can't disagree with the screens that wrote the data.
function spCabinBreakdown(b, p) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const cabins = b.cabins || [];
  if (cabins.length === 0) return { rooms: [], unassigned: null };

  const SUPP = (typeof S2_SUPP !== 'undefined' && S2_SUPP) || [];
  const suppById = (id) => SUPP.find((s) => s.id === id) || null;
  const guestToCabin = buildCabinGuestMap(b.guests, cabins);
  const assign = b.suppAssignments || {};

  // Supplement lines for one set of guest assignment keys.
  const linesFor = (keys) => {
    const lines = [];
    let total = 0;
    Object.entries(assign).forEach(([suppId, byKey]) => {
      const su = suppById(suppId);
      if (!su || !byKey) return;
      let guestQty = 0;
      Object.entries(byKey).forEach(([k, v]) => {
        if (!(v > 0) || !keys.has(k) || k.startsWith('infants-')) return;
        if (!isCabinSuppKey(k)) guestQty += v;
      });
      if (guestQty > 0) {
        const amount = su.pricePP * guestQty;
        total += amount;
        lines.push({ id: `${suppId}:guest`, name: su.name, emoji: su.emoji, qty: guestQty, amount, scope: 'guest', inPkg: false });
      }
    });
    return { lines, total: r2(total) };
  };

  const totalGuests = p.guestCount || 0;
  let assignedGuests = 0;
  let taxAllocated = 0;

  // The travellers allocated to one room, in the same category order
  // buildCabinGuestMap deals them out (adults → young adults → children →
  // infants) so berth 1 is the room's lead adult rather than whichever key
  // Object.keys happened to yield first.
  const gd = b.guestData || {};
  const CATS = window.CABIN_ALLOC_CATS || ['adults', 'youngAdults', 'children', 'infants'];
  const occupantsOf = (ck) => {
    const out = [];
    CATS.forEach((cat) => {
      Object.keys(guestToCabin)
        .filter((gk) => guestToCabin[gk] === ck && gk.startsWith(`${cat}-`))
        .map((gk) => ({ gk, idx: parseInt(gk.slice(cat.length + 1), 10) }))
        .sort((a, b) => a.idx - b.idx)
        .forEach(({ gk, idx }) => {
          const code = `${SP_PAX_CODE[cat]}${idx + 1}`;
          const rec = gd[code];
          out.push({
            key: gk,
            code,
            // Falls back to the type label rather than showing a blank row: a
            // traveller reaches this view unnamed all the time (names are
            // captured on the next step).
            name: rec && rec.name ? rec.name : `${SP_PAX_TYPE[cat]} ${idx + 1}`,
            type: SP_PAX_TYPE[cat],
            cat,
          });
        });
    });
    return out;
  };

  const rooms = cabins.map((cab) => {
    const ck = cabinSuppKey(cab.id);
    const cg = cab.guests || {};
    const occupants = (cg.adults || 0) + (cg.youngAdults || 0) + (cg.children || 0) + (cg.infants || 0);
    assignedGuests += occupants;
    const keys = new Set([ck]);
    Object.keys(guestToCabin).forEach((gk) => { if (guestToCabin[gk] === ck) keys.add(gk); });
    const { lines, total: suppTotal } = linesFor(keys);
    const fare = r2(p.cabinFarePP * occupants);
    const roomDelta = Number.isFinite(Number(cab.roomDelta)) ? Math.max(0, r2(Number(cab.roomDelta))) : 0;
    const taxes = totalGuests > 0 ? r2(p.gratuities * occupants / totalGuests) : 0;
    taxAllocated += taxes;
    // Per-person split of THIS room's fare. Allocated, not independently
    // priced, so `people` always re-adds to `fare` above.
    const people = occupantsOf(ck).map((pax, i) => ({
      ...pax,
      berth: i + 1,
      berthLabel: `${SP_ORDINAL[i] || `${i + 1}th`} guest`,
      weight: SP_BERTH_FACTOR(i + 1) * (SP_PAX_FACTOR[pax.cat] ?? 1),
    }));
    const shares = spAllocate(fare, people.map((pax) => pax.weight));
    people.forEach((pax, i) => { pax.fare = shares[i]; });
    return {
      key: ck,
      label: cab.num ? `Room #${cab.num}` : cab.label || 'Cabin',
      // The category name, not the raw code (`cab.cat` is "IS"/"OV"/"BAL"/"STE")
      // — an agent reading this back to a guest says "Interior Stateroom", not
      // "IS".
      cat: cabinCategoryName(cab), occupants, fare, roomDelta, lines, suppTotal, taxes, people,
    };
  });

  // Per-room tax shares are rounded, so when every guest is in a room the
  // last room absorbs the rounding residue — the shares must re-add to the
  // booking's one taxes & fees figure, not drift a cent from it.
  if (rooms.length > 0 && assignedGuests === totalGuests) {
    const last = rooms[rooms.length - 1];
    last.taxes = r2(last.taxes + p.gratuities - taxAllocated);
  }
  rooms.forEach((rm) => { rm.subtotal = r2(rm.fare + rm.roomDelta + rm.suppTotal + rm.taxes); });

  // Guests not yet allocated to any room can still carry supplements; those
  // charges are real, so they get their own group rather than vanishing.
  const unKeys = new Set();
  Object.entries(b.guests || {}).forEach(([cat, count]) => {
    for (let i = 0; i < (count || 0); i++) {
      const gk = `${cat}-${i}`;
      if (!guestToCabin[gk]) unKeys.add(gk);
    }
  });
  const un = unKeys.size > 0 ? linesFor(unKeys) : null;
  const unassigned = un && un.lines.length > 0
    ? { count: unKeys.size, lines: un.lines, suppTotal: un.total }
    : null;

  return { rooms, unassigned };
}

// One supplement line inside a room receipt. Quantity is its own compact datum
// and all charge amounts use the standard receipt ink; emojis and coloured
// scope tags made these financial rows harder to scan without adding meaning.
function SPCabinSuppLine({ ln }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: WF.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ln.name}</span>
        {ln.qty > 1 && (
          <span style={{
            padding: '4px 4px', borderRadius: 4, background: WF.fill,
            border: `1px solid ${WF.line}`, color: WF.inkSoft,
            fontSize: 12, fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0,
          }}>×{ln.qty}</span>
        )}
      </div>
      <span style={{
        fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, color: ln.amount > 0 ? WF.inkSoft : WF.inkFaint,
      }}>{ln.amount > 0 ? money(ln.amount) : '—'}</span>
    </div>
  );
}

// One room-level receipt. Identity and subtotal lead so rooms can be compared
// without opening them; fare, supplements and mandatory fees then explain that
// total in the same order as the booking-level receipt. The per-guest fare split
// remains one click away for the exception case where a guest asks how berths
// were allocated.
function SPCabinRoomCard({ rm, p }) {
  const [open, setOpen] = React.useState(false);
  const amountStyle = {
    fontSize: 12, fontWeight: 700, color: WF.ink,
    fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
  };

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 9, overflow: 'hidden', background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,.06)' }}>
      <div style={{
        padding: 12, background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ minWidth: 0, fontSize: 14, lineHeight: '20px', fontWeight: 700, color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rm.label}</span>
          <span style={{
            padding: '4px 8px', borderRadius: 999, background: WF.panel,
            border: `1px solid ${WF.line}`, color: WF.inkSoft,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
          }}>{rm.occupants} guest{rm.occupants === 1 ? '' : 's'}</span>
        </div>
        {rm.cat && <div style={{ fontSize: 12, fontWeight: 500, color: WF.inkSoft, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rm.cat}</div>}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
          marginTop: 8, paddingTop: 8, borderTop: `1px solid ${WF.line}`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: WF.inkLabel }}>Room total</span>
          <span style={{ ...amountStyle, fontSize: 16, lineHeight: '24px' }}>{money(rm.subtotal)}</span>
        </div>
      </div>
      <div>
        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>Cabin fare</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>Allocated across {rm.occupants} guest{rm.occupants === 1 ? '' : 's'}</div>
            </div>
            <span style={amountStyle}>{money(rm.fare)}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            marginTop: 8, paddingTop: 8, borderTop: `1px solid ${WF.lineSoft}`,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>Room selection delta</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>Flat charge for room #{rm.label.replace('Room #', '')}</div>
            </div>
            <span style={amountStyle}>+{money(rm.roomDelta)}</span>
          </div>
          {rm.people.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                marginTop: 8, padding: '8px 8px', borderRadius: 6,
                border: `1px solid ${open ? WF.accentLine : WF.line}`,
                background: open ? WF.accentTint : WF.fill, color: WF.accentInk,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{open ? 'Hide guest fare split' : 'View guest fare split'}</span>
              <span aria-hidden="true" style={{ fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }}>▼</span>
            </button>
          )}
          {open && rm.people.length > 0 && (
            <div style={{ marginTop: 8, padding: '4px 8px', borderRadius: 6, background: WF.fill, border: `1px solid ${WF.line}` }}>
              {rm.people.map((pax, index) => (
                <div key={pax.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderTop: index === 0 ? 'none' : `1px solid ${WF.lineSoft}` }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12, color: WF.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pax.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>{pax.type} · {pax.berthLabel}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{money(pax.fare)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '8px 12px', borderTop: `1px solid ${WF.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: rm.lines.length > 0 ? 4 : 0 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>Supplements</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>{rm.lines.length > 0 ? `${rm.lines.length} selected item${rm.lines.length === 1 ? '' : 's'}` : 'No supplements assigned'}</div>
            </div>
            <span style={amountStyle}>{money(rm.suppTotal)}</span>
          </div>
          {rm.lines.length > 0 ? (
            rm.lines.map((ln) => <SPCabinSuppLine key={ln.id} ln={ln} />)
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '8px 12px', borderTop: `1px solid ${WF.line}` }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>Taxes and port fees</div>
            <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>Room share of {money(p.gratuities)}</div>
          </div>
          <span style={amountStyle}>{money(rm.taxes)}</span>
        </div>
      </div>
    </div>
  );
}

// The Cabin-wise pill's body: one card per assigned stateroom.
function SPCabinDetails({ b, p }) {
  const { rooms, unassigned } = spCabinBreakdown(b, p);

  if (rooms.length === 0) {
    return (
      <div style={{ fontSize: 12, color: WF.inkFaint, fontStyle: 'italic', padding: '4px 0' }}>
        No staterooms assigned yet — pick rooms on Sailing, fare &amp; cabin.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rooms.map((rm) => <SPCabinRoomCard key={rm.key} rm={rm} p={p} />)}

      {unassigned && (
        <div style={{ border: `1px dashed ${WF.line}`, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: WF.inkSoft, marginBottom: 4 }}>
            Unassigned guests <span style={{ fontWeight: 500, color: WF.inkFaint }}>· {unassigned.count}</span>
          </div>
          {unassigned.lines.map((ln) => <SPCabinSuppLine key={ln.id} ln={ln} />)}
        </div>
      )}
    </div>
  );
}

function BookingSummaryPanel({
  booking, update, step,
  continueEnabled, ctaLabel, onContinue, onBlocked,
  showFlowNavigation = true,
  notice,
}) {
  const b = booking || {};
  const [showSupps, setShowSupps] = React.useState(false);
  // Which lens the "Your selection" section shows: the whole-booking rows, or
  // the per-stateroom breakdown. Local state — a view toggle, not booking data.
  const [selectionView, setSelectionView] = React.useState('Global Details');

  const p = computeBookingPricing(b);
  // Use the same normalized guest selector as pricing. This keeps the visible
  // party mix and the fare multiplier on one source of truth, including while
  // the agent is changing counts on the Farecode & Guest Count tab.
  const g = typeof bookingGuestCounts === 'function'
    ? bookingGuestCounts(b)
    : { adults: 0, youngAdults: 0, children: 0, infants: 0, ...(b.guests || {}) };
  const guestStr = p.guestCount > 0
    ? `${g.adults || 0}A · ${g.youngAdults || 0}YA · ${g.children || 0}C · ${g.infants || 0}I`
    : SP_DASH;
  // The stateroom matrix persists every confirmed room in `cabins`; the legacy
  // selectedCabinNum field only stores the first room for base-fare
  // compatibility. Build the visible summary from the complete cabin record so
  // a multi-room booking never looks like a single-room booking in the rail.
  const selectedRoomNums = [...new Set((b.cabins || []).map((cabin) => cabin && cabin.num).filter(Boolean))];
  const roomStr = selectedRoomNums.length > 0
    ? selectedRoomNums.map((num) => `#${num}`).join(', ')
    : b.selectedCabinNum
      ? `#${b.selectedCabinNum}${b.selectedCabinDeck ? ` · Deck ${b.selectedCabinDeck}` : ''}`
      : b.assignmentMethod === 'auto' ? 'Auto-assign' : '';
  const roomLabel = selectedRoomNums.length > 1 ? 'Rooms' : 'Room';
  const SelectedSailingRailSummary = window.SelectedSailingRailSummary;

  // Shown on the collapsed heading so the section still says something useful.
  const selectionSummary = [
    p.cabin && p.cabin.name,
    p.fc && p.fc.code,
    p.guestCount > 0 && `${p.guestCount} ${p.guestCount === 1 ? 'guest' : 'guests'}`,
  ].filter(Boolean).join(' · ') || 'Nothing selected yet';

  const set = (changes) => update && update(changes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>

        {/* ── Selection — every row always present ──
            Collapsed by default on Review & confirm: by then the selection is
            settled and the agent is talking about price, so the money should be
            the first thing in the rail. `key` on the step makes each step apply
            its own default instead of inheriting the previous step's toggle.
            Booking source is shown as the first trip row so the acquisition
            context remains visible throughout the flow. ── */}
        <SPSection
          key={`selection-${step}`}
          title="Your selection"
          tint
          collapsible
          defaultCollapsed={step === 3}
          summary={selectionSummary}>

          {/* View toggle — whole-booking rows vs per-stateroom breakdown. */}
          <div style={{ marginBottom: 12 }}>
            <SPSegmented
              options={['Global Details', 'Cabin-wise Details']}
              value={selectionView}
              onChange={setSelectionView} />
          </div>

          {p.sailing && SelectedSailingRailSummary && (
            <div style={{ marginBottom: 16 }}>
              <SelectedSailingRailSummary sailing={p.sailing} />
            </div>
          )}

          {selectionView === 'Cabin-wise Details' ? (
            <SPCabinDetails b={b} p={p} />
          ) : (
            <SPBookingSnapshot
              b={b}
              p={p}
              guestStr={guestStr}
              roomLabel={roomLabel}
              roomStr={roomStr}
              showSupps={showSupps}
              setShowSupps={setShowSupps} />
          )}
        </SPSection>

        {/* ── Price breakdown ── */}
        <SPSection title="Price">
          {p.status === 'empty' ? (
            <div style={{ fontSize: 12, color: WF.inkFaint, fontStyle: 'italic' }}>
              Select a sailing and cabin to see pricing.
            </div>
          ) : (
            <SPPriceSummary b={b} p={p} />
          )}
          {selectionView === 'Global Details' && (
            <SPPromotionControl b={b} p={p} set={set} showOffers={step === 3} />
          )}
        </SPSection>

        {/* ── Trip protection, hold policy, payment terms ──
            These only apply at checkout, so they only show on Review & confirm —
            surfacing them earlier let an agent set a hold policy before there
            was even a cabin to hold. ── */}
        {step === 3 && (
          <>
            {/* ── Trip protection ── */}
            <SPSection title="Trip protection">
              <div
                onClick={() => set({ protection: !b.protection })}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                  padding: '8px 12px', border: `1px solid ${WF.line}`, borderRadius: 8, cursor: 'pointer', background: '#fff',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>Add trip protection</div>
                  <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>Medical &amp; cancellation · ${PROTECTION_PP}/guest</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: b.protection ? WF.ink : WF.inkFaint, fontFamily: 'ui-monospace, monospace' }}>
                    {b.protection ? `+${money(p.protectionTotal)}` : '—'}
                  </div>
                  <div style={{
                    width: 38, height: 22, borderRadius: 11, background: b.protection ? WF.accentOn : '#CBD5E1',
                    border: `1px solid ${b.protection ? WF.accentOn : WF.controlLine}`,
                    boxSizing: 'border-box',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute',
                      top: 3, left: b.protection ? 19 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                    }} />
                  </div>
                </div>
              </div>
            </SPSection>

            {/* The deposit rate comes from the farecode (EARLY-IS is 20%, not 25%),
                so the pill can't hardcode a number — the real rate is stated in the
                totals card below. */}
            <SPSection title="Payment terms">
              <SPPills
                options={['Pay Full Balance', 'Deposit Only']}
                value={b.paymentMode}
                onChange={(m) => set({ paymentMode: m })} />
            </SPSection>
          </>
        )}

        {notice}

        {/* ── Totals — Amount due now leads, as one figure, because it's the
            number that decides what the agent has to collect today; Booking
            total and Remaining follow underneath as a label/value list read
            top to bottom. Tinted, not navy: the same #EFF6FF treatment the
            Review & confirm totals use, so the one pattern reads the same in
            both places — and a light card at 2/3 the mass stops the rail
            ending in a black slab that outweighed the content above it.
            Every muted string is WF.inkSoft (~5.7:1 on this tint), never
            inkFaint (~2:1, under WCAG AA). ── */}
        <div style={{ padding: '12px 16px' }}>
          {p.status === 'empty' ? (
            <div style={{ fontSize: 12, color: WF.inkFaint, fontStyle: 'italic' }}>
              Total appears once a sailing and cabin are chosen.
            </div>
          ) : (
            <SPAmountDueCard p={p} />
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      {showFlowNavigation && (
        <div style={{
          padding: '12px 16px 16px', borderTop: `1px solid ${WF.line}`,
          display: 'flex', flexDirection: 'column', gap: 8, background: WF.panel, flexShrink: 0,
        }}>
          <button
            onClick={() => (continueEnabled ? onContinue && onContinue() : onBlocked && onBlocked())}
            title={continueEnabled ? undefined : 'Complete this step to continue'}
            style={{
              width: '100%', padding: '12px 16px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 8,
              background: continueEnabled ? WF.accent : WF.fillStrong,
              color: continueEnabled ? '#fff' : WF.inkFaint,
              cursor: continueEnabled ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}>{ctaLabel}</button>
        </div>
      )}
    </div>
  );
}

window.BookingSummaryPanel = BookingSummaryPanel;
