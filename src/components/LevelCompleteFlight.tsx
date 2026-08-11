import React, { useEffect, useState } from 'react';
import shipImg from '../assets/images/beetle_player_ship_1785861619870.jpg';

interface LevelCompleteFlightProps {
  active: boolean;
  level: number;
  stars: number;
  onFinished?: () => void;
}

/** Premium post-level transition: the player's ship launches upward into space. */
export const LevelCompleteFlight: React.FC<LevelCompleteFlightProps> = ({
  active,
  level,
  stars,
  onFinished,
}) => {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!active) return;
    setRunning(true);
    const timer = window.setTimeout(() => {
      setRunning(false);
      onFinished?.();
    }, 2050);
    return () => window.clearTimeout(timer);
  }, [active, onFinished]);

  if (!active) return null;

  return (
    <div className="low-perf-backdrop fixed inset-0 z-[90] pointer-events-none overflow-hidden bg-[#020617]/88 backdrop-blur-[2px]">
      <div className="absolute inset-0 level-complete-stars" />
      <div className="absolute left-1/2 top-[55%] h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-1/2 top-[55%] h-40 w-40 -translate-x-1/2 rounded-full border border-cyan-300/20 shadow-[0_0_80px_rgba(34,211,238,.18)]" />

      {/* Engine plume */}
      <div
        className={`absolute left-1/2 top-[63%] -translate-x-1/2 ${running ? 'level-engine-active' : ''}`}
        aria-hidden="true"
      >
        <div className="h-28 w-10 rounded-full bg-gradient-to-b from-white via-cyan-300 to-fuchsia-500 blur-md opacity-90" />
        <div className="absolute left-1/2 top-2 h-24 w-4 -translate-x-1/2 rounded-full bg-white blur-sm" />
      </div>

      {/* Ship */}
      <div
        className={`absolute left-1/2 top-[56%] -translate-x-1/2 ${running ? 'level-ship-launch' : ''}`}
        aria-hidden="true"
      >
        <div className="relative h-24 w-24 sm:h-28 sm:w-28">
          <div className="absolute -inset-5 rounded-full bg-cyan-400/15 blur-2xl" />
          <img
            src={shipImg}
            alt=""
            draggable={false}
            className="relative h-full w-full rounded-2xl object-cover shadow-[0_0_28px_rgba(56,189,248,.55)] ring-1 ring-white/20"
          />
        </div>
      </div>

      <div className="absolute left-0 right-0 top-[22%] text-center text-white">
        <div className="text-[11px] font-black tracking-[.45em] text-cyan-200/80">LEVEL {level}</div>
        <div className="mt-2 text-[clamp(30px,8vw,54px)] font-black tracking-[.08em] text-white drop-shadow-[0_0_22px_rgba(255,255,255,.28)]">
          COMPLETE
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`level-complete-star ${s <= stars ? 'level-complete-star-on' : ''}`}>★</span>
          ))}
        </div>
        <div className="mt-5 text-[9px] font-black tracking-[.32em] text-white/40">LAUNCHING TO NEXT LEVEL</div>
      </div>

      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="level-flight-particle"
          style={{
            left: `${42 + ((i * 17) % 17)}%`,
            top: `${56 + ((i * 13) % 10)}%`,
            animationDelay: `${i * 24}ms`,
          }}
        />
      ))}

      <style>{`
        .level-complete-stars {
          background-image:
            radial-gradient(circle at 20% 22%, rgba(255,255,255,.9) 0 1px, transparent 1.5px),
            radial-gradient(circle at 72% 28%, rgba(125,211,252,.8) 0 1px, transparent 1.5px),
            radial-gradient(circle at 48% 72%, rgba(217,70,239,.8) 0 1px, transparent 1.5px),
            radial-gradient(circle at 86% 68%, rgba(255,255,255,.75) 0 1px, transparent 1.5px);
          background-size: 150px 150px, 190px 190px, 230px 230px, 270px 270px;
          animation: starDrift 2.1s linear infinite;
        }
        .level-ship-launch {
          animation: shipLaunch 2.05s cubic-bezier(.15,.72,.12,1) forwards;
        }
        .level-engine-active {
          animation: engineRise 2.05s cubic-bezier(.15,.72,.12,1) forwards;
          transform-origin: center top;
        }
        .level-complete-star {
          font-size: 27px;
          color: rgba(255,255,255,.16);
          transform: scale(.7);
        }
        .level-complete-star-on {
          color: #fcd34d;
          text-shadow: 0 0 8px rgba(251,191,36,.75), 0 0 20px rgba(245,158,11,.45);
          animation: starPop .5s cubic-bezier(.2,1.4,.3,1) both;
        }
        .level-flight-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #67e8f9;
          box-shadow: 0 0 10px #22d3ee;
          animation: flightParticle 1.4s ease-out forwards;
        }
        @keyframes shipLaunch {
          0% { transform: translate(-50%, 18px) scale(.72) rotate(-1deg); opacity: 0; }
          12% { opacity: 1; transform: translate(-50%, 0) scale(1) rotate(0); }
          38% { transform: translate(-50%, -28px) scale(1.04) rotate(1deg); }
          70% { transform: translate(-50%, -230px) scale(.88) rotate(-1deg); }
          100% { transform: translate(-50%, -78vh) scale(.28) rotate(0); opacity: 0; }
        }
        @keyframes engineRise {
          0% { opacity: 0; transform: translateY(10px) scaleY(.5); }
          15% { opacity: 1; transform: translateY(0) scaleY(1); }
          65% { opacity: .85; transform: translateY(-190px) scaleY(1.35); }
          100% { opacity: 0; transform: translateY(-70vh) scaleY(.45); }
        }
        @keyframes flightParticle {
          0% { opacity: 0; transform: translateY(0) scale(.4); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(160px) scale(0); }
        }
        @keyframes starPop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
        @keyframes starDrift { from { transform: translateY(0); } to { transform: translateY(18px); } }
        @media (prefers-reduced-motion: reduce) {
          .level-ship-launch, .level-engine-active, .level-flight-particle, .level-complete-star-on, .level-complete-stars { animation-duration: .01ms !important; }
        }
      `}</style>
    </div>
  );
};
