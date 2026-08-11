import { PlayerStats } from '../types/game';
import { savePlayerStats } from './storage';

export type DailyMissionKind = 'KILLS' | 'COINS' | 'BOSSES';
export interface DailyMission {
  id: string;
  kind: DailyMissionKind;
  title: string;
  target: number;
  progress: number;
  coinsReward: number;
  gemsReward: number;
  claimed: boolean;
}

export interface DailyState {
  date: string;
  missions: DailyMission[];
  loginClaimed: boolean;
  chestClaimed: boolean;
}

export const xpForLevel = (level: number) => 100 + Math.max(0, level - 1) * 60;

const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function makeDailyMissions(date: string): DailyMission[] {
  const seed = date.split('-').join('').split('').reduce((a, n) => a + Number(n), 0);
  const variants = [
    { kind: 'KILLS' as const, target: 25 + (seed % 3) * 5, title: 'ASTRO HUNTER', coinsReward: 120, gemsReward: 2 },
    { kind: 'COINS' as const, target: 140 + (seed % 4) * 20, title: 'TREASURE RUN', coinsReward: 150, gemsReward: 3 },
    { kind: 'BOSSES' as const, target: 1, title: 'BOSS BREAKER', coinsReward: 250, gemsReward: 5 }
  ];
  return variants.map((m, i) => ({ id: `${date}-${i}`, ...m, progress: 0, claimed: false }));
}

export function ensureDailyState(stats: PlayerStats): PlayerStats {
  const today = dateKey();
  if (stats.dailyState?.date === today && stats.dailyState.missions?.length === 3) return stats;
  const updated = { ...stats, dailyState: { date: today, missions: makeDailyMissions(today), loginClaimed: false, chestClaimed: false } };
  savePlayerStats(updated);
  return updated;
}

export function applyGameplayProgress(stats: PlayerStats, kills: number, coins: number, bosses: number): PlayerStats {
  const base = ensureDailyState(stats);
  const missions = base.dailyState.missions.map((m) => {
    const delta = m.kind === 'KILLS' ? kills : m.kind === 'COINS' ? coins : bosses;
    return { ...m, progress: Math.min(m.target, m.progress + Math.max(0, delta)) };
  });

  const xpGain = Math.max(0, kills) * 5 + Math.max(0, bosses) * 100;
  let level = base.playerLevel;
  let xp = base.playerXp + xpGain;
  let gems = base.premiumGems + Math.max(0, bosses);
  let levelsGained = 0;
  while (level < 999 && xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    gems += 1;
    levelsGained += 1;
  }

  const levelUpCoins = levelsGained * 25;
  // Level 999 is the hard cap; do not accumulate unspendable XP beyond it.
  if (level >= 999) xp = Math.min(xp, Math.max(0, xpForLevel(999) - 1));
  const updated: PlayerStats = {
    ...base,
    playerLevel: level,
    playerXp: xp,
    coins: base.coins + levelUpCoins,
    premiumGems: gems,
    dailyState: { ...base.dailyState, missions }
  };
  if (levelsGained > 0) {
    try { localStorage.setItem('galaxy_last_level_up', String(level)); } catch {}
  }
  savePlayerStats(updated);
  return updated;
}

export function claimDailyLogin(stats: PlayerStats): PlayerStats {
  const base = ensureDailyState(stats);
  if (base.dailyState.loginClaimed) return base;
  const updated = {
    ...base,
    coins: base.coins + 75,
    premiumGems: base.premiumGems + 1,
    dailyState: { ...base.dailyState, loginClaimed: true }
  };
  savePlayerStats(updated);
  return updated;
}

export function claimDailyMission(stats: PlayerStats, missionId: string): PlayerStats {
  const base = ensureDailyState(stats);
  const mission = base.dailyState.missions.find((m) => m.id === missionId);
  if (!mission || mission.claimed || mission.progress < mission.target) return base;
  const updated = {
    ...base,
    coins: base.coins + mission.coinsReward,
    premiumGems: base.premiumGems + mission.gemsReward,
    dailyState: {
      ...base.dailyState,
      missions: base.dailyState.missions.map((m) => m.id === missionId ? { ...m, claimed: true } : m)
    }
  };
  savePlayerStats(updated);
  return updated;
}


export function claimDailyChest(stats: PlayerStats): PlayerStats {
  const base = ensureDailyState(stats);
  const complete = base.dailyState.missions.every((m) => m.claimed);
  if (!complete || base.dailyState.chestClaimed) return base;
  const updated = {
    ...base,
    coins: base.coins + 500,
    premiumGems: base.premiumGems + 5,
    dailyState: { ...base.dailyState, chestClaimed: true }
  };
  savePlayerStats(updated);
  return updated;
}

export function spendPremiumGems(stats: PlayerStats, amount: number): PlayerStats {
  if (amount <= 0 || stats.premiumGems < amount) return stats;
  const updated = { ...stats, premiumGems: stats.premiumGems - amount };
  savePlayerStats(updated);
  return updated;
}
