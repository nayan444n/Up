import { PlayerStats, ShipConfig, ShipType } from '../types/game';

const STORAGE_KEY = 'space_shooter_player_stats_v2';
const LEGACY_STORAGE_KEY = 'space_shooter_player_stats_v1';
const BACKUP_KEY = 'space_shooter_player_stats_backup_v2';
const ROTATING_BACKUP_KEYS = [
  'space_shooter_player_stats_backup_v2_a',
  'space_shooter_player_stats_backup_v2_b',
  'space_shooter_player_stats_backup_v2_c'
] as const;
const SAVE_FORMAT_VERSION = 5;

function checksum(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function packSave(stats: PlayerStats) {
  const body = JSON.stringify(stats);
  return JSON.stringify({ version: SAVE_FORMAT_VERSION, checksum: checksum(body), stats });
}

function unpackSave(raw: string): PlayerStats | null {
  const parsed = JSON.parse(raw) as { version?: number; checksum?: string; stats?: PlayerStats };
  if (!parsed || typeof parsed !== 'object' || !parsed.stats || typeof parsed.stats !== 'object') return null;
  if (parsed.version !== SAVE_FORMAT_VERSION) return null;
  if (typeof parsed.checksum !== 'string') return null;
  const body = JSON.stringify(parsed.stats);
  if (parsed.checksum !== checksum(body)) return null;
  return validatePlayerStats(parsed.stats);
}

export const SHIPS_CONFIG: Record<ShipType, ShipConfig> = {
  ALPHA: { id: 'ALPHA', name: 'Classic Beetle', price: 0, speed: 6, fireRate: 220, health: 100, color: '#84cc16', weaponType: 'SINGLE', unlocked: true, description: 'The original Beetle ship with the signature green core.' },
  CRIMSON: { id: 'CRIMSON', name: 'Crimson Beetle', price: 450, speed: 6, fireRate: 220, health: 100, color: '#ef4444', weaponType: 'SINGLE', unlocked: false, description: 'Black armor with a fierce crimson energy core.' },
  AZURE: { id: 'AZURE', name: 'Azure Beetle', price: 600, speed: 6, fireRate: 220, health: 100, color: '#38bdf8', weaponType: 'SINGLE', unlocked: false, description: 'Cool blue energy plating with a bright azure core.' },
  GOLDEN: { id: 'GOLDEN', name: 'Golden Beetle', price: 800, speed: 6, fireRate: 220, health: 100, color: '#fbbf24', weaponType: 'SINGLE', unlocked: false, description: 'Premium golden armor with a warm energy glow.' },
  PURPLE: { id: 'PURPLE', name: 'Purple Beetle', price: 1000, speed: 6, fireRate: 220, health: 100, color: '#c084fc', weaponType: 'SINGLE', unlocked: false, description: 'Deep violet armor with an intense purple core.' },
  EMERALD: { id: 'EMERALD', name: 'Emerald Beetle', price: 1200, speed: 6, fireRate: 220, health: 100, color: '#2dd4bf', weaponType: 'SINGLE', unlocked: false, description: 'Elegant emerald energy wings and luminous core.' },
  ICE: { id: 'ICE', name: 'Ice Beetle', price: 1400, speed: 6, fireRate: 220, health: 100, color: '#7dd3fc', weaponType: 'SINGLE', unlocked: false, description: 'Frozen blue armor with crystalline energy wings.' },
  SHADOW_GREEN: { id: 'SHADOW_GREEN', name: 'Shadow Beetle', price: 1600, speed: 6, fireRate: 220, health: 100, color: '#64748b', weaponType: 'SINGLE', unlocked: false, description: 'Dark stealth armor with a restrained green-red core glow.' },
  NEON: { id: 'NEON', name: 'Neon Beetle', price: 1800, speed: 6, fireRate: 220, health: 100, color: '#a3e635', weaponType: 'SINGLE', unlocked: false, description: 'High-energy neon green shell built for a futuristic look.' },
  SOLAR: { id: 'SOLAR', name: 'Solar Beetle', price: 2000, speed: 6, fireRate: 220, health: 100, color: '#fb923c', weaponType: 'SINGLE', unlocked: false, description: 'Solar-orange armor with a blazing core.' },
  VOID: { id: 'VOID', name: 'Void Beetle', price: 2300, speed: 6, fireRate: 220, health: 100, color: '#8b5cf6', weaponType: 'SINGLE', unlocked: false, description: 'Dark cosmic armor surrounded by violet void energy.' },
  PRISM: { id: 'PRISM', name: 'Prism Beetle', price: 2800, speed: 6, fireRate: 220, health: 100, color: '#22d3ee', weaponType: 'SINGLE', unlocked: false, description: 'A premium multi-color prism finish with a luminous core.' }
};

const DEFAULT_STATS: PlayerStats = {
  coins: 100,
  highScore: 0,
  unlockedShips: ['ALPHA'],
  selectedShip: 'ALPHA',
  maxHealthUpgrade: 0,
  firePowerUpgrade: 0,
  speedUpgrade: 0,
  maxLevelUnlocked: 1,
  levelStars: {},
  currentLevel: 1,
  totalMissionsCompleted: 0,
  totalStars: 0,
  totalKills: 0,
  shipMastery: {},
  shipParts: { engine: 0, weapon: 0, shield: 0, core: 0 },
  endlessBestScore: 0,
  levelBestScores: {},
  playerLevel: 1,
  playerXp: 0,
  premiumGems: 0,
  criticalHits: 0,
  bossesDefeated: 0,
  totalDamage: 0,
  totalPlaySeconds: 0,
  prestigeLevel: 0,
  weaponEvolutionLevel: 1,
  loadoutSecondary: 'MISSILE',
  loadoutAbility: 'CORE_SURGE',
  milestonesClaimed: [],
  eliteKills: 0,
  miniBossesDefeated: 0,
  dailyState: { date: '', missions: [], loginClaimed: false, chestClaimed: false }
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}

function sanitizeRecord(input: unknown): Record<number, number> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: Record<number, number> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const n = Number(value);
    const level = Number(key);
    if (Number.isInteger(level) && level >= 1 && level <= 100 && Number.isFinite(n)) {
      out[level] = Math.max(0, Math.floor(n));
    }
  }
  return out;
}

function sanitizeDailyState(input: unknown): PlayerStats['dailyState'] {
  const fallback = { date: '', missions: [], loginClaimed: false, chestClaimed: false } as PlayerStats['dailyState'];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fallback;
  const raw = input as Partial<PlayerStats['dailyState']>;
  const missions = Array.isArray(raw.missions) ? raw.missions.filter((m): m is PlayerStats['dailyState']['missions'][number] => {
    if (!m || typeof m !== 'object') return false;
    const item = m as Partial<PlayerStats['dailyState']['missions'][number]>;
    return typeof item.id === 'string' &&
      (item.kind === 'KILLS' || item.kind === 'COINS' || item.kind === 'BOSSES') &&
      typeof item.title === 'string' && Number.isFinite(Number(item.target)) && Number(item.target) > 0;
  }).map((m) => ({
    id: m.id,
    kind: m.kind,
    title: m.title,
    target: clampInt(m.target, 1, 999999, 1),
    progress: clampInt(m.progress, 0, 999999, 0),
    coinsReward: clampInt(m.coinsReward, 0, 999999, 0),
    gemsReward: clampInt(m.gemsReward, 0, 999999, 0),
    claimed: Boolean(m.claimed)
  })) : [];
  return {
    date: typeof raw.date === 'string' ? raw.date.slice(0, 32) : '',
    missions,
    loginClaimed: Boolean(raw.loginClaimed),
    chestClaimed: Boolean(raw.chestClaimed)
  };
}

export function validatePlayerStats(stats: PlayerStats): PlayerStats {
  const safe = { ...DEFAULT_STATS, ...stats } as PlayerStats;
  if (!stats || typeof stats !== 'object') return { ...DEFAULT_STATS, unlockedShips: ['ALPHA'], levelStars: {}, shipMastery: {}, levelBestScores: {}, dailyState: { ...DEFAULT_STATS.dailyState, missions: [] } };
  safe.coins = clampInt(safe.coins, 0, 999999999, DEFAULT_STATS.coins);
  safe.premiumGems = clampInt(safe.premiumGems, 0, 999999999, 0);
  safe.highScore = clampInt(safe.highScore, 0, 9999999999, 0);
  safe.maxLevelUnlocked = clampInt(safe.maxLevelUnlocked, 1, 100, 1);
  safe.currentLevel = Math.min(safe.maxLevelUnlocked, clampInt(safe.currentLevel, 1, 100, 1));
  safe.playerLevel = clampInt(safe.playerLevel, 1, 999, 1);
  safe.playerXp = clampInt(safe.playerXp, 0, 999999999, 0);
  safe.criticalHits = clampInt(safe.criticalHits, 0, 999999999, 0);
  safe.bossesDefeated = clampInt(safe.bossesDefeated, 0, 999999999, 0);
  safe.totalDamage = clampInt(safe.totalDamage, 0, 999999999999, 0);
  safe.totalPlaySeconds = clampInt(safe.totalPlaySeconds, 0, 999999999, 0);
  safe.prestigeLevel = clampInt(safe.prestigeLevel, 0, 99, 0);
  safe.weaponEvolutionLevel = clampInt(safe.weaponEvolutionLevel, 1, 5, 1);
  safe.milestonesClaimed = Array.from(new Set(Array.isArray(safe.milestonesClaimed) ? safe.milestonesClaimed.filter(x => typeof x === 'string').slice(0, 500) : []));
  safe.levelStars = sanitizeRecord(safe.levelStars);
  for (const key of Object.keys(safe.levelStars)) safe.levelStars[Number(key)] = Math.min(3, safe.levelStars[Number(key)]);
  safe.levelBestScores = sanitizeRecord(safe.levelBestScores);
  safe.shipMastery = (safe.shipMastery && typeof safe.shipMastery === 'object' && !Array.isArray(safe.shipMastery))
    ? Object.fromEntries(Object.entries(safe.shipMastery).filter(([ship, value]) => ship in SHIPS_CONFIG && Number.isFinite(Number(value))).map(([ship, value]) => [ship, Math.max(0, Math.floor(Number(value)))]))
    : {};
  safe.dailyState = sanitizeDailyState(safe.dailyState);
  safe.totalStars = Object.values(safe.levelStars).reduce((sum, value) => sum + value, 0);
  safe.eliteKills = clampInt(safe.eliteKills, 0, 999999999, 0);
  safe.miniBossesDefeated = clampInt(safe.miniBossesDefeated, 0, 999999999, 0);
  safe.unlockedShips = Array.from(new Set((safe.unlockedShips || []).filter((ship): ship is ShipType => ship in SHIPS_CONFIG)));
  if (!safe.unlockedShips.includes('ALPHA')) safe.unlockedShips.unshift('ALPHA');
  if (!safe.unlockedShips.includes(safe.selectedShip)) safe.selectedShip = safe.unlockedShips[0];
  safe.shipParts = {
    engine: clampInt(safe.shipParts?.engine, 0, 5, 0),
    weapon: clampInt(safe.shipParts?.weapon, 0, 5, 0),
    shield: clampInt(safe.shipParts?.shield, 0, 5, 0),
    core: clampInt(safe.shipParts?.core, 0, 5, 0)
  };
  return safe;
}

export function exportSaveData(): string {
  const stats = validatePlayerStats(loadPlayerStats());
  const body = JSON.stringify(stats);
  return JSON.stringify({ version: SAVE_FORMAT_VERSION, exportedAt: new Date().toISOString(), checksum: checksum(body), stats });
}

export function importSaveData(serialized: string): PlayerStats {
  const parsed = JSON.parse(serialized) as { version?: number; stats?: PlayerStats; checksum?: string };
  if (!parsed || !parsed.stats || typeof parsed.stats !== 'object') throw new Error('Invalid save data');
  if (parsed.version !== SAVE_FORMAT_VERSION) throw new Error('Unsupported save version');
  if (typeof parsed.checksum !== 'string' || parsed.checksum !== checksum(JSON.stringify(parsed.stats))) throw new Error('Save checksum mismatch');
  const safe = validatePlayerStats(parsed.stats);
  savePlayerStats(safe);
  return safe;
}

export function loadPlayerStats(): PlayerStats {
  try {
    const candidates = [STORAGE_KEY, BACKUP_KEY, ...ROTATING_BACKUP_KEYS, LEGACY_STORAGE_KEY];
    for (const key of candidates) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let verified: PlayerStats | null = null;
      try {
        verified = key === LEGACY_STORAGE_KEY
          ? validatePlayerStats(JSON.parse(raw) as PlayerStats)
          : unpackSave(raw);
      } catch {
        verified = null;
      }

      if (!verified) continue;

      if (key !== STORAGE_KEY) {
        try { localStorage.setItem(STORAGE_KEY, packSave(verified)); } catch {}
      }
      return verified;
    }
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }

  return {
    ...DEFAULT_STATS,
    unlockedShips: [...DEFAULT_STATS.unlockedShips],
    levelStars: {},
    shipMastery: {},
    levelBestScores: {},
    dailyState: { ...DEFAULT_STATS.dailyState, missions: [] }
  };
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    const safe = validatePlayerStats(stats);
    const payload = packSave(safe);
    const previous = localStorage.getItem(STORAGE_KEY);
    if (previous) {
      const priorA = localStorage.getItem(ROTATING_BACKUP_KEYS[0]);
      const priorB = localStorage.getItem(ROTATING_BACKUP_KEYS[1]);
      if (priorB) localStorage.setItem(ROTATING_BACKUP_KEYS[2], priorB);
      if (priorA) localStorage.setItem(ROTATING_BACKUP_KEYS[1], priorA);
      localStorage.setItem(ROTATING_BACKUP_KEYS[0], previous);
      localStorage.setItem(BACKUP_KEY, previous);
    }
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function addCoinsAndScore(coinsToAdd: number, score: number): PlayerStats {
  const current = loadPlayerStats();
  const updated: PlayerStats = {
    ...current,
    coins: current.coins + coinsToAdd,
    highScore: Math.max(current.highScore, score)
  };
  savePlayerStats(updated);
  return updated;
}

export function completeLevel(level: number, stars: number, coinsEarned: number, score: number): PlayerStats {
  const current = loadPlayerStats();
  const updatedStars = { ...current.levelStars };
  const prevStars = updatedStars[level] || 0;
  if (stars > prevStars) {
    updatedStars[level] = stars;
  }

  const nextUnlocked = Math.min(100, Math.max(current.maxLevelUnlocked, level + 1));

  const updated: PlayerStats = {
    ...current,
    coins: current.coins + coinsEarned,
    highScore: Math.max(current.highScore, score),
    maxLevelUnlocked: nextUnlocked,
    levelStars: updatedStars,
    totalMissionsCompleted: Math.max(current.totalMissionsCompleted || 0, Object.keys(updatedStars).length),
    totalStars: Object.values(updatedStars).reduce((sum, value) => sum + Number(value || 0), 0)
  };

  savePlayerStats(updated);
  return updated;
}

export function recordGameplayProgress(ship: ShipType, kills: number, level: number, score: number, endless = false, coinsCollected = 0, bossesDefeated = 0, criticalHits = 0, totalDamage = 0): PlayerStats {
  const current = loadPlayerStats();
  const mastery = { ...current.shipMastery };
  mastery[ship] = Math.max(0, Number(mastery[ship] || 0)) + Math.max(0, kills);
  const levelBestScores = { ...current.levelBestScores };
  if (!endless && level > 0) levelBestScores[level] = Math.max(Number(levelBestScores[level] || 0), score);
  const updated: PlayerStats = {
    ...current,
    totalKills: current.totalKills + Math.max(0, kills),
    shipMastery: mastery,
    levelBestScores,
    endlessBestScore: endless ? Math.max(current.endlessBestScore, score) : current.endlessBestScore,
    criticalHits: (current.criticalHits || 0) + Math.max(0, criticalHits),
    bossesDefeated: (current.bossesDefeated || 0) + Math.max(0, bossesDefeated),
    totalDamage: (current.totalDamage || 0) + Math.max(0, totalDamage)
  };
  savePlayerStats(updated);
  // Progression is persisted separately so XP/daily mission math is incremental.
  return updated;
}

export function upgradeShipPart(part: keyof PlayerStats['shipParts']): PlayerStats {
  const current = loadPlayerStats();
  const level = Math.min(5, (current.shipParts?.[part] || 0) + 1);
  const cost = 300 * level;
  if (current.coins < cost || level > 5) return current;
  const updated: PlayerStats = { ...current, coins: current.coins - cost, shipParts: { ...current.shipParts, [part]: level } };
  savePlayerStats(updated);
  return updated;
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    for (const key of ROTATING_BACKUP_KEYS) localStorage.removeItem(key);
    localStorage.removeItem('galaxy_claimed_achievements');
  } catch (e) {
    console.error('Failed to reset stats', e);
  }
  return { ...DEFAULT_STATS, unlockedShips: [...DEFAULT_STATS.unlockedShips], levelStars: {}, dailyState: { ...DEFAULT_STATS.dailyState, missions: [] } };
}
