import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Restroom } from "./data";

export const DEMO_EMAIL = "student@campus.edu";
export const DEMO_PASSWORD = "password123";

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
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ name: string; id?: string }>>([{ name: "home" }]);

  // ดึงข้อมูล Real-time จาก Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "restrooms"), (snapshot) => {
      const fetched: Restroom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          ...data,
          facilities: data.facilities || [],
        } as Restroom);
      });
      setRestrooms(fetched);
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
