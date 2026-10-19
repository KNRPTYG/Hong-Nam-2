export default function LivingBackground() {
  return (
          <svg
            className="hn-bg-svg"
            width="100%"
            height="852"
            viewBox="0 0 430 852"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "852px",
            }}
          >
            <defs>
              <pattern
                id="dotmatrix"
                width="18"
                height="18"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="1"
                  cy="1"
                  r="0.85"
                  fill="#1a1a1a"
                  fillOpacity="0.052"
                />
              </pattern>

              {/* ── Animation keyframes ──────────────────────── */}
              <style>{`
                @keyframes hn-haloBreath {
                  0%,100% { opacity:1; }
                  50%      { opacity:0.18; }
                }
                @keyframes hn-coreGlow {
                  0%,100% { opacity:1; }
                  50%      { opacity:0.55; }
                }
                @keyframes hn-driftL {
                  0%,100% { transform:translateX(0px); }
                  50%      { transform:translateX(-9px); }
                }
                @keyframes hn-driftR {
                  0%,100% { transform:translateX(0px); }
                  50%      { transform:translateX(8px); }
                }
                @keyframes hn-floatU {
                  0%,100% { transform:translateY(0px); }
                  50%      { transform:translateY(-6px); }
                }
                @keyframes hn-floatD {
                  0%,100% { transform:translateY(0px); }
                  50%      { transform:translateY(5px); }
                }
                @keyframes hn-dimPulse {
                  0%,100% { opacity:1; }
                  50%      { opacity:0.35; }
                }
                /* Node halos */
                #hn-n1h { animation: hn-haloBreath 5s   ease-in-out infinite; }
                #hn-n1c { animation: hn-coreGlow   5s   ease-in-out infinite; animation-delay:-0.6s; }
                #hn-n2  { animation: hn-haloBreath 6.2s ease-in-out infinite; animation-delay:-1.8s; }
                #hn-n3  { animation: hn-haloBreath 4.8s ease-in-out infinite; animation-delay:-2.5s; }
                #hn-n4h { animation: hn-haloBreath 5.8s ease-in-out infinite; animation-delay:-0.9s; }
                #hn-n4c { animation: hn-coreGlow   5.8s ease-in-out infinite; animation-delay:-1.4s; }
                #hn-n5  { animation: hn-haloBreath 4.5s ease-in-out infinite; animation-delay:-3.1s; }
                #hn-n6  { animation: hn-haloBreath 6s   ease-in-out infinite; animation-delay:-1.1s; }
                /* Waves */
                #hn-wU  { animation: hn-driftL 9s   ease-in-out infinite; }
                #hn-wL  { animation: hn-driftR 8s   ease-in-out infinite; animation-delay:-2.2s; }
                /* Shapes */
                #hn-sBar  { animation: hn-floatU  6.5s ease-in-out infinite; animation-delay:-1s; }
                #hn-sRot  { animation: hn-floatD  7.5s ease-in-out infinite; animation-delay:-0.5s; }
                #hn-sLow  { animation: hn-floatU  5.8s ease-in-out infinite; animation-delay:-1.9s; }
                #hn-sSm1  { animation: hn-dimPulse 4.5s ease-in-out infinite; animation-delay:-2s; }
                #hn-sSm2  { animation: hn-dimPulse 5.5s ease-in-out infinite; animation-delay:-0.7s; }
              `}</style>
            </defs>

            {/* ── 1. Base dot field ────────────────────────── */}
            <rect
              width="430"
              height="852"
              fill="url(#dotmatrix)"
            />

            {/* ── 2. Architectural blueprint grid — static ─── */}
            <line
              x1="0"
              y1="60"
              x2="430"
              y2="60"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="120"
              x2="430"
              y2="120"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="180"
              x2="430"
              y2="180"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="240"
              x2="430"
              y2="240"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="300"
              x2="430"
              y2="300"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="360"
              x2="430"
              y2="360"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="420"
              x2="430"
              y2="420"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="480"
              x2="430"
              y2="480"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="540"
              x2="430"
              y2="540"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="600"
              x2="430"
              y2="600"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="660"
              x2="430"
              y2="660"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="0"
              y1="720"
              x2="430"
              y2="720"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="0"
              y1="780"
              x2="430"
              y2="780"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="60"
              y1="0"
              x2="60"
              y2="852"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="120"
              y1="0"
              x2="120"
              y2="852"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="180"
              y1="0"
              x2="180"
              y2="852"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="240"
              y1="0"
              x2="240"
              y2="852"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="300"
              y1="0"
              x2="300"
              y2="852"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />
            <line
              x1="360"
              y1="0"
              x2="360"
              y2="852"
              stroke="#000"
              strokeWidth="0.6"
              strokeOpacity="0.068"
            />
            <line
              x1="420"
              y1="0"
              x2="420"
              y2="852"
              stroke="#000"
              strokeWidth="0.35"
              strokeOpacity="0.042"
            />

            {/* ── 3. Perspective grid — static ────────────── */}
            <line
              x1="-30"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="70"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="160"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="275"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="365"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="460"
              y1="852"
              x2="215"
              y2="490"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.05"
            />
            <line
              x1="0"
              y1="570"
              x2="430"
              y2="570"
              stroke="#000"
              strokeWidth="0.3"
              strokeOpacity="0.04"
            />
            <line
              x1="0"
              y1="640"
              x2="430"
              y2="640"
              stroke="#000"
              strokeWidth="0.3"
              strokeOpacity="0.04"
            />
            <line
              x1="0"
              y1="710"
              x2="430"
              y2="710"
              stroke="#000"
              strokeWidth="0.3"
              strokeOpacity="0.04"
            />
            <line
              x1="0"
              y1="785"
              x2="430"
              y2="785"
              stroke="#000"
              strokeWidth="0.3"
              strokeOpacity="0.04"
            />

            {/* ── 4. Dotted wave bands — drift animated ────── */}
            <g id="hn-wU">
              <path
                d="M -20 272 C 55 242, 148 308, 238 275 S 358 255 450 272"
                fill="none"
                stroke="#000"
                strokeWidth="1.3"
                strokeOpacity="0.095"
                strokeDasharray="2 13"
                strokeLinecap="round"
              />
              <path
                d="M -20 283 C 70 253, 162 318, 250 286 S 372 267 450 283"
                fill="none"
                stroke="#000"
                strokeWidth="0.7"
                strokeOpacity="0.05"
                strokeDasharray="1.5 20"
                strokeLinecap="round"
              />
            </g>
            <g id="hn-wL">
              <path
                d="M -20 598 C 85 568, 198 628, 308 594 S 400 578 450 598"
                fill="none"
                stroke="#000"
                strokeWidth="1.3"
                strokeOpacity="0.085"
                strokeDasharray="2 13"
                strokeLinecap="round"
              />
              <path
                d="M -20 612 C 92 582, 204 640, 316 608 S 405 592 450 612"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.85"
                strokeOpacity="0.13"
                strokeDasharray="1.5 20"
                strokeLinecap="round"
              />
            </g>

            {/* ── 5. Data network connection lines — static ── */}
            <line
              x1="393"
              y1="90"
              x2="318"
              y2="162"
              stroke="#E35205"
              strokeWidth="0.75"
              strokeOpacity="0.22"
              strokeDasharray="4 5"
            />
            <line
              x1="318"
              y1="162"
              x2="250"
              y2="312"
              stroke="#E35205"
              strokeWidth="0.6"
              strokeOpacity="0.15"
              strokeDasharray="3 9"
            />
            <line
              x1="250"
              y1="312"
              x2="365"
              y2="500"
              stroke="#E35205"
              strokeWidth="0.55"
              strokeOpacity="0.12"
            />
            <line
              x1="365"
              y1="500"
              x2="60"
              y2="622"
              stroke="#E35205"
              strokeWidth="0.5"
              strokeOpacity="0.1"
              strokeDasharray="3 8"
            />
            <line
              x1="365"
              y1="500"
              x2="396"
              y2="722"
              stroke="#E35205"
              strokeWidth="0.5"
              strokeOpacity="0.1"
            />

            {/* ── 5a. Node 1 — halos breathe, core glows ───── */}
            <g id="hn-n1h">
              <circle
                cx="393"
                cy="90"
                r="30"
                fill="#E35205"
                fillOpacity="0.035"
              />
              <circle
                cx="393"
                cy="90"
                r="18"
                fill="#E35205"
                fillOpacity="0.065"
              />
              <circle
                cx="393"
                cy="90"
                r="18"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.6"
                strokeOpacity="0.15"
              />
            </g>
            <g id="hn-n1c">
              <circle
                cx="393"
                cy="90"
                r="9"
                fill="#E35205"
                fillOpacity="0.13"
              />
              <circle
                cx="393"
                cy="90"
                r="3.5"
                fill="#E35205"
                fillOpacity="1"
              />
              <circle
                cx="393"
                cy="90"
                r="9"
                fill="none"
                stroke="#E35205"
                strokeWidth="1.1"
                strokeOpacity="0.38"
              />
            </g>

            {/* ── 5b. Node 2 ────────────────────────────────── */}
            <g id="hn-n2">
              <circle
                cx="318"
                cy="162"
                r="14"
                fill="#E35205"
                fillOpacity="0.05"
              />
              <circle
                cx="318"
                cy="162"
                r="7"
                fill="#E35205"
                fillOpacity="0.1"
              />
              <circle
                cx="318"
                cy="162"
                r="2.5"
                fill="#E35205"
                fillOpacity="0.9"
              />
              <circle
                cx="318"
                cy="162"
                r="7"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.8"
                strokeOpacity="0.25"
              />
            </g>

            {/* ── 5c. Node 3 ────────────────────────────────── */}
            <g id="hn-n3">
              <circle
                cx="250"
                cy="312"
                r="11"
                fill="#E35205"
                fillOpacity="0.045"
              />
              <circle
                cx="250"
                cy="312"
                r="5.5"
                fill="#E35205"
                fillOpacity="0.09"
              />
              <circle
                cx="250"
                cy="312"
                r="2"
                fill="#E35205"
                fillOpacity="0.85"
              />
              <circle
                cx="250"
                cy="312"
                r="5.5"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.7"
                strokeOpacity="0.22"
              />
            </g>

            {/* ── 5d. Node 4 — halos + core ─────────────────── */}
            <g id="hn-n4h">
              <circle
                cx="365"
                cy="500"
                r="20"
                fill="#E35205"
                fillOpacity="0.04"
              />
              <circle
                cx="365"
                cy="500"
                r="11"
                fill="#E35205"
                fillOpacity="0.08"
              />
              <circle
                cx="365"
                cy="500"
                r="11"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.9"
                strokeOpacity="0.2"
              />
            </g>
            <g id="hn-n4c">
              <circle
                cx="365"
                cy="500"
                r="4.5"
                fill="#E35205"
                fillOpacity="0.95"
              />
            </g>

            {/* ── 5e. Node 5 ────────────────────────────────── */}
            <g id="hn-n5">
              <circle
                cx="60"
                cy="622"
                r="9"
                fill="#E35205"
                fillOpacity="0.06"
              />
              <circle
                cx="60"
                cy="622"
                r="2"
                fill="#E35205"
                fillOpacity="0.75"
              />
              <circle
                cx="60"
                cy="622"
                r="9"
                fill="none"
                stroke="#E35205"
                strokeWidth="0.6"
                strokeOpacity="0.18"
              />
            </g>

            {/* ── 5f. Node 6 ────────────────────────────────── */}
            <g id="hn-n6">
              <circle
                cx="396"
                cy="722"
                r="15"
                fill="#E35205"
                fillOpacity="0.045"
              />
              <circle
                cx="396"
                cy="722"
                r="7.5"
                fill="#E35205"
                fillOpacity="0.09"
              />
              <circle
                cx="396"
                cy="722"
                r="2.5"
                fill="#E35205"
                fillOpacity="0.88"
              />
            </g>

            {/* ── 6. Geometric paper-cut shapes — float ────── */}
            <g id="hn-sBar">
              <rect
                x="-2"
                y="162"
                width="16"
                height="78"
                fill="#E35205"
                fillOpacity="0.1"
              />
            </g>
            <g id="hn-sRot">
              <rect
                x="348"
                y="28"
                width="88"
                height="88"
                fill="none"
                stroke="#000"
                strokeWidth="1.3"
                strokeOpacity="0.065"
                transform="rotate(11 392 72)"
              />
            </g>
            <g id="hn-sLow">
              <rect
                x="20"
                y="782"
                width="64"
                height="18"
                fill="#E35205"
                fillOpacity="0.1"
              />
            </g>
            <g id="hn-sSm1">
              <rect
                x="402"
                y="388"
                width="14"
                height="14"
                fill="#E35205"
                fillOpacity="0.2"
              />
            </g>
            <g id="hn-sSm2">
              <rect
                x="12"
                y="478"
                width="20"
                height="20"
                fill="none"
                stroke="#000"
                strokeWidth="1"
                strokeOpacity="0.1"
              />
            </g>

            {/* Thin orange bar — static */}
            <rect
              x="0"
              y="96"
              width="42"
              height="3"
              fill="#E35205"
              fillOpacity="0.15"
            />

            {/* ── 7. Large circle rings — static ───────────── */}
            <circle
              cx="430"
              cy="852"
              r="195"
              fill="none"
              stroke="#000"
              strokeWidth="0.65"
              strokeOpacity="0.048"
            />
            <circle
              cx="430"
              cy="852"
              r="126"
              fill="none"
              stroke="#000"
              strokeWidth="0.45"
              strokeOpacity="0.038"
            />
            <circle
              cx="0"
              cy="0"
              r="148"
              fill="none"
              stroke="#E35205"
              strokeWidth="0.6"
              strokeOpacity="0.07"
            />
            <circle
              cx="0"
              cy="0"
              r="96"
              fill="none"
              stroke="#000"
              strokeWidth="0.4"
              strokeOpacity="0.04"
            />

            {/* ── 8. Corner registration marks — static ────── */}
            <path
              d="M22 52 L22 30 L44 30"
              fill="none"
              stroke="#000"
              strokeWidth="1.3"
              strokeOpacity="0.15"
              strokeLinecap="square"
            />
            <path
              d="M408 52 L408 30 L386 30"
              fill="none"
              stroke="#000"
              strokeWidth="1.3"
              strokeOpacity="0.15"
              strokeLinecap="square"
            />
            <path
              d="M22 800 L22 822 L44 822"
              fill="none"
              stroke="#000"
              strokeWidth="1.3"
              strokeOpacity="0.1"
              strokeLinecap="square"
            />
            <path
              d="M408 800 L408 822 L386 822"
              fill="none"
              stroke="#000"
              strokeWidth="1.3"
              strokeOpacity="0.1"
              strokeLinecap="square"
            />

            {/* ── 9. Plus crosshairs — static ──────────────── */}
            <line
              x1="393"
              y1="50"
              x2="393"
              y2="68"
              stroke="#E35205"
              strokeWidth="1.6"
              strokeOpacity="0.52"
              strokeLinecap="round"
            />
            <line
              x1="384"
              y1="59"
              x2="402"
              y2="59"
              stroke="#E35205"
              strokeWidth="1.6"
              strokeOpacity="0.52"
              strokeLinecap="round"
            />
            <line
              x1="44"
              y1="700"
              x2="44"
              y2="716"
              stroke="#000"
              strokeWidth="1.1"
              strokeOpacity="0.14"
              strokeLinecap="round"
            />
            <line
              x1="36"
              y1="708"
              x2="52"
              y2="708"
              stroke="#000"
              strokeWidth="1.1"
              strokeOpacity="0.14"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="370"
              x2="22"
              y2="382"
              stroke="#E35205"
              strokeWidth="0.9"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="376"
              x2="28"
              y2="376"
              stroke="#E35205"
              strokeWidth="0.9"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />

            {/* ── 10. Measurement tick marks — static ──────── */}
            <line
              x1="424"
              y1="120"
              x2="430"
              y2="120"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="180"
              x2="430"
              y2="180"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="240"
              x2="430"
              y2="240"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="300"
              x2="430"
              y2="300"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="360"
              x2="430"
              y2="360"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="420"
              x2="430"
              y2="420"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="480"
              x2="430"
              y2="480"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="540"
              x2="430"
              y2="540"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="600"
              x2="430"
              y2="600"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="660"
              x2="430"
              y2="660"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
            <line
              x1="424"
              y1="720"
              x2="430"
              y2="720"
              stroke="#000"
              strokeWidth="0.7"
              strokeOpacity="0.1"
            />
          </svg>
  );
}
