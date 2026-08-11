import React, { useEffect, useRef, useState } from 'react';
import spaceBg from '../assets/images/xyporastk_splash_space_background.png';
import beetleShip from '../assets/images/xyporastk_beetle_splash.png';
import { preloadAssets } from '../utils/assetPreloader';
import { soundFx } from '../utils/sound';
import { getSavedQuality } from '../utils/performance';
import { RefreshCw, Sparkles } from 'lucide-react';

interface IntroSplashScreenProps {
  onComplete: () => void;
}

export const IntroSplashScreen: React.FC<IntroSplashScreenProps> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [launch, setLaunch] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundFx.playStartupWhoosh();
  }, []);

  // Lightweight moving stars for a cinematic depth effect.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let last = performance.now();

    const quality = getSavedQuality();
    const starCount = quality === 'LOW' ? 18 : quality === 'MED' ? 30 : 55;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.012 + Math.random() * 0.035,
      size: 0.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const maxDpr = quality === 'LOW' ? 1 : quality === 'MED' ? 1.25 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let lastRender = performance.now();
    const render = (now: number) => {
      const minFrameMs = quality === 'LOW' ? 40 : quality === 'MED' ? 25 : 0;
      if (minFrameMs > 0 && now - lastRender < minFrameMs) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastRender = now;
      const dt = Math.min(32, now - last);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.y += star.speed * dt / 1000;
        if (star.y > 1.05) star.y = -0.03;
        const twinkle = 0.45 + 0.35 * Math.sin(now * 0.002 + star.phase);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#d9f99d';
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let launchTimer: number | undefined;
    let fadeTimer: number | undefined;
    let completeTimer: number | undefined;

    const start = window.setTimeout(() => {
      if (mounted) setOpacity(1);
    }, 40);

    preloadAssets((progress) => {
      if (mounted) setLoadProgress(progress);
    })
      .then(() => {
        if (!mounted) return;
        setIsPreloaded(true);

        // Keep the splash cinematic, but never make the user wait unnecessarily.
        launchTimer = window.setTimeout(() => {
          if (mounted) setLaunch(true);
        }, 1850);
        fadeTimer = window.setTimeout(() => {
          if (mounted) setOpacity(0);
        }, 2500);
        completeTimer = window.setTimeout(() => {
          if (mounted) onComplete();
        }, 2850);
      })
      .catch((err) => {
        console.error('Splash asset loading failed:', err);
        if (mounted) setLoadFailed(true);
      });

    return () => {
      mounted = false;
      window.clearTimeout(start);
      if (launchTimer !== undefined) window.clearTimeout(launchTimer);
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
      if (completeTimer !== undefined) window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleRetry = () => {
    setLoadFailed(false);
    preloadAssets((progress) => setLoadProgress(progress))
      .then(() => {
        setIsPreloaded(true);
        onComplete();
      })
      .catch(() => setLoadFailed(true));
  };

  return (
    <div
      onClick={() => isPreloaded && onComplete()}
      className="fixed inset-0 z-50 overflow-hidden select-none bg-slate-950"
      style={{
        opacity,
        transition: 'opacity 500ms ease-in-out',
        cursor: isPreloaded ? 'pointer' : 'default',
      }}
    >
      <img
        src={spaceBg}
        alt="XYPORASTK STUDIO space background"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/70" />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Premium green energy ring */}
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="h-52 w-52 rounded-full border border-lime-300/20 shadow-[0_0_55px_rgba(132,204,22,0.22)] animate-pulse" />
        <div className="absolute inset-7 rounded-full border border-lime-400/10" />
      </div>

      {/* The exact supplied beetle, animated independently from the background. */}
      <div
        className={`absolute left-1/2 top-[39%] w-[52vw] max-w-[330px] min-w-[190px] -translate-x-1/2 -translate-y-1/2 ${
          launch ? 'splash-beetle-launch' : 'splash-beetle-hover'
        }`}
        style={{ filter: 'drop-shadow(0 0 18px rgba(132,204,22,.45)) drop-shadow(0 0 42px rgba(34,197,94,.22))' }}
      >
        <img
          src={beetleShip}
          alt="XYPORASTK beetle ship"
          className="w-full h-auto"
          draggable={false}
        />
      </div>

      <div className="absolute inset-x-0 bottom-[16%] text-center pointer-events-none">
        <div
          className="font-black tracking-[0.18em] text-[clamp(30px,8vw,62px)] text-white"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,.55), 0 0 28px rgba(132,204,22,.42)',
          }}
        >
          XYPORASTK
        </div>
        <div className="mt-1 text-[clamp(14px,3vw,24px)] font-bold tracking-[0.75em] text-lime-300">
          STUDIO
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 w-[min(82vw,420px)] -translate-x-1/2">
        {!loadFailed ? (
          <>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-lime-300/30 bg-black/60 shadow-[0_0_18px_rgba(132,204,22,.25)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-lime-300 to-green-400 transition-all duration-300"
                style={{ width: `${Math.round(loadProgress * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold tracking-[0.22em] text-lime-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>INITIALIZING {Math.round(loadProgress * 100)}%</span>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-rose-500/50 bg-slate-950/90 p-4 text-center backdrop-blur-md">
            <div className="mb-2 text-xs font-bold tracking-wide text-rose-300">SPLASH ASSET LOAD FAILED</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRetry();
              }}
              className="mx-auto flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> RETRY
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes beetleHover {
          0%, 100% { transform: translate(-50%, -50%) rotate(-2deg) translateY(0); }
          50% { transform: translate(-50%, -50%) rotate(2deg) translateY(-9px); }
        }
        @keyframes beetleLaunch {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
          65% { transform: translate(-50%, -58%) rotate(-2deg) scale(1.06); opacity: 1; }
          100% { transform: translate(-50%, -145%) rotate(-1deg) scale(.72); opacity: 0; }
        }
        .splash-beetle-hover {
          animation: beetleHover 1.7s ease-in-out infinite;
        }
        .splash-beetle-launch {
          animation: beetleLaunch 950ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-beetle-hover { animation: none; }
          .splash-beetle-launch { animation: none; }
        }
      `}</style>
    </div>
  );
};
