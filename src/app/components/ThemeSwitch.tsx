import { Moon, Sun } from "lucide-react";
import { useApp, Theme } from "../store";

export default function ThemeSwitch() {
  const { theme, setTheme } = useApp();
  const opts: { id: Theme; label: string; Icon: typeof Sun }[] = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
  ];
  return (
    <div
      role="group"
      aria-label="Theme"
      className="grid grid-cols-2 gap-2 p-1.5 border-2 border-hn-line rounded-2xl bg-hn-soft"
    >
      {opts.map(({ id, label, Icon }) => {
        const on = theme === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => setTheme(id)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-black transition-colors ${
              on
                ? "bg-[#E35205] text-white border-hn-line hn-neon"
                : "border-transparent text-hn-mute"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        );
      })}
    </div>
  );
}
