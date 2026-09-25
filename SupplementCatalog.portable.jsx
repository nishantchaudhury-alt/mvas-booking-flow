import React from "react";

/**
 * Portable MVAS supplement catalog.
 *
 * External dependency: React 18+
 * Styling dependency: none
 *
 * Assignment shape:
 * {
 *   [productId]: {
 *     [guestId]: quantity
 *   }
 * }
 */

const TOKENS = Object.freeze({
  ink: "#0F172A",
  inkSoft: "#475569",
  inkLabel: "#64748B",
  inkFaint: "#94A3B8",
  bg: "#F1F5F9",
  panel: "#FFFFFF",
  fill: "#F8FAFC",
  line: "#E2E8F0",
  lineSoft: "#EEF2F6",
  controlLine: "#7C8B9F",
  accent: "#1B2434",
  accentTint: "#EFF6FF",
  accentLine: "#DBEAFE",
  positive: "#047857",
  positiveBg: "#F0FDF4",
  positiveLine: "#BBF7D0",
  warning: "#92400E",
  warningBg: "#FEF3C7",
  danger: "#B91C1C",
  dangerBg: "#FEF2F2",
});

export const DEFAULT_SUPPLEMENTS = [
  { id: "aroma", emoji: "🌸", name: "Aromatherapy Package", pricePerGuest: 33.75, category: "Wellness" },
  { id: "thermal", emoji: "🔥", name: "Thermal Suite Pass", pricePerGuest: 27.5, category: "Wellness" },
  { id: "drinks", emoji: "🍹", name: "Premium Beverage Pkg", pricePerGuest: 62.5, category: "Food & Drink", minAge: 21 },
  { id: "shore", emoji: "⚓", name: "Shore Excursion Access", pricePerGuest: 45, category: "Activities" },
  { id: "wifi", emoji: "📶", name: "High-Speed Wi-Fi (4 Devices)", pricePerGuest: 23.75, category: "Connectivity" },
  { id: "dining", emoji: "🍽️", name: "Specialty Dining Pass", pricePerGuest: 40, category: "Food & Drink" },
  { id: "photo", emoji: "📸", name: "Digital Photo Package", pricePerGuest: 18.75, category: "Experiences" },
  { id: "fitness", emoji: "🏋️", name: "Master Fitness Classes", pricePerGuest: 30, category: "Wellness" },
  { id: "wine", emoji: "🍷", name: "Sommelier Reserve Tasting", pricePerGuest: 52.5, category: "Food & Drink", minAge: 21 },
  { id: "teen-adventure", emoji: "🧭", name: "Teen Adventure Bundle", pricePerGuest: 29.75, category: "Activities", minAge: 13 },
  { id: "vr-tournament", emoji: "🥽", name: "VR Arcade Tournament", pricePerGuest: 24.5, category: "Activities", minAge: 13 },
  { id: "mixology", emoji: "🥂", name: "Mixology Workshop", pricePerGuest: 38.75, category: "Food & Drink", minAge: 21 },
  { id: "laundry", emoji: "🧺", name: "Express Laundry Service", pricePerGuest: 16.25, category: "Services" },
  { id: "golf", emoji: "⛳", name: "Golf Simulator Rental", pricePerGuest: 35, category: "Activities" },
  { id: "theater", emoji: "🎭", name: "Backstage VIP Theater Tour", pricePerGuest: 21.25, category: "Experiences" },
  { id: "heli", emoji: "🚁", name: "Port Heli-Adventures", pricePerGuest: 47.5, category: "Activities" },
  { id: "arcade", emoji: "👾", name: "Arcade All-Access Pass", pricePerGuest: 12.5, category: "Activities" },
  { id: "stateroom", emoji: "🛏️", name: "Stateroom Premium Setup", pricePerGuest: 75, category: "Services" },
];

export const DEMO_CABINS = [
  {
    id: "cabin-1",
    label: "Cabin 1 · Room 3118",
    guests: [
      { id: "adult-1", name: "Adult 1", age: 34 },
      { id: "young-adult-1", name: "Young Adult 1", age: 17 },
      { id: "child-1", name: "Child 1", age: 9 },
    ],
  },
  {
    id: "cabin-2",
    label: "Cabin 2 · Room 3120",
    guests: [
      { id: "adult-2", name: "Adult 2", age: 41 },
      { id: "infant-1", name: "Infant 1", age: 1, type: "infant" },
    ],
  },
];

const styles = {
  catalog: {
    border: `1px solid ${TOKENS.line}`,
    borderRadius: 9,
    overflow: "hidden",
    background: TOKENS.panel,
    color: TOKENS.ink,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    lineHeight: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 12px",
    background: TOKENS.fill,
    borderBottom: `1px solid ${TOKENS.line}`,
  },
  stat: {
    padding: "4px 8px",
    borderRadius: 6,
    border: `1px solid ${TOKENS.line}`,
    background: TOKENS.panel,
    color: TOKENS.inkSoft,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};

function formatMoney(value, currency) {
  return `${currency}${Number(value || 0).toFixed(2)}`;
}

function quantityFor(assignment) {
  return Object.values(assignment || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
}

function assignedGuestCount(assignment) {
  return Object.values(assignment || {}).filter((quantity) => Number(quantity) > 0).length;
}

function dateParts(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day };
}

function referenceDateParts(value) {
  const dateOnly = dateParts(value);
  if (dateOnly) {
    const localDate = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
    return {
      ...dateOnly,
      iso: value,
      label: localDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  }
  const parsed = value instanceof Date ? value : new Date(value || Date.now());
  const valid = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return {
    year: valid.getFullYear(),
    month: valid.getMonth() + 1,
    day: valid.getDate(),
    iso: `${valid.getFullYear()}-${String(valid.getMonth() + 1).padStart(2, "0")}-${String(valid.getDate()).padStart(2, "0")}`,
    label: valid.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

function ageOnDate(birthDate, eligibilityDate) {
  const birth = dateParts(birthDate);
  if (!birth) return null;
  const reference = referenceDateParts(eligibilityDate);
  let age = reference.year - birth.year;
  if (reference.month < birth.month || (reference.month === birth.month && reference.day < birth.day)) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

function guestMeetsAgeBand(product, guest) {
  if (product.minAge == null) return true;
  if (Number.isFinite(guest.age)) return guest.age >= product.minAge;
  const label = String(guest.ageLabel || "").replace(/\s/g, "");
  if (product.minAge >= 21) return label === "21+";
  if (product.minAge >= 13) return label === "21+" || label.startsWith("13");
  return guest.type !== "infant";
}

function guestRequiresDob(product, guest) {
  if (product.minAge == null) return false;
  const isAdultBand = Number.isFinite(guest.age)
    ? guest.age >= 21
    : String(guest.ageLabel || "").replace(/\s/g, "") === "21+";
  if (product.minAge <= 13 && isAdultBand) return false;
  return true;
}

function guestEligibility(product, guest, birthDates, eligibilityDate) {
  const infant = guest.type === "infant" || (Number.isFinite(guest.age) && guest.age < 3);
  if (infant && product.allowInfants !== true) return { eligible: false, state: "ineligible", message: "Not eligible" };
  if (product.minAge == null) return { eligible: true, state: "eligible", message: "Eligible" };
  if (!guestMeetsAgeBand(product, guest)) {
    return { eligible: false, state: "ineligible", message: `Requires age ${product.minAge}+` };
  }
  const birthDate = (birthDates || {})[guest.id] || "";
  if (!guestRequiresDob(product, guest)) {
    const age = birthDate ? ageOnDate(birthDate, eligibilityDate) : null;
    return { eligible: true, state: "eligible", age, message: age == null ? "Eligible by age band" : `Eligible · age ${age} on departure` };
  }
  if (!birthDate) return { eligible: false, state: "required", message: "DOB required to assign" };
  const age = ageOnDate(birthDate, eligibilityDate);
  if (age == null) return { eligible: false, state: "invalid", message: "Enter a valid date" };
  if (age < product.minAge) return { eligible: false, state: "ineligible", age, message: `Not eligible · age ${age} on departure` };
  return { eligible: true, state: "eligible", age, message: `Eligible · age ${age} on departure` };
}

function ageLabel(guest) {
  if (guest.ageLabel) return guest.ageLabel;
  if (Number.isFinite(guest.age)) return String(guest.age);
  return "Not provided";
}

function QuantityStepper({ productName, guestName, value, disabled, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: disabled ? 0.45 : 1 }}>
      <button
        type="button"
        aria-label={`Decrease ${productName} quantity for ${guestName}`}
        disabled={disabled || value === 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: `1px solid ${TOKENS.line}`,
          background: TOKENS.panel,
          color: disabled || value === 0 ? TOKENS.inkFaint : TOKENS.ink,
          cursor: disabled || value === 0 ? "default" : "pointer",
          font: "inherit",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        −
      </button>
      <output
        aria-live="polite"
        aria-label={`${productName} quantity for ${guestName}: ${value}`}
        style={{
          width: 22,
          textAlign: "center",
          color: TOKENS.ink,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Increase ${productName} quantity for ${guestName}`}
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "none",
          background: disabled ? TOKENS.line : TOKENS.accent,
          color: TOKENS.panel,
          cursor: disabled ? "default" : "pointer",
          font: "inherit",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  );
}

function AssignmentDialog({ product, cabins, assignment, birthDates, eligibilityDate, currency, onChange, onBirthDateChange, onRemoveGuest, onClearGuests, onClose, openerRef }) {
  const dialogRef = React.useRef(null);
  const dobDialogRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const [dobPrompt, setDobPrompt] = React.useState(null);
  const [dobDraft, setDobDraft] = React.useState("");
  const [dobError, setDobError] = React.useState("");
  const dobPromptRef = React.useRef(null);
  const assignedUnits = quantityFor(assignment);
  const assignedGuests = assignedGuestCount(assignment);
  const titleId = `supplement-dialog-${product.id}`;
  const departure = referenceDateParts(eligibilityDate);

  React.useEffect(() => {
    dobPromptRef.current = dobPrompt;
  }, [dobPrompt]);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (dobPromptRef.current) {
          setDobPrompt(null);
          setDobDraft("");
          setDobError("");
        } else {
          onClose();
        }
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        (dobPromptRef.current ? dobDialogRef.current : dialogRef.current)?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus?.();
    };
  }, [onClose, openerRef]);

  const setGuestQuantity = (guestId, quantity) => {
    const next = { ...assignment };
    const currentQuantity = Number(next[guestId] || 0);
    const guest = cabins.flatMap((cabin) => cabin.guests || []).find((item) => item.id === guestId);
    if (!guest || !guestMeetsAgeBand(product, guest)) return;
    if (quantity <= currentQuantity) {
      if (quantity <= 0) {
        delete next[guestId];
        if (product.minAge != null && guestRequiresDob(product, guest)) {
          onRemoveGuest(guestId);
          return;
        }
      } else next[guestId] = quantity;
      onChange(next);
      return;
    }
    if (product.minAge != null && !guestEligibility(product, guest, birthDates, eligibilityDate).eligible) {
      setDobPrompt({ guest, requestedQuantity: quantity });
      setDobDraft((birthDates || {})[guestId] || "");
      setDobError("");
      return;
    }
    next[guestId] = quantity;
    onChange(next);
  };

  const cancelDobPrompt = () => {
    setDobPrompt(null);
    setDobDraft("");
    setDobError("");
  };

  const confirmDobAndAdd = () => {
    if (!dobPrompt) return;
    const nextBirthDates = { ...(birthDates || {}), [dobPrompt.guest.id]: dobDraft };
    const eligibility = guestEligibility(product, dobPrompt.guest, nextBirthDates, eligibilityDate);
    if (eligibility.state === "required" || eligibility.state === "invalid") {
      setDobError("Enter a valid date of birth.");
      return;
    }
    if (!eligibility.eligible) {
      setDobError(`${dobPrompt.guest.name} will be age ${eligibility.age} on departure and is not eligible for this ${product.minAge}+ product.`);
      return;
    }
    onBirthDateChange(dobPrompt.guest.id, dobDraft);
    onChange({ ...assignment, [dobPrompt.guest.id]: Math.max(1, Number(dobPrompt.requestedQuantity || 1)) });
    cancelDobPrompt();
  };

  const assignCabin = (cabin) => {
    const next = { ...assignment };
    cabin.guests.filter((guest) => guestEligibility(product, guest, birthDates, eligibilityDate).eligible).forEach((guest) => {
      next[guest.id] = Math.max(1, next[guest.id] || 0);
    });
    onChange(next);
  };

  const clearCabin = (cabin) => {
    onClearGuests(
      cabin.guests
        .filter((guest) => Number(assignment[guest.id] || 0) > 0)
        .map((guest) => guest.id)
    );
  };

  return (
    <div
      className="mvas-supplement-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(1px)",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "min(940px, 100%)",
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${TOKENS.line}`,
          borderRadius: 10,
          background: TOKENS.panel,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.28)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            flexShrink: 0,
            background: TOKENS.fill,
            borderBottom: `1px solid ${TOKENS.line}`,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${TOKENS.line}`,
              borderRadius: 8,
              background: TOKENS.panel,
              fontSize: 20,
            }}
          >
            {product.emoji}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                color: TOKENS.inkLabel,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: "uppercase",
              }}
            >
              {product.category}
            </div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 id={titleId} style={{ margin: 0, color: TOKENS.ink, fontSize: 16, fontWeight: 700 }}>
                {product.name}
              </h2>
              {product.minAge != null && (
                <span
                  style={{
                    padding: "4px 4px",
                    borderRadius: 4,
                    background: TOKENS.warningBg,
                    color: TOKENS.warning,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {product.minAge}+
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: TOKENS.inkLabel, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Per guest
            </div>
            <div
              style={{
                marginTop: 4,
                color: TOKENS.ink,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {formatMoney(product.pricePerGuest, currency)}
            </div>
            {assignedUnits > 0 && (
              <div style={{ marginTop: 4, color: TOKENS.positive, fontSize: 12, fontWeight: 700 }}>
                {assignedGuests} guest{assignedGuests === 1 ? "" : "s"} · +
                {formatMoney(product.pricePerGuest * assignedUnits, currency)}
              </div>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close supplement assignment"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${TOKENS.line}`,
              borderRadius: 6,
              background: TOKENS.panel,
              color: TOKENS.inkSoft,
              cursor: "pointer",
              font: "inherit",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <div className="mvas-supplement-dialog-scroll" style={{ minHeight: 0, overflowY: "auto", padding: 16 }}>
          <div className="mvas-supplement-cabin-grid">
            {cabins.map((cabin, cabinIndex) => {
              const eligibleGuests = cabin.guests.filter((guest) => guestEligibility(product, guest, birthDates, eligibilityDate).eligible);
              const cabinQuantity = cabin.guests.reduce(
                (sum, guest) => sum + Number(assignment[guest.id] || 0),
                0
              );
              const allEligibleAssigned =
                eligibleGuests.length > 0 && eligibleGuests.every((guest) => Number(assignment[guest.id] || 0) > 0);

              return (
                <section
                  key={cabin.id}
                  aria-labelledby={`supplement-cabin-${cabin.id}`}
                  style={{ minWidth: 0, overflow: "hidden", border: `1px solid ${TOKENS.line}`, borderRadius: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "8px 12px",
                      background: TOKENS.fill,
                      borderBottom: `1px solid ${TOKENS.lineSoft}`,
                    }}
                  >
                    <span
                      id={`supplement-cabin-${cabin.id}`}
                      style={{ color: TOKENS.inkLabel, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
                    >
                      {cabin.label || `Cabin ${cabinIndex + 1}`}
                    </span>
                    <span style={{ color: TOKENS.inkSoft, fontSize: 12 }}>
                      {cabin.guests.length} guest{cabin.guests.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {cabin.guests.map((guest, guestIndex) => {
                    const eligibility = guestEligibility(product, guest, birthDates, eligibilityDate);
                    const infant = guest.type === "infant" || (Number.isFinite(guest.age) && guest.age < 3);
                    const ageBandIneligible = product.minAge != null && !guestMeetsAgeBand(product, guest);
                    const guestDisabled = infant || ageBandIneligible;
                    const quantity = eligibility.eligible ? Number(assignment[guest.id] || 0) : 0;
                    return (
                      <div
                        key={guest.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 12px",
                          borderBottom:
                            guestIndex < cabin.guests.length - 1 ? `1px solid ${TOKENS.lineSoft}` : "none",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                            <span style={{ color: TOKENS.ink, fontSize: 14, fontWeight: 700 }}>{guest.name}</span>
                            <span style={{ padding: "4px 8px", borderRadius: 4, background: TOKENS.bg, color: TOKENS.inkSoft, fontSize: 12, fontWeight: 600 }}>
                              Age {ageLabel(guest)}
                            </span>
                            {guestDisabled && (
                              <span style={{ color: TOKENS.inkFaint, fontSize: 12, fontWeight: 700 }}>
                                {ageBandIneligible ? `${product.minAge}+ required` : "Not eligible"}
                              </span>
                            )}
                          </div>
                          {product.minAge != null && !guestDisabled && quantity > 0 && eligibility.age != null && (
                            <div style={{ marginTop: 4, color: eligibility.eligible ? TOKENS.positive : TOKENS.danger, fontSize: 12, fontWeight: 700 }}>
                              Age {eligibility.age} on departure{eligibility.eligible ? "" : ` · ${product.minAge}+ required`}
                            </div>
                          )}
                        </div>
                        <QuantityStepper
                          productName={product.name}
                          guestName={guest.name}
                          value={quantity}
                          disabled={guestDisabled}
                          onChange={(nextQuantity) => setGuestQuantity(guest.id, nextQuantity)}
                        />
                      </div>
                    );
                  })}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "8px 12px",
                      background: TOKENS.fill,
                      borderTop: `1px solid ${TOKENS.lineSoft}`,
                    }}
                  >
                    <button
                      type="button"
                      disabled={cabinQuantity === 0}
                      onClick={() => clearCabin(cabin)}
                      aria-label={`Remove ${product.name} from all guests in ${cabin.label}`}
                      style={{
                        padding: "8px 8px",
                        borderRadius: 5,
                        border: `1px solid ${cabinQuantity > 0 ? "#FCA5A5" : TOKENS.line}`,
                        background: cabinQuantity > 0 ? TOKENS.dangerBg : TOKENS.panel,
                        color: cabinQuantity > 0 ? TOKENS.danger : TOKENS.inkFaint,
                        cursor: cabinQuantity > 0 ? "pointer" : "default",
                        font: "inherit",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Remove all
                    </button>
                    {product.minAge == null && (
                      <button
                        type="button"
                        disabled={allEligibleAssigned || eligibleGuests.length === 0}
                        onClick={() => assignCabin(cabin)}
                        aria-label={`Assign ${product.name} to all eligible guests in ${cabin.label}`}
                        style={{
                          padding: "8px 8px",
                          borderRadius: 5,
                          border: `1px solid ${
                            allEligibleAssigned || eligibleGuests.length === 0 ? TOKENS.line : TOKENS.accentLine
                          }`,
                          background:
                            allEligibleAssigned || eligibleGuests.length === 0 ? TOKENS.panel : TOKENS.accentTint,
                          color:
                            allEligibleAssigned || eligibleGuests.length === 0 ? TOKENS.inkFaint : TOKENS.accent,
                          cursor: allEligibleAssigned || eligibleGuests.length === 0 ? "default" : "pointer",
                          font: "inherit",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Assign to all
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: 6,
                background: TOKENS.accent,
                color: TOKENS.panel,
                cursor: "pointer",
                font: "inherit",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
      {dobPrompt && (
        <div
          onMouseDown={(event) => event.target === event.currentTarget && cancelDobPrompt()}
          style={{
            position: "fixed", inset: 0, zIndex: 520, display: "grid", placeItems: "center", padding: 24,
            background: "rgba(15, 23, 42, 0.42)", backdropFilter: "blur(1px)",
          }}
        >
          <div
            ref={dobDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`portable-dob-title-${product.id}-${dobPrompt.guest.id}`}
            style={{
              width: "min(480px, 100%)", overflow: "hidden", border: `1px solid ${TOKENS.line}`,
              borderRadius: 10, background: TOKENS.panel, boxShadow: "0 24px 64px rgba(15,23,42,0.28)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 16px", background: TOKENS.fill, borderBottom: `1px solid ${TOKENS.line}` }}>
              <span aria-hidden="true" style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FDE68A", color: TOKENS.warning, flexShrink: 0 }}>◫</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div id={`portable-dob-title-${product.id}-${dobPrompt.guest.id}`} style={{ color: TOKENS.ink, fontSize: 16, fontWeight: 700 }}>Verify age to add</div>
                <div style={{ marginTop: 4, color: TOKENS.inkSoft, fontSize: 12, lineHeight: "16px" }}>
                  {product.name} is limited to guests age {product.minAge}+ on departure. Add {dobPrompt.guest.name}'s date of birth to continue.
                </div>
              </div>
              <button type="button" onClick={cancelDobPrompt} aria-label="Close date of birth verification" style={{ width: 30, height: 30, border: `1px solid ${TOKENS.line}`, borderRadius: 6, background: TOKENS.panel, color: TOKENS.inkSoft, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16, padding: "8px 12px", border: "1px solid #FDE68A", borderRadius: 8, background: "#FFFBEB", color: TOKENS.warning, fontSize: 12 }}>
                Eligibility is calculated for departure on <strong>{departure.label}</strong>.
              </div>
              <label htmlFor={`portable-dob-${product.id}-${dobPrompt.guest.id}`} style={{ display: "block", marginBottom: 4, color: TOKENS.inkLabel, fontSize: 12, fontWeight: 700 }}>Date of birth</label>
              <input
                id={`portable-dob-${product.id}-${dobPrompt.guest.id}`}
                autoFocus
                type="date"
                max={departure.iso}
                value={dobDraft}
                aria-invalid={!!dobError}
                onChange={(event) => { setDobDraft(event.target.value); setDobError(""); }}
                style={{ width: "100%", height: 40, padding: "8px 12px", border: `1px solid ${dobError ? "#FCA5A5" : TOKENS.controlLine}`, borderRadius: 8, color: TOKENS.ink, background: TOKENS.panel }}
              />
              {dobError && <div role="alert" style={{ marginTop: 8, color: TOKENS.danger, fontSize: 12, fontWeight: 700 }}>{dobError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                <button type="button" onClick={cancelDobPrompt} style={{ minHeight: 36, padding: "8px 16px", border: `1px solid ${TOKENS.line}`, borderRadius: 7, background: TOKENS.panel, color: TOKENS.inkSoft, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={confirmDobAndAdd} style={{ minHeight: 36, padding: "8px 16px", border: "none", borderRadius: 7, background: TOKENS.accent, color: TOKENS.panel, fontWeight: 700, cursor: "pointer" }}>Verify and add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupplementCatalog({
  products = DEFAULT_SUPPLEMENTS,
  cabins = DEMO_CABINS,
  assignments,
  initialAssignments = {},
  onAssignmentsChange,
  birthDates,
  initialBirthDates = {},
  onBirthDatesChange,
  eligibilityDate,
  currency = "$",
  title = "Supplement catalog",
  description = "",
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [activeProductId, setActiveProductId] = React.useState(null);
  const [internalAssignments, setInternalAssignments] = React.useState(initialAssignments);
  const [internalBirthDates, setInternalBirthDates] = React.useState(initialBirthDates);
  const openerRef = React.useRef(null);

  const controlled = assignments !== undefined;
  const currentAssignments = (controlled ? assignments : internalAssignments) || {};
  const birthDatesControlled = birthDates !== undefined;
  const currentBirthDates = (birthDatesControlled ? birthDates : internalBirthDates) || {};
  const commitAssignments = React.useCallback(
    (nextAssignments) => {
      if (!controlled) setInternalAssignments(nextAssignments);
      onAssignmentsChange?.(nextAssignments);
    },
    [controlled, onAssignmentsChange]
  );
  const commitBirthDates = React.useCallback(
    (nextBirthDates) => {
      if (!birthDatesControlled) setInternalBirthDates(nextBirthDates);
      onBirthDatesChange?.(nextBirthDates);
    },
    [birthDatesControlled, onBirthDatesChange]
  );

  const categories = React.useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!normalizedSearch) return true;
      return `${product.name} ${product.category}`.toLowerCase().includes(normalizedSearch);
    });
  }, [category, products, searchTerm]);

  const activeProduct = products.find((product) => product.id === activeProductId) || null;
  const selectedProductCount = Object.values(currentAssignments).filter(
    (productAssignment) => quantityFor(productAssignment) > 0
  ).length;
  const totalAssignedUnits = Object.values(currentAssignments).reduce(
    (sum, productAssignment) => sum + quantityFor(productAssignment),
    0
  );
  const allGuests = cabins.flatMap((cabin) => cabin.guests || []);
  const hasGuests = allGuests.length > 0;
  const eligibilityStateSignature = JSON.stringify({
    eligibilityDate: eligibilityDate || "",
    birthDates: currentBirthDates,
    assignments: currentAssignments,
    guests: allGuests.map((guest) => guest.id),
  });

  // Sanitize controlled or persisted input as well as newly-entered values.
  // This prevents a legacy restricted assignment from remaining billable when
  // it has no verified DOB (or the guest is under the required age).
  React.useEffect(() => {
    const guestById = new Map(allGuests.map((guest) => [guest.id, guest]));
    let changed = false;
    const nextAssignments = {};

    Object.entries(currentAssignments).forEach(([productId, productAssignment]) => {
      const product = products.find((item) => item.id === productId);
      if (!product || product.minAge == null) {
        nextAssignments[productId] = productAssignment;
        return;
      }
      const verifiedAssignment = {};
      Object.entries(productAssignment || {}).forEach(([guestId, quantity]) => {
        const guest = guestById.get(guestId);
        if (Number(quantity) > 0 && guest && guestEligibility(product, guest, currentBirthDates, eligibilityDate).eligible) {
          verifiedAssignment[guestId] = quantity;
        } else {
          changed = true;
        }
      });
      if (Object.keys(verifiedAssignment).length > 0) nextAssignments[productId] = verifiedAssignment;
      else if (Object.keys(productAssignment || {}).length > 0) changed = true;
    });

    if (changed) commitAssignments(nextAssignments);
  }, [eligibilityStateSignature, commitAssignments]);

  const updateProductAssignment = (productId, productAssignment) => {
    const cleaned = Object.fromEntries(
      Object.entries(productAssignment).filter(([, quantity]) => Number(quantity) > 0)
    );
    const next = { ...currentAssignments };
    if (Object.keys(cleaned).length === 0) delete next[productId];
    else next[productId] = cleaned;
    commitAssignments(next);
  };

  const updateGuestBirthDate = (guestId, birthDate) => {
    const nextBirthDates = { ...currentBirthDates };
    if (birthDate) nextBirthDates[guestId] = birthDate;
    else delete nextBirthDates[guestId];

    const guest = allGuests.find((item) => item.id === guestId);
    const nextAssignments = { ...currentAssignments };
    if (guest) {
      products.filter((product) => product.minAge != null).forEach((product) => {
        if (!nextAssignments[product.id] || guestEligibility(product, guest, nextBirthDates, eligibilityDate).eligible) return;
        const nextProductAssignment = { ...nextAssignments[product.id] };
        delete nextProductAssignment[guestId];
        if (Object.keys(nextProductAssignment).length > 0) nextAssignments[product.id] = nextProductAssignment;
        else delete nextAssignments[product.id];
      });
    }
    commitBirthDates(nextBirthDates);
    commitAssignments(nextAssignments);
  };

  const clearProductGuests = (productId, guestIds) => {
    const product = products.find((item) => item.id === productId);
    const nextBirthDates = { ...currentBirthDates };
    const nextAssignments = { ...currentAssignments };

    const nextProductAssignment = { ...(nextAssignments[productId] || {}) };
    guestIds.forEach((guestId) => delete nextProductAssignment[guestId]);
    if (Object.keys(nextProductAssignment).length > 0) nextAssignments[productId] = nextProductAssignment;
    else delete nextAssignments[productId];

    if (product && product.minAge != null) {
      const dobGuestIds = guestIds.filter((guestId) => {
        const guest = allGuests.find((item) => item.id === guestId);
        return guest && guestRequiresDob(product, guest);
      });
      dobGuestIds.forEach((guestId) => delete nextBirthDates[guestId]);
      products.filter((item) => item.minAge != null).forEach((restrictedProduct) => {
        if (!nextAssignments[restrictedProduct.id]) return;
        const nextRestrictedAssignment = { ...nextAssignments[restrictedProduct.id] };
        dobGuestIds.forEach((guestId) => delete nextRestrictedAssignment[guestId]);
        if (Object.keys(nextRestrictedAssignment).length > 0) nextAssignments[restrictedProduct.id] = nextRestrictedAssignment;
        else delete nextAssignments[restrictedProduct.id];
      });
    }

    commitBirthDates(nextBirthDates);
    commitAssignments(nextAssignments);
  };

  const removeProductGuest = (productId, guestId) => {
    const product = products.find((item) => item.id === productId);
    const guest = allGuests.find((item) => item.id === guestId);
    const nextAssignments = { ...currentAssignments };
    const nextProductAssignment = { ...(nextAssignments[productId] || {}) };
    delete nextProductAssignment[guestId];
    if (Object.keys(nextProductAssignment).length > 0) nextAssignments[productId] = nextProductAssignment;
    else delete nextAssignments[productId];

    const nextBirthDates = { ...currentBirthDates };
    if (product && guest && product.minAge != null && guestRequiresDob(product, guest)) {
      const dobStillRequired = products.some((restrictedProduct) => (
        restrictedProduct.minAge != null
        && guestRequiresDob(restrictedProduct, guest)
        && Number((nextAssignments[restrictedProduct.id] || {})[guestId] || 0) > 0
      ));
      if (!dobStillRequired) delete nextBirthDates[guestId];
    }

    commitBirthDates(nextBirthDates);
    commitAssignments(nextAssignments);
  };

  const openProduct = (productId) => {
    if (!hasGuests) return;
    openerRef.current = document.activeElement;
    setActiveProductId(productId);
  };

  const closeDialog = React.useCallback(() => setActiveProductId(null), []);

  return (
    <div className="mvas-supplement-catalog" style={styles.catalog}>
      <style>{`
        .mvas-supplement-catalog *,
        .mvas-supplement-catalog *::before,
        .mvas-supplement-catalog *::after { box-sizing: border-box; }
        .mvas-supplement-catalog button,
        .mvas-supplement-catalog input,
        .mvas-supplement-catalog textarea,
        .mvas-supplement-catalog select,
        .mvas-supplement-backdrop button,
        .mvas-supplement-backdrop input,
        .mvas-supplement-backdrop textarea,
        .mvas-supplement-backdrop select { font: inherit; }
        .mvas-supplement-catalog button:focus-visible,
        .mvas-supplement-catalog input:focus-visible,
        .mvas-supplement-backdrop button:focus-visible {
          outline: 2px solid ${TOKENS.accent};
          outline-offset: 2px;
        }
        .mvas-supplement-product-grid {
          display: block;
          overflow: hidden;
          border: 1px solid ${TOKENS.line};
          border-radius: 8px;
          background: ${TOKENS.panel};
        }
        .mvas-supplement-list-header,
        .mvas-supplement-list-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(130px, .42fr) 96px 40px;
          align-items: center;
          gap: 12px;
        }
        .mvas-supplement-cabin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 12px;
          align-items: start;
        }
        .mvas-supplement-dialog-scroll {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        .mvas-supplement-dialog-scroll::-webkit-scrollbar { width: 6px; }
        .mvas-supplement-dialog-scroll::-webkit-scrollbar-track { background: transparent; }
        .mvas-supplement-dialog-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, .38);
          border-radius: 999px;
        }
        @media (max-width: 720px) {
          .mvas-supplement-cabin-grid { grid-template-columns: 1fr; }
          .mvas-supplement-list-header { display: none; }
          .mvas-supplement-list-row {
            grid-template-columns: minmax(0, 1fr) auto;
            row-gap: 8px;
          }
          .mvas-supplement-product-cell { grid-column: 1; grid-row: 1; }
          .mvas-supplement-assignment-cell { grid-column: 1; grid-row: 2; }
          .mvas-supplement-price-cell { grid-column: 2; grid-row: 1; }
          .mvas-supplement-action-cell { grid-column: 2; grid-row: 2; }
        }
      `}</style>

      <header style={styles.header}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: TOKENS.inkLabel,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          {description && (
            <div style={{ marginTop: 4, color: TOKENS.inkSoft, fontSize: 12 }}>{description}</div>
          )}
        </div>
        {selectedProductCount > 0 && (
          <span
            role="status"
            style={{
              ...styles.stat,
              borderColor: TOKENS.accentLine,
              background: TOKENS.accentTint,
              color: TOKENS.accent,
            }}
          >
            {selectedProductCount} products · {totalAssignedUnits} assignments
          </span>
        )}
      </header>

      {!hasGuests && (
        <div
          role="status"
          style={{
            margin: "12px 12px 0",
            padding: "12px 12px",
            border: "1px solid #FDE68A",
            borderRadius: 8,
            background: "#FFFBEB",
            color: TOKENS.warning,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Add guests before assigning supplements.
        </div>
      )}

      <div style={{ padding: "12px 12px 8px" }}>
        <label style={{ position: "relative", display: "block", marginBottom: 8 }}>
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Search supplements
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: TOKENS.inkSoft,
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search supplements…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: `1px solid ${TOKENS.controlLine}`,
              borderRadius: 8,
              background: TOKENS.panel,
              color: TOKENS.ink,
              font: "inherit",
              fontSize: 14,
            }}
          />
        </label>

        <div role="group" aria-label="Supplement category filters" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {categories.map((categoryName) => {
            const selected = categoryName === category;
            return (
              <button
                key={categoryName}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(categoryName)}
                style={{
                  padding: "4px 12px",
                  border: `1px solid ${selected ? TOKENS.accent : TOKENS.line}`,
                  borderRadius: 999,
                  background: selected ? TOKENS.accent : TOKENS.panel,
                  color: selected ? TOKENS.panel : TOKENS.ink,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 12,
                  fontWeight: selected ? 700 : 500,
                }}
              >
                {categoryName}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        {filteredProducts.length > 0 ? (
          <div className="mvas-supplement-product-grid">
            <div
              className="mvas-supplement-list-header"
              aria-hidden="true"
              style={{
                padding: "8px 12px",
                borderBottom: `1px solid ${TOKENS.line}`,
                background: TOKENS.fill,
                color: TOKENS.inkSoft,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span>Product</span>
              <span>Assignment</span>
              <span style={{ textAlign: "right" }}>Price</span>
              <span />
            </div>
            {filteredProducts.map((product, index) => {
              const productAssignment = currentAssignments[product.id] || {};
              const quantity = quantityFor(productAssignment);
              const guestsAssigned = assignedGuestCount(productAssignment);
              const selected = quantity > 0;
              const expanded = activeProductId === product.id;

              return (
                <div
                  key={product.id}
                  style={{
                    overflow: "hidden",
                    borderBottom: index < filteredProducts.length - 1 ? `1px solid ${TOKENS.lineSoft}` : "none",
                    background: expanded ? TOKENS.accentTint : TOKENS.panel,
                    boxShadow: selected ? `inset 3px 0 ${TOKENS.accent}` : "none",
                  }}
                >
                  <button
                    className="mvas-supplement-list-row"
                    type="button"
                    disabled={!hasGuests}
                    aria-expanded={expanded}
                    aria-haspopup="dialog"
                    aria-label={`${selected ? "Review assignment for" : "Assign guests to"} ${product.name}`}
                    title={`${selected ? "Review assignment for" : "Assign guests to"} ${product.name}`}
                    onClick={() => openProduct(product.id)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "transparent",
                      color: TOKENS.ink,
                      cursor: hasGuests ? "pointer" : "not-allowed",
                      opacity: hasGuests ? 1 : 0.55,
                      font: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <span className="mvas-supplement-product-cell" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 32,
                          height: 32,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `1px solid ${TOKENS.line}`,
                          borderRadius: 7,
                          background: TOKENS.panel,
                          fontSize: 16,
                        }}
                      >
                        {product.emoji}
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: TOKENS.ink, fontSize: 14, fontWeight: 700 }}>{product.name}</span>
                          {product.minAge != null && (
                            <span
                              style={{
                                padding: "4px 4px",
                                borderRadius: 4,
                                background: TOKENS.warningBg,
                                color: TOKENS.warning,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {product.minAge}+
                            </span>
                          )}
                        </span>
                        <span style={{ display: "block", marginTop: 4, color: TOKENS.inkSoft, fontSize: 12, fontWeight: 500 }}>
                          {product.category}
                        </span>
                      </span>
                    </span>

                    <span className="mvas-supplement-assignment-cell" style={{ minWidth: 0, fontSize: 12 }}>
                      {selected ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            border: `1px solid ${TOKENS.positiveLine}`,
                            borderRadius: 999,
                            background: TOKENS.positiveBg,
                            color: TOKENS.positive,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span aria-hidden="true">✓</span>
                          {guestsAssigned} guest{guestsAssigned === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span style={{ color: TOKENS.inkSoft }}>Not assigned</span>
                      )}
                    </span>

                    <span className="mvas-supplement-price-cell" style={{ minWidth: 0, textAlign: "right" }}>
                        <span
                          style={{
                            display: "block",
                            color: TOKENS.inkLabel,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {selected ? "Total" : "Per guest"}
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: 4,
                            color: TOKENS.ink,
                            fontSize: 14,
                            fontWeight: 700,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {selected
                            ? `+${formatMoney(product.pricePerGuest * quantity, currency)}`
                            : formatMoney(product.pricePerGuest, currency)}
                        </span>
                    </span>
                      <span
                        className="mvas-supplement-action-cell"
                        aria-hidden="true"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${selected ? TOKENS.accentLine : TOKENS.line}`,
                          borderRadius: 6,
                          background: selected ? TOKENS.accentTint : TOKENS.panel,
                          color: TOKENS.accent,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
                          <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                      </span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            role="status"
            style={{
              padding: "24px 12px",
              border: `1px dashed ${TOKENS.line}`,
              borderRadius: 9,
              color: TOKENS.inkSoft,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            No supplements match your filters.
          </div>
        )}
      </div>

      {selectedProductCount === 0 && (
        <div
          style={{
            padding: "12px 12px",
            borderTop: `1px solid ${TOKENS.lineSoft}`,
            color: TOKENS.inkFaint,
            fontSize: 12,
            textAlign: "center",
          }}
        >
          No supplements added — base fare only.
        </div>
      )}

      {activeProduct && hasGuests && (
        <AssignmentDialog
          product={activeProduct}
          cabins={cabins}
          assignment={currentAssignments[activeProduct.id] || {}}
          birthDates={currentBirthDates}
          eligibilityDate={eligibilityDate}
          currency={currency}
          openerRef={openerRef}
          onChange={(nextProductAssignment) => updateProductAssignment(activeProduct.id, nextProductAssignment)}
          onBirthDateChange={updateGuestBirthDate}
          onRemoveGuest={(guestId) => removeProductGuest(activeProduct.id, guestId)}
          onClearGuests={(guestIds) => clearProductGuests(activeProduct.id, guestIds)}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

export default SupplementCatalog;
