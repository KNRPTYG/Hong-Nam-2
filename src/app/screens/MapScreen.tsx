import { useState } from "react";
import { MapPin, Navigation, Plus, Star } from "lucide-react";
import { useApp } from "../store";
import { fmtAvg, ratingFor } from "../data";
import { MAP_IMAGE } from "../components/mapImage";
import {
  BrutalCard,
  Btn,
  PageTitle,
  SectionTitle,
  StatusLabel,
} from "../components/ui";

export default function MapScreen() {
  const { restrooms, reviews, push } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...restrooms].sort(
    (a, b) => (a.distanceMin ?? 999) - (b.distanceMin ?? 999),
  );
  const selected = restrooms.find((r) => r.id === selectedId) ?? null;
  const unplaced = restrooms.filter((r) => !r.mapPos);

  return (
    <div className="px-4 pb-6">
      <PageTitle eyebrow="Campus" title="Map View" />

      {/* Map area */}
      <div
        className="border-2 border-hn-line rounded-3xl overflow-hidden bg-[#F5F5EE] relative hn-sh-5"
        style={{ height: "360px" }}
      >
        <img
          src={MAP_IMAGE}
          alt="Campus map"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {restrooms
          .filter((r) => r.mapPos)
          .map((r) => {
            const p = r.mapPos!;
            const on = r.id === selectedId;
            return (
              <button
                key={r.id}
                type="button"
                aria-label={`${p.label} marker, ${r.name}, ${r.busy ? "busy" : "open"}`}
                aria-pressed={on}
                onClick={() => setSelectedId(on ? null : r.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-full px-3 py-1.5 text-black text-[12px] font-black transition-transform ${on ? "scale-110 z-10 ring-4 ring-white" : ""}`}
                style={{
                  top: p.top,
                  left: p.left,
                  background: p.color,
                  boxShadow: "2px 2px 0 #000",
                }}
              >
                {p.label}
                <span
                  className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-black ${r.busy ? "bg-red-500" : "bg-[#E35205]"}`}
                />
              </button>
            );
          })}

        {/* Demo user position */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ top: "50%", left: "42%" }}
          aria-hidden="true"
        >
          <span className="block w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_0_4px_rgba(59,130,246,0.35)]" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 mb-4 flex-wrap">
        {[
          { color: "bg-[#E35205]", label: "Available" },
          { color: "bg-red-500", label: "Busy" },
          { color: "bg-blue-500", label: "You (demo spot)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-full ${item.color} border border-hn-line`}
            />
            <span className="text-xs font-bold text-hn-ink">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Selected info */}
      <div aria-live="polite" className="mb-5">
        {selected ? (
          <BrutalCard className="p-4 hn-rise" shadow="hn-sh-o4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-hn-ink font-black text-base leading-tight">
                  {selected.name}
                </p>
                <p className="text-hn-mute text-xs font-semibold mt-0.5">
                  {selected.building} · {selected.floor}
                  {selected.distanceMin != null
                    ? ` · ${selected.distanceMin} min walk (demo)`
                    : ""}
                </p>
              </div>
              <StatusLabel busy={selected.busy} />
            </div>
            {!selected.mapPos && (
              <p className="text-[11px] font-bold text-hn-mute mt-2">
                Map location not configured yet.
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Btn
                className="flex-1 !py-2.5"
                onClick={() => push({ name: "detail", id: selected.id })}
              >
                View details
              </Btn>
              <Btn
                variant="light"
                className="flex-1 !py-2.5"
                onClick={() => push({ name: "navigate", id: selected.id })}
              >
                <Navigation size={14} /> Navigate
              </Btn>
            </div>
          </BrutalCard>
        ) : (
          <p className="text-xs font-semibold text-hn-mute">
            Tap a building marker or a restroom below to see its info.
          </p>
        )}
      </div>

      {/* Nearby list */}
      <SectionTitle>Nearby</SectionTitle>
      {sorted.map((b) => {
        const { avg } = ratingFor(reviews, b.id);
        const on = b.id === selectedId;
        return (
          <BrutalCard
            key={b.id}
            className={`p-4 mb-3 flex items-center gap-3 ${on ? "ring-2 ring-[#E35205]" : ""}`}
            onClick={() => setSelectedId(b.id)}
            label={`Select ${b.name}, ${b.floor}`}
          >
            <div
              className={`w-10 h-10 rounded-xl border-2 border-hn-line flex items-center justify-center flex-shrink-0 ${b.busy ? "bg-hn-bad-soft" : "bg-[#E35205]/15"}`}
            >
              <MapPin
                size={16}
                className={b.busy ? "text-hn-bad" : "text-hn-accent"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-hn-ink font-bold truncate">{b.name}</p>
              <p className="text-xs text-hn-mute font-semibold">
                {b.floor}
                {b.distanceMin != null ? ` · ${b.distanceMin} min` : ""}
                {!b.mapPos ? " · Not on map yet" : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <Star size={10} className="text-[#E35205] fill-[#E35205]" />
                <span className="text-xs font-black text-hn-ink">
                  {avg == null ? "New" : fmtAvg(avg)}
                </span>
              </div>
              <div
                className={`text-[10px] font-bold mt-0.5 ${b.busy == null ? "text-hn-mute" : b.busy ? "text-hn-bad" : "text-hn-ok"}`}
              >
                {b.busy == null ? "Unknown" : b.busy ? "Busy" : "Open"}
              </div>
            </div>
          </BrutalCard>
        );
      })}

      {unplaced.length > 0 && (
        <p className="text-[11px] text-hn-mute font-semibold mb-3">
          {unplaced.length} community restroom{unplaced.length > 1 ? "s have" : " has"} no
          map location configured, so no marker is shown.
        </p>
      )}

      <button
        type="button"
        onClick={() => push({ name: "add" })}
        className="w-full mt-1 border-2 border-hn-line border-dashed rounded-2xl py-3 text-xs font-black text-hn-accent flex items-center justify-center gap-1.5 bg-hn-card"
      >
        <Plus size={14} /> Is a restroom missing? Add it here
      </button>
    </div>
  );
}
