import { useApp } from "../store";
import { MascotSurprised } from "../components/Mascots";
import {
  Btn,
  EmptyState,
  RestroomCard,
  SubHeader,
} from "../components/ui";
import ReviewCard from "../components/ReviewCard";

export function ListScreen({ kind }: { kind: "favorites" | "contrib" | "myreviews" }) {
  const { restrooms, reviews, favorites, back, goTab, push, setQuery } = useApp();

  if (kind === "myreviews") {
    const mine = reviews
      .filter((r) => r.source === "mine")
      .sort((a, b) => b.createdAt - a.createdAt);
    return (
      <div className="px-4 pb-6">
        <SubHeader eyebrow="Profile" title="My Reviews" onBack={back} />
        {mine.length ? (
          mine.map((r) => <ReviewCard key={r.id} review={r} showRestroom />)
        ) : (
          <EmptyState
            mascot={<MascotSurprised className="w-full h-auto" />}
            title="No reviews yet"
            body="Your reviews will show up here after you post one."
            action={<Btn onClick={() => goTab("reviews")}>Go to Reviews</Btn>}
          />
        )}
      </div>
    );
  }

  if (kind === "contrib") {
    const mine = restrooms.filter((r) => r.source === "community");
    return (
      <div className="px-4 pb-6">
        <SubHeader eyebrow="Profile" title="Contributions" onBack={back} />
        {mine.length ? (
          <>
            <p className="text-[11px] font-semibold text-hn-mute mb-3">
              Restrooms you added from this browser. All are pending
              verification.
            </p>
            {mine.map((r) => (
              <RestroomCard key={r.id} restroom={r} />
            ))}
          </>
        ) : (
          <EmptyState
            mascot={<MascotSurprised className="w-full h-auto" />}
            title="Nothing added yet"
            body="Know a restroom that's missing? Add it for everyone on campus."
            action={<Btn onClick={() => push({ name: "add" })}>Add a restroom</Btn>}
          />
        )}
      </div>
    );
  }

  const favs = favorites
    .map((id) => restrooms.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => !!r);
  return (
    <div className="px-4 pb-6">
      <SubHeader eyebrow="Profile" title="Favorites" onBack={back} />
      {favs.length ? (
        favs.map((r) => <RestroomCard key={r.id} restroom={r} />)
      ) : (
        <EmptyState
          mascot={<MascotSurprised className="w-full h-auto" />}
          title="No favorites yet"
          body="Tap the heart on any restroom to save it here."
          action={
            <Btn
              onClick={() => {
                setQuery("");
                goTab("home");
              }}
            >
              Back to Nearby
            </Btn>
          }
        />
      )}
    </div>
  );
}

export function InfoScreen({ kind }: { kind: "about" | "privacy" }) {
  const { back } = useApp();
  const content =
    kind === "about"
      ? {
          title: "About",
          blocks: [
            [
              "What is HongNam?",
              "A friendly campus restroom finder for KMITL students: search, save favorites, read reviews and add restrooms that are missing. ปวดปุ๊บ เจอปั๊บ.",
            ],
            [
              "Prototype status",
              "This is a frontend prototype. There's no backend: restroom status, distances and the sample reviews are demo data, and nothing is live or officially verified.",
            ],
            [
              "How recommendations work",
              "Top Pick uses a transparent rule: walking distance, last reported status, average rating and cleanliness. It isn't AI and doesn't use live sensors.",
            ],
            [
              "Need help?",
              "Use Report Info on any restroom to flag something wrong. Reports are saved on this device only.",
            ],
          ],
        }
      : {
          title: "Privacy",
          blocks: [
            [
              "Stays in your browser",
              "Favorites, reviews, community restrooms, reports and settings are stored in this browser's local storage. They aren't sent anywhere or shared with other people or devices.",
            ],
            [
              "Simulated sign-in",
              "Login is a demo. No password is checked or stored, so please don't enter a real one.",
            ],
            [
              "Your control",
              "Settings → Clear my local data removes everything you've added on this device.",
            ],
          ],
        };
  return (
    <div className="px-4 pb-8">
      <SubHeader
        eyebrow={kind === "about" ? "Help" : "Safety"}
        title={content.title}
        onBack={back}
      />
      {content.blocks.map(([h, p]) => (
        <div
          key={h}
          className="border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-3 p-4 mb-3"
        >
          <p className="text-sm font-black text-hn-ink">{h}</p>
          <p className="text-xs font-semibold text-hn-mute mt-1 leading-relaxed">
            {p}
          </p>
        </div>
      ))}
      <p className="text-[10px] font-semibold text-hn-mute text-center mt-4">
        HongNam v2.0 · KMITL 2026
      </p>
    </div>
  );
}
