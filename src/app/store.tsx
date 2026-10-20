import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EMPTY_FILTERS,
  SEED_RESTROOMS,
  SEED_REVIEWS,
  newId,
} from "./data";
import type {
  Filters,
  Report,
  Restroom,
  Review,
} from "./data";
import { db } from "../lib/firebase";
import { collection, onSnapshot, setDoc, doc } from "firebase/firestore";

// ─── Safe localStorage helpers ─────────────────────────────────────────────

const K = {
  restrooms: "hongnam.v2.restrooms",
  reviews: "hongnam.v2.reviews",
  favorites: "hongnam.v2.favorites",
  helped: "hongnam.v2.helped",
  reports: "hongnam.v2.reports",
  theme: "hongnam.v2.theme",
  settings: "hongnam.v2.settings",
  auth: "hongnam.v2.auth",
  email: "hongnam.v2.lastEmail",
};

const read = <T,>(store: Storage | undefined, key: string, fallback: T): T => {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (store: Storage | undefined, key: string, value: unknown) => {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
};

const ls = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const ss = (): Storage | undefined => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

function usePersisted<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(() => read(ls(), key, fallback));
  useEffect(() => write(ls(), key, v), [key, v]);
  return [v, setV] as const;
}

// ─── Types ─────────────────────────────────────────────────────────────────

export type Tab = "home" | "map" | "reviews" | "profile";
export type Screen =
  | { name: "detail"; id: string }
  | { name: "add" }
  | { name: "navigate"; id: string }
  | { name: "settings" }
  | { name: "list"; kind: "favorites" | "contrib" | "myreviews" }
  | { name: "info"; kind: "about" | "privacy" };

export type Theme = "light" | "dark";

export const DEMO_EMAIL = "demo@kmitl.ac.th";

interface Auth {
  loggedIn: boolean;
  email: string;
}

type NewRestroom = Pick<
  Restroom,
  "name" | "building" | "floor" | "location" | "facilities"
> &
  Partial<Pick<Restroom, "accessibility" | "notes" | "photo">>;

interface Store {
  theme: Theme;
  setTheme: (t: Theme) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  auth: Auth;
  displayName: string;
  lastEmail: string;
  login: (email: string, remember: boolean) => void;
  logout: () => void;
  restrooms: Restroom[];
  reviews: Review[];
  getRestroom: (id: string) => Restroom | undefined;
  addRestroom: (r: NewRestroom) => Restroom;
  addReview: (restroomId: string, rating: number, text: string) => Review;
  deleteReview: (id: string) => void;
  helped: string[];
  toggleHelpful: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  reports: Report[];
  addReport: (r: Omit<Report, "id" | "createdAt">) => void;
  resetData: () => void;
  query: string;
  setQuery: (q: string) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  tab: Tab;
  stack: Screen[];
  goTab: (t: Tab) => void;
  push: (s: Screen) => void;
  back: () => void;
  reviewsFocus: string | null;
  setReviewsFocus: (id: string | null) => void;
  openReviews: (id: string) => void;
  toast: string | null;
  showToast: (m: string) => void;
}

const Ctx = createContext<Store | null>(null);

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};

const nameFromEmail = (email: string) => {
  if (email.toLowerCase() === DEMO_EMAIL) return "Komsan P.";
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!local) return "Student";
  return local
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersisted<Theme>(K.theme, "light");
  const [settings, setSettings] = usePersisted(K.settings, {
    reduceMotion: false,
    notifications: true,
  });

  const [auth, setAuth] = useState<Auth>(() => {
    const a =
      read<Auth | null>(ls(), K.auth, null) ??
      read<Auth | null>(ss(), K.auth, null);
    return a?.loggedIn ? a : { loggedIn: false, email: "" };
  });
  const [lastEmail, setLastEmail] = useState(() => read(ls(), K.email, ""));

  const [community, setCommunity] = usePersisted<Restroom[]>(K.restrooms, []);
  const [myReviews, setMyReviews] = usePersisted<Review[]>(K.reviews, []);
  const [favorites, setFavorites] = usePersisted<string[]>(K.favorites, []);
  const [helped, setHelped] = usePersisted<string[]>(K.helped, []);
  const [reports, setReports] = usePersisted<Report[]>(K.reports, []);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const [tab, setTab] = useState<Tab>("home");
  const [stack, setStack] = useState<Screen[]>([]);
  const [reviewsFocus, setReviewsFocus] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const showToast = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // ─── Firebase Firestore Sync ──────────────────────────────────────────────

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "restrooms"),
        (snapshot) => {
          const list: Restroom[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            list.push({
              id: docSnap.id,
              name: d.name || "",
              building: d.building || "",
              floor: d.floor || "",
              location: d.location || "",
              facilities: Array.isArray(d.facilities) ? d.facilities : [],
              accessibility: d.accessibility || undefined,
              notes: d.notes || undefined,
              photo: d.photo ?? null,
              distanceMin: d.distanceMin ?? null,
              busy: d.busy ?? null,
              cleanliness: d.cleanliness ?? null,
              source: d.source || "community",
              createdAt: d.createdAt || Date.now(),
              mapPos: d.mapPos || null,
            });
          });
          if (list.length > 0) {
            setCommunity(list);
          }
        },
        (err) => console.warn("Firestore sync restrooms warning:", err)
      );
      return () => unsub();
    } catch (e) {
      console.warn("Firestore error:", e);
    }
  }, [setCommunity]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "reviews"),
        (snapshot) => {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            list.push({
              id: docSnap.id,
              restroomId: d.restroomId || "",
              user: d.user || "Student",
              rating: typeof d.rating === "number" ? d.rating : 5,
              text: d.text || "",
              createdAt: d.createdAt || Date.now(),
              helpful: d.helpful || 0,
              source: d.source || "mine",
            });
          });
          if (list.length > 0) {
            setMyReviews(list);
          }
        },
        (err) => console.warn("Firestore sync reviews warning:", err)
      );
      return () => unsub();
    } catch (e) {
      console.warn("Firestore error:", e);
    }
  }, [setMyReviews]);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", theme === "dark");
    el.classList.toggle("hn-reduce", settings.reduceMotion);
    el.style.colorScheme = theme;
  }, [theme, settings.reduceMotion]);

  const restrooms = useMemo(() => {
    const all = [...SEED_RESTROOMS, ...community];
    return all.map((r) => ({
      ...r,
      facilities: Array.isArray(r.facilities) ? r.facilities : [],
    }));
  }, [community]);

  const reviews = useMemo(() => {
    const all = [...SEED_REVIEWS, ...myReviews];
    return all.map((r) =>
      helped.includes(r.id) ? { ...r, helpful: r.helpful + 1 } : r,
    );
  }, [myReviews, helped]);

  const displayName = nameFromEmail(auth.email || DEMO_EMAIL);

  const login = useCallback((email: string, remember: boolean) => {
    const a = { loggedIn: true, email };
    ls()?.removeItem(K.auth);
    ss()?.removeItem(K.auth);
    write(remember ? ls() : ss(), K.auth, a);
    if (remember) {
      write(ls(), K.email, email);
      setLastEmail(email);
    }
    setAuth(a);
    setTab("home");
    setStack([]);
  }, []);

  const logout = useCallback(() => {
    ls()?.removeItem(K.auth);
    ss()?.removeItem(K.auth);
    setAuth({ loggedIn: false, email: "" });
    setTab("home");
    setStack([]);
  }, []);

  const addRestroom = useCallback(
    (r: NewRestroom) => {
      const recId = newId("rr");
      const rec: Restroom = {
        id: recId,
        name: r.name.trim(),
        building: r.building.trim(),
        floor: r.floor,
        location: r.location.trim(),
        facilities: Array.isArray(r.facilities) ? r.facilities : [],
        accessibility: r.accessibility?.trim() || undefined,
        notes: r.notes?.trim() || undefined,
        photo: r.photo ?? null,
        distanceMin: null,
        busy: null,
        cleanliness: null,
        source: "community",
        createdAt: Date.now(),
        mapPos: null,
      };
      setCommunity((c) => [rec, ...c]);

      try {
        setDoc(doc(db, "restrooms", recId), rec).catch((err) =>
          console.error("Firebase save restroom error:", err)
        );
      } catch (e) {
        console.error("Firebase addRestroom error:", e);
      }

      return rec;
    },
    [setCommunity],
  );

  const addReview = useCallback(
    (restroomId: string, rating: number, text: string) => {
      const rvId = newId("rv");
      const rv: Review = {
        id: rvId,
        restroomId,
        user: displayName,
        rating,
        text: text.trim(),
        createdAt: Date.now(),
        helpful: 0,
        source: "mine",
      };
      setMyReviews((l) => [rv, ...l]);

      try {
        setDoc(doc(db, "reviews", rvId), rv).catch((err) =>
          console.error("Firebase save review error:", err)
        );
      } catch (e) {
        console.error("Firebase addReview error:", e);
      }

      return rv;
    },
    [displayName, setMyReviews],
  );

  const deleteReview = useCallback(
    (id: string) => setMyReviews((l) => l.filter((r) => r.id !== id)),
    [setMyReviews],
  );

  const toggleHelpful = useCallback(
    (id: string) =>
      setHelped((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id])),
    [setHelped],
  );

  const toggleFavorite = useCallback(
    (id: string) =>
      setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    [setFavorites],
  );

  const addReport = useCallback(
    (r: Omit<Report, "id" | "createdAt">) =>
      setReports((l) => [{ ...r, id: newId("rp"), createdAt: Date.now() }, ...l]),
    [setReports],
  );

  const resetData = useCallback(() => {
    setCommunity([]);
    setMyReviews([]);
    setFavorites([]);
    setHelped([]);
    setReports([]);
    setStack([]);
  }, [setCommunity, setMyReviews, setFavorites, setHelped, setReports]);

  const getRestroom = useCallback(
    (id: string) => restrooms.find((r) => r.id === id),
    [restrooms],
  );

  const goTab = useCallback((t: Tab) => {
    setStack([]);
    setTab(t);
  }, []);
  const push = useCallback((s: Screen) => setStack((st) => [...st, s]), []);
  const back = useCallback(() => setStack((st) => st.slice(0, -1)), []);
  const openReviews = useCallback((id: string) => {
    setReviewsFocus(id);
    setStack([]);
    setTab("reviews");
  }, []);

  const value: Store = {
    theme,
    setTheme,
    reduceMotion: settings.reduceMotion,
    setReduceMotion: (v) => setSettings((s) => ({ ...s, reduceMotion: v })),
    notifications: settings.notifications,
    setNotifications: (v) => setSettings((s) => ({ ...s, notifications: v })),
    auth,
    displayName,
    lastEmail,
    login,
    logout,
    restrooms,
    reviews,
    getRestroom,
    addRestroom,
    addReview,
    deleteReview,
    helped,
    toggleHelpful,
    favorites,
    toggleFavorite,
    reports,
    addReport,
    resetData,
    query,
    setQuery,
    filters,
    setFilters,
    tab,
    stack,
    goTab,
    push,
    back,
    reviewsFocus,
    setReviewsFocus,
    openReviews,
    toast,
    showToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
