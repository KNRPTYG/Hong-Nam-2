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

// Downscale to keep localStorage usage small
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

  const submit = () => {
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
      !e.floor &&
      restrooms.some(
        (r) =>
          r.name.toLowerCase() === form.name.trim().toLowerCase() &&
          r.building.toLowerCase() === form.building.trim().toLowerCase() &&
          r.floor.toLowerCase() === floor.toLowerCase(),
      )
    )
      e.name = "That restroom is already listed.";
    setErrors(e);
    if (Object.keys(e).length) return;

    // match existing building spelling so filters stay consistent
    const building =
      buildings.find((b) => b.toLowerCase() === form.building.trim().toLowerCase()) ??
      form.building.trim();

    setSubmitting(true);
    window.setTimeout(() => {
      const rec = addRestroom({
        name: form.name,
        building,
        floor,
        location: form.location,
        facilities: form.facilities,
        accessibility: form.accessibility,
        notes: form.notes,
        photo,
      });
      setSubmitting(false);
      setCreated(rec);
    }, 900);
  };

  // ── Success ──
  if (created)
    return (
      <div className="px-4 pb-6">
        <div className="pt-10 text-center hn-pop">
          <div className="w-28 mx-auto mb-4">
            <MascotHappy className="w-full h-auto" />
          </div>
          <h1 className="text-[28px] font-black text-hn-ink leading-none tracking-tight">
            You're a legend<span className="text-hn-accent">.</span>
          </h1>
          <p className="text-sm font-semibold text-hn-mute mt-3 mb-5">
            {created.name} is now in your Nearby list and search.
          </p>
        </div>
        <div className="border-2 border-hn-line rounded-2xl bg-hn-card hn-sh-o4 p-4 mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#E35205] text-white border border-hn-line rounded-full px-2.5 py-0.5">
            Community · Pending verification
          </span>
          <p className="text-hn-ink font-black mt-2">{created.name}</p>
          <p className="text-hn-mute text-xs font-semibold">
            {created.building} · {created.floor}
          </p>
          <p className="text-[11px] text-hn-mute font-semibold mt-2">
            Saved in this browser only. It hasn't been officially verified and
            has no map location yet.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Btn
            className="w-full py-3.5"
            onClick={() => {
              setQuery("");
              goTab("home");
            }}
          >
            Return to Nearby
          </Btn>
          <Btn
            variant="light"
            className="w-full"
            onClick={() => {
              back();
              push({ name: "detail", id: created.id });
            }}
          >
            View restroom
          </Btn>
        </div>
      </div>
    );

  return (
    <div className="px-4 pb-8">
      <SubHeader eyebrow="Community" title="Add Restroom" onBack={back} />

      <div className="border-2 border-hn-line rounded-2xl p-4 mb-4 bg-hn-hero hn-sh-o5">
        <p className="text-white text-sm font-bold leading-relaxed">
          Help other students find restrooms 🚻 Fill in the details below.
          Submissions are marked <b>Pending verification</b> and saved on this
          device only.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3"
      >
        <Field id="ar-name" label="Restroom name" icon={<Tag size={12} />} error={errors.name}>
          <input
            id="ar-name"
            value={form.name}
            onChange={text("name")}
            placeholder="e.g. Science Building East Wing"
            aria-invalid={!!errors.name}
            className={inputCls}
          />
        </Field>

        <Field id="ar-building" label="Building" icon={<Building2 size={12} />} error={errors.building}>
          <input
            id="ar-building"
            list="ar-buildings"
            value={form.building}
            onChange={text("building")}
            placeholder="e.g. Science Building"
            aria-invalid={!!errors.building}
            className={inputCls}
          />
          <datalist id="ar-buildings">
            {buildings.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </Field>

        <div>
          <Field id="ar-floor" label="Floor" icon={<Layers size={12} />} error={errors.floor}>
            <input
              id="ar-floor"
              value={form.floor}
              onChange={text("floor")}
              placeholder="e.g. 2, Floor 2, Basement"
              aria-invalid={!!errors.floor}
              className={inputCls}
            />
          </Field>
          <div className="flex flex-wrap gap-2 mt-2">
            {FLOOR_QUICK.map((f) => (
              <Chip key={f} active={normalizeFloor(form.floor) === f} onClick={() => set("floor")(f)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>

        <Field id="ar-loc" label="Location description" icon={<MapPin size={12} />} error={errors.location}>
          <textarea
            id="ar-loc"
            rows={2}
            value={form.location}
            onChange={text("location")}
            placeholder="e.g. Next to the elevator, east corridor"
            aria-invalid={!!errors.location}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-hn-mute mb-2 px-1">
            Facilities <span className="normal-case tracking-normal font-semibold text-hn-faint">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FACILITY_OPTIONS.map((f) => (
              <Chip
                key={f}
                active={form.facilities.includes(f)}
                onClick={() =>
                  set("facilities")(
                    form.facilities.includes(f)
                      ? form.facilities.filter((x) => x !== f)
                      : [...form.facilities, f],
                  )
                }
              >
                {f}
              </Chip>
            ))}
          </div>
        </div>

        <Field id="ar-acc" label="Accessibility info" icon={<Accessibility size={12} />} optional>
          <input
            id="ar-acc"
            value={form.accessibility}
            onChange={text("accessibility")}
            placeholder="e.g. Step-free entrance"
            className={inputCls}
          />
        </Field>

        <Field id="ar-notes" label="Additional notes" icon={<FileText size={12} />} optional>
          <textarea
            id="ar-notes"
            rows={2}
            value={form.notes}
            onChange={text("notes")}
            placeholder="Anything else people should know"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <label className="border-2 border-hn-line border-dashed rounded-2xl px-4 py-5 bg-hn-card flex flex-col items-center justify-center gap-2 cursor-pointer hn-sh-3 focus-within:ring-2 focus-within:ring-hn-accent">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPhoto}
            aria-label="Add a photo (optional)"
          />
          {photo ? (
            <img
              src={photo}
              alt="Restroom preview"
              className="w-full h-32 object-cover rounded-xl border-2 border-hn-line"
            />
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-[#E35205]/15 border-2 border-hn-line flex items-center justify-center">
                <Camera size={18} className="text-hn-accent" />
              </div>
              <p className="text-xs font-bold text-hn-ink">Add a photo</p>
              <p className="text-[10px] text-hn-mute font-semibold">
                Optional, but helps others
              </p>
            </>
          )}
        </label>
        {photo && (
          <button
            type="button"
            onClick={() => setPhoto(null)}
            className="text-xs font-black text-hn-mute underline self-start"
          >
            Remove photo
          </button>
        )}

        <div className="flex gap-3 mt-2">
          <Btn variant="light" className="flex-1" onClick={back} disabled={submitting}>
            Cancel
          </Btn>
          <Btn type="submit" className="flex-[2] py-3.5" disabled={submitting}>
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <Check size={16} /> Submit Restroom
              </>
            )}
          </Btn>
        </div>
      </form>
    </div>
  );
}
