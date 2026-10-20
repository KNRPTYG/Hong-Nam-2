import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { INITIAL_RESTROOMS, Restroom } from "./data";

interface AppContextType {
  restrooms: Restroom[];
  addRestroom: (restroom: Omit<Restroom, "id"> & { id?: string }) => Restroom;
  back: () => void;
  push: (route: { name: string; id?: string }) => void;
  goTab: (tab: string) => void;
  setQuery: (q: string) => void;
  query: string;
  showToast: (msg: string) => void;
  toast: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [restrooms, setRestrooms] = useState<Restroom[]>(INITIAL_RESTROOMS);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ name: string; id?: string }>>([{ name: "home" }]);

  // ดึงข้อมูลห้องน้ำ Real-time จาก Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "restrooms"), (snapshot) => {
      const fetched: Restroom[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Restroom);
      });
      if (fetched.length > 0) {
        setRestrooms((prev) => {
          const combined = [...fetched];
          INITIAL_RESTROOMS.forEach((init) => {
            if (!combined.some((r) => r.id === init.id)) {
              combined.push(init);
            }
          });
          return combined;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addRestroom = (newR: Omit<Restroom, "id"> & { id?: string }) => {
    const item: Restroom = {
      id: newR.id || String(Date.now()),
      name: newR.name || "",
      building: newR.building || "",
      floor: newR.floor || "",
      location: newR.location || "",
      facilities: newR.facilities || [],
      accessibility: newR.accessibility || "",
      notes: newR.notes || "",
      photo: newR.photo,
    };
    setRestrooms((prev) => [item, ...prev]);
    return item;
  };

  const back = () => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const push = (route: { name: string; id?: string }) => {
    setHistory((prev) => [...prev, route]);
  };

  const goTab = (tab: string) => {
    setHistory([{ name: tab }]);
  };

  return (
    <AppContext.Provider
      value={{
        restrooms,
        addRestroom,
        back,
        push,
        goTab,
        setQuery,
        query,
        showToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
