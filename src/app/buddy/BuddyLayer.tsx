import { useEffect, useRef, useState } from "react";
import {
  Footprints,
  Navigation,
  Send,
  Star,
  X,
} from "lucide-react";
import { useApp } from "../store";
import { fmtAvg, ratingFor } from "../data";
import { SourceBadge } from "../components/ui";
import {
  BuddyMascot,
  BuddyMood,
  ThinkingDots,
} from "./BuddyMascot";
import {
  BuddyProvider,
  BuddyReply,
  BuddySession,
  Chip,
  CompareTable,
  Insight,
  QUICK_ACTIONS,
  ReportItem,
  ResultCard,
  localRuleProvider,
} from "./engine";

interface Msg {
  id: number;
  role: "user" | "bot";
  text: string;
  reply?: BuddyReply;
  error?: string;
}

const WELCOME =
  "หวัดดี! 👀 กำลังหาห้องน้ำอยู่ใช่ไหม บอกมาได้เลย เดี๋ยวช่วยหาให้!";

// ─── Rich reply pieces ──────────────────────────────────────────────────────

function Cards({
  cards,
  act,
}: {
  cards: ResultCard[];
  act: (k: "detail" | "navigate", id: string) => void;
}) {
  const { getRestroom, reviews } = useApp();
  return (
    <div className="mt-2 space-y-2">
      {cards.map((c) => {
        const r = getRestroom(c.restroomId);
        if (!r) return null;
        const { avg, count } = ratingFor(reviews, r.id);
        return (
          <div
            key={c.restroomId}
            className="border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-3 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-black text-hn-ink leading-tight">
                  {r.name}
                </p>
                <p className="text-[11px] font-semibold text-hn-mute">
                  {r.building} · {r.floor}
                </p>
              </div>
              {avg != null && (
                <span className="flex items-center gap-1 text-xs font-black text-hn-ink flex-shrink-0">
                  <Star
                    size={12}
                    className="text-[#E35205] fill-[#E35205]"
                  />
                  {fmtAvg(avg)}
                  <span className="text-hn-mute font-semibold">
                    ({count})
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <SourceBadge r={r} />
              {r.distanceMin != null && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-hn-ink border border-hn-line rounded-full px-2 py-0.5">
                  <Footprints size={10} /> {r.distanceMin} นาที
                  (เดโม)
                </span>
              )}
              {r.facilities.map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-black text-hn-ink border border-hn-line rounded-full px-2 py-0.5"
                >
                  {f}
                </span>
              ))}
            </div>
            {c.reasons.length > 0 && (
              <ul className="mt-2 text-[11px] font-semibold text-hn-mute space-y-0.5 list-disc pl-4">
                {c.reasons.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {c.caution && (
              <p className="mt-2 text-[11px] font-bold text-hn-ink bg-hn-soft border border-dashed border-hn-line rounded-lg px-2 py-1.5">
                ⚠️ {c.caution}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => act("detail", r.id)}
                className="flex-1 min-h-[44px] border-2 border-hn-line rounded-xl bg-[#E35205] text-white text-xs font-black hn-sh-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                ดูรายละเอียด
              </button>
              <button
                type="button"
                onClick={() => act("navigate", r.id)}
                className="flex-1 min-h-[44px] border-2 border-hn-line rounded-xl bg-hn-card text-hn-ink text-xs font-black hn-sh-2 inline-flex items-center justify-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Navigation size={12} /> นำทาง (เดโม)
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Compare({ c }: { c: CompareTable }) {
  const { getRestroom } = useApp();
  const names = c.ids.map((id) => getRestroom(id)?.name ?? "—");
  return (
    <div className="mt-2 border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-3 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-hn-hero text-white">
              <th
                className="text-left p-2 font-black w-[26%]"
                scope="col"
              >
                <span className="sr-only">หัวข้อ</span>
              </th>
              {names.map((n, i) => (
                <th
                  key={i}
                  scope="col"
                  className="text-left p-2 font-black align-bottom"
                >
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row) => (
              <tr
                key={row.label}
                className="border-t border-hn-line/30"
              >
                <th
                  scope="row"
                  className="text-left p-2 font-black text-hn-mute align-top"
                >
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`p-2 align-top font-semibold text-hn-ink ${row.best === i ? "bg-hn-soft font-black" : ""}`}
                  >
                    {row.best === i && (
                      <span className="text-hn-accent">★ </span>
                    )}
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="p-3 border-t-2 border-hn-line space-y-1 text-[11px] font-bold text-hn-ink list-disc pl-7">
        {c.verdicts.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

function InsightView({ i }: { i: Insight }) {
  const { getRestroom } = useApp();
  const r = getRestroom(i.restroomId);
  return (
    <div className="mt-2 border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-3 p-3 text-[11px]">
      <p className="text-sm font-black text-hn-ink">
        {r?.name}
      </p>
      <p className="font-semibold text-hn-mute mt-0.5">
        เฉลี่ย {fmtAvg(i.avg)} จาก {i.count} รีวิว · ภาพรวม
        {i.sentiment} · รีวิวล่าสุด {i.latestAgo}
      </p>
      <p className="font-black text-hn-ink mt-3">
        👍 ข้อดีที่ถูกพูดถึง
      </p>
      <p className="font-semibold text-hn-mute">
        {i.positives.length
          ? i.positives
              .map((p) => `${p.label} (${p.count})`)
              .join(" · ")
          : "ยังจับธีมที่ชัดเจนไม่ได้"}
      </p>
      <p className="font-black text-hn-ink mt-2">
        👎 ข้อที่ถูกบ่น
      </p>
      <p className="font-semibold text-hn-mute">
        {i.complaints.length
          ? i.complaints
              .map((p) => `${p.label} (${p.count})`)
              .join(" · ")
          : "ยังไม่มีรีวิวที่บ่นชัดเจน"}
      </p>
      <p className="font-black text-hn-ink mt-2">
        💬 รีวิวล่าสุดจริง
      </p>
      {i.quotes.map((q) => (
        <p
          key={q.text}
          className="font-semibold text-hn-mute border-l-2 border-[#E35205] pl-2 mt-1"
        >
          “{q.text}”{" "}
          <span className="text-hn-faint">· {q.ago}</span>
        </p>
      ))}
    </div>
  );
}

const KIND_LABEL: Record<ReportItem["kind"], string> = {
  report: "รายงานจากผู้ใช้",
  status: "สถานะในข้อมูล (เดโม)",
  review: "จากรีวิว",
};

function Reports({
  items,
  act,
}: {
  items: ReportItem[];
  act: (k: "detail", id: string) => void;
}) {
  return (
    <div className="mt-2 space-y-2">
      {items.map((x, idx) => (
        <div
          key={idx}
          className="border-2 border-hn-line rounded-xl bg-hn-card hn-sh-2 p-2.5 text-[11px]"
        >
          <span className="text-[9px] font-black uppercase tracking-wider text-hn-mute border border-dashed border-hn-mute rounded-full px-2 py-0.5">
            {KIND_LABEL[x.kind]}
          </span>
          <p className="font-black text-hn-ink mt-1.5">
            {x.title}
          </p>
          {x.detail && (
            <p className="font-semibold text-hn-mute">
              {x.detail}
            </p>
          )}
          {x.ago && (
            <p className="font-bold text-hn-faint mt-0.5">
              ส่งเมื่อ {x.ago}
            </p>
          )}
          {x.restroomId && (
            <button
              type="button"
              onClick={() => act("detail", x.restroomId!)}
              className="mt-1.5 text-hn-accent font-black underline min-h-[32px]"
            >
              เปิดหน้ารายละเอียด
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

function ChipRow({
  chips,
  onPick,
  disabled,
}: {
  chips: Chip[];
  onPick: (t: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(c.send)}
          className="min-h-[36px] px-3 border-2 border-hn-line rounded-full bg-hn-card text-hn-ink text-xs font-black hn-sh-2 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function Panel({
  provider,
  onClose,
}: {
  provider: BuddyProvider;
  onClose: () => void;
}) {
  const { restrooms, reviews, reports, push } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>(() => persisted.msgs);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<BuddyMood>("idle");
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(persisted.msgs.length);
  const ctxRef = useRef({ restrooms, reviews, reports });
  ctxRef.current = { restrooms, reviews, reports };

  useEffect(() => {
    persisted.msgs = msgs;
  }, [msgs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
    });
  }, [msgs, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setMsgs((m) => [
      ...m,
      { id: ++idRef.current, role: "user", text: t },
    ]);
    setBusy(true);
    setMood("thinking");
    try {
      const { reply, session } = await provider.reply(
        t,
        ctxRef.current,
        persisted.session,
      );
      persisted.session = session;
      setMood(reply.mood === "sorry" ? "sorry" : "success");
      setMsgs((m) => [
        ...m,
        {
          id: ++idRef.current,
          role: "bot",
          text: reply.text,
          reply,
        },
      ]);
    } catch {
      setMood("sorry");
      setMsgs((m) => [
        ...m,
        {
          id: ++idRef.current,
          role: "bot",
          text: "ขอโทษนะ ตอนนี้ตอบไม่ได้ ลองใหม่อีกครั้งไหม?",
          error: t,
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const act = (kind: "detail" | "navigate", id: string) => {
    onClose();
    push(
      kind === "detail"
        ? { name: "detail", id }
        : { name: "navigate", id },
    );
  };

  const lastBot = [...msgs]
    .reverse()
    .find((m) => m.role === "bot");
  const started = msgs.length > 1;

  const clear = () => {
    persisted.msgs = [welcomeMsg];
    persisted.session = {};
    idRef.current = 1;
    setMsgs([welcomeMsg]);
    setMood("idle");
  };

  return (
    <div className="absolute inset-0 z-[45] flex flex-col justify-end hn-fade">
      <button
        type="button"
        aria-label="ปิดแชท"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/45 cursor-default"
      />
      <div
        role="dialog"
        aria-label="HongNam AI"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="hn-sheet relative flex flex-col h-[86%] mx-1.5 mb-1.5 border-2 border-hn-line rounded-3xl bg-hn-bg overflow-hidden hn-sh-o6"
      >
        {/* header */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-hn-hero text-white border-b-2 border-hn-line flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border-2 border-white/80 flex items-center justify-center flex-shrink-0">
            <BuddyMascot mood={mood} className="w-9 h-9" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight tracking-tight">
              HongNam AI
              <span className="ml-2 align-middle text-[9px] tracking-widest uppercase bg-[#E35205] rounded-full px-2 py-0.5">
                Demo
              </span>
            </p>
            <p className="text-[11px] font-semibold text-white/70">
              ผู้ช่วยหาห้องน้ำของคุณ
            </p>
          </div>
          {started && (
            <button
              type="button"
              onClick={clear}
              className="text-[11px] font-black text-white/80 underline min-h-[44px] px-1"
            >
              ล้างแชท
            </button>
          )}
          <button
            type="button"
            aria-label="ปิดแชท"
            onClick={onClose}
            className="w-11 h-11 rounded-xl border-2 border-white/70 flex items-center justify-center flex-shrink-0 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* conversation */}
        <div
          ref={scroller}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3 hn-scroll"
          aria-live="polite"
        >
          {msgs.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[82%] bg-[#E35205] text-white text-[13px] font-bold rounded-2xl rounded-br-md border-2 border-hn-line px-3 py-2 leading-relaxed">
                  {m.text}
                </p>
              </div>
            ) : (
              <div
                key={m.id}
                className="flex gap-2 items-start"
              >
                <BuddyMascot
                  mood={
                    m.error
                      ? "sorry"
                      : m.reply?.mood === "sorry"
                        ? "sorry"
                        : "idle"
                  }
                  className="w-8 h-8 flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="inline-block max-w-full bg-hn-card text-hn-ink text-[13px] font-semibold rounded-2xl rounded-tl-md border-2 border-hn-line px-3 py-2 leading-relaxed">
                    {m.text}
                  </p>
                  {m.reply?.cards && (
                    <Cards cards={m.reply.cards} act={act} />
                  )}
                  {m.reply?.compare && (
                    <Compare c={m.reply.compare} />
                  )}
                  {m.reply?.insight && (
                    <InsightView i={m.reply.insight} />
                  )}
                  {m.reply?.reports && (
                    <Reports
                      items={m.reply.reports}
                      act={act}
                    />
                  )}
                  {m.reply?.note && (
                    <p className="text-[10px] font-semibold text-hn-mute mt-1.5 leading-snug">
                      ℹ️ {m.reply.note}
                    </p>
                  )}
                  {m.error && (
                    <button
                      type="button"
                      onClick={() => send(m.error!)}
                      className="mt-2 min-h-[40px] px-4 border-2 border-hn-line rounded-xl bg-hn-card text-hn-ink text-xs font-black hn-sh-2"
                    >
                      ลองอีกครั้ง
                    </button>
                  )}
                  {m.id === lastBot?.id && !busy && (
                    <ChipRow
                      chips={
                        m.reply?.chips ??
                        (m.id === 1 ? QUICK_ACTIONS : [])
                      }
                      onPick={send}
                      disabled={busy}
                    />
                  )}
                </div>
              </div>
            ),
          )}
          {busy && (
            <div
              className="flex gap-2 items-center"
              role="status"
            >
              <BuddyMascot
                mood="thinking"
                className="w-8 h-8 flex-shrink-0"
              />
              <span className="bg-hn-card border-2 border-hn-line rounded-2xl rounded-tl-md px-3 py-2.5">
                <ThinkingDots />
              </span>
            </div>
          )}
        </div>

        {/* quick strip once conversation started */}
        {started && (
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-t border-hn-line/30 flex-shrink-0 hn-scroll">
            {QUICK_ACTIONS.map((c) => (
              <button
                key={c.label}
                type="button"
                disabled={busy}
                onClick={() => send(c.send)}
                className="flex-shrink-0 min-h-[36px] px-3 border-2 border-hn-line rounded-full bg-hn-card text-hn-ink text-[11px] font-black disabled:opacity-50"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 px-3 pt-2 pb-3 border-t-2 border-hn-line bg-hn-nav flex-shrink-0"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            enterKeyHint="send"
            aria-label="พิมพ์ข้อความถึง HongNam AI"
            placeholder="ถามเรื่องห้องน้ำได้เลย..."
            className="flex-1 min-w-0 h-12 px-4 text-sm font-semibold rounded-xl border-2 border-hn-line bg-hn-card text-hn-ink placeholder:text-hn-faint"
          />
          <button
            type="submit"
            aria-label="ส่ง"
            disabled={busy || !input.trim()}
            className="w-12 h-12 flex-shrink-0 rounded-xl border-2 border-hn-line bg-[#E35205] text-white flex items-center justify-center hn-sh-2 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const welcomeMsg: Msg = {
  id: 1,
  role: "bot",
  text: WELCOME,
  reply: { text: WELCOME, mood: "idle" },
};
// Lives for the login session so closing the panel doesn't lose the chat.
const persisted: { msgs: Msg[]; session: BuddySession } = {
  msgs: [welcomeMsg],
  session: {},
};

// ─── Floating button + invitation ───────────────────────────────────────────

const INVITE_KEY = "hongnam.buddyInvited";

export default function BuddyLayer({
  provider = localRuleProvider,
}: {
  provider?: BuddyProvider;
}) {
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);

  useEffect(() => {
    persisted.msgs = [welcomeMsg];
    persisted.session = {};
    try {
      if (sessionStorage.getItem(INVITE_KEY)) return;
      sessionStorage.setItem(INVITE_KEY, "1");
    } catch {
      return;
    }
    const a = setTimeout(() => setInvite(true), 2500);
    const b = setTimeout(() => setInvite(false), 9000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const openChat = () => {
    setInvite(false);
    setOpen(true);
  };

  return (
    <>
      {!open && (
        <div className="absolute right-3 bottom-[88px] z-30 flex items-end gap-2 pointer-events-none">
          {invite && (
            <button
              type="button"
              onClick={openChat}
              className="hn-pop pointer-events-auto mb-2 bg-hn-card text-hn-ink text-xs font-black border-2 border-hn-line rounded-2xl rounded-br-sm px-3 py-2 hn-sh-2"
            >
              มีอะไรให้ช่วยไหม?
            </button>
          )}
          <button
            type="button"
            onClick={openChat}
            aria-label="เปิดแชท HongNam AI"
            className="pointer-events-auto w-14 h-14 rounded-2xl border-2 border-hn-line bg-[#FAF9F6] hn-sh-o3 flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 transition-transform"
          >
            <BuddyMascot className="w-11 h-11" />
          </button>
        </div>
      )}
      {open && (
        <Panel
          provider={provider}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}