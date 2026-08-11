import React from 'react';
import { CalendarDays, Check, Gem, Gift, LogIn, Sparkles, X } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { claimDailyLogin, claimDailyMission, claimDailyChest, ensureDailyState } from '../utils/progression';
import { xpForLevel } from '../utils/progression';
import { soundFx } from '../utils/sound';

interface Props { stats: PlayerStats; onUpdateStats: (stats: PlayerStats) => void; onClose: () => void; }

export const DailyMissionsModal: React.FC<Props> = ({ stats, onUpdateStats, onClose }) => {
  const daily = ensureDailyState(stats);
  const progress = Math.min(100, Math.round((daily.playerXp / xpForLevel(daily.playerLevel)) * 100));
  const loginReady = !daily.dailyState.loginClaimed;

  const doLogin = () => {
    if (!loginReady) return;
    soundFx.playPowerUp();
    onUpdateStats(claimDailyLogin(daily));
  };

  const claim = (id: string) => {
    const next = claimDailyMission(daily, id);
    if (next !== daily) {
      soundFx.playPowerUp();
      onUpdateStats(next);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-screen-enter">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-cyan-500/25 bg-slate-900 shadow-2xl shadow-cyan-950/30">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-cyan-300" /></div>
            <div><h2 className="text-lg font-black text-white">DAILY COMMAND</h2><p className="text-[10px] text-slate-400">Missions refresh every day</p></div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-black text-indigo-200 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> COMMAND LEVEL {daily.playerLevel}</span><span className="text-[10px] font-mono text-cyan-300">{daily.playerXp}/{xpForLevel(daily.playerLevel)} XP</span></div>
            <div className="h-2 rounded-full bg-slate-950 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-[10px] text-slate-500">Permanent progression: XP, level rewards and ship/module progress are saved on this device.</p>
          </div>

          <button onClick={doLogin} disabled={!loginReady} className={`w-full rounded-2xl p-4 border flex items-center justify-between ${loginReady ? 'border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/15' : 'border-slate-800 bg-slate-950/70 opacity-60'}`}>
            <div className="flex items-center gap-3"><LogIn className="w-5 h-5 text-amber-300" /><div className="text-left"><div className="text-xs font-black text-white">DAILY LOGIN REWARD</div><div className="text-[10px] text-slate-400">+75 coins · +1 premium gem</div></div></div>
            <span className="text-[10px] font-black text-amber-300">{loginReady ? 'CLAIM' : 'CLAIMED'}</span>
          </button>

          {daily.dailyState.missions.map((m) => {
            const done = m.progress >= m.target;
            return <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-black text-white flex items-center gap-2">{m.title}{m.claimed && <Check className="w-3.5 h-3.5 text-emerald-400" />}</div><div className="text-[10px] text-slate-500 mt-1">{m.kind === 'KILLS' ? 'Destroy enemy ships' : m.kind === 'COINS' ? 'Collect battlefield coins' : 'Defeat a boss'}</div></div><div className="text-right text-[9px] font-mono text-slate-400">{m.progress}/{m.target}</div></div>
              <div className="h-2 rounded-full bg-slate-900 mt-3 overflow-hidden"><div className={`h-full ${done ? 'bg-emerald-400' : 'bg-cyan-400'}`} style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }} /></div>
              <div className="flex items-center justify-between mt-3"><span className="text-[10px] text-amber-300 font-bold">+{m.coinsReward} coins</span><span className="text-[10px] text-cyan-300 font-bold flex items-center gap-1"><Gem className="w-3 h-3" /> +{m.gemsReward}</span><button disabled={!done || m.claimed} onClick={() => claim(m.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black disabled:opacity-30">{m.claimed ? 'CLAIMED' : done ? 'CLAIM REWARD' : 'IN PROGRESS'}</button></div>
            </div>;
          })}

          <button disabled={!daily.dailyState.missions.every((m) => m.claimed) || daily.dailyState.chestClaimed} onClick={() => { const next = claimDailyChest(daily); if (next !== daily) { soundFx.playPowerUp(); onUpdateStats(next); } }} className="w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 flex items-center justify-between disabled:opacity-40"><div className="flex items-center gap-3"><Gift className="w-5 h-5 text-amber-300" /><div className="text-left"><div className="text-xs font-black text-white">DAILY COMMAND CHEST</div><div className="text-[10px] text-slate-400">Complete all 3 missions → +500 coins · +5 gems</div></div></div><span className="text-[10px] font-black text-amber-300">{daily.dailyState.chestClaimed ? 'CLAIMED' : 'OPEN CHEST'}</span></button>

          <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-3 text-[10px] text-fuchsia-200 flex items-center gap-2"><Gift className="w-4 h-4" /> Daily missions and login rewards are designed as the game's free reward track.</div>
        </div>
      </div>
    </div>
  );
};
