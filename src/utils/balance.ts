export interface DifficultyProfile {
  enemyHp: number;
  enemySpeed: number;
  spawnInterval: number;
  coinMultiplier: number;
  bossHp: number;
}

export function getDifficultyProfile(level: number): DifficultyProfile {
  const safeLevel = Math.max(1, Math.min(100, Math.floor(level)));
  const tier = Math.floor((safeLevel - 1) / 10);
  return {
    enemyHp: 1 + tier * 0.12 + safeLevel * 0.008,
    enemySpeed: 1 + tier * 0.035 + safeLevel * 0.003,
    spawnInterval: Math.max(320, 980 - safeLevel * 5 - tier * 35),
    coinMultiplier: 1 + tier * 0.08,
    bossHp: 1 + tier * 0.22 + safeLevel * 0.012
  };
}

export const ECONOMY_RULES = {
  maxCoins: 999_999_999,
  maxGems: 999_999_999,
  shipUpgradeBase: 300,
  shipUpgradeGrowth: 1.32,
  prestigeRequirementLevel: 100,
  prestigeGemReward: 10,
} as const;

export const RELEASE_BALANCE_CHECKS = [
  'No negative currency or impossible upgrade level',
  'Boss HP scales gradually rather than exponentially',
  'Coin rewards increase slower than upgrade costs',
  'Endless mode does not unlock campaign levels',
  'Prestige requires max player level and keeps cosmetic/progression identity'
] as const;
