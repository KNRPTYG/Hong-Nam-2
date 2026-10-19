import { useState } from "react";
import {
  BookOpen,
  Bell,
  ChevronRight,
  Heart,
  Info,
  LogOut,
  MapPinPlus,
  Settings,
  Shield,
} from "lucide-react";
import { useApp } from "../store";
import { fmtAvg } from "../data";
import { MascotSurprised } from "../components/Mascots";
import { BrutalCard, PageTitle, Btn } from "../components/ui";
import ThemeSwitch from "../components/ThemeSwitch";
import { ConfirmDialog, ReportSheet } from "../components/sheets";

export default function ProfileScreen() {
  const { displayName, auth, reviews, restrooms, favorites, push, logout } =
    useApp();
  const [confirmOut, setConfirmOut] = useState(false);
  const [reporting, setReporting] = useState(false);

  const mine = reviews.filter((r) => r.source === "mine");
  const added = restrooms.filter((r) => r.source === "community");
  const favCount = favorites.filter((id) => restrooms.some((r) => r.id === id)).length;
  const myAvg = mine.length
    ? mine.reduce((s, r) => s + r.rating, 0) / mine.length
    : null;

  const items = [
    {
      icon: BookOpen,
      label: "My Reviews",
      sub: `${mine.length} review${mine.length === 1 ? "" : "s"} written`,
      go: () => push({ name: "list", kind: "myreviews" }),
    },
    {
      icon: Heart,
      label: "Favorite Spots",
      sub: `${favCount} saved location${favCount === 1 ? "" : "s"}`,
      go: () => push({ name: "list", kind: "favorites" }),
    },
    {
      icon: MapPinPlus,
      label: "My Contributions",
      sub: `${added.length} restroom${added.length === 1 ? "" : "s"} added`,
      go: () => push({ name: "list", kind: "contrib" }),
    },
    {
      icon: Bell,
      label: "Report Issues",
      sub: "Flag wrong or missing info",
      go: () => setReporting(true),
    },
    {
      icon: Shield,
      label: "Privacy & Safety",
      sub: "How your data is handled",
      go: () => push({ name: "info", kind: "privacy" }),
    },
    {
      icon: Settings,
      label: "Settings",
      sub: "Theme, motion, notifications",
      go: () => push({ name: "settings" }),
    },
    {
      icon: Info,
      label: "Help / About HongNam",
      sub: "v2.0.0 · KMITL 2026",
      go: () => push({ name: "info", kind: "about" }),
    },
  ];

  const contributions = mine.length + added.length;

  return (
    <div className="px-4 pb-6">
      <PageTitle eyebrow="Account" title="Profile" />

      {/* Hero */}
      <div className="border-2 border-hn-line rounded-3xl p-5 mb-4 bg-hn-hero hn-sh-o6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 border-2 border-white rounded-2xl bg-[#E35205] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "3px 3px 0 rgba(255,255,255,0.3)" }}
          >
            <span className="text-white text-2xl font-black">
              {displayName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xl font-black tracking-tight leading-tight truncate">
              {displayName}
            </p>
            <p className="text-[#FF7A1E] text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">
              Demo account
            </p>
            <p className="text-white/60 text-[10px] mt-1 font-medium truncate">
              {auth.email}
            </p>
          </div>
        </div>
        <div className="flex mt-4 pt-4 border-t border-white/15">
          {[
            { value: String(mine.length), label: "Reviews" },
            { value: fmtAvg(myAvg), label: "Avg Score" },
            { value: String(favCount), label: "Saved", orange: true },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p
                className={`font-black text-xl leading-none ${s.orange ? "text-[#FF7A1E]" : "text-white"}`}
              >
                {s.value}
              </p>
              <p className="text-white/60 text-[10px] mt-1 font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Theme */}
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        Appearance
      </p>
      <div className="mb-4">
        <ThemeSwitch />
      </div>

      {/* Mascot badge */}
      <BrutalCard
        className="p-3 mb-4 flex items-center gap-3"
        tone="soft"
        shadow="hn-sh-o3"
      >
        <div className="w-12 h-12 flex-shrink-0">
          <MascotSurprised className="w-full h-auto" />
        </div>
        <div>
          <p className="text-hn-ink text-sm font-black">
            {contributions
              ? `${contributions} contribution${contributions === 1 ? "" : "s"} so far. Nice!`
              : "Your first contribution awaits"}
          </p>
          <p className="text-hn-mute text-xs font-semibold mt-0.5">
            {contributions
              ? "Every review and restroom helps someone out."
              : "Post a review or add a missing restroom."}
          </p>
        </div>
      </BrutalCard>

      {items.map((item) => {
        const Icon = item.icon;
        return (
          <BrutalCard
            key={item.label}
            className="p-4 mb-2.5 flex items-center justify-between"
            onClick={item.go}
            label={item.label}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-2 border-hn-line rounded-xl bg-hn-soft flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-hn-ink" />
              </div>
              <div>
                <p className="text-hn-ink text-sm font-black">{item.label}</p>
                <p className="text-hn-mute text-[10px] font-semibold mt-0.5">
                  {item.sub}
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-hn-mute" />
          </BrutalCard>
        );
      })}

      <Btn
        variant="light"
        className="w-full mt-2 py-3.5"
        onClick={() => setConfirmOut(true)}
      >
        <LogOut size={15} /> Log out
      </Btn>

      {confirmOut && (
        <ConfirmDialog
          title="Log out?"
          body="You'll return to the login screen. Your favorites, reviews, added restrooms and theme stay saved on this device."
          confirmLabel="Log out"
          onClose={() => setConfirmOut(false)}
          onConfirm={logout}
        />
      )}
      {reporting && (
        <ReportSheet restroomId={null} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
