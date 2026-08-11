import React, { useEffect } from 'react';
import { Trophy, X, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/sound';

export interface AchievementToastData { id: string; title: string; reward: number; }

export const AchievementUnlockToast: React.FC<{ achievement: AchievementToastData; onClose: () => void }> = ({ achievement, onClose }) => {
  useEffect(() => {
    soundFx.playPowerUp();
    const t = window.setTimeout(onClose, 5200);
    return () => window.clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed left-1/2 top-4 -translate-x-1/2 z-[80] w-[min(92vw,420px)] animate-achievement-pop" role="status">
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl shadow-amber-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,.18),transparent_45%)] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black tracking-[.2em] text-amber-300 uppercase flex items-center gap-1"><Sparkles className="w-3 h-3"/> Achievement Unlocked</div>
            <div className="text-sm font-black text-white truncate">{achievement.title}</div>
            <div className="text-[10px] text-slate-400 font-mono">REWARD +{achievement.reward} COINS</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center" aria-label="Close achievement notification"><X className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
};
