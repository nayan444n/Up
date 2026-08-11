import React, { useMemo, useState } from 'react';
import { loadPlayerStats, resetPlayerStats, savePlayerStats, validatePlayerStats } from '../utils/storage';
import { getLastPerformanceSnapshot } from '../utils/performance';
import { ECONOMY_RULES } from '../utils/balance';
import { soundFx } from '../utils/sound';

interface Props { onClose: () => void; onStatsChanged?: () => void; }

export const DebugPanel: React.FC<Props> = ({ onClose, onStatsChanged }) => {
  const [message, setMessage] = useState('');
  const [snapshot, setSnapshot] = useState(getLastPerformanceSnapshot());
  const [stats, setStats] = useState(loadPlayerStats());

  const enabled = useMemo(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === '1', []);
  if (!enabled) return null;

  const patch = (changes: Partial<typeof stats>) => {
    const next = validatePlayerStats({ ...stats, ...changes });
    savePlayerStats(next); setStats(next); onStatsChanged?.(); soundFx.playClick();
    setMessage('DEBUG SAVE UPDATED');
  };

  return <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm p-4 overflow-auto">
    <div className="mx-auto max-w-2xl rounded-3xl border border-violet-500/40 bg-slate-950 p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-black text-violet-200">DEV / QA PANEL</h2><p className="text-[11px] text-slate-500">Only available with ?debug=1</p></div><button onClick={onClose} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold">CLOSE</button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button onClick={() => patch({ coins: ECONOMY_RULES.maxCoins })} className="debug-btn">MAX COINS</button>
        <button onClick={() => patch({ premiumGems: 99999 })} className="debug-btn">MAX GEMS</button>
        <button onClick={() => patch({ maxLevelUnlocked: 100, currentLevel: 100 })} className="debug-btn">UNLOCK 100</button>
        <button onClick={() => patch({ unlockedShips: ['ALPHA','CRIMSON','AZURE','GOLDEN','PURPLE','EMERALD','ICE','SHADOW_GREEN','NEON','SOLAR','VOID','PRISM'] })} className="debug-btn">ALL SHIPS</button>
        <button onClick={() => patch({ playerLevel: 100, playerXp: 0 })} className="debug-btn">MAX LEVEL</button>
        <button onClick={() => patch({ weaponEvolutionLevel: 5 })} className="debug-btn">MAX WEAPON</button>
        <button onClick={() => patch({ prestigeLevel: Math.min(99, (stats.prestigeLevel || 0) + 1) })} className="debug-btn">+ PRESTIGE</button>
        <button onClick={() => { resetPlayerStats(); setStats(loadPlayerStats()); onStatsChanged?.(); setMessage('SAVE RESET'); }} className="debug-btn debug-danger">RESET SAVE</button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2 text-xs">
        <div className="flex justify-between"><span>Player Level</span><b>{stats.playerLevel}</b></div>
        <div className="flex justify-between"><span>Coins</span><b>{stats.coins.toLocaleString()}</b></div>
        <div className="flex justify-between"><span>Gems</span><b>{stats.premiumGems.toLocaleString()}</b></div>
        <div className="flex justify-between"><span>High Score</span><b>{stats.highScore.toLocaleString()}</b></div>
        <div className="flex justify-between"><span>Prestige</span><b>{stats.prestigeLevel || 0}</b></div>
      </div>
      <div className="mt-3 rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-4 text-xs"><div className="font-bold text-cyan-200 mb-2">PERFORMANCE</div>{snapshot ? <div>FPS {snapshot.fps} · frame {snapshot.frameMs.toFixed(1)}ms · dropped {snapshot.droppedFrames} · {snapshot.quality}</div> : <div className="text-slate-500">No performance sample yet.</div>}<button onClick={() => setSnapshot(getLastPerformanceSnapshot())} className="mt-2 rounded-lg bg-cyan-900/50 px-3 py-1.5 font-bold">REFRESH</button></div>
      {message && <div className="mt-3 text-center text-[11px] font-bold text-emerald-300">{message}</div>}
    </div>
  </div>;
};
