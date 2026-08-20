// ───────────────────────────────────────────────────────────────────────────
// Booking store — the single source of truth for the whole flow.
//
// Every step used to own a private copy of the booking and write it to a
// different storage key: Step 1 → localStorage['farecode-flow-v3'], Step 2 →
// localStorage['farecode-flow-step2-v1'] + sessionStorage['bookingState'],
// Steps 3/4 → sessionStorage['bookingState']. Because Step 2 rebuilt itself
// from localStorage but overwrote bookingState on every keystroke, walking
// back into Step 2 silently destroyed every guest name, coupon and payment
// choice made downstream.
//
// Now: one object, one key, owned by BookingFlowRouter and passed down. A step
// cannot lose a field it does not know about, because no step re-initialises
// state of its own.
// ───────────────────────────────────────────────────────────────────────────

// Bumped to v2 when the phantom "Where & when" step was removed: a v1 draft's
// `step` is offset by one (old 2 = Sailing, now 1) and there is no way to tell
// an un-migrated v1 value from a valid v2 one, so v1 drafts are dropped rather
// than restored onto the wrong screen.
const BOOKING_KEY = 'farecode-booking-v2';

// Legacy keys, read once to migrate an in-progress booking, then ignored.
const LEGACY_KEYS = {
  s1: 'farecode-flow-v3',
  s2: 'farecode-flow-step2-v1',
  session: 'bookingState',
};

// Per-guest ages were replaced by age bands chosen via guest type, but three
// readers still rendered `guestAges` and showed "Age —" forever because nothing
// writes it any more. The band IS the age information now.
const GUEST_BANDS = { adults: '21+', youngAdults: '13–21', children: '3–12', infants: '0–3' };

const GRATUITIES = 270;
const PROTECTION_PP = 29;
const COUPONS = { 'None': 0, 'SAVE10': 0.10, 'EARLYBIRD': 0.06 };

const BOOKING_DEFAULTS = {
  // Identity + flow position. `step` is persisted so a refresh resumes where
  // the agent was. 1 = Sailing/fare/cabin, 2 = Add guests, 3 = Review & confirm.
  bookingId: 'DRAFT-9087',
  source: 'Phone',
  step: 1,

  // Step 1 — trip context
  isFilterExpanded: true,
  selectedDestinations: [],
  selectedPorts: [],
  selectedHomePorts: [],
  guests: { adults: 0, youngAdults: 0, children: 0, infants: 0 },
  guestAges: { adults: [], youngAdults: [], children: [], infants: [] },
  // Multi-select facet. Keep this an array in every state so toggle updates
  // never have to switch between null and collection semantics.
  selectedDuration: [],
  selectedMonth: { month: null, year: null },
  selectedIntent: null,

  // Step 2 — sailing, cabin, fare, extras
  selectedSailingCode: null,
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

  // Step 3 — guest records, keyed A1 / YA1 / C1 / I1
  guestData: {},

  // Commercial terms. Editable from every step, so they start neutral — a
  // coupon the agent never applied must not silently discount the quote.
  appliedCoupon: 'None',
  customCode: '',
  protection: false,
  holdDur: '48h',
  paymentMode: 'Deposit Only',
};

// Nested objects need their own merge: a stored `guests` missing `infants`
// would otherwise produce NaN totals downstream.
function normalizeBooking(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const b = { ...BOOKING_DEFAULTS, ...r };
  b.guests = { ...BOOKING_DEFAULTS.guests, ...(r.guests || {}) };
  b.guestAges = { ...BOOKING_DEFAULTS.guestAges, ...(r.guestAges || {}) };
  b.selectedMonth = { ...BOOKING_DEFAULTS.selectedMonth, ...(r.selectedMonth || {}) };
  b.guestData = r.guestData && typeof r.guestData === 'object' ? r.guestData : {};
  // Per-cabin supplement assignment has been retired. Keep only guest keys
  // and rebuild totals from those visible assignments so a saved `cabin:`
  // quantity can never survive as a hidden charge.
  const rawSuppAssignments = r.suppAssignments && typeof r.suppAssignments === 'object'
    ? r.suppAssignments : {};
  b.suppAssignments = {};
  b.selectedSupps = {};
  Object.entries(rawSuppAssignments).forEach(([suppId, rawAssignment]) => {
    if (!rawAssignment || typeof rawAssignment !== 'object') return;
    const guestAssignment = {};
    Object.entries(rawAssignment).forEach(([guestKey, qty]) => {
      if (!guestKey.startsWith('cabin:') && qty > 0) guestAssignment[guestKey] = qty;
    });
    const totalQty = Object.values(guestAssignment).reduce((sum, qty) => sum + qty, 0);
    if (totalQty > 0) {
      b.suppAssignments[suppId] = guestAssignment;
      b.selectedSupps[suppId] = totalQty;
    }
  });
  // Curated packages have been retired. Drop persisted package choices so a
  // hidden legacy selection can never continue affecting the quote.
  b.selectedPackages = [];
  // Filter persisted selections to the live taxonomy: a booking stored under
  // the old placeholder regions ('Mediterranean', 'Alaska') or old '5N' night
  // values would otherwise filter every sailing out with no visible reason.
  const regionNames = (window.MVAS_REGIONS || []).map((x) => x.name);
  const portIds = (window.MVAS_PORTS || []).map((x) => x.id);
  const bandIds = (window.DURATION_BANDS || []).map((x) => x.id);
  const homePortIds = (window.MVAS_HOME_PORTS || []).map((x) => x.id);
  b.selectedDestinations = (Array.isArray(r.selectedDestinations) ? r.selectedDestinations : [])
    .filter((d) => regionNames.includes(d));
  b.selectedPorts = (Array.isArray(r.selectedPorts) ? r.selectedPorts : [])
    .filter((p) => portIds.includes(p));
  b.selectedDuration = (Array.isArray(r.selectedDuration) ? r.selectedDuration : [])
    .filter((d) => bandIds.includes(d));
  b.selectedHomePorts = (Array.isArray(r.selectedHomePorts) ? r.selectedHomePorts : [])
    .filter((p) => homePortIds.includes(p));
  b.cabins = Array.isArray(r.cabins) ? r.cabins : [];
  // The flow is three steps. An out-of-range `step` (a stale 4 from the old
  // four-step router, or garbage) would fall through the router's dispatch and
  // render a blank page, so clamp rather than trust what was persisted.
  b.step = Math.min(Math.max(parseInt(b.step, 10) || 1, 1), 3);
  // The deposit pill used to be labelled with a hardcoded 25%; anything that
  // isn't "pay in full" means deposit.
  if (b.paymentMode !== 'Pay Full Balance') b.paymentMode = 'Deposit Only';
  return b;
}

function readJSON(store, key) {
  try {
    const v = store.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

// One-time lift of a booking that was in progress under the old split keys.
// Layered oldest-first so the most recently written wins.
function migrateLegacyBooking() {
  const s1 = readJSON(localStorage, LEGACY_KEYS.s1);
  const s2 = readJSON(localStorage, LEGACY_KEYS.s2);
  const sess = readJSON(sessionStorage, LEGACY_KEYS.session);
  if (!s1 && !s2 && !sess) return null;
  return { ...(s1 || {}), ...(s2 || {}), ...(sess || {}) };
}

function loadBooking() {
  const stored = readJSON(localStorage, BOOKING_KEY) || migrateLegacyBooking();
  return normalizeBooking(stored);
}

function saveBooking(booking) {
  try { localStorage.setItem(BOOKING_KEY, JSON.stringify(booking)); } catch (e) {}
}

function bookingGuestCount(b) {
  const g = (b && b.guests) || {};
  return (g.adults || 0) + (g.youngAdults || 0) + (g.children || 0) + (g.infants || 0);
}

const round2 = (n) => Math.round(n * 100) / 100;

// ── The one pricing function ────────────────────────────────────────────────
// Previously each panel hand-rolled this and they disagreed: Step 2 rounded the
// deposit to whole dollars while Step 3 rounded to cents, and Step 4 ignored
// `fc.deposit` entirely and hardcoded 25% — so an EARLY-IS booking (20%) showed
// three different deposits across three consecutive screens.
//
// Package rule: a package's price is its included supplements at pricePP ×
// guests, and those supplements are then not charged again individually. That
// is the same per-person rule everything else uses.
function computeBookingPricing(booking) {
  const b = booking || {};
  const CAB = typeof S2_CAB !== 'undefined' ? S2_CAB : [];
  const FC = typeof S2_FC !== 'undefined' ? S2_FC : [];
  const SUPP = typeof S2_SUPP !== 'undefined' ? S2_SUPP : [];
  const PKG = typeof S2_PKG !== 'undefined' ? S2_PKG : [];
  const IDX = typeof BASE_FARE_IDX !== 'undefined' ? BASE_FARE_IDX : 1.15;
  const suppById = (id) => SUPP.find((s) => s.id === id) || null;

  const sailing = typeof getSailing === 'function' ? getSailing(b.selectedSailingCode) : null;
  const cabin = CAB.find((c) => c.id === b.cabinId) || null;
  const fc = FC.find((f) => f.id === b.farecodeId) || null;
  const guestCount = bookingGuestCount(b);

  // 'empty'   — nothing priceable yet
  // 'partial' — sailing + cabin chosen, fare still open; quote is provisional
  // 'final'   — fare locked, the number is real
  const status = sailing && cabin && fc ? 'final' : sailing && cabin ? 'partial' : 'empty';
  const fcForMath = fc || FC.find((f) => f.id === 'NR-SAVER') || null;

  const basePP = sailing && fcForMath ? Math.round(fcForMath.pricePP * sailing.fareIndex / IDX) : 0;
  const cabinDeltaPP = cabin ? cabin.deltaPP || 0 : 0;
  const cabinFarePP = basePP + cabinDeltaPP;
  const cabinFareTotal = cabinFarePP * guestCount;
  const gratuities = status === 'empty' ? 0 : GRATUITIES;

  const pkgs = (b.selectedPackages || []).map((id) => PKG.find((p) => p.id === id)).filter(Boolean);
  const pkgSuppIds = new Set();
  pkgs.forEach((p) => (p.includedSupps || []).forEach((id) => pkgSuppIds.add(id)));
  const packageTotal = pkgs.reduce((sum, p) => {
    const pp = (p.includedSupps || []).reduce((t, id) => t + (suppById(id)?.pricePP || 0), 0);
    return sum + pp * guestCount;
  }, 0);

  // Supplement lines: charged ones first, then package-covered ones at $0 so
  // the agent can still see everything the guest is getting.
  const qtys = b.selectedSupps && !Array.isArray(b.selectedSupps) ? b.selectedSupps : {};
  const suppLines = [];
  let suppTotal = 0;
  Object.keys(qtys).forEach((id) => {
    const su = suppById(id);
    const qty = qtys[id];
    if (!su || !(qty > 0)) return;
    const inPkg = pkgSuppIds.has(id);
    const amount = inPkg ? 0 : su.pricePP * qty;
    suppTotal += amount;
    suppLines.push({ id, name: su.name, emoji: su.emoji, qty, amount, inPkg });
  });
  pkgSuppIds.forEach((id) => {
    if (qtys[id] > 0) return;
    const su = suppById(id);
    if (su) suppLines.push({ id, name: su.name, emoji: su.emoji, qty: 1, amount: 0, inPkg: true });
  });
  suppTotal = round2(suppTotal);

  const protectionTotal = b.protection ? guestCount * PROTECTION_PP : 0;

  // Coupons discount the fare + gratuities, which is what "off base fare" means
  // on the panel — not the supplements or the protection premium.
  const baseFare = cabinFareTotal + gratuities;
  const couponPct = COUPONS[b.appliedCoupon] !== undefined ? COUPONS[b.appliedCoupon] : 0;
  const couponDisc = status === 'empty' ? 0 : round2(-baseFare * couponPct);
  const couponIsCustom = b.appliedCoupon !== 'None' && COUPONS[b.appliedCoupon] === undefined;

  const total = round2(cabinFareTotal + gratuities + suppTotal + packageTotal + protectionTotal + couponDisc);
  const depositRate = fcForMath ? fcForMath.deposit || 0.25 : 0.25;
  const payFull = b.paymentMode === 'Pay Full Balance';
  const deposit = round2(total * depositRate);
  const amountDue = payFull ? total : deposit;
  const remaining = round2(total - amountDue);

  return {
    sailing, cabin, fc, guestCount, status,
    basePP, cabinDeltaPP, cabinFarePP, cabinFareTotal,
    gratuities, suppTotal, suppLines, packageTotal, pkgs,
    protectionTotal, couponPct, couponDisc, couponIsCustom,
    total, depositRate, deposit, amountDue, remaining, payFull,
  };
}

Object.assign(window, {
  BOOKING_KEY, BOOKING_DEFAULTS, GRATUITIES, PROTECTION_PP, COUPONS, GUEST_BANDS,
  normalizeBooking, loadBooking, saveBooking, bookingGuestCount, computeBookingPricing,
});
