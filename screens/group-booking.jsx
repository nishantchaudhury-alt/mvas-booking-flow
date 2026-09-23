// Group reservation entry + workspace.
//
// The group is a durable parent reservation, not another booking type. Agents
// create it with a master contact and sailing, then use the normal booking flow
// to add fares, cabins and guests while the group workspace remains the long-
// lived operational home.

const groupInputStyle = {
  width: '100%', height: 36, padding: '0 12px', borderRadius: 7,
  border: `1px solid ${WF.controlLine}`, background: WF.panel,
  color: WF.ink, fontFamily: 'inherit', fontSize: 14, outline: 'none',
};

function GroupField({ label, required, labelMeta, hint, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, ...style }}>
      {(label || required || labelMeta) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 14 }}>
          <span style={{ fontSize: 12, color: WF.inkSoft, fontWeight: 600 }}>
            {label}{required && <span style={{ color: '#B91C1C' }}> *</span>}
          </span>
          {labelMeta && (
            <span style={{ fontSize: 12, color: WF.inkFaint, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {labelMeta}
            </span>
          )}
        </div>
      )}
      {children}
      {hint && <span style={{ fontSize: 12, color: WF.inkFaint }}>{hint}</span>}
    </div>
  );
}

function ReservationScopeSection({ state, onUpdate }) {
  const scope = state.reservationScope || 'individual';
  const groupCreated = !!state.groupId;
  const editingCreatedGroup = groupCreated && state.surface === 'group-setup';

  if (groupCreated && !editingCreatedGroup) {
    const sailing = getSailing(state.groupSailingCode || state.selectedSailingCode);
    return (
      <div style={{
        padding: '12px 12px',
        background: WF.accentTint, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div aria-hidden="true" style={{
          width: 30, height: 30, borderRadius: 7, display: 'grid', placeItems: 'center',
          background: WF.accent, color: WF.accentText, fontWeight: 700, fontSize: 14,
        }}>G</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, lineHeight: '16px', color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Group reservation
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: WF.ink, fontWeight: 700 }}>{state.groupName}</span>
            <span style={{ color: WF.inkFaint }}>·</span>
            <span className="s4-money" style={{ fontSize: 12, color: WF.inkSoft }}>{state.groupId}</span>
            {sailing && <><span style={{ color: WF.inkFaint }}>·</span><span style={{ fontSize: 12, color: WF.inkSoft }}>{sailing.ship} · {sailing.depart}</span></>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ surface: 'group-workspace' })}
          style={{
            minHeight: 32, padding: '8px 12px', borderRadius: 7,
            border: `1px solid ${WF.accent}`, background: WF.panel,
            color: WF.accent, fontFamily: 'inherit', fontSize: 12,
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
          Group workspace
        </button>
      </div>
    );
  }

  const changeScope = (next) => {
    if (next === scope) return;
    onUpdate({
      reservationScope: next,
      surface: 'booking',
      step: 1,
      ...(next === 'group' && !groupCreated ? {
        groupCruiseId: '',
      } : {}),
      // The saved group remains a Group reservations record; changing scope
      // detaches this active draft so the standalone flow carries no hidden
      // group identity or parent context.
      ...(next === 'individual' && groupCreated ? {
        groupId: null,
        groupName: '',
        groupStatus: null,
        groupCreatedAt: null,
        groupContactName: '',
        groupContactCustomerId: null,
        groupContactEmail: '',
        groupContactPhone: '',
        groupContactCity: '',
        groupContactState: '',
        groupContactCountry: '',
        groupContactAddress: '',
        groupContactZip: '',
        groupContactWalletId: '',
        groupContactWalletBalance: null,
        groupRemarks: '',
        groupCruiseId: '',
        groupSailingCode: null,
        groupBookingCount: 0,
        groupBookings: [],
      } : {}),
      selectedSailingCode: null,
      cabinId: null,
      farecodeId: null,
      cabins: [],
      selectedCabinNum: null,
      selectedCabinDeck: null,
      selectedCabinStratum: null,
      selectedSupps: {},
      suppAssignments: {},
      guests: { adults: 0, youngAdults: 0, children: 0, infants: 0 },
      guestAges: { adults: [], youngAdults: [], children: [], infants: [] },
      guestData: {},
      primaryGuestCode: null,
      primaryGuestConfigured: false,
    });
  };

  const options = [
    { id: 'individual', label: 'Individual booking' },
    { id: 'group', label: 'Group reservation' },
  ];
  const bookingModes = ['Normal', 'Future', 'Channel Partner Booking'];
  const bookingMode = state.bookingType || 'Normal';
  const compactControlLabelStyle = {
    fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
    color: WF.inkLabel, textTransform: 'uppercase', whiteSpace: 'nowrap',
  };
  const compactSegmentedStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    width: 'fit-content', maxWidth: '100%', padding: 4, borderRadius: 8,
    border: `1px solid ${WF.line}`, background: WF.fill,
  };
  const compactSegmentStyle = (selected) => ({
    minHeight: 28, padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${selected ? WF.accent : 'transparent'}`,
    background: selected ? WF.accent : 'transparent',
    color: selected ? WF.accentText : WF.inkSoft,
    boxShadow: selected ? '0 1px 2px rgba(15,23,42,.12)' : 'none',
    fontFamily: 'inherit', fontSize: 12, fontWeight: selected ? 700 : 600,
    lineHeight: '16px', whiteSpace: 'nowrap',
    transition: 'background .14s ease, color .14s ease, border-color .14s ease',
  });

  return (
    <div style={{ padding: '12px 12px', background: WF.panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div id="reservation-scope-label" style={{
          ...compactControlLabelStyle, flex: '0 0 auto',
        }}>
          Booking type
        </div>
        <div
          role="tablist"
          aria-labelledby="reservation-scope-label"
          style={{
            ...compactSegmentedStyle,
          }}>
          {options.map((option) => {
            const selected = scope === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => changeScope(option.id)}
                style={{
                  ...compactSegmentStyle(selected), minWidth: 108,
                }}>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {scope === 'individual' && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div role="radiogroup" aria-label="Booking mode" style={compactSegmentedStyle}>
            {bookingModes.map((mode) => {
              const selected = bookingMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onUpdate({ bookingType: mode })}
                  style={compactSegmentStyle(selected)}>
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {editingCreatedGroup && (
        <div style={{ flexBasis: '100%', color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>
          Switching to Individual booking starts a clean standalone draft. {state.groupName} remains available under Group reservations.
        </div>
      )}
    </div>
  );
}

function GroupMasterContactSearch({ state, onUpdate, onChoose }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const results = searchGuestDirectory(query, 5);

  const chooseContact = (person) => {
    onUpdate({
      groupContactName: directoryFullName(person),
      groupContactCustomerId: person.id,
      groupContactEmail: person.email,
      groupContactPhone: person.phone,
      groupContactCity: person.city || '',
      groupContactState: person.state || '',
      groupContactCountry: person.country || '',
      groupContactAddress: person.address || '',
      groupContactZip: person.zip || '',
      groupContactWalletId: person.walletId || '',
      groupContactWalletBalance: Number.isFinite(person.walletBalance) ? person.walletBalance : null,
    });
    setQuery('');
    setOpen(false);
    if (onChoose) onChoose(person);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: WF.inkSoft, fontWeight: 600 }}>Search existing customer</div>
        <div style={{ fontSize: 12, color: WF.inkFaint }}>Optional</div>
      </div>
      <div style={{ ...groupInputStyle, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: WF.inkFaint }}>
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          aria-label="Search existing customer"
          role="combobox"
          aria-expanded={open && query.trim().length >= 2}
          aria-controls="group-master-contact-results"
          aria-autocomplete="list"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone or customer ID"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: WF.ink, fontFamily: 'inherit', fontSize: 14 }}
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id="group-master-contact-results"
          role="listbox"
          aria-label="Existing customer matches"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 30,
            background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 8,
            boxShadow: '0 8px 24px rgba(15,23,42,.14)', overflow: 'hidden',
          }}>
          {results.length > 0 ? results.map((person) => (
            <button
              key={person.id}
              type="button"
              role="option"
              aria-selected={state.groupContactCustomerId === person.id}
              onMouseDown={(e) => { e.preventDefault(); chooseContact(person); }}
              style={{
                width: '100%', padding: '8px 12px', border: 'none', borderBottom: `1px solid ${WF.lineSoft}`,
                background: state.groupContactCustomerId === person.id ? WF.accentTint : WF.panel,
                color: WF.ink, fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
              }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{directoryFullName(person)}</span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: WF.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.email} · {person.phone}</span>
              </span>
              <span className="s4-money" style={{ fontSize: 12, color: WF.inkLabel }}>{person.id}</span>
            </button>
          )) : (
            <div style={{ padding: '12px', color: WF.inkSoft, fontSize: 12 }}>No existing customer found.</div>
          )}
          <div style={{ padding: '8px 12px', background: WF.fill, color: WF.inkFaint, fontSize: 12 }}>
            No match? Use the manual contact option below.
          </div>
        </div>
      )}

      {state.groupContactCustomerId ? (
        <div style={{ marginTop: 8, padding: '8px 8px', borderRadius: 6, border: `1px solid ${WF.accentLine}`, background: WF.accentTint, color: WF.inkSoft, fontSize: 12 }}>
          <strong style={{ color: WF.ink }}>{state.groupContactName}</strong> · {state.groupContactCustomerId} selected. Customer master details are linked to this group.
        </div>
      ) : (
        <div style={{ marginTop: 4, minHeight: 13, fontSize: 12, color: WF.inkFaint }}>
          Select an existing customer, or add the group coordinator manually below.
        </div>
      )}
    </div>
  );
}

function GroupSelectControl({ label, value, disabled, onChange, children }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{
          ...groupInputStyle,
          boxSizing: 'border-box', paddingRight: 40,
          appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? WF.inkFaint : WF.ink,
          background: disabled ? WF.fill : WF.panel,
        }}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: disabled ? WF.inkFaint : WF.inkSoft,
        }}>
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function GroupSetupCard({ number, title, help, optional, children }) {
  return (
    <section style={{
      background: WF.panel,
      borderTop: number === '1' ? 'none' : `1px solid ${WF.line}`,
    }}>
      <div style={{
        minHeight: 52, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 12,
        background: WF.panel, borderBottom: `1px solid ${WF.lineSoft}`,
      }}>
        <div aria-hidden="true" style={{
          flex: '0 0 auto', width: 24, height: 24, borderRadius: 7,
          display: 'grid', placeItems: 'center', background: WF.accent,
          color: WF.accentText, fontSize: 12, fontWeight: 700,
        }}>{number}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: WF.ink, fontSize: 12, lineHeight: '16px', fontWeight: 700 }}>{title}</div>
          <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>{help}</div>
        </div>
        {optional && (
          <span style={{
            flex: '0 0 auto', padding: '4px 8px', borderRadius: 99,
            border: `1px solid ${WF.line}`, background: WF.panel,
            color: WF.inkLabel, fontSize: 12, fontWeight: 600,
          }}>Optional</span>
        )}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </section>
  );
}

function GroupCruiseSelectors({ state, onUpdate }) {
  const inferredCruise = getGroupCruiseForSailing(state.selectedSailingCode || state.groupSailingCode);
  const cruiseId = state.groupCruiseId || (inferredCruise && inferredCruise.id) || '';
  const sailings = getGroupCruiseSailings(cruiseId);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <GroupField label="Select cruise" required>
          <GroupSelectControl
            label="Select cruise"
            value={cruiseId}
            onChange={(e) => onUpdate({ groupCruiseId: e.target.value, selectedSailingCode: null })}>
            <option value="">Select a cruise</option>
            {GROUP_CRUISES.map((cruise) => (
              <option key={cruise.id} value={cruise.id}>{cruise.label}</option>
            ))}
          </GroupSelectControl>
        </GroupField>
        <GroupField
          label="Select sailing date"
          required
          labelMeta={cruiseId ? `${sailings.length} sailing ${sailings.length === 1 ? 'date' : 'dates'} available` : null}
          hint={!cruiseId ? 'Select a cruise to see available dates.' : null}>
          <GroupSelectControl
            label="Select sailing date"
            value={state.selectedSailingCode || ''}
            disabled={!cruiseId}
            onChange={(e) => onUpdate({ selectedSailingCode: e.target.value || null })}>
            <option value="">Select a sailing date</option>
            {sailings.map((sailing) => (
              <option key={sailing.code} value={sailing.code}>
                {sailing.depart} — {sailing.ship} · {mvasHomePortName(sailing.homePort)}
              </option>
            ))}
          </GroupSelectControl>
        </GroupField>
      </div>
    </div>
  );
}

function GroupSetupFields({ state, onUpdate, embedded = false }) {
  const editingCreatedGroup = !!state.groupId && state.surface === 'group-setup';
  const [manualContactOpen, setManualContactOpen] = React.useState(false);
  const updateManualContact = (changes) => onUpdate({
    ...changes,
    groupContactCustomerId: null,
    groupContactWalletId: '',
    groupContactWalletBalance: null,
  });
  if ((state.reservationScope || 'individual') !== 'group' || (state.groupId && !editingCreatedGroup)) return null;
  return (
    <div data-testid={embedded ? 'group-setup-sections' : 'group-setup-container'} style={{
      marginBottom: embedded ? 0 : 12, background: WF.panel,
      border: embedded ? 'none' : `1px solid ${WF.line}`,
      borderTop: embedded ? `1px solid ${WF.line}` : undefined,
      borderRadius: embedded ? 0 : 9, overflow: 'hidden',
      boxShadow: embedded ? 'none' : '0 1px 2px rgba(15,23,42,.05)',
    }}>
      <GroupSetupCard
        number="1"
        title={editingCreatedGroup ? 'Edit group identity' : 'Group identity'}
        help="Give this parent reservation a recognizable name.">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 420px) 1fr', gap: 16, alignItems: 'end' }}>
          <GroupField label="Group name" required>
            <input
              aria-label="Group name"
              value={state.groupName || ''}
              onChange={(e) => onUpdate({ groupName: e.target.value })}
              placeholder="e.g. Patel Family Celebration"
              style={groupInputStyle}
            />
          </GroupField>
          {editingCreatedGroup && (
            <div style={{ minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <WFBadge kind="draft">Existing group</WFBadge>
            </div>
          )}
        </div>
      </GroupSetupCard>

      <GroupSetupCard
        number="2"
        title="Cruise & sailing"
        help="Choose the cruise, then select the departure this group will use.">
        <GroupCruiseSelectors state={state} onUpdate={onUpdate} />
      </GroupSetupCard>

      <GroupSetupCard
        number="3"
        title="Primary contact"
        help="Link an existing customer or enter the group coordinator manually.">
        <GroupMasterContactSearch
          state={state}
          onUpdate={onUpdate}
          onChoose={() => setManualContactOpen(false)} />

        <button
          type="button"
          aria-expanded={manualContactOpen}
          aria-controls="group-manual-contact-fields"
          onClick={() => setManualContactOpen((open) => !open)}
          style={{
            width: '100%', minHeight: 38, padding: '8px 12px', borderRadius: 7,
            border: `1px solid ${WF.line}`, background: manualContactOpen ? WF.accentTint : WF.fill,
            color: WF.ink, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
          <span style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>Add contact manually</span>
            <span style={{ display: 'block', marginTop: 4, color: WF.inkSoft, fontSize: 12, fontWeight: 500 }}>Use when the customer is not in the directory.</span>
          </span>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flex: '0 0 auto', color: WF.inkSoft, transform: manualContactOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}>
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {manualContactOpen && (
          <div id="group-manual-contact-fields" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${WF.lineSoft}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              <GroupField label="Master contact" required>
                <input
                  aria-label="Master contact"
                  value={state.groupContactName || ''}
                  onChange={(e) => updateManualContact({ groupContactName: e.target.value })}
                  placeholder="Enter the contact name"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="Contact email">
                <input
                  aria-label="Contact email"
                  type="email"
                  value={state.groupContactEmail || ''}
                  onChange={(e) => updateManualContact({ groupContactEmail: e.target.value })}
                  placeholder="name@example.com"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="Contact phone">
                <input
                  aria-label="Contact phone"
                  value={state.groupContactPhone || ''}
                  onChange={(e) => updateManualContact({ groupContactPhone: e.target.value })}
                  placeholder="(555) 000-0000"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="Street address" style={{ gridColumn: 'span 2' }}>
                <input
                  aria-label="Street address"
                  value={state.groupContactAddress || ''}
                  onChange={(e) => updateManualContact({ groupContactAddress: e.target.value })}
                  placeholder="Street address"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="City">
                <input
                  aria-label="City"
                  value={state.groupContactCity || ''}
                  onChange={(e) => updateManualContact({ groupContactCity: e.target.value })}
                  placeholder="City"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="State / province">
                <input
                  aria-label="State or province"
                  value={state.groupContactState || ''}
                  onChange={(e) => updateManualContact({ groupContactState: e.target.value })}
                  placeholder="State or province"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="Country">
                <input
                  aria-label="Country"
                  value={state.groupContactCountry || ''}
                  onChange={(e) => updateManualContact({ groupContactCountry: e.target.value })}
                  placeholder="Country"
                  style={groupInputStyle}
                />
              </GroupField>
              <GroupField label="ZIP / postal code">
                <input
                  aria-label="ZIP or postal code"
                  value={state.groupContactZip || ''}
                  onChange={(e) => updateManualContact({ groupContactZip: e.target.value })}
                  placeholder="ZIP or postal code"
                  style={groupInputStyle}
                />
              </GroupField>
            </div>
          </div>
        )}
      </GroupSetupCard>

      <GroupSetupCard
        number="4"
        title="Internal notes"
        help="Capture accessibility, celebration, or partner context for the team."
        optional>
        <GroupField>
          <input
            aria-label="Group remarks"
            value={state.groupRemarks || ''}
            onChange={(e) => onUpdate({ groupRemarks: e.target.value })}
            placeholder="Celebration, accessibility, partner notes…"
            style={groupInputStyle}
          />
        </GroupField>
      </GroupSetupCard>
    </div>
  );
}

function GroupSetupProgress() {
  const items = [
    { n: 1, label: 'Group setup', state: 'current' },
    { n: 2, label: 'Build group booking', state: 'pending' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', background: WF.panel,
      border: `1px solid ${WF.line}`, borderRadius: 8, padding: '8px 8px', marginBottom: 20,
    }}>
      {items.map((item, index) => (
        <React.Fragment key={item.n}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: item.state === 'current' ? WF.fill : 'transparent' }}>
            <div style={{
              width: 18, height: 18, borderRadius: 9, display: 'grid', placeItems: 'center',
              background: item.state === 'current' ? WF.accent : WF.fillStrong,
              color: item.state === 'current' ? WF.accentText : WF.inkSoft,
              boxShadow: item.state === 'current' ? `0 0 0 3px ${WF.accentLine}` : 'none',
              fontSize: 12, fontWeight: 700,
            }}>{item.n}</div>
            <span style={{ fontSize: 12, color: item.state === 'current' ? WF.ink : WF.inkFaint, fontWeight: item.state === 'current' ? 600 : 500 }}>{item.label}</span>
          </div>
          {index < items.length - 1 && <div style={{ flex: 1, height: 1, background: WF.line, minWidth: 8 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function GroupSetupSummaryRail({ booking }) {
  const sailing = getSailing(booking.selectedSailingCode);
  const cruise = getGroupCruise(booking.groupCruiseId) || getGroupCruiseForSailing(booking.selectedSailingCode);
  const rows = [
    ['Scope', 'Group reservation'],
    ['Group name', booking.groupName || '—'],
    ['Master contact', booking.groupContactName || '—'],
    ...(booking.groupContactCustomerId ? [['Customer ID', booking.groupContactCustomerId]] : []),
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${WF.line}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>Group setup</div>
        <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>A workspace is created before cabins and guests.</div>
      </div>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${WF.line}` }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: `1px solid ${WF.lineSoft}` }}>
            <span style={{ fontSize: 12, color: WF.inkLabel }}>{label}</span>
            <span style={{ fontSize: 12, color: WF.ink, fontWeight: 600, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: WF.inkLabel, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cruise &amp; sailing</div>
        {cruise && (
          <div style={{ marginTop: 8, color: WF.ink, fontSize: 12, fontWeight: 700 }}>{cruise.label}</div>
        )}
        {sailing ? (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 8, border: `1px solid ${WF.accentLine}`, background: WF.accentTint }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{sailing.depart}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: WF.inkSoft }}>{sailing.ship} · {mvasHomePortName(sailing.homePort)}</div>
            <div className="s4-money" style={{ marginTop: 4, fontSize: 12, color: WF.inkLabel }}>{sailing.code}</div>
          </div>
        ) : (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 8, border: `1px dashed ${WF.controlLine}`, color: WF.inkFaint, fontSize: 12 }}>
            Select a cruise and sailing date.
          </div>
        )}
      </div>
    </div>
  );
}

function GroupContextBar({ booking, update }) {
  if (!booking.groupId) return null;
  const sailing = getSailing(booking.groupSailingCode || booking.selectedSailingCode);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', marginBottom: 16,
      background: WF.accentTint, border: `1px solid ${WF.accentLine}`, borderRadius: 8,
    }}>
      <div aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', background: WF.accent, color: WF.accentText, fontWeight: 700 }}>G</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Building group reservation</div>
        <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: WF.ink }}>{booking.groupName}</span>
          <span style={{ color: WF.inkFaint }}>·</span>
          <span className="s4-money" style={{ fontSize: 12, color: WF.inkSoft }}>{booking.groupId}</span>
          {sailing && <><span style={{ color: WF.inkFaint }}>·</span><span style={{ fontSize: 12, color: WF.inkSoft }}>{sailing.ship} · {sailing.depart}</span></>}
        </div>
      </div>
      <button type="button" onClick={() => update({ surface: 'group-workspace' })} style={{
        minHeight: 31, padding: '8px 12px', borderRadius: 7, border: `1px solid ${WF.accent}`,
        background: WF.panel, color: WF.accent, fontFamily: 'inherit', fontSize: 12,
        fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>Group workspace</button>
    </div>
  );
}

function GroupInfoItem({ label, value, meta, mono, style }) {
  return (
    <div style={{ minWidth: 0, ...style }}>
      <div style={{ fontSize: 12, color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.ink, fontWeight: 700, fontFamily: mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit', overflowWrap: 'anywhere' }}>{value || '—'}</div>
      {meta && <div style={{ marginTop: 4, fontSize: 12, lineHeight: '16px', color: WF.inkFaint }}>{meta}</div>}
    </div>
  );
}

function WorkspacePanel({ title, action, children, style }) {
  return (
    <section style={{ background: WF.panel, border: `1px solid ${WF.line}`, borderRadius: 9, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,.05)', ...style }}>
      <div style={{ minHeight: 44, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${WF.lineSoft}`, background: WF.panel }}>
        <h2 style={{ margin: 0, fontSize: 12, color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function getGroupBookingRows(booking) {
  const storedRows = Array.isArray(booking.groupBookings) ? booking.groupBookings : [];
  if (storedRows.length) return storedRows;

  // Older persisted demos only kept a count and the most recently completed
  // booking. Lift that booking into the collection the first time the updated
  // workspace is used so an existing confirmed row is not lost.
  const q = computeBookingPricing(booking);
  if (!(booking.groupBookingCount > 0) || q.status === 'empty') return [];
  return [{
    bookingId: booking.bookingId,
    cabins: Math.max((booking.cabins || []).length, Number(booking.selectedRoomCount) || 0, 1),
    guests: bookingGuestCount(booking),
    totalBeforeDiscount: q.total - q.couponDisc,
    totalAfterDiscount: q.total,
    pendingAmount: q.remaining,
    status: 'Confirmed',
  }];
}

function GroupOverview({ booking, update, onStart }) {
  // Existing customers open with their master record visible. Agents can
  // collapse it when they need more workspace, but critical profile data is
  // never hidden by default.
  const [showFullContact, setShowFullContact] = React.useState(true);
  const sailing = getSailing(booking.groupSailingCode || booking.selectedSailingCode);
  const cruise = getGroupCruise(booking.groupCruiseId) || getGroupCruiseForSailing(booking.groupSailingCode || booking.selectedSailingCode);
  const groupBookingRows = getGroupBookingRows(booking);
  const groupBookingTotal = Math.max(groupBookingRows.length, booking.groupBookingCount || 0);
  const hasGroupFinancials = groupBookingRows.length > 0;
  const bookingTotalBeforeDiscount = groupBookingRows.reduce((sum, row) => sum + (Number(row.totalBeforeDiscount) || 0), 0);
  const bookingTotalAfterDiscount = groupBookingRows.reduce((sum, row) => sum + (Number(row.totalAfterDiscount) || 0), 0);
  const groupPendingAmount = groupBookingRows.reduce((sum, row) => sum + (Number(row.pendingAmount) || 0), 0);
  const contactName = booking.groupContactName || 'No contact selected';
  const contactInitials = contactName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const usefulContactValue = (value) => value != null && String(value).trim() && String(value).trim().toUpperCase() !== 'N/A';
  const contactLocation = [booking.groupContactCity, booking.groupContactState, booking.groupContactCountry]
    .filter(usefulContactValue).join(', ');
  const hasWalletBalance = Number.isFinite(booking.groupContactWalletBalance);
  const fullCustomerFields = [
    ['City', booking.groupContactCity],
    ['State', booking.groupContactState],
    ['Country', booking.groupContactCountry],
    ['Address', booking.groupContactAddress],
    ['ZIP code', booking.groupContactZip],
    ['Wallet ID', booking.groupContactWalletId],
  ].filter(([, value]) => usefulContactValue(value));
  const bookingStarted = !!(booking.cabinId || booking.farecodeId || Object.keys(booking.guestData || {}).length);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, .75fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'contents' }}>
          <WorkspacePanel title="Group details" action={<button type="button" onClick={() => update({ surface: 'group-setup', step: 1, selectedSailingCode: booking.groupSailingCode || booking.selectedSailingCode })} style={{ minHeight: 30, padding: '4px 8px', border: `1px solid ${WF.line}`, borderRadius: 6, background: WF.panel, color: WF.accent, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit details</button>}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 20, alignItems: 'start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, lineHeight: '24px', color: WF.ink, fontWeight: 700, letterSpacing: '-0.01em' }}>{booking.groupName}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <WFBadge kind={booking.groupStatus === 'Active' ? 'active' : 'draft'}>{booking.groupStatus || 'Draft'}</WFBadge>
                    <span style={{ padding: '4px 8px', borderRadius: 5, background: WF.fill, border: `1px solid ${WF.lineSoft}`, color: WF.inkSoft, fontSize: 12, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontWeight: 600 }}>{booking.groupId}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: booking.groupContactCustomerId ? 'repeat(2, minmax(120px, auto))' : 'minmax(150px, auto)', gap: 20, paddingLeft: 20, borderLeft: `1px solid ${WF.lineSoft}` }}>
                  <GroupInfoItem label="Created" value={booking.groupCreatedAt || '—'} />
                  {booking.groupContactCustomerId && <GroupInfoItem label="Group customer ID" value={booking.groupContactCustomerId} mono />}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 16, border: `1px solid ${WF.accentLine}`, borderRadius: 8, background: WF.accentTint }}>
                <div style={{ fontSize: 12, color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cruise &amp; sailing</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) repeat(3, minmax(86px, .7fr))', gap: 0, marginTop: 12 }}>
                  <div style={{ minWidth: 0, paddingRight: 16 }}>
                    <GroupInfoItem label="Sailing type" value={(cruise && cruise.label) || 'No cruise selected'} />
                  </div>
                  <div style={{ minWidth: 0, padding: '0 16px', borderLeft: `1px solid ${WF.accentLine}` }}>
                    <GroupInfoItem label="Cruise name" value={sailing && sailing.ship} />
                  </div>
                  <div style={{ minWidth: 0, padding: '0 16px', borderLeft: `1px solid ${WF.accentLine}` }}>
                    <GroupInfoItem label="Sailing date" value={sailing && sailing.depart} />
                  </div>
                  <div style={{ minWidth: 0, paddingLeft: 16, borderLeft: `1px solid ${WF.accentLine}` }}>
                    <GroupInfoItem label="Sailing code" value={sailing && sailing.code} mono />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: booking.groupRemarks ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)', gap: 12, marginTop: 12 }}>
                <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.line}`, borderRadius: 7, background: WF.panel }}>
                  <GroupInfoItem label="Booking total" value={String(groupBookingTotal)} />
                </div>
                {booking.groupRemarks && (
                  <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.line}`, borderRadius: 7, background: WF.panel }}>
                    <GroupInfoItem label="Remarks" value={booking.groupRemarks} />
                  </div>
                )}
              </div>

              {hasGroupFinancials && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${WF.lineSoft}` }}>
                  <GroupInfoItem label="Bookings — total amount" value={money(bookingTotalBeforeDiscount)} mono />
                  <GroupInfoItem label="Total after discount" value={money(bookingTotalAfterDiscount)} mono />
                  <GroupInfoItem label="Pending amount" value={money(groupPendingAmount)} mono />
                </div>
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            title="Bookings"
            action={groupBookingTotal > 0 ? (
              <button type="button" onClick={onStart} style={{ minHeight: 30, padding: '4px 12px', border: 'none', borderRadius: 6, background: WF.accent, color: WF.accentText, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Add booking
              </button>
            ) : null}
            style={{ gridColumn: '1 / -1', gridRow: 2 }}>
            {groupBookingRows.length > 0 ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr .8fr .8fr .8fr .65fr', padding: '8px 12px', background: WF.fill, color: WF.inkLabel, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: `1px solid ${WF.line}` }}>
                  <span>Booking ID</span><span>Cabins</span><span>Guests</span><span>Value</span><span>Status</span>
                </div>
                {groupBookingRows.map((row, index) => (
                  <div key={`${row.bookingId}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr .8fr .8fr .8fr .65fr', padding: '12px 12px', alignItems: 'center', color: WF.inkSoft, fontSize: 12, borderTop: index ? `1px solid ${WF.lineSoft}` : 'none' }}>
                    <span className="s4-money" style={{ color: WF.ink, fontWeight: 700 }}>{row.bookingId}</span>
                    <span>{row.cabins}</span>
                    <span>{row.guests}</span>
                    <span className="s4-money">{money(row.totalAfterDiscount)}</span>
                    <WFBadge kind="active">{row.status || 'Confirmed'}</WFBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '28px 20px 28px', textAlign: 'center' }}>
                <div aria-hidden="true" style={{ width: 38, height: 38, margin: '0 auto 12px', borderRadius: 9, display: 'grid', placeItems: 'center', background: WF.fill, border: `1px solid ${WF.line}`, color: WF.inkSoft, fontSize: 20 }}>▦</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: WF.ink }}>No bookings in this group yet</div>
                <div style={{ maxWidth: 420, margin: '4px auto 12px', color: WF.inkSoft, fontSize: 12, lineHeight: '16px' }}>
                  Start the group booking to choose fares, reserve cabins and add the guest roster.
                </div>
                <button type="button" onClick={onStart} style={{ minHeight: 36, padding: '8px 12px', border: 'none', borderRadius: 7, background: WF.accent, color: WF.accentText, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {bookingStarted ? 'Continue booking' : 'Add booking'}
                </button>
              </div>
            )}
          </WorkspacePanel>
        </div>

        <div style={{ display: 'contents' }}>
          <WorkspacePanel
            title="Primary contact"
            style={{ gridColumn: 2, gridRow: 1 }}
            action={
              <span style={{ padding: '4px 8px', border: `1px solid ${WF.line}`, borderRadius: 99, background: WF.fill, color: WF.inkSoft, fontSize: 12, fontWeight: 600 }}>
                {booking.groupContactCustomerId ? 'Customer profile' : 'Manual entry'}
              </span>
            }>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div aria-hidden="true" style={{ flex: '0 0 auto', width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: WF.accentTint, border: `1px solid ${WF.accentLine}`, color: WF.accent, fontSize: 12, fontWeight: 700 }}>{contactInitials || '—'}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: WF.ink, fontWeight: 700 }}>{contactName}</div>
                  <div style={{ marginTop: 4, color: WF.inkSoft, fontSize: 12 }}>Primary group coordinator</div>
                  {booking.groupContactCustomerId && <div style={{ marginTop: 4, color: WF.inkLabel, fontSize: 12, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontWeight: 600 }}>{booking.groupContactCustomerId}</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${WF.lineSoft}` }}>
                <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.lineSoft}`, borderRadius: 7, background: WF.fill }}>
                  <GroupInfoItem label="Email" value={booking.groupContactEmail || 'Not provided'} />
                </div>
                <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.lineSoft}`, borderRadius: 7, background: WF.fill }}>
                  <GroupInfoItem label="Phone" value={booking.groupContactPhone || 'Not provided'} />
                </div>
              </div>
              {booking.groupContactCustomerId && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${WF.lineSoft}` }}>
                  {(contactLocation || hasWalletBalance) && (
                    <div style={{ display: 'grid', gridTemplateColumns: contactLocation && hasWalletBalance ? 'minmax(0, 1.35fr) minmax(110px, .65fr)' : '1fr', gap: 8 }}>
                      {contactLocation && (
                        <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.lineSoft}`, borderRadius: 7, background: WF.fill }}>
                          <GroupInfoItem label="Location" value={contactLocation} />
                        </div>
                      )}
                      {hasWalletBalance && (
                        <div style={{ minWidth: 0, padding: 12, border: `1px solid ${WF.accentLine}`, borderRadius: 7, background: WF.accentTint }}>
                          <GroupInfoItem label="Wallet balance" value={money(booking.groupContactWalletBalance)} mono />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    aria-expanded={showFullContact}
                    onClick={() => setShowFullContact((open) => !open)}
                    style={{ width: '100%', minHeight: 32, marginTop: 8, padding: '8px 8px', border: `1px solid ${WF.line}`, borderRadius: 6, background: WF.panel, color: WF.accent, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {showFullContact ? 'Hide customer details' : 'Show customer details'}
                  </button>

                  {showFullContact && (
                    <div style={{ marginTop: 12, padding: 12, border: `1px solid ${WF.lineSoft}`, borderRadius: 7, background: WF.fill }}>
                      <div style={{ fontSize: 12, color: WF.inkLabel, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Customer master details</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 16px', marginTop: 12 }}>
                        {fullCustomerFields.map(([label, value]) => <GroupInfoItem key={label} label={label} value={value} mono={label === 'Wallet ID'} />)}
                        {hasWalletBalance && <GroupInfoItem label="Current wallet balance" value={money(booking.groupContactWalletBalance)} mono />}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </div>
  );
}

function GroupWorkspaceApp({ booking, update }) {
  const startBooking = () => {
    const completedBookings = getGroupBookingRows(booking);
    update({
      groupBookings: completedBookings,
      groupBookingCount: Math.max(completedBookings.length, booking.groupBookingCount || 0),
      bookingId: `DRAFT-${9087 + completedBookings.length}`,
      surface: 'booking',
      step: 1,
      selectedSailingCode: booking.groupSailingCode || booking.selectedSailingCode,
      // A group owns its sailing already. Standalone-search facets left in the
      // persisted draft must not filter that locked sailing out of the booking
      // detail screen or leak contradictory trip criteria into the summary.
      inventorySearch: '',
      selectedDestinations: [],
      selectedPorts: [],
      selectedHomePorts: [],
      selectedDuration: [],
      selectedMonth: { months: [], year: null },
      cabinId: null,
      farecodeId: null,
      deckPreference: 'upper',
      assignmentMethod: 'manual',
      selectedCabinNum: null,
      selectedCabinDeck: null,
      selectedCabinStratum: null,
      selectedRoomCount: null,
      cabins: [],
      selectedPackages: [],
      selectedSupps: {},
      suppAssignments: {},
      guests: { adults: 0, youngAdults: 0, children: 0, infants: 0 },
      guestAges: { adults: [], youngAdults: [], children: [], infants: [] },
      guestData: {},
      primaryGuestCode: null,
      primaryGuestConfigured: false,
      appliedCoupon: 'None',
      customCode: '',
      protection: false,
      holdDur: '48h',
      paymentMode: 'Deposit Only',
    });
  };
  const backToGroupSetup = () => update({
    surface: 'group-setup',
    step: 1,
    selectedSailingCode: booking.groupSailingCode || booking.selectedSailingCode,
  });

  return (
    <WFAppShell
      activeGroup="bookings"
      active="group-reservations"
      breadcrumb={['CRM', 'Bookings', 'Group reservations', booking.groupName]}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <button
          type="button"
          onClick={backToGroupSetup}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 34,
            marginBottom: 12, padding: '8px 12px', border: `1px solid ${WF.line}`,
            borderRadius: 7, background: WF.panel, boxShadow: '0 1px 2px rgba(15,23,42,.05)',
            color: WF.inkSoft, fontFamily: 'inherit', fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
          }}>
          <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>←</span>
          Back to group setup
        </button>

        <GroupOverview booking={booking} update={update} onStart={startBooking} />
      </div>
    </WFAppShell>
  );
}

Object.assign(window, {
  ReservationScopeSection,
  GroupSetupFields,
  GroupSetupProgress,
  GroupSetupSummaryRail,
  GroupContextBar,
  GroupWorkspaceApp,
});
