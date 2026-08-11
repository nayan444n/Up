import PremiumCoinIcon from './PremiumCoinIcon';
import React from 'react';
import { PlayerStats } from '../types/game';
import { soundFx } from '../utils/sound';
import { RotateCcw, Shield, Trophy, Smartphone, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  coinsEarned: number;
  stats: PlayerStats;
  onRestart: () => void;
  onOpenShop: () => void;
  onOpenGuide: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coinsEarned,
  stats,
  onRestart,
  onOpenShop,
  onOpenGuide
}) => {
  const isNewHighScore = score > stats.highScore;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">MISSION FAILED</h2>
          <p className="text-xs text-slate-400">Your spaceship was destroyed</p>
        </div>

        {/* Stats Card */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3 font-mono">
          {/* Score */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">FINAL SCORE</span>
            <span className="text-amber-400 font-bold text-base">{score}</span>
          </div>

          {/* New High Score Badge */}
          {isNewHighScore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              NEW HIGH SCORE!
            </div>
          )}

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">HIGH RECORD</span>
            <span className="text-slate-200 font-bold">{Math.max(stats.highScore, score)}</span>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans flex items-center gap-1">
              <PremiumCoinIcon size={14} /> COINS EARNED
            </span>
            <span className="text-amber-400 font-bold">+${coinsEarned}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              onRestart();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenShop();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>HANGAR</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenGuide();
              }}
              className="py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-semibold text-xs border border-indigo-800/60 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK DOWNLOAD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
