// ─── Shared data model, seed (demo) data, and pure helpers ─────────────────

export type Cleanliness = "Excellent" | "Good" | "Fair" | null;

export interface Restroom {
  id: string;
  name: string;
  building: string;
  floor: string;
  location: string;
  facilities: string[];
  accessibility?: string;
  notes?: string;
  photo?: string | null;
  distanceMin: number | null; // walking minutes; null = unknown
  busy: boolean | null; // last reported status; null = unknown
  cleanliness: Cleanliness;
  source: "demo" | "community";
  createdAt: number;
  mapPos: { top: string; left: string; label: string; color: string } | null;
}

export interface Review {
  id: string;
  restroomId: string;
  user: string;
  rating: number;
  text: string;
  createdAt: number;
  helpful: number;
  source: "demo" | "mine";
}

export interface Report {
  id: string;
  restroomId: string | null;
  kind: string;
  details: string;
  createdAt: number;
}

const H = 3600_000;
const BOOT = Date.now();

export const SEED_RESTROOMS: Restroom[] = [
  {
    id: "rr-science-f2",
    name: "Science Building",
    building: "Science Building",
    floor: "Floor 2",
    location: "Near the main stairwell, east wing",
    facilities: ["AC", "Quiet", "Premium"],
    distanceMin: 2,
    busy: false,
    cleanliness: "Excellent",
    source: "demo",
    createdAt: BOOT - 90 * 24 * H,
    mapPos: { top: "58%", left: "26%", label: "SCIENCE", color: "#ff6b6b" },
  },
  {
    id: "rr-cmit-f1",
    name: "CMIT Building",
    building: "CMIT Building",
    floor: "Floor 1",
    location: "Beside the ground-floor lobby",
    facilities: ["AC", "Large"],
    distanceMin: 5,
    busy: true,
    cleanliness: "Good",
    source: "demo",
    createdAt: BOOT - 80 * 24 * H,
    mapPos: { top: "36%", left: "78%", label: "CMIT", color: "#b37bff" },
  },
  {
    id: "rr-kllc-b",
    name: "KLLC Library",
    building: "KLLC Library",
    floor: "Basement",
    location: "Basement level, past the quiet-study zone",
    facilities: ["Premium", "Quiet"],
    distanceMin: 8,
    busy: false,
    cleanliness: "Excellent",
    source: "demo",
    createdAt: BOOT - 70 * 24 * H,
    mapPos: { top: "82%", left: "56%", label: "LIBRARY", color: "#ffd84d" },
  },
  {
    id: "rr-eng-f3",
    name: "Engineering Tower",
    building: "Engineering Tower",
    floor: "Floor 3",
    location: "Corridor opposite the lecture halls",
    facilities: ["AC"],
    distanceMin: 6,
    busy: true,
    cleanliness: "Good",
    source: "demo",
    createdAt: BOOT - 60 * 24 * H,
    mapPos: { top: "16%", left: "22%", label: "ENG", color: "#5ce1e6" },
  },
];

export const INITIAL_RESTROOMS = SEED_RESTROOMS;

export const SEED_REVIEWS: Review[] = [
  {
    id: "rv-1",
    restroomId: "rr-science-f2",
    user: "Nattapon K.",
    rating: 5,
    text: "Super clean, always stocked. Genuinely the best restroom on campus.",
    createdAt: BOOT - 2 * H,
    helpful: 18,
    source: "demo",
  },
  {
    id: "rv-2",
    restroomId: "rr-kllc-b",
    user: "Pimchanok S.",
    rating: 4,
    text: "Nice and quiet, great for quick study breaks too.",
    createdAt: BOOT - 5 * H,
    helpful: 9,
    source: "demo",
  },
  {
    id: "rv-3",
    restroomId: "rr-eng-f3",
    user: "Tanawat R.",
    rating: 5,
    text: "Premium vibes fr fr no cap. 10/10 would recommend.",
    createdAt: BOOT - 24 * H,
    helpful: 31,
    source: "demo",
  },
];

export const FACILITY_OPTIONS = [
  "AC",
  "Quiet",
  "Premium",
  "Large",
  "Accessible",
  "Bidet",
  "Baby changing",
];

export const REPORT_KINDS = [
  "Wrong location",
  "Wrong floor",
  "Closed or unavailable",
  "Missing facilities",
  "Other",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const normalizeFloor = (v: string) => {
  const t = v.trim().replace(/\s+/g, " ");
  if (/^\d+$/.test(t)) return `Floor ${t}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const timeAgo = (ts: number) => {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

export interface Rating {
  avg: number | null;
  count: number;
  dist: number[];
}

export const ratingFor = (reviews: Review[], restroomId: string): Rating => {
  const list = (reviews || []).filter((r) => r.restroomId === restroomId);
  const dist = [0, 0, 0, 0, 0];
  list.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1] += 1;
  });
  const count = list.length;
  const avg = count ? list.reduce((s, r) => s + r.rating, 0) / count : null;
  return { avg, count, dist };
};

export const fmtAvg = (n: number | null) => (n == null ? "—" : n.toFixed(1));

export const matchesQuery = (r: Restroom, q: string) => {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const hay = [
    r.name,
    r.building,
    r.floor,
    r.location,
    r.accessibility ?? "",
    ...(r.facilities || []),
  ]
    .join(" ")
    .toLowerCase();
  return t.split(/\s+/).every((w) => hay.includes(w));
};

export interface Filters {
  status: "any" | "open" | "busy";
  cleanliness: "any" | "Excellent" | "Good" | "Unrated";
  building: string;
  floor: string;
  facilities: string[];
}

export const EMPTY_FILTERS: Filters = {
  status: "any",
  cleanliness: "any",
  building: "",
  floor: "",
  facilities: [],
};

export const countFilters = (f: Filters) =>
  (f.status !== "any" ? 1 : 0) +
  (f.cleanliness !== "any" ? 1 : 0) +
  (f.building ? 1 : 0) +
  (f.floor ? 1 : 0) +
  (f.facilities?.length || 0);

export const passesFilters = (r: Restroom, f: Filters) => {
  if (f.status === "open" && r.busy !== false) return false;
  if (f.status === "busy" && r.busy !== true) return false;
  if (f.cleanliness === "Unrated" && r.cleanliness) return false;
  if (
    (f.cleanliness === "Excellent" || f.cleanliness === "Good") &&
    r.cleanliness !== f.cleanliness
  )
    return false;
  if (f.building && r.building !== f.building) return false;
  if (f.floor && r.floor !== f.floor) return false;
  if (!f.facilities.every((x) => (r.facilities || []).includes(x))) return false;
  return true;
};

export interface Recommendation {
  restroom: Restroom;
  score: number;
  reason: string;
}

const CLEAN_SCORE: Record<string, number> = {
  Excellent: 1,
  Good: 0.6,
  Fair: 0.3,
};

export const recommend = (
  restrooms: Restroom[],
  reviews: Review[],
): Recommendation[] => {
  const out: Recommendation[] = [];
  for (const r of restrooms || []) {
    const { avg } = ratingFor(reviews, r.id);
    if (r.distanceMin == null || r.busy == null || avg == null || !r.cleanliness)
      continue;
    const walk = 1 - Math.min(r.distanceMin, 15) / 15;
    const score =
      0.35 * walk +
      0.25 * (r.busy ? 0 : 1) +
      0.25 * (avg / 5) +
      0.15 * (CLEAN_SCORE[r.cleanliness] || 0.5);
    let reason = "A solid all-round pick";
    if (!r.busy && r.distanceMin <= 3) reason = "Nearby and reported available";
    else if (r.cleanliness === "Excellent" && avg >= 4.5)
      reason = "Highly rated for cleanliness";
    else if (r.distanceMin <= 6 && !r.busy)
      reason = "A short walk and reported available";
    else if (r.distanceMin <= 6) reason = "A short walk from your location";
    out.push({ restroom: r, score, reason });
  }
  return out.sort((a, b) => b.score - a.score);
};

export const initials = (n: string) => n.trim().charAt(0).toUpperCase() || "?";
