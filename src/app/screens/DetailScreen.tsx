import { useState } from "react";
import {
  Flag,
  MapPin,
  MessageSquare,
  Navigation,
  Sparkles,
  Star,
} from "lucide-react";
import { useApp } from "../store";
import { fmtAvg, ratingFor } from "../data";
import {
  BrutalCard,
  Btn,
  FavButton,
  SourceBadge,
  StatusLabel,
  SubHeader,
} from "../components/ui";
import { ReportSheet } from "../components/sheets";
import ReviewCard from "../components/ReviewCard";

export default function DetailScreen({ id }: { id: string }) {
  const { getRestroom, reviews, back, push, openReviews } = useApp();
  const [reporting, setReporting] = useState(false);
  const r = getRestroom(id);

  if (!r)
    return (
      <div className="px-4">
        <SubHeader eyebrow="Restroom" title="Not found" onBack={back} />
        <p className="text-sm font-semibold text-hn-mute">
          This restroom is no longer available.
        </p>
      </div>
    );

  const { avg, count } = ratingFor(reviews, r.id);
  const latest = reviews
    .filter((x) => x.restroomId === r.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2);

  return (
    <div className="px-4 pb-6">
      <SubHeader
        eyebrow={r.building}
        title="Restroom"
        onBack={back}
        right={<FavButton id={r.id} />}
      />

      <div className="border-2 border-hn-line rounded-3xl bg-hn-hero p-5 mb-4 hn-sh-o6">
        <div className="mb-3">
          <SourceBadge r={r} />
        </div>
        <h2 className="text-white text-[26px] font-black leading-[1.1] tracking-tight">
          {r.name}
        </h2>
        <p className="text-[#FF7A1E] text-xs font-black uppercase tracking-[0.15em] mt-1.5">
          {r.building} · {r.floor}
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/15">
          <div className="flex items-center gap-1.5 text-white/80">
            <MapPin size={13} />
            <span className="text-xs font-semibold">
              {r.distanceMin == null
                ? "Distance not available"
                : `${r.distanceMin} min walk (demo)`}
            </span>
          </div>
          <span className="[&_span]:!text-white/80">
            <StatusLabel busy={r.busy} />
          </span>
        </div>
      </div>

      <div className="flex gap-2.5 mb-4">
        <BrutalCard className="flex-1 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-hn-mute">
            Rating
          </p>
          <p className="text-xl font-black text-hn-ink leading-tight mt-0.5 flex items-center gap-1">
            <Star size={14} className="text-[#E35205] fill-[#E35205]" />
            {fmtAvg(avg)}
          </p>
        </BrutalCard>
        <BrutalCard className="flex-1 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-hn-mute">
            Reviews
          </p>
          <p className="text-xl font-black text-hn-ink leading-tight mt-0.5">
            {count}
          </p>
        </BrutalCard>
        <BrutalCard className="flex-1 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-hn-mute">
            Clean
          </p>
          <p className="text-base font-black text-hn-ink leading-tight mt-1">
            {r.cleanliness ?? "Not rated"}
          </p>
        </BrutalCard>
      </div>

      <BrutalCard className="p-4 mb-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mb-1">
          Location
        </p>
        <p className="text-sm font-bold text-hn-ink leading-relaxed">
          {r.location}
        </p>

        <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mt-4 mb-2">
          Facilities
        </p>
        {r.facilities.length ? (
          <div className="flex flex-wrap gap-1.5">
            {r.facilities.map((f) => (
              <span
                key={f}
                className="text-[10px] font-bold text-hn-ink border border-hn-line rounded-full px-2.5 py-0.5 uppercase tracking-wider"
              >
                {f}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs font-semibold text-hn-mute">
            No facilities listed yet.
          </p>
        )}

        {r.accessibility && (
          <>
            <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mt-4 mb-1">
              Accessibility
            </p>
            <p className="text-sm font-semibold text-hn-ink">{r.accessibility}</p>
          </>
        )}
        {r.notes && (
          <>
            <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mt-4 mb-1">
              Notes
            </p>
            <p className="text-sm font-semibold text-hn-ink">{r.notes}</p>
          </>
        )}
        {r.photo && (
          <img
            src={r.photo}
            alt={`${r.name} submitted by a community member`}
            className="mt-4 w-full h-36 object-cover rounded-xl border-2 border-hn-line"
          />
        )}
        <p className="text-[10px] font-semibold text-hn-mute mt-4 flex items-start gap-1.5">
          <Sparkles size={11} className="mt-px flex-shrink-0" />
          {r.source === "community"
            ? "Submitted from this browser and pending verification. Not officially verified."
            : "Demo listing included with the prototype. Details are sample data, not live."}
        </p>
      </BrutalCard>

      <div className="flex flex-col gap-3 mb-5">
        <Btn
          className="w-full py-3.5"
          onClick={() => push({ name: "navigate", id: r.id })}
        >
          <Navigation size={16} /> Start Navigation
        </Btn>
        <div className="flex gap-3">
          <Btn variant="light" className="flex-1" onClick={() => openReviews(r.id)}>
            <MessageSquare size={15} /> View Reviews
          </Btn>
          <Btn variant="light" className="flex-1" onClick={() => setReporting(true)}>
            <Flag size={15} /> Report Info
          </Btn>
        </div>
      </div>

      <h2 className="text-[17px] font-black text-hn-ink tracking-tight mb-3">
        Latest reviews
      </h2>
      {latest.length ? (
        latest.map((rv) => <ReviewCard key={rv.id} review={rv} />)
      ) : (
        <p className="text-xs font-semibold text-hn-mute">
          No reviews yet.{" "}
          <button
            type="button"
            onClick={() => openReviews(r.id)}
            className="text-hn-accent font-black underline"
          >
            Be the first
          </button>
        </p>
      )}

      {reporting && (
        <ReportSheet restroomId={r.id} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
