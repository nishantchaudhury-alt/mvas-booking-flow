// Step 3 · Add Guests
// Middle section kept blank for future implementation
// ───────────────────────────────────────────────────────────────────────────

// S2_CAB, S2_FC  → defined by step2-sailing.jsx (loaded before this file in unified flow)
// FLOW4          → defined by step2-common.jsx  (loaded before this file in unified flow)



// ── Guest Details Section ──
// Allows manual entry or customer lookup for each guest.
function GuestDetailsSection({ guests, guestAges, guestData, setGuestData }) {
  const [expandedGuestId, setExpandedGuestId] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [manualMode, setManualMode] = React.useState({}); // { guestId: true }
  const [manualForm, setManualForm] = React.useState({}); // { guestId: { firstName, lastName, dob, email, phone } }

  const ages = guestAges || {};
  const ageFor = (catKey, i) => {
    const raw = (ages[catKey] || [])[i];
    return raw !== undefined && raw !== null && raw !== '' && !isNaN(parseInt(raw, 10)) ? parseInt(raw, 10) : null;
  };

  const guestList = [];
  for (let i = 0; i < guests.adults; i++)
  guestList.push({ id: `A${i + 1}`, type: 'Adult', label: i === 0 ? 'Adult · primary' : 'Adult', age: ageFor('adults', i) });
  for (let i = 0; i < (guests.youngAdults || 0); i++)
  guestList.push({ id: `YA${i + 1}`, type: 'Young Adult', label: guests.adults === 0 && i === 0 ? 'Young Adult · primary' : 'Young Adult', age: ageFor('youngAdults', i) });
  for (let i = 0; i < guests.children; i++)
  guestList.push({ id: `C${i + 1}`, type: 'Child', label: 'Child', age: ageFor('children', i) });
  for (let i = 0; i < guests.infants; i++)
  guestList.push({ id: `I${i + 1}`, type: 'Infant', label: 'Infant', age: ageFor('infants', i) });

  // Drives the header's "Fill remaining/all as temp" label and whether it
  // shows at all — nothing left to do once every guest has a record.
  const unconfirmedCount = guestList.filter((g) => !guestData[g.id]).length;
  const completedCount = guestList.length - unconfirmedCount;

  const handleConfirm = (guestId, name, extra) => {
    setGuestData((prev) => ({ ...prev, [guestId]: { confirmed: true, name, ...extra } }));
    setManualMode((prev) => ({ ...prev, [guestId]: false }));
    setExpandedGuestId(null);
  };

  const handleSaveManual = (guestId) => {
    const form = manualForm[guestId] || {};
    const name = [form.firstName, form.lastName].filter(Boolean).join(' ').trim();
    handleConfirm(guestId, name || undefined, { dob: form.dob, email: form.email, phone: form.phone });
  };

  // Merges rather than replaces guestData — the label says "remaining", so a
  // guest already confirmed manually must not have their real name overwritten
  // by a temp placeholder just because this got clicked once more.
  const handleFillRemainingAsTemp = () => {
    setGuestData((prev) => {
      const next = { ...prev };
      guestList.forEach((g, i) => {
        if (!next[g.id]) next[g.id] = { name: `Temp ${g.type} ${i + 1}`, confirmed: true };
      });
      return next;
    });
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
        {/* Header — sticky, so "Fill remaining as temp" stays reachable no matter
            how far down a long guest list the agent has scrolled. Deliberately
            NOT wrapped in the row body's overflow:hidden below: any ancestor
            with overflow other than visible breaks position:sticky by giving it
            the wrong containing block to stick against. */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '12px 14px', background: '#fff',
          borderBottom: `1px solid ${WF.line}`, borderRadius: '10px 10px 0 0',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.75, color: WF.inkLabel, textTransform: 'uppercase' }}>Traveler line-up</div>
            <div style={{ marginTop: 3, fontSize: 11, color: WF.inkSoft }}>
              {guestList.length} traveler{guestList.length === 1 ? '' : 's'} · Add or review the profile attached to each guest
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 8px', borderRadius: 999,
              background: unconfirmedCount === 0 ? '#F0FDF4' : WF.fill,
              border: `1px solid ${unconfirmedCount === 0 ? '#BBF7D0' : WF.line}`,
              color: unconfirmedCount === 0 ? '#047857' : WF.inkSoft,
              fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
            }}>
              {unconfirmedCount === 0 && <span aria-hidden="true">✓</span>}
              {completedCount} of {guestList.length} ready
            </span>
            {unconfirmedCount > 0 && (
              <button
                onClick={handleFillRemainingAsTemp}
                title="Skip precise database lookups and create fast placeholder records for remaining travelers."
                style={{
                  height: 30, padding: '0 10px', borderRadius: 6,
                  background: WF.panel, border: `1px solid ${WF.line}`,
                  cursor: 'pointer', fontFamily: 'inherit', color: WF.ink,
                  fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                Fill {unconfirmedCount < guestList.length ? 'remaining' : 'all'} as temp
              </button>
            )}
          </div>
        </div>

        {/* Guest rows — the only overflow:hidden box; a sibling of the sticky
            header, not an ancestor, so it can't interfere with it. */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 8, padding: 10, background: WF.fill, borderRadius: '0 0 10px 10px',
        }}>
        {guestList.map((guest) => {
          const isExpanded = expandedGuestId === guest.id;
          const isDone = !!guestData[guest.id];
          const isManual = !!manualMode[guest.id];
          const record = guestData[guest.id] || {};
          const isTemp = isDone && /^Temp\s/i.test(record.name || '');
          const isPrimary = guest.label.toLowerCase().includes('primary');
          const ageRange = { Adult: '21+', 'Young Adult': '13–21', Child: '3–12', Infant: '0–3' }[guest.type];
          const ageLabel = guest.age != null ? `Age ${guest.age}` : `Age ${ageRange}`;
          const form = manualForm[guest.id] || { firstName: '', lastName: '', dob: '', email: '', phone: '' };

          return (
            <div key={guest.id} style={{
              gridColumn: isExpanded ? '1 / -1' : 'auto',
              border: `1px solid ${isExpanded ? WF.accent : WF.line}`,
              borderRadius: 9, overflow: 'hidden',
              background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}>
              {/* Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                alignItems: 'center', gap: 10, padding: '11px 12px',
                background: isExpanded ? WF.accentTint : '#fff',
              }}>
                {/* Badge */}
                {/* The stable guest code remains visible after completion; the
                    first eligible adult uses the navy primary treatment. */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isPrimary ? WF.accent : WF.fill,
                  color: isPrimary ? '#fff' : WF.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  border: `1px solid ${isPrimary ? WF.accent : WF.line}`,
                  flexShrink: 0, fontFamily: 'ui-monospace, monospace',
                }}>
                  {guest.id}
                </div>
                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isDone && record.name ? record.name : `${guest.type} ${guest.id.replace(/\D/g, '') || ''}`.trim()}
                    </span>
                    {isTemp && (
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 5px', borderRadius: 4, fontSize: 8.5, fontWeight: 800, flexShrink: 0 }}>TEMP</span>
                    )}
                    {isPrimary && (
                      <span style={{ background: WF.accentTint, color: WF.accent, border: `1px solid ${WF.accentLine}`, padding: '2px 5px', borderRadius: 4, fontSize: 8.5, fontWeight: 800, flexShrink: 0 }}>PRIMARY</span>
                    )}
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, color: WF.inkSoft, fontSize: 10.5 }}>
                    <span>{guest.type}</span>
                    <span aria-hidden="true" style={{ color: WF.inkFaint }}>·</span>
                    <span>{ageLabel}</span>
                    <span aria-hidden="true" style={{ color: WF.inkFaint }}>·</span>
                    <span style={{ color: isDone ? '#047857' : WF.inkFaint, fontWeight: 700 }}>
                      {isDone ? 'Ready' : 'Needs details'}
                    </span>
                  </div>
                </div>
                {/* Button */}
                <button onClick={() => {setExpandedGuestId(isExpanded ? null : guest.id);setSearchQuery('');}} style={{
                  height: 30, padding: '0 10px', fontSize: 10.5, fontWeight: 700,
                  border: `1px solid ${isExpanded || !isDone ? WF.accent : WF.line}`,
                  background: isExpanded || !isDone ? WF.accent : '#fff',
                  color: isExpanded || !isDone ? '#fff' : WF.ink,
                  borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'inherit', flexShrink: 0,
                }}>
                  {isExpanded ? 'Close' : isDone ? 'Edit details' : 'Add details'}
                </button>
              </div>

              {/* Expanded panel */}
              {isExpanded &&
              <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${WF.line}` }}>
                  <div style={{ height: 16 }} />
                  {/* Query Customer Index */}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 10 }}>Query Customer Index</div>
                  <div style={{ position: 'relative', marginBottom: 6 }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: WF.inkFaint, fontSize: 15 }}>🔍</span>
                    <input type="text" placeholder="Search by first & last name, phone, or email address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '11px 14px 11px 42px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 8, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ fontSize: 12, color: WF.inkSoft, marginBottom: 14 }}>Type at least 2 characters to search the guest database contextually.</div>

                  {/* Divider + Add manually pill */}
                  {!isManual &&
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{ flex: 1, height: 1, background: WF.lineSoft }} />
                      <button
                      onClick={() => setManualMode((prev) => ({ ...prev, [guest.id]: true }))}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${WF.line}`, background: '#fff', color: WF.inkSoft,
                        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
                      }}>
                        + Add manually
                      </button>
                      <div style={{ flex: 1, height: 1, background: WF.lineSoft }} />
                    </div>
                  }

                  {/* Manual entry form */}
                  {isManual &&
                  <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: WF.inkLabel, textTransform: 'uppercase' }}>New Guest Details</span>
                        <button onClick={() => setManualMode((prev) => ({ ...prev, [guest.id]: false }))} style={{ background: 'none', border: 'none', color: WF.inkSoft, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Use search instead
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>First name</label>
                          <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setManualForm((prev) => ({ ...prev, [guest.id]: { ...form, firstName: e.target.value } }))}
                          placeholder="e.g. Maria"
                          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Last name</label>
                          <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setManualForm((prev) => ({ ...prev, [guest.id]: { ...form, lastName: e.target.value } }))}
                          placeholder="e.g. Alvarez"
                          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Date of birth</label>
                          <input
                          type="date"
                          value={form.dob}
                          onChange={(e) => setManualForm((prev) => ({ ...prev, [guest.id]: { ...form, dob: e.target.value } }))}
                          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff', color: form.dob ? WF.ink : WF.inkFaint }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Phone number</label>
                          <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setManualForm((prev) => ({ ...prev, [guest.id]: { ...form, phone: e.target.value } }))}
                          placeholder="e.g. (555) 123-4567"
                          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Email address</label>
                        <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setManualForm((prev) => ({ ...prev, [guest.id]: { ...form, email: e.target.value } }))}
                        placeholder="e.g. maria.alvarez@email.com"
                        style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                      </div>
                      <button
                      onClick={() => handleSaveManual(guest.id)}
                      disabled={!form.firstName && !form.lastName}
                      style={{
                        width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8,
                        background: (!form.firstName && !form.lastName) ? '#CBD5E1' : '#1B2434',
                        color: (!form.firstName && !form.lastName) ? '#94A3B8' : '#fff',
                        cursor: (!form.firstName && !form.lastName) ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                      }}>
                        Save guest
                      </button>
                    </div>
                  }

                  {!isManual &&
                  <button onClick={() => handleConfirm(guest.id)} style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8, background: '#1B2434', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Confirm &amp; close
                    </button>
                  }
                </div>
              }

            </div>);

        })}
        </div>
      </div>
    </div>);

}

function StepProgress3({ current, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: WF.panel, border: `1px solid ${WF.line}`,
      borderRadius: 8, padding: '6px 8px', marginBottom: 20
    }}>
      {FLOW4.map((st, i) => {
        const state = st.n < current ? 'done' : st.n === current ? 'current' : 'pending';
        const clickable = (st.n === 1 || st.n === 2) && st.n < current;
        return (
          <React.Fragment key={st.n}>
            <button onClick={() => clickable && onBack(st.n)} style={{
              display: 'flex', alignItems: 'center', gap: 8, border: 'none',
              padding: '6px 10px', borderRadius: 6, fontFamily: 'inherit',
              background: state === 'current' ? WF.fill : 'transparent',
              cursor: clickable ? 'pointer' : 'default'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                // See step2-common.jsx — current gets the halo, done the bare fill.
                background: state === 'pending' ? WF.fillStrong : WF.accent,
                boxShadow: state === 'current' ? `0 0 0 3px ${WF.accentLine}` : 'none',
                color: state === 'pending' ? WF.inkSoft : '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{state === 'done' ? '✓' : st.n}</div>
              <div style={{
                fontSize: 12, fontWeight: state === 'current' ? 600 : 500,
                color: state === 'pending' ? WF.inkFaint : WF.ink, whiteSpace: 'nowrap'
              }}>{st.label}</div>
            </button>
            {i < FLOW4.length - 1 && <div style={{ flex: 1, height: 1, minWidth: 8, background: st.n < current ? WF.accentOn : WF.line, opacity: st.n < current ? 0.4 : 1 }} />}
          </React.Fragment>);

      })}
    </div>);

}

function Step3App({ booking, update, navigate }) {
  // Bound to the router's booking. `guestData` used to live in a second
  // useState here, and handleContinue persisted `state` without it — which is
  // why every guest name turned back into "Adult 1 / Child 2" on Step 4.
  const state = booking;
  const guestData = booking.guestData || {};
  const setGuestData = (next) =>
    update((prev) => ({
      guestData: typeof next === 'function' ? next(prev.guestData || {}) : next,
    }));

  const handleBack = () => navigate(1);
  const handleContinue = () => navigate(3);

  const sailing = getSailing(state.selectedSailingCode);
  const guestCount = bookingGuestCount(state);
  const allGuestsAssigned = guestCount > 0 && Object.keys(guestData).length >= guestCount;

  // Supplements bought but not yet attached to a specific guest or cabin.
  const unassignedSupps = Object.keys(state.selectedSupps || {}).filter((id) => {
    if (!(state.selectedSupps[id] > 0)) return false;
    const byKey = (state.suppAssignments || {})[id] || {};
    return !Object.keys(byKey).some((k) => byKey[k] > 0);
  });

  return (
    <>
      <WFAppShell
        activeGroup="bookings"
        active="create-booking"
        breadcrumb={['CRM', 'Bookings', 'Create', 'Add guests']}
        rightRail={
        <BookingSummaryPanel
          booking={state}
          update={update}
          step={2}
          continueEnabled={allGuestsAssigned}
          ctaLabel={allGuestsAssigned ? 'Continue to review →' : 'Assign all guests to continue'}
          onContinue={handleContinue}
          notice={unassignedSupps.length > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${WF.line}` }}>
              <div style={{
                padding: '9px 11px', background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 8, fontSize: 11, color: '#92400E', fontWeight: 500,
              }}>
                {unassignedSupps.length} supplement{unassignedSupps.length > 1 ? 's are' : ' is'} not yet assigned to a guest.
              </div>
            </div>
          )} />
        }
        progressBar={<StepProgress3 current={2} onBack={handleBack} />}>

        <div data-screen-label="Step 2 · Add Guests">
          <div style={{ fontWeight: 700, color: WF.ink, letterSpacing: -0.3, marginBottom: 8, fontSize: "20px" }}>
            Add guest details
          </div>

          {/* Sub-header copy */}
          <div style={{ fontSize: 13, color: WF.inkSoft, marginBottom: 20 }}>
            Search an existing profile, add new, or use a temporary guest.
          </div>

          {/* Main content area — Guest details */}
          <GuestDetailsSection guests={state.guests} guestAges={state.guestAges} guestData={guestData} setGuestData={setGuestData} />
        </div>
      </WFAppShell>


    </>);

}

window.Step3App = Step3App;
