import PremiumCoinIcon from './PremiumCoinIcon';
import React from 'react';
import { PlayerStats } from '../types/game';
import { soundFx } from '../utils/sound';
import { Trophy, X, CheckCircle2, Sparkles, Lock, Crown, Medal, Target, Shield } from 'lucide-react';
import { savePlayerStats } from '../utils/storage';

interface AchievementsModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  reward: number; // coins
  icon: string;
  isUnlocked: (stats: PlayerStats) => boolean;
  getProgress: (stats: PlayerStats) => { current: number; max: number };
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGENDARY';
}

const TIER_META = {
  BRONZE: { label: 'BRONZE', color: 'text-amber-700', border: 'border-amber-800/60', bg: 'bg-amber-950/30', icon: Medal },
  SILVER: { label: 'SILVER', color: 'text-slate-300', border: 'border-slate-500/50', bg: 'bg-slate-800/40', icon: Shield },
  GOLD: { label: 'GOLD', color: 'text-amber-300', border: 'border-amber-500/50', bg: 'bg-amber-500/10', icon: Trophy },
  LEGENDARY: { label: 'LEGENDARY', color: 'text-cyan-300', border: 'border-cyan-400/50', bg: 'bg-cyan-500/10', icon: Crown },
};

const ACHIEVEMENTS: AchievementItem[] = [
  {
    tier: 'BRONZE',
    id: 'lvl1',
    title: 'ROOKIE PILOT',
    desc: 'Complete Level 1 Mission',
    reward: 100,
    icon: '🚀',
    isUnlocked: (s) => s.maxLevelUnlocked > 1,
    getProgress: (s) => ({ current: Math.min(1, s.maxLevelUnlocked - 1), max: 1 })
  },
  {
    tier: 'SILVER',
    id: 'lvl10',
    title: 'SPACE VETERAN',
    desc: 'Reach Mission Level 10',
    reward: 500,
    icon: '🎖️',
    isUnlocked: (s) => s.maxLevelUnlocked >= 10,
    getProgress: (s) => ({ current: Math.min(10, s.maxLevelUnlocked), max: 10 })
  },
  {
    tier: 'LEGENDARY',
    id: 'lvl100',
    title: 'GALAXY COMMANDER',
    desc: 'Beat all 100 Levels',
    reward: 5000,
    icon: '👑',
    isUnlocked: (s) => s.maxLevelUnlocked >= 100,
    getProgress: (s) => ({ current: Math.min(100, s.maxLevelUnlocked), max: 100 })
  },
  {
    tier: 'GOLD',
    id: 'lvl25',
    title: 'DEEP SPACE PILOT',
    desc: 'Reach Mission Level 25',
    reward: 800,
    icon: '🌌',
    isUnlocked: (s) => s.maxLevelUnlocked >= 25,
    getProgress: (s) => ({ current: Math.min(25, s.maxLevelUnlocked), max: 25 })
  },
  {
    tier: 'GOLD',
    id: 'lvl50',
    title: 'STAR COMMANDER',
    desc: 'Reach Mission Level 50',
    reward: 1500,
    icon: '🛰️',
    isUnlocked: (s) => s.maxLevelUnlocked >= 50,
    getProgress: (s) => ({ current: Math.min(50, s.maxLevelUnlocked), max: 50 })
  },
  {
    tier: 'GOLD',
    id: 'lvl75',
    title: 'GALAXY GUARDIAN',
    desc: 'Reach Mission Level 75',
    reward: 2500,
    icon: '🛡️',
    isUnlocked: (s) => s.maxLevelUnlocked >= 75,
    getProgress: (s) => ({ current: Math.min(75, s.maxLevelUnlocked), max: 75 })
  },
  {
    tier: 'LEGENDARY',
    id: 'stars100',
    title: 'STAR COLLECTOR',
    desc: 'Collect 100 mission stars',
    reward: 2000,
    icon: '⭐',
    isUnlocked: (s) => (s.totalStars || 0) >= 100,
    getProgress: (s) => ({ current: Math.min(100, s.totalStars || 0), max: 100 })
  },
  {
    tier: 'BRONZE',
    id: 'coins500',
    title: 'COIN HOARDER',
    desc: 'Accumulate $500 total coins',
    reward: 200,
    icon: '💰',
    isUnlocked: (s) => s.coins >= 500,
    getProgress: (s) => ({ current: Math.min(500, s.coins), max: 500 })
  },
  {
    tier: 'SILVER',
    id: 'ships3',
    title: 'FLEET COLLECTOR',
    desc: 'Unlock 3 distinct starships',
    reward: 1000,
    icon: '🛸',
    isUnlocked: (s) => s.unlockedShips.length >= 3,
    getProgress: (s) => ({ current: Math.min(3, s.unlockedShips.length), max: 3 })
  },
  {
    tier: 'BRONZE',
    id: 'score1000',
    title: 'HIGH SCORER',
    desc: 'Achieve a score over 1,000 points',
    reward: 350,
    icon: '⭐',
    isUnlocked: (s) => s.highScore >= 1000,
    getProgress: (s) => ({ current: Math.min(1000, s.highScore), max: 1000 })
  }
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ stats, onUpdateStats, onClose }) => {
  const [claimed, setClaimed] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('galaxy_claimed_achievements');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = React.useState<'ALL' | 'ACTIVE' | 'CLAIMED'>('ALL');

  const handleClaim = (ach: AchievementItem) => {
    if (claimed.includes(ach.id) || !ach.isUnlocked(stats)) return;
    soundFx.playPowerUp();
    const updatedClaimed = [...claimed, ach.id];
    setClaimed(updatedClaimed);
    try { localStorage.setItem('galaxy_claimed_achievements', JSON.stringify(updatedClaimed)); } catch {}
    const updatedStats = { ...stats, coins: stats.coins + ach.reward };
    onUpdateStats(updatedStats);
    savePlayerStats(updatedStats);
  };

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).length;
  const claimedCount = ACHIEVEMENTS.filter((a) => claimed.includes(a.id)).length;
  const visible = ACHIEVEMENTS.filter((a) => {
    if (filter === 'ACTIVE') return a.isUnlocked(stats) && !claimed.includes(a.id);
    if (filter === 'CLAIMED') return claimed.includes(a.id);
    return true;
  });

  return (
    <div className="fixed inset-0 animate-screen-enter bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none pb-[env(safe-area-inset-bottom,16px)] pt-[env(safe-area-inset-top,16px)]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 to-cyan-400/15 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-950/30">
              <Trophy className="w-5.5 h-5.5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">ACHIEVEMENT VAULT</h2>
              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-[0.18em]">{unlockedCount}/{ACHIEVEMENTS.length} unlocked · {claimedCount} claimed</p>
            </div>
          </div>
          <button onClick={() => { soundFx.playClick(); onClose(); }} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 my-4 relative z-10">
          {(['ALL', 'ACTIVE', 'CLAIMED'] as const).map((key) => {
            const count = key === 'ALL' ? ACHIEVEMENTS.length : key === 'ACTIVE' ? ACHIEVEMENTS.filter(a => a.isUnlocked(stats) && !claimed.includes(a.id)).length : claimedCount;
            return (
              <button key={key} onClick={() => setFilter(key)} className={`rounded-xl border px-2 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${filter === key ? 'bg-indigo-600/25 border-indigo-400/50 text-indigo-200' : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                {key} <span className="font-mono opacity-70">{count}</span>
              </button>
            );
          })}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-2 py-2 text-[10px] sm:text-xs font-black text-amber-300 flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5" /> {Math.round((claimedCount / ACHIEVEMENTS.length) * 100)}%
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1 relative z-10">
          {visible.map((ach) => {
            const unlocked = ach.isUnlocked(stats);
            const isClaimed = claimed.includes(ach.id);
            const prog = ach.getProgress(stats);
            const pct = Math.max(0, Math.min(100, Math.round((prog.current / prog.max) * 100)));
            const tier = TIER_META[ach.tier];
            const TierIcon = tier.icon;
            return (
              <div key={ach.id} className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${unlocked ? 'bg-slate-950 border-indigo-500/35 shadow-md shadow-indigo-950/20' : 'bg-slate-950/60 border-slate-800/80'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${tier.bg} ${tier.border} ${unlocked ? '' : 'grayscale opacity-70'}`}>
                    {unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-white truncate">{ach.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border ${tier.bg} ${tier.border} ${tier.color} font-black tracking-wider`}><TierIcon className="w-3 h-3" />{tier.label}</span>
                      {isClaimed && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full font-black">CLAIMED</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ach.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className={`h-full transition-all duration-500 ${unlocked ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-slate-700'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">{prog.current}/{prog.max}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {unlocked && !isClaimed ? (
                      <button onClick={() => handleClaim(ach)} className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> CLAIM
                      </button>
                    ) : isClaimed ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold font-mono px-2 py-1.5 bg-emerald-950/50 rounded-xl border border-emerald-800/50"><CheckCircle2 className="w-3.5 h-3.5" /> DONE</div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-amber-400/80 text-[10px] font-mono font-bold"><PremiumCoinIcon size={15} /><span>+{ach.reward}</span></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <div className="py-14 text-center text-slate-500 text-sm">No achievements in this filter yet.</div>}
        </div>

        <button onClick={() => { soundFx.playClick(); onClose(); }} className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shrink-0 active:scale-95 transition-all relative z-10">CLOSE VAULT</button>
      </div>
    </div>
  );
};
