import React, { useEffect, useRef } from 'react';
import { soundFx } from '../utils/sound';
import { getSavedQuality } from '../utils/performance';
import homeImg from '../assets/images/Home page.png';

interface MainMenuProps {
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenShop: () => void;
  onOpenLevelSelect: () => void;
  onOpenDaily: () => void;
  playerLevel: number;
  premiumGems: number;
  hasAchievementAlert?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOpenSettings,
  onOpenAchievements,
  onOpenShop,
  onOpenLevelSelect,
  onOpenDaily,
  playerLevel,
  premiumGems,
  hasAchievementAlert = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Starfield particle effect canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const quality = getSavedQuality();
    const starCount = quality === 'LOW' ? 18 : quality === 'MED' ? 30 : 50;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.6 + 0.2,
      color: ['#ffffff', '#818cf8', '#fef08a', '#38bdf8', '#e879f9'][Math.floor(Math.random() * 5)],
      pulse: Math.random() * Math.PI,
    }));

    let lastRender = performance.now();
    const render = (now = performance.now()) => {
      const minFrameMs = quality === 'LOW' ? 40 : quality === 'MED' ? 25 : 0;
      if (minFrameMs > 0 && now - lastRender < minFrameMs) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastRender = now;
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => {
        s.y += s.speed;
        s.pulse += 0.02;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }

        const currentSize = s.size + Math.sin(s.pulse) * 0.3;
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.4, currentSize), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Tactile haptic feedback helper
  const triggerHaptic = (ms = 25) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore if unsupported
      }
    }
  };

  const handleAction = (type: 'PLAY' | 'LEVEL' | 'SHOP' | 'ACHIEVEMENT' | 'SETTING') => {
    if (type === 'PLAY') soundFx.playClick();
    else soundFx.playNavigate();
    if (type === 'PLAY') {
      triggerHaptic(35);
      onPlay();
    } else if (type === 'LEVEL') {
      triggerHaptic(20);
      onOpenLevelSelect();
    } else if (type === 'SHOP') {
      triggerHaptic(20);
      onOpenShop();
    } else if (type === 'ACHIEVEMENT') {
      triggerHaptic(20);
      onOpenAchievements();
    } else if (type === 'SETTING') {
      triggerHaptic(20);
      onOpenSettings();
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 animate-screen-enter flex items-center justify-center overflow-hidden select-none">
      {/* Ambient background blur image for widescreen desktops */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-30 filter blur-xl scale-110">
        <img
          src={homeImg}
          alt="Galaxy Defender Home Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dynamic Starfield Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto rounded-2xl bg-slate-950/75 border border-indigo-400/25 backdrop-blur-md px-3 py-1.5 text-[10px] font-black text-indigo-200 shadow-lg">COMMAND LV.{playerLevel}</div>
        <button onClick={() => { soundFx.playNavigate(); onOpenDaily(); }} className="pointer-events-auto rounded-2xl bg-cyan-950/75 border border-cyan-400/35 backdrop-blur-md px-3 py-1.5 text-[10px] font-black text-cyan-200 shadow-lg active:scale-95">DAILY • 💎 {premiumGems}</button>
      </div>

      {/* Main Pixel-Perfect Frame for Home page.png (853 x 1844) */}
      <div className="relative z-10 h-full w-full max-h-[100dvh] aspect-[853/1844] max-w-full flex items-center justify-center mx-auto shadow-2xl overflow-hidden">
        {/* Full Unfiltered Clean Homepage PNG Artwork */}
        <img
          src={homeImg}
          alt="Galaxy Defender Home Page"
          referrerPolicy="no-referrer"
          className="w-full h-full object-fill pointer-events-none select-none drop-shadow-2xl"
        />

        {/* Premium motion layer: the original artwork/text stays untouched.
            Only the character regions get a tiny idle float, while the buttons
            receive a soft ambient glow. */}
        <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(56,189,248,0.10),transparent_32%)] animate-home-ambient"
            aria-hidden="true"
          />

          {/* Non-destructive ambient glow only: the source artwork itself is never moved or duplicated. */}
          <div className="absolute left-[17%] top-[64.8%] w-[66%] h-[5.6%] rounded-[28px] border border-amber-300/0 animate-home-play-glow" />
        </div>

        {/* Hotspot Clickable Overlay: PLAY / LEVEL / SHOP / ACHIEVEMENT / SETTING */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto z-20">
          {/* 1. PLAY */}
          <button
            onPointerUp={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); handleAction('PLAY'); }}
            style={{ top: '65.3%', left: '24.7%', width: '50.6%', height: '5.4%' }}
            className="absolute rounded-[28px] cursor-pointer focus:outline-none transition-all active:scale-95 border-2 border-amber-400/0 hover:border-amber-400/80 hover:bg-amber-400/20 active:bg-amber-400/40 hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]"
            title="PLAY" aria-label="PLAY"
          />

          {/* 2. LEVEL */}
          <button
            onPointerUp={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); handleAction('LEVEL'); }}
            style={{ top: '70.8%', left: '24.7%', width: '50.6%', height: '5.5%' }}
            className="absolute rounded-[28px] cursor-pointer focus:outline-none transition-all active:scale-95 border-2 border-blue-400/0 hover:border-blue-400/80 hover:bg-blue-400/20 active:bg-blue-400/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
            title="LEVEL" aria-label="LEVEL"
          />

          {/* 3. SHOP */}
          <button
            onPointerUp={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); handleAction('SHOP'); }}
            style={{ top: '76.4%', left: '24.7%', width: '50.6%', height: '5.5%' }}
            className="absolute rounded-[28px] cursor-pointer focus:outline-none transition-all active:scale-95 border-2 border-purple-400/0 hover:border-purple-400/80 hover:bg-purple-400/20 active:bg-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]"
            title="SHOP" aria-label="SHOP"
          />

          {/* 4. ACHIEVEMENT */}
          <button
            onPointerUp={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); handleAction('ACHIEVEMENT'); }}
            data-has-alert={hasAchievementAlert ? 'true' : 'false'}
            style={{ top: '82.0%', left: '24.7%', width: '50.6%', height: '5.5%' }}
            className="absolute rounded-[28px] cursor-pointer focus:outline-none transition-all active:scale-95 border-2 border-pink-400/0 hover:border-pink-400/80 hover:bg-pink-400/20 active:bg-pink-400/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.7)]"
            title="ACHIEVEMENT" aria-label="ACHIEVEMENT"
          >
            {hasAchievementAlert && <span className="absolute right-[7%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white/80 shadow-[0_0_12px_rgba(244,63,94,.85)] animate-pulse" aria-hidden="true" />}
          </button>

          {/* 5. SETTING */}
          <button
            onPointerUp={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); handleAction('SETTING'); }}
            style={{ top: '87.7%', left: '24.7%', width: '50.6%', height: '5.8%' }}
            className="absolute rounded-[28px] cursor-pointer focus:outline-none transition-all active:scale-95 border-2 border-cyan-400/0 hover:border-cyan-400/80 hover:bg-cyan-400/20 active:bg-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]"
            title="SETTING" aria-label="SETTING"
          />
        </div>
      </div>
    </div>
  );
};
