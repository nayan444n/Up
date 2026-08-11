import React, { useEffect, useRef, useState } from 'react';
import {
  Bullet,
  BossVariant,
  Enemy,
  FloatingText,
  GameState,
  Particle,
  Player,
  PlayerStats,
  PowerUp,
  Star
} from '../types/game';
import { soundFx } from '../utils/sound';
import { SHIPS_CONFIG, recordGameplayProgress, loadPlayerStats } from '../utils/storage';
import { applyGameplayProgress } from '../utils/progression';
import { Play, Pause, RotateCcw, Shield, Zap, Bomb, Sparkles, Trophy, Award, Smartphone, List, Star as StarIcon, Heart } from 'lucide-react';

import leafImgPath from '../assets/images/leaf_creature_enemy_1785848098690.jpg';
import foxImgPath from '../assets/images/orange_fox_enemy_1785848127913.jpg';
import frogImgPath from '../assets/images/warrior_frog_enemy_1785848214735.jpg';
import alphaBeetleImgPath from '../assets/images/neon_green_beetle_ship_1785863166332.jpg';
import crimsonBeetleImgPath from '../assets/images/beetle_skin_crimson.png';
import azureBeetleImgPath from '../assets/images/beetle_skin_azure.png';
import goldenBeetleImgPath from '../assets/images/beetle_skin_golden.png';
import purpleBeetleImgPath from '../assets/images/beetle_skin_purple.png';
import emeraldBeetleImgPath from '../assets/images/beetle_skin_emerald.png';
import iceBeetleImgPath from '../assets/images/beetle_skin_ice.png';
import shadowBeetleImgPath from '../assets/images/beetle_skin_shadow.png';
import neonBeetleImgPath from '../assets/images/beetle_skin_neon.png';
import solarBeetleImgPath from '../assets/images/beetle_skin_solar.png';
import voidBeetleImgPath from '../assets/images/beetle_skin_void.png';
import prismBeetleImgPath from '../assets/images/beetle_skin_prism.png';
import homeImg from '../assets/images/Home page.png';
import shootingImg from '../assets/images/Shooting page.png';
import { getCachedImage } from '../utils/assetPreloader';
import { getRecommendedQuality, sampleFrame } from '../utils/performance';
import { getDirectorProfile } from '../utils/gameDirector';

const BOSS_VARIANTS: BossVariant[] = [
  'VOID_JUGGERNAUT',
  'IRON_MAELSTROM',
  'CELESTIAL_WARDEN',
  'SHADOW_REVENANT',
  'NOVA_DEVOURER',
  'CRYSTAL_TITAN',
  'XENO_OVERLORD'
];
const BOSS_LEVELS = [10, 20, 30, 40, 50, 60, 100] as const;

function isBossLevel(level: number): boolean {
  return (BOSS_LEVELS as readonly number[]).includes(level);
}

const BOSS_PROFILES: Record<BossVariant, { name: string; color: string; secondary: string; symbol: string }> = {
  VOID_JUGGERNAUT: { name: 'VOID JUGGERNAUT', color: '#84cc16', secondary: '#17220a', symbol: '◈' },
  IRON_MAELSTROM: { name: 'IRON MAELSTROM', color: '#f97316', secondary: '#2a1308', symbol: '✦' },
  CELESTIAL_WARDEN: { name: 'CELESTIAL WARDEN', color: '#38bdf8', secondary: '#071b2d', symbol: '◇' },
  SHADOW_REVENANT: { name: 'SHADOW REVENANT', color: '#c084fc', secondary: '#1d0c35', symbol: '◉' },
  NOVA_DEVOURER: { name: 'NOVA DEVOURER', color: '#ef4444', secondary: '#32070b', symbol: '✹' },
  CRYSTAL_TITAN: { name: 'CRYSTAL TITAN', color: '#22d3ee', secondary: '#06252c', symbol: '◆' },
  XENO_OVERLORD: { name: 'XENO OVERLORD', color: '#f43f5e', secondary: '#260610', symbol: '✧' }
};


function readLocalSetting(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function getBossVariant(level: number): BossVariant {
  if (level === 100) return 'XENO_OVERLORD';
  const index = BOSS_LEVELS.indexOf(level as (typeof BOSS_LEVELS)[number]);
  return BOSS_VARIANTS[Math.max(0, index) % BOSS_VARIANTS.length];
}

export interface SpiralGalaxy {
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotationSpeed: number;
  coreColor: string;
  armColor: string;
  speedY: number;
}

export interface FloatingAstronaut {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  wavePhase: number;
  suitColor: string;
  visorColor: string;
}

export interface Moon {
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

export interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedY: number;
  speedX: number;
  pulsePhase: number;
}

export interface CosmicPlanet {
  x: number;
  y: number;
  radius: number;
  primaryColor: string;
  secondaryColor: string;
  hasRing: boolean;
  ringColor: string;
  speedY: number;
  craters?: { xRatio: number; yRatio: number; rRatio: number }[];
  moon?: Moon;
}

export interface SpaceAsteroid {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  points: { x: number; y: number }[];
  color: string;
}

export interface SpaceSatellite {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  angle: number;
  beaconTimer: number;
}

export interface CosmicSun {
  x: number;
  y: number;
  radius: number;
  color: string;
  flareAngle: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
}

export interface BlackHoleEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  rotation: number;
}

interface SpaceCanvasProps {
  stats: PlayerStats;
  currentLevel: number;
  autoStart?: boolean;
  onGameOver: (finalScore: number, coinsEarned: number) => void;
  onOpenShop: () => void;
  onOpenGuide: () => void;
  onOpenLevelSelect: () => void;
  onLevelVictory: (level: number, score: number, coins: number, stars: number) => void;
  onReturnToMenu?: () => void;
}

export const SpaceCanvas: React.FC<SpaceCanvasProps> = ({
  stats,
  currentLevel,
  autoStart = false,
  onGameOver,
  onOpenShop,
  onOpenGuide,
  onOpenLevelSelect,
  onLevelVictory,
  onReturnToMenu
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [score, setScore] = useState<number>(0);
  const [levelKills, setLevelKills] = useState<number>(0);
  const [targetKills, setTargetKills] = useState<number>(10);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [bombsCount, setBombsCount] = useState<number>(2);
  const [bossActive, setBossActive] = useState<boolean>(false);
  const [bossHpPercent, setBossHpPercent] = useState<number>(100);
  const [bossIntro, setBossIntro] = useState<{name: string; symbol: string} | null>(null);

  // Refs for animation loop state to avoid react re-render lag
  const gameRef = useRef<{
    player: Player;
    bullets: Bullet[];
    enemies: Enemy[];
    particles: Particle[];
    powerUps: PowerUp[];
    stars: Star[];
    nebulae: NebulaCloud[];
    planets: CosmicPlanet[];
    galaxies: SpiralGalaxy[];
    astronauts: FloatingAstronaut[];
    asteroids: SpaceAsteroid[];
    satellites: SpaceSatellite[];
    sun: CosmicSun | null;
    shootingStars: ShootingStar[];
    floatingTexts: FloatingText[];
    keys: Record<string, boolean>;
    touchPos: { x: number; y: number; active: boolean };
    score: number;
    coins: number;
    levelKills: number;
    targetKills: number;
    screenShake: number;
    lastEnemySpawn: number;
    boss: Enemy | null;
    miniBossSpawned: boolean;
    bombs: number;
    levelVictoryTriggered: boolean;
    gameOverTriggered: boolean;
    blackHole: BlackHoleEffect | null;
    ultimateCharge: number;
    missionProgress: number;
    missionTarget: number;
    missionType: 'KILLS' | 'SURVIVE' | 'NO_DAMAGE';
    missionCompleted: boolean;
    hazardTimer: number;
    hazardCooldown: number;
    chestDropped: boolean;
    runKills: number;
    lastProgressSave: number;
    pendingKills: number;
    pendingCoins: number;
    pendingBosses: number;
  }>({
    player: {
      x: 200,
      y: 500,
      width: 44,
      height: 48,
      speed: SHIPS_CONFIG[stats.selectedShip].speed + stats.speedUpgrade + (stats.shipParts?.engine || 0) * 0.4,
      health: SHIPS_CONFIG[stats.selectedShip].health + stats.maxHealthUpgrade * 25 + (stats.shipParts?.core || 0) * 8,
      maxHealth: SHIPS_CONFIG[stats.selectedShip].health + stats.maxHealthUpgrade * 25 + (stats.shipParts?.core || 0) * 8,
      shield: 50 + (stats.shipParts?.shield || 0) * 10,
      maxShield: 50 + (stats.shipParts?.shield || 0) * 10,
      shipType: stats.selectedShip,
      weaponType: SHIPS_CONFIG[stats.selectedShip].weaponType,
      weaponLevel: 1 + stats.firePowerUpgrade + (stats.shipParts?.weapon || 0) + Math.max(0, (stats.weaponEvolutionLevel || 1) - 1),
      lastFired: 0,
      invulnerableTime: 0,
      rapidFireUntil: 0,
      speedBoostUntil: 0,
      scoreMultiplierUntil: 0,
      abilityCooldownUntil: 0
    },
    bullets: [],
    enemies: [],
    particles: [],
    powerUps: [],
    stars: [],
    nebulae: [],
    planets: [],
    galaxies: [],
    astronauts: [],
    asteroids: [],
    satellites: [],
    sun: null,
    shootingStars: [],
    floatingTexts: [],
    keys: {},
    touchPos: { x: 0, y: 0, active: false },
    score: 0,
    coins: 0,
    levelKills: 0,
    targetKills: currentLevel === 101 ? Number.POSITIVE_INFINITY : 8 + currentLevel * 3,
    screenShake: 0,
    lastEnemySpawn: 0,
    boss: null,
    miniBossSpawned: false,
    bombs: 2,
    levelVictoryTriggered: false,
    gameOverTriggered: false,
    blackHole: null,
    ultimateCharge: 0,
    missionProgress: 0,
    missionTarget: currentLevel === 101 ? 35 : 15 + Math.min(20, Math.floor(currentLevel / 5)),
    missionType: 'KILLS',
    missionCompleted: false,
    hazardTimer: 0,
    hazardCooldown: 0,
    chestDropped: false,
    runKills: 0,
    lastProgressSave: 0,
    pendingKills: 0,
    pendingCoins: 0,
    pendingBosses: 0,
    criticalHits: 0,
    totalDamage: 0,
    playStartedAt: performance.now()
  });

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  // Processed transparent character sprite canvases (Leaf Creature, Orange Fox, Warrior Frog, Panda Bomb)
  const [pandaDataUrl, setPandaDataUrl] = useState<string | null>(null);

  const spritesRef = useRef<{
    leaf: HTMLCanvasElement | null;
    fox: HTMLCanvasElement | null;
    frog: HTMLCanvasElement | null;
    panda: HTMLCanvasElement | null;
    beetle: HTMLCanvasElement | null;
    beetleSkins: Partial<Record<keyof typeof SHIPS_CONFIG, HTMLCanvasElement>>;
  }>({ leaf: null, fox: null, frog: null, panda: null, beetle: null, beetleSkins: {} });

  const shootingBgImgRef = useRef<HTMLImageElement | null>(null);
  const controlTypeRef = useRef<'TOUCH' | 'JOYSTICK' | 'KEYBOARD'>('TOUCH');
  const graphicsQualityRef = useRef<'HIGH' | 'MED' | 'LOW'>('HIGH');
  const joystickRef = useRef({ x: 0, y: 0, active: false, radius: 58 });

  useEffect(() => {
    const cached = getCachedImage('shootingpage');
    if (cached && cached.complete && cached.naturalWidth > 0) {
      shootingBgImgRef.current = cached;
    } else {
      const img = new Image();
      img.src = shootingImg;
      img.onload = () => {
        shootingBgImgRef.current = img;
      };
    }
  }, []);

  // Function to strip dark, light, or square box backgrounds cleanly around ships
  const processImageToTransparentCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
    const offscreen = document.createElement('canvas');
    const sourceW = img.naturalWidth || img.width || 400;
    const sourceH = img.naturalHeight || img.height || 400;
    // Keep decoded sprite canvases small. Full 1024/1408px source images are
    // expensive on 2GB phones and are never rendered at native resolution.
    const maxDimension = 384;
    const scale = Math.min(1, maxDimension / Math.max(sourceW, sourceH));
    const w = Math.max(1, Math.round(sourceW * scale));
    const h = Math.max(1, Math.round(sourceH * scale));
    if (w <= 0 || h <= 0) return offscreen;

    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) return offscreen;

    ctx.imageSmoothingEnabled = scale >= 0.75;
    ctx.imageSmoothingQuality = scale >= 0.75 ? 'high' : 'medium';
    ctx.drawImage(img, 0, 0, w, h);

    let imgData: ImageData;
    try {
      imgData = ctx.getImageData(0, 0, w, h);
    } catch (e) {
      console.error('Failed to get imageData for sprite:', e);
      return offscreen;
    }
    const data = imgData.data;

    // Collect corner samples to identify background color
    const cornerSamples: [number, number, number][] = [];
    const sampleCoords = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
      [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)]
    ];
    for (const [sx, sy] of sampleCoords) {
      const idx = (sy * w + sx) * 4;
      cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }

    const visited = new Uint8Array(w * h);
    const queue: number[] = [];

    const pushPixel = (px: number, py: number) => {
      const pIdx = py * w + px;
      if (!visited[pIdx]) {
        visited[pIdx] = 1;
        queue.push(px, py);
      }
    };

    // Push outer border pixels as starting seed points for background flood fill
    for (let x = 0; x < w; x++) {
      pushPixel(x, 0);
      pushPixel(x, h - 1);
    }
    for (let y = 1; y < h - 1; y++) {
      pushPixel(0, y);
      pushPixel(w - 1, y);
    }

    const isBackground = (r: number, g: number, b: number) => {
      // Dark/black outer background
      if (r < 40 && g < 40 && b < 40) return true;
      // White / light grey background
      if (r > 210 && g > 210 && b > 210) return true;

      // Distance from corner samples
      for (const [cr, cg, cb] of cornerSamples) {
        const dist = Math.abs(r - cr) + Math.abs(g - cg) + Math.abs(b - cb);
        if (dist < 55) return true;
      }
      return false;
    };

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const pixelIdx = cy * w + cx;
      const dataIdx = pixelIdx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];

      if (isBackground(r, g, b)) {
        data[dataIdx + 3] = 0; // Make transparent

        if (cx > 0) pushPixel(cx - 1, cy);
        if (cx < w - 1) pushPixel(cx + 1, cy);
        if (cy > 0) pushPixel(cx, cy - 1);
        if (cy < h - 1) pushPixel(cx, cy + 1);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return offscreen;
  };

  useEffect(() => {
    const loadAndProcess = (path: string, key: 'leaf' | 'fox' | 'frog' | 'panda' | 'beetle') => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        try {
          const canvas = processImageToTransparentCanvas(img);
          spritesRef.current[key] = canvas;
          if (key === 'panda') {
            setPandaDataUrl(canvas.toDataURL('image/png'));
          }
        } catch (err) {
          console.error('Error processing sprite image:', path, err);
        }
      };
      img.onerror = (err) => {
        console.error('Failed to load image:', path, err);
      };
    };

    loadAndProcess(leafImgPath, 'leaf');
    loadAndProcess(foxImgPath, 'fox');
    loadAndProcess(frogImgPath, 'frog');

    const skinPaths: Record<keyof typeof SHIPS_CONFIG, string> = {
      ALPHA: alphaBeetleImgPath,
      CRIMSON: crimsonBeetleImgPath,
      AZURE: azureBeetleImgPath,
      GOLDEN: goldenBeetleImgPath,
      PURPLE: purpleBeetleImgPath,
      EMERALD: emeraldBeetleImgPath,
      ICE: iceBeetleImgPath,
      SHADOW_GREEN: shadowBeetleImgPath,
      NEON: neonBeetleImgPath,
      SOLAR: solarBeetleImgPath,
      VOID: voidBeetleImgPath,
      PRISM: prismBeetleImgPath,
    };

    Object.entries(skinPaths).forEach(([shipKey, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        try {
          const canvas = processImageToTransparentCanvas(img);
          spritesRef.current.beetleSkins[shipKey as keyof typeof SHIPS_CONFIG] = canvas;
          if (shipKey === stats.selectedShip) spritesRef.current.beetle = canvas;
        } catch (err) {
          console.error('Error processing Beetle skin:', path, err);
        }
      };
    });
  }, []);

  // Initialize player stats from props
  const initPlayer = () => {
    const config = SHIPS_CONFIG[stats.selectedShip];
    const extraHp = stats.maxHealthUpgrade * 25;
    const extraSpeed = stats.speedUpgrade * 1.0;
    
    return {
      x: 200,
      y: 500,
      width: 100,
      height: 100,
      speed: config.speed + extraSpeed,
      health: config.health + extraHp,
      maxHealth: config.health + extraHp,
      shield: 50,
      maxShield: 50,
      shipType: stats.selectedShip,
      weaponType: config.weaponType,
      weaponLevel: 1 + stats.firePowerUpgrade + (stats.shipParts?.weapon || 0) + Math.max(0, (stats.weaponEvolutionLevel || 1) - 1),
      lastFired: 0,
      invulnerableTime: 0,
      rapidFireUntil: 0,
      speedBoostUntil: 0,
      scoreMultiplierUntil: 0
    };
  };

  // Setup Vibrant Dynamic Space Background Elements
  const initBackgroundElements = (width: number, height: number, level: number) => {
    const stars: Star[] = [];
    const count = Math.min(130, Math.floor((width * height) / 3000));
    for (let i = 0; i < count; i++) {
      const speed = Math.random() * 3.0 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: speed > 2.2 ? Math.random() * 2.5 + 1.2 : Math.random() * 1.8 + 0.5,
        speed,
        color: ['#ffffff', '#93c5fd', '#fef08a', '#c084fc', '#f43f5e', '#38bdf8', '#a855f7'][Math.floor(Math.random() * 7)],
        brightness: Math.random()
      });
    }

    // Dynamic rich nebulae gas clouds framing edges like reference photo
    const nebulae: NebulaCloud[] = [
      {
        x: width * 0.1,
        y: height * 0.15,
        radius: Math.min(width, height) * 0.55,
        color: 'rgba(147, 51, 234, 0.45)', // Deep Purple Nebula
        speedY: 0.2,
        speedX: 0.05,
        pulsePhase: 0
      },
      {
        x: width * 0.88,
        y: height * 0.25,
        radius: Math.min(width, height) * 0.5,
        color: 'rgba(56, 189, 248, 0.42)', // Electric Cyan Blue Nebula
        speedY: 0.22,
        speedX: -0.05,
        pulsePhase: Math.PI / 3
      },
      {
        x: width * 0.12,
        y: height * 0.68,
        radius: Math.min(width, height) * 0.52,
        color: 'rgba(236, 72, 153, 0.42)', // Magenta Pink Nebula
        speedY: 0.18,
        speedX: 0.08,
        pulsePhase: Math.PI / 2
      },
      {
        x: width * 0.85,
        y: height * 0.78,
        radius: Math.min(width, height) * 0.58,
        color: 'rgba(59, 130, 246, 0.45)', // Deep Sapphire Nebula
        speedY: 0.25,
        speedX: -0.06,
        pulsePhase: Math.PI * 0.8
      },
      {
        x: width * 0.2,
        y: height * 0.88,
        radius: Math.min(width, height) * 0.45,
        color: 'rgba(249, 115, 22, 0.38)', // Fiery Orange Glow near bottom meteor
        speedY: 0.28,
        speedX: 0.04,
        pulsePhase: Math.PI * 1.2
      }
    ];

    // Celestial planets matched exactly to reference photo
    const planets: CosmicPlanet[] = [
      {
        // 1. Molten Lava Fire Planet (Top Left)
        x: width * 0.11,
        y: height * 0.1,
        radius: 52,
        primaryColor: '#ea580c',
        secondaryColor: '#7c2d12',
        hasRing: false,
        ringColor: '',
        speedY: 0.12,
        craters: [
          { xRatio: -0.25, yRatio: -0.15, rRatio: 0.28 },
          { xRatio: 0.18, yRatio: 0.25, rRatio: 0.2 },
          { xRatio: 0.32, yRatio: -0.12, rRatio: 0.15 }
        ],
        moon: {
          orbitRadius: 78,
          angle: 0.5,
          speed: 0.015,
          size: 6,
          color: '#64748b'
        }
      },
      {
        // 2. Earth / Ocean Blue Planet (Top Right)
        x: width * 0.88,
        y: height * 0.12,
        radius: 56,
        primaryColor: '#38bdf8',
        secondaryColor: '#0369a1',
        hasRing: false,
        ringColor: '',
        speedY: 0.14,
        craters: [
          { xRatio: -0.3, yRatio: 0.1, rRatio: 0.22 },
          { xRatio: 0.2, yRatio: -0.25, rRatio: 0.18 }
        ],
        moon: {
          orbitRadius: 86,
          angle: 2.4,
          speed: 0.018,
          size: 8,
          color: '#cbd5e1'
        }
      },
      {
        // 3. Ringed Amber Saturn Planet (Mid Left)
        x: width * 0.09,
        y: height * 0.52,
        radius: 40,
        primaryColor: '#f59e0b',
        secondaryColor: '#78350f',
        hasRing: true,
        ringColor: '#fde047',
        speedY: 0.1
      },
      {
        // 4. Ringed Purple/Pink Gas Giant (Mid Right)
        x: width * 0.91,
        y: height * 0.48,
        radius: 44,
        primaryColor: '#c084fc',
        secondaryColor: '#831843',
        hasRing: true,
        ringColor: '#e879f9',
        speedY: 0.12,
        moon: {
          orbitRadius: 68,
          angle: 1.1,
          speed: 0.022,
          size: 5,
          color: '#e2e8f0'
        }
      },
      {
        // 5. Large Earth/Neptune Blue Planet (Bottom Right)
        x: width * 0.86,
        y: height * 0.86,
        radius: 62,
        primaryColor: '#0284c7',
        secondaryColor: '#0f172a',
        hasRing: false,
        ringColor: '',
        speedY: 0.15,
        craters: [
          { xRatio: -0.2, yRatio: -0.2, rRatio: 0.25 },
          { xRatio: 0.25, yRatio: 0.15, rRatio: 0.18 }
        ],
        moon: {
          orbitRadius: 92,
          angle: 4.2,
          speed: 0.012,
          size: 9,
          color: '#94a3b8'
        }
      }
    ];

    // Swirling Spiral Galaxies
    const galaxies: SpiralGalaxy[] = [
      {
        x: width * 0.22,
        y: height * 0.2,
        radius: Math.min(width, height) * 0.26,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.003,
        coreColor: '#fef08a',
        armColor: 'rgba(168, 85, 247, 0.48)',
        speedY: 0.1
      },
      {
        x: width * 0.42,
        y: height * 0.78,
        radius: Math.min(width, height) * 0.22,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: -0.004,
        coreColor: '#38bdf8',
        armColor: 'rgba(236, 72, 153, 0.42)',
        speedY: 0.12
      }
    ];

    // Floating Space Astronaut
    const astronauts: FloatingAstronaut[] = [
      {
        x: width * 0.22,
        y: height * 0.45,
        size: 26,
        speedX: 0.08,
        speedY: 0.15,
        rotation: -0.2,
        rotationSpeed: 0.004,
        wavePhase: 0,
        suitColor: '#f8fafc',
        visorColor: '#fbbf24'
      }
    ];

    // Space Asteroids (Meteors & Craggy Space Debris clustered along borders like reference photo)
    const createAsteroidPoints = (radius: number) => {
      const pts: { x: number; y: number }[] = [];
      const count = 7 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const ang = (i * Math.PI * 2) / count;
        const r = radius * (0.68 + Math.random() * 0.52);
        pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
      }
      return pts;
    };

    const asteroids: SpaceAsteroid[] = [
      // Giant Fiery Asteroid at Bottom-Left Corner (key reference photo feature!)
      {
        x: width * 0.1,
        y: height * 0.9,
        radius: 54,
        speedY: 0.2,
        speedX: 0.08,
        rotation: 0.3,
        rotationSpeed: 0.005,
        points: createAsteroidPoints(54),
        color: '#1e1b4b'
      },
      // Left border asteroid field cluster
      {
        x: width * 0.06,
        y: height * 0.28,
        radius: 24,
        speedY: 0.25,
        speedX: 0.1,
        rotation: 0,
        rotationSpeed: 0.008,
        points: createAsteroidPoints(24),
        color: '#334155'
      },
      {
        x: width * 0.05,
        y: height * 0.42,
        radius: 28,
        speedY: 0.22,
        speedX: 0.06,
        rotation: 1.1,
        rotationSpeed: -0.006,
        points: createAsteroidPoints(28),
        color: '#1e293b'
      },
      {
        x: width * 0.08,
        y: height * 0.65,
        radius: 32,
        speedY: 0.26,
        speedX: 0.08,
        rotation: 0.7,
        rotationSpeed: 0.01,
        points: createAsteroidPoints(32),
        color: '#334155'
      },
      // Right border asteroid field cluster
      {
        x: width * 0.94,
        y: height * 0.28,
        radius: 26,
        speedY: 0.24,
        speedX: -0.08,
        rotation: 1.5,
        rotationSpeed: -0.007,
        points: createAsteroidPoints(26),
        color: '#475569'
      },
      {
        x: width * 0.92,
        y: height * 0.42,
        radius: 34,
        speedY: 0.2,
        speedX: -0.05,
        rotation: 2.2,
        rotationSpeed: 0.006,
        points: createAsteroidPoints(34),
        color: '#1e293b'
      },
      {
        x: width * 0.95,
        y: height * 0.62,
        radius: 30,
        speedY: 0.28,
        speedX: -0.09,
        rotation: 0.4,
        rotationSpeed: -0.009,
        points: createAsteroidPoints(30),
        color: '#334155'
      },
      {
        x: width * 0.9,
        y: height * 0.78,
        radius: 22,
        speedY: 0.3,
        speedX: -0.07,
        rotation: 1.8,
        rotationSpeed: 0.011,
        points: createAsteroidPoints(22),
        color: '#475569'
      }
    ];

    // Orbital Space Station / Satellite
    const satellites: SpaceSatellite[] = [
      {
        x: width * 0.78,
        y: height * 0.35,
        speedY: 0.12,
        speedX: -0.05,
        angle: -0.2,
        beaconTimer: 0
      }
    ];

    // Glowing Distant Sun (Solar Lens Flare Source)
    const sun: CosmicSun = {
      x: width * 0.88,
      y: height * 0.08,
      radius: 35,
      color: '#fef08a',
      flareAngle: 0
    };

    return { stars, nebulae, planets, galaxies, astronauts, asteroids, satellites, sun, shootingStars: [] };
  };

  // Start Game Handler
  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundFx.playClick();

    // Ensure container sizing is updated
    const container = canvas.parentElement;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const displayWidth = container?.clientWidth || 360;
    const displayHeight = container?.clientHeight || 640;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const cWidth = displayWidth;
    const cHeight = displayHeight;

    const p = initPlayer();
    p.x = cWidth / 2 - p.width / 2;
    p.y = cHeight - 120;

    const reqKills = 6 + currentLevel * 3;
    const bgElem = initBackgroundElements(cWidth, cHeight, currentLevel);

    gameRef.current = {
      player: p,
      bullets: [],
      enemies: [],
      particles: [],
      powerUps: [],
      stars: bgElem.stars,
      nebulae: bgElem.nebulae,
      planets: bgElem.planets,
      galaxies: bgElem.galaxies,
      astronauts: bgElem.astronauts,
      asteroids: bgElem.asteroids,
      satellites: bgElem.satellites,
      sun: bgElem.sun,
      shootingStars: bgElem.shootingStars,
      floatingTexts: [],
      keys: {},
      touchPos: { x: p.x, y: p.y, active: false },
      score: 0,
      coins: 0,
      levelKills: 0,
      targetKills: reqKills,
      screenShake: 0,
      lastEnemySpawn: Date.now(),
      boss: null,
      bombs: 2,
      levelVictoryTriggered: false,
      gameOverTriggered: false,
      blackHole: null,
      ultimateCharge: 0,
      missionProgress: 0,
      missionTarget: currentLevel === 101 ? 35 : 15 + Math.min(20, Math.floor(currentLevel / 5)),
      missionType: 'KILLS',
      missionCompleted: false,
      hazardTimer: 0,
      hazardCooldown: 0,
      chestDropped: false,
      runKills: 0,
      lastProgressSave: 0,
      pendingKills: 0,
      pendingCoins: 0,
      pendingBosses: 0,
    criticalHits: 0,
    totalDamage: 0,
    playStartedAt: performance.now()
    };

    setScore(0);
    setLevelKills(0);
    setTargetKills(reqKills);
    setCoinsEarned(0);
    setBombsCount(2);
    setBossActive(false);
    setGameState('PLAYING');
  };

  // Auto-start level if requested
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startGame();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  // Trigger Smart Bomb with Black Hole Vortex
  const triggerBomb = () => {
    const g = gameRef.current;
    if (g.bombs <= 0 || stateRef.current !== 'PLAYING') return;

    g.bombs -= 1;
    setBombsCount(g.bombs);
    g.screenShake = 35;

    // Play copyright-free synthesized Black Hole SFX
    soundFx.playBlackHole();

    // Destroy all enemy bullets
    g.bullets = [];

    // Trigger Black Hole animation at playfield center
    const canvas = canvasRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const logicalWidth = canvas ? Math.round(canvas.width / dpr) : 360;
    const logicalHeight = canvas ? Math.round(canvas.height / dpr) : 640;

    const bhX = logicalWidth / 2;
    const bhY = logicalHeight / 2 - 40;

    g.blackHole = {
      x: bhX,
      y: bhY,
      radius: 12,
      maxRadius: Math.min(logicalWidth, logicalHeight) * 0.45,
      life: 0,
      maxLife: 110,
      rotation: 0
    };

    // Spawn 50 swirling cosmic particles around the black hole center (Monochrome / B&W)
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 200;
      g.particles.push({
        x: bhX + Math.cos(angle) * dist,
        y: bhY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1.5,
        color: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'][Math.floor(Math.random() * 4)],
        life: 0,
        maxLife: 80,
        alpha: 1
      });
    }

    // Deal immediate impact burst damage to enemies
    g.enemies.forEach((enemy) => {
      enemy.hp -= 180;
      for (let i = 0; i < 8; i++) {
        g.particles.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          radius: Math.random() * 4 + 2,
          color: '#ffffff',
          life: 0,
          maxLife: 30,
          alpha: 1
        });
      }
    });

    if (g.boss) {
      g.boss.hp -= 350;
    }

    g.floatingTexts.push({
      id: Math.random().toString(),
      x: bhX,
      y: bhY - 30,
      text: '🌀 BLACK HOLE BOMB!',
      color: '#ffffff',
      alpha: 1,
      life: 0
    });
  };

  // Ship Ultimate: a charge-based nova attack. It is intentionally separate from the Smart Bomb.
  const triggerUltimate = () => {
    const g = gameRef.current;
    if (stateRef.current !== 'PLAYING' || g.ultimateCharge < 100) return;
    g.ultimateCharge = 0;
    g.screenShake = 28;
    soundFx.playBlackHole();
    const damage = 420 + g.player.weaponLevel * 85;
    g.enemies.forEach((enemy) => {
      enemy.hp -= damage;
    });
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 260;
      g.particles.push({ x: g.player.x + g.player.width / 2 + Math.cos(a) * r, y: g.player.y + g.player.height / 2 + Math.sin(a) * r, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, radius: 2 + Math.random() * 3, color: ['#67e8f9','#c084fc','#fef08a'][Math.floor(Math.random()*3)], life: 0, maxLife: 34, alpha: 1 });
    }
    g.floatingTexts.push({ id: Math.random().toString(), x: g.player.x + g.player.width / 2, y: g.player.y - 30, text: '✦ ULTIMATE NOVA!', color: '#67e8f9', alpha: 1, life: 0 });
  };

  // Ship-specific tactical ability. This is separate from the universal Ultimate Nova.
  const triggerShipAbility = () => {
    const g = gameRef.current;
    const now = Date.now();
    if (stateRef.current !== 'PLAYING' || (g.player.abilityCooldownUntil || 0) > now) return;
    g.player.abilityCooldownUntil = now + 12000;
    const ship = g.player.shipType;
    if (ship === 'AZURE') {
      g.enemies.forEach(e => { e.speedX *= 0.35; e.speedY *= 0.35; });
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'❄ TIME FREEZE', color:'#7dd3fc', alpha:1, life:0});
    } else if (ship === 'CRIMSON') {
      g.player.rapidFireUntil = now + 6000;
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'🔥 OVERDRIVE', color:'#fb7185', alpha:1, life:0});
    } else if (ship === 'GOLDEN') {
      g.coins += 100;
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'💰 SOLAR CASH', color:'#fbbf24', alpha:1, life:0});
    } else if (ship === 'EMERALD') {
      g.player.health = Math.min(g.player.maxHealth, g.player.health + 35);
      g.player.shield = Math.min(g.player.maxShield, g.player.shield + 35);
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'💚 REPAIR PULSE', color:'#34d399', alpha:1, life:0});
    } else if (ship === 'ICE') {
      g.player.invulnerableTime = 90;
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'🛡 CRYO SHELL', color:'#67e8f9', alpha:1, life:0});
    } else if (ship === 'VOID') {
      g.enemies.forEach(e => { e.hp -= 180; });
      g.screenShake = 18;
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'🌀 VOID PULSE', color:'#c084fc', alpha:1, life:0});
    } else {
      g.ultimateCharge = Math.min(100, g.ultimateCharge + 35);
      g.player.scoreMultiplierUntil = now + 5000;
      g.floatingTexts.push({id: Math.random().toString(), x:g.player.x, y:g.player.y-30, text:'⚡ CORE SURGE', color:'#fef08a', alpha:1, life:0});
    }
    soundFx.playPowerUp();
  };

  // Main Canvas Setup & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;

    const readSettings = () => {
      try {
        const control = localStorage.getItem('galaxy_control_type');
        const quality = localStorage.getItem('galaxy_graphics_quality');
        if (control === 'TOUCH' || control === 'JOYSTICK' || control === 'KEYBOARD') {
          controlTypeRef.current = control;
        }
        if (quality === 'HIGH' || quality === 'MED' || quality === 'LOW') {
          graphicsQualityRef.current = quality;
        } else {
          graphicsQualityRef.current = getRecommendedQuality();
        }
      } catch {
        // Keep safe defaults when storage is unavailable.
      }
    };
    readSettings();
    const settingsTimer = window.setInterval(readSettings, 500);

    // Handle Resize
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const quality = graphicsQualityRef.current;
        const maxDpr = quality === 'LOW' ? 1 : quality === 'MED' ? 1.25 : 2;
        const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
        const displayWidth = container.clientWidth || 360;
        const displayHeight = container.clientHeight || 640;

        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        if (gameRef.current.stars.length === 0) {
          const bgElem = initBackgroundElements(displayWidth, displayHeight, currentLevel);
          gameRef.current.stars = bgElem.stars;
          gameRef.current.nebulae = bgElem.nebulae;
          gameRef.current.planets = bgElem.planets;
          gameRef.current.galaxies = bgElem.galaxies;
          gameRef.current.astronauts = bgElem.astronauts;
          gameRef.current.asteroids = bgElem.asteroids;
          gameRef.current.satellites = bgElem.satellites;
          gameRef.current.sun = bgElem.sun;
          gameRef.current.shootingStars = bgElem.shootingStars;
        }
      }
    };

    let lastLogicalWidth = 0;
    let lastLogicalHeight = 0;

    const resizeCanvasWithGameState = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const maxDpr = graphicsQualityRef.current === 'LOW' ? 1 : graphicsQualityRef.current === 'MED' ? 1.25 : 2;
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
      const displayWidth = container.clientWidth || 360;
      const displayHeight = container.clientHeight || 640;
      const oldWidth = lastLogicalWidth || displayWidth;
      const oldHeight = lastLogicalHeight || displayHeight;
      const sx = displayWidth / oldWidth;
      const sy = displayHeight / oldHeight;
      const g = gameRef.current;
      const scaleObject = (o: any) => {
        o.x *= sx; o.y *= sy;
        if ('width' in o) o.width *= sx;
        if ('height' in o) o.height *= sy;
      };
      if (lastLogicalWidth && stateRef.current !== 'MENU') {
        scaleObject(g.player);
        g.bullets.forEach(scaleObject);
        g.enemies.forEach(scaleObject);
        g.powerUps.forEach(scaleObject);
        g.particles.forEach((o) => { o.x *= sx; o.y *= sy; });
        g.floatingTexts.forEach((o) => { o.x *= sx; o.y *= sy; });
        if (g.touchPos.active) { g.touchPos.x *= sx; g.touchPos.y *= sy; }
        g.player.x = Math.max(10, Math.min(displayWidth - g.player.width - 10, g.player.x));
        g.player.y = Math.max(10, Math.min(displayHeight - g.player.height - 10, g.player.y));
      }
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      lastLogicalWidth = displayWidth;
      lastLogicalHeight = displayHeight;
    };

    resizeCanvas();
    resizeCanvasWithGameState();
    window.addEventListener('resize', resizeCanvasWithGameState);
    window.addEventListener('orientationchange', resizeCanvasWithGameState);

    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.code] = true;
      if (e.code === 'KeyB' || e.code === 'ShiftLeft') {
        triggerBomb();
      }
      if (e.code === 'KeyQ') triggerShipAbility();
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (stateRef.current === 'PLAYING') setGameState('PAUSED');
        else if (stateRef.current === 'PAUSED') setGameState('PLAYING');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.code] = false;
    };

    // Clear held keys whenever focus leaves the game. Without this, a key
    // released outside the browser/canvas can remain logically pressed.
    const handleWindowBlur = () => {
      gameRef.current.keys = {};
      handleTouchEnd();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    // Controls: Touch
    const handleTouchStart = (e: TouchEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (controlTypeRef.current === 'JOYSTICK') {
        const radius = Math.max(46, Math.min(72, Math.min(rect.width, rect.height) * 0.11));
        const centerX = radius + 26;
        const centerY = rect.height - radius - 30;
        joystickRef.current = { x: centerX, y: centerY, active: true, radius };
        const dx = x - centerX;
        const dy = y - centerY;
        const len = Math.hypot(dx, dy) || 1;
        const nx = Math.max(-1, Math.min(1, dx / len * Math.min(1, len / radius)));
        const ny = Math.max(-1, Math.min(1, dy / len * Math.min(1, len / radius)));
        gameRef.current.touchPos = { x: nx, y: ny, active: true };
      } else if (controlTypeRef.current === 'TOUCH') {
        gameRef.current.touchPos = { x, y, active: true };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();

      if (controlTypeRef.current === 'JOYSTICK') {
        const j = joystickRef.current;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const dx = x - j.x;
        const dy = y - j.y;
        const len = Math.hypot(dx, dy) || 1;
        const amount = Math.min(1, len / j.radius);
        gameRef.current.touchPos = {
          x: (dx / len) * amount,
          y: (dy / len) * amount,
          active: true
        };
      } else if (controlTypeRef.current === 'TOUCH') {
        gameRef.current.touchPos = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          active: true
        };
      }
    };

    const handleTouchEnd = () => {
      gameRef.current.touchPos.active = false;
      joystickRef.current.active = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    // Mouse Fallback
    const handleMouseDown = (e: MouseEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      gameRef.current.touchPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current !== 'PLAYING' || !gameRef.current.touchPos.active) return;
      const rect = canvas.getBoundingClientRect();
      gameRef.current.touchPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseUp = () => {
      gameRef.current.touchPos.active = false;
    };

    // Release the mouse control even when the pointer is released outside
    // the canvas (common on mobile emulation and desktop browsers).
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // ANIMATION LOOP
    let animationFrameId: number;
    let lastFrameTime = performance.now();
    let lastRenderTime = lastFrameTime;

    // Persist all unsaved combat statistics before a terminal state is emitted.
    // This prevents the last few seconds of kills/damage/criticals from being lost
    // when the player dies or a level ends before the 5-second autosave interval.
    const flushPendingProgress = () => {
      const g = gameRef.current;
      const k = Math.max(0, g.pendingKills);
      const c = Math.max(0, g.pendingCoins);
      const b = Math.max(0, g.pendingBosses);
      const crit = Math.max(0, g.criticalHits);
      const damage = Math.max(0, g.totalDamage);
      if (k || c || b || crit || damage) {
        recordGameplayProgress(
          stats.selectedShip,
          k,
          currentLevel,
          g.score,
          currentLevel === 101,
          c,
          b,
          crit,
          damage
        );
        applyGameplayProgress(loadPlayerStats(), k, c, b);
      }
      g.pendingKills = 0;
      g.pendingCoins = 0;
      g.pendingBosses = 0;
      g.criticalHits = 0;
      g.totalDamage = 0;
      g.lastProgressSave = performance.now();
    };

    const gameLoop = (frameTime = performance.now()) => {
      const qualityForFrame = graphicsQualityRef.current;
      const minFrameMs = qualityForFrame === 'LOW' ? 32 : qualityForFrame === 'MED' ? 22 : 0;
      if (minFrameMs > 0 && frameTime - lastRenderTime < minFrameMs) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      lastRenderTime = frameTime;
      sampleFrame(frameTime);
      const deltaMs = Math.min(50, Math.max(0, frameTime - lastFrameTime));
      lastFrameTime = frameTime;
      const frameScale = deltaMs / 16.6667;
      const g = gameRef.current;
      const p = g.player;

      const maxDpr = graphicsQualityRef.current === 'LOW' ? 1 : graphicsQualityRef.current === 'MED' ? 1.25 : 2;
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
      const logicalWidth = Math.round(canvas.width / dpr) || 360;
      const logicalHeight = Math.round(canvas.height / dpr) || 640;

      // Update Screen Shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (g.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * g.screenShake;
        shakeY = (Math.random() - 0.5) * g.screenShake;
        g.screenShake *= Math.pow(0.9, frameScale);
        if (g.screenShake < 0.5) g.screenShake = 0;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(shakeX, shakeY);

      // 1. BLANK PREVIOUS CANVAS BACKGROUND COMPLETELY
      ctx.fillStyle = '#020617';
      ctx.fillRect(-10, -10, logicalWidth + 20, logicalHeight + 20);

      // 2. RENDER THE PREMIUM VERTICAL SPACE BACKGROUND.
      // Use a cover crop instead of stretching so the artwork keeps its
      // proportions across different phone aspect ratios and resolutions.
      const bgImg = shootingBgImgRef.current || getCachedImage('shootingpage');
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();

        const imageAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasAspect = logicalWidth / logicalHeight;

        let drawWidth = logicalWidth;
        let drawHeight = logicalHeight;
        let drawX = 0;
        let drawY = 0;

        if (imageAspect > canvasAspect) {
          // Image is wider: crop the sides.
          drawHeight = logicalHeight;
          drawWidth = logicalHeight * imageAspect;
          drawX = (logicalWidth - drawWidth) / 2;
        } else {
          // Image is taller/narrower: crop the top and bottom.
          drawWidth = logicalWidth;
          drawHeight = logicalWidth / imageAspect;
          drawY = (logicalHeight - drawHeight) / 2;
        }

        ctx.imageSmoothingEnabled = graphicsQualityRef.current !== 'LOW';
        ctx.imageSmoothingQuality = graphicsQualityRef.current === 'HIGH' ? 'high' : 'medium';
        ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);

        // Very subtle dark cinematic grade keeps ships, enemies and bullets
        // readable without hiding the background artwork.
        const readability = ctx.createLinearGradient(0, 0, 0, logicalHeight);
        readability.addColorStop(0, 'rgba(0, 0, 0, 0.16)');
        readability.addColorStop(0.5, 'rgba(0, 0, 0, 0.06)');
        readability.addColorStop(1, 'rgba(0, 0, 0, 0.20)');
        ctx.fillStyle = readability;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        ctx.restore();
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
        bgGrad.addColorStop(0, '#09152b');
        bgGrad.addColorStop(0.5, '#0e2348');
        bgGrad.addColorStop(1, '#040b17');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(-10, -10, logicalWidth + 20, logicalHeight + 20);
      }

      // ONLY UPDATE PHYSICS WHEN PLAYING
      if (stateRef.current === 'PLAYING') {
        // Player Movement
        const speedFactor = (p.speedBoostUntil || 0) > Date.now() ? 1.45 : 1;
        if (g.keys['ArrowLeft'] || g.keys['KeyA']) p.x -= p.speed * speedFactor * frameScale;
        if (g.keys['ArrowRight'] || g.keys['KeyD']) p.x += p.speed * speedFactor * frameScale;
        if (g.keys['ArrowUp'] || g.keys['KeyW']) p.y -= p.speed * speedFactor * frameScale;
        if (g.keys['ArrowDown'] || g.keys['KeyS']) p.y += p.speed * speedFactor * frameScale;

        if (g.touchPos.active) {
          if (controlTypeRef.current === 'JOYSTICK') {
            const joystickSpeed = p.speed * speedFactor * 1.15 * frameScale;
            p.x += g.touchPos.x * joystickSpeed;
            p.y += g.touchPos.y * joystickSpeed;
          } else if (controlTypeRef.current === 'TOUCH') {
            const targetX = g.touchPos.x - p.width / 2;
            const targetY = g.touchPos.y - p.height / 2;
            const follow = 1 - Math.pow(0.78, frameScale);
            p.x += (targetX - p.x) * follow;
            p.y += (targetY - p.y) * follow;
          }
        }

        p.x = Math.max(10, Math.min(logicalWidth - p.width - 10, p.x));
        p.y = Math.max(10, Math.min(logicalHeight - p.height - 10, p.y));

        if (p.invulnerableTime > 0) {
          p.invulnerableTime -= frameScale;
        }

        // AUTO FIRE BULLETS
        const now = Date.now();
        const rapidFactor = (p.rapidFireUntil || 0) > now ? 0.45 : 1;
        const fireDelay = (SHIPS_CONFIG[p.shipType].fireRate / (1 + p.weaponLevel * 0.15)) * rapidFactor;
        if (now - p.lastFired > fireDelay) {
          p.lastFired = now;
          soundFx.playLaser(p.weaponType);

          // Defense ship gradually grows bit by bit while firing up to max 2x base size (100px -> 200px)
          const baseSize = 100;
          const maxSize = baseSize * 2; // 200px (2x original size)
          if (p.width < maxSize) {
            const growthStep = 0.5; // 0.5px per fire burst
            const newWidth = Math.min(maxSize, p.width + growthStep);
            const newHeight = Math.min(maxSize, p.height + growthStep);
            const dw = newWidth - p.width;
            const dh = newHeight - p.height;
            p.x -= dw / 2;
            p.y -= dh / 2;
            p.width = newWidth;
            p.height = newHeight;
          }

          const centerX = p.x + p.width / 2;
          const topY = p.y;

          if (p.weaponType === 'SINGLE') {
            g.bullets.push({
              x: centerX - 3,
              y: topY,
              width: 6,
              height: 16,
              speedX: 0,
              speedY: -14,
              isEnemy: false,
              damage: 20 * p.weaponLevel,
              color: '#38bdf8'
            });
          } else if (p.weaponType === 'DOUBLE') {
            g.bullets.push(
              { x: p.x + 8, y: topY + 8, width: 5, height: 16, speedX: 0, speedY: -14, isEnemy: false, damage: 16 * p.weaponLevel, color: '#f97316' },
              { x: p.x + p.width - 13, y: topY + 8, width: 5, height: 16, speedX: 0, speedY: -14, isEnemy: false, damage: 16 * p.weaponLevel, color: '#f97316' }
            );
          } else if (p.weaponType === 'SPREAD') {
            g.bullets.push(
              { x: centerX - 3, y: topY, width: 6, height: 16, speedX: -3, speedY: -13, isEnemy: false, damage: 15 * p.weaponLevel, color: '#c084fc' },
              { x: centerX - 3, y: topY, width: 6, height: 16, speedX: 0, speedY: -14, isEnemy: false, damage: 15 * p.weaponLevel, color: '#c084fc' },
              { x: centerX - 3, y: topY, width: 6, height: 16, speedX: 3, speedY: -13, isEnemy: false, damage: 15 * p.weaponLevel, color: '#c084fc' }
            );
          } else if (p.weaponType === 'TRIPLE') {
            g.bullets.push(
              { x: centerX - 12, y: topY + 5, width: 7, height: 18, speedX: 0, speedY: -15, isEnemy: false, damage: 22 * p.weaponLevel, color: '#e11d48' },
              { x: centerX - 3.5, y: topY - 4, width: 7, height: 20, speedX: 0, speedY: -16, isEnemy: false, damage: 25 * p.weaponLevel, color: '#fbbf24' },
              { x: centerX + 5, y: topY + 5, width: 7, height: 18, speedX: 0, speedY: -15, isEnemy: false, damage: 22 * p.weaponLevel, color: '#e11d48' }
            );
          } else if (p.weaponType === 'LASER') {
            const wLvl = p.weaponLevel;
            const laserDmg = 30 * wLvl;
            if (wLvl <= 1) {
              // Dual High-Voltage Laser Stream
              g.bullets.push(
                { x: centerX - 10, y: topY, width: 7, height: 26, speedX: 0, speedY: -18, isEnemy: false, damage: laserDmg, color: '#ec4899' },
                { x: centerX + 3, y: topY, width: 7, height: 26, speedX: 0, speedY: -18, isEnemy: false, damage: laserDmg, color: '#ec4899' }
              );
            } else if (wLvl === 2) {
              // Triple High-Power Laser Cannon
              g.bullets.push(
                { x: centerX - 16, y: topY + 4, width: 7, height: 28, speedX: -1.2, speedY: -18, isEnemy: false, damage: laserDmg, color: '#06b6d4' },
                { x: centerX - 3.5, y: topY - 4, width: 9, height: 32, speedX: 0, speedY: -20, isEnemy: false, damage: laserDmg * 1.2, color: '#ec4899' },
                { x: centerX + 8, y: topY + 4, width: 7, height: 28, speedX: 1.2, speedY: -18, isEnemy: false, damage: laserDmg, color: '#06b6d4' }
              );
            } else if (wLvl === 3) {
              // Quad Hyper-Laser Storm
              g.bullets.push(
                { x: centerX - 22, y: topY + 8, width: 8, height: 30, speedX: -2.5, speedY: -18, isEnemy: false, damage: laserDmg, color: '#a855f7' },
                { x: centerX - 10, y: topY, width: 9, height: 34, speedX: -0.5, speedY: -20, isEnemy: false, damage: laserDmg * 1.1, color: '#ec4899' },
                { x: centerX + 1, y: topY, width: 9, height: 34, speedX: 0.5, speedY: -20, isEnemy: false, damage: laserDmg * 1.1, color: '#ec4899' },
                { x: centerX + 14, y: topY + 8, width: 8, height: 30, speedX: 2.5, speedY: -18, isEnemy: false, damage: laserDmg, color: '#a855f7' }
              );
            } else {
              // Level 4 & 5: Quintuple Mega Death Laser Array
              g.bullets.push(
                { x: centerX - 28, y: topY + 10, width: 8, height: 32, speedX: -4.0, speedY: -18, isEnemy: false, damage: laserDmg, color: '#22c55e' },
                { x: centerX - 15, y: topY + 4, width: 9, height: 34, speedX: -1.8, speedY: -20, isEnemy: false, damage: laserDmg, color: '#a855f7' },
                { x: centerX - 4, y: topY - 6, width: 11, height: 38, speedX: 0, speedY: -22, isEnemy: false, damage: laserDmg * 1.3, color: '#facc15' },
                { x: centerX + 6, y: topY + 4, width: 9, height: 34, speedX: 1.8, speedY: -20, isEnemy: false, damage: laserDmg, color: '#a855f7' },
                { x: centerX + 20, y: topY + 10, width: 8, height: 32, speedX: 4.0, speedY: -18, isEnemy: false, damage: laserDmg, color: '#22c55e' }
              );
            }

            // Laser Fire muzzle flash energy particles
            for (let i = 0; i < 4; i++) {
              g.particles.push({
                x: centerX + (Math.random() - 0.5) * 16,
                y: topY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 4 - 2,
                radius: Math.random() * 2.5 + 1.0,
                color: ['#ec4899', '#38bdf8', '#facc15'][Math.floor(Math.random() * 3)],
                life: 0,
                maxLife: 10,
                alpha: 1.0
              });
            }
          }
        }

        if (now - g.lastProgressSave > 5000 && (g.pendingKills > 0 || g.pendingCoins > 0 || g.pendingBosses > 0 || g.criticalHits > 0 || g.totalDamage > 0)) {
          const k = g.pendingKills;
          const c = g.pendingCoins;
          const b = g.pendingBosses;
          recordGameplayProgress(stats.selectedShip, k, currentLevel, g.score, currentLevel === 101, c, b, g.criticalHits, g.totalDamage);
          const progressed = applyGameplayProgress(loadPlayerStats(), k, c, b);
          // Parent App owns the persistent profile; this local save keeps XP/daily state durable between turns.
          void progressed;
          g.pendingKills = 0;
          g.pendingCoins = 0;
          g.pendingBosses = 0;
          g.criticalHits = 0;
          g.totalDamage = 0;
          g.lastProgressSave = now;
        }

        // CHARGE ULTIMATE FROM COMBAT. Endless mode also introduces escalating hazards.
        g.ultimateCharge = Math.min(100, g.ultimateCharge + (0.035 + (stats.shipParts?.core || 0) * 0.007) * frameScale);
        if (currentLevel === 101 || (currentLevel >= 15 && currentLevel % 5 === 0)) {
          g.hazardCooldown = Math.max(0, g.hazardCooldown - frameScale);
          if (g.hazardCooldown <= 0) {
            g.hazardCooldown = 260 - Math.min(120, Math.floor(g.runKills * 1.2));
            g.hazardTimer = 70;
            g.floatingTexts.push({ id: Math.random().toString(), x: logicalWidth/2, y: 110, text: '☄ ASTEROID STORM!', color: '#fbbf24', alpha: 1, life: 0 });
          }
          if (g.hazardTimer > 0) {
            g.hazardTimer -= frameScale;
            if (Math.random() < 0.16 * frameScale) {
              const ax = Math.random() * logicalWidth;
              g.enemies.push({ id: 'hazard_'+now+'_'+Math.random(), type: 'ASTEROID', x: ax, y: -40, width: 34 + Math.random()*26, height: 34 + Math.random()*26, hp: 70 + g.runKills*2, maxHp: 70 + g.runKills*2, speedX: (Math.random()-0.5)*3, speedY: 4 + Math.random()*3, points: 80, lastFired: now, color: '#94a3b8', scoreValue: 80, coinValue: 3 });
            }
          }
        }

        // Gamepad support: left stick moves, A/RT fires, B bombs, Y ability, Start pauses.
        try {
          const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
          const pad = pads && pads[0];
          if (pad && stateRef.current === 'PLAYING') {
            const ax = pad.axes[0] || 0;
            const ay = pad.axes[1] || 0;
            if (Math.abs(ax) > 0.12 || Math.abs(ay) > 0.12) {
              p.x += ax * p.speed * frameScale;
              p.y += ay * p.speed * frameScale;
              p.x = Math.max(8, Math.min(logicalWidth - p.width - 8, p.x));
              p.y = Math.max(8, Math.min(logicalHeight - p.height - 8, p.y));
            }
            if (pad.buttons[0]?.pressed && now - p.lastFired > 120) p.lastFired = 0;
            if (pad.buttons[1]?.pressed) triggerBomb();
            if (pad.buttons[3]?.pressed) triggerShipAbility();
          }
        } catch {}

        // SPAWN ENEMIES / GIANT MONSTER BOSS MECHANICS
        const healthRatio = g.player.maxHealth > 0 ? g.player.health / g.player.maxHealth : 1;
        const director = getDirectorProfile({ level: currentLevel, playerHealthRatio: healthRatio, recentDeaths: 0, runKills: g.runKills, bossActive: !!g.boss });
        const spawnInterval = director.spawnIntervalMs;

        if (!g.boss && now - g.lastEnemySpawn > spawnInterval) {
          g.lastEnemySpawn = now;

          // Boss levels spawn a boss after the required enemy waves.
          // Normal levels finish immediately once the target is reached.
          if (currentLevel !== 101 && g.levelKills >= g.targetKills && !g.levelVictoryTriggered) {
            if (!isBossLevel(currentLevel)) {
              const miniBossLevel = currentLevel >= 8 && currentLevel % 8 === 0;
              const alreadyMini = g.miniBossSpawned || g.enemies.some(e => e.isMiniBoss);
              if (miniBossLevel && !alreadyMini) {
                const miniVariant = getBossVariant(Math.max(10, currentLevel - (currentLevel % 10)));
                const profile = BOSS_PROFILES[miniVariant];
                const w = Math.min(190, logicalWidth * 0.54);
                const h = 145;
                const hp = 420 + currentLevel * 120;
                const mini: Enemy = { id:'mini_boss_'+now, type:'BOSS', isMiniBoss:true, bossVariant:miniVariant, x:logicalWidth/2-w/2, y:-170, width:w, height:h, hp, maxHp:hp, speedX:2.1, speedY:1.1, points:900+currentLevel*45, lastFired:now, color:profile.color, scoreValue:900+currentLevel*45, coinValue:60+currentLevel, bossPhase:1 };
                g.boss = mini; g.miniBossSpawned = true; g.enemies.push(mini); setBossActive(true); setBossIntro({name:`${profile.name} · ELITE`, symbol:'⚔'}); window.setTimeout(() => { if (!disposed) setBossIntro(null); }, 1500); soundFx.playBossWarning(); soundFx.startBossMusic();
                g.floatingTexts.push({id:Math.random().toString(),x:logicalWidth/2,y:150,text:`⚔ MINI-BOSS INBOUND · ${profile.name}`,color:'#f59e0b',alpha:1,life:0});
              } else if (!miniBossLevel) {
                g.levelVictoryTriggered = true;
                const hpPercent = Math.max(0, (g.player.health / g.player.maxHealth) * 100);
                const stars = hpPercent >= 70 ? 3 : hpPercent >= 35 ? 2 : 1;
                setTimeout(() => {
                  if (disposed || g.gameOverTriggered) return;
                  flushPendingProgress();
                  setGameState('VICTORY');
                  onLevelVictory(currentLevel, g.score, g.coins, stars);
                }, 450);
              }
            } else {
              soundFx.playBossWarning();
            const bossVariant = getBossVariant(currentLevel);
            const bossProfile = BOSS_PROFILES[bossVariant];
            const bossWidth = Math.min(250, logicalWidth * 0.68);
            const bossHeight = 190;
            const difficultyCycle = Math.floor((currentLevel - 1) / BOSS_VARIANTS.length);
            const bossHp = 950 + currentLevel * 360 + difficultyCycle * 450;
            const newBoss: Enemy = {
              id: 'boss_' + now,
              type: 'BOSS',
              bossVariant,
              x: logicalWidth / 2 - bossWidth / 2,
              y: -200,
              width: bossWidth,
              height: bossHeight,
              hp: bossHp,
              maxHp: bossHp,
              speedX: 2.2 + Math.min(3.8, currentLevel * 0.055),
              speedY: 1.2 + Math.min(1.2, currentLevel * 0.008),
              points: 2200 * currentLevel,
              lastFired: now,
              color: bossProfile.color,
              scoreValue: 2200 + currentLevel * 80,
              coinValue: 120 + currentLevel * 3,
              bossPhase: 1
            };
            g.boss = newBoss;
            g.enemies.push(newBoss);
            setBossActive(true);
            setBossIntro({ name: bossProfile.name, symbol: bossProfile.symbol });
            window.setTimeout(() => { if (!disposed) setBossIntro(null); }, 1900);
            soundFx.startBossMusic();
            setBossHpPercent(100);

              g.floatingTexts.push({
                id: Math.random().toString(),
                x: logicalWidth / 2,
                y: 150,
                text: `⚠️ ${bossProfile.name} APPROACHING! ${bossProfile.symbol}`,
                color: '#f43f5e',
                alpha: 1,
                life: 0
              });
            }
          } else if (!g.levelVictoryTriggered && g.enemies.length < 14) {
            // Normal enemy selection based on Level progression
            const allowedTypes: Enemy['type'][] = ['SCOUT', 'UFO'];
            if (currentLevel >= 2) allowedTypes.push('ROCKET');
            if (currentLevel >= 3) allowedTypes.push('FIGHTER');
            if (currentLevel >= 5) allowedTypes.push('CRUISER', 'ASTEROID');

            const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
            const eliteChance = Math.min(0.24, 0.04 + currentLevel * 0.003);
            const isElite = Math.random() < eliteChance && chosenType !== 'ASTEROID';

            let eWidth = 44;
            let eHeight = 44;
            let eHp = 20 + currentLevel * 4;
            let eSpeedY = 2 + Math.random() * 1.5;
            let eColor = '#ef4444';
            let ePoints = 100;
            let eCoin = 5;

            if (chosenType === 'UFO') {
              eWidth = 112; // 2x larger (Green Leaf Spirit Fox)
              eHeight = 112;
              eSpeedY = 1.8 + Math.random() * 1.0;
              eColor = '#22c55e';
              eHp = 35 + currentLevel * 4;
            } else if (chosenType === 'ROCKET') {
              eWidth = 108; // 2x larger (Cute Orange Fox)
              eHeight = 108;
              eSpeedY = 3.2 + Math.random() * 1.5;
              eColor = '#f97316';
              eHp = 25 + currentLevel * 4;
            } else if (chosenType === 'SCOUT') {
              eWidth = 96; // 2x larger (Green Leaf Spirit Fox)
              eHeight = 96;
              eSpeedY = 3.5 + Math.random() * 1.5;
              eColor = '#84cc16';
              eHp = 20 + currentLevel * 3;
            } else if (chosenType === 'FIGHTER') {
              eWidth = 108; // 2x larger (Cute Orange Fox)
              eHeight = 108;
              eSpeedY = 3.0 + Math.random() * 1.2;
              eColor = '#fb923c';
              eHp = 30 + currentLevel * 4;
            } else if (chosenType === 'CRUISER') {
              eWidth = 144; // 2x larger (Warrior Frog in Cape)
              eHeight = 144;
              eHp = 90 + currentLevel * 10;
              eSpeedY = 1.2;
              eColor = '#06b6d4';
              ePoints = 250;
              eCoin = 15;
            } else if (chosenType === 'ASTEROID') {
              eWidth = 112; // 2x larger (Warrior Frog)
              eHeight = 112;
              eHp = 40 + currentLevel * 3;
              eSpeedY = 2.4;
              eColor = '#14b8a6';
              ePoints = 50;
              eCoin = 2;
            }

            // FORMATION SWARM SPAWN ("Swarm formation attack")
            const formationTypes = ['V_SHAPE', 'LINE_WAVE', 'ECHELON', 'PINCER'];
            const chosenFormation = formationTypes[Math.floor(Math.random() * formationTypes.length)];

            // Heavy units spawn 1-2, fast light units spawn in 3-5 squadrons
            const squadCount = (chosenType === 'CRUISER' || chosenType === 'ASTEROID')
              ? (Math.random() > 0.5 ? 2 : 1)
              : Math.min(5, 3 + Math.floor(Math.random() * 3));

            const squadPositions: { x: number; y: number }[] = [];

            if (chosenFormation === 'V_SHAPE' && squadCount >= 3) {
              // V-shaped fleet squadron
              const midX = Math.random() * (logicalWidth - 180) + 90;
              const stepX = eWidth + 14;
              const stepY = eHeight + 12;
              squadPositions.push({ x: midX - eWidth / 2, y: -eHeight }); // Leader
              squadPositions.push({ x: midX - eWidth / 2 - stepX, y: -eHeight - stepY });
              squadPositions.push({ x: midX - eWidth / 2 + stepX, y: -eHeight - stepY });
              if (squadCount >= 5) {
                squadPositions.push({ x: midX - eWidth / 2 - 2 * stepX, y: -eHeight - 2 * stepY });
                squadPositions.push({ x: midX - eWidth / 2 + 2 * stepX, y: -eHeight - 2 * stepY });
              }
            } else if (chosenFormation === 'LINE_WAVE') {
              // Horizontal wave formation across canvas
              const spacing = Math.min(75, (logicalWidth - 40) / squadCount);
              const startX = (logicalWidth - squadCount * spacing) / 2;
              for (let i = 0; i < squadCount; i++) {
                squadPositions.push({ x: startX + i * spacing, y: -eHeight });
              }
            } else if (chosenFormation === 'ECHELON') {
              // Diagonal staggered echelon wave
              const fromRight = Math.random() > 0.5;
              const stepX = (eWidth + 14) * (fromRight ? -1 : 1);
              const stepY = eHeight + 12;
              const startX = fromRight ? logicalWidth - eWidth - 30 : 30;
              for (let i = 0; i < squadCount; i++) {
                squadPositions.push({ x: Math.max(10, Math.min(logicalWidth - eWidth - 10, startX + i * stepX)), y: -eHeight - i * stepY });
              }
            } else {
              // Pincer attack (flanking from left & right)
              const half = Math.ceil(squadCount / 2);
              for (let i = 0; i < half; i++) {
                squadPositions.push({ x: 20 + i * (eWidth + 12), y: -eHeight - i * 20 });
                squadPositions.push({ x: logicalWidth - eWidth - 20 - i * (eWidth + 12), y: -eHeight - i * 20 });
              }
            }

            squadPositions.forEach((pos, index) => {
              // Stagger firing time by 1000ms (1 second) per ship in squad so they fire sequentially
              const staggerOffset = index * 1000;
              g.enemies.push({
                id: 'enemy_' + Math.random(),
                type: chosenType,
                x: Math.max(10, Math.min(logicalWidth - eWidth - 10, pos.x)),
                y: pos.y,
                width: eWidth,
                height: eHeight,
                hp: Math.round(eHp * director.enemyHpMultiplier * (isElite ? 2.2 : 1)),
                maxHp: Math.round(eHp * director.enemyHpMultiplier * (isElite ? 2.2 : 1)),
                speedX: (chosenType === 'UFO' ? (Math.random() - 0.5) * 1.2 : (Math.random() - 0.5) * 2) * director.enemySpeedMultiplier,
                speedY: eSpeedY * director.enemySpeedMultiplier,
                points: ePoints,
                lastFired: now + staggerOffset - 2000,
                color: eColor,
                scoreValue: Math.round(ePoints * (isElite ? 2.5 : 1)),
                coinValue: Math.round(eCoin * (isElite ? 2 : 1)),
                isElite,
                sineOffset: Math.random() * Math.PI * 2
              });
              if (isElite) {
                const elite = g.enemies[g.enemies.length - 1];
                elite.speedY *= 1.08; elite.speedX *= 1.18; elite.color = '#f59e0b';
              }
            });
          }
        }

        // UPDATE BULLETS
        g.bullets.forEach((b) => {
          b.x += b.speedX * frameScale;
          b.y += b.speedY * frameScale;

          // Spawn stylish laser energy particles trailing behind player bullets
          if (!b.isEnemy && Math.random() > 0.35) {
            g.particles.push({
              x: b.x + b.width / 2 + (Math.random() - 0.5) * 4,
              y: b.y + b.height + Math.random() * 2,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 1.8 + Math.random() * 1.5,
              radius: Math.random() * 1.8 + 0.8,
              color: b.color,
              life: 0,
              maxLife: 12 + Math.floor(Math.random() * 8),
              alpha: 0.95
            });
          }
        });

        g.bullets = g.bullets.filter(
          (b) => b.x > -20 && b.x < logicalWidth + 20 && b.y > -20 && b.y < logicalHeight + 20
        );

        // UPDATE ENEMIES
        g.enemies.forEach((enemy) => {
          if (enemy.type === 'BOSS') {
            const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
            const newPhase = hpRatio <= 0.25 ? 4 : hpRatio <= 0.5 ? 3 : hpRatio <= 0.75 ? 2 : 1;
            if (enemy.bossPhase !== newPhase) {
              enemy.bossPhase = newPhase;
              g.screenShake = 12;
              g.floatingTexts.push({ id: Math.random().toString(), x: enemy.x + enemy.width/2, y: enemy.y - 25, text: `⚠ PHASE ${newPhase}`, color: '#fca5a5', alpha: 1, life: 0 });
            }
            if (enemy.y < 70) {
              enemy.y += enemy.speedY * frameScale;
            } else {
              enemy.x += enemy.speedX * frameScale;
              if (enemy.x <= 20 || enemy.x + enemy.width >= logicalWidth - 20) {
                enemy.speedX *= -1;
              }
            }

            // Giant Monster Weapon Barrages
            const bossFireInterval = Math.max(520, 1800 - currentLevel * 15 - (enemy.bossPhase || 1) * 180);
            if (now - (enemy.lastFired || 0) > bossFireInterval) {
              enemy.lastFired = now;
              soundFx.playLaser('TRIPLE');
              const bossCenterX = enemy.x + enemy.width / 2;
              const bossBottomY = enemy.y + enemy.height - 15;
              const variant = enemy.bossVariant || 'VOID_JUGGERNAUT';
              const profile = BOSS_PROFILES[variant];
              const spread = 2.2 + currentLevel * 0.018;
              const damage = 18 + Math.floor(currentLevel * 0.55);

              if (variant === 'VOID_JUGGERNAUT') {
                for (let i = -2; i <= 2; i++) g.bullets.push({ x: bossCenterX - 5, y: bossBottomY, width: 9, height: 22, speedX: i * spread * 0.8, speedY: 7.2, isEnemy: true, damage, color: profile.color });
              } else if (variant === 'IRON_MAELSTROM' || variant === 'NOVA_DEVOURER') {
                for (let i = -3; i <= 3; i++) g.bullets.push({ x: bossCenterX - 4, y: bossBottomY, width: 8, height: 24, speedX: i * 1.55, speedY: 6.8 + Math.abs(i) * 0.28, isEnemy: true, damage: damage + 2, color: profile.color });
              } else if (variant === 'CELESTIAL_WARDEN' || variant === 'CRYSTAL_TITAN') {
                g.bullets.push(
                  { x: bossCenterX - 42, y: bossBottomY, width: 9, height: 26, speedX: -spread, speedY: 7.2, isEnemy: true, damage, color: profile.color },
                  { x: bossCenterX - 4, y: bossBottomY, width: 10, height: 30, speedX: 0, speedY: 8.8, isEnemy: true, damage: damage + 5, color: '#ffffff' },
                  { x: bossCenterX + 33, y: bossBottomY, width: 9, height: 26, speedX: spread, speedY: 7.2, isEnemy: true, damage, color: profile.color }
                );
              } else if (variant === 'SHADOW_REVENANT') {
                for (let i = -2; i <= 2; i++) g.bullets.push({ x: bossCenterX - 4, y: bossBottomY, width: 8, height: 22, speedX: i * 1.9, speedY: 6.5 + Math.abs(i) * 0.45, isEnemy: true, damage: damage + 1, color: profile.color });
              } else {
                for (let i = -4; i <= 4; i++) g.bullets.push({ x: bossCenterX - 4, y: bossBottomY, width: 9, height: 25, speedX: i * 1.35, speedY: 6.5 + Math.abs(i) * 0.25, isEnemy: true, damage: damage + 4, color: profile.color });
              }
            }

            if ((enemy.bossPhase || 1) >= 3 && Math.random() < 0.12 * frameScale) {
              const bx = enemy.x + enemy.width/2;
              const by = enemy.y + enemy.height;
              for (const dir of [-1, 1]) g.bullets.push({ x: bx - 4, y: by, width: 8, height: 20, speedX: dir * 4.5, speedY: 7.5, isEnemy: true, damage: 10 + currentLevel * 0.3, color: '#fb7185' });
            }
            setBossHpPercent(Math.max(0, Math.floor((enemy.hp / enemy.maxHp) * 100)));
          } else if (enemy.type === 'UFO') {
            // UFO Wavy Motion
            enemy.sineOffset = (enemy.sineOffset || 0) + 0.06 * frameScale;
            enemy.x += Math.sin(enemy.sineOffset) * 2.8 * frameScale;
            enemy.y += enemy.speedY * frameScale;
            enemy.x = Math.max(10, Math.min(logicalWidth - enemy.width - 10, enemy.x));
          } else if (enemy.type === 'ROCKET') {
            // Rocket Straight Fast Dive
            enemy.y += enemy.speedY * frameScale;
          } else {
            enemy.x += enemy.speedX * frameScale;
            enemy.y += enemy.speedY * frameScale;
          }
        });

        g.enemies = g.enemies.filter((e) => e.y < logicalHeight + e.height && e.hp > 0);

        // BULLET & ENEMY COLLISIONS
        // Passive shield recharge after a short grace period.
        if (p.shield < p.maxShield && p.invulnerableTime <= 0) p.shield = Math.min(p.maxShield, p.shield + 0.035 * frameScale);

        g.bullets.forEach((bullet) => {
          if (bullet.isEnemy) {
            // Enemy Bullet vs Player
            if (
              p.invulnerableTime <= 0 &&
              bullet.x < p.x + p.width &&
              bullet.x + bullet.width > p.x &&
              bullet.y < p.y + p.height &&
              bullet.y + bullet.height > p.y
            ) {
              const dmg = bullet.damage || 15;
              bullet.damage = 0;
              g.screenShake = 10;
              soundFx.playHit();

              if (p.shield > 0) {
                p.shield -= dmg;
                if (p.shield < 0) {
                  p.health += p.shield;
                  p.shield = 0;
                  soundFx.playShieldBreak();
                  g.floatingTexts.push({ id: Math.random().toString(), x: p.x + p.width / 2, y: p.y - 12, text: 'SHIELD BREAK!', color: '#67e8f9', alpha: 1, life: 0 });
                }
              } else {
                p.health -= dmg;
              }

              for (let i = 0; i < 6; i++) {
                g.particles.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: Math.random() * 3 + 1,
                  color: '#06b6d4',
                  life: 0,
                  maxLife: 20,
                  alpha: 1
                });
              }

              if (p.health <= 0) {
                p.health = 0;
                soundFx.playExplosion(true);
                if (!g.gameOverTriggered) {
                  g.gameOverTriggered = true;
                  setGameState('GAMEOVER');
                  onGameOver(g.score, g.coins);
                }
              }
            }
          } else {
            // Player Bullet vs Enemy
            g.enemies.forEach((enemy) => {
              if (
                bullet.damage > 0 &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
              ) {
                const baseDamage = bullet.damage;
                const critical = Math.random() < 0.12;
                const dealt = critical ? Math.round(baseDamage * 2) : baseDamage;
                enemy.hp -= dealt;
                bullet.damage = 0;
                g.totalDamage += dealt;
                if (critical) {
                  g.criticalHits += 1;
                  soundFx.playCriticalHit();
                  g.floatingTexts.push({ id: Math.random().toString(), x: bullet.x, y: bullet.y - 10, text: `CRIT! ${dealt}`, color: '#fef08a', alpha: 1, life: 0 });
                  g.screenShake = Math.max(g.screenShake, 5);
                } else {
                  g.floatingTexts.push({ id: Math.random().toString(), x: bullet.x, y: bullet.y - 8, text: `${dealt}`, color: '#e2e8f0', alpha: 0.95, life: 0 });
                }
                soundFx.playHit();

                // Spark impact particles when shooting enemies
                for (let i = 0; i < 4; i++) {
                  g.particles.push({
                    x: bullet.x,
                    y: bullet.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    radius: Math.random() * 2 + 1,
                    color: enemy.color,
                    life: 0,
                    maxLife: 15,
                    alpha: 1
                  });
                }

                // Premium economy: bonus coin drops are intentionally rare.
                if (Math.random() < 0.06) {
                  const isDiamond = Math.random() < 0.3;
                  g.powerUps.push({
                    x: bullet.x - 16,
                    y: bullet.y - 16,
                    width: isDiamond ? 36 : 32,
                    height: isDiamond ? 36 : 32,
                    type: 'COIN',
                    coinType: isDiamond ? 'DIAMOND' : 'GOLD',
                    speedY: 1.8,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 3.0 - 2.0, // Pop upwards dynamically
                    color: isDiamond ? '#22d3ee' : '#f59e0b',
                    symbol: isDiamond ? '💎' : '✦',
                    value: isDiamond ? 30 : 10,
                    spinAngle: Math.random() * Math.PI * 2,
                    spinSpeed: 0.1 + Math.random() * 0.1
                  });
                }

                if (enemy.hp <= 0) {
                  soundFx.playExplosion(enemy.type === 'BOSS' || enemy.type === 'CRUISER');
                  g.score += enemy.scoreValue * ((p.scoreMultiplierUntil || 0) > Date.now() ? 2 : 1);
                  if (enemy.type === 'BOSS' && !enemy.isMiniBoss && !g.chestDropped) {
                    g.chestDropped = true;
                    g.powerUps.push({ x: enemy.x + enemy.width/2 - 22, y: enemy.y + enemy.height/2 - 22, width: 44, height: 44, type: 'COIN', speedY: 1.2, color: '#fbbf24', symbol: '🎁', value: 120 + currentLevel * 3, coinType: 'SUPER_GEM', spinAngle: 0, spinSpeed: 0.08 });
                    g.floatingTexts.push({ id: Math.random().toString(), x: enemy.x + enemy.width/2, y: enemy.y, text: '🎁 BOSS CHEST!', color: '#fef08a', alpha: 1, life: 0 });
                  }
                  g.levelKills += 1;
                  g.runKills += 1;
                  g.pendingKills += 1;
                  if (enemy.type === 'BOSS') g.pendingBosses += 1;
                  g.ultimateCharge = Math.min(100, g.ultimateCharge + (enemy.type === 'BOSS' ? 35 : 4));
                  g.missionProgress += 1;
                  if (g.runKills > 0 && g.runKills % 12 === 0) {
                    g.player.weaponLevel = Math.min(8, g.player.weaponLevel + 1);
                    g.floatingTexts.push({ id: Math.random().toString(), x: p.x + p.width/2, y: p.y - 40, text: `⚡ WEAPON EVOLVED Lv.${g.player.weaponLevel}`, color: '#facc15', alpha: 1, life: 0 });
                  }
                  if (!g.missionCompleted && g.missionProgress >= g.missionTarget) {
                    g.missionCompleted = true;
                    g.coins += 75 + currentLevel * 2;
                    g.floatingTexts.push({ id: Math.random().toString(), x: p.x + p.width/2, y: p.y - 70, text: '🎯 MISSION COMPLETE +BONUS', color: '#4ade80', alpha: 1, life: 0 });
                  }

                  // Subtle expansion of player defense ship with destroyed enemy up to max 2x base size (200px)
                  const baseSize = 100;
                  const maxSize = baseSize * 2; // 200px max (2x original size)
                  if (p.width < maxSize) {
                    const killGrowth = 1.0; // 1px per destroyed enemy
                    const newWidth = Math.min(maxSize, p.width + killGrowth);
                    const newHeight = Math.min(maxSize, p.height + killGrowth);
                    p.x -= (newWidth - p.width) / 2;
                    p.y -= (newHeight - p.height) / 2;
                    p.width = newWidth;
                    p.height = newHeight;
                  }

                  setScore(g.score);
                  setLevelKills(g.levelKills);

                  // Floating Score Text & Growth indicator
                  g.floatingTexts.push({
                    id: Math.random().toString(),
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y,
                    text: `+${enemy.scoreValue}`,
                    color: '#fde047',
                    alpha: 1,
                    life: 0
                  });

                  if (g.levelKills % 5 === 0) {
                    g.floatingTexts.push({
                      id: Math.random().toString(),
                      x: p.x + p.width / 2,
                      y: p.y - 12,
                      text: '⚡ SHIP POWER BOOST!',
                      color: '#38bdf8',
                      alpha: 1,
                      life: 0
                    });
                  }

                  // Explosion Particles
                  const pCount = enemy.type === 'BOSS' ? 40 : 12;
                  for (let i = 0; i < pCount; i++) {
                    g.particles.push({
                      x: enemy.x + enemy.width / 2,
                      y: enemy.y + enemy.height / 2,
                      vx: (Math.random() - 0.5) * 10,
                      vy: (Math.random() - 0.5) * 10,
                      radius: Math.random() * 5 + 2,
                      color: enemy.color,
                      life: 0,
                      maxLife: 35,
                      alpha: 1
                    });
                  }

                  // PREMIUM COIN ECONOMY: fewer drops, stronger rewards.
                  // Bosses remain rewarding, while normal enemies only have a 55% chance to drop a coin.
                  const isBoss = enemy.type === 'BOSS';
                  const isCruiser = enemy.type === 'CRUISER' || enemy.type === 'ASTEROID';
                  const shouldDrop = isBoss || isCruiser || Math.random() < 0.55;
                  if (!shouldDrop) {
                    // No coin on this kill; scarcity is intentional.
                  }
                  const dropCoinCount = shouldDrop ? (isBoss ? 3 : isCruiser ? 1 : 1) : 0;

                  for (let c = 0; c < dropCoinCount; c++) {
                    const burstAngle = Math.random() * Math.PI * 2;
                    const burstSpeed = isBoss ? Math.random() * 4.5 + 2.0 : Math.random() * 3.0 + 1.5;
                    const randVal = Math.random();
                    const cType: 'GOLD' | 'DIAMOND' | 'SUPER_GEM' = isBoss ? 'SUPER_GEM' : (randVal < 0.45 || isCruiser) ? 'DIAMOND' : 'GOLD';
                    const cVal = cType === 'SUPER_GEM' ? 120 : cType === 'DIAMOND' ? 40 : 12;
                    const cColor = cType === 'SUPER_GEM' ? '#f43f5e' : cType === 'DIAMOND' ? '#38bdf8' : '#f59e0b';
                    const cSymbol = cType === 'SUPER_GEM' ? '✦' : cType === 'DIAMOND' ? '◆' : '✦';
                    // Sizing: Super Gem = 52px, Diamond = 42px, Gold = 36px (Much larger and striking!)
                    const cSize = cType === 'SUPER_GEM' ? 52 : cType === 'DIAMOND' ? 42 : 36;

                    g.powerUps.push({
                      x: enemy.x + enemy.width / 2 - cSize / 2,
                      y: enemy.y + enemy.height / 2 - cSize / 2,
                      width: cSize,
                      height: cSize,
                      type: 'COIN',
                      coinType: cType,
                      speedY: 1.8,
                      vx: Math.cos(burstAngle) * burstSpeed,
                      vy: Math.sin(burstAngle) * burstSpeed - 2.8,
                      color: cColor,
                      symbol: cSymbol,
                      value: cVal,
                      spinAngle: Math.random() * Math.PI * 2,
                      spinSpeed: 0.08 + Math.random() * 0.08
                    });
                  }

                  // Chance to drop powerup item (Health, Shield, Laser, Triple, Bomb)
                  if (Math.random() < 0.35 || enemy.type === 'BOSS') {
                    const pTypes: PowerUp['type'][] = ['HEALTH', 'SHIELD', 'TRIPLE_SHOT', 'LASER', 'BOMB', 'RAPID_FIRE', 'SPEED_BOOST', 'SCORE_MULTIPLIER'];
                    const chosenP = pTypes[Math.floor(Math.random() * pTypes.length)];
                    g.powerUps.push({
                      x: enemy.x + enemy.width / 2 - 13,
                      y: enemy.y + enemy.height / 2,
                      width: 26,
                      height: 26,
                      type: chosenP,
                      speedY: 1.8,
                      vx: (Math.random() - 0.5) * 3,
                      vy: -Math.random() * 2.5 - 1.0,
                      color: chosenP === 'HEALTH' ? '#22c55e' : chosenP === 'SHIELD' ? '#06b6d4' : chosenP === 'BOMB' ? '#ef4444' : chosenP === 'LASER' ? '#ec4899' : chosenP === 'RAPID_FIRE' ? '#f97316' : chosenP === 'SPEED_BOOST' ? '#22d3ee' : chosenP === 'SCORE_MULTIPLIER' ? '#facc15' : '#a855f7',
                      symbol: chosenP === 'HEALTH' ? '+' : chosenP === 'SHIELD' ? 'S' : chosenP === 'BOMB' ? 'B' : chosenP === 'LASER' ? '⚡' : chosenP === 'RAPID_FIRE' ? 'R' : chosenP === 'SPEED_BOOST' ? '↯' : chosenP === 'SCORE_MULTIPLIER' ? '2×' : '3'
                    });
                  }

                  // CHECK LEVEL VICTORY CONDITION - Defeating the Giant Monster completes the game/level!
                  if (enemy.type === 'BOSS') {
                    g.boss = null;
                    setBossActive(false);
                    soundFx.startMusic();
                    g.screenShake = 25;

                    if (enemy.isMiniBoss) {
                      g.floatingTexts.push({ id: Math.random().toString(), x: logicalWidth/2, y: 180, text: '⚔ MINI-BOSS DEFEATED! +BONUS', color: '#fbbf24', alpha: 1, life: 0 });
                      setBossIntro(null);
                      // Mini-boss levels are complete when their elite is defeated.
                      // Without this guard, the next spawn check sees miniBossSpawned=true
                      // and the level can become unwinnable forever.
                      if (!g.levelVictoryTriggered) {
                        g.levelVictoryTriggered = true;
                        const hpPercent = Math.max(0, (p.health / p.maxHealth) * 100);
                        const stars = hpPercent >= 70 ? 3 : hpPercent >= 35 ? 2 : 1;
                        soundFx.playPowerUp();
                        setTimeout(() => {
                          if (disposed || g.gameOverTriggered) return;
                          setGameState('VICTORY');
                          onLevelVictory(currentLevel, g.score, g.coins, stars);
                        }, 650);
                      }
                    } else if (!g.levelVictoryTriggered) {
                      g.levelVictoryTriggered = true;
                      const hpPercent = Math.max(0, (p.health / p.maxHealth) * 100);
                      const stars = hpPercent >= 70 ? 3 : hpPercent >= 35 ? 2 : 1;

                      g.floatingTexts.push({
                        id: Math.random().toString(),
                        x: logicalWidth / 2,
                        y: 180,
                        text: `💥 ${BOSS_PROFILES[enemy.bossVariant || 'VOID_JUGGERNAUT'].name} DEFEATED! GALAXY SAVED! 🎉`,
                        color: '#fde047',
                        alpha: 1,
                        life: 0
                      });

                      soundFx.playPowerUp();
                      setTimeout(() => {
                        if (disposed || g.gameOverTriggered) return;
                        flushPendingProgress();
                        setGameState('VICTORY');
                        onLevelVictory(currentLevel, g.score, g.coins, stars);
                      }, 1000);
                    }
                  }
                }
              }
            });
          }
        });

        // PLAYER VS ENEMY BODY COLLISION
        g.enemies.forEach((enemy) => {
          if (
            p.invulnerableTime <= 0 &&
            p.x < enemy.x + enemy.width &&
            p.x + p.width > enemy.x &&
            p.y < enemy.y + enemy.height &&
            p.y + p.height > enemy.y
          ) {
            enemy.hp -= 100;
            p.health -= 25;
            p.invulnerableTime = 40;
            g.screenShake = 15;
            soundFx.playExplosion(false);

            if (p.health <= 0) {
              p.health = 0;
              if (!g.gameOverTriggered) {
                g.gameOverTriggered = true;
                flushPendingProgress();
                setGameState('GAMEOVER');
                onGameOver(g.score, g.coins);
              }
            }
          }
        });

        // POWERUP & COIN PHYSICS, MAGNETIC VACUUM, AND PICKUP
        g.powerUps.forEach((pu) => {
          // Burst Physics
          if (pu.vx !== undefined) {
            pu.x += pu.vx * frameScale;
            pu.vx *= Math.pow(0.95, frameScale); // Horizontal friction
          }

          if (pu.vy !== undefined) {
            pu.y += pu.vy * frameScale;
            pu.vy = Math.min(2.8, pu.vy + 0.12 * frameScale); // Downward gravity
          } else {
            pu.y += pu.speedY * frameScale;
          }

          // 3D Coin Rotation Spin
          pu.spinAngle = (pu.spinAngle || 0) + (pu.spinSpeed || 0.08) * frameScale;

          // Magnetic Vacuum Attraction towards Player Ship
          const playerCenterX = p.x + p.width / 2;
          const playerCenterY = p.y + p.height / 2;
          const powerUpCenterX = pu.x + pu.width / 2;
          const powerUpCenterY = pu.y + pu.height / 2;
          const distToPlayer = Math.hypot(playerCenterX - powerUpCenterX, playerCenterY - powerUpCenterY);

          // Coins have a wide magnetic vacuum field (240px)
          const magnetDist = pu.type === 'COIN' ? 240 : 140;
          if (distToPlayer < magnetDist) {
            pu.magnetized = true;
            const pullForce = (1 - distToPlayer / magnetDist) * 4.5;
            const dirX = (playerCenterX - powerUpCenterX) / (distToPlayer || 1);
            const dirY = (playerCenterY - powerUpCenterY) / (distToPlayer || 1);

            pu.vx = (pu.vx || 0) + dirX * pullForce;
            pu.vy = (pu.vy || 0) + dirY * pullForce;

            // DRAW GLOWING TRACTOR BEAM LASER LINE CONNECTING SHIP TO MAGNETIZED COIN
            if (pu.type === 'COIN') {
              ctx.save();
              ctx.strokeStyle = pu.coinType === 'SUPER_GEM' ? 'rgba(244, 63, 94, 0.65)' : pu.coinType === 'DIAMOND' ? 'rgba(56, 189, 248, 0.65)' : 'rgba(250, 204, 21, 0.6)';
              ctx.lineWidth = 2.2;
              ctx.shadowColor = pu.color;
              ctx.shadowBlur = graphicsQualityRef.current === 'LOW' ? 0 : 8;
              ctx.beginPath();
              ctx.moveTo(playerCenterX, playerCenterY - p.height * 0.3);
              ctx.lineTo(powerUpCenterX, powerUpCenterY);
              ctx.stroke();
              ctx.restore();
            }
          }

          // Shimmering Golden/Cyan trail behind magnetic / falling coins
          if (pu.type === 'COIN' && Math.random() < 0.45) {
            const trailCol = pu.coinType === 'SUPER_GEM' ? '#f43f5e' : pu.coinType === 'DIAMOND' ? '#38bdf8' : '#fde047';
            g.particles.push({
              x: powerUpCenterX + (Math.random() - 0.5) * 6,
              y: powerUpCenterY + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8,
              radius: Math.random() * 2.0 + 0.8,
              color: trailCol,
              life: 0,
              maxLife: 16,
              alpha: 0.85
            });
          }

          if (
            pu.x < p.x + p.width &&
            pu.x + pu.width > p.x &&
            pu.y < p.y + p.height &&
            pu.y + pu.height > p.y
          ) {
            soundFx.playPowerUp();
            pu.y = logicalHeight + 100;

            if (pu.type === 'COIN') {
              const coinVal = pu.value || 10;
              g.coins += coinVal;
              g.pendingCoins += coinVal;
              setCoinsEarned(g.coins);
              soundFx.playCoin();

              // Sparkle Burst Particles on Coin Pickup
              const burstColor = pu.coinType === 'SUPER_GEM' ? ['#ffe4e6', '#f43f5e', '#e11d48'] : pu.coinType === 'DIAMOND' ? ['#bae6fd', '#38bdf8', '#0284c7'] : ['#fde047', '#fef08a', '#f59e0b'];
              for (let i = 0; i < 16; i++) {
                g.particles.push({
                  x: powerUpCenterX,
                  y: powerUpCenterY,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  radius: Math.random() * 3.5 + 1,
                  color: burstColor[Math.floor(Math.random() * burstColor.length)],
                  life: 0,
                  maxLife: 24,
                  alpha: 1
                });
              }

              const badgeText = pu.coinType === 'SUPER_GEM' ? `+${coinVal} SUPER CRYSTAL!` : pu.coinType === 'DIAMOND' ? `+${coinVal} DIAMOND!` : `+${coinVal} PREMIUM COIN!`;
              const badgeColor = pu.coinType === 'SUPER_GEM' ? '#f43f5e' : pu.coinType === 'DIAMOND' ? '#38bdf8' : '#fde047';

              g.floatingTexts.push({
                id: Math.random().toString(),
                x: powerUpCenterX,
                y: powerUpCenterY - 14,
                text: badgeText,
                color: badgeColor,
                alpha: 1,
                life: 0
              });
            } else if (pu.type === 'HEALTH') {
              p.health = Math.min(p.maxHealth, p.health + 35);
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '+HEALTH', color: '#22c55e', alpha: 1, life: 0 });
            } else if (pu.type === 'SHIELD') {
              p.shield = p.maxShield;
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '+SHIELD', color: '#06b6d4', alpha: 1, life: 0 });
            } else if (pu.type === 'BOMB') {
              g.bombs += 1;
              setBombsCount(g.bombs);
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '+1 BOMB', color: '#ef4444', alpha: 1, life: 0 });
            } else if (pu.type === 'TRIPLE_SHOT') {
              p.weaponType = 'TRIPLE';
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: 'TRIPLE CANNON!', color: '#c084fc', alpha: 1, life: 0 });
            } else if (pu.type === 'RAPID_FIRE') {
              p.rapidFireUntil = Date.now() + 8000;
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '🔥 RAPID FIRE!', color: '#f97316', alpha: 1, life: 0 });
            } else if (pu.type === 'SPEED_BOOST') {
              p.speedBoostUntil = Date.now() + 7000;
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '⚡ SPEED BOOST!', color: '#22d3ee', alpha: 1, life: 0 });
            } else if (pu.type === 'SCORE_MULTIPLIER') {
              p.scoreMultiplierUntil = Date.now() + 10000;
              g.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y, text: '2× SCORE!', color: '#facc15', alpha: 1, life: 0 });
            } else if (pu.type === 'LASER') {
              if (p.weaponType !== 'LASER') {
                p.weaponType = 'LASER';
                p.weaponLevel = Math.max(1, p.weaponLevel);
                g.floatingTexts.push({ id: Math.random().toString(), x: p.x + p.width / 2, y: p.y - 12, text: '⚡ HIGH-VOLTAGE LASER!', color: '#ec4899', alpha: 1, life: 0 });
              } else {
                p.weaponLevel = Math.min(5, p.weaponLevel + 1);
                g.floatingTexts.push({ id: Math.random().toString(), x: p.x + p.width / 2, y: p.y - 12, text: `⚡ MEGA LASER LVL ${p.weaponLevel}!`, color: '#facc15', alpha: 1, life: 0 });
              }
              soundFx.playPowerUp();
            }
          }
        });

        g.powerUps = g.powerUps.filter((pu) => pu.y < logicalHeight + 30);

        // BLACK HOLE ANIMATION & GRAVITATIONAL PHYSICS UPDATE
        if (g.blackHole) {
          const bh = g.blackHole;
          bh.life += frameScale;
          bh.rotation += 0.15 * frameScale;

          const progress = bh.life / bh.maxLife;
          if (progress < 0.25) {
            bh.radius = (progress / 0.25) * bh.maxRadius;
          } else if (progress < 0.8) {
            bh.radius = bh.maxRadius;
          } else {
            bh.radius = Math.max(0, (1 - (progress - 0.8) / 0.2) * bh.maxRadius);
          }

          // Gravitational pull on all active enemies
          g.enemies.forEach((enemy) => {
            const ex = enemy.x + enemy.width / 2;
            const ey = enemy.y + enemy.height / 2;
            const dx = bh.x - ex;
            const dy = bh.y - ey;
            const dist = Math.hypot(dx, dy);

            // Pull towards black hole center
            if (dist > 10) {
              enemy.x += (dx / dist) * Math.min(dist, 10);
              enemy.y += (dy / dist) * Math.min(dist, 10);
            }

            // Continuous gravitational damage
            enemy.hp -= 4.5 * frameScale;

            // Spawn sucked-in energy particles (Black & White)
            if (Math.random() < 0.4) {
              g.particles.push({
                x: ex,
                y: ey,
                vx: (dx / (dist || 1)) * 6,
                vy: (dy / (dist || 1)) * 6,
                radius: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#ffffff' : '#cbd5e1',
                life: 0,
                maxLife: 20,
                alpha: 1
              });
            }
          });

          // Pull boss if active
          if (g.boss) {
            const bx = g.boss.x + g.boss.width / 2;
            const by = g.boss.y + g.boss.height / 2;
            g.boss.x += (bh.x - bx) * 0.015;
            g.boss.y += (bh.y - by) * 0.015;
            g.boss.hp -= 4.0 * frameScale;
          }

          // Destroy enemy bullets touching black hole
          g.bullets = g.bullets.filter((b) => {
            if (!b.isEnemy) return true;
            const dist = Math.hypot(bh.x - b.x, bh.y - b.y);
            return dist > bh.radius + 15;
          });

          if (bh.life >= bh.maxLife) {
            g.blackHole = null;
          }
        }

        // SPAWN THIN COLORFUL ROCKET SMOKE TRAIL BEHIND 3 SLIM THRUSTER PIPES
        if (stateRef.current === 'PLAYING' && graphicsQualityRef.current !== 'LOW') {
          const smokeColors = ['#f43f5e', '#ec4899', '#a855f7', '#38bdf8', '#34d399', '#facc15', '#fb923c', '#06b6d4'];
          const thrusterOffsets = [-p.width * 0.22, 0, p.width * 0.22];
          thrusterOffsets.forEach((offsetX) => {
            if (Math.random() > 0.15) {
              const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
              g.particles.push({
                x: p.x + p.width / 2 + offsetX + (Math.random() - 0.5) * 2,
                y: p.y + p.height * 0.92 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 3.2 + Math.random() * 1.8,
                radius: Math.random() * 1.0 + 1.2,
                color,
                life: 0,
                maxLife: 22 + Math.floor(Math.random() * 12),
                alpha: 0.95
              });
            }
          });
        }

        // PARTICLES & FLOATING TEXT
        const particleCap = graphicsQualityRef.current === 'LOW' ? 10
          : graphicsQualityRef.current === 'MED' ? 28
          : 70;
        if (g.particles.length > particleCap) {
          g.particles = g.particles.slice(-particleCap);
        }
        g.particles.forEach((pt) => {
          pt.x += pt.vx * frameScale;
          pt.y += pt.vy * frameScale;
          pt.life += frameScale;
          pt.alpha = 1 - pt.life / pt.maxLife;
        });
        g.particles = g.particles.filter((pt) => pt.life < pt.maxLife);

        // Virtual joystick overlay. It is drawn only when the player selected it.
      if (controlTypeRef.current === 'JOYSTICK' && joystickRef.current.active && stateRef.current === 'PLAYING') {
        const j = joystickRef.current;
        const knobX = j.x + g.touchPos.x * j.radius;
        const knobY = j.y + g.touchPos.y * j.radius;
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.beginPath();
        ctx.arc(knobX, knobY, j.radius * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      g.floatingTexts.forEach((ft) => {
          ft.y -= 1;
          ft.life += frameScale;
          ft.alpha = 1 - ft.life / 40;
        });
        g.floatingTexts = g.floatingTexts.filter((ft) => ft.life < 40);
      }

      // DRAW BLACK HOLE VISUAL ANIMATION (BLACK & WHITE / MONOCHROME)
      if (g.blackHole) {
        const bh = g.blackHole;
        const progress = bh.life / bh.maxLife;

        ctx.save();
        ctx.translate(Math.round(bh.x), Math.round(bh.y));

        // 1. Gravitational Lens Outer Energy Distortion Ring (Monochrome Glow)
        const ringPulse = Math.sin(Date.now() * 0.02) * 6;
        const outerGrad = ctx.createRadialGradient(0, 0, bh.radius * 0.15, 0, 0, bh.radius + 35 + ringPulse);
        outerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
        outerGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.6)');
        outerGrad.addColorStop(0.7, 'rgba(180, 180, 180, 0.25)');
        outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, bh.radius + 35 + ringPulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Swirling Accretion Vortex Spiral Arms (Black & White Rays)
        const spiralCount = 6;
        for (let i = 0; i < spiralCount; i++) {
          const baseAngle = bh.rotation + (i * Math.PI * 2) / spiralCount;
          ctx.beginPath();
          ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : '#94a3b8';
          ctx.lineWidth = 3.5;

          for (let step = 0; step <= 30; step++) {
            const t = step / 30;
            const r = bh.radius * t;
            const angle = baseAngle + t * Math.PI * 3;
            const sx = Math.cos(angle) * r;
            const sy = Math.sin(angle) * r;

            if (step === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }

        // 3. Event Horizon Void (Pure Black Singularity with Stark White Edge Glow)
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(4, bh.radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 4. Implosion Energy Ring Flash at end
        if (progress >= 0.8) {
          const flashRatio = (progress - 0.8) / 0.2;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6 * (1 - flashRatio);
          ctx.globalAlpha = 1 - flashRatio;
          ctx.beginPath();
          ctx.arc(0, 0, bh.maxRadius * (0.4 + flashRatio * 0.9), 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // DRAWING PLAYER DEFENSE HERO SHIP (BEETLE STARSHIP)
      if (p.invulnerableTime % 4 === 0) {
        ctx.save();
        ctx.translate(Math.round(p.x + p.width / 2), Math.round(p.y + p.height / 2));

        const heroW = p.width;
        const heroH = p.height;

        // 3 Slim & Sleek Metallic Thruster Nozzle Pipes at the back
        const pipeOffsets = [-heroW * 0.22, 0, heroW * 0.22];
        pipeOffsets.forEach((offX) => {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(offX - 3.5, heroH * 0.38, 7, heroH * 0.12, 3);
          ctx.fill();
          ctx.stroke();
        });

        // Dynamic 3 Slim Plasma Thruster Flames with vibrant rainbow colors
        if (stateRef.current === 'PLAYING') {
          pipeOffsets.forEach((offX, idx) => {
            const flameColors = ['#ec4899', '#fef08a', '#38bdf8'];
            const flameColor = flameColors[idx % flameColors.length];
            ctx.fillStyle = flameColor;
            ctx.beginPath();
            ctx.ellipse(offX, heroH * 0.52, 3.5, heroH * 0.18 + Math.random() * 4, 0, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Render the selected Beetle skin. All skins keep the same hitbox and weapon system.
        const selectedBeetleSkin = spritesRef.current.beetleSkins[p.shipType] || spritesRef.current.beetle;
        if (selectedBeetleSkin) {
          ctx.drawImage(selectedBeetleSkin, Math.round(-heroW / 2), Math.round(-heroH / 2), heroW, heroH);
        } else {
          // Fallback vector drawing if sprite is loading
          const shipColor = SHIPS_CONFIG[p.shipType]?.color || '#22c55e';
          ctx.fillStyle = shipColor;
          ctx.beginPath();
          ctx.arc(0, 0, heroW / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Active Shield Sphere
        if (p.shield > 0) {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, heroW * 0.68, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        ctx.restore();
      }

      // DRAW BULLETS & ENEMY BOMBS
      g.bullets.forEach((b) => {
        if (b.isEnemy) {
          // Enemy Bomb Projectile
          ctx.save();
          const radius = Math.max(b.width, b.height) / 2;
          const cx = Math.round(b.x + b.width / 2);
          const cy = Math.round(b.y + b.height / 2);

          // Spherical bomb body with radial shading
          const grad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
          grad.addColorStop(0, '#64748b');
          grad.addColorStop(0.4, '#1e293b');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Curved fuse wire on top
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - radius);
          ctx.quadraticCurveTo(cx + 4, cy - radius - 5, cx + 2, cy - radius - 8);
          ctx.stroke();

          // Animated flickering spark on fuse tip
          const sparkTime = Date.now() * 0.02;
          const sparkRadius = 3.5 + Math.sin(sparkTime) * 1.5;
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(cx + 2, cy - radius - 8, sparkRadius, 0, Math.PI * 2);
          ctx.fill();

          // Red glowing core warning mark on bomb
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else {
          // High-Performance High-Tech Plasma Lasers
          ctx.save();
          const bx = Math.round(b.x);
          const by = Math.round(b.y);
          const bw = b.width;
          const bh = b.height;
          const centerX = Math.round(bx + bw / 2);

          // 1. Outer Capsule Body
          const laserGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
          laserGrad.addColorStop(0, '#ffffff'); // White-hot energy tip
          laserGrad.addColorStop(0.25, b.color); // Core neon laser color
          laserGrad.addColorStop(0.85, b.color);
          laserGrad.addColorStop(1, 'rgba(255,255,255,0.1)'); // Fading energy tail

          ctx.fillStyle = laserGrad;
          ctx.beginPath();
          ctx.roundRect(bx - 1, by, bw + 2, bh + 3, [4, 4, 2, 2]);
          ctx.fill();

          // 2. Inner White-Hot Energy Beam Core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(centerX - 1, by + 2, 2, Math.max(2, bh - 5), 1);
          ctx.fill();

          // 3. Laser Tip Lens Flare & Energy Spark
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(centerX, by, bw * 0.6, 0, Math.PI * 2);
          ctx.fill();

          // Crosshair Starburst flare on head of laser
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX - bw * 0.8, by);
          ctx.lineTo(centerX + bw * 0.8, by);
          ctx.moveTo(centerX, by - bw * 0.7);
          ctx.lineTo(centerX, by + bw * 0.7);
          ctx.stroke();

          ctx.restore();
        }
      });

      // DRAW ENEMIES USING UPLOADED CHARACTER IMAGES (Leaf Creature, Orange Fox, Warrior Frog)
      g.enemies.forEach((enemy) => {
        ctx.save();
        const enemyCenterX = Math.round(enemy.x + enemy.width / 2);
        const enemyCenterY = Math.round(enemy.y + enemy.height / 2);
        ctx.translate(enemyCenterX, enemyCenterY);

        // Select transparent character sprite for normal enemies. Bosses use unique silhouettes + themed sprite art.
        let spriteCanvas: HTMLCanvasElement | null = null;
        const bossVariant = enemy.bossVariant;

        if (enemy.type !== 'BOSS') {
          if (enemy.type === 'UFO' || enemy.type === 'SCOUT') spriteCanvas = spritesRef.current.leaf;
          else if (enemy.type === 'ROCKET' || enemy.type === 'FIGHTER') spriteCanvas = spritesRef.current.fox;
          else spriteCanvas = spritesRef.current.frog;
        }

        if (enemy.type === 'BOSS') {
          const profile = BOSS_PROFILES[bossVariant || 'VOID_JUGGERNAUT'];
          const phase = enemy.bossPhase || 1;
          const t = Date.now() * 0.002;
          const pulse = Math.sin(t) * 6;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.fillStyle = profile.secondary;
          ctx.strokeStyle = profile.color;
          ctx.lineWidth = 5;

          // Original vector boss silhouettes: no external/copyrighted boss art.
          const drawSpikeRing = (count: number, inner: number, outer: number, twist = 0) => {
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
              const a0 = twist + (i / count) * Math.PI * 2;
              const a1 = twist + ((i + 0.42) / count) * Math.PI * 2;
              const a2 = twist + ((i + 0.82) / count) * Math.PI * 2;
              const pts = [[Math.cos(a0)*inner, Math.sin(a0)*inner], [Math.cos(a1)*outer, Math.sin(a1)*outer], [Math.cos(a2)*inner, Math.sin(a2)*inner]];
              if (i === 0) ctx.moveTo(pts[0][0], pts[0][1]); else ctx.lineTo(pts[0][0], pts[0][1]);
              ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
          };

          if (bossVariant === 'VOID_JUGGERNAUT') {
            drawSpikeRing(8, enemy.width*0.20, enemy.width*0.48, t*0.15);
            ctx.beginPath(); ctx.ellipse(0, 0, enemy.width*0.28, enemy.height*0.36, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
          } else if (bossVariant === 'IRON_MAELSTROM') {
            drawSpikeRing(10, enemy.width*0.22, enemy.width*0.50, t*0.22);
            ctx.beginPath(); ctx.arc(0, 0, enemy.width*0.25, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            for (let i=-1;i<=1;i++) { ctx.beginPath(); ctx.moveTo(i*35,-enemy.height*.30); ctx.lineTo(i*48,enemy.height*.28); ctx.stroke(); }
          } else if (bossVariant === 'CELESTIAL_WARDEN') {
            drawSpikeRing(6, enemy.width*0.18, enemy.width*0.46, Math.PI/6);
            ctx.beginPath(); ctx.ellipse(0, 0, enemy.width*0.26, enemy.height*0.38, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,0,enemy.width*.42,0,Math.PI*2); ctx.stroke();
          } else if (bossVariant === 'SHADOW_REVENANT') {
            drawSpikeRing(9, enemy.width*0.18, enemy.width*0.48, -t*0.12);
            ctx.beginPath(); ctx.ellipse(0,0,enemy.width*.25,enemy.height*.38,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,0,enemy.width*.34,0,Math.PI*2); ctx.stroke();
          } else if (bossVariant === 'NOVA_DEVOURER') {
            drawSpikeRing(12, enemy.width*0.16, enemy.width*0.50, t*0.28);
            ctx.beginPath(); ctx.arc(0,0,enemy.width*.23,0,Math.PI*2); ctx.fill(); ctx.stroke();
          } else if (bossVariant === 'CRYSTAL_TITAN') {
            drawSpikeRing(6, enemy.width*0.22, enemy.width*0.50, Math.PI/6);
            ctx.beginPath(); ctx.moveTo(0,-enemy.height*.38); ctx.lineTo(enemy.width*.24,-enemy.height*.02); ctx.lineTo(0,enemy.height*.36); ctx.lineTo(-enemy.width*.24,-enemy.height*.02); ctx.closePath(); ctx.fill(); ctx.stroke();
          } else {
            drawSpikeRing(14, enemy.width*0.18, enemy.width*0.54, -t*0.18);
            for (let i=0;i<6;i++) {
              const a = (i/6)*Math.PI*2 - Math.PI/2;
              ctx.beginPath(); ctx.moveTo(Math.cos(a)*enemy.width*.18, Math.sin(a)*enemy.height*.18); ctx.quadraticCurveTo(Math.cos(a)*enemy.width*.55, Math.sin(a)*enemy.height*.55, Math.cos(a+.45)*enemy.width*.32, Math.sin(a+.45)*enemy.height*.32); ctx.stroke();
            }
            ctx.beginPath(); ctx.arc(0,0,enemy.width*.25,0,Math.PI*2); ctx.fill(); ctx.stroke();
          }

          // Energy core and phase aura.
          const coreRadius = enemy.width * (0.10 + phase * 0.008);
          const core = ctx.createRadialGradient(0,0,1,0,0,coreRadius*2.5);
          core.addColorStop(0, '#ffffff'); core.addColorStop(0.28, profile.color); core.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0,0,coreRadius*2.5,0,Math.PI*2); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0,0,coreRadius*.55,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle = `${profile.color}99`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0,enemy.width*.42+pulse,0,Math.PI*2); ctx.stroke();

          ctx.fillStyle = profile.color;
          ctx.font = '900 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.shadowColor = profile.color; ctx.shadowBlur = graphicsQualityRef.current === 'HIGH' ? 10 : 0;
          ctx.fillText(profile.name, 0, enemy.height*0.55);
          ctx.shadowBlur = 0;
        } else if (spriteCanvas) {
          // Ultra crisp high-definition sprite rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            spriteCanvas,
            Math.round(-enemy.width / 2),
            Math.round(-enemy.height / 2),
            Math.round(enemy.width),
            Math.round(enemy.height)
          );

          // Additional Giant Monster eye glows & bio-gem overlay
          if (enemy.type === 'BOSS') {
            const eyeOffset = enemy.width * 0.14;
            const eyeY = -enemy.height * 0.12;

            // Glowing red Monster eyes
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(-eyeOffset, eyeY, 6, 0, Math.PI * 2);
            ctx.arc(eyeOffset, eyeY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(-eyeOffset, eyeY, 3, 0, Math.PI * 2);
            ctx.arc(eyeOffset, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Fallback vector drawing if image is loading
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Draw Mini HP bar above enemy if damaged
        if (enemy.hp < enemy.maxHp) {
          const hpW = enemy.width;
          const hpH = 4;
          const pct = Math.max(0, enemy.hp / enemy.maxHp);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-hpW / 2, -enemy.height / 2 - 8, hpW, hpH);
          ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#facc15' : '#ef4444';
          ctx.fillRect(-hpW / 2, -enemy.height / 2 - 8, hpW * pct, hpH);
        }

        ctx.restore();
      });

      // DRAW POWERUPS & 3D ROTATING SCI-FI CRYSTAL COINS
      g.powerUps.forEach((pu) => {
        if (pu.type === 'COIN') {
          ctx.save();
          const cx = Math.round(pu.x + pu.width / 2);
          const cy = Math.round(pu.y + pu.height / 2);
          const r = pu.width / 2 + 3;

          const spinAngle = pu.spinAngle || 0;
          const scaleX = Math.abs(Math.cos(spinAngle));

          ctx.translate(cx, cy);
          ctx.scale(Math.max(0.18, scaleX), 1.0);

          const isSuper = pu.coinType === 'SUPER_GEM';
          const isDiamond = pu.coinType === 'DIAMOND';

          const mainGlow = isSuper ? '#f43f5e' : isDiamond ? '#38bdf8' : '#facc15';
          ctx.shadowColor = mainGlow;
          ctx.shadowBlur = graphicsQualityRef.current === 'HIGH' ? (pu.magnetized ? 22 : 12) : 0;

          // Animated outer energy aura pulse ring
          const auraPulse = Math.sin(Date.now() * 0.01 + cx) * 2.2;
          ctx.strokeStyle = mainGlow;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, r + 2.5 + auraPulse, 0, Math.PI * 2);
          ctx.stroke();

          // 3D Faceted Octagonal Sci-Fi Gem Shape
          const sides = 8;
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i * Math.PI * 2) / sides;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          // Bevel Outer Ring Gradient
          const outerGrad = ctx.createLinearGradient(-r, -r, r, r);
          if (isSuper) {
            outerGrad.addColorStop(0, '#fecdd3');
            outerGrad.addColorStop(0.5, '#e11d48');
            outerGrad.addColorStop(1, '#881337');
          } else if (isDiamond) {
            outerGrad.addColorStop(0, '#e0f2fe');
            outerGrad.addColorStop(0.5, '#0284c7');
            outerGrad.addColorStop(1, '#0c4a6e');
          } else {
            outerGrad.addColorStop(0, '#fef08a');
            outerGrad.addColorStop(0.5, '#f59e0b');
            outerGrad.addColorStop(1, '#78350f');
          }
          ctx.fillStyle = outerGrad;
          ctx.fill();

          // Premium coin core: dark inset + blue energy crystal emblem.
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
          ctx.fillStyle = isSuper ? '#9f1239' : isDiamond ? '#075985' : '#9A5A08';
          ctx.fill();
          ctx.strokeStyle = isSuper ? '#fecdd3' : isDiamond ? '#bae6fd' : '#FFE082';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          if (!isSuper && !isDiamond) {
            // Four blue energy ports around the premium gold ring.
            ctx.fillStyle = '#38BDF8';
            for (let i = 0; i < 4; i++) {
              const a = (i * Math.PI) / 2;
              ctx.save();
              ctx.rotate(a);
              ctx.beginPath();
              ctx.roundRect(-r * 0.11, -r * 0.91, r * 0.22, r * 0.16, r * 0.06);
              ctx.fill();
              ctx.restore();
            }

            // Central blue crystal / star-wing emblem.
            ctx.save();
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = graphicsQualityRef.current === 'HIGH' ? 8 : 0;
            ctx.fillStyle = '#38BDF8';
            ctx.strokeStyle = '#E0F2FE';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.46);
            ctx.lineTo(r * 0.12, -r * 0.10);
            ctx.lineTo(r * 0.39, 0);
            ctx.lineTo(r * 0.12, r * 0.10);
            ctx.lineTo(0, r * 0.46);
            ctx.lineTo(-r * 0.12, r * 0.10);
            ctx.lineTo(-r * 0.39, 0);
            ctx.lineTo(-r * 0.12, -r * 0.10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(r * 0.62)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pu.symbol || (isSuper ? '✦' : '◆'), 0, 1);
          }

          // Specular Glare Swipe
          const glareGrad = ctx.createLinearGradient(-r, -r, r, r);
          glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          glareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
          glareGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
          ctx.fillStyle = glareGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (pu.type === 'BOMB' && spritesRef.current.panda) {
          ctx.save();
          ctx.translate(Math.round(pu.x + pu.width / 2), Math.round(pu.y + pu.height / 2));
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            spritesRef.current.panda,
            Math.round(-pu.width * 2.4),
            Math.round(-pu.height * 2.4),
            Math.round(pu.width * 4.8),
            Math.round(pu.height * 4.8)
          );
          ctx.restore();
        } else if (pu.type === 'LASER') {
          ctx.save();
          const cx = Math.round(pu.x + pu.width / 2);
          const cy = Math.round(pu.y + pu.height / 2);
          const radius = pu.width / 2 + 2;

          // Animated electric aura ring
          const ringPulse = Math.sin(Date.now() * 0.012) * 3;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, radius + ringPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Laser radial gradient
          const grad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, radius);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.45, '#ec4899');
          grad.addColorStop(1, '#a855f7');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', cx, cy);
          ctx.restore();
        } else {
          ctx.save();
          const cx = Math.round(pu.x + pu.width / 2);
          const cy = Math.round(pu.y + pu.height / 2);
          const r = pu.width / 2;

          ctx.fillStyle = pu.color;
          ctx.shadowColor = pu.color;
          ctx.shadowBlur = graphicsQualityRef.current === 'LOW' ? 0 : 10;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pu.symbol, cx, cy);
          ctx.restore();
        }
      });

      // DRAW PARTICLES & FLOATING TEXT
      g.particles.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, pt.alpha));
        const currentRadius = pt.radius + (pt.life / pt.maxLife) * 4;
        ctx.beginPath();
        ctx.arc(Math.round(pt.x), Math.round(pt.y), currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      g.floatingTexts.forEach((ft) => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      });

      // Accessibility: suppress screen shake when reduced-effects mode is enabled.
      if (readLocalSetting('galaxy_reduce_effects') === 'true') g.screenShake = 0;
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.clearInterval(settingsTimer);
      window.removeEventListener('resize', resizeCanvasWithGameState);
    window.removeEventListener('orientationchange', resizeCanvasWithGameState);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentLevel, onGameOver, onLevelVictory]);

  const g = gameRef.current;
  const p = g.player;
  const killsPct = currentLevel === 101 ? 0 : Math.min(100, Math.floor((levelKills / targetKills) * 100));

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Ambient Cosmic Image Glow behind canvas for desktop / wide screens */}
      <div className="low-perf-heavy-bg absolute inset-0 w-full h-full pointer-events-none opacity-20 filter blur-xl scale-105">
        <img src={homeImg} alt="Space Background Glow" className="w-full h-full object-cover" />
      </div>

      {/* Game Canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block touch-none" />

      {gameState === 'PLAYING' && p.invulnerableTime > 0 && p.health > 0 && (
        <div className="absolute inset-0 z-40 pointer-events-none bg-rose-400/10 border-[6px] border-rose-400/40 shadow-[inset_0_0_80px_rgba(244,63,94,0.45)] animate-pulse" aria-hidden="true" />
      )}

      {bossIntro && gameState === 'PLAYING' && (
        <div className="absolute inset-x-0 top-1/3 z-40 pointer-events-none flex justify-center animate-in zoom-in-95 duration-300">
          <div className="px-8 py-5 rounded-3xl border-2 border-rose-400/70 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_60px_rgba(244,63,94,0.45)] text-center">
            <div className="text-[11px] font-black tracking-[0.35em] text-rose-300 animate-pulse">WARNING • HOSTILE COMMANDER</div>
            <div className="mt-1 text-3xl sm:text-5xl font-black text-white tracking-tight">{bossIntro.symbol} {bossIntro.name}</div>
            <div className="mt-2 text-[10px] text-amber-300 font-bold tracking-widest">BOSS BATTLE INITIATED</div>
          </div>
        </div>
      )}

      {/* TOP GIANT MONSTER BOSS HP BAR OVERLAY */}
      {gameState === 'PLAYING' && bossActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-30 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-slate-900/90 border border-rose-500/60 rounded-xl p-2.5 shadow-[0_0_24px_rgba(244,63,94,0.5)] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-black text-rose-400 mb-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                ⚠️ {BOSS_PROFILES[getBossVariant(currentLevel)].name}
              </span>
              <span className="font-mono text-amber-300 font-extrabold">{bossHpPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 border border-rose-500/30 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full transition-all duration-200"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      {gameState === 'PLAYING' && (
        <div className={`absolute top-3 left-3 right-3 flex items-start justify-between z-10 pointer-events-none ${readLocalSetting('galaxy_large_hud') === 'true' ? 'scale-[1.04] origin-top' : ''}`}>
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center gap-1 pointer-events-none">
            <div className="px-2 py-1 rounded-full bg-slate-950/75 border border-cyan-400/30 text-[10px] font-black text-cyan-200">
              {currentLevel === 101 ? `∞ ENDLESS • ${g.runKills} KILLS` : `MISSION ${Math.min(g.missionProgress, g.missionTarget)}/${g.missionTarget}`}
            </div>
            <div className="w-28 h-1.5 rounded-full bg-slate-900/80 overflow-hidden border border-cyan-400/20"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{width:`${g.ultimateCharge}%`}} /></div>
            <span className="text-[9px] text-cyan-300 font-bold">ULTIMATE {Math.floor(g.ultimateCharge)}% • [E]</span>
          </div>

          {/* Defense Ship Life Hearts & Shield */}
          <div className="flex flex-col gap-1.5 min-w-[135px] sm:min-w-[170px] bg-slate-900/85 p-2.5 rounded-2xl border border-rose-500/40 backdrop-blur-md pointer-events-auto shadow-xl shadow-rose-950/20">
            <div className="flex items-center justify-between text-xs font-black text-rose-400">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                LIFE
              </span>
            </div>

            {/* 5 RED HEARTS ROW */}
            <div className="flex items-center justify-between gap-1 py-0.5">
              {Array.from({ length: 5 }).map((_, idx) => {
                const isHeartActive = (p.health / p.maxHealth) >= (idx / 5) + 0.08;
                return (
                  <Heart
                    key={idx}
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                      isHeartActive
                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.95)] scale-100 animate-bounce'
                        : 'fill-slate-800 text-slate-700 opacity-30 scale-90'
                    }`}
                    style={{ animationDelay: `${idx * 150}ms`, animationDuration: '2.5s' }}
                  />
                );
              })}
            </div>

            {/* Shield Status */}
            {p.maxShield > 0 && (
              <>
                <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    SHIELD
                  </span>
                  <span>{Math.max(0, Math.round(p.shield))}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-200"
                    style={{ width: `${Math.max(0, (p.shield / p.maxShield) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* LEVEL PROGRESS BADGE */}
          <div className="flex flex-col items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-indigo-500/40 backdrop-blur-md pointer-events-auto shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 font-mono">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentLevel === 101 ? 'ENDLESS MODE' : `LEVEL ${currentLevel} / 100`}</span>
            </div>
            {bossActive ? (
              <span className="text-[10px] text-rose-400 font-bold uppercase animate-pulse">
                ⚠️ {BOSS_PROFILES[getBossVariant(currentLevel)].name} ({bossHpPercent}%)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all duration-200" style={{ width: `${killsPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-300 font-mono font-bold">
                  {currentLevel === 101 ? `${g.runKills} KILLS` : `${levelKills}/${targetKills}`}
                </span>
              </div>
            )}
          </div>

          {/* Score & Buttons */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-sm text-right pointer-events-auto">
              <div className="text-[10px] text-slate-400 font-sans">SCORE</div>
              <div className="text-amber-400 font-bold text-sm sm:text-base">{score}</div>
            </div>
            <div className="hidden sm:block bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/20 backdrop-blur-sm text-right">
              <div className="text-[9px] text-slate-500 font-sans">CMD LV</div>
              <div className="text-cyan-300 font-black text-xs">{loadPlayerStats().playerLevel} • 💎 {loadPlayerStats().premiumGems}</div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setGameState('PAUSED');
              }}
              className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white pointer-events-auto active:scale-95 transition-transform"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      {gameState === 'PLAYING' && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs text-amber-300 font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>+${coinsEarned} COINS</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={triggerShipAbility}
              disabled={(gameRef.current.player.abilityCooldownUntil || 0) > Date.now()}
              title="Ship Ability"
              className="w-12 h-12 rounded-full border border-violet-300/50 bg-violet-950/80 text-violet-100 text-[9px] font-black shadow-[0_0_18px_rgba(139,92,246,0.35)] disabled:opacity-35 active:scale-90"
            >Q</button>
            <button
              onClick={triggerUltimate}
              disabled={gameRef.current.ultimateCharge < 100}
              title="Ultimate Nova"
              className="w-14 h-14 rounded-full border border-cyan-300/50 bg-cyan-950/80 text-cyan-100 text-[10px] font-black shadow-[0_0_18px_rgba(34,211,238,0.35)] disabled:opacity-35 active:scale-90"
            >✦ ULT</button>
            {/* LARGE 3X TRANSPARENT PANDA BOMB TRIGGER - NO BOX, NO TEXT */}
            <button
              onClick={triggerBomb}
              disabled={bombsCount <= 0}
              title="Bomb Attack"
              className={`relative group p-0 bg-transparent border-none outline-none transition-transform duration-150 active:scale-90 ${
                bombsCount > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-40 cursor-not-allowed grayscale'
              }`}
            >
              {pandaDataUrl ? (
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                  <img
                    src={pandaDataUrl}
                    alt="Bomb Panda"
                    className="w-full h-full object-contain filter drop-shadow-[0_6px_28px_rgba(34,197,94,0.85)] group-hover:drop-shadow-[0_10px_36px_rgba(34,197,94,1)] transition-all"
                  />
                  {/* Floating Count Badge */}
                  <div className="absolute top-2 right-2 bg-rose-600 border-2 border-slate-950 text-white text-base font-black w-9 h-9 rounded-full flex items-center justify-center shadow-2xl">
                    {bombsCount}
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {bombsCount}
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-5">
          <h2 className="text-2xl font-bold text-white">GAME PAUSED</h2>
          <div className="flex flex-col gap-3 w-48">
            <button
              onClick={() => {
                soundFx.playClick();
                setGameState('PLAYING');
              }}
              className="py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md active:scale-95"
            >
              RESUME GAME
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenLevelSelect();
              }}
              className="py-2.5 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-200 font-semibold text-xs active:scale-95"
            >
              SELECT LEVEL
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                if (onReturnToMenu) {
                  onReturnToMenu();
                } else {
                  setGameState('MENU');
                }
              }}
              className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 active:scale-95"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
