import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { useApp } from "../store";
import { Review, initials, timeAgo } from "../data";
import { BrutalCard, Stars } from "./ui";
import { ConfirmDialog } from "./sheets";

export default function ReviewCard({
  review,
  showRestroom = false,
}: {
  review: Review;
  showRestroom?: boolean;
}) {
  const { helped, toggleHelpful, deleteReview, getRestroom, showToast } = useApp();
  const [confirm, setConfirm] = useState(false);
  const liked = helped.includes(review.id);
  const rr = getRestroom(review.restroomId);
  const mine = review.source === "mine";

  return (
    <BrutalCard className="p-4 mb-3 hn-rise">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-hn-hero border-2 border-hn-line flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-black">
              {initials(review.user)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-hn-ink text-sm font-black leading-tight truncate">
              {review.user}
              {mine && (
                <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-[#E35205] text-white rounded-full px-1.5 py-0.5 align-middle">
                  You
                </span>
              )}
            </p>
            <p className="text-hn-mute text-[10px] font-semibold truncate">
              {showRestroom && rr
                ? `${rr.name} · ${rr.floor}`
                : review.source === "demo"
                  ? "Demo review"
                  : "Saved on this device"}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-hn-mute font-semibold flex-shrink-0">
          {timeAgo(review.createdAt)}
        </span>
      </div>

      <div className="mb-2">
        <Stars value={review.rating} />
      </div>

      <p className="text-hn-ink text-sm font-medium leading-relaxed mb-3 break-words">
        {review.text}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-hn-line/20">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => toggleHelpful(review.id)}
          className={`flex items-center gap-1.5 text-xs font-bold py-1 ${liked ? "text-hn-accent" : "text-hn-mute"}`}
        >
          <Heart
            size={12}
            className={liked ? "fill-[#E35205] text-[#E35205]" : ""}
          />
          {review.helpful} helpful
        </button>
        {mine && (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="flex items-center gap-1 text-[11px] text-hn-mute font-bold py-1"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title="Delete this review?"
          body="It will be removed from this device and the rating will be recalculated."
          confirmLabel="Delete"
          danger
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            deleteReview(review.id);
            setConfirm(false);
            showToast("Review deleted");
          }}
        />
      )}
    </BrutalCard>
  );
}
