import PremiumCoinIcon from './PremiumCoinIcon';
import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, List, Shield, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  level: number;
  score: number;
  coinsEarned: number;
  stars: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  coinsEarned,
  stars,
  onNextLevel,
  onReplay,
  onLevelSelect
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Trophy Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border-2 border-amber-400/50 flex items-center justify-center relative">
          <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-indigo-300 bg-clip-text text-transparent">
            LEVEL {level} VICTORY!
          </h2>
          <p className="text-xs text-slate-400">Mission accomplished successfully</p>
        </div>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-3 py-2 bg-slate-950/60 rounded-2xl border border-slate-800">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-8 h-8 transition-transform duration-300 ${
                s <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'text-slate-800 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Rewards Card */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">SCORE EARNED</span>
            <span className="text-amber-400 font-bold text-base">{score}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-sans flex items-center gap-1">
              <PremiumCoinIcon size={14} /> COINS EARNED
            </span>
            <span className="text-amber-400 font-bold">+${coinsEarned}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {level < 100 ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>NEXT LEVEL {level + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-indigo-950/60 border border-indigo-700/60 rounded-xl text-indigo-300 text-xs font-bold">
              🎉 Congratulations! You have completed all 100 levels!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onLevelSelect}
              className="py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-semibold text-xs border border-indigo-800/60 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <List className="w-3.5 h-3.5 text-indigo-400" />
              <span>LEVEL SELECT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
