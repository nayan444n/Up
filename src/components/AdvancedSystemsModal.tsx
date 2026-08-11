import React, { useMemo, useState } from 'react';
import { Award, Box, Crown, Layers, Shield, Sparkles, Swords, X, Zap } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { savePlayerStats } from '../utils/storage';
import { soundFx } from '../utils/sound';

interface Props { stats: PlayerStats; onUpdateStats: (stats: PlayerStats) => void; onClose: () => void; }

const MILESTONES = [
  { id: 'kills100', label: '100 KILLS', target: 100, value: 'kills' },
  { id: 'kills500', label: '500 KILLS', target: 500, value: 'kills' },
  { id: 'boss10', label: '10 BOSS WINS', target: 10, value: 'bosses' },
  { id: 'ships6', label: '6 SHIPS UNLOCKED', target: 6, value: 'ships' },
  { id: 'stars30', label: '30 STARS', target: 30, value: 'stars' },
];

export function AdvancedSystemsModal({ stats, onUpdateStats, onClose }: Props) {
  const [tab, setTab] = useState<'LOADOUT'|'COLLECTION'|'PRESTIGE'>('LOADOUT');
  const claimed = stats.milestonesClaimed || [];
  const evolution = stats.weaponEvolutionLevel || 1;
  const prestigeCost = 25000 + (stats.prestigeLevel || 0) * 15000;
  const canPrestige = stats.playerLevel >= 25 && stats.maxLevelUnlocked >= 100 && stats.coins >= prestigeCost;

  const loadout = useMemo(() => ({
    primary: stats.selectedShip,
    secondary: stats.loadoutSecondary || 'MISSILE',
    ability: stats.loadoutAbility || 'CORE_SURGE'
  }), [stats]);

  const update = (patch: Partial<PlayerStats>) => { const next = { ...stats, ...patch }; savePlayerStats(next); onUpdateStats(next); };

  const evolveWeapon = () => {
    const cost = 1200 * evolution;
    if (evolution >= 5 || stats.coins < cost) return;
    soundFx.playPowerUp();
    update({ coins: stats.coins - cost, weaponEvolutionLevel: evolution + 1 });
  };

  const claimMilestone = (m: typeof MILESTONES[number]) => {
    if (claimed.includes(m.id)) return;
    const value = m.value === 'kills' ? stats.totalKills : m.value === 'bosses' ? (stats.bossesDefeated || 0) : m.value === 'ships' ? stats.unlockedShips.length : stats.totalStars;
    if (value < m.target) return;
    soundFx.playPowerUp();
    update({ coins: stats.coins + 500, milestonesClaimed: [...claimed, m.id] });
  };

  const prestige = () => {
    if (!canPrestige) return;
    soundFx.playPowerUp();
    update({
      coins: 1000,
      premiumGems: stats.premiumGems + 20,
      prestigeLevel: (stats.prestigeLevel || 0) + 1,
      playerLevel: 1,
      playerXp: 0,
      weaponEvolutionLevel: 1,
      maxLevelUnlocked: 1,
      currentLevel: 1
    });
  };

  const setLoadout = (key: 'secondary'|'ability', value: string) => {
    update(key === 'secondary' ? { loadoutSecondary: value } : { loadoutAbility: value });
  };

  return <div className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-screen-enter">
    <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-indigo-500/20 bg-slate-900 shadow-2xl p-5 sm:p-7">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div><div className="text-[10px] tracking-[.25em] text-cyan-400 font-black">GALACTIC COMMAND</div><h2 className="text-2xl font-black text-white">ADVANCED SYSTEMS</h2></div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center"><X /></button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {([['LOADOUT',Swords],['COLLECTION',Box],['PRESTIGE',Crown]] as const).map(([name,Icon]) => <button key={name} onClick={()=>setTab(name as typeof tab)} className={`py-2.5 rounded-xl text-[10px] font-black border flex items-center justify-center gap-2 ${tab===name?'bg-indigo-600 border-indigo-400 text-white':'bg-slate-950 border-slate-800 text-slate-400'}`}><Icon className="w-4 h-4"/>{name}</button>)}
      </div>

      {tab==='LOADOUT' && <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4"><div className="text-[9px] text-slate-500 font-black">PRIMARY SHIP</div><div className="text-lg font-black text-white">{loadout.primary}</div><div className="text-[10px] text-cyan-300 mt-1">Selected in Hangar</div></div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"><div className="text-[9px] text-slate-500 font-black">WEAPON EVOLUTION</div><div className="text-lg font-black text-white">LV {evolution} / 5</div><div className="flex gap-1 mt-2">{[1,2,3,4,5].map(i=><span key={i} className={`h-2 flex-1 rounded-full ${i<=evolution?'bg-amber-400':'bg-slate-800'}`}/>)}</div><button onClick={evolveWeapon} disabled={evolution>=5 || stats.coins<1200*evolution} className="w-full mt-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] disabled:opacity-30">{evolution>=5?'MAX EVOLUTION':`EVOLVE · ${1200*evolution} COINS`}</button></div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"><div className="text-xs font-black text-white">SECONDARY WEAPON</div><div className="grid grid-cols-3 gap-2">{['MISSILE','PLASMA','SPREAD'].map(v=><button key={v} onClick={()=>setLoadout('secondary',v)} className={`py-2 rounded-lg text-[10px] font-black border ${loadout.secondary===v?'bg-cyan-600 border-cyan-400 text-white':'bg-slate-900 border-slate-800 text-slate-400'}`}>{v}</button>)}</div><div className="text-xs font-black text-white pt-2">SPECIAL ABILITY</div><div className="grid grid-cols-2 gap-2">{['CORE_SURGE','EMP','SHIELD_BURST','MISSILE_BARRAGE'].map(v=><button key={v} onClick={()=>setLoadout('ability',v)} className={`py-2 rounded-lg text-[10px] font-black border ${loadout.ability===v?'bg-violet-600 border-violet-400 text-white':'bg-slate-900 border-slate-800 text-slate-400'}`}>{v.replace('_',' ')}</button>)}</div></div>
      </div>}

      {tab==='COLLECTION' && <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[
          ['SHIPS',stats.unlockedShips.length,12],['STARS',stats.totalStars,300],['BOSSES',stats.bossesDefeated||0,7],['PRESTIGE',stats.prestigeLevel||0,10]
        ].map(([a,b,c])=><div key={String(a)} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"><div className="text-[9px] text-slate-500 font-black">{a}</div><div className="text-xl font-black text-white">{b}</div><div className="text-[9px] text-slate-600">TARGET {c}</div></div>)}</div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-center gap-2 text-white font-black text-sm mb-3"><Layers className="w-4 h-4 text-cyan-400"/> MILESTONE VAULT</div><div className="space-y-2">{MILESTONES.map(m=>{const value=m.value==='kills'?stats.totalKills:m.value==='bosses'?(stats.bossesDefeated||0):m.value==='ships'?stats.unlockedShips.length:stats.totalStars;const ready=value>=m.target;return <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800"><div><div className="text-xs font-black text-white">{m.label}</div><div className="text-[10px] text-slate-500">{Math.min(value,m.target)} / {m.target}</div></div><button onClick={()=>claimMilestone(m)} disabled={!ready||claimed.includes(m.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[9px] font-black disabled:opacity-30">{claimed.includes(m.id)?'CLAIMED':'+500 COINS'}</button></div>})}</div></div>
      </div>}

      {tab==='PRESTIGE' && <div className="space-y-4">
        <div className="rounded-3xl border border-amber-500/30 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,.14),transparent_60%)] p-7 text-center"><Crown className="w-10 h-10 mx-auto text-amber-400 mb-3"/><div className="text-[10px] tracking-[.3em] text-amber-300 font-black">PRESTIGE RANK</div><div className="text-5xl font-black text-white mt-1">{stats.prestigeLevel||0}</div><p className="text-xs text-slate-400 max-w-md mx-auto mt-3">Reset campaign progression in exchange for permanent prestige recognition and premium rewards.</p><div className="mt-5 grid grid-cols-2 gap-2 text-left"><div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><div className="text-[9px] text-slate-500">REQUIREMENT</div><div className="text-xs font-black text-white">LEVEL 25 + CAMPAIGN 100</div></div><div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><div className="text-[9px] text-slate-500">COST</div><div className="text-xs font-black text-amber-300">{prestigeCost.toLocaleString()} COINS</div></div></div><button onClick={prestige} disabled={!canPrestige} className="w-full mt-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs disabled:opacity-30">{canPrestige?'ENTER PRESTIGE':'LOCKED'}</button></div>
        <div className="grid sm:grid-cols-3 gap-2"><div className="p-3 rounded-xl border border-slate-800 bg-slate-950"><Shield className="w-4 h-4 text-cyan-400"/><div className="text-xs font-black text-white mt-2">SAVE SAFE</div><div className="text-[10px] text-slate-500">Versioned backup remains available.</div></div><div className="p-3 rounded-xl border border-slate-800 bg-slate-950"><Sparkles className="w-4 h-4 text-violet-400"/><div className="text-xs font-black text-white mt-2">LEGACY</div><div className="text-[10px] text-slate-500">Prestige count is permanent.</div></div><div className="p-3 rounded-xl border border-slate-800 bg-slate-950"><Zap className="w-4 h-4 text-amber-400"/><div className="text-xs font-black text-white mt-2">REWARD</div><div className="text-[10px] text-slate-500">+20 premium gems per prestige.</div></div></div>
      </div>}
    </div>
  </div>;
}
