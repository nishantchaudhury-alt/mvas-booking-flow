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
      fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
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
                display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}>
              <span style={{
                fontSize: 9, color: WF.inkFaint, flexShrink: 0,
                transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s',
              }}>▶</span>
              {heading}
              {collapsed && summary && (
                <span style={{
                  fontSize: 11, color: WF.inkSoft, fontWeight: 500, marginLeft: 'auto',
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
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '3px 0' }}>
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

// ── Price row, with an optional before → after comparison for package preview ──
function SPPriceRow({ label, amount, preview, accent, strong, sub }) {
  const changed = preview !== undefined && preview !== null && preview !== amount;
  const fmt = spMoney;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '4px 0' }}>
      <div style={{ fontSize: 12, color: WF.inkSoft, minWidth: 0 }}>
        {label}
        {sub && <div style={{ fontSize: 10.5, color: WF.inkFaint, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexShrink: 0 }}>
        {changed && (
          <>
            <span style={{ fontSize: 11, color: WF.inkFaint, fontFamily: 'ui-monospace, monospace', textDecoration: 'line-through' }}>
              {fmt(amount)}
            </span>
            <span style={{ fontSize: 10, color: WF.inkFaint }}>→</span>
          </>
        )}
        <span style={{
          fontSize: strong ? 13 : 12,
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
      display: 'flex', gap: 2, padding: 3,
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
              flex: 1, minWidth: 0, padding: '6px 6px', fontSize: 11,
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
    <div style={{ marginTop: first ? 0 : 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
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
      fontSize: 9, fontWeight: 800, letterSpacing: 0.72,
      color: WF.inkLabel || WF.inkSoft, textTransform: 'uppercase', lineHeight: 1.2,
    }}>{children}</div>
  );
}

function SPDatum({ label, value, dim, mono, align = 'left' }) {
  return (
    <div style={{ minWidth: 0, textAlign: align }}>
      <div style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: 0.45,
        color: WF.inkFaint, textTransform: 'uppercase', lineHeight: 1.2,
      }}>{label}</div>
      <div style={{
        marginTop: 2, fontSize: 10.5, fontWeight: 700,
        color: dim ? WF.inkFaint : WF.ink, lineHeight: 1.25,
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
      }}>{value}</div>
    </div>
  );
}

function SPBookingSnapshot({
  b, p, destStr, homePortStr, guestStr, durationStr, monthStr,
  roomLabel, roomStr, showSupps, setShowSupps,
}) {
  const bookingType = b.bookingType || 'Normal';

  return (
    <>
      <SPGroup label="Trip" first>
        <SPRow label="Booking Type" value={bookingType} />
        <SPRow label="Source" value={b.source || SP_DASH} dim={!b.source} />
        <SPRow label="Destination" value={destStr || SP_DASH} dim={!destStr} />
        <SPRow label="Departing" value={homePortStr || SP_DASH} dim={!homePortStr} />
        <SPRow label="Guests" value={guestStr} dim={p.guestCount === 0} mono />
        <SPRow label="Duration" value={durationStr || SP_DASH} dim={!durationStr} />
        <SPRow label="Month" value={monthStr || SP_DASH} dim={!monthStr} />
      </SPGroup>

      <SPGroup label="Sailing">
        <SPRow
          label="Sailing"
          value={p.sailing ? `${p.sailing.region} · ${p.sailing.nights}N` : SP_DASH}
          dim={!p.sailing} />
        <SPRow label="Departs" value={p.sailing ? p.sailing.depart : SP_DASH} dim={!p.sailing} />
      </SPGroup>

      <SPGroup label="Stateroom">
        <SPRow label="Cabin" value={p.cabin ? p.cabin.name : SP_DASH} dim={!p.cabin} />
        <SPRow
          label="Cabin delta"
          value={p.cabin ? (p.cabinDeltaPP > 0 ? `+$${p.cabinDeltaPP}pp` : 'Included') : SP_DASH}
          dim={!p.cabin}
          mono={!!p.cabin} />
        <SPRow label={roomLabel} value={roomStr || SP_DASH} dim={!roomStr} />
        <SPRow
          label="Assignment"
          value={b.cabinId ? (b.assignmentMethod === 'auto' ? 'Auto-assign' : 'Manual select') : SP_DASH}
          dim={!b.cabinId} />
      </SPGroup>

      <SPGroup label="Fare & extras">
        <SPRow label="Farecode" value={p.fc ? p.fc.code : SP_DASH} dim={!p.fc} mono />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '3px 0' }}>
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
                fontSize: 9,
                transform: showSupps ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.12s',
              }}>▾</span>
            </button>
          ) : (
            <div style={{ fontSize: 12, color: WF.inkFaint }}>None</div>
          )}
        </div>

        {showSupps && p.suppLines.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {p.suppLines.map((ln) => (
              <div key={ln.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                  <span>{ln.emoji}</span>
                  <span style={{ color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ln.name}{ln.qty > 1 ? ` ×${ln.qty}` : ''}
                  </span>
                </div>
                <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
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
        <div key={group.label} style={{ padding: '9px 11px', borderTop: groupIndex === 0 ? 'none' : `1px solid ${WF.line}` }}>
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

function SPAmountDueCard({ p }) {
  const dueShare = p.total > 0 ? Math.max(0, Math.min(100, (p.amountDue / p.total) * 100)) : 0;
  const rateLabel = p.payFull ? 'Full balance' : `${Math.round(p.depositRate * 100)}% deposit`;

  return (
    <div style={{
      borderRadius: 10, background: WF.accentTint || '#EFF6FF',
      border: `1px solid ${WF.accentLine || '#DBEAFE'}`,
      padding: '11px 12px', boxShadow: '0 1px 2px rgba(15,23,42,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <SPKicker>Payment today</SPKicker>
        <span style={{
          padding: '3px 7px', borderRadius: 999, background: WF.panel,
          border: `1px solid ${WF.accentLine || '#DBEAFE'}`,
          color: WF.accentInk, fontSize: 8.5, fontWeight: 800, whiteSpace: 'nowrap',
        }}>{rateLabel}</span>
      </div>
      <div style={{ marginTop: 7, fontSize: 9.5, fontWeight: 700, color: WF.inkSoft }}>Amount due now</div>
      <div style={{
        marginTop: 2, fontSize: 23, fontWeight: 800, color: WF.ink,
        fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums',
        letterSpacing: -0.5, lineHeight: 1.05,
      }}>{money(p.amountDue)}</div>
      <div style={{ height: 4, marginTop: 10, borderRadius: 999, background: '#DCE6F3', overflow: 'hidden' }}>
        <div style={{ width: `${dueShare}%`, height: '100%', borderRadius: 999, background: WF.accentInk }} />
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        marginTop: 9, paddingTop: 9, borderTop: `1px solid ${WF.accentLine || '#DBEAFE'}`,
      }}>
        <SPDatum label={p.status === 'partial' ? 'Provisional total' : 'Booking total'} value={money(p.total)} mono />
        <SPDatum label="Remaining" value={money(p.remaining)} mono align="right" />
      </div>
      <div style={{ marginTop: 8, fontSize: 9.5, color: WF.inkSoft, lineHeight: 1.35 }}>
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
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '5px 11px', fontSize: 11, fontWeight: on ? 700 : 500,
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
      cat: cabinCategoryName(cab), occupants, fare, lines, suppTotal, taxes, people,
    };
  });

  // Per-room tax shares are rounded, so when every guest is in a room the
  // last room absorbs the rounding residue — the shares must re-add to the
  // booking's one taxes & fees figure, not drift a cent from it.
  if (rooms.length > 0 && assignedGuests === totalGuests) {
    const last = rooms[rooms.length - 1];
    last.taxes = r2(last.taxes + p.gratuities - taxAllocated);
  }
  rooms.forEach((rm) => { rm.subtotal = r2(rm.fare + rm.suppTotal + rm.taxes); });

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
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        <span style={{ fontSize: 10.5, fontWeight: 500, color: WF.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ln.name}</span>
        {ln.qty > 1 && (
          <span style={{
            padding: '1px 4px', borderRadius: 4, background: WF.fill,
            border: `1px solid ${WF.line}`, color: WF.inkSoft,
            fontSize: 8.5, fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0,
          }}>×{ln.qty}</span>
        )}
      </div>
      <span style={{
        fontSize: 10.5, fontFamily: 'ui-monospace, monospace', fontWeight: 700,
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
    fontSize: 12, fontWeight: 800, color: WF.ink,
    fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
  };

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 9, overflow: 'hidden', background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,.06)' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        padding: '9px 10px', background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: WF.ink }}>{rm.label}</span>
            <span style={{
              padding: '2px 6px', borderRadius: 999, background: WF.panel,
              border: `1px solid ${WF.line}`, color: WF.inkSoft,
              fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
            }}>{rm.occupants} guest{rm.occupants === 1 ? '' : 's'}</span>
          </div>
          {rm.cat && <div style={{ fontSize: 9.5, fontWeight: 500, color: WF.inkSoft, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rm.cat}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 0.45, color: WF.inkLabel, textTransform: 'uppercase' }}>Room total</div>
          <div style={{ ...amountStyle, fontSize: 13.5, marginTop: 2 }}>{money(rm.subtotal)}</div>
        </div>
      </div>
      <div>
        <div style={{ padding: '9px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.ink }}>Cabin fare</div>
              <div style={{ fontSize: 9.5, color: WF.inkSoft, marginTop: 2 }}>Allocated across {rm.occupants} guest{rm.occupants === 1 ? '' : 's'}</div>
            </div>
            <span style={amountStyle}>{money(rm.fare)}</span>
          </div>
          {rm.people.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                marginTop: 7, padding: '6px 8px', borderRadius: 6,
                border: `1px solid ${open ? WF.accentLine : WF.line}`,
                background: open ? WF.accentTint : WF.fill, color: WF.accentInk,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
              <span style={{ fontSize: 9.5, fontWeight: 700 }}>{open ? 'Hide guest fare split' : 'View guest fare split'}</span>
              <span aria-hidden="true" style={{ fontSize: 8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }}>▼</span>
            </button>
          )}
          {open && rm.people.length > 0 && (
            <div style={{ marginTop: 6, padding: '5px 8px', borderRadius: 6, background: WF.fill, border: `1px solid ${WF.line}` }}>
              {rm.people.map((pax, index) => (
                <div key={pax.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderTop: index === 0 ? 'none' : `1px solid ${WF.lineSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ padding: '2px 4px', borderRadius: 4, border: `1px solid ${WF.line}`, background: WF.panel, color: WF.inkSoft, fontSize: 8.5, fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{pax.code}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 10, color: WF.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pax.name}</span>
                      <span style={{ display: 'block', fontSize: 8.5, color: WF.inkSoft, marginTop: 1 }}>{pax.type} · {pax.berthLabel}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{money(pax.fare)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '9px 10px', borderTop: `1px solid ${WF.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: rm.lines.length > 0 ? 5 : 0 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.ink }}>Supplements</div>
              <div style={{ fontSize: 9.5, color: WF.inkSoft, marginTop: 2 }}>{rm.lines.length > 0 ? `${rm.lines.length} selected item${rm.lines.length === 1 ? '' : 's'}` : 'No supplements assigned'}</div>
            </div>
            <span style={amountStyle}>{money(rm.suppTotal)}</span>
          </div>
          {rm.lines.length > 0 ? (
            rm.lines.map((ln) => <SPCabinSuppLine key={ln.id} ln={ln} />)
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '9px 10px', borderTop: `1px solid ${WF.line}` }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.ink }}>Taxes and port fees</div>
            <div style={{ fontSize: 9.5, color: WF.inkSoft, marginTop: 2 }}>Room share of {money(p.gratuities)}</div>
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
      <div style={{ fontSize: 12, color: WF.inkFaint, fontStyle: 'italic', padding: '2px 0' }}>
        No staterooms assigned yet — pick rooms on Sailing, fare &amp; cabin.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rooms.map((rm) => <SPCabinRoomCard key={rm.key} rm={rm} p={p} />)}

      {unassigned && (
        <div style={{ border: `1px dashed ${WF.line}`, borderRadius: 8, padding: '7px 10px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.inkSoft, marginBottom: 3 }}>
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
  notice,
}) {
  const b = booking || {};
  const [showHoldMenu, setShowHoldMenu] = React.useState(false);
  const [showSupps, setShowSupps] = React.useState(false);
  // Which lens the "Your selection" section shows: the whole-booking rows, or
  // the per-stateroom breakdown. Local state — a view toggle, not booking data.
  const [selectionView, setSelectionView] = React.useState('Global Details');

  const p = computeBookingPricing(b);
  const g = b.guests || {};
  const guestStr = p.guestCount > 0
    ? `${g.adults || 0}A · ${g.youngAdults || 0}YA · ${g.children || 0}C · ${g.infants || 0}I`
    : SP_DASH;
  // Regions plus any port-of-call refinements, one line — the ports are part
  // of the same "where" answer, not a separate fact.
  const destStr = [
    ...(b.selectedDestinations || []),
    ...(b.selectedPorts || []).map((pid) => `⚓ ${mvasPortShort(pid)}`),
  ].join(', ');
  // Embarkation city — an independent facet from the destination above (a
  // Bahamas cruise can sail from any of the three home ports).
  const homePortStr = (b.selectedHomePorts || []).map(mvasHomePortName).join(', ');
  const durationStr = (b.selectedDuration || [])
    .map((id) => { const band = getDurationBand(id); return band ? band.short : id; })
    .join(', ');
  const selectedMonths = b.selectedMonth
    ? (Array.isArray(b.selectedMonth.months)
        ? b.selectedMonth.months
        : b.selectedMonth.month ? [b.selectedMonth.month] : [])
    : [];
  const monthStr = selectedMonths.length
    ? `${selectedMonths.join(', ')} ${b.selectedMonth.year || ''}`.trim()
    : (b.selectedMonth && b.selectedMonth.year) || '';
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

  // Shown on the collapsed heading so the section still says something useful.
  const selectionSummary = [
    p.cabin && p.cabin.name,
    p.fc && p.fc.code,
    p.guestCount > 0 && `${p.guestCount} ${p.guestCount === 1 ? 'guest' : 'guests'}`,
  ].filter(Boolean).join(' · ') || 'Nothing selected yet';

  const set = (changes) => update && update(changes);

  const discard = () => {
    if (!window.confirm('Discard this booking and start over?')) return;
    update && update({ ...BOOKING_DEFAULTS, step: 1 }, { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin' }}>

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
          <div style={{ marginBottom: 10 }}>
            <SPSegmented
              options={['Global Details', 'Cabin-wise Details']}
              value={selectionView}
              onChange={setSelectionView} />
          </div>

          {selectionView === 'Cabin-wise Details' ? (
            <SPCabinDetails b={b} p={p} />
          ) : (
            <SPBookingSnapshot
              b={b}
              p={p}
              destStr={destStr}
              homePortStr={homePortStr}
              guestStr={guestStr}
              durationStr={durationStr}
              monthStr={monthStr}
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
        </SPSection>

        {/* ── Promotions, trip protection, hold policy, payment terms ──
            These only apply at checkout, so they only show on Review & confirm —
            surfacing them earlier let an agent set a hold policy before there
            was even a cabin to hold. ── */}
        {step === 3 && (
          <>
            {/* ── Promotions ── */}
            <SPSection title="Promotions">
              <SPPills options={['None', 'SAVE10', 'EARLYBIRD']} value={b.appliedCoupon} onChange={(c) => set({ appliedCoupon: c })} />
              <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                <input
                  type="text" placeholder="Custom code…" value={b.customCode || ''}
                  onChange={(e) => set({ customCode: e.target.value.toUpperCase() })}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (b.customCode || '').trim()) set({ appliedCoupon: b.customCode.trim() }); }}
                  style={{
                    flex: 1, minWidth: 0, padding: '7px 10px', fontSize: 11, border: `1px solid ${WF.line}`,
                    borderRadius: 6, fontFamily: 'inherit', outline: 'none',
                  }} />
                <button
                  onClick={() => { if ((b.customCode || '').trim()) set({ appliedCoupon: b.customCode.trim() }); }}
                  disabled={!(b.customCode || '').trim()}
                  style={{
                    padding: '7px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6,
                    background: (b.customCode || '').trim() ? '#1B2434' : '#CBD5E1', color: '#fff',
                    cursor: (b.customCode || '').trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                  }}>Apply</button>
              </div>
              {b.appliedCoupon !== 'None' && (
                <div style={{
                  marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 11px', background: p.couponIsCustom ? '#FFFBEB' : '#F0FDF4',
                  borderRadius: 7, border: `1px solid ${p.couponIsCustom ? '#FDE68A' : '#DCFCE7'}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: p.couponIsCustom ? '#92400E' : '#059669' }}>
                    {p.couponIsCustom ? '⏳ Pending validation' : `✨ ${Math.round(p.couponPct * 100)}% off base fare`}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: p.couponIsCustom ? '#92400E' : '#059669', fontFamily: 'ui-monospace, monospace' }}>
                    {spMoney(p.couponDisc)}
                  </div>
                </div>
              )}
            </SPSection>

            {/* ── Trip protection ── */}
            <SPSection title="Trip protection">
              <div
                onClick={() => set({ protection: !b.protection })}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                  padding: '8px 11px', border: `1px solid ${WF.line}`, borderRadius: 8, cursor: 'pointer', background: '#fff',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: WF.ink }}>Add trip protection</div>
                  <div style={{ fontSize: 10.5, color: WF.inkSoft, marginTop: 1 }}>Medical &amp; cancellation · ${PROTECTION_PP}/guest</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: b.protection ? WF.ink : WF.inkFaint, fontFamily: 'ui-monospace, monospace' }}>
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
      <div style={{
        padding: '12px 16px 16px', borderTop: `1px solid ${WF.line}`,
        display: 'flex', flexDirection: 'column', gap: 8, background: WF.panel, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              onClick={() => setShowHoldMenu((v) => !v)}
              style={{
                width: '100%', padding: '8px 10px', fontSize: 12, fontWeight: 600, border: `1px solid ${WF.line}`,
                borderRadius: 7, background: '#fff', color: WF.ink, cursor: 'pointer', fontFamily: 'inherit',
              }}>Hold</button>
            {showHoldMenu && (
              <>
                <div onClick={() => setShowHoldMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 41,
                  width: 160, background: '#fff', border: `1px solid ${WF.line}`, borderRadius: 9,
                  boxShadow: '0 12px 32px rgba(15,31,61,0.16)', overflow: 'hidden',
                }}>
                  <div style={{ padding: '8px 12px 6px', fontSize: 10.5, fontWeight: 700, color: WF.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Hold for
                  </div>
                  {['24h', '48h', '72h'].map((d) => (
                    <button
                      key={d}
                      onClick={() => { set({ holdDur: d }); setShowHoldMenu(false); }}
                      style={{
                        display: 'block', width: '100%', padding: '9px 12px', border: 'none',
                        background: 'transparent', color: WF.ink, fontSize: 12.5, fontWeight: 500,
                        textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={discard} style={{
            flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 600, border: `1px solid ${WF.line}`,
            borderRadius: 7, background: '#fff', color: WF.ink, cursor: 'pointer', fontFamily: 'inherit',
          }}>Discard</button>
        </div>
        <button
          onClick={() => (continueEnabled ? onContinue && onContinue() : onBlocked && onBlocked())}
          title={continueEnabled ? undefined : 'Complete this step to continue'}
          style={{
            width: '100%', padding: '11px 14px', fontSize: 12.5, fontWeight: 700, border: 'none', borderRadius: 8,
            background: continueEnabled ? WF.accent : WF.fillStrong,
            color: continueEnabled ? '#fff' : WF.inkFaint,
            cursor: continueEnabled ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>{ctaLabel}</button>
      </div>
    </div>
  );
}

window.BookingSummaryPanel = BookingSummaryPanel;
