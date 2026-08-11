export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'LEVEL_SELECT';

export type ShipType =
  | 'ALPHA' | 'CRIMSON' | 'AZURE' | 'GOLDEN' | 'PURPLE' | 'EMERALD'
  | 'ICE' | 'SHADOW_GREEN' | 'NEON' | 'SOLAR' | 'VOID' | 'PRISM';

export interface ShipConfig {
  id: ShipType;
  name: string;
  price: number;
  speed: number;
  fireRate: number; // ms delay
  health: number;
  color: string;
  weaponType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'SPREAD' | 'LASER';
  unlocked: boolean;
  description: string;
}

export interface PlayerStats {
  coins: number;
  highScore: number;
  unlockedShips: ShipType[];
  selectedShip: ShipType;
  maxHealthUpgrade: number; // level 0-5
  firePowerUpgrade: number; // level 0-5
  speedUpgrade: number;     // level 0-5
  maxLevelUnlocked: number; // 1 to 100
  levelStars: Record<number, number>; // level -> 1..3 stars
  currentLevel: number;
  totalMissionsCompleted: number;
  totalStars: number;
  totalKills: number;
  shipMastery: Partial<Record<ShipType, number>>;
  shipParts: { engine: number; weapon: number; shield: number; core: number };
  endlessBestScore: number;
  levelBestScores: Record<number, number>;
  playerLevel: number;
  playerXp: number;
  premiumGems: number;
  criticalHits?: number;
  bossesDefeated?: number;
  totalDamage?: number;
  totalPlaySeconds?: number;
  prestigeLevel?: number;
  weaponEvolutionLevel?: number;
  loadoutSecondary?: string;
  loadoutAbility?: string;
  milestonesClaimed?: string[];
  eliteKills?: number;
  miniBossesDefeated?: number;
  dailyState: {
    date: string;
    missions: Array<{ id: string; kind: 'KILLS' | 'COINS' | 'BOSSES'; title: string; target: number; progress: number; coinsReward: number; gemsReward: number; claimed: boolean }>;
    loginClaimed: boolean;
    chestClaimed: boolean;
  };
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  speed: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  shipType: ShipType;
  weaponType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'SPREAD' | 'LASER';
  weaponLevel: number;
  lastFired: number;
  invulnerableTime: number;
  rapidFireUntil?: number;
  speedBoostUntil?: number;
  scoreMultiplierUntil?: number;
  abilityCooldownUntil?: number;
}

export type EnemyType = 'UFO' | 'ROCKET' | 'SCOUT' | 'FIGHTER' | 'CRUISER' | 'ASTEROID' | 'BOSS';

export type BossVariant = 'VOID_JUGGERNAUT' | 'IRON_MAELSTROM' | 'CELESTIAL_WARDEN' | 'SHADOW_REVENANT' | 'NOVA_DEVOURER' | 'CRYSTAL_TITAN' | 'XENO_OVERLORD';

export interface Enemy extends GameObject {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speedX: number;
  speedY: number;
  points: number;
  lastFired: number;
  color: string;
  scoreValue: number;
  coinValue: number;
  bossPhase?: number;
  isElite?: boolean;
  isMiniBoss?: boolean;
  bossVariant?: BossVariant;
  sineOffset?: number; // for UFO wavy motion
}

export interface Bullet extends GameObject {
  speedX: number;
  speedY: number;
  isEnemy: boolean;
  damage: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

export type PowerUpType = 'HEALTH' | 'SHIELD' | 'TRIPLE_SHOT' | 'BOMB' | 'COIN' | 'LASER' | 'RAPID_FIRE' | 'SPEED_BOOST' | 'SCORE_MULTIPLIER';

export interface PowerUp extends GameObject {
  type: PowerUpType;
  speedY: number;
  color: string;
  symbol: string;
  vx?: number;
  vy?: number;
  spinAngle?: number;
  spinSpeed?: number;
  value?: number;
  magnetized?: boolean;
  coinType?: 'GOLD' | 'DIAMOND' | 'SUPER_GEM';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  brightness: number;
}
