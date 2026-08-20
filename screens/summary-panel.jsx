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
// guest: each room's fare (rate × its occupants), the supplements charged to
// it — cabin-level ones once per room, guest-level ones for the guests
// allocated to that room, package-covered ones at $0 — and its occupancy
// share of the flat taxes & fees figure. Guest→cabin allocation comes from
// the same buildCabinGuestMap Step 1's assignment flow uses, so this view
// can't disagree with the screens that wrote the data.
function spCabinBreakdown(b, p) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const cabins = b.cabins || [];
  if (cabins.length === 0) return { rooms: [], unassigned: null };

  const SUPP = (typeof S2_SUPP !== 'undefined' && S2_SUPP) || [];
  const suppById = (id) => SUPP.find((s) => s.id === id) || null;
  const pkgSuppIds = new Set();
  (p.pkgs || []).forEach((pk) => (pk.includedSupps || []).forEach((id) => pkgSuppIds.add(id)));
  const guestToCabin = buildCabinGuestMap(b.guests, cabins);
  const assign = b.suppAssignments || {};

  // A package bills per person, so each room carries pkgPP × its occupants —
  // summed across rooms that is exactly computeBookingPricing's packageTotal,
  // so the room subtotals keep re-adding to the booking total.
  const pkgDefs = (p.pkgs || []).map((pk) => ({
    id: pk.id,
    name: pk.name,
    emoji: pk.emoji || '📦',
    pp: (pk.includedSupps || []).reduce((t, id) => t + (suppById(id)?.pricePP || 0), 0),
  }));

  // Supplement + package lines for one set of assignment keys (a room's cabin
  // key + its guest keys, or the unassigned guests' keys). `headCount` is how
  // many travellers the group holds — what a per-person package bills against.
  const linesFor = (keys, headCount) => {
    const lines = [];
    let total = 0;
    Object.entries(assign).forEach(([suppId, byKey]) => {
      const su = suppById(suppId);
      if (!su || !byKey) return;
      const inPkg = pkgSuppIds.has(suppId);
      let guestQty = 0;
      let cabinHit = false;
      Object.entries(byKey).forEach(([k, v]) => {
        if (!(v > 0) || !keys.has(k)) return;
        if (isCabinSuppKey(k)) cabinHit = true; else guestQty += v;
      });
      if (cabinHit) {
        const amount = inPkg ? 0 : su.pricePP;
        total += amount;
        lines.push({ id: `${suppId}:cabin`, name: su.name, emoji: su.emoji, qty: 1, amount, scope: 'cabin', inPkg });
      }
      if (guestQty > 0) {
        const amount = inPkg ? 0 : su.pricePP * guestQty;
        total += amount;
        lines.push({ id: `${suppId}:guest`, name: su.name, emoji: su.emoji, qty: guestQty, amount, scope: 'guest', inPkg });
      }
    });
    if (headCount > 0) {
      pkgDefs.forEach((pk) => {
        const amount = r2(pk.pp * headCount);
        total += amount;
        lines.push({ id: `pkg:${pk.id}`, name: `${pk.name} package`, emoji: pk.emoji, qty: headCount, amount, scope: 'pkg', inPkg: false });
      });
    }
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
    const { lines, total: suppTotal } = linesFor(keys, occupants);
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
  const un = unKeys.size > 0 ? linesFor(unKeys, unKeys.size) : null;
  const unassigned = un && un.lines.length > 0
    ? { count: unKeys.size, lines: un.lines, suppTotal: un.total }
    : null;

  return { rooms, unassigned };
}

// One supplement line inside a cabin card. Guest-level is the default read;
// cabin-level, package-bundle and package-covered lines carry a small tag
// saying why their number is shaped the way it is (once per room / per
// person for the whole room / $0).
function SPCabinSuppLine({ ln }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 11, padding: '2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        <span>{ln.emoji}</span>
        <span style={{ color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ln.name}{(ln.scope === 'guest' || ln.scope === 'pkg') && ln.qty > 1 ? ` ×${ln.qty}` : ''}
        </span>
        {ln.scope === 'cabin' && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: 0.3, color: WF.accentInk,
            background: WF.accentTint, borderRadius: 3, padding: '1px 4px', flexShrink: 0,
          }}>CABIN</span>
        )}
        {ln.scope === 'pkg' && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: 0.3, color: '#6D28D9',
            background: '#F5F3FF', borderRadius: 3, padding: '1px 4px', flexShrink: 0,
          }}>PKG</span>
        )}
        {ln.inPkg && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: 0.3, color: '#6D28D9',
            background: '#F5F3FF', borderRadius: 3, padding: '1px 4px', flexShrink: 0,
          }}>IN PKG</span>
        )}
      </div>
      <span style={{
        fontFamily: 'ui-monospace, monospace', fontWeight: 600, flexShrink: 0,
        color: ln.amount > 0 ? SP_ACCENT : WF.inkFaint,
      }}>{ln.amount > 0 ? `+${money(ln.amount)}` : '—'}</span>
    </div>
  );
}

// One stateroom card. The per-guest fare split sits behind its own accordion
// — collapsed by default — rather than always showing: an agent scanning
// several rooms for the subtotal shouldn't have to scroll past every room's
// full guest list first, but the split is one click away when a guest asks
// "why is my share different from theirs".
function SPCabinRoomCard({ rm, p }) {
  const [open, setOpen] = React.useState(false);
  const rowStyle = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '2.5px 0' };
  const labelStyle = { fontSize: 11.5, color: WF.inkSoft, minWidth: 0 };
  const valStyle = { fontSize: 11.5, fontWeight: 600, color: WF.ink, fontFamily: 'ui-monospace, monospace', flexShrink: 0 };

  return (
    <div style={{ border: `1px solid ${WF.line}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        padding: '6px 10px', background: WF.fill, borderBottom: `1px solid ${WF.line}`,
      }}>
        {/* flex/minWidth/ellipsis: a category name ("Interior Stateroom") is
            long enough on the rail's narrower width that it can now compete
            with the guest-count column for space where the old two-letter
            code never did. */}
        <div style={{ fontSize: 11, fontWeight: 700, color: WF.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {rm.label}
          {rm.cat && <span style={{ fontWeight: 500, color: WF.inkFaint }}> · {rm.cat}</span>}
        </div>
        <div style={{ fontSize: 10.5, color: WF.inkSoft, flexShrink: 0 }}>
          {rm.occupants} guest{rm.occupants === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ padding: '7px 10px' }}>
        {/* Cabin fare doubles as the accordion trigger for who's paying what
            share of it. The row used to caption itself "{cabinFarePP} pp ×
            {occupants}"; a flat rate is exactly what the per-guest split
            contradicts (berths 3+ and children price lower), so that caption
            is gone — the split behind this toggle is the real breakdown, and
            it re-adds to the amount shown here whether expanded or not. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          disabled={rm.people.length === 0}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            width: '100%', padding: '2.5px 0', background: 'none', border: 'none',
            cursor: rm.people.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {rm.people.length > 0 && (
              <span style={{
                fontSize: 8, color: WF.inkFaint, flexShrink: 0,
                transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s',
              }}>▶</span>
            )}
            <div style={{ ...labelStyle, fontWeight: 700, color: WF.ink }}>Cabin fare</div>
            {rm.people.length > 0 && !open && (
              <span style={{ fontSize: 10, color: WF.inkFaint }}>· per-guest split</span>
            )}
          </div>
          <span style={valStyle}>{money(rm.fare)}</span>
        </button>
        {open && rm.people.length > 0 && (
          <div style={{ marginTop: 3, marginBottom: 2, paddingLeft: 16, borderLeft: `2px solid ${WF.line}` }}>
            {rm.people.map((pax) => (
              <div key={pax.key} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '2px 0' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: WF.inkSoft, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pax.name}
                  </div>
                  <div style={{ fontSize: 9.5, color: WF.inkFaint, marginTop: 0.5 }}>
                    {pax.type} · {pax.berthLabel}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, color: WF.inkFaint,
                  fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>{money(pax.fare)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ margin: '5px 0', paddingTop: 5, borderTop: `1px dashed ${WF.line}` }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 3 }}>
            Supplements
          </div>
          {rm.lines.length > 0 ? (
            rm.lines.map((ln) => <SPCabinSuppLine key={ln.id} ln={ln} />)
          ) : (
            <div style={{ fontSize: 11, color: WF.inkFaint }}>None</div>
          )}
        </div>

        <div style={{ ...rowStyle, paddingTop: 5, borderTop: `1px dashed ${WF.line}` }}>
          <div style={labelStyle}>
            Taxes &amp; fees
            <div style={{ fontSize: 10, color: WF.inkFaint, marginTop: 1 }}>share of {money(p.gratuities)}</div>
          </div>
          <span style={valStyle}>{money(rm.taxes)}</span>
        </div>

        <div style={{ ...rowStyle, marginTop: 4, paddingTop: 6, borderTop: `1px solid ${WF.line}` }}>
          <div style={{ ...labelStyle, fontWeight: 700, color: WF.ink }}>Room subtotal</div>
          <span style={{ ...valStyle, fontSize: 12, fontWeight: 700 }}>{money(rm.subtotal)}</span>
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
  pkgPreviewId, onConfirmPkg, onClearPkg,
  notice,
}) {
  const b = booking || {};
  const [showHoldMenu, setShowHoldMenu] = React.useState(false);
  const [showSupps, setShowSupps] = React.useState(false);
  // Which lens the "Your selection" section shows: the whole-booking rows, or
  // the per-stateroom breakdown. Local state — a view toggle, not booking data.
  const [selectionView, setSelectionView] = React.useState('Global Details');

  const p = computeBookingPricing(b);
  // Package preview prices the *same* booking with the package applied, so the
  // before/after on every row comes from one function rather than a parallel
  // calculation that could drift from the real one.
  const previewPkg = pkgPreviewId ? (S2_PKG || []).find((x) => x.id === pkgPreviewId) : null;
  const pv = previewPkg ? computeBookingPricing({ ...b, selectedPackages: [pkgPreviewId] }) : null;

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
  const monthStr = b.selectedMonth && b.selectedMonth.month
    ? `${b.selectedMonth.month} ${b.selectedMonth.year || ''}`.trim() : '';
  const intentEmoji = { Relaxation: '🏖️', Adventure: '⛺', Anniversary: '💑', Family: '🎁' }[b.selectedIntent] || '✈️';
  const pkgNames = (p.pkgs || []).map((x) => x.name).join(', ');
  const roomStr = b.selectedCabinNum
    ? `#${b.selectedCabinNum}${b.selectedCabinDeck ? ` · Deck ${b.selectedCabinDeck}` : ''}`
    : b.assignmentMethod === 'auto' ? 'Auto-assign' : '';

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
            Trip intent used to be its own full-width section — a lot of visual
            weight for one pill — so it's folded in here as the first row. ── */}
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
          <>
          <SPGroup label="Trip" first>
            <SPRow
              label="Intent"
              value={b.selectedIntent ? `${intentEmoji} ${b.selectedIntent}` : SP_DASH}
              dim={!b.selectedIntent} />
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
              dim={!p.cabin} mono={!!p.cabin} />
            <SPRow label="Room" value={roomStr || SP_DASH} dim={!roomStr} />
            <SPRow
              label="Assignment"
              value={b.cabinId ? (b.assignmentMethod === 'auto' ? 'Auto-assign' : 'Manual select') : SP_DASH}
              dim={!b.cabinId} />
          </SPGroup>

          <SPGroup label="Fare & extras">
          <SPRow label="Farecode" value={p.fc ? p.fc.code : SP_DASH} dim={!p.fc} mono />

          {/* Supplements — expandable line list */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '3px 0' }}>
            <div style={{ fontSize: 12, color: WF.inkSoft }}>Supplements</div>
            {p.suppLines.length > 0 ? (
              <button onClick={() => setShowSupps((v) => !v)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                padding: 0, cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
                fontSize: 12, fontWeight: 700, color: SP_ACCENT,
              }}>
                {p.suppLines.length} · {p.suppTotal > 0 ? `+${money(p.suppTotal)}` : 'included'}
                <span style={{ fontSize: 9, transform: showSupps ? 'rotate(180deg)' : 'none', transition: 'transform 0.12s' }}>▾</span>
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
                  <span style={{
                    fontFamily: 'ui-monospace, monospace', fontWeight: 600, flexShrink: 0,
                    color: ln.amount > 0 ? SP_ACCENT : WF.inkFaint,
                  }}>{ln.amount > 0 ? `+${money(ln.amount)}` : '—'}</span>
                </div>
              ))}
            </div>
          )}
          </SPGroup>
          </>
          )}
        </SPSection>

        {/* ── Price breakdown ── */}
        <SPSection title="Price">
          {p.status === 'empty' ? (
            <div style={{ fontSize: 12, color: WF.inkFaint, fontStyle: 'italic' }}>
              Select a sailing and cabin to see pricing.
            </div>
          ) : (
            <>
              {/* Fare — what the voyage itself costs. */}
              <SPGroup label="Fare" first>
                <SPPriceRow
                  label="Cabin fare"
                  sub={p.guestCount > 0 ? `${money(p.cabinFarePP)} pp × ${p.guestCount}` : null}
                  amount={p.cabinFareTotal}
                  preview={pv?.cabinFareTotal} />
                <SPPriceRow label="Gratuities" amount={p.gratuities} preview={pv?.gratuities} />
              </SPGroup>

              {/* Add-ons — what the agent chose to put on top. */}
              <SPGroup label="Add-ons">
                <SPPriceRow label="Supplements" amount={p.suppTotal} preview={pv?.suppTotal} accent={p.suppTotal > 0 ? SP_ACCENT : null} />
                <SPPriceRow label="Trip protection" amount={p.protectionTotal} preview={pv?.protectionTotal} />
              </SPGroup>

              {p.couponDisc !== 0 && (
                <SPGroup label="Discounts">
                  <SPPriceRow label={`Coupon · ${b.appliedCoupon}`} amount={p.couponDisc} preview={pv?.couponDisc} accent="#059669" />
                </SPGroup>
              )}
            </>
          )}
        </SPSection>

        {/* ── Package preview: inline delta + commit controls ── */}
        {previewPkg && pv && (
          <SPSection title={`${previewPkg.name} package`}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 11px', borderRadius: 8, background: '#EEF2FF', border: '1px solid #C7D2FE', marginBottom: 9,
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#3730A3' }}>Price change</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#3730A3', fontFamily: 'ui-monospace, monospace' }}>
                {pv.total - p.total >= 0 ? '+' : '−'}{money(Math.abs(pv.total - p.total))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {(previewPkg.items || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: 6, fontSize: 11, color: WF.inkSoft }}>
                  <span style={{ color: SP_ACCENT, fontWeight: 700 }}>✓</span>{item}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onConfirmPkg && onConfirmPkg(pkgPreviewId)} style={{
                flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 700, border: 'none',
                borderRadius: 7, background: WF.accent, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}>Add package</button>
              <button onClick={() => onClearPkg && onClearPkg()} style={{
                padding: '8px 12px', fontSize: 12, fontWeight: 600, border: `1px solid ${WF.line}`,
                borderRadius: 7, background: '#fff', color: WF.ink, cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
            </div>
          </SPSection>
        )}

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
            <div style={{ borderRadius: 10, background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '11px 13px' }}>

              {/* Primary figure */}
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.7, color: WF.accentInk, textTransform: 'uppercase', marginBottom: 3 }}>
                Amount due now
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                {pv && pv.amountDue !== p.amountDue && (
                  <>
                    <span style={{ fontSize: 12, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace', textDecoration: 'line-through' }}>
                      {money(p.amountDue)}
                    </span>
                    <span style={{ fontSize: 11, color: WF.inkSoft }}>→</span>
                  </>
                )}
                <div style={{ fontSize: 22, fontWeight: 800, color: WF.ink, fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>
                  {money(pv ? pv.amountDue : p.amountDue)}
                </div>
              </div>

              {/* Booking total + Remaining — a label/value list underneath the
                  primary figure, not a second stat competing beside it */}
              <div style={{
                marginTop: 9, paddingTop: 8, borderTop: '1px solid #DBEAFE',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: WF.inkSoft }}>
                    {p.status === 'partial' ? 'Provisional total' : 'Booking total'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    {pv && pv.total !== p.total && (
                      <>
                        <span style={{ fontSize: 11, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace', textDecoration: 'line-through' }}>
                          {money(p.total)}
                        </span>
                        <span style={{ fontSize: 10, color: WF.inkSoft }}>→</span>
                      </>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: WF.ink, fontFamily: 'ui-monospace, monospace' }}>
                      {money(pv ? pv.total : p.total)}
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: WF.inkSoft }}>Remaining</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: WF.inkSoft, fontFamily: 'ui-monospace, monospace' }}>
                    {money(pv ? pv.remaining : p.remaining)}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 10.5, color: WF.inkSoft, marginTop: 8 }}>
                {p.payFull
                  ? 'Paid in full · nothing due later'
                  : `${Math.round(p.depositRate * 100)}% deposit${p.status === 'partial' ? ' · select a fare to confirm' : ' · balance due at 45 days'}`}
              </div>
            </div>
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
