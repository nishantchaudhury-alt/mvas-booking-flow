// ───────────────────────────────────────────────────────────────────────────
// Intent-Based Booking · data model + pricing engine
// Realistic computed numbers: per-person × guests, taxes, supplements, gratuities.
// Reuses the WF design tokens from wireframe-primitives.jsx.
// ───────────────────────────────────────────────────────────────────────────

// ── Money ──
function money(n) {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// ── Cabin categories — per-person, per-night base fare ──
const CABINS = [
  { id: 'IS',  name: 'Interior',  perNight: 89,  blurb: 'Cozy inside cabin, no window' },
  { id: 'OV',  name: 'Oceanview', perNight: 119, blurb: 'Picture window, sea views' },
  { id: 'BAL', name: 'Balcony',   perNight: 165, blurb: 'Private veranda', lead: true },
  { id: 'STE', name: 'Suite',     perNight: 279, blurb: 'Suite + butler-ready' },
];
const TAX_PER_NIGHT_PP = 19;       // port charges, taxes & fees
const CHILD_CABIN_FACTOR = 0.6;    // children pay 60% of cabin fare

// ── Farecodes (per cabin category lead-in differs; here a flat set) ──
const FARECODES = [
  { id: 'NR-SAVER',  name: 'NR Saver',        refundable: false, deposit: 0.25, adj: 0.0,   note: 'Non-refundable · lowest fare' },
  { id: 'FLEX-STD',  name: 'Flex Standard',   refundable: true,  deposit: 0.25, adj: 0.08,  note: 'Refundable to 45 days' },
  { id: 'EARLY-IS',  name: 'Early Saver IS',  refundable: false, deposit: 0.20, adj: -0.04, note: 'Inside-sale early booking' },
  { id: 'PROMO-2026', name: 'Promo 2026',     refundable: true,  deposit: 0.30, adj: 0.03,  note: 'Bundled promo fare' },
];

// ── Sailings — all accommodate up to 4 guests (capacity-filtered) ──
const SAILINGS = [
  {
    code: 'SAIL-77821', ship: 'MS Aurora', depart: 'Sep 14, 2026', ret: 'Sep 19, 2026',
    departShort: 'Sep 14', nights: 5, region: 'Caribbean', fareIndex: 1.0, maxOccupancy: 4,
    ports: [
      { day: 1, port: 'Miami, FL',     arr: '—',     dep: '17:00' },
      { day: 2, port: 'Cozumel, MX',   arr: '08:00', dep: '17:00' },
      { day: 3, port: 'Grand Cayman',  arr: '07:30', dep: '16:30' },
      { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' },
      { day: 5, port: 'At sea',        arr: '—',     dep: '—' },
      { day: 6, port: 'Miami, FL',     arr: '07:00', dep: '—' },
    ],
  },
  {
    code: 'SAIL-77852', ship: 'MS Aurora', depart: 'Sep 28, 2026', ret: 'Oct 04, 2026',
    departShort: 'Sep 28', nights: 6, region: 'Caribbean', fareIndex: 1.08, maxOccupancy: 4, holdCount: 3,
    ports: [
      { day: 1, port: 'Miami, FL',     arr: '—',     dep: '17:00' },
      { day: 2, port: 'Nassau',        arr: '08:00', dep: '17:00' },
      { day: 3, port: 'St. Maarten',   arr: '09:00', dep: '18:00' },
      { day: 4, port: 'St. Kitts',     arr: '08:00', dep: '17:00' },
      { day: 5, port: 'At sea',        arr: '—',     dep: '—' },
      { day: 6, port: 'Miami, FL',     arr: '07:00', dep: '—' },
    ],
  },
  {
    code: 'SAIL-77834', ship: 'MS Aurora', depart: 'Sep 21, 2026', ret: 'Sep 28, 2026',
    departShort: 'Sep 21', nights: 7, region: 'Caribbean', fareIndex: 1.15, maxOccupancy: 4, low: true,
    ports: [
      { day: 1, port: 'Miami, FL',   arr: '—',     dep: '17:00' },
      { day: 2, port: 'San Juan',    arr: '09:00', dep: '17:00' },
      { day: 3, port: 'St. Thomas',  arr: '08:00', dep: '18:00' },
      { day: 4, port: 'Tortola',     arr: '09:00', dep: '17:00' },
      { day: 5, port: 'Punta Cana',  arr: '10:00', dep: '19:00' },
      { day: 6, port: 'At sea',      arr: '—',     dep: '—' },
      { day: 7, port: 'At sea',      arr: '—',     dep: '—' },
      { day: 8, port: 'Miami, FL',   arr: '07:00', dep: '—' },
    ],
  },
  {
    code: 'SAIL-77910', ship: 'MS Aurora', depart: 'Oct 05, 2026', ret: 'Oct 10, 2026',
    departShort: 'Oct 05', nights: 5, region: 'Caribbean', fareIndex: 0.96, maxOccupancy: 4,
    ports: [
      { day: 1, port: 'Miami, FL',     arr: '—',     dep: '17:00' },
      { day: 2, port: 'Cozumel, MX',   arr: '08:00', dep: '17:00' },
      { day: 3, port: 'Grand Cayman',  arr: '07:30', dep: '16:30' },
      { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' },
      { day: 5, port: 'At sea',        arr: '—',     dep: '—' },
      { day: 6, port: 'Miami, FL',     arr: '07:00', dep: '—' },
    ],
  },
  // Window 1 sailings (9 more to reach 10)
  { code: 'SAIL-77822', ship: 'MS Harmony', depart: 'Sep 11, 2026', departShort: 'Sep 11', nights: 6, region: 'Caribbean', fareIndex: 1.02, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77823', ship: 'MS Oasis', depart: 'Sep 12, 2026', departShort: 'Sep 12', nights: 7, region: 'Caribbean', fareIndex: 1.1, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77824', ship: 'MS Symphony', depart: 'Sep 13, 2026', departShort: 'Sep 13', nights: 5, region: 'Bahamas', fareIndex: 0.99, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77825', ship: 'MS Majesty', depart: 'Sep 14, 2026', departShort: 'Sep 14', nights: 6, region: 'Mediterranean', fareIndex: 1.05, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77826', ship: 'MS Royal', depart: 'Sep 15, 2026', departShort: 'Sep 15', nights: 5, region: 'Caribbean', fareIndex: 1.01, maxOccupancy: 4, holdCount: 2, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77827', ship: 'MS Legend', depart: 'Sep 16, 2026', departShort: 'Sep 16', nights: 7, region: 'Alaska', fareIndex: 1.2, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77828', ship: 'MS Paradise', depart: 'Sep 17, 2026', departShort: 'Sep 17', nights: 5, region: 'Caribbean', fareIndex: 0.98, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77829', ship: 'MS Horizon', depart: 'Sep 18, 2026', departShort: 'Sep 18', nights: 6, region: 'Bahamas', fareIndex: 1.03, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77830', ship: 'MS Voyager', depart: 'Sep 19, 2026', departShort: 'Sep 19', nights: 5, region: 'Mediterranean', fareIndex: 1.07, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 2 sailings (for 09/18-09/21, 2 sailings)
  { code: 'SAIL-77831', ship: 'MS Quest', depart: 'Sep 20, 2026', departShort: 'Sep 20', nights: 6, region: 'Caribbean', fareIndex: 1.04, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77832', ship: 'MS Explorer', depart: 'Sep 21, 2026', departShort: 'Sep 21', nights: 5, region: 'Bahamas', fareIndex: 1.00, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 3 sailings (for 09/25-09/28, 4 sailings only)
  { code: 'SAIL-77833', ship: 'MS Escape', depart: 'Sep 22, 2026', departShort: 'Sep 22', nights: 7, region: 'Caribbean', fareIndex: 1.12, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77835', ship: 'MS Wonder', depart: 'Sep 23, 2026', departShort: 'Sep 23', nights: 6, region: 'Mediterranean', fareIndex: 1.09, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77836', ship: 'MS Prestige', depart: 'Sep 24, 2026', departShort: 'Sep 24', nights: 5, region: 'Alaska', fareIndex: 1.18, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 4 sailings (for 09/29-10/03, 10 sailings)
  { code: 'SAIL-77837', ship: 'MS Vision', depart: 'Sep 25, 2026', departShort: 'Sep 25', nights: 7, region: 'Caribbean', fareIndex: 1.11, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77838', ship: 'MS Serenity', depart: 'Sep 26, 2026', departShort: 'Sep 26', nights: 6, region: 'Bahamas', fareIndex: 1.06, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77839', ship: 'MS Majestic', depart: 'Sep 27, 2026', departShort: 'Sep 27', nights: 5, region: 'Mediterranean', fareIndex: 1.08, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77840', ship: 'MS Imperial', depart: 'Sep 28, 2026', departShort: 'Sep 28', nights: 6, region: 'Caribbean', fareIndex: 1.08, maxOccupancy: 4, holdCount: 3, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77841', ship: 'MS Dynasty', depart: 'Sep 29, 2026', departShort: 'Sep 29', nights: 5, region: 'Alaska', fareIndex: 1.19, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77842', ship: 'MS Elegance', depart: 'Sep 30, 2026', departShort: 'Sep 30', nights: 7, region: 'Caribbean', fareIndex: 1.13, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77843', ship: 'MS Radiance', depart: 'Oct 01, 2026', departShort: 'Oct 01', nights: 6, region: 'Bahamas', fareIndex: 1.05, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77844', ship: 'MS Splendor', depart: 'Oct 02, 2026', departShort: 'Oct 02', nights: 5, region: 'Mediterranean', fareIndex: 1.07, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 5 sailings (for 10/01-10/05, 10 sailings)
  { code: 'SAIL-77845', ship: 'MS Infinity', depart: 'Oct 03, 2026', departShort: 'Oct 03', nights: 7, region: 'Caribbean', fareIndex: 1.14, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77846', ship: 'MS Eclipse', depart: 'Oct 04, 2026', departShort: 'Oct 04', nights: 6, region: 'Bahamas', fareIndex: 1.04, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77847', ship: 'MS Zenith', depart: 'Oct 05, 2026', departShort: 'Oct 05', nights: 5, region: 'Mediterranean', fareIndex: 1.06, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77848', ship: 'MS Ascent', depart: 'Oct 06, 2026', departShort: 'Oct 06', nights: 7, region: 'Caribbean', fareIndex: 1.15, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77849', ship: 'MS Summit', depart: 'Oct 07, 2026', departShort: 'Oct 07', nights: 6, region: 'Alaska', fareIndex: 1.21, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77850', ship: 'MS Triumph', depart: 'Oct 08, 2026', departShort: 'Oct 08', nights: 5, region: 'Caribbean', fareIndex: 1.02, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77851', ship: 'MS Glory', depart: 'Oct 09, 2026', departShort: 'Oct 09', nights: 6, region: 'Bahamas', fareIndex: 1.03, maxOccupancy: 4, holdCount: 1, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77853', ship: 'MS Conquest', depart: 'Oct 10, 2026', departShort: 'Oct 10', nights: 7, region: 'Mediterranean', fareIndex: 1.16, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77854', ship: 'MS Allure', depart: 'Oct 11, 2026', departShort: 'Oct 11', nights: 5, region: 'Alaska', fareIndex: 1.17, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 6 sailings (for 09/10-09/13, 10 sailings)
  { code: 'SAIL-77855', ship: 'MS Breeze', depart: 'Sep 10, 2026', departShort: 'Sep 10', nights: 6, region: 'Caribbean', fareIndex: 1.01, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77856', ship: 'MS Pride', depart: 'Sep 11, 2026', departShort: 'Sep 11', nights: 7, region: 'Caribbean', fareIndex: 1.09, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77857', ship: 'MS Jewel', depart: 'Sep 12, 2026', departShort: 'Sep 12', nights: 5, region: 'Bahamas', fareIndex: 0.97, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77858', ship: 'MS Equinox', depart: 'Sep 13, 2026', departShort: 'Sep 13', nights: 6, region: 'Mediterranean', fareIndex: 1.04, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77859', ship: 'MS Reflection', depart: 'Sep 14, 2026', departShort: 'Sep 14', nights: 5, region: 'Alaska', fareIndex: 1.16, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77860', ship: 'MS Collection', depart: 'Sep 15, 2026', departShort: 'Sep 15', nights: 7, region: 'Caribbean', fareIndex: 1.10, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77861', ship: 'MS Celebration', depart: 'Sep 16, 2026', departShort: 'Sep 16', nights: 6, region: 'Bahamas', fareIndex: 1.02, maxOccupancy: 4, holdCount: 2, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77862', ship: 'MS Sensation', depart: 'Sep 17, 2026', departShort: 'Sep 17', nights: 5, region: 'Mediterranean', fareIndex: 1.05, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77863', ship: 'MS Fascination', depart: 'Sep 18, 2026', departShort: 'Sep 18', nights: 6, region: 'Caribbean', fareIndex: 1.08, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 7 sailings (for 09/19-09/23, 4 sailings only)
  { code: 'SAIL-77864', ship: 'MS Imagination', depart: 'Sep 19, 2026', departShort: 'Sep 19', nights: 7, region: 'Caribbean', fareIndex: 1.11, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77865', ship: 'MS Inspiration', depart: 'Sep 20, 2026', departShort: 'Sep 20', nights: 5, region: 'Bahamas', fareIndex: 0.99, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77866', ship: 'MS Liberation', depart: 'Sep 21, 2026', departShort: 'Sep 21', nights: 6, region: 'Mediterranean', fareIndex: 1.07, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77867', ship: 'MS Independence', depart: 'Sep 22, 2026', departShort: 'Sep 22', nights: 5, region: 'Alaska', fareIndex: 1.14, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 8 sailings (for 09/28-10/02, 10 sailings)
  { code: 'SAIL-77868', ship: 'MS Freedom', depart: 'Sep 23, 2026', departShort: 'Sep 23', nights: 7, region: 'Caribbean', fareIndex: 1.12, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77869', ship: 'MS Liberty', depart: 'Sep 24, 2026', departShort: 'Sep 24', nights: 6, region: 'Bahamas', fareIndex: 1.03, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77870', ship: 'MS Destiny', depart: 'Sep 25, 2026', departShort: 'Sep 25', nights: 5, region: 'Mediterranean', fareIndex: 1.06, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77871', ship: 'MS Miracle', depart: 'Sep 26, 2026', departShort: 'Sep 26', nights: 7, region: 'Caribbean', fareIndex: 1.13, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77872', ship: 'MS Rhapsody', depart: 'Sep 27, 2026', departShort: 'Sep 27', nights: 6, region: 'Alaska', fareIndex: 1.19, maxOccupancy: 4, holdCount: 1, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77873', ship: 'MS Melody', depart: 'Sep 28, 2026', departShort: 'Sep 28', nights: 5, region: 'Caribbean', fareIndex: 1.00, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77874', ship: 'MS Serenade', depart: 'Sep 29, 2026', departShort: 'Sep 29', nights: 7, region: 'Bahamas', fareIndex: 1.11, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77875', ship: 'MS Symphony', depart: 'Sep 30, 2026', departShort: 'Sep 30', nights: 6, region: 'Mediterranean', fareIndex: 1.08, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77876', ship: 'MS Concerto', depart: 'Oct 01, 2026', departShort: 'Oct 01', nights: 5, region: 'Alaska', fareIndex: 1.15, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 9 sailings (for 10/01-10/05, 10 sailings)
  { code: 'SAIL-77877', ship: 'MS Sonata', depart: 'Oct 02, 2026', departShort: 'Oct 02', nights: 7, region: 'Caribbean', fareIndex: 1.14, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77878', ship: 'MS Rhapsody', depart: 'Oct 03, 2026', departShort: 'Oct 03', nights: 6, region: 'Bahamas', fareIndex: 1.04, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77879', ship: 'MS Joyride', depart: 'Oct 04, 2026', departShort: 'Oct 04', nights: 5, region: 'Mediterranean', fareIndex: 1.05, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77880', ship: 'MS Adventure', depart: 'Oct 05, 2026', departShort: 'Oct 05', nights: 7, region: 'Caribbean', fareIndex: 1.15, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77881', ship: 'MS Wanderer', depart: 'Oct 06, 2026', departShort: 'Oct 06', nights: 6, region: 'Alaska', fareIndex: 1.20, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77882', ship: 'MS Discovery', depart: 'Oct 07, 2026', departShort: 'Oct 07', nights: 5, region: 'Caribbean', fareIndex: 1.01, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77883', ship: 'MS Expedition', depart: 'Oct 08, 2026', departShort: 'Oct 08', nights: 6, region: 'Bahamas', fareIndex: 1.02, maxOccupancy: 4, holdCount: 1, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77884', ship: 'MS Pathfinder', depart: 'Oct 09, 2026', departShort: 'Oct 09', nights: 7, region: 'Mediterranean', fareIndex: 1.16, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },

  // Window 10 sailings (for 10/05-10/09, 10 sailings)
  { code: 'SAIL-77885', ship: 'MS Trailblazer', depart: 'Oct 10, 2026', departShort: 'Oct 10', nights: 5, region: 'Alaska', fareIndex: 1.17, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77886', ship: 'MS Pathways', depart: 'Oct 11, 2026', departShort: 'Oct 11', nights: 7, region: 'Caribbean', fareIndex: 1.12, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77887', ship: 'MS Horizons', depart: 'Oct 12, 2026', departShort: 'Oct 12', nights: 6, region: 'Bahamas', fareIndex: 1.03, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77888', ship: 'MS Journeys', depart: 'Oct 13, 2026', departShort: 'Oct 13', nights: 5, region: 'Mediterranean', fareIndex: 1.04, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77889', ship: 'MS Pathfinder', depart: 'Oct 14, 2026', departShort: 'Oct 14', nights: 7, region: 'Caribbean', fareIndex: 1.13, maxOccupancy: 4, low: true, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77890', ship: 'MS Seekers', depart: 'Oct 15, 2026', departShort: 'Oct 15', nights: 6, region: 'Alaska', fareIndex: 1.18, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77891', ship: 'MS Voyagers', depart: 'Oct 16, 2026', departShort: 'Oct 16', nights: 5, region: 'Caribbean', fareIndex: 0.99, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Cozumel, MX', arr: '08:00', dep: '17:00' }, { day: 3, port: 'Grand Cayman', arr: '07:30', dep: '16:30' }, { day: 4, port: 'Ocho Rios, JM', arr: '09:00', dep: '18:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77892', ship: 'MS Explorers', depart: 'Oct 17, 2026', departShort: 'Oct 17', nights: 6, region: 'Bahamas', fareIndex: 1.01, maxOccupancy: 4, holdCount: 2, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'Nassau', arr: '08:00', dep: '17:00' }, { day: 3, port: 'St. Maarten', arr: '09:00', dep: '18:00' }, { day: 4, port: 'St. Kitts', arr: '08:00', dep: '17:00' }, { day: 5, port: 'At sea', arr: '—', dep: '—' }, { day: 6, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
  { code: 'SAIL-77893', ship: 'MS Travelers', depart: 'Oct 18, 2026', departShort: 'Oct 18', nights: 7, region: 'Mediterranean', fareIndex: 1.17, maxOccupancy: 4, ports: [{ day: 1, port: 'Miami, FL', arr: '—', dep: '17:00' }, { day: 2, port: 'San Juan', arr: '09:00', dep: '17:00' }, { day: 3, port: 'St. Thomas', arr: '08:00', dep: '18:00' }, { day: 4, port: 'Tortola', arr: '09:00', dep: '17:00' }, { day: 5, port: 'Punta Cana', arr: '10:00', dep: '19:00' }, { day: 6, port: 'At sea', arr: '—', dep: '—' }, { day: 7, port: 'At sea', arr: '—', dep: '—' }, { day: 8, port: 'Miami, FL', arr: '07:00', dep: '—' }] },
];

// ── MVAS itinerary overlay ───────────────────────────────────────────────────
// The sailings above were written against a placeholder taxonomy (4 regions,
// 5–7 nights, invented ports). The real Margaritaville at Sea network is six
// regions, ~22 ports of call and 2→8+ night durations — so rather than editing
// 74 hardcoded rows, each sailing is reassigned below from a set of real
// itinerary templates. Codes, ships, departure dates, occupancy and hold state
// all survive; region / nights / ports are the overlay.

const MVAS_REGIONS = [
  { name: 'Bahamas', emoji: '🐠' },
  { name: 'Caribbean', emoji: '🌴' },
  { name: 'Jamaica', emoji: '🏝️' },
  { name: 'Key West', emoji: '🌅' },
  { name: 'Mexico', emoji: '🛕' },
  { name: 'New Orleans', emoji: '⚜️' },
];

// Home ports — a separate facet from region/destination ("where the ship
// visits" vs "where the agent's client boards"). Three real MVAS embarkation
// cities; assigned to sailings independently of region below, so every
// region has real inventory from every port.
const MVAS_HOME_PORTS = [
  { id: 'miami',     name: 'Port Miami' },
  { id: 'palmbeach', name: 'Port of Palm Beach' },
  { id: 'tampabay',  name: 'Port Tampa Bay' },
];

const mvasHomePort = (id) => MVAS_HOME_PORTS.find((p) => p.id === id) || null;
const mvasHomePortName = (id) => { const p = mvasHomePort(id); return p ? p.name : id; };

// One catalog, grouped by country/territory. `name` is the exact string stored
// on a sailing's port stops, so filters match by identity instead of parsing.
const MVAS_PORTS = [
  { id: 'nassau',      name: 'Nassau, Bahamas',                  group: 'Bahamas' },
  { id: 'freeport',    name: 'Freeport, Grand Bahama',           group: 'Bahamas' },
  { id: 'bimini',      name: 'Bimini, Bahamas',                  group: 'Bahamas' },
  { id: 'keywest',     name: 'Key West, Florida',                group: 'United States' },
  { id: 'neworleans',  name: 'New Orleans, Louisiana',           group: 'United States' },
  { id: 'cozumel',     name: 'Cozumel, Mexico',                  group: 'Mexico' },
  { id: 'progreso',    name: 'Progreso, Mexico',                 group: 'Mexico' },
  { id: 'ochorios',    name: 'Ocho Rios, Jamaica',               group: 'Jamaica' },
  { id: 'montegobay',  name: 'Montego Bay, Jamaica',             group: 'Jamaica' },
  { id: 'georgetown',  name: 'George Town, Grand Cayman',        group: 'Cayman Islands' },
  { id: 'puertoplata', name: 'Puerto Plata, Dominican Republic', group: 'Dominican Republic' },
  { id: 'ambercove',   name: 'Amber Cove, Dominican Republic',   group: 'Dominican Republic' },
  { id: 'caborojo',    name: 'Cabo Rojo, Dominican Republic',    group: 'Dominican Republic' },
  { id: 'stthomas',    name: 'St. Thomas, U.S. Virgin Islands',  group: 'U.S. Virgin Islands' },
  { id: 'sanjuan',     name: 'San Juan, Puerto Rico',            group: 'Puerto Rico' },
  { id: 'grandturk',   name: 'Grand Turk, Turks and Caicos',     group: 'Turks and Caicos' },
  { id: 'philipsburg', name: 'Philipsburg, St. Maarten',         group: 'St. Maarten' },
  { id: 'oranjestad',  name: 'Oranjestad, Aruba',                group: 'Southern Caribbean' },
  { id: 'kralendijk',  name: 'Kralendijk, Bonaire',              group: 'Southern Caribbean' },
  { id: 'willemstad',  name: 'Willemstad, Curacao',              group: 'Southern Caribbean' },
  { id: 'roatan',      name: 'Roatan, Honduras',                 group: 'Honduras' },
  { id: 'belizecity',  name: 'Belize City, Belize',              group: 'Belize' },
];

const mvasPort = (id) => MVAS_PORTS.find((p) => p.id === id) || null;
const mvasPortName = (id) => { const p = mvasPort(id); return p ? p.name : id; };
// 'Nassau, Bahamas' → 'Nassau' — what chips and summary rows show.
const mvasPortShort = (id) => mvasPortName(id).split(',')[0];

// Group order follows the catalog's first appearance, so the picker reads in
// one deliberate order instead of alphabetical accident.
const MVAS_PORT_GROUPS = MVAS_PORTS.reduce((groups, p) => {
  let g = groups.find((x) => x.group === p.group);
  if (!g) { g = { group: p.group, ports: [] }; groups.push(g); }
  g.ports.push(p);
  return groups;
}, []);

// Duration is sold in bands, not exact night counts. `id` is what the booking
// stores; `short` is the chip label; min/max bound the nights they cover.
const DURATION_BANDS = [
  { id: '2-3N', short: '2–3N', label: '2–3 Nights', min: 2, max: 3 },
  { id: '4-5N', short: '4–5N', label: '4–5 Nights', min: 4, max: 5 },
  { id: '6-7N', short: '6–7N', label: '6–7 Nights', min: 6, max: 7 },
  { id: '8N+',  short: '8+N',  label: '8+ Nights',  min: 8, max: Infinity },
];

const getDurationBand = (id) => DURATION_BANDS.find((b) => b.id === id) || null;

// Does a sailing's night count fall inside any of the selected bands?
// Tolerates legacy scalar values ('5N') from bookings stored before bands.
function nightsInBands(nights, bandIds) {
  return (bandIds || []).some((id) => {
    const band = getDurationBand(id);
    if (band) return nights >= band.min && nights <= band.max;
    const n = parseInt(id, 10);
    return !isNaN(n) && nights === n;
  });
}

// Real-network itinerary shapes. `sea: 'split'` halves the sea days around the
// port calls (long hauls sail out and back); default puts them after the calls.
const MVAS_ITINERARIES = [
  { region: 'Bahamas',     nights: 2, ports: ['nassau'] },
  { region: 'Bahamas',     nights: 3, ports: ['nassau', 'bimini'] },
  { region: 'Bahamas',     nights: 4, ports: ['nassau', 'freeport', 'bimini'] },
  { region: 'Key West',    nights: 2, ports: ['keywest'] },
  { region: 'Key West',    nights: 3, ports: ['keywest', 'bimini'] },
  { region: 'Mexico',      nights: 4, ports: ['cozumel', 'progreso'] },
  { region: 'Mexico',      nights: 5, ports: ['keywest', 'cozumel', 'progreso'] },
  { region: 'Jamaica',     nights: 5, ports: ['georgetown', 'ochorios'], sea: 'split' },
  { region: 'Jamaica',     nights: 6, ports: ['montegobay', 'ochorios', 'georgetown'], sea: 'split' },
  { region: 'Caribbean',   nights: 6, ports: ['grandturk', 'sanjuan', 'stthomas'], sea: 'split' },
  { region: 'Caribbean',   nights: 7, ports: ['sanjuan', 'stthomas', 'philipsburg', 'puertoplata'], sea: 'split' },
  { region: 'Caribbean',   nights: 8, ports: ['ambercove', 'sanjuan', 'stthomas', 'philipsburg'], sea: 'split' },
  { region: 'Caribbean',   nights: 9, ports: ['caborojo', 'oranjestad', 'kralendijk', 'willemstad'], sea: 'split' },
  // These two stop AT New Orleans as a port of call — the region is themed by
  // what the itinerary visits, not by which of the three embarkation cities
  // it happens to sail from (that's the independent "Departing From" facet).
  { region: 'New Orleans', nights: 5, ports: ['neworleans', 'cozumel'], sea: 'split' },
  { region: 'New Orleans', nights: 7, ports: ['neworleans', 'roatan', 'belizecity'], sea: 'split' },
];

// Expands a template into the day-by-day stops shape every reader expects:
// day 1 home port, port calls and sea days in between, return on day N+1.
// `home` is the embarkation city name — assigned per-sailing from
// MVAS_HOME_PORTS below, independent of the itinerary template.
function mvasBuildStops(t, home) {
  const middleDays = t.nights - 1;
  const seaDays = Math.max(0, middleDays - t.ports.length);
  const lead = t.sea === 'split' ? Math.ceil(seaDays / 2) : 0;
  const seq = [
    ...Array(lead).fill(null),
    ...t.ports,
    ...Array(seaDays - lead).fill(null),
  ];
  return [
    { day: 1, port: home, arr: '—', dep: '17:00' },
    ...seq.map((pid, i) => pid
      ? { day: i + 2, port: mvasPortName(pid), arr: '08:00', dep: '17:00' }
      : { day: i + 2, port: 'At sea', arr: '—', dep: '—' }),
    { day: t.nights + 1, port: home, arr: '07:00', dep: '—' },
  ];
}

// Deterministic spread: sailing i gets template i mod 15 and home port i mod
// 3 — two independent cycles, so every region×homeport pairing gets real
// inventory instead of the two facets accidentally correlating.
SAILINGS.forEach((sail, i) => {
  const t = MVAS_ITINERARIES[i % MVAS_ITINERARIES.length];
  const home = MVAS_HOME_PORTS[i % MVAS_HOME_PORTS.length];
  sail.region = t.region;
  sail.nights = t.nights;
  sail.homePort = home.id;
  sail.ports = mvasBuildStops(t, home.name);
});

// ── Intents — bundle of supplements + per-night gratuity rates ──
// basis: 'per_guest' (× applicable guest count) | 'per_booking' (once)
// appliesTo: 'all' | 'children'  (for per_guest items)
const INTENTS = [
  {
    id: 'relaxation', emoji: '🧘', name: 'Relaxation',
    tagline: 'Spa, stillness, slow mornings',
    accent: '#0E7490', tint: '#ECFEFF', tintBorder: '#A5F3FC',
    gratuity: { adult: 18, child: 9 },
    bundle: [
      { id: 'spa-day',   name: 'Spa Day Pass',          venue: 'Onboard', basis: 'per_guest',   appliesTo: 'all', unit: 69 },
      { id: 'aroma',     name: 'Aromatherapy Package',  venue: 'Onboard', basis: 'per_guest',   appliesTo: 'all', unit: 45 },
      { id: 'thermal',   name: 'Thermal Suite Access',  venue: 'Onboard', basis: 'per_guest',   appliesTo: 'all', unit: 39 },
      { id: 'yoga',      name: 'Yoga Retreat Excursion',venue: 'Onshore', basis: 'per_guest',   appliesTo: 'all', unit: 59 },
      { id: 'beachclub', name: 'Beach Club Day Pass',   venue: 'Onshore', basis: 'per_guest',   appliesTo: 'all', unit: 49 },
    ],
  },
  {
    id: 'adventure', emoji: '🏄', name: 'Adventure',
    tagline: 'Reefs, ziplines, adrenaline',
    accent: '#4D7C0F', tint: '#F7FEE7', tintBorder: '#D9F99D',
    gratuity: { adult: 16, child: 8 },
    bundle: [
      { id: 'snorkel',  name: 'Snorkelling Excursion',  venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 89 },
      { id: 'zipline',  name: 'Zip-Line & Jungle Tour',  venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 115 },
      { id: 'watersp',  name: 'Watersports Package',     venue: 'Onboard', basis: 'per_guest', appliesTo: 'all', unit: 79 },
      { id: 'climb',    name: 'Rock Climbing Access',    venue: 'Onboard', basis: 'per_guest', appliesTo: 'all', unit: 25 },
      { id: 'atv',      name: 'ATV Safari Excursion',    venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 99 },
    ],
  },
  {
    id: 'anniversary', emoji: '💍', name: 'Anniversary',
    tagline: 'Champagne, candlelight, the works',
    accent: '#C2410C', tint: '#FFF7ED', tintBorder: '#FED7AA',
    gratuity: { adult: 20, child: 10 },
    bundle: [
      { id: 'champ',    name: 'Champagne & Strawberries', venue: 'Onboard', basis: 'per_booking', unit: 55 },
      { id: 'massage',  name: 'Couples Massage',          venue: 'Onboard', basis: 'per_booking', unit: 189 },
      { id: 'balcony',  name: 'Private Balcony Dinner',   venue: 'Onboard', basis: 'per_booking', unit: 145 },
      { id: 'heli',     name: 'Sunset Helicopter Tour',   venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 249 },
      { id: 'cake',     name: 'Anniversary Cake Setup',   venue: 'Onboard', basis: 'per_booking', unit: 35 },
    ],
  },
  {
    id: 'family', emoji: '👨‍👩‍👧', name: 'Family',
    tagline: 'Kids club, photos, easy days',
    accent: '#15803D', tint: '#F0FDF4', tintBorder: '#BBF7D0',
    gratuity: { adult: 14, child: 7 },
    bundle: [
      { id: 'kidsclub', name: 'Kids Club Access (all days)', venue: 'Onboard', basis: 'per_guest', appliesTo: 'children', unit: 59 },
      { id: 'famsnork', name: 'Family Snorkel Tour',         venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 69 },
      { id: 'famphoto', name: 'Family Photo Package',        venue: 'Onboard', basis: 'per_booking', unit: 89 },
      { id: 'wildlife', name: 'Wildlife & Nature Walk',      venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 45 },
      { id: 'kidsdine', name: 'Kids Dining Package',         venue: 'Onboard', basis: 'per_guest', appliesTo: 'children', unit: 39 },
    ],
  },
];

// ── Extra supplements an agent can swap-in / add at the review step ──
const EXTRA_SUPPLEMENTS = [
  { id: 'x-bev',    name: 'Premium Beverage Package', venue: 'Onboard', basis: 'per_guest', appliesTo: 'all', unit: 79 },
  { id: 'x-wifi',   name: 'Wi-Fi · 4 devices',        venue: 'Onboard', basis: 'per_booking', unit: 89 },
  { id: 'x-dining', name: 'Specialty Dining · 3-night',venue: 'Onboard', basis: 'per_guest', appliesTo: 'all', unit: 145 },
  { id: 'x-photo',  name: 'Photo Package · 10 prints', venue: 'Onboard', basis: 'per_booking', unit: 49 },
  { id: 'x-cabana', name: 'Private Beach Cabana',      venue: 'Onshore', basis: 'per_booking', unit: 129 },
  { id: 'x-transfer',name: 'Airport Transfers',        venue: 'Onshore', basis: 'per_guest', appliesTo: 'all', unit: 35 },
];

// ── lookups ──
const getIntent  = (id) => INTENTS.find(i => i.id === id) || null;
const getCabin   = (id) => CABINS.find(c => c.id === id) || CABINS[2];
const getSailing = (code) => SAILINGS.find(s => s.code === code) || null;
const getFarecode = (id) => FARECODES.find(f => f.id === id) || FARECODES[0];

// applicable guest count for a per_guest line
function applicableCount(line, guests) {
  const adultsAndUp = guests.adults + (guests.youngAdults || 0);
  if (line.appliesTo === 'children') return guests.children;
  if (line.appliesTo === 'adults')   return adultsAndUp;
  return adultsAndUp + guests.children; // 'all' — infants excluded
}

// quantity + line total for a single supplement line
function lineQtyTotal(line, guests) {
  if (line.basis === 'per_booking') return { qty: 1, total: line.unit };
  const qty = applicableCount(line, guests);
  return { qty, total: line.unit * qty };
}

// Build a fresh editable bundle (working copy) for the chosen intent.
function buildBundle(intentId) {
  const intent = getIntent(intentId);
  if (!intent) return [];
  return intent.bundle.map(l => ({ ...l, source: 'INTENT_BUNDLE', removed: false }));
}

// ── The pricing engine ──
// Args: { sailing, cabinId, farecodeId, guests, bundleLines, gratuityRemoved, intentId }
// Returns a full breakdown used by every step.
function priceQuote({ sailing, cabinId, farecodeId, guests, bundleLines, gratuityRemoved, intentId }) {
  const cabin = getCabin(cabinId);
  const nights = sailing ? sailing.nights : 0;
  const fareIndex = sailing ? sailing.fareIndex : 1;
  const fc = getFarecode(farecodeId);
  const adj = 1 + (fc ? fc.adj : 0);

  const adultCabinPP = Math.round(cabin.perNight * nights * fareIndex * adj);
  const childCabinPP = Math.round(adultCabinPP * CHILD_CABIN_FACTOR);
  const taxesPP = TAX_PER_NIGHT_PP * nights;

  // Young adults (18-20) pay the same fare tier as adults 21+ — the two
  // bands only exist to skip per-guest age capture, not to split pricing.
  const adultsAndUp = guests.adults + (guests.youngAdults || 0);

  const cabinFare =
    adultsAndUp * adultCabinPP +
    guests.children * childCabinPP;
  const taxes = (adultsAndUp + guests.children) * taxesPP;
  const baseFareTotal = cabinFare + taxes;

  // supplements
  const lines = (bundleLines || []).map(l => {
    const { qty, total } = lineQtyTotal(l, guests);
    return { ...l, qty, lineTotal: l.removed ? 0 : total, rawTotal: total };
  });
  const suppTotal = lines.reduce((a, l) => a + l.lineTotal, 0);

  // gratuities
  const intent = getIntent(intentId);
  let gratuityTotal = 0;
  if (intent && !gratuityRemoved) {
    gratuityTotal =
      (intent.gratuity.adult * adultsAndUp + intent.gratuity.child * guests.children) * nights;
  }

  const intentTotal = baseFareTotal + suppTotal + gratuityTotal;

  return {
    nights, adultCabinPP, childCabinPP, taxesPP,
    cabinFare, taxes, baseFareTotal,
    lines, suppTotal,
    gratuityTotal, gratuityRemoved: !!gratuityRemoved,
    intentTotal,
    guestCount: adultsAndUp + guests.children + guests.infants,
    payingCount: adultsAndUp + guests.children,
  };
}

// "from" lead-in price for a sailing card (cheapest cabin, base fare only)
function leadFare(sailing, guests) {
  const lead = CABINS.find(c => c.lead) || CABINS[0];
  const p = priceQuote({ sailing, cabinId: lead.id, farecodeId: 'NR-SAVER', guests, bundleLines: [], gratuityRemoved: true, intentId: null });
  return p.baseFareTotal;
}

// Single filter predicate shared by every step that lists sailings, so the
// destination/duration/month rules can't drift out of sync between them
// (Step 2 once read `selectedDuration` — a multi-select array — as a scalar).
function filterSailings(state) {
  return SAILINGS.filter((sail) => {
    if (state.selectedDestinations && state.selectedDestinations.length > 0) {
      if (!state.selectedDestinations.includes(sail.region)) return false;
    }
    if (state.selectedDuration && state.selectedDuration.length > 0) {
      if (!nightsInBands(sail.nights, state.selectedDuration)) return false;
    }
    // Ports narrow within the selected regions (AND across facets): a sailing
    // qualifies if it calls at ANY selected port.
    if (state.selectedPorts && state.selectedPorts.length > 0) {
      const names = new Set(state.selectedPorts.map(mvasPortName));
      if (!sail.ports.some((p) => names.has(p.port))) return false;
    }
    // Home port — independent of region/ports (a Bahamas cruise sails from
    // any of the three embarkation cities).
    if (state.selectedHomePorts && state.selectedHomePorts.length > 0) {
      if (!state.selectedHomePorts.includes(sail.homePort)) return false;
    }
    if (state.selectedMonth && state.selectedMonth.month) {
      const sailMonth = sail.depart.split(' ')[0];
      if (sailMonth !== state.selectedMonth.month) return false;
    }
    return true;
  });
}

// ── Customer index ─────────────────────────────────────────────────────────
// The saved-guest database an agent searches instead of retyping a returning
// traveller. Lives here rather than beside the one screen that reads it today:
// Step 2's "Query Customer Index" box is currently a search with no result list
// at all, and when that gets wired it must resolve against this same list — two
// directories would let the same person exist twice with different details.
//
// Field names deliberately match the `guestData[code]` record the booking
// stores (`name` split into first/last, `dob`, `phone`, `email`), so applying a
// profile is a copy rather than a translation.
const GUEST_DIRECTORY = [
  { id: 'CX-1001', firstName: 'Maya', lastName: 'Okonkwo', email: 'maya.okonkwo@example.com', phone: '(555) 200-1188', dob: '1988-04-12', city: 'Tampa, FL', bookings: 4, tier: 'Gold' },
  { id: 'CX-1002', firstName: 'Devraj', lastName: 'Patel', email: 'devraj.patel@example.com', phone: '(555) 118-4402', dob: '1985-11-30', city: 'Orlando, FL', bookings: 2, tier: 'Silver' },
  { id: 'CX-1003', firstName: 'Sofia', lastName: 'Marchetti', email: 'sofia.marchetti@example.com', phone: '(555) 401-7723', dob: '1992-06-08', city: 'Miami, FL', bookings: 7, tier: 'Platinum' },
  { id: 'CX-1004', firstName: 'Aiden', lastName: 'Okonkwo', email: 'aiden.okonkwo@example.com', phone: '(555) 200-1190', dob: '2012-02-19', city: 'Tampa, FL', bookings: 3, tier: null },
  { id: 'CX-1005', firstName: 'Priya', lastName: 'Raghavan', email: 'priya.raghavan@example.com', phone: '(555) 664-2087', dob: '1979-09-25', city: 'Atlanta, GA', bookings: 11, tier: 'Platinum' },
  { id: 'CX-1006', firstName: 'Tomas', lastName: 'Ibarra', email: 'tomas.ibarra@example.com', phone: '(555) 730-5512', dob: '1996-01-14', city: 'San Juan, PR', bookings: 1, tier: null },
  { id: 'CX-1007', firstName: 'Hannah', lastName: 'Whitfield', email: 'hannah.whitfield@example.com', phone: '(555) 902-3364', dob: '2005-07-03', city: 'Savannah, GA', bookings: 2, tier: 'Silver' },
  { id: 'CX-1008', firstName: 'Emeka', lastName: 'Nwosu', email: 'emeka.nwosu@example.com', phone: '(555) 447-9910', dob: '1968-03-21', city: 'Houston, TX', bookings: 6, tier: 'Gold' },
  { id: 'CX-1009', firstName: 'Lena', lastName: 'Fischer', email: 'lena.fischer@example.com', phone: '(555) 315-7728', dob: '2019-10-06', city: 'Tampa, FL', bookings: 1, tier: null },
  { id: 'CX-1010', firstName: 'Grace', lastName: 'Adeyemi', email: 'grace.adeyemi@example.com', phone: '(555) 208-6641', dob: '1974-12-02', city: 'Charlotte, NC', bookings: 9, tier: 'Gold' },
];

const directoryFullName = (p) => `${p.firstName} ${p.lastName}`.trim();

// Matches on name, email, phone or customer id. Phone comparison strips
// formatting from both sides so "5552001188" finds "(555) 200-1188" — an agent
// reading a number off a call log types digits, not punctuation.
function searchGuestDirectory(query, limit) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const digits = q.replace(/\D/g, '');
  const hits = GUEST_DIRECTORY.filter((p) => {
    if (directoryFullName(p).toLowerCase().includes(q)) return true;
    if (p.email.toLowerCase().includes(q)) return true;
    if (p.id.toLowerCase().includes(q)) return true;
    if (digits.length >= 3 && p.phone.replace(/\D/g, '').includes(digits)) return true;
    return false;
  });
  return limit ? hits.slice(0, limit) : hits;
}

Object.assign(window, {
  money, money0,
  CABINS, FARECODES, SAILINGS, INTENTS, EXTRA_SUPPLEMENTS,
  TAX_PER_NIGHT_PP, CHILD_CABIN_FACTOR,
  GUEST_DIRECTORY, directoryFullName, searchGuestDirectory,
  getIntent, getCabin, getSailing, getFarecode,
  applicableCount, lineQtyTotal, buildBundle, priceQuote, leadFare, filterSailings,
  MVAS_REGIONS, MVAS_PORTS, MVAS_PORT_GROUPS, DURATION_BANDS, MVAS_HOME_PORTS,
  mvasPort, mvasPortName, mvasPortShort, getDurationBand, nightsInBands,
  mvasHomePort, mvasHomePortName,
});
