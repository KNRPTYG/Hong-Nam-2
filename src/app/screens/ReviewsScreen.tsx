import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useApp } from "../store";
import { fmtAvg, ratingFor } from "../data";
import { MascotSurprised } from "../components/Mascots";
import {
  BrutalCard,
  Btn,
  EmptyState,
  PageTitle,
  Stars,
} from "../components/ui";
import { RestroomPicker, WriteReviewSheet } from "../components/sheets";
import ReviewCard from "../components/ReviewCard";

type Sort = "new" | "top" | "helpful";
const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "Newest" },
  { id: "top", label: "Top Rated" },
  { id: "helpful", label: "Most Helpful" },
];

export default function ReviewsScreen() {
  const { restrooms, reviews, reviewsFocus, setReviewsFocus } = useApp();
  const [sort, setSort] = useState<Sort>("new");
  const [picker, setPicker] = useState(false);
  const [writing, setWriting] = useState(false);

  const selectedId =
    reviewsFocus && restrooms.some((r) => r.id === reviewsFocus)
      ? reviewsFocus
      : restrooms[0]?.id ?? null;
  const restroom = restrooms.find((r) => r.id === selectedId);

  useEffect(() => {
    if (selectedId && selectedId !== reviewsFocus) setReviewsFocus(selectedId);
  }, [selectedId, reviewsFocus, setReviewsFocus]);

  const { avg, count, dist } = ratingFor(reviews, selectedId ?? "");

  const list = useMemo(() => {
    const l = reviews.filter((r) => r.restroomId === selectedId);
    return l.sort((a, b) =>
      sort === "new"
        ? b.createdAt - a.createdAt
        : sort === "top"
          ? b.rating - a.rating || b.createdAt - a.createdAt
          : b.helpful - a.helpful || b.createdAt - a.createdAt,
    );
  }, [reviews, selectedId, sort]);

  return (
    <div className="px-4 pb-6">
      <PageTitle eyebrow="Community" title="Reviews" />

      {/* Restroom selector */}
      <button
        type="button"
        onClick={() => setPicker(true)}
        aria-haspopup="dialog"
        className="w-full mb-4 border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-4 px-4 py-3 flex items-center justify-between gap-3 text-left active:translate-x-0.5 active:translate-y-0.5"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-wider text-hn-mute">
            Reading reviews for
          </span>
          <span className="block text-sm font-black text-hn-ink truncate">
            {restroom ? `${restroom.name} · ${restroom.floor}` : "Select a restroom"}
          </span>
        </span>
        <ChevronDown size={18} className="text-hn-accent flex-shrink-0" />
      </button>

      {/* Summary */}
      <BrutalCard className="p-4 mb-4" shadow="hn-sh-5">
        <div className="flex items-center gap-4">
          <div className="text-center flex-shrink-0">
            <p className="text-[44px] font-black leading-none text-hn-ink">
              {fmtAvg(avg)}
            </p>
            <div className="mt-1.5 flex justify-center">
              <Stars value={avg ?? 0} size={11} />
            </div>
            <p className="text-[10px] font-bold text-hn-mute mt-1">
              {count} review{count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = dist[n - 1];
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-hn-mute w-2">
                    {n}
                  </span>
                  <div
                    className="flex-1 h-2.5 rounded-full border border-hn-line bg-hn-soft overflow-hidden"
                    role="img"
                    aria-label={`${c} review${c === 1 ? "" : "s"} with ${n} stars`}
                  >
                    <div
                      className="h-full bg-[#E35205] transition-[width] duration-500"
                      style={{ width: count ? `${(c / count) * 100}%` : 0 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-hn-mute w-4 text-right">
                    {c}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[10px] font-semibold text-hn-mute mt-3">
          Average comes from the reviews listed below. Demo reviews are sample
          data, not verified feedback.
        </p>
      </BrutalCard>

      {/* Write review CTA */}
      <BrutalCard className="p-4 mb-4" tone="orange" shadow="hn-sh-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-black text-base">Rate your visit</p>
            <p className="text-white/80 text-xs font-semibold mt-0.5">
              Help fellow students navigate campus
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="bg-white border-2 border-black text-black text-sm font-black px-4 py-2 rounded-xl flex-shrink-0 hn-sh-2 active:translate-x-0.5 active:translate-y-0.5"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            Write →
          </button>
        </div>
      </BrutalCard>

      {/* Sort */}
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Sort reviews">
        {SORTS.map((s) => {
          const on = sort === s.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSort(s.id)}
              className={`text-xs font-black px-3 py-2 rounded-lg border-2 border-hn-line ${on ? "bg-hn-hero text-white hn-sh-o3" : "bg-hn-card text-hn-ink hn-sh-2"}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {list.length ? (
        list.map((r) => <ReviewCard key={r.id} review={r} />)
      ) : (
        <EmptyState
          mascot={<MascotSurprised className="w-full h-auto" />}
          title="No reviews yet"
          body={`Be the first to review ${restroom?.name ?? "this restroom"}.`}
          action={<Btn onClick={() => setWriting(true)}>Write a review</Btn>}
        />
      )}

      {picker && (
        <RestroomPicker
          selectedId={selectedId}
          onClose={() => setPicker(false)}
          onPick={(id) => {
            setReviewsFocus(id);
            setPicker(false);
          }}
        />
      )}
      {writing && (
        <WriteReviewSheet
          initialId={selectedId}
          onClose={() => setWriting(false)}
          onPosted={(id) => {
            setReviewsFocus(id);
            setSort("new");
          }}
        />
      )}
    </div>
  );
}
