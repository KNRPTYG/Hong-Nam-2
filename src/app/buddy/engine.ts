// HongNam Buddy: rule-based demo engine.
// Keyword matching + ranking over the app's shared data. It is NOT a language model.
// To plug in a real AI later, implement `BuddyProvider` (call your own server-side
// endpoint; never ship API keys in client code) and pass it to <BuddyLayer provider=…/>.

import {
  Report,
  Restroom,
  Review,
  fmtAvg,
  ratingFor,
} from "../data";

// ─── Public contract ────────────────────────────────────────────────────────

export interface BuddyContext {
  restrooms: Restroom[];
  reviews: Review[];
  reports: Report[];
}

export interface BuddySession {
  lastRestroomId?: string;
  locationMode?: "demo";
  pending?: { intent: "find"; prefs: Prefs };
}

export interface Chip {
  label: string;
  send: string;
}

export interface ResultCard {
  restroomId: string;
  reasons: string[];
  caution?: string;
}

export interface CompareTable {
  ids: string[];
  rows: { label: string; values: string[]; best?: number }[];
  verdicts: string[];
}

export interface Insight {
  restroomId: string;
  count: number;
  avg: number | null;
  sentiment: string;
  positives: { label: string; count: number }[];
  complaints: { label: string; count: number }[];
  quotes: { text: string; ago: string }[];
  latestAgo: string | null;
}

export interface ReportItem {
  restroomId: string | null;
  kind: "report" | "status" | "review";
  title: string;
  detail?: string;
  ago?: string;
}

export interface BuddyReply {
  text: string;
  mood: "success" | "sorry" | "idle";
  cards?: ResultCard[];
  compare?: CompareTable;
  insight?: Insight;
  reports?: ReportItem[];
  chips?: Chip[];
  note?: string;
}

export interface BuddyProvider {
  reply: (
    input: string,
    ctx: BuddyContext,
    session: BuddySession,
  ) => Promise<{ reply: BuddyReply; session: BuddySession }>;
}

export const QUICK_ACTIONS: Chip[] = [
  { label: "หาห้องน้ำใกล้ฉัน", send: "หาห้องน้ำใกล้ฉัน" },
  { label: "หาห้องน้ำที่สะอาด", send: "หาห้องน้ำที่สะอาด" },
  { label: "ขอห้องน้ำที่มีสายฉีดชำระ", send: "ขอห้องน้ำที่มีสายฉีดชำระ" },
  { label: "เปรียบเทียบห้องน้ำ", send: "เปรียบเทียบห้องน้ำ" },
  { label: "สรุปรีวิวห้องน้ำ", send: "สรุปรีวิวห้องน้ำ" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

interface Prefs {
  clean: boolean;
  near: boolean;
  hurry: boolean;
  facilities: string[];
  building?: string;
}

const thaiAgo = (ts: number) => {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.round(h / 24)} วันที่แล้ว`;
};

const label = (r: Restroom) => `${r.name} (${r.floor})`;

const BUILDING_ALIASES: Record<string, string> = {
  วิทยาศาสตร์: "science",
  วิทย์: "science",
  ซีมิท: "cmit",
  ห้องสมุด: "library",
  วิศวะ: "engineering",
  วิศวกรรม: "engineering",
};

const FACILITY_WORDS: [RegExp, string][] = [
  [/สายฉีด|bidet|ชำระ/i, "Bidet"],
  [/แอร์|เย็น|\bac\b/i, "AC"],
  [/เงียบ|สงบ|quiet/i, "Quiet"],
  [/พรีเมียม|premium|หรู/i, "Premium"],
  [/กว้าง|ใหญ่|large/i, "Large"],
  [/วีลแชร์|ผู้พิการ|accessible|ทางลาด/i, "Accessible"],
  [/ผ้าอ้อม|baby/i, "Baby changing"],
];

const has = (t: string, re: RegExp) => re.test(t);

const GENERIC = new Set(["the", "building", "tower", "floor", "new"]);

function mentioned(t: string, restrooms: Restroom[]): Restroom[] {
  const low = t.toLowerCase();
  const aliasHits = Object.entries(BUILDING_ALIASES)
    .filter(([k]) => low.includes(k))
    .map(([, v]) => v);
  return restrooms.filter((r) => {
    const name = r.name.toLowerCase();
    const bld = r.building.toLowerCase();
    const firstWord = (bld.split(/\s+/)[0] || "").trim();
    const keyWord = firstWord.length >= 3 && !GENERIC.has(firstWord) ? firstWord : "";
    return (
      low.includes(name) ||
      low.includes(bld) ||
      (keyWord !== "" && low.includes(keyWord)) ||
      aliasHits.some((a) => bld.includes(a) || name.includes(a))
    );
  });
}

const restroomChips = (restrooms: Restroom[], prefix: string): Chip[] =>
  restrooms.slice(0, 6).map((r) => ({
    label: `${r.name} · ${r.floor}`,
    send: `${prefix} ${r.name} ${r.floor}`,
  }));

const buildingChips = (restrooms: Restroom[]): Chip[] => {
  const seen = new Set<string>();
  const out: Chip[] = [];
  for (const r of restrooms) {
    if (seen.has(r.building)) continue;
    seen.add(r.building);
    out.push({ label: r.building, send: `หาห้องน้ำใกล้ ${r.building}` });
  }
  return out.slice(0, 6);
};

const CLEAN_VAL: Record<string, number> = { Excellent: 1, Good: 0.65, Fair: 0.35 };

function pickTarget(
  t: string,
  ctx: BuddyContext,
  session: BuddySession,
): { target?: Restroom; ambiguous?: Restroom[] } {
  const m = mentioned(t, ctx.restrooms);
  // exact name+floor mention wins
  const exact = m.filter((r) => t.toLowerCase().includes(r.floor.toLowerCase()));
  const pool = exact.length ? exact : m;
  if (pool.length === 1) return { target: pool[0] };
  if (pool.length > 1) return { ambiguous: pool };
  const last = ctx.restrooms.find((r) => r.id === session.lastRestroomId);
  if (last) return { target: last };
  return {};
}

// ─── Finder / recommendation ────────────────────────────────────────────────

function rank(restrooms: Restroom[], reviews: Review[], reports: Report[], p: Prefs) {
  const weights = p.hurry
    ? { near: 0.45, free: 0.25, clean: 0.15, rate: 0.15 }
    : p.near && p.clean
      ? { near: 0.35, free: 0.05, clean: 0.35, rate: 0.25 }
      : p.near
        ? { near: 0.6, free: 0.1, clean: 0.1, rate: 0.2 }
        : p.clean
          ? { near: 0.1, free: 0.05, clean: 0.5, rate: 0.35 }
          : { near: 0.3, free: 0.1, clean: 0.25, rate: 0.35 };

  return restrooms
    .map((r) => {
      const { avg, count } = ratingFor(reviews, r.id);
      const parts: { w: number; v: number }[] = [];
      if (r.distanceMin != null)
        parts.push({ w: weights.near, v: 1 - Math.min(r.distanceMin, 15) / 15 });
      if (r.busy != null) parts.push({ w: weights.free, v: r.busy ? 0 : 1 });
      if (r.cleanliness) parts.push({ w: weights.clean, v: CLEAN_VAL[r.cleanliness] });
      if (avg != null) parts.push({ w: weights.rate, v: avg / 5 });
      const wsum = parts.reduce((s, x) => s + x.w, 0);
      let score = wsum ? parts.reduce((s, x) => s + x.w * x.v, 0) / wsum : 0;
      // thin evidence shouldn't outrank well-supported options
      if (wsum < 0.5) score *= 0.6;

      const reasons: string[] = [];
      if (r.distanceMin != null) reasons.push(`เดินประมาณ ${r.distanceMin} นาที (ค่าประมาณเดโม)`);
      else if (p.near) reasons.push("ยังไม่มีข้อมูลระยะทาง");
      if (avg != null) reasons.push(`รีวิวเฉลี่ย ${fmtAvg(avg)} จาก ${count} รีวิว`);
      else reasons.push("ยังไม่มีรีวิว");
      if (r.cleanliness && p.clean) reasons.push(`ความสะอาดที่ระบุไว้: ${r.cleanliness}`);
      if (p.facilities.length) reasons.push(`มี ${p.facilities.join(", ")} ครบ`);

      const recent = reports
        .filter((x) => x.restroomId === r.id && Date.now() - x.createdAt < 24 * 3600_000)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      let caution: string | undefined;
      if (recent)
        caution = `มีรายงานจากผู้ใช้ "${recent.kind}" เมื่อ ${thaiAgo(recent.createdAt)} (ไม่ใช่สถานะสด)`;
      else if (r.busy === true)
        caution = "รายงานล่าสุดในข้อมูลเดโมคือ ไม่ค่อยว่าง (ไม่ใช่สถานะสด)";
      if (recent || r.busy === true) score -= 0.05;
      return { r, score, reasons, caution };
    })
    .sort((a, b) => b.score - a.score);
}

function parsePrefs(t: string, ctx: BuddyContext): Prefs {
  const facilities = FACILITY_WORDS.filter(([re]) => has(t, re)).map(([, f]) => f);
  const near = has(t, /ใกล้|เดินไม่ไกล|เดินไปได้|เร็ว|รีบ|near|close|fast|quick/i);
  const hurry = has(t, /รีบ|ด่วน|ปวด|เร็ว|urgent|hurry/i);
  const clean = has(t, /สะอาด|clean|สะอาดๆ/i);
  const m = mentioned(t, ctx.restrooms);
  const building = m.length ? m[0].building : undefined;
  return { clean, near, hurry, facilities, building };
}

function find(
  t: string,
  ctx: BuddyContext,
  session: BuddySession,
  forced?: Prefs,
): { reply: BuddyReply; session: BuddySession } {
  const prefs = forced ?? parsePrefs(t, ctx);
  const wantsNearMe =
    has(t, /ใกล้ฉัน|ใกล้ตัว|แถวนี้|near me|nearby/i) || (prefs.hurry && !prefs.building);
  const usesDemoLoc = has(t, /ตำแหน่งตัวอย่าง|ตำแหน่งเดโม|demo/i);
  const locationMode = usesDemoLoc ? "demo" : session.locationMode;

  if (!ctx.restrooms.length)
    return {
      reply: {
        text: "ตอนนี้ยังไม่มีห้องน้ำในระบบเลย ลองเพิ่มห้องน้ำก่อนนะ",
        mood: "sorry",
      },
      session,
    };

  // "near me" with no anchor: ask, don't pretend to know where the user is.
  if (wantsNearMe && !prefs.building && locationMode !== "demo") {
    return {
      reply: {
        text: "ได้เลย! 👀 เดี๋ยวช่วยเลือกให้ แต่เดโมนี้ยังอ่านตำแหน่ง GPS จริงไม่ได้ เลือกอาคารที่อยู่ตอนนี้ หรือใช้ตำแหน่งตัวอย่างก่อนก็ได้นะ",
        mood: "idle",
        chips: [
          { label: "ใช้ตำแหน่งตัวอย่าง (เดโม)", send: "ใช้ตำแหน่งตัวอย่าง" },
          ...buildingChips(ctx.restrooms),
        ],
        note: "ระยะเดินในแอปเป็นค่าประมาณเดโมจากจุดตัวอย่าง ไม่ใช่ GPS จริง",
      },
      session: { ...session, pending: { intent: "find", prefs } },
    };
  }

  let pool = ctx.restrooms;
  let scope = "";
  if (prefs.building) {
    pool = pool.filter((r) => r.building === prefs.building);
    scope = `ใน ${prefs.building}`;
    if (!pool.length)
      return {
        reply: {
          text: `ยังไม่เจอห้องน้ำ${scope}ในข้อมูล ลองเปลี่ยนอาคารดูไหม?`,
          mood: "sorry",
          chips: buildingChips(ctx.restrooms),
        },
        session,
      };
  }
  if (prefs.facilities.length) {
    pool = pool.filter((r) => prefs.facilities.every((f) => r.facilities.includes(f)));
    if (!pool.length)
      return {
        reply: {
          text: `ยังไม่เจอห้องน้ำที่มี ${prefs.facilities.join(" + ")} ${scope}ในข้อมูลตอนนี้ ลองเปลี่ยนอาคารหรือปรับตัวเลือกดูไหม? ถ้ารู้ว่ามีที่ไหน เพิ่มห้องน้ำให้ HongNam ได้ที่เมนู Map → Add ✨`,
          mood: "sorry",
          chips: [
            { label: "หาห้องน้ำที่สะอาด", send: "หาห้องน้ำที่สะอาด" },
            { label: "หาห้องน้ำใกล้ฉัน", send: "หาห้องน้ำใกล้ฉัน" },
          ],
        },
        session,
      };
  }

  const ranked = rank(pool, ctx.reviews, ctx.reports, prefs).slice(0, 3);
  const how = [
    prefs.hurry && "ความเร็วในการเดินถึง",
    prefs.near && !prefs.hurry && "ระยะเดิน",
    prefs.clean && "ความสะอาด/รีวิว",
    prefs.facilities.length && "สิ่งอำนวยความสะดวกที่ขอ",
  ].filter(Boolean) as string[];
  const basis = how.length ? how.join(" + ") : "ระยะเดิน รีวิว และความสะอาดรวมกัน";

  const best = ranked[0];
  return {
    reply: {
      text: `เจอแล้ว! ${scope ? scope + " " : ""}เลือกจาก${basis}ให้ ${ranked.length} ที่ อันดับแรกคือ ${label(best.r)} 👇`,
      mood: "success",
      cards: ranked.map((x) => ({
        restroomId: x.r.id,
        reasons: x.reasons,
        caution: x.caution,
      })),
      note:
        locationMode === "demo"
          ? "ใช้ตำแหน่งตัวอย่างของเดโม ระยะเดินเป็นค่าประมาณ ไม่ใช่ GPS จริง"
          : "ข้อมูลทั้งหมดเป็นข้อมูลเดโม/ที่บันทึกในเบราว์เซอร์นี้ ไม่ใช่สถานะสด",
      chips: [
        { label: "เปรียบเทียบผลลัพธ์", send: "เปรียบเทียบห้องน้ำ" },
        { label: "สรุปรีวิวอันดับแรก", send: `สรุปรีวิว ${best.r.name} ${best.r.floor}` },
      ],
    },
    session: { ...session, locationMode, lastRestroomId: best.r.id, pending: undefined },
  };
}

// ─── Review insight ─────────────────────────────────────────────────────────

const POS: [string, RegExp][] = [
  ["สะอาด", /clean|spotless|สะอาด/i],
  ["เงียบ/สงบ", /quiet|calm|เงียบ|สงบ/i],
  ["แอร์เย็น", /\bac\b|cold|แอร์|เย็น/i],
  ["กว้าง/สว่าง", /big|bright|large|plenty|กว้าง|สว่าง/i],
  ["ของใช้พร้อม", /stocked|ของครบ/i],
  ["ประทับใจโดยรวม", /best|recommend|10\/10|go-to|reliable|nice|great|ดีมาก/i],
];
const NEG: [string, RegExp][] = [
  ["คนเยอะ/ต้องต่อคิว", /crowd|queue|busy|คนเยอะ|แออัด|ต่อคิว/i],
  ["แสงสว่างไม่พอ", /lighting|dark|มืด/i],
  ["ไม่สะอาด/มีกลิ่น", /dirty|smell|สกปรก|เหม็น/i],
  ["ชำรุด/มีของเสีย", /broken|leak|เสีย|รั่ว/i],
];

function themeCounts(list: Review[], table: [string, RegExp][]) {
  return table
    .map(([l, re]) => ({ label: l, count: list.filter((r) => re.test(r.text)).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

function insight(r: Restroom, ctx: BuddyContext): BuddyReply | null {
  const list = ctx.reviews
    .filter((x) => x.restroomId === r.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const { avg, count } = ratingFor(ctx.reviews, r.id);
  if (count < 2) return null;
  const positives = themeCounts(list, POS);
  const complaints = themeCounts(list, NEG);
  const sentiment =
    avg! >= 4.2 ? "โดยรวมเป็นบวก" : avg! >= 3.4 ? "ค่อนข้างผสม" : "ออกไปทางลบ";
  return {
    text: `สรุปรีวิว ${label(r)} จาก ${count} รีวิวที่มีอยู่จริงในแอป (สรุปด้วยคีย์เวิร์ด ไม่ใช่โมเดล AI) 👇`,
    mood: "success",
    insight: {
      restroomId: r.id,
      count,
      avg,
      sentiment,
      positives,
      complaints,
      quotes: list.slice(0, 2).map((x) => ({ text: x.text, ago: thaiAgo(x.createdAt) })),
      latestAgo: thaiAgo(list[0].createdAt),
    },
    chips: [
      { label: "ดูรายงานล่าสุด", send: `รายงานล่าสุด ${r.name} ${r.floor}` },
      { label: "เปรียบเทียบ", send: `เปรียบเทียบ ${r.name} ${r.floor}` },
    ],
  };
}

// ─── Comparison ─────────────────────────────────────────────────────────────

function compare(
  t: string,
  ctx: BuddyContext,
  session: BuddySession,
): { reply: BuddyReply; session: BuddySession } {
  if (ctx.restrooms.length < 2)
    return {
      reply: { text: "ต้องมีห้องน้ำอย่างน้อย 2 ที่ถึงจะเปรียบเทียบได้ ลองเพิ่มห้องน้ำก่อนนะ", mood: "sorry" },
      session,
    };
  const prefs = parsePrefs(t, ctx);
  const named = mentioned(t, ctx.restrooms).slice(0, 3);
  const order = rank(ctx.restrooms, ctx.reviews, ctx.reports, prefs).map((x) => x.r);
  let picks = named;
  let auto = false;
  if (picks.length < 2) {
    auto = true;
    picks = [...named, ...order.filter((r) => !named.includes(r))].slice(0, 3);
  }

  const rt = picks.map((r) => ratingFor(ctx.reviews, r.id));
  const lastReport = (r: Restroom) =>
    ctx.reports
      .filter((x) => x.restroomId === r.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

  const bestIdx = (vals: (number | null)[], low = false) => {
    let b = -1;
    vals.forEach((v, i) => {
      if (v == null) return;
      if (b < 0 || (low ? v < vals[b]! : v > vals[b]!)) b = i;
    });
    // tie => no highlight
    return b >= 0 && vals.filter((v) => v === vals[b]).length === 1 ? b : undefined;
  };

  const rows: CompareTable["rows"] = [
    {
      label: "ระยะเดิน (เดโม)",
      values: picks.map((r) => (r.distanceMin != null ? `${r.distanceMin} นาที` : "ไม่มีข้อมูล")),
      best: bestIdx(picks.map((r) => r.distanceMin), true),
    },
    {
      label: "คะแนนรีวิว",
      values: picks.map((_, i) =>
        rt[i].avg != null ? `${fmtAvg(rt[i].avg)} (${rt[i].count})` : "ยังไม่มีรีวิว",
      ),
      best: bestIdx(rt.map((x) => x.avg)),
    },
    {
      label: "ความสะอาด",
      values: picks.map((r) => r.cleanliness ?? "ไม่มีข้อมูล"),
      best: bestIdx(picks.map((r) => (r.cleanliness ? CLEAN_VAL[r.cleanliness] : null))),
    },
    {
      label: "สิ่งอำนวยความสะดวก",
      values: picks.map((r) => (r.facilities.length ? r.facilities.join(", ") : "ไม่ระบุ")),
    },
    {
      label: "สถานะล่าสุด",
      values: picks.map((r) =>
        r.busy == null ? "ไม่มีข้อมูล" : r.busy ? "ไม่ค่อยว่าง" : "ว่าง",
      ),
    },
    {
      label: "รายงานผู้ใช้ล่าสุด",
      values: picks.map((r) => {
        const x = lastReport(r);
        return x ? `${x.kind} · ${thaiAgo(x.createdAt)}` : "ยังไม่มี";
      }),
    },
  ];

  const verdicts: string[] = [];
  const nearI = rows[0].best;
  const rateI = rows[1].best;
  const cleanI = rows[2].best;
  if (nearI != null) verdicts.push(`ถ้ารีบ: ${picks[nearI].name} เดินสั้นสุด`);
  if (rateI != null) verdicts.push(`ถ้าเน้นรีวิวดี: ${picks[rateI].name} คะแนนสูงสุด`);
  if (cleanI != null) verdicts.push(`ถ้าเน้นสะอาด: ${picks[cleanI].name} ระบุว่า ${picks[cleanI].cleanliness}`);
  const fac = prefs.facilities.length
    ? picks.filter((r) => prefs.facilities.every((f) => r.facilities.includes(f)))
    : [];
  if (prefs.facilities.length)
    verdicts.push(
      fac.length
        ? `มี ${prefs.facilities.join("+")} ครบ: ${fac.map((r) => r.name).join(", ")}`
        : `ไม่มีที่ไหนในสามที่นี้ที่มี ${prefs.facilities.join("+")} ครบ`,
    );
  if (!verdicts.length) verdicts.push("ข้อมูลยังเท่ากันหรือไม่พอที่จะชี้ว่าที่ไหนดีกว่า");

  const pri = prefs.hurry || prefs.near ? "ความเร็ว" : prefs.clean ? "ความสะอาด" : null;
  const lead = order.find((r) => picks.includes(r)) ?? picks[0];
  return {
    reply: {
      text: `${auto ? "ยังไม่ได้ระบุชื่อ เลยหยิบ " + picks.length + " ที่คะแนนรวมสูงสุดมาเทียบให้ (บอกชื่อได้ถ้าอยากเทียบที่อื่น) " : ""}ตารางเทียบมาแล้ว${pri ? ` โดยให้น้ำหนัก${pri}` : ""} ผมเอนไปทาง ${label(lead)} แต่ดูข้อแลกเปลี่ยนด้านล่างด้วยนะ 👇`,
      mood: "success",
      compare: { ids: picks.map((r) => r.id), rows, verdicts },
      note: "ข้อมูลเดโมและรีวิวที่บันทึกในแอป ไม่ใช่ข้อมูลสด",
      chips: [
        { label: "เน้นสะอาด", send: `เปรียบเทียบ ${picks.map((r) => r.name).join(" ")} เน้นสะอาด` },
        { label: "เน้นรีบ", send: `เปรียบเทียบ ${picks.map((r) => r.name).join(" ")} รีบ` },
      ],
    },
    session: { ...session, lastRestroomId: lead.id },
  };
}

// ─── Reports ────────────────────────────────────────────────────────────────

function reportsFor(
  t: string,
  ctx: BuddyContext,
  session: BuddySession,
): { reply: BuddyReply; session: BuddySession } {
  const crowd = has(t, /คนเยอะ|แออัด|ต่อคิว|เยอะ|crowd|busy|queue/i);
  const { target, ambiguous } = pickTarget(t, ctx, session);
  const disclaimer =
    "รายงานเป็นข้อความที่ผู้ใช้ส่งเข้ามาในแอปนี้ ไม่ใช่สถานะสดที่ตรวจสอบแล้ว";

  if (crowd && !mentioned(t, ctx.restrooms).length) {
    const items: ReportItem[] = [];
    for (const r of ctx.restrooms) {
      if (r.busy === true)
        items.push({
          restroomId: r.id,
          kind: "status",
          title: `${label(r)}: สถานะล่าสุดในข้อมูลคือ ไม่ค่อยว่าง`,
          detail: "ค่าเดโม ไม่มีเวลาที่รายงาน",
        });
      const n = ctx.reviews.filter(
        (x) => x.restroomId === r.id && NEG[0][1].test(x.text),
      );
      if (n.length) {
        const latest = n.sort((a, b) => b.createdAt - a.createdAt)[0];
        items.push({
          restroomId: r.id,
          kind: "review",
          title: `${label(r)}: ${n.length} รีวิวพูดถึงคนเยอะ`,
          detail: `ล่าสุด ${thaiAgo(latest.createdAt)}`,
        });
      }
    }
    if (!items.length)
      return {
        reply: {
          text: "ตอนนี้ยังไม่มีรายงานหรือรีวิวที่บอกว่าคนเยอะในข้อมูลเลย แต่ก็ไม่ได้แปลว่าว่างจริงนะ เพราะไม่มีข้อมูลสด",
          mood: "idle",
        },
        session,
      };
    return {
      reply: {
        text: "เท่าที่มีในข้อมูล ที่ถูกพูดถึงว่าคนเยอะมีตามนี้ 👇",
        mood: "success",
        reports: items,
        note: disclaimer,
      },
      session,
    };
  }

  if (ambiguous)
    return {
      reply: {
        text: "หมายถึงห้องน้ำไหนดี? เลือกได้เลย",
        mood: "idle",
        chips: restroomChips(ambiguous, "รายงานล่าสุด"),
      },
      session,
    };
  if (!target)
    return {
      reply: {
        text: "อยากดูรายงานของห้องน้ำไหน? เลือกได้เลย",
        mood: "idle",
        chips: restroomChips(ctx.restrooms, "รายงานล่าสุด"),
      },
      session,
    };

  const list = ctx.reports
    .filter((x) => x.restroomId === target.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  if (!list.length)
    return {
      reply: {
        text: `ยังไม่มีรายงานจากผู้ใช้เกี่ยวกับ ${label(target)} ในแอปนี้ ถ้าเจออะไรผิดปกติ กด Report Info ในหน้ารายละเอียดได้เลย`,
        mood: "idle",
        cards: [{ restroomId: target.id, reasons: [] }],
        note: disclaimer,
      },
      session: { ...session, lastRestroomId: target.id },
    };
  return {
    reply: {
      text: `${label(target)} มี ${list.length} รายงานจากผู้ใช้ ล่าสุดเมื่อ ${thaiAgo(list[0].createdAt)} 👇`,
      mood: "success",
      reports: list.slice(0, 4).map((x) => ({
        restroomId: target.id,
        kind: "report" as const,
        title: x.kind,
        detail: x.details || undefined,
        ago: thaiAgo(x.createdAt),
      })),
      note: disclaimer,
    },
    session: { ...session, lastRestroomId: target.id },
  };
}

// ─── Router ─────────────────────────────────────────────────────────────────

export function respond(
  raw: string,
  ctx: BuddyContext,
  session: BuddySession,
): { reply: BuddyReply; session: BuddySession } {
  const t = raw.trim();

  // follow-up to "where are you?" prompt
  if (session.pending && has(t, /ตำแหน่งตัวอย่าง|demo/i))
    return find(t, ctx, { ...session, locationMode: "demo" }, session.pending.prefs);

  if (has(t, /^(หวัดดี|สวัสดี|hi|hello|ดีจ้า|ดี)/i) && t.length < 14)
    return {
      reply: {
        text: "หวัดดี! 👀 กำลังหาห้องน้ำอยู่ใช่ไหม บอกมาได้เลย เดี๋ยวช่วยหาให้!",
        mood: "idle",
        chips: QUICK_ACTIONS,
      },
      session,
    };

  if (has(t, /เปรียบเทียบ|เทียบ|compare|\bvs\b/i)) return compare(t, ctx, session);

  if (has(t, /รายงาน|report|คนเยอะ|แออัด/i)) return reportsFor(t, ctx, session);

  if (has(t, /รีวิว|สรุป|บ่น|ข้อดี|ข้อเสีย|review|complain/i)) {
    const { target, ambiguous } = pickTarget(t, ctx, session);
    if (ambiguous)
      return {
        reply: { text: "หมายถึงห้องน้ำไหนดี?", mood: "idle", chips: restroomChips(ambiguous, "สรุปรีวิว") },
        session,
      };
    if (!target)
      return {
        reply: {
          text: "อยากให้สรุปรีวิวของห้องน้ำไหน? เลือกได้เลย",
          mood: "idle",
          chips: restroomChips(ctx.restrooms, "สรุปรีวิว"),
        },
        session,
      };
    const rep = insight(target, ctx);
    if (!rep) {
      const { count } = ratingFor(ctx.reviews, target.id);
      return {
        reply: {
          text: `${label(target)} มี ${count} รีวิวเท่านั้น ยังไม่พอสำหรับสรุปที่เชื่อถือได้ ถ้าเคยใช้ มาเขียนรีวิวให้หน่อยนะ ✍️`,
          mood: "sorry",
          cards: [{ restroomId: target.id, reasons: [] }],
          chips: [{ label: "เลือกห้องน้ำอื่น", send: "สรุปรีวิวห้องน้ำ" }],
        },
        session: { ...session, lastRestroomId: target.id },
      };
    }
    return { reply: rep, session: { ...session, lastRestroomId: target.id } };
  }

  if (has(t, /นำทาง|พาไป|ไปยังไง|เส้นทาง|navigate|direction/i)) {
    const { target, ambiguous } = pickTarget(t, ctx, session);
    if (ambiguous || !target)
      return {
        reply: {
          text: "จะให้พาไปห้องน้ำไหนดี?",
          mood: "idle",
          chips: restroomChips(ambiguous ?? ctx.restrooms, "นำทางไป"),
        },
        session,
      };
    return {
      reply: {
        text: `ได้เลย! กดปุ่มด้านล่างเพื่อเปิดหน้านำทางของ ${label(target)} ได้ แต่อย่าลืมนะ หน้านี้เป็นการจำลอง (เดโม) ไม่ใช่ GPS นำทางจริง 🧭`,
        mood: "success",
        cards: [{ restroomId: target.id, reasons: [] }],
      },
      session: { ...session, lastRestroomId: target.id },
    };
  }

  const prefs = parsePrefs(t, ctx);
  const looksLikeFind =
    has(t, /หา|ขอ|ห้องน้ำ|ที่ไหน|ใกล้|สะอาด|รีบ|ปวด|แนะนำ|toilet|restroom|find|where/i) ||
    prefs.building ||
    prefs.facilities.length;
  if (looksLikeFind) return find(t, ctx, session);

  return {
    reply: {
      text: "อันนี้ผมยังตอบไม่ได้ ผมถนัดเรื่องห้องน้ำใน HongNam ลองถามแบบนี้ดูไหม? 😅",
      mood: "sorry",
      chips: QUICK_ACTIONS,
    },
    session,
  };
}

// ─── n8n AI Provider ────────────────────────────────────────────────────────

export const n8nBuddyProvider: BuddyProvider = {
  async reply(input, ctx, session) {
    try {
      const response = await fetch("https://nrptyg.app.n8n.cloud/webhook/f24eed2b-3f29-4fc3-972a-f5738b1aeb43", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`n8n error status: ${response.status}`);
      }

      const data = await response.json();

      return {
        reply: {
          text: data.text || "ขออภัยครับ ไม่ได้รับข้อความตอบกลับจาก AI",
          mood: "success",
          chips: QUICK_ACTIONS,
        },
        session,
      };
    } catch (error) {
      console.error("n8n Connection Error:", error);
      // หากเกิดปัญหาการเชื่อมต่อ ให้สลับกลับไปใช้ระบบค้นหาอัตโนมัติเดิม (Rule-based) เพื่อไม่ให้แอปค้าง
      return respond(input, ctx, session);
    }
  },
};

// กำหนดให้ระบบเรียกใช้ n8nBuddyProvider เป็นค่าเริ่มต้น
export const localRuleProvider: BuddyProvider = n8nBuddyProvider;