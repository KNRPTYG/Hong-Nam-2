import { useLayoutEffect, useRef } from "react";
import { Home, MapPin, Star, User } from "lucide-react";
import { AppProvider, Screen, Tab, useApp } from "./store";
import BuddyLayer from "./buddy/BuddyLayer";
import LivingBackground from "./components/LivingBackground";
import AddRestroomScreen from "./components/AddRestroomScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import ReviewsScreen from "./screens/ReviewsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DetailScreen from "./screens/DetailScreen";
import NavigateScreen from "./screens/NavigateScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { InfoScreen, ListScreen } from "./screens/ListScreens";

// ─── Bottom Navigation ──────────────────────────────────────────────────────

const TABS: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "map", icon: MapPin, label: "Map" },
  { id: "reviews", icon: Star, label: "Reviews" },
  { id: "profile", icon: User, label: "Profile" },
];

function BottomNav() {
  const { tab, goTab } = useApp();
  return (
    <nav
      aria-label="Main"
      className="border-t-2 border-hn-line bg-hn-nav px-2 pt-2 pb-3 flex items-center justify-around flex-shrink-0"
    >
      {TABS.map(({ id, icon: Icon, label }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => goTab(id)}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-0.5 py-1 px-4 select-none min-w-[64px]"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 border-2 ${active ? "bg-[#E35205] border-hn-line hn-sh-2 hn-neon" : "bg-transparent border-transparent"}`}
            >
              <Icon size={17} className={active ? "text-white" : "text-hn-mute"} />
            </div>
            <span
              className={`text-[10px] font-black ${active ? "text-hn-accent" : "text-hn-faint"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Status bar (unchanged look) ────────────────────────────────────────────

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between flex-shrink-0 px-[24px] pt-[14px] pb-[20px]"
      style={{
        background:
          "radial-gradient(ellipse 110% 220% at 38% -40%, #FF9B42 0%, #FF7A1E 48%, #F16610 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(180,60,0,0.18)",
      }}
    >
      <span className="text-black text-[16px] text-left font-bold my-[5px]">
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-0.5">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-sm ${i < 3 ? "bg-black" : "bg-black/25"}`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
          <path
            d="M7 8.5C7.55 8.5 8 8.95 8 9.5S7.55 10.5 7 10.5 6 10.05 6 9.5 6.45 8.5 7 8.5Z"
            fill="black"
          />
          <path
            d="M4.5 7C5.33 6.17 6.17 5.83 7 5.83S8.67 6.17 9.5 7"
            stroke="black"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M2 4.5C3.5 3 5.25 2.17 7 2.17S10.5 3 12 4.5"
            stroke="black"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="w-[22px] h-[11px] border-[1.5px] border-black rounded-[3px] relative">
            <div className="absolute inset-[1.5px] right-[3px] bg-black rounded-[1px]" />
          </div>
          <div className="w-[2px] h-[5px] bg-black rounded-r-[1px]" />
        </div>
      </div>
    </div>
  );
}

// ─── Router ─────────────────────────────────────────────────────────────────

function renderScreen(s: Screen) {
  switch (s.name) {
    case "detail":
      return <DetailScreen id={s.id} />;
    case "add":
      return <AddRestroomScreen />;
    case "navigate":
      return <NavigateScreen id={s.id} />;
    case "settings":
      return <SettingsScreen />;
    case "list":
      return <ListScreen kind={s.kind} />;
    case "info":
      return <InfoScreen kind={s.kind} />;
  }
}

const screenKey = (s: Screen) =>
  s.name === "detail" || s.name === "navigate"
    ? `${s.name}:${s.id}`
    : s.name === "list" || s.name === "info"
      ? `${s.name}:${s.kind}`
      : s.name;

function Shell() {
  const { auth, tab, stack, toast } = useApp();
  const scroller = useRef<HTMLDivElement>(null);
  const memory = useRef<Record<string, number>>({});
  const prevKey = useRef<string>("");

  const top = stack[stack.length - 1];
  const key = !auth.loggedIn
    ? "login"
    : stack.length
      ? stack.map(screenKey).join(">")
      : `tab:${tab}`;

  // restore each route's scroll position
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (prevKey.current) memory.current[prevKey.current] = memory.current.__live ?? 0;
    el.scrollTop = memory.current[key] ?? 0;
    prevKey.current = key;
  }, [key]);

  const tabs: Record<Tab, React.ReactNode> = {
    home: <HomeScreen />,
    map: <MapScreen />,
    reviews: <ReviewsScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div
      className="w-full h-full bg-hn-bg text-hn-ink flex flex-col overflow-hidden relative"
      style={{ fontFamily: "'Bricolage Grotesque', 'Noto Sans Thai', sans-serif" }}
    >
      <StatusBar />

      <div
        ref={scroller}
        onScroll={(e) => {
          memory.current.__live = e.currentTarget.scrollTop;
        }}
        className="flex-1 overflow-y-auto relative bg-hn-bg hn-scroll"
      >
        <div
          className="pointer-events-none select-none"
          aria-hidden="true"
          style={{
            position: "sticky",
            top: 0,
            height: 0,
            overflow: "visible",
            zIndex: 0,
          }}
        >
          <LivingBackground />
        </div>

        <main className="relative" style={{ zIndex: 1 }} key={key}>
          {!auth.loggedIn ? (
            <LoginScreen />
          ) : top ? (
            renderScreen(top)
          ) : (
            <div className="hn-rise">{tabs[tab]}</div>
          )}
        </main>
        {auth.loggedIn && <div className="h-20" aria-hidden="true" />}
      </div>

      {auth.loggedIn && <BuddyLayer />}
      {auth.loggedIn && <BottomNav />}

      <div
        id="hn-modal-root"
        className="absolute inset-0 z-40 pointer-events-none [&>*]:pointer-events-auto"
      />

      {toast && (
        <div
          role="status"
          className="absolute left-4 right-4 bottom-24 z-50 flex justify-center pointer-events-none"
        >
          <div className="hn-pop bg-hn-hero text-white text-xs font-black px-4 py-2.5 rounded-xl border-2 border-white/80 hn-sh-o3">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="w-full h-[100dvh] md:flex md:items-center md:justify-center md:bg-neutral-800 md:p-6">
        <div className="w-full h-full max-w-[460px] md:max-h-[900px] md:rounded-[2.25rem] md:border-4 md:border-black overflow-hidden mx-auto">
          <Shell />
        </div>
      </div>
    </AppProvider>
  );
}
