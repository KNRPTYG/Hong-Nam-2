export const MascotHappy = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 110 145"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Drop shadow */}
    <ellipse
      cx="55"
      cy="140"
      rx="34"
      ry="5"
      fill="black"
      fillOpacity="0.12"
    />

    {/* Crown base */}
    <path
      d="M27 37 L33 18 L46 28 L55 14 L64 28 L77 18 L83 37 Z"
      fill="#E35205"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle
      cx="55"
      cy="14"
      r="4"
      fill="white"
      stroke="#000"
      strokeWidth="2"
    />
    <circle
      cx="33"
      cy="18"
      r="3"
      fill="white"
      stroke="#000"
      strokeWidth="2"
    />
    <circle
      cx="77"
      cy="18"
      r="3"
      fill="white"
      stroke="#000"
      strokeWidth="2"
    />

    {/* Body */}
    <rect
      x="12"
      y="32"
      width="86"
      height="100"
      rx="16"
      fill="white"
      stroke="#000"
      strokeWidth="2.8"
    />

    {/* Top tube ellipse */}
    <ellipse
      cx="55"
      cy="40"
      rx="24"
      ry="9"
      fill="#EDE0D0"
      stroke="#000"
      strokeWidth="2.5"
    />
    <ellipse
      cx="55"
      cy="40"
      rx="12"
      ry="4.5"
      fill="#D0BEA8"
      stroke="#000"
      strokeWidth="1.8"
    />

    {/* Paper perforation lines */}
    <line
      x1="12"
      y1="58"
      x2="98"
      y2="58"
      stroke="#000"
      strokeWidth="0.5"
      strokeDasharray="3 6"
    />
    <line
      x1="12"
      y1="72"
      x2="98"
      y2="72"
      stroke="#000"
      strokeWidth="0.5"
      strokeDasharray="3 6"
    />

    {/* Left arm */}
    <path
      d="M12 82 Q-2 76 0 64 Q2 55 12 61"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Right arm – raised/waving */}
    <path
      d="M98 76 Q112 64 106 50 Q102 40 94 48"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Left eye white */}
    <ellipse
      cx="40"
      cy="90"
      rx="11"
      ry="12"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
    />
    {/* Left pupil */}
    <ellipse cx="42" cy="92" rx="6" ry="6.5" fill="#000" />
    {/* Left shine */}
    <circle cx="44.5" cy="88.5" r="2.5" fill="white" />

    {/* Right eye white */}
    <ellipse
      cx="70"
      cy="90"
      rx="11"
      ry="12"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
    />
    {/* Right pupil */}
    <ellipse cx="72" cy="92" rx="6" ry="6.5" fill="#000" />
    {/* Right shine */}
    <circle cx="74.5" cy="88.5" r="2.5" fill="white" />

    {/* Eyebrows – confident arc */}
    <path
      d="M29 76 Q40 70 51 76"
      stroke="#000"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M59 76 Q70 70 81 76"
      stroke="#000"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Smile */}
    <path
      d="M43 107 Q55 118 67 107"
      stroke="#000"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Blush circles */}
    <ellipse
      cx="28"
      cy="100"
      rx="9"
      ry="6"
      fill="#E35205"
      fillOpacity="0.22"
    />
    <ellipse
      cx="82"
      cy="100"
      rx="9"
      ry="6"
      fill="#E35205"
      fillOpacity="0.22"
    />

    {/* Paper tail hanging */}
    <rect
      x="62"
      y="129"
      width="26"
      height="14"
      rx="4"
      fill="white"
      stroke="#000"
      strokeWidth="2"
    />
    <line
      x1="62"
      y1="136"
      x2="88"
      y2="136"
      stroke="#000"
      strokeWidth="0.7"
      strokeDasharray="2.5 4"
    />
  </svg>
);

export const MascotSurprised = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 110 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse
      cx="55"
      cy="126"
      rx="30"
      ry="4"
      fill="black"
      fillOpacity="0.1"
    />
    <rect
      x="12"
      y="18"
      width="86"
      height="102"
      rx="16"
      fill="white"
      stroke="#000"
      strokeWidth="2.8"
    />
    <ellipse
      cx="55"
      cy="26"
      rx="24"
      ry="9"
      fill="#EDE0D0"
      stroke="#000"
      strokeWidth="2.5"
    />
    <ellipse
      cx="55"
      cy="26"
      rx="12"
      ry="4.5"
      fill="#D0BEA8"
      stroke="#000"
      strokeWidth="1.8"
    />
    <line
      x1="12"
      y1="44"
      x2="98"
      y2="44"
      stroke="#000"
      strokeWidth="0.5"
      strokeDasharray="3 6"
    />
    <path
      d="M12 78 Q-2 72 0 60 Q2 51 12 57"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M98 78 Q112 72 110 60 Q108 51 98 57"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Big surprised round eyes */}
    <circle
      cx="40"
      cy="78"
      r="13"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
    />
    <circle cx="43" cy="79" r="7" fill="#000" />
    <circle cx="46" cy="75" r="3" fill="white" />
    <circle
      cx="70"
      cy="78"
      r="13"
      fill="white"
      stroke="#000"
      strokeWidth="2.5"
    />
    <circle cx="73" cy="79" r="7" fill="#000" />
    <circle cx="76" cy="75" r="3" fill="white" />
    {/* Raised eyebrows */}
    <path
      d="M28 62 Q40 55 52 61"
      stroke="#000"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M58 61 Q70 55 82 62"
      stroke="#000"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* O-mouth */}
    <ellipse
      cx="55"
      cy="104"
      rx="8"
      ry="9"
      fill="#000"
      stroke="#000"
      strokeWidth="1"
    />
    <ellipse cx="55" cy="104" rx="5" ry="6" fill="#333" />
    {/* Blush */}
    <ellipse
      cx="26"
      cy="90"
      rx="8"
      ry="5"
      fill="#E35205"
      fillOpacity="0.25"
    />
    <ellipse
      cx="84"
      cy="90"
      rx="8"
      ry="5"
      fill="#E35205"
      fillOpacity="0.25"
    />
    {/* Sweat drop */}
    <path
      d="M91 22 Q95 16 99 22 Q99 28 95 28 Q91 28 91 22 Z"
      fill="#6BA3FF"
      stroke="#000"
      strokeWidth="1.5"
    />
  </svg>
);
