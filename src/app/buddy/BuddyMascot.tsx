export type BuddyMood = "idle" | "thinking" | "success" | "sorry";

const INK = "#000";

export function BuddyMascot({
  mood = "idle",
  className = "",
}: {
  mood?: BuddyMood;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 84 92"
      fill="none"
      className={className}
      role="img"
      aria-label={`HongNam Buddy (${mood})`}
    >
      {/* paper tail */}
      <path
        d="M58 70 C 66 74, 72 80, 66 86 C 62 90, 54 86, 50 84"
        fill="#fff"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* body */}
      <rect x="10" y="20" width="62" height="56" rx="15" fill="#fff" stroke={INK} strokeWidth="3.2" />
      {/* orange band */}
      <path d="M13 63 H69 V69 Q69 73 65 73 H17 Q13 73 13 69 Z" fill="#E35205" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {/* top rim + hole */}
      <ellipse cx="41" cy="22" rx="31" ry="10" fill="#fff" stroke={INK} strokeWidth="3.2" />
      <ellipse cx="41" cy="22" rx="13" ry="4.6" fill="#FAF9F6" stroke={INK} strokeWidth="2.4" />

      {/* cheeks */}
      <ellipse cx="23" cy="50" rx="5.2" ry="3.6" fill="#E35205" fillOpacity="0.9" />
      <ellipse cx="59" cy="50" rx="5.2" ry="3.6" fill="#E35205" fillOpacity="0.9" />

      {mood === "idle" && (
        <>
          <ellipse cx="31" cy="42" rx="3.4" ry="4.4" fill={INK} />
          <ellipse cx="51" cy="42" rx="3.4" ry="4.4" fill={INK} />
          <circle cx="32.2" cy="40.4" r="1.2" fill="#fff" />
          <circle cx="52.2" cy="40.4" r="1.2" fill="#fff" />
          <path d="M45 34 L56 32" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M33 53 Q41 60 49 53" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}
      {mood === "thinking" && (
        <>
          <ellipse cx="32" cy="41" rx="3.4" ry="4.4" fill={INK} />
          <ellipse cx="52" cy="41" rx="3.4" ry="4.4" fill={INK} />
          <circle cx="33.4" cy="39" r="1.3" fill="#fff" />
          <circle cx="53.4" cy="39" r="1.3" fill="#fff" />
          <path d="M26 33 Q31 30 36 32" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="42" cy="55" rx="3.6" ry="2.8" fill={INK} />
        </>
      )}
      {mood === "success" && (
        <>
          <path d="M26 44 Q31 37 36 44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M46 44 Q51 37 56 44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M32 52 Q41 64 50 52 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M37 58 Q41 55 45 58" stroke="#E35205" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {mood === "sorry" && (
        <>
          <ellipse cx="31" cy="43" rx="3.4" ry="4.4" fill={INK} />
          <ellipse cx="51" cy="43" rx="3.4" ry="4.4" fill={INK} />
          <circle cx="32.2" cy="41.4" r="1.2" fill="#fff" />
          <circle cx="52.2" cy="41.4" r="1.2" fill="#fff" />
          <path d="M25 35 L35 32" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M57 35 L47 32" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M34 58 Q41 52 48 58" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center" aria-label="กำลังคิด">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="hn-dot w-1.5 h-1.5 rounded-full bg-hn-accent"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}
