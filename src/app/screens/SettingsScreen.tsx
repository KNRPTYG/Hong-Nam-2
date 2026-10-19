import { useState } from "react";
import { useApp } from "../store";
import { BrutalCard, Btn, SubHeader, Toggle } from "../components/ui";
import ThemeSwitch from "../components/ThemeSwitch";
import { ConfirmDialog } from "../components/sheets";

const Row = ({
  title,
  sub,
  control,
}: {
  title: string;
  sub: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-hn-line/20 last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-black text-hn-ink">{title}</p>
      <p className="text-[11px] font-semibold text-hn-mute mt-0.5">{sub}</p>
    </div>
    {control}
  </div>
);

export default function SettingsScreen() {
  const {
    back,
    reduceMotion,
    setReduceMotion,
    notifications,
    setNotifications,
    resetData,
    showToast,
    auth,
  } = useApp();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="px-4 pb-8">
      <SubHeader eyebrow="Account" title="Settings" onBack={back} />

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        Appearance
      </p>
      <div className="mb-5">
        <ThemeSwitch />
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        Preferences
      </p>
      <BrutalCard className="px-4 mb-5">
        <Row
          title="Reduce motion"
          sub="Turns off animated backgrounds and transitions."
          control={
            <Toggle
              checked={reduceMotion}
              onChange={setReduceMotion}
              label="Reduce motion"
            />
          }
        />
        <Row
          title="Notifications"
          sub="Simulated setting. No notifications are ever sent."
          control={
            <Toggle
              checked={notifications}
              onChange={setNotifications}
              label="Notifications"
            />
          }
        />
      </BrutalCard>

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        Demo account
      </p>
      <BrutalCard className="p-4 mb-5">
        <p className="text-sm font-black text-hn-ink">{auth.email}</p>
        <p className="text-[11px] font-semibold text-hn-mute mt-0.5">
          Simulated sign-in. Not a real, verified account.
        </p>
      </BrutalCard>

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-hn-mute mb-2">
        Data on this device
      </p>
      <BrutalCard className="p-4 mb-5">
        <p className="text-[11px] font-semibold text-hn-mute mb-3">
          Community restrooms, reviews, favorites and reports live only in this
          browser's storage.
        </p>
        <Btn variant="light" className="w-full" onClick={() => setConfirm(true)}>
          Clear my local data
        </Btn>
      </BrutalCard>

      <BrutalCard className="p-4" tone="soft">
        <p className="text-sm font-black text-hn-ink">HongNam v2.0 · KMITL 2026</p>
        <p className="text-[11px] font-semibold text-hn-mute mt-1 leading-relaxed">
          Frontend prototype. Restroom info, ratings and status are demo data or
          saved locally, not live and not shared with other users or devices.
        </p>
      </BrutalCard>

      {confirm && (
        <ConfirmDialog
          title="Clear local data?"
          body="This removes community restrooms, your reviews, favorites and reports from this browser. Your theme and sign-in stay."
          confirmLabel="Clear data"
          danger
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            resetData();
            setConfirm(false);
            showToast("Local data cleared");
          }}
        />
      )}
    </div>
  );
}
