import { useState } from "react";
import {
  Accessibility,
  Building2,
  Camera,
  Check,
  FileText,
  Layers,
  MapPin,
  Tag,
} from "lucide-react";
import { useApp } from "../store";
import { FACILITY_OPTIONS, Restroom, normalizeFloor } from "../data";
import { MascotHappy } from "./Mascots";
import { Btn, Chip, Field, SubHeader, inputCls } from "./ui";

// ─── Firebase Import ────────────────────────────────────────────────────────
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface FormState {
  name: string;
  building: string;
  floor: string;
  location: string;
  facilities: string[];
  accessibility: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  building: "",
  floor: "",
  location: "",
  facilities: [],
  accessibility: "",
  notes: "",
};

const FLOOR_QUICK = ["Basement", "Floor 1", "Floor 2", "Floor 3", "Floor 4"];

// Downscale to keep localStorage / Firestore document size small
const readPhoto = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const max = 480;
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.7));
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });

export default function AddRestroomScreen() {
  const { restrooms, addRestroom, back, push, goTab, setQuery, showToast } =
    useApp();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Restroom | null>(null);

  const buildings = [...new Set(restrooms.map((r) => r.building))];

  const set =
    <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) => {
      setForm((f) => ({ ...f, [k]: v }));
      setErrors((e) => ({ ...e, [k]: undefined }));
    };
  const text =
    (k: "name" | "building" | "floor" | "location" | "accessibility" | "notes") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k)(e.target.value);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await readPhoto(file));
    } catch {
      showToast("Couldn't read that image. Try another one.");
    }
  };

  const submit = async () => {
    if (submitting) return;
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Give this restroom a name.";
    if (!form.building.trim()) e.building = "Which building is it in?";
    if (!form.floor.trim()) e.floor = "Which floor?";
    if (!form.location.trim()) e.location = "Describe how to find it.";
    const floor = normalizeFloor(form.floor);
    if (
      !e.name &&
      !e.building &&
      !e.
