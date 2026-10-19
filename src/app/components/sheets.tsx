import { useState } from "react";
import { Check, Search } from "lucide-react";
import { useApp } from "../store";
import { REPORT_KINDS, ratingFor, fmtAvg, matchesQuery } from "../data";
import { MascotHappy } from "./Mascots";
import {
  Btn,
  Chip,
  Field,
  Modal,
  SheetHeader,
  StarInput,
  inputCls,
} from "./ui";

// ─── Confirm ────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} center>
      <h2 className="text-xl font-black tracking-tight text-hn-ink">{title}</h2>
      <p className="text-sm font-semibold text-hn-mute mt-2 mb-5">{body}</p>
      <div className="flex gap-3">
        <Btn variant="light" className="flex-1" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          variant={danger ? "danger" : "primary"}
          className="flex-1"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Restroom picker (searchable) ───────────────────────────────────────────

export function RestroomPicker({
  selectedId,
  onPick,
  onClose,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const { restrooms, reviews } = useApp();
  const [q, setQ] = useState("");
  const list = restrooms.filter((r) => matchesQuery(r, q));
  return (
    <Modal title="Choose a restroom" onClose={onClose}>
      <SheetHeader title="Choose restroom" onClose={onClose} />
      <div className="flex items-center gap-3 px-4 border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-3 mb-4 focus-within:ring-2 focus-within:ring-hn-accent">
        <Search size={15} className="text-hn-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search restrooms"
          aria-label="Search restrooms"
          className="flex-1 py-3 bg-transparent text-sm font-semibold text-hn-ink outline-none placeholder:text-hn-mute"
        />
      </div>
      <div className="flex flex-col gap-2.5">
        {list.map((r) => {
          const { avg, count } = ratingFor(reviews, r.id);
          const on = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              aria-pressed={on}
              className={`text-left border-2 border-hn-line rounded-2xl p-3 flex items-center gap-3 ${on ? "bg-[#E35205]/15" : "bg-hn-card"}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-hn-ink truncate">{r.name}</p>
                <p className="text-xs font-semibold text-hn-mute">
                  {r.floor} · {fmtAvg(avg)}★ · {count} review{count === 1 ? "" : "s"}
                </p>
              </div>
              {on && <Check size={16} className="text-hn-accent" />}
            </button>
          );
        })}
        {!list.length && (
          <p className="text-sm font-semibold text-hn-mute text-center py-6">
            No restrooms match "{q}".
          </p>
        )}
      </div>
    </Modal>
  );
}

// ─── Write review ───────────────────────────────────────────────────────────

export function WriteReviewSheet({
  initialId,
  onClose,
  onPosted,
}: {
  initialId: string | null;
  onClose: () => void;
  onPosted: (restroomId: string) => void;
}) {
  const { restrooms, addReview, showToast } = useApp();
  const [rid, setRid] = useState(initialId ?? restrooms[0]?.id ?? "");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (busy) return;
    const e: typeof errors = {};
    if (!rating) e.rating = "Tap a star rating first.";
    if (!text.trim()) e.text = "Tell others a little about your visit.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => {
      addReview(rid, rating, text);
      setBusy(false);
      setDone(true);
      onPosted(rid);
      showToast("Review posted");
    }, 500);
  };

  if (done)
    return (
      <Modal title="Review posted" onClose={onClose}>
        <div className="text-center py-2 hn-pop">
          <div className="w-24 mx-auto mb-3">
            <MascotHappy className="w-full h-auto" />
          </div>
          <h2 className="text-xl font-black text-hn-ink">Thanks, legend!</h2>
          <p className="text-sm font-semibold text-hn-mute mt-1 mb-5">
            Your review is live and the rating has been updated.
          </p>
          <Btn className="w-full" onClick={onClose}>
            See my review
          </Btn>
        </div>
      </Modal>
    );

  return (
    <Modal title="Write a review" onClose={onClose}>
      <SheetHeader title="Rate your visit" onClose={onClose} />
      <div className="flex flex-col gap-3">
        <Field id="rv-restroom" label="Restroom">
          <select
            id="rv-restroom"
            value={rid}
            onChange={(e) => setRid(e.target.value)}
            className={`${inputCls} bg-hn-card`}
          >
            {restrooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.floor}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mb-2 px-1">
            Your rating
          </p>
          <StarInput
            value={rating}
            onChange={(n) => {
              setRating(n);
              setErrors((e) => ({ ...e, rating: undefined }));
            }}
          />
          {errors.rating && (
            <p role="alert" className="text-xs font-bold text-hn-bad mt-1.5 px-1">
              {errors.rating}
            </p>
          )}
        </div>

        <Field id="rv-text" label="Comment" error={errors.text}>
          <textarea
            id="rv-text"
            rows={4}
            value={text}
            maxLength={400}
            onChange={(e) => setText(e.target.value)}
            placeholder="Clean? Stocked? Crowded? Tell fellow students."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="flex gap-3 mt-1">
          <Btn
            variant="light"
            className="flex-1"
            onClick={() => {
              setRating(0);
              setText("");
              setErrors({});
            }}
          >
            Clear
          </Btn>
          <Btn className="flex-[2]" onClick={submit} disabled={busy}>
            {busy ? "Posting…" : "Submit Review"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Report information ─────────────────────────────────────────────────────

export function ReportSheet({
  restroomId,
  onClose,
}: {
  restroomId: string | null;
  onClose: () => void;
}) {
  const { restrooms, addReport, showToast } = useApp();
  const [rid, setRid] = useState(restroomId ?? "");
  const [kind, setKind] = useState(REPORT_KINDS[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (busy) return;
    if (!details.trim()) {
      setError("Please describe what looks wrong.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      addReport({
        restroomId: rid || null,
        kind,
        details: details.trim(),
      });
      setBusy(false);
      setDone(true);
      showToast("Report saved on this device");
    }, 500);
  };

  if (done)
    return (
      <Modal title="Report sent" onClose={onClose}>
        <div className="text-center py-2 hn-pop">
          <div className="w-24 mx-auto mb-3">
            <MascotHappy className="w-full h-auto" />
          </div>
          <h2 className="text-xl font-black text-hn-ink">Report noted</h2>
          <p className="text-sm font-semibold text-hn-mute mt-1 mb-5">
            Saved in this browser only. This prototype has no backend, so no
            one else receives it.
          </p>
          <Btn className="w-full" onClick={onClose}>
            Done
          </Btn>
        </div>
      </Modal>
    );

  return (
    <Modal title="Report information" onClose={onClose}>
      <SheetHeader title="Report info" onClose={onClose} />
      <div className="flex flex-col gap-3">
        {!restroomId && (
          <Field id="rp-restroom" label="Restroom" optional>
            <select
              id="rp-restroom"
              value={rid}
              onChange={(e) => setRid(e.target.value)}
              className={`${inputCls} bg-hn-card`}
            >
              <option value="">General / not about one restroom</option>
              {restrooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.floor}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mb-2 px-1">
            What's wrong?
          </p>
          <div className="flex flex-wrap gap-2">
            {REPORT_KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                {k}
              </Chip>
            ))}
          </div>
        </div>
        <Field id="rp-details" label="Details" error={error}>
          <textarea
            id="rp-details"
            rows={4}
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setError("");
            }}
            placeholder="What should be corrected?"
            className={`${inputCls} resize-none`}
          />
        </Field>
        <Btn onClick={submit} disabled={busy} className="w-full mt-1">
          {busy ? "Sending…" : "Send report"}
        </Btn>
      </div>
    </Modal>
  );
}
