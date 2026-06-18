import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Stars */}
      {[
        { top: "5%", left: "8%", size: 2, delay: "0s", dur: "2.3s" },
        { top: "11%", left: "65%", size: 3, delay: "0.7s", dur: "3.1s" },
        { top: "20%", left: "88%", size: 2, delay: "1.3s", dur: "2.6s" },
        { top: "52%", left: "3%", size: 2, delay: "0.4s", dur: "1.9s" },
        { top: "68%", left: "93%", size: 3, delay: "0.9s", dur: "3.4s" },
        { top: "80%", left: "48%", size: 2, delay: "1.8s", dur: "2.1s" },
        { top: "38%", left: "2%", size: 2, delay: "0.5s", dur: "2.9s" },
        { top: "88%", left: "16%", size: 3, delay: "1.1s", dur: "2.4s" },
        { top: "46%", left: "76%", size: 2, delay: "2s", dur: "1.7s" },
        { top: "28%", left: "34%", size: 2, delay: "0.3s", dur: "3s" },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur} ease-in-out infinite ${s.delay}`,
          }}
        />
      ))}

      {/* Scene */}
      <div className="relative w-[320px] h-[280px] mb-5">
        {/* Planet */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 32%, #2a2a5a 0%, #13133a 55%, #08081a 100%)",
            boxShadow: "0 0 50px 8px rgba(90,80,220,0.18)",
          }}
        >
          <div
            className="absolute w-5 h-5 rounded-full bg-black/25"
            style={{ top: "26%", left: "20%" }}
          />
          <div
            className="absolute w-[11px] h-[11px] rounded-full bg-black/20"
            style={{ top: "54%", left: "58%" }}
          />
          <div
            className="absolute w-[15px] h-[15px] rounded-full bg-black/[.18]"
            style={{ top: "63%", left: "28%" }}
          />
        </div>

        {/* Pulse rings */}
        {[0, 1.5].map((delay, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ animation: `pulseRing 3s ease-out infinite ${delay}s` }}
          >
            <div className="w-[170px] h-[170px] rounded-full border border-purple-400/30" />
          </div>
        ))}

        {/* Orbiting moon */}
        <div
          className="absolute top-1/2 left-1/2 -m-[6px]"
          style={{ animation: "orbit 10s linear infinite" }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffd97d, #e8853a)",
              boxShadow: "0 0 8px rgba(255,180,60,0.6)",
            }}
          />
        </div>

        {/* ✅ ROCKET — fixed, flame erupts from inside nozzle */}
        <div
          className="absolute top-0 right-4"
          style={{ animation: "rocketFly 4s ease-in-out infinite" }}
        >
          <svg width="90" height="210" viewBox="0 0 120 280" fill="none">
            <defs>
              <linearGradient id="flameG1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3300" />
                <stop offset="35%" stopColor="#ff7700" />
                <stop offset="70%" stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flameG2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffff88" />
                <stop offset="40%" stopColor="#ffee44" />
                <stop offset="80%" stopColor="#ffaa00" />
                <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flameG3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#ffffcc" />
                <stop offset="100%" stopColor="#ffffcc" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="nozzleG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#666" />
                <stop offset="100%" stopColor="#333" />
              </linearGradient>
            </defs>

            {/* Flame — drawn FIRST so nozzle overlaps and hides the top */}
            <path
              d="M38 168 Q60 280 82 168 Z"
              fill="url(#flameG1)"
              style={{
                transformBox: "fill-box",
                transformOrigin: "top center",
                animation: "flameOuter 0.11s ease-in-out infinite",
              }}
            />
            <path
              d="M44 168 Q60 255 76 168 Z"
              fill="url(#flameG2)"
              style={{
                transformBox: "fill-box",
                transformOrigin: "top center",
                animation: "flameInner 0.09s ease-in-out infinite",
              }}
            />
            <path
              d="M51 168 Q60 228 69 168 Z"
              fill="url(#flameG3)"
              style={{
                transformBox: "fill-box",
                transformOrigin: "top center",
                animation: "flameCore 0.08s ease-in-out infinite",
              }}
            />

            {/* Nozzle — drawn AFTER flame so it sits on top, hiding flame origin */}
            <path d="M44 148 L36 172 L84 172 L76 148 Z" fill="url(#nozzleG)" />
            <path
              d="M46 148 L44 166 L50 166 L52 148 Z"
              fill="rgba(255,255,255,0.08)"
            />
            <rect x="35" y="168" width="50" height="5" rx="2" fill="#222" />

            {/* Fins */}
            <path d="M44 130 L10 170 L44 155 Z" fill="#cc2222" />
            <path d="M44 130 L22 168 L44 155 Z" fill="#991a1a" />
            <path d="M76 130 L110 170 L76 155 Z" fill="#cc2222" />
            <path d="M76 130 L98 168 L76 155 Z" fill="#991a1a" />

            {/* Body */}
            <rect x="38" y="72" width="44" height="80" rx="6" fill="#f0ecf8" />
            <rect
              x="38"
              y="72"
              width="8"
              height="80"
              rx="3"
              fill="rgba(0,0,0,0.06)"
            />
            <rect
              x="74"
              y="72"
              width="8"
              height="80"
              rx="3"
              fill="rgba(0,0,0,0.06)"
            />

            {/* Red stripe */}
            <rect x="38" y="132" width="44" height="20" rx="3" fill="#cc2222" />
            <rect x="38" y="132" width="8" height="20" rx="2" fill="#991a1a" />
            <rect x="74" y="132" width="8" height="20" rx="2" fill="#991a1a" />

            {/* Window */}
            <circle cx="60" cy="104" r="18" fill="#c8c4f0" opacity="0.9" />
            <circle cx="60" cy="104" r="14" fill="#1a1a3e" />
            <circle cx="60" cy="104" r="10" fill="#0e0e38" />
            <circle cx="54" cy="98" r="4" fill="rgba(255,255,255,0.35)" />
            <circle cx="65" cy="110" r="2" fill="rgba(255,255,255,0.12)" />

            {/* Nose cone */}
            <path d="M60 4 L82 72 L38 72 Z" fill="#cc2222" />
            <path d="M60 4 L70 72 L60 72 Z" fill="#991a1a" />
            <path d="M60 4 L50 72 L60 72 Z" fill="#e02222" />
          </svg>
        </div>

        {/* Astronaut */}
        <div
          className="absolute bottom-0 left-2"
          style={{ animation: "floatAstronaut 5s ease-in-out infinite" }}
        >
          <svg width="74" height="90" viewBox="0 0 74 90" fill="none">
            <rect x="21" y="37" width="32" height="30" rx="8" fill="#e8e4f0" />
            <circle
              cx="37"
              cy="28"
              r="16"
              fill="#d4d0e8"
              stroke="#aaa8e0"
              strokeWidth="2"
            />
            <path
              d="M25 26 Q37 39 49 26 Q49 15 37 15 Q25 15 25 26Z"
              fill="#1a1a4a"
              opacity="0.88"
            />
            <rect x="7" y="39" width="14" height="10" rx="5" fill="#d4d0e8" />
            <rect x="53" y="39" width="14" height="10" rx="5" fill="#d4d0e8" />
            <circle cx="10" cy="50" r="5" fill="#aaa8e0" />
            <circle cx="64" cy="50" r="5" fill="#aaa8e0" />
            <rect x="23" y="65" width="11" height="18" rx="5" fill="#d4d0e8" />
            <rect x="40" y="65" width="11" height="18" rx="5" fill="#d4d0e8" />
            <ellipse cx="28" cy="83" rx="8" ry="4.5" fill="#aaa8e0" />
            <ellipse cx="46" cy="83" rx="8" ry="4.5" fill="#aaa8e0" />
            <rect
              x="30"
              y="45"
              width="14"
              height="8"
              rx="3"
              fill="#cc2222"
              opacity="0.75"
            />
            <circle cx="37" cy="49" r="2" fill="#ff4444" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="text-center relative z-10">
        <div className="text-[86px] font-medium text-white leading-none tracking-tighter relative inline-block">
          404
          <div
            className="absolute inset-0 text-[86px] font-medium leading-none tracking-tighter text-[#cc2222] pointer-events-none"
            style={{ animation: "glitch 5s linear infinite" }}
          >
            404
          </div>
        </div>
        <p className="text-lg text-zinc-400 mt-1 mb-0.5 font-medium">
          Houston, we have a problem.
        </p>
        <p className="text-sm text-zinc-600 mb-6">
          This page flew off into deep space and never came back.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#cc2222] hover:bg-[#991a1a] text-white px-8 py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          ← Take me home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
