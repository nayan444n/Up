import React from 'react';
import { BarChart3, X, Trophy, Target, Clock3, Shield, Rocket, Star, Gem } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { xpForLevel } from '../utils/progression';
import { SHIPS_CONFIG } from '../utils/storage';

interface Props { stats: PlayerStats; onClose: () => void; }

export const StatisticsModal: React.FC<Props> = ({ stats, onClose }) => {
  const xpNeed = xpForLevel(stats.playerLevel);
  const xpPct = Math.min(100, Math.round((stats.playerXp / xpNeed) * 100));
  const bestLevel = Object.entries(stats.levelBestScores).sort((a,b) => Number(b[1])-Number(a[1]))[0];
  const mastery = Object.entries(stats.shipMastery).sort((a,b) => Number(b[1])-Number(a[1]))[0];
  const masteryName = mastery ? SHIPS_CONFIG[mastery[0] as keyof typeof SHIPS_CONFIG]?.name : '—';
  const rank = stats.highScore >= 100000 ? 'GALAXY ELITE' : stats.highScore >= 50000 ? 'STAR COMMANDER' : stats.highScore >= 10000 ? 'ACE PILOT' : stats.highScore >= 2500 ? 'VETERAN' : 'ROOKIE';
  return <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-screen-enter">
    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-cyan-300" /></div><div><h2 className="text-xl font-black text-white">STATISTICS</h2><p className="text-[10px] text-slate-500 font-mono">COMMAND RECORD</p></div></div>
        <button aria-label="Close statistics" onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center"><X className="w-5 h-5 text-slate-300" /></button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Card icon={<Rocket/>} label="KILLS" value={stats.totalKills.toLocaleString()} />
        <Card icon={<Trophy/>} label="HIGH SCORE" value={stats.highScore.toLocaleString()} />
        <Card icon={<Star/>} label="STARS" value={`${stats.totalStars}/300`} />
        <Card icon={<Target/>} label="LEVELS" value={`${stats.maxLevelUnlocked}/100`} />
        <Card icon={<Shield/>} label="SHIPS" value={`${stats.unlockedShips.length}/${Object.keys(SHIPS_CONFIG).length}`} />
        <Card icon={<Gem/>} label="GEMS" value={stats.premiumGems.toLocaleString()} />
        <Card icon={<Trophy/>} label="RANK" value={rank} />
        <Card icon={<Target/>} label="BOSS KILLS" value={String(stats.bossesDefeated || 0)} />
      </div>
      <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4">
        <div className="flex justify-between items-center text-xs font-bold"><span className="text-white">COMMAND LEVEL {stats.playerLevel}</span><span className="text-cyan-300">{stats.playerXp}/{xpNeed} XP</span></div>
        <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{width:`${xpPct}%`}} /></div>
      </div>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <Info label="BEST LEVEL SCORE" value={bestLevel ? `L${bestLevel[0]} • ${Number(bestLevel[1]).toLocaleString()}` : '—'} />
        <Info label="TOP SHIP MASTERY" value={mastery ? `${masteryName} • ${Number(mastery[1]).toLocaleString()} kills` : '—'} />
        <Info label="COINS" value={stats.coins.toLocaleString()} />
        <Info label="BEST ENDLESS" value={stats.endlessBestScore.toLocaleString()} />
        <Info label="CRITICAL HITS" value={(stats.criticalHits || 0).toLocaleString()} />
        <Info label="DAMAGE DEALT" value={(stats.totalDamage || 0).toLocaleString()} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500"><Clock3 className="w-3.5 h-3.5"/> Progress is saved automatically after gameplay milestones.</div>
    </div>
  </div>;
};

const Card=({icon,label,value}:{icon:React.ReactNode;label:string;value:string})=><div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-cyan-300">{React.cloneElement(icon as React.ReactElement,{className:'w-4 h-4'})}<span className="text-[9px] font-black text-slate-500">{label}</span></div><div className="mt-1 text-lg font-black text-white">{value}</div></div>;
const Info=({label,value}:{label:string;value:string})=><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="text-[9px] font-black text-slate-500">{label}</div><div className="mt-1 text-xs font-bold text-slate-200 truncate">{value}</div></div>;
