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
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    background: TOKENS.fill,
    borderBottom: `1px solid ${TOKENS.line}`,
  },
  stat: {
    padding: "4px 7px",
    borderRadius: 6,
    border: `1px solid ${TOKENS.line}`,
    background: TOKENS.panel,
    color: TOKENS.inkSoft,
    fontSize: 11,
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

function guestIsEligible(product, guest) {
  const infant = guest.type === "infant" || (Number.isFinite(guest.age) && guest.age < 3);
  if (infant && product.allowInfants !== true) return false;
  if (product.minAge == null) return true;
  return Number.isFinite(guest.age) && guest.age >= product.minAge;
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
          fontSize: 13,
          fontWeight: 750,
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

function AssignmentDialog({ product, cabins, assignment, currency, onChange, onClose, openerRef }) {
  const dialogRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const assignedUnits = quantityFor(assignment);
  const assignedGuests = assignedGuestCount(assignment);
  const titleId = `supplement-dialog-${product.id}`;
  const descriptionId = `${titleId}-description`;

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
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
    if (quantity <= 0) delete next[guestId];
    else next[guestId] = quantity;
    onChange(next);
  };

  const assignCabin = (cabin) => {
    const next = { ...assignment };
    cabin.guests.filter((guest) => guestIsEligible(product, guest)).forEach((guest) => {
      next[guest.id] = Math.max(1, next[guest.id] || 0);
    });
    onChange(next);
  };

  const clearCabin = (cabin) => {
    const next = { ...assignment };
    cabin.guests.forEach((guest) => delete next[guest.id]);
    onChange(next);
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
        aria-describedby={descriptionId}
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
            gap: 10,
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
              fontSize: 19,
            }}
          >
            {product.emoji}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                color: TOKENS.inkLabel,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.55,
                textTransform: "uppercase",
              }}
            >
              {product.category}
            </div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <h2 id={titleId} style={{ margin: 0, color: TOKENS.ink, fontSize: 15, fontWeight: 750 }}>
                {product.name}
              </h2>
              {product.minAge != null && (
                <span
                  style={{
                    padding: "2px 5px",
                    borderRadius: 4,
                    background: TOKENS.warningBg,
                    color: TOKENS.warning,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {product.minAge}+
                </span>
              )}
            </div>
            <p id={descriptionId} style={{ margin: "3px 0 0", color: TOKENS.inkSoft, fontSize: 11 }}>
              Assign quantities by cabin and eligible guest.
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: TOKENS.inkLabel, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
              Per guest
            </div>
            <div
              style={{
                marginTop: 2,
                color: TOKENS.ink,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {formatMoney(product.pricePerGuest, currency)}
            </div>
            {assignedUnits > 0 && (
              <div style={{ marginTop: 2, color: TOKENS.positive, fontSize: 11, fontWeight: 700 }}>
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
              fontSize: 17,
            }}
          >
            ×
          </button>
        </div>

        <div className="mvas-supplement-dialog-scroll" style={{ minHeight: 0, overflowY: "auto", padding: 16 }}>
          <div className="mvas-supplement-cabin-grid">
            {cabins.map((cabin, cabinIndex) => {
              const eligibleGuests = cabin.guests.filter((guest) => guestIsEligible(product, guest));
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
                      style={{ color: TOKENS.inkLabel, fontSize: 11, fontWeight: 750, textTransform: "uppercase" }}
                    >
                      {cabin.label || `Cabin ${cabinIndex + 1}`}
                    </span>
                    <span style={{ color: TOKENS.inkSoft, fontSize: 11 }}>
                      {cabin.guests.length} guest{cabin.guests.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {cabin.guests.map((guest, guestIndex) => {
                    const eligible = guestIsEligible(product, guest);
                    const quantity = eligible ? Number(assignment[guest.id] || 0) : 0;
                    return (
                      <div
                        key={guest.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "10px 12px",
                          borderBottom:
                            guestIndex < cabin.guests.length - 1 ? `1px solid ${TOKENS.lineSoft}` : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                          <span style={{ color: TOKENS.ink, fontSize: 13, fontWeight: 700 }}>{guest.name}</span>
                          <span
                            style={{
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: TOKENS.bg,
                              color: TOKENS.inkSoft,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            Age {ageLabel(guest)}
                          </span>
                          {!eligible && (
                            <span style={{ color: product.minAge ? TOKENS.warning : TOKENS.inkFaint, fontSize: 11, fontWeight: 700 }}>
                              {product.minAge ? `${product.minAge}+ only` : "Not eligible"}
                            </span>
                          )}
                        </div>
                        <QuantityStepper
                          productName={product.name}
                          guestName={guest.name}
                          value={quantity}
                          disabled={!eligible}
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
                      padding: "8px 10px",
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
                        padding: "6px 9px",
                        borderRadius: 5,
                        border: `1px solid ${cabinQuantity > 0 ? "#FCA5A5" : TOKENS.line}`,
                        background: cabinQuantity > 0 ? TOKENS.dangerBg : TOKENS.panel,
                        color: cabinQuantity > 0 ? TOKENS.danger : TOKENS.inkFaint,
                        cursor: cabinQuantity > 0 ? "pointer" : "default",
                        font: "inherit",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Remove all
                    </button>
                    <button
                      type="button"
                      disabled={allEligibleAssigned || eligibleGuests.length === 0}
                      onClick={() => assignCabin(cabin)}
                      aria-label={`Assign ${product.name} to all eligible guests in ${cabin.label}`}
                      style={{
                        padding: "6px 9px",
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
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Assign to all
                    </button>
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
                padding: "9px 20px",
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
    </div>
  );
}

export function SupplementCatalog({
  products = DEFAULT_SUPPLEMENTS,
  cabins = DEMO_CABINS,
  assignments,
  initialAssignments = {},
  onAssignmentsChange,
  currency = "$",
  title = "Supplement catalog",
  description = "Assign optional products to eligible guests",
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [activeProductId, setActiveProductId] = React.useState(null);
  const [internalAssignments, setInternalAssignments] = React.useState(initialAssignments);
  const openerRef = React.useRef(null);

  const controlled = assignments !== undefined;
  const currentAssignments = (controlled ? assignments : internalAssignments) || {};
  const commitAssignments = React.useCallback(
    (nextAssignments) => {
      if (!controlled) setInternalAssignments(nextAssignments);
      onAssignmentsChange?.(nextAssignments);
    },
    [controlled, onAssignmentsChange]
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

  const updateProductAssignment = (productId, productAssignment) => {
    const cleaned = Object.fromEntries(
      Object.entries(productAssignment).filter(([, quantity]) => Number(quantity) > 0)
    );
    const next = { ...currentAssignments };
    if (Object.keys(cleaned).length === 0) delete next[productId];
    else next[productId] = cleaned;
    commitAssignments(next);
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
        .mvas-supplement-catalog button:focus-visible,
        .mvas-supplement-catalog input:focus-visible,
        .mvas-supplement-backdrop button:focus-visible {
          outline: 2px solid ${TOKENS.accent};
          outline-offset: 2px;
        }
        .mvas-supplement-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 8px;
          align-items: start;
        }
        .mvas-supplement-cabin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 10px;
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
          .mvas-supplement-product-grid,
          .mvas-supplement-cabin-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header style={styles.header}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: TOKENS.inkLabel,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.55,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 3, color: TOKENS.inkSoft, fontSize: 11 }}>{description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
          <span style={styles.stat}>{filteredProducts.length} shown</span>
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
        </div>
      </header>

      {!hasGuests && (
        <div
          role="status"
          style={{
            margin: "10px 12px 0",
            padding: "10px 12px",
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

      <div style={{ padding: "10px 12px 9px" }}>
        <label style={{ position: "relative", display: "block", marginBottom: 9 }}>
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
              left: 10,
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
              padding: "9px 12px 9px 36px",
              border: `1px solid ${TOKENS.controlLine}`,
              borderRadius: 8,
              background: TOKENS.panel,
              color: TOKENS.ink,
              font: "inherit",
              fontSize: 12.5,
            }}
          />
        </label>

        <div role="group" aria-label="Supplement category filters" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {categories.map((categoryName) => {
            const selected = categoryName === category;
            return (
              <button
                key={categoryName}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(categoryName)}
                style={{
                  padding: "5px 10px",
                  border: `1px solid ${selected ? TOKENS.accent : TOKENS.line}`,
                  borderRadius: 999,
                  background: selected ? TOKENS.accent : TOKENS.panel,
                  color: selected ? TOKENS.panel : TOKENS.ink,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 11,
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
            {filteredProducts.map((product) => {
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
                    border: `1px solid ${expanded ? TOKENS.accent : selected ? TOKENS.accentLine : TOKENS.line}`,
                    borderRadius: 9,
                    background: expanded ? TOKENS.accentTint : TOKENS.panel,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <button
                    type="button"
                    disabled={!hasGuests}
                    aria-expanded={expanded}
                    aria-haspopup="dialog"
                    aria-label={`${selected ? "Review assignment for" : "Assign guests to"} ${product.name}`}
                    onClick={() => openProduct(product.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "11px 12px",
                      border: "none",
                      background: "transparent",
                      color: TOKENS.ink,
                      cursor: hasGuests ? "pointer" : "not-allowed",
                      opacity: hasGuests ? 1 : 0.55,
                      font: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 38,
                          height: 38,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `1px solid ${TOKENS.line}`,
                          borderRadius: 8,
                          background: TOKENS.panel,
                          fontSize: 18,
                        }}
                      >
                        {product.emoji}
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: "block",
                            marginBottom: 3,
                            color: TOKENS.inkLabel,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 0.55,
                            textTransform: "uppercase",
                          }}
                        >
                          {product.category}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ color: TOKENS.ink, fontSize: 12.5, fontWeight: 700 }}>{product.name}</span>
                          {product.minAge != null && (
                            <span
                              style={{
                                padding: "2px 5px",
                                borderRadius: 4,
                                background: TOKENS.warningBg,
                                color: TOKENS.warning,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {product.minAge}+
                            </span>
                          )}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", minHeight: 20, marginTop: 5, fontSize: 11 }}>
                          {selected ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 7px",
                                border: `1px solid ${TOKENS.positiveLine}`,
                                borderRadius: 999,
                                background: TOKENS.positiveBg,
                                color: TOKENS.positive,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              <span aria-hidden="true">✓</span>
                              Assigned · {guestsAssigned} guest{guestsAssigned === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span style={{ color: TOKENS.inkSoft }}>No guests assigned</span>
                          )}
                        </span>
                      </span>
                    </span>

                    <span style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                      <span style={{ minWidth: 76, textAlign: "right" }}>
                        <span
                          style={{
                            display: "block",
                            color: TOKENS.inkLabel,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {selected ? "Total" : "Per guest"}
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: 2,
                            color: TOKENS.ink,
                            fontSize: 12.5,
                            fontWeight: 800,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {selected
                            ? `+${formatMoney(product.pricePerGuest * quantity, currency)}`
                            : formatMoney(product.pricePerGuest, currency)}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          minWidth: selected ? 62 : 72,
                          height: 32,
                          padding: "0 8px 0 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                          border: `1px solid ${selected ? TOKENS.accentLine : TOKENS.line}`,
                          borderRadius: 6,
                          background: selected ? TOKENS.accentTint : TOKENS.panel,
                          color: TOKENS.accent,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {selected ? "Edit" : "Assign"}
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
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
            padding: "10px 12px",
            borderTop: `1px solid ${TOKENS.lineSoft}`,
            color: TOKENS.inkFaint,
            fontSize: 11,
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
          currency={currency}
          openerRef={openerRef}
          onChange={(nextProductAssignment) => updateProductAssignment(activeProduct.id, nextProductAssignment)}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

export default SupplementCatalog;
