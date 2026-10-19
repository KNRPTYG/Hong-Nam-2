import { useEffect, useState } from "react";
import { Check, Flag, MapPin, Navigation } from "lucide-react";
import { useApp } from "../store";
import { MascotHappy } from "../components/Mascots";
import { BrutalCard, Btn, SubHeader } from "../components/ui";

export default function NavigateScreen({ id }: { id: string }) {
  const { getRestroom, back } = useApp();
  const r = getRestroom(id);
  const [step, setStep] = useState(-1); // -1 = preview

  const steps = r
    ? [
        "Leave your current spot",
        `Head toward ${r.building}`,
        `Go to ${r.floor}`,
        `Look for: ${r.location}`,
        "You've arrived",
      ]
    : [];
  const last = steps.length - 1;

  useEffect(() => {
    if (step < 0 || step >= last) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), 2400);
    return () => window.clearTimeout(t);
  }, [step, last]);

  if (!r)
    return (
      <div className="px-4">
        <SubHeader eyebrow="Navigate" title="Not found" onBack={back} />
      </div>
    );

  const active = step >= 0 && step < last;
  const arrived = step >= last;
  const pct = step < 0 ? 0 : (step / last) * 100;

  const tip = arrived
    ? "You made it! Don't forget to leave a review."
    : active
      ? "Take your time, I'll keep you posted. 🧻"
      : "Ready when you are. Just tap Start.";

  return (
    <div className="px-4 pb-6">
      <SubHeader eyebrow="Simulation" title="Navigate" onBack={back} />

      <div className="border-2 border-dashed border-hn-line rounded-2xl p-3 mb-4 bg-hn-soft">
        <p className="text-[11px] font-bold text-hn-ink leading-relaxed">
          Simulated navigation. This is a demo: there's no GPS and no real
          walking route.
        </p>
      </div>

      <div className="border-2 border-hn-line rounded-3xl bg-hn-hero p-5 mb-4 hn-sh-o6">
        <p className="text-[#FF7A1E] text-[10px] font-black tracking-[0.2em] uppercase">
          Destination
        </p>
        <h2 className="text-white text-2xl font-black leading-tight tracking-tight mt-1">
          {r.name}
        </h2>
        <p className="text-white/70 text-xs font-semibold mt-1">
          {r.building} · {r.floor}
        </p>
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/15">
          <div className="flex items-center gap-1.5 text-white">
            <MapPin size={14} className="text-[#FF7A1E]" />
            <span className="text-sm font-black">
              {r.distanceMin == null
                ? "Walking time unavailable"
                : `~${r.distanceMin} min walk`}
            </span>
          </div>
        </div>
        {r.distanceMin != null && (
          <p className="text-white/60 text-[10px] font-semibold mt-1">
            Demo estimate, not a measured route.
          </p>
        )}
      </div>

      {/* Progress */}
      {step >= 0 && (
        <div
          className="h-3 rounded-full border-2 border-hn-line bg-hn-soft overflow-hidden mb-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Simulated progress"
        >
          <div
            className="h-full bg-[#E35205] transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <BrutalCard className="p-4 mb-4">
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => {
            const done = step > i || (arrived && i === last);
            const now = step === i && !arrived;
            return (
              <li key={s} className="flex items-start gap-3">
                <span
                  className={`w-7 h-7 rounded-full border-2 border-hn-line flex items-center justify-center flex-shrink-0 text-xs font-black ${done ? "bg-[#E35205] text-white" : now ? "bg-hn-ink text-hn-bg" : "bg-hn-soft text-hn-mute"}`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={`text-sm pt-0.5 ${now ? "font-black text-hn-ink" : done ? "font-semibold text-hn-mute line-through" : "font-semibold text-hn-mute"}`}
                  aria-current={now ? "step" : undefined}
                >
                  {s}
                </span>
              </li>
            );
          })}
        </ol>
      </BrutalCard>

      <div className="flex items-center gap-3 mb-5" aria-live="polite">
        <div className="w-14 flex-shrink-0">
          <MascotHappy className="w-full h-auto" />
        </div>
        <p className="text-sm font-bold text-hn-ink bg-hn-card border-2 border-hn-line rounded-2xl rounded-bl-sm px-3 py-2 hn-sh-2">
          {tip}
        </p>
      </div>

      {step < 0 && (
        <div className="flex gap-3">
          <Btn variant="light" className="flex-1" onClick={back}>
            Back
          </Btn>
          <Btn className="flex-[2] py-3.5" onClick={() => setStep(0)}>
            <Navigation size={16} /> Start
          </Btn>
        </div>
      )}
      {active && (
        <Btn variant="light" className="w-full py-3.5" onClick={back}>
          End Navigation
        </Btn>
      )}
      {arrived && (
        <Btn className="w-full py-3.5" onClick={back}>
          <Flag size={16} /> Return to details
        </Btn>
      )}
    </div>
  );
}
