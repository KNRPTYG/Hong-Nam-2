import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import { useApp } from "../store";
import { Restroom, fmtAvg, ratingFor } from "../data";

// ─── Cards ──────────────────────────────────────────────────────────────────

const TONES = {
  card: "bg-hn-card",
  orange: "bg-[#E35205]",
  hero: "bg-hn-hero",
  soft: "bg-hn-soft",
};

export function BrutalCard({
  children,
  className = "",
  shadow = "hn-sh-4",
  tone = "card",
  onClick,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: string;
  tone?: keyof typeof TONES;
  onClick?: () => void;
  label?: string;
}) {
  const base = `border-2 border-hn-line rounded-2xl ${TONES[tone]} ${shadow} ${className}`;
  if (!onClick) return <div className={base}>{children}</div>;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${base} cursor-pointer text-left active:translate-x-0.5 active:translate-y-0.5 transition-transform`}
    >
      {children}
    </div>
  );
}

// ─── Buttons ────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "dark" | "light" | "danger";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-[#E35205] text-white hn-sh-3",
  dark: "bg-hn-hero text-white hn-sh-o3",
  light: "bg-hn-card text-hn-ink hn-sh-3",
  danger: "bg-hn-bad text-white hn-sh-3",
};

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  variant?: BtnVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`border-2 border-hn-line rounded-2xl py-3 px-4 text-sm font-black inline-flex items-center justify-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none ${BTN[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`w-10 h-10 border-2 border-hn-line rounded-xl bg-hn-card text-hn-ink flex items-center justify-center hn-sh-2 flex-shrink-0 active:translate-x-0.5 active:translate-y-0.5 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Headers ────────────────────────────────────────────────────────────────

export function PageTitle({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="py-4 flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-black tracking-[0.2em] text-hn-mute uppercase">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-black text-hn-ink leading-none mt-0.5 tracking-tight">
          {title}
          <span className="text-hn-accent">.</span>
        </h1>
      </div>
      {right}
    </div>
  );
}

export function SubHeader({
  eyebrow,
  title,
  onBack,
  right,
}: {
  eyebrow: string;
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <IconBtn label="Go back" onClick={onBack}>
        <ChevronLeft size={18} />
      </IconBtn>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black tracking-[0.2em] text-hn-mute uppercase">
          {eyebrow}
        </p>
        <h1 className="text-[22px] font-black text-hn-ink leading-none mt-0.5 tracking-tight truncate">
          {title}
          <span className="text-hn-accent">.</span>
        </h1>
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[17px] font-black text-hn-ink tracking-tight">
        {children}
      </h2>
      {action}
    </div>
  );
}

// ─── Stars ──────────────────────────────────────────────────────────────────

export function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(value)
              ? "text-[#E35205] fill-[#E35205]"
              : "text-hn-line/30 fill-hn-line/10"
          }
        />
      ))}
    </div>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-hn-line bg-hn-card active:scale-95 transition-transform"
        >
          <Star
            size={22}
            className={
              n <= value
                ? "text-[#E35205] fill-[#E35205]"
                : "text-hn-faint fill-transparent"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ─── Modals ─────────────────────────────────────────────────────────────────

export function Modal({
  title,
  onClose,
  children,
  center = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  center?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => prev?.focus?.();
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const f = panel.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea, select, [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const node = (
    <div
      className={`absolute inset-0 z-40 flex ${center ? "items-center px-6" : "items-end"} justify-center bg-black/65 hn-fade`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKey}
        className={
          center
            ? "w-full border-2 border-hn-line rounded-3xl bg-hn-bg text-hn-ink p-5 hn-sh-6 hn-pop outline-none"
            : "w-full max-h-[90%] overflow-y-auto hn-scroll border-2 border-b-0 border-hn-line rounded-t-3xl bg-hn-bg text-hn-ink p-5 pb-8 hn-sheet outline-none"
        }
      >
        {children}
      </div>
    </div>
  );
  const host = document.getElementById("hn-modal-root");
  return host ? createPortal(node, host) : node;
}

export function SheetHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-black tracking-tight text-hn-ink">
        {title}
        <span className="text-hn-accent">.</span>
      </h2>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="w-9 h-9 border-2 border-hn-line rounded-xl bg-hn-card text-hn-ink font-black flex items-center justify-center hn-sh-2"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Form bits ──────────────────────────────────────────────────────────────

export function Field({
  id,
  label,
  icon,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`border-2 rounded-2xl px-4 py-3 bg-hn-card hn-sh-3 focus-within:ring-2 focus-within:ring-hn-accent ${error ? "border-hn-bad" : "border-hn-line"}`}
      >
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-hn-mute mb-1.5"
        >
          {icon} {label}
          {optional && (
            <span className="normal-case tracking-normal font-semibold text-hn-faint">
              (optional)
            </span>
          )}
        </label>
        {children}
      </div>
      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="text-xs font-bold text-hn-bad mt-1.5 px-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "w-full bg-transparent text-sm font-bold text-hn-ink outline-none placeholder:text-hn-faint placeholder:font-semibold";

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-xs font-black px-3 py-2 rounded-lg border-2 border-hn-line transition-colors ${active ? "bg-[#E35205] text-white" : "bg-hn-card text-hn-ink"}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full border-2 border-hn-line flex-shrink-0 transition-colors ${checked ? "bg-[#E35205]" : "bg-hn-soft"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full border-2 border-hn-line bg-white transition-transform ${checked ? "translate-x-6" : ""}`}
      />
    </button>
  );
}

// ─── Misc ───────────────────────────────────────────────────────────────────

export function StatusLabel({ busy }: { busy: boolean | null }) {
  const text = busy == null ? "Status unknown" : busy ? "Busy" : "Open";
  const dot =
    busy == null ? "bg-hn-faint" : busy ? "bg-red-500" : "bg-green-400";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full border border-hn-line ${dot}`} />
      <span className="text-xs text-hn-mute font-semibold">{text}</span>
    </span>
  );
}

export function SourceBadge({ r }: { r: Restroom }) {
  if (r.source === "community")
    return (
      <span className="text-[10px] font-black uppercase tracking-wider bg-[#E35205] text-white border border-hn-line rounded-full px-2.5 py-0.5">
        Community · Pending
      </span>
    );
  return (
    <span className="text-[10px] font-black uppercase tracking-wider text-hn-mute border border-dashed border-hn-mute rounded-full px-2.5 py-0.5">
      Demo listing
    </span>
  );
}

export function EmptyState({
  mascot,
  title,
  body,
  action,
}: {
  mascot: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-2 border-dashed border-hn-line rounded-2xl p-6 text-center bg-hn-card/70 hn-rise">
      <div className="w-20 mx-auto mb-3">{mascot}</div>
      <p className="text-hn-ink font-black text-base">{title}</p>
      <p className="text-hn-mute text-xs font-semibold mt-1 mb-4">{body}</p>
      {action}
    </div>
  );
}

export function FavButton({ id, size = 16 }: { id: string; size?: number }) {
  const { favorites, toggleFavorite, showToast, getRestroom } = useApp();
  const on = favorites.includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
        showToast(
          on
            ? "Removed from favorites"
            : `Saved ${getRestroom(id)?.name ?? "restroom"}`,
        );
      }}
      className="w-9 h-9 border-2 border-hn-line rounded-xl bg-hn-card flex items-center justify-center hn-sh-2 flex-shrink-0 active:scale-95 transition-transform"
    >
      <Heart
        size={size}
        className={on ? "text-[#E35205] fill-[#E35205]" : "text-hn-ink"}
      />
    </button>
  );
}

// ─── Restroom card (shared by Home, lists, search) ─────────────────────────

export function RestroomCard({
  restroom,
  featuredReason,
}: {
  restroom: Restroom;
  featuredReason?: string;
}) {
  const { reviews, push } = useApp();
  const { avg, count } = ratingFor(reviews, restroom.id);
  const featured = !!featuredReason;
  return (
    <BrutalCard
      className="mb-3 overflow-hidden"
      shadow={featured ? "hn-sh-o4" : "hn-sh-4"}
      onClick={() => push({ name: "detail", id: restroom.id })}
      label={`Open ${restroom.name}, ${restroom.floor}`}
    >
      {featured && (
        <div className="bg-[#E35205] px-4 py-1.5 flex items-center gap-2">
          <Award size={11} className="text-white flex-shrink-0" />
          <span className="text-white text-[10px] font-black tracking-[0.15em] uppercase flex-shrink-0">
            Top Pick Today
          </span>
          <span className="text-white/85 text-[10px] font-bold truncate">
            · {featuredReason}
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-[15px] text-hn-ink leading-tight text-left">
              {restroom.name}
            </h3>
            <p className="text-hn-mute text-xs font-semibold mt-0.5">
              {restroom.building !== restroom.name
                ? `${restroom.building} · `
                : ""}
              {restroom.floor}
            </p>
          </div>
          <div className="bg-black rounded-xl px-2.5 py-1 flex items-center gap-1 flex-shrink-0 self-center border border-hn-line">
            <Star size={10} className="text-[#E35205] fill-[#E35205]" />
            <span className="text-white text-xs font-black">
              {avg == null ? "New" : fmtAvg(avg)}
            </span>
          </div>
          <FavButton id={restroom.id} size={15} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {restroom.source === "community" && <SourceBadge r={restroom} />}
          {restroom.facilities.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold text-hn-ink border border-hn-line rounded-full px-2.5 py-0.5 uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-hn-mute" />
              <span className="text-xs text-hn-mute font-semibold">
                {restroom.distanceMin == null
                  ? "Distance n/a"
                  : `${restroom.distanceMin} min`}
              </span>
            </div>
            <StatusLabel busy={restroom.busy} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-hn-mute font-semibold">
              {count} review{count === 1 ? "" : "s"}
            </span>
            <ChevronRight size={13} className="text-hn-mute" />
          </div>
        </div>
      </div>
    </BrutalCard>
  );
}
