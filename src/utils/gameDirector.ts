export interface DirectorContext {
  level: number;
  playerHealthRatio: number;
  recentDeaths: number;
  runKills: number;
  bossActive: boolean;
}

export interface DirectorProfile {
  spawnIntervalMs: number;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  bossAttackMultiplier: number;
  rewardMultiplier: number;
}

/**
 * Bounded difficulty director: adjusts pacing without making rewards or
 * damage spike unpredictably. The health/death modifiers are intentionally
 * small so the system cannot feel like rubber-banding.
 */
export function getDirectorProfile(ctx: DirectorContext): DirectorProfile {
  const level = Math.max(1, Math.min(100, Math.floor(ctx.level)));
  const tier = Math.floor((level - 1) / 10);
  const health = Math.max(0, Math.min(1, ctx.playerHealthRatio));
  const survivalRelief = health < 0.30 ? 1.14 : health > 0.85 ? 0.94 : 1;
  const deathRelief = Math.min(0.12, Math.max(0, ctx.recentDeaths) * 0.03);
  const killPressure = Math.min(0.08, Math.max(0, ctx.runKills) / 5000);
  const difficultyFactor = Math.max(0.92, 1 - deathRelief + killPressure);

  return {
    spawnIntervalMs: Math.max(850, (3200 - level * 20 - tier * 35) * survivalRelief * (1 + deathRelief)),
    enemyHpMultiplier: Math.min(2.8, (1 + tier * 0.10 + level * 0.006) * difficultyFactor),
    enemySpeedMultiplier: Math.min(1.9, (1 + tier * 0.025 + level * 0.002) * difficultyFactor),
    bossAttackMultiplier: Math.min(1.7, 1 + tier * 0.045 + killPressure),
    rewardMultiplier: Math.min(1.5, 1 + tier * 0.035)
  };
}
