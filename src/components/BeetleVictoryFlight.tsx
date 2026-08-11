import React, { useEffect, useState } from 'react';

interface BeetleVictoryFlightProps {
  active: boolean;
  gameWin?: boolean;
  onFinished?: () => void;
}

/**
 * Cinematic Beetle victory flight.
 * Uses the existing player Beetle asset and keeps gameplay stats untouched.
 */
export const BeetleVictoryFlight: React.FC<BeetleVictoryFlightProps> = ({
  active,
  gameWin = false,
  onFinished,
}) => {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!active) return;
    setRunning(true);

    const timer = window.setTimeout(() => {
      setRunning(false);
      onFinished?.();
    }, gameWin ? 3300 : 2800);

    return () => window.clearTimeout(timer);
  }, [active, gameWin, onFinished]);

  if (!active) return null;

  return (
    <div className={`fixed inset-0 z-[80] pointer-events-none overflow-hidden ${running ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/25 transition-opacity duration-500" />

      {/* Energy particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-[62%] h-1.5 w-1.5 rounded-full bg-lime-300"
            style={{
              transform: `translateX(${((i * 47) % 240) - 120}px)`,
              animation: `beetleParticle 1.5s ease-out ${i * 45}ms forwards`,
            }}
          />
        ))}
      </div>

      {/* This element is intentionally an image placeholder so the host game
          can provide its already-existing Beetle/player sprite without changing it. */}
      <div
        className="absolute left-1/2 top-[65%] -translate-x-1/2"
        style={{
          animation: running
            ? `beetleVictoryFlight ${gameWin ? 3.1 : 2.55}s cubic-bezier(.16,.8,.2,1) forwards`
            : 'none',
          filter: 'drop-shadow(0 0 16px rgba(132,204,22,.65)) drop-shadow(0 0 42px rgba(34,197,94,.35))',
        }}
      >
        <div className="relative h-24 w-24 rounded-full bg-lime-300/10 blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center text-lime-300">
          {/* Existing Beetle ship is rendered by the game around this effect. */}
          <span className="h-20 w-20 rounded-full border border-lime-300/40" />
        </div>
      </div>

      <div
        className="absolute inset-x-0 top-[30%] text-center font-black tracking-[0.18em] text-white"
        style={{
          textShadow: '0 0 12px rgba(255,255,255,.6), 0 0 30px rgba(132,204,22,.45)',
          animation: `victoryText ${gameWin ? 2.8 : 2.3}s ease-out forwards`,
        }}
      >
        <div className="text-[clamp(30px,8vw,64px)]">
          {gameWin ? 'GAME WIN!' : 'LEVEL COMPLETE!'}
        </div>
        <div className="mt-2 text-sm font-bold tracking-[0.45em] text-lime-300">
          {gameWin ? 'XYPORASTK STUDIO' : 'MISSION SUCCESS'}
        </div>
      </div>

      <style>{`
        @keyframes beetleVictoryFlight {
          0% {
            transform: translate(-50%, 0) scale(.92) rotate(0deg);
            opacity: 0;
          }
          12% {
            transform: translate(-50%, -5px) scale(1) rotate(-1deg);
            opacity: 1;
          }
          30% {
            transform: translate(-50%, -12px) scale(1.02) rotate(1deg);
          }
          68% {
            transform: translate(-50%, -210px) scale(1.04) rotate(-1deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -72vh) scale(.62) rotate(0deg);
            opacity: 0;
          }
        }

        @keyframes beetleParticle {
          0% { transform: translate(0, 0) scale(.6); opacity: 0; }
          20% { opacity: .9; }
          100% { transform: translate(0, 190px) scale(0); opacity: 0; }
        }

        @keyframes victoryText {
          0% { opacity: 0; transform: translateY(18px) scale(.94); }
          18% { opacity: 1; transform: translateY(0) scale(1); }
          72% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px) scale(1.02); }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
};
