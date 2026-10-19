import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  Home as HomeIcon,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../store";
import {
  EMPTY_FILTERS,
  FACILITY_OPTIONS,
  Filters,
  countFilters,
  fmtAvg,
  matchesQuery,
  passesFilters,
  ratingFor,
  recommend,
} from "../data";
import { MascotHappy, MascotSurprised } from "../components/Mascots";
import {
  BrutalCard,
  Btn,
  Chip,
  EmptyState,
  Modal,
  RestroomCard,
  SectionTitle,
  SheetHeader,
} from "../components/ui";

const byDistance = <T extends { distanceMin: number | null }>(a: T, b: T) =>
  (a.distanceMin ?? 999) - (b.distanceMin ?? 999);

function StatPill({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <BrutalCard className="flex-1 p-3" tone={accent ? "orange" : "card"}>
      <div className={`mb-1 ${accent ? "text-white" : "text-hn-accent"}`}>
        {icon}
      </div>
      <div
        className={`text-xl font-black leading-none ${accent ? "text-white" : "text-hn-ink"}`}
      >
        {value}
      </div>
      <div
        className={`text-[10px] font-bold mt-0.5 uppercase tracking-wider ${accent ? "text-white/80" : "text-hn-mute"}`}
      >
        {label}
      </div>
    </BrutalCard>
  );
}

function FilterSheet({ onClose }: { onClose: () => void }) {
  const { filters, setFilters, restrooms } = useApp();
  const [d, setD] = useState<Filters>(filters);

  const buildings = [...new Set(restrooms.map((r) => r.building))];
  const floors = [...new Set(restrooms.map((r) => r.floor))];
  const facilities = [
    ...new Set([...FACILITY_OPTIONS, ...restrooms.flatMap((r) => r.facilities)]),
  ];
  const matches = restrooms.filter((r) => passesFilters(r, d)).length;

  const group = (title: string, children: React.ReactNode) => (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  return (
    <Modal title="Filter restrooms" onClose={onClose}>
      <SheetHeader title="Filters" onClose={onClose} />
      {group(
        "Status (last report)",
        (["any", "open", "busy"] as const).map((s) => (
          <Chip
            key={s}
            active={d.status === s}
            onClick={() => setD({ ...d, status: s })}
          >
            {s === "any" ? "Any" : s === "open" ? "Available" : "Busy"}
          </Chip>
        )),
      )}
      {group(
        "Cleanliness",
        (["any", "Excellent", "Good", "Unrated"] as const).map((c) => (
          <Chip
            key={c}
            active={d.cleanliness === c}
            onClick={() => setD({ ...d, cleanliness: c })}
          >
            {c === "any" ? "Any" : c}
          </Chip>
        )),
      )}
      {group(
        "Building",
        <>
          <Chip active={!d.building} onClick={() => setD({ ...d, building: "" })}>
            Any
          </Chip>
          {buildings.map((b) => (
            <Chip
              key={b}
              active={d.building === b}
              onClick={() => setD({ ...d, building: b })}
            >
              {b}
            </Chip>
          ))}
        </>,
      )}
      {group(
        "Floor",
        <>
          <Chip active={!d.floor} onClick={() => setD({ ...d, floor: "" })}>
            Any
          </Chip>
          {floors.map((f) => (
            <Chip
              key={f}
              active={d.floor === f}
              onClick={() => setD({ ...d, floor: f })}
            >
              {f}
            </Chip>
          ))}
        </>,
      )}
      {group(
        "Facilities",
        facilities.map((f) => (
          <Chip
            key={f}
            active={d.facilities.includes(f)}
            onClick={() =>
              setD({
                ...d,
                facilities: d.facilities.includes(f)
                  ? d.facilities.filter((x) => x !== f)
                  : [...d.facilities, f],
              })
            }
          >
            {f}
          </Chip>
        )),
      )}

      <div className="flex gap-3 mt-2">
        <Btn
          variant="light"
          className="flex-1"
          onClick={() => {
            setD(EMPTY_FILTERS);
            setFilters(EMPTY_FILTERS);
          }}
        >
          Reset
        </Btn>
        <Btn
          className="flex-[2]"
          onClick={() => {
            setFilters(d);
            onClose();
          }}
        >
          Apply · {matches} result{matches === 1 ? "" : "s"}
        </Btn>
      </div>
    </Modal>
  );
}

export default function HomeScreen() {
  const {
    restrooms,
    reviews,
    query,
    setQuery,
    filters,
    setFilters,
    displayName,
    push,
    goTab,
    showToast,
  } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = displayName.split(" ")[0];

  const nFilters = countFilters(filters);
  const searching = query.trim() !== "" || nFilters > 0;

  const results = useMemo(
    () =>
      restrooms
        .filter((r) => matchesQuery(r, query) && passesFilters(r, filters))
        .sort(byDistance),
    [restrooms, query, filters],
  );

  const recs = useMemo(() => recommend(restrooms, reviews), [restrooms, reviews]);
  const top = recs[0];
  const community = restrooms.filter((r) => r.source === "community");

  const nearYou = restrooms
    .filter((r) => r.id !== top?.restroom.id && r.source === "demo")
    .sort(byDistance)
    .slice(0, 2);
  const popular = restrooms
    .filter(
      (r) =>
        r.id !== top?.restroom.id && !nearYou.some((n) => n.id === r.id),
    )
    .map((r) => ({ r, a: ratingFor(reviews, r.id).avg }))
    .filter((x) => x.a != null)
    .sort((a, b) => (b.a ?? 0) - (a.a ?? 0))
    .slice(0, 1)
    .map((x) => x.r);

  const listAll = [...restrooms].sort(byDistance);

  const rated = restrooms
    .map((r) => ratingFor(reviews, r.id))
    .filter((x) => x.count > 0);
  const totalReviews = rated.reduce((s, x) => s + x.count, 0);
  const overall = totalReviews
    ? rated.reduce((s, x) => s + (x.avg ?? 0) * x.count, 0) / totalReviews
    : null;
  const cleanCount = restrooms.filter(
    (r) => r.cleanliness === "Excellent" || r.cleanliness === "Good",
  ).length;

  const findNearest = () => {
    const pick =
      [...restrooms].filter((r) => r.distanceMin != null && r.busy === false).sort(byDistance)[0] ??
      [...restrooms].filter((r) => r.distanceMin != null).sort(byDistance)[0];
    if (pick) push({ name: "detail", id: pick.id });
    else showToast("No restroom with a known distance yet.");
  };

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-hn-mute uppercase">
            KMITL Campus
          </p>
          <h1 className="text-[28px] font-black text-hn-ink leading-none mt-0.5 tracking-tight">
            HongNam<span className="text-hn-accent">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              showToast("You're all caught up. Notifications are simulated here.")
            }
            className="w-10 h-10 border-2 border-hn-line rounded-xl bg-hn-card flex items-center justify-center hn-sh-2"
          >
            <Bell size={17} className="text-hn-ink" />
          </button>
          <button
            type="button"
            aria-label="Open profile"
            onClick={() => goTab("profile")}
            className="w-10 h-10 border-2 border-hn-line rounded-xl bg-[#E35205] flex items-center justify-center hn-sh-2"
          >
            <span className="text-white text-sm font-black">
              {first.charAt(0)}
            </span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="border-2 border-hn-line rounded-3xl overflow-hidden mb-4 bg-hn-hero hn-sh-o6">
        <div className="flex items-end px-5 pt-5 gap-2">
          <div className="flex-1 pb-5">
            <p className="text-[#FF7A1E] text-[10px] font-black tracking-[0.2em] uppercase mb-2">
              {greeting}, {first} 👋
            </p>
            <h2 className="text-white text-[26px] font-black leading-[1.1] tracking-tight">
              Where are
              <br />
              you headed
              <br />
              <span className="text-[#FF7A1E]">next?</span>
            </h2>
            <button
              type="button"
              onClick={findNearest}
              className="mt-5 bg-[#E35205] border-2 border-white text-white text-sm font-black px-5 py-2.5 rounded-xl inline-flex items-center gap-2 hn-sh-w3 active:translate-x-0.5 active:translate-y-0.5"
            >
              Find Nearest <span className="text-lg leading-none">→</span>
            </button>
          </div>
          <div className="w-[110px] -mb-0.5 flex-shrink-0">
            <MascotHappy className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 mb-1">
        <StatPill
          accent
          icon={<CheckCircle size={15} />}
          value={String(cleanCount)}
          label="Rated clean"
        />
        <StatPill
          icon={<HomeIcon size={15} />}
          value={String(restrooms.length)}
          label="Listed"
        />
        <StatPill
          icon={<Star size={15} />}
          value={fmtAvg(overall)}
          label="Avg rating"
        />
      </div>
      <p className="text-[10px] text-hn-mute font-semibold mb-4 mt-2">
        Based on demo listings and reviews saved in this browser.
      </p>

      {/* Search */}
      <div className="flex items-stretch gap-2 mb-5">
        <div className="flex-1 flex items-center gap-3 px-4 border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-4 focus-within:ring-2 focus-within:ring-hn-accent">
          <Search size={15} className="text-hn-mute flex-shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search buildings, floors..."
            aria-label="Search restrooms"
            className="flex-1 min-w-0 py-3 bg-transparent text-sm font-semibold text-hn-ink outline-none placeholder:text-hn-mute [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="w-6 h-6 rounded-full bg-hn-soft border border-hn-line flex items-center justify-center flex-shrink-0"
            >
              <X size={12} className="text-hn-ink" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          aria-label={`Filters${nFilters ? `, ${nFilters} active` : ""}`}
          className="relative bg-[#E35205] border-2 border-hn-line rounded-2xl px-3.5 flex items-center gap-1.5 text-white text-[11px] font-black hn-sh-4 active:translate-x-0.5 active:translate-y-0.5"
        >
          <SlidersHorizontal size={14} />
          Filter
          {nFilters > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white border-2 border-white text-[10px] flex items-center justify-center">
              {nFilters}
            </span>
          )}
        </button>
      </div>

      {searching ? (
        <section aria-live="polite">
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilters(EMPTY_FILTERS);
                }}
                className="text-xs text-hn-accent font-black"
              >
                Clear all
              </button>
            }
          >
            {results.length} result{results.length === 1 ? "" : "s"}
          </SectionTitle>
          {results.length ? (
            results.map((r) => <RestroomCard key={r.id} restroom={r} />)
          ) : (
            <EmptyState
              mascot={<MascotSurprised className="w-full h-auto" />}
              title="Hmm, nothing here yet"
              body={
                query.trim()
                  ? `No restroom matches "${query.trim()}". Try a building name, or add the missing one.`
                  : "No restroom matches these filters. Try loosening them."
              }
              action={
                <div className="flex gap-2 justify-center flex-wrap">
                  <Btn
                    variant="light"
                    onClick={() => {
                      setQuery("");
                      setFilters(EMPTY_FILTERS);
                    }}
                  >
                    Clear search
                  </Btn>
                  <Btn onClick={() => push({ name: "add" })}>Add restroom</Btn>
                </div>
              }
            />
          )}
        </section>
      ) : showAll ? (
        <section>
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-xs text-hn-accent font-black"
              >
                Show less
              </button>
            }
          >
            All restrooms
          </SectionTitle>
          {listAll.map((r) => (
            <RestroomCard key={r.id} restroom={r} />
          ))}
        </section>
      ) : (
        <>
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-xs text-hn-accent font-black"
              >
                See all →
              </button>
            }
          >
            Near You
          </SectionTitle>
          {top ? (
            <RestroomCard restroom={top.restroom} featuredReason={top.reason} />
          ) : (
            <p className="text-xs font-semibold text-hn-mute mb-3">
              Not enough data to pick a top restroom yet.
            </p>
          )}
          {nearYou.map((r) => (
            <RestroomCard key={r.id} restroom={r} />
          ))}
          <p className="text-[10px] text-hn-mute font-semibold -mt-1 mb-4">
            Top pick is a simple rule-based score (distance, reported status,
            ratings, cleanliness) on demo data, not live occupancy or AI.
          </p>

          {community.length > 0 && (
            <>
              <SectionTitle
                action={
                  <span className="flex items-center gap-1 text-[10px] font-black text-hn-mute uppercase tracking-wider">
                    <Users size={11} /> {community.length}
                  </span>
                }
              >
                Community Added
              </SectionTitle>
              {community.slice(0, 3).map((r) => (
                <RestroomCard key={r.id} restroom={r} />
              ))}
            </>
          )}

          {popular.length > 0 && (
            <>
              <SectionTitle>Popular on Campus</SectionTitle>
              {popular.map((r) => (
                <RestroomCard key={r.id} restroom={r} />
              ))}
            </>
          )}
        </>
      )}

      {showFilter && <FilterSheet onClose={() => setShowFilter(false)} />}
    </div>
  );
}
