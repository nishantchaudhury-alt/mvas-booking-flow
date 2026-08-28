// Step 3 · Add Guests
// Middle section kept blank for future implementation
// ───────────────────────────────────────────────────────────────────────────

// S2_CAB, S2_FC  → defined by step2-sailing.jsx (loaded before this file in unified flow)
// FLOW4          → defined by step2-common.jsx  (loaded before this file in unified flow)



// ── Guest Details Section ──
// Allows manual entry or customer lookup for each guest.
function GuestDetailsSection({
  guests, guestAges, guestData, setGuestData, cabinAssignments,
  protection, protectionGuestCount, onToggleProtection,
}) {
  const [expandedGuestId, setExpandedGuestId] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [manualMode, setManualMode] = React.useState({}); // { guestId: true }
  const [manualForm, setManualForm] = React.useState({}); // { guestId: { firstName, lastName, dob, email, phone } }

  // Match supplement assignment: profile work happens in a focused modal
  // instead of expanding a card and reflowing the whole cabin grid.
  React.useEffect(() => {
    if (!expandedGuestId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setExpandedGuestId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expandedGuestId]);

  const ages = guestAges || {};
  const ageFor = (catKey, i) => {
    const raw = (ages[catKey] || [])[i];
    return raw !== undefined && raw !== null && raw !== '' && !isNaN(parseInt(raw, 10)) ? parseInt(raw, 10) : null;
  };

  const guestList = [];
  for (let i = 0; i < guests.adults; i++)
  guestList.push({ id: `A${i + 1}`, guestKey: `adults-${i}`, type: 'Adult', label: i === 0 ? 'Adult · primary' : 'Adult', age: ageFor('adults', i) });
  for (let i = 0; i < (guests.youngAdults || 0); i++)
  guestList.push({ id: `YA${i + 1}`, guestKey: `youngAdults-${i}`, type: 'Young Adult', label: guests.adults === 0 && i === 0 ? 'Young Adult · primary' : 'Young Adult', age: ageFor('youngAdults', i) });
  for (let i = 0; i < guests.children; i++)
  guestList.push({ id: `C${i + 1}`, guestKey: `children-${i}`, type: 'Child', label: 'Child', age: ageFor('children', i) });
  for (let i = 0; i < guests.infants; i++)
  guestList.push({ id: `I${i + 1}`, guestKey: `infants-${i}`, type: 'Infant', label: 'Infant', age: ageFor('infants', i) });

  const cabins = Array.isArray(cabinAssignments) ? cabinAssignments : [];
  const guestToCabin = buildCabinGuestMap(guests, cabins);
  const assignedGuestKeys = new Set();
  const cabinGroups = cabins.map((cabin, index) => {
    const cabinKey = cabinSuppKey(cabin.id);
    const travelers = guestList.filter((guest) => guestToCabin[guest.guestKey] === cabinKey);
    travelers.forEach((guest) => assignedGuestKeys.add(guest.guestKey));
    return {
      key: cabinKey,
      label: `Cabin ${index + 1}`,
      room: cabin.num ? `Room ${cabin.num}` : 'Room pending',
      category: cabinCategoryName(cabin),
      travelers,
    };
  }).filter((group) => group.travelers.length > 0);

  const unassignedTravelers = guestList.filter((guest) => !assignedGuestKeys.has(guest.guestKey));
  if (unassignedTravelers.length > 0) {
    cabinGroups.push({
      key: 'unassigned',
      label: cabins.length > 0 ? 'Unassigned travelers' : 'Travelers',
      room: cabins.length > 0 ? 'Cabin not selected' : null,
      category: null,
      travelers: unassignedTravelers,
    });
  }

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

  const activeGuest = guestList.find((guest) => guest.id === expandedGuestId) || null;
  const activeGroup = activeGuest
    ? cabinGroups.find((group) => group.travelers.some((guest) => guest.id === activeGuest.id))
    : null;
  const activeRecord = activeGuest ? (guestData[activeGuest.id] || {}) : {};
  const activeIsDone = !!(activeGuest && guestData[activeGuest.id]);
  const activeIsManual = !!(activeGuest && manualMode[activeGuest.id]);
  const activeIsTemp = activeIsDone && /^Temp\s/i.test(activeRecord.name || '');
  const activeIsPrimary = !!(activeGuest && activeGuest.label.toLowerCase().includes('primary'));
  const activeAgeRange = activeGuest
    ? { Adult: '21+', 'Young Adult': '13–21', Child: '3–12', Infant: '0–3' }[activeGuest.type]
    : '';
  const activeAgeLabel = activeGuest
    ? (activeGuest.age != null ? `Age ${activeGuest.age}` : `Age ${activeAgeRange}`)
    : '';
  const activeForm = activeGuest
    ? (manualForm[activeGuest.id] || { firstName: '', lastName: '', dob: '', email: '', phone: '' })
    : { firstName: '', lastName: '', dob: '', email: '', phone: '' };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
        {/* Roster summary scrolls with the page. Cabin headers own the sticky
            context below so travelers never appear detached from their room. */}
        <div style={{
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
              {completedCount} of {guestList.length} profiles ready
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

        {/* Cabin groups keep room context visible. Travelers stack vertically
            so every profile follows one predictable scanning path. */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          padding: 10, background: WF.fill,
        }}>
        {cabinGroups.map((group) => (
          <section key={group.key} aria-label={group.room ? `${group.label}, ${group.room}` : group.label} style={{
            overflow: 'visible', border: `1px solid ${WF.line}`, borderRadius: 9, background: '#fff',
          }}>
            <div style={{
              position: 'sticky', top: 0, zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '9px 11px', borderBottom: `1px solid ${WF.line}`, background: '#fff',
              borderRadius: '9px 9px 0 0', boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.65, color: WF.inkLabel, textTransform: 'uppercase' }}>
                    {group.label}
                  </span>
                  {group.room && <span style={{ fontSize: 12, fontWeight: 800, color: WF.ink }}>{group.room}</span>}
                </div>
                {group.category && <div style={{ marginTop: 2, fontSize: 10.5, color: WF.inkSoft }}>{group.category}</div>}
              </div>
              <span style={{
                flexShrink: 0, padding: '4px 7px', borderRadius: 999,
                border: `1px solid ${WF.line}`, background: WF.panel,
                color: WF.inkSoft, fontSize: 9.5, fontWeight: 800,
              }}>
                {group.travelers.length} traveler{group.travelers.length === 1 ? '' : 's'}
              </span>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 8, padding: 8, background: WF.fill,
            }}>
        {group.travelers.map((guest) => {
          const isExpanded = expandedGuestId === guest.id;
          const isDone = !!guestData[guest.id];
          const record = guestData[guest.id] || {};
          const isTemp = isDone && /^Temp\s/i.test(record.name || '');
          const isPrimary = guest.label.toLowerCase().includes('primary');
          const ageRange = { Adult: '21+', 'Young Adult': '13–21', Child: '3–12', Infant: '0–3' }[guest.type];
          const ageLabel = guest.age != null ? `Age ${guest.age}` : `Age ${ageRange}`;

          return (
            <div key={guest.id} style={{
              border: `1px solid ${isExpanded ? WF.accent : WF.line}`,
              borderRadius: 9, overflow: 'hidden',
              background: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}>
              {/* The traveler summary is one disclosure control. The previous
                  split pattern made the card look static while a small button
                  at the far edge owned the actual interaction. */}
              <button
                type="button"
                className="traveler-card-trigger"
                aria-expanded={isExpanded}
                aria-haspopup="dialog"
                aria-controls={`traveler-profile-${guest.id}`}
                aria-label={`${isDone ? 'Review' : 'Add'} profile for ${isDone && record.name ? record.name : guest.type}`}
                onClick={() => { setExpandedGuestId(isExpanded ? null : guest.id); setSearchQuery(''); }}
                style={{
                display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                alignItems: 'center', gap: 10, width: '100%', padding: '11px 12px',
                background: isExpanded ? WF.accentTint : '#fff',
                border: 'none', color: 'inherit', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
              }}>
                {/* Badge */}
                {/* The stable guest code remains visible after completion; the
                    first eligible adult uses the navy primary treatment. */}
                <span style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isPrimary ? WF.accent : WF.fill,
                  color: isPrimary ? '#fff' : WF.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  border: `1px solid ${isPrimary ? WF.accent : WF.line}`,
                  flexShrink: 0, fontFamily: 'ui-monospace, monospace',
                }}>
                  {guest.id}
                </span>
                {/* Info */}
                <span style={{ minWidth: 0, display: 'block' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: WF.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isDone && record.name ? record.name : `${guest.type} ${guest.id.replace(/\D/g, '') || ''}`.trim()}
                    </span>
                    {isTemp && (
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 5px', borderRadius: 4, fontSize: 8.5, fontWeight: 800, flexShrink: 0 }}>TEMP</span>
                    )}
                    {isPrimary && (
                      <span style={{ background: WF.accentTint, color: WF.accent, border: `1px solid ${WF.accentLine}`, padding: '2px 5px', borderRadius: 4, fontSize: 8.5, fontWeight: 800, flexShrink: 0 }}>PRIMARY</span>
                    )}
                  </span>
                  <span style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, color: WF.inkSoft, fontSize: 10.5 }}>
                    <span>{guest.type}</span>
                    <span aria-hidden="true" style={{ color: WF.inkFaint }}>·</span>
                    <span>{ageLabel}</span>
                  </span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 7px', borderRadius: 999,
                    background: isDone ? '#F0FDF4' : '#FFF7ED',
                    border: `1px solid ${isDone ? '#BBF7D0' : '#FED7AA'}`,
                    color: isDone ? '#047857' : '#9A3412',
                    fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>
                    <span aria-hidden="true">{isDone ? '✓' : '!'}</span>
                    {isDone ? 'Profile ready' : 'Add profile'}
                  </span>
                  <span style={{
                    minWidth: isDone ? 54 : 66, height: 30, padding: '0 8px 0 10px', borderRadius: 6,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                    border: `1px solid ${isDone ? WF.accentLine : WF.line}`,
                    background: isDone ? WF.accentTint : '#FFFFFF', color: WF.accent,
                    fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>
                    {isDone ? 'Edit' : 'Add'}
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </button>

            </div>);

        })}
            </div>
          </section>
        ))}
        </div>
        <div style={{ padding: '11px 14px 13px', borderTop: `1px solid ${WF.line}`, background: '#fff', borderRadius: '0 0 10px 10px' }}>
          <GuestTripProtection
            selected={protection}
            guestCount={protectionGuestCount}
            onToggle={onToggleProtection} />
        </div>
      </div>
      {activeGuest && ReactDOM.createPortal(
        <div
          onClick={() => setExpandedGuestId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500, padding: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(1px)',
          }}>
          <div
            id={`traveler-profile-${activeGuest.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`traveler-profile-title-${activeGuest.id}`}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(760px, 100%)', maxHeight: '86vh', display: 'flex', flexDirection: 'column',
              background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 10,
              overflow: 'hidden', boxShadow: '0 24px 64px rgba(15,23,42,0.28)',
            }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px', flexShrink: 0,
              background: WF.fill, borderBottom: `1px solid ${WF.line}`,
            }}>
              <span style={{
                width: 38, height: 38, borderRadius: 8,
                background: activeIsPrimary ? WF.accent : '#FFFFFF',
                color: activeIsPrimary ? '#FFFFFF' : WF.ink,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${activeIsPrimary ? WF.accent : WF.line}`,
                fontSize: 11, fontWeight: 800, fontFamily: 'ui-monospace, monospace', flexShrink: 0,
              }}>
                {activeGuest.id}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.6, color: WF.inkLabel, textTransform: 'uppercase' }}>
                  Guest profile
                </div>
                <div id={`traveler-profile-title-${activeGuest.id}`} style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 750, color: WF.ink }}>
                    {activeIsDone && activeRecord.name
                      ? activeRecord.name
                      : `${activeGuest.type} ${activeGuest.id.replace(/\D/g, '') || ''}`.trim()}
                  </span>
                  {activeIsTemp && (
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>TEMP</span>
                  )}
                  {activeIsPrimary && (
                    <span style={{ background: WF.accentTint, color: WF.accent, border: `1px solid ${WF.accentLine}`, padding: '2px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>PRIMARY</span>
                  )}
                </div>
                <div style={{ marginTop: 3, fontSize: 10.5, color: WF.inkSoft }}>
                  {[activeGroup && activeGroup.label, activeGroup && activeGroup.room, activeGuest.type, activeAgeLabel].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 7px', borderRadius: 999,
                background: activeIsDone ? '#F0FDF4' : '#FFF7ED',
                border: `1px solid ${activeIsDone ? '#BBF7D0' : '#FED7AA'}`,
                color: activeIsDone ? '#047857' : '#9A3412',
                fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <span aria-hidden="true">{activeIsDone ? '✓' : '!'}</span>
                {activeIsDone ? 'Profile ready' : 'Profile required'}
              </span>
              <button
                type="button"
                onClick={() => setExpandedGuestId(null)}
                aria-label="Close guest profile"
                style={{
                  width: 30, height: 30, marginLeft: 2, borderRadius: 6, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${WF.line}`, background: '#FFFFFF', color: WF.inkSoft,
                  fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
                }}>×</button>
            </div>

            <div style={{ minHeight: 0, overflowY: 'auto', padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: WF.inkLabel, textTransform: 'uppercase', marginBottom: 10 }}>
                Query Customer Index
              </div>
              <div style={{ position: 'relative', marginBottom: 6 }}>
                <span aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: WF.inkFaint, fontSize: 15 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by first & last name, phone, or email address..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px 11px 42px', fontSize: 13,
                    border: `1px solid ${WF.line}`, borderRadius: 8,
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginBottom: 14 }}>
                Type at least 2 characters to search the guest database contextually.
              </div>

              {!activeIsManual && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: WF.lineSoft }} />
                  <button
                    type="button"
                    onClick={() => setManualMode((prev) => ({ ...prev, [activeGuest.id]: true }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${WF.line}`, background: '#fff', color: WF.inkSoft,
                      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}>
                    + Add manually
                  </button>
                  <div style={{ flex: 1, height: 1, background: WF.lineSoft }} />
                </div>
              )}

              {activeIsManual && (
                <div style={{ border: `1px solid ${WF.line}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, background: WF.fill }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: WF.inkLabel, textTransform: 'uppercase' }}>New Guest Details</span>
                    <button
                      type="button"
                      onClick={() => setManualMode((prev) => ({ ...prev, [activeGuest.id]: false }))}
                      style={{ background: 'none', border: 'none', color: WF.inkSoft, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Use search instead
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label htmlFor={`guest-first-name-${activeGuest.id}`} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>First name</label>
                      <input
                        id={`guest-first-name-${activeGuest.id}`}
                        type="text"
                        value={activeForm.firstName}
                        onChange={(event) => setManualForm((prev) => ({ ...prev, [activeGuest.id]: { ...activeForm, firstName: event.target.value } }))}
                        placeholder="e.g. Maria"
                        style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                    </div>
                    <div>
                      <label htmlFor={`guest-last-name-${activeGuest.id}`} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Last name</label>
                      <input
                        id={`guest-last-name-${activeGuest.id}`}
                        type="text"
                        value={activeForm.lastName}
                        onChange={(event) => setManualForm((prev) => ({ ...prev, [activeGuest.id]: { ...activeForm, lastName: event.target.value } }))}
                        placeholder="e.g. Alvarez"
                        style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label htmlFor={`guest-dob-${activeGuest.id}`} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Date of birth</label>
                      <input
                        id={`guest-dob-${activeGuest.id}`}
                        type="date"
                        value={activeForm.dob}
                        onChange={(event) => setManualForm((prev) => ({ ...prev, [activeGuest.id]: { ...activeForm, dob: event.target.value } }))}
                        style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff', color: activeForm.dob ? WF.ink : WF.inkFaint }} />
                    </div>
                    <div>
                      <label htmlFor={`guest-phone-${activeGuest.id}`} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Phone number</label>
                      <input
                        id={`guest-phone-${activeGuest.id}`}
                        type="tel"
                        value={activeForm.phone}
                        onChange={(event) => setManualForm((prev) => ({ ...prev, [activeGuest.id]: { ...activeForm, phone: event.target.value } }))}
                        placeholder="e.g. (555) 123-4567"
                        style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor={`guest-email-${activeGuest.id}`} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: WF.inkSoft, marginBottom: 5 }}>Email address</label>
                    <input
                      id={`guest-email-${activeGuest.id}`}
                      type="email"
                      value={activeForm.email}
                      onChange={(event) => setManualForm((prev) => ({ ...prev, [activeGuest.id]: { ...activeForm, email: event.target.value } }))}
                      placeholder="e.g. maria.alvarez@email.com"
                      style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${WF.line}`, borderRadius: 7, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveManual(activeGuest.id)}
                    disabled={!activeForm.firstName && !activeForm.lastName}
                    style={{
                      width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8,
                      background: (!activeForm.firstName && !activeForm.lastName) ? '#CBD5E1' : WF.accent,
                      color: (!activeForm.firstName && !activeForm.lastName) ? '#64748B' : '#fff',
                      cursor: (!activeForm.firstName && !activeForm.lastName) ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}>
                    Save guest
                  </button>
                </div>
              )}

              {!activeIsManual && (
                <button
                  type="button"
                  onClick={() => activeIsDone ? setExpandedGuestId(null) : handleConfirm(activeGuest.id)}
                  style={{
                    width: '100%', padding: '10px', fontSize: 13, fontWeight: 700,
                    border: 'none', borderRadius: 8, background: WF.accent,
                    color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  {activeIsDone ? 'Done' : 'Confirm & close'}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>);

}

function GuestTripProtection({ selected, guestCount, onToggle }) {
  const total = guestCount * PROTECTION_PP;
  const unavailable = guestCount === 0;

  return (
    <section aria-labelledby="guest-trip-protection-title">
      <div id="guest-trip-protection-title" style={{
        marginBottom: 7, fontSize: 10.5, fontWeight: 800,
        letterSpacing: 0.75, color: WF.inkLabel, textTransform: 'uppercase',
      }}>
        Trip protection
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!!selected}
        disabled={unavailable}
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: '11px 13px', borderRadius: 9,
          border: `1px solid ${selected ? WF.accentLine : WF.line}`,
          background: selected ? WF.accentTint : '#fff',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          cursor: unavailable ? 'not-allowed' : 'pointer', opacity: unavailable ? 0.55 : 1,
          fontFamily: 'inherit', textAlign: 'left',
        }}>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: WF.ink }}>
            Add trip protection
          </span>
          <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, color: WF.inkSoft }}>
            Medical and cancellation coverage · ${PROTECTION_PP} per guest
          </span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 11.5, fontWeight: 800, color: selected ? WF.ink : WF.inkSoft,
            fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums',
          }}>
            {selected ? `+${money(total)}` : 'Not added'}
          </span>
          <span aria-hidden="true" style={{
            width: 38, height: 22, borderRadius: 999,
            background: selected ? WF.accent : '#CBD5E1',
            border: `1px solid ${selected ? WF.accent : WF.controlLine}`,
            boxSizing: 'border-box',
            position: 'relative', transition: 'background 0.18s', flexShrink: 0,
          }}>
            <span style={{
              display: 'block', width: 16, height: 16, borderRadius: 999,
              background: '#fff', position: 'absolute', top: 3,
              left: selected ? 19 : 3, transition: 'left 0.18s',
              boxShadow: '0 1px 3px rgba(15,23,42,0.28)',
            }} />
          </span>
        </span>
      </button>
    </section>
  );
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
          <GuestDetailsSection
            guests={state.guests}
            guestAges={state.guestAges}
            guestData={guestData}
            setGuestData={setGuestData}
            cabinAssignments={state.cabins}
            protection={!!state.protection}
            protectionGuestCount={guestCount}
            onToggleProtection={() => update({ protection: !state.protection })} />
        </div>
      </WFAppShell>


    </>);

}

window.Step3App = Step3App;
