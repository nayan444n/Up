import React, { useCallback, useEffect, useState } from 'react';
import { PlayerStats } from './types/game';
import { loadPlayerStats, addCoinsAndScore, completeLevel, savePlayerStats } from './utils/storage';
import { SpaceCanvas } from './components/SpaceCanvas';
import { HangarShop } from './components/HangarShop';
import { PlayStoreGuide } from './components/PlayStoreGuide';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { IntroSplashScreen } from './components/IntroSplashScreen';
import { MainMenu } from './components/MainMenu';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { soundFx } from './utils/sound';
import { AchievementUnlockToast, AchievementToastData } from './components/AchievementUnlockToast';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { StatisticsModal } from './components/StatisticsModal';
import { ensureDailyState } from './utils/progression';
import { AdvancedSystemsModal } from './components/AdvancedSystemsModal';
import { DebugPanel } from './components/DebugPanel';
import { LevelCompleteFlight } from './components/LevelCompleteFlight';

type ViewMode = 'MENU' | 'GAME' | 'SHOP' | 'GUIDE';
type GameMode = 'CAMPAIGN' | 'ENDLESS';

function getClaimedAchievements(): string[] {
  try {
    const raw = localStorage.getItem('galaxy_claimed_achievements');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [view, setView] = useState<ViewMode>('MENU');
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  // Modals state
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showDailyMissions, setShowDailyMissions] = useState<boolean>(false);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [showAdvancedSystems, setShowAdvancedSystems] = useState<boolean>(false);
  const [achievementToast, setAchievementToast] = useState<AchievementToastData | null>(null);
  const [levelCompleteFlight, setLevelCompleteFlight] = useState(false);
  const [showDebug, setShowDebug] = useState<boolean>(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === '1');

  const [sessionCounter, setSessionCounter] = useState<number>(0);
  const [autoStartGame, setAutoStartGame] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');

  useEffect(() => {
    setStats((prev) => ensureDailyState(prev));
  }, []);

  const handleIntroComplete = useCallback(() => {
    soundFx.playClick();
    setShowIntro(false);
    setView('MENU');
  }, []);

  // Victory modal state
  const [victoryData, setVictoryData] = useState<{
    show: boolean;
    level: number;
    score: number;
    coinsEarned: number;
    stars: number;
  }>({
    show: false,
    level: 1,
    score: 0,
    coinsEarned: 0,
    stars: 3
  });

  // GameOver state
  const [gameOverData, setGameOverData] = useState<{
    show: boolean;
    score: number;
    coinsEarned: number;
  }>({
    show: false,
    score: 0,
    coinsEarned: 0
  });

  useEffect(() => {
    const candidates: AchievementToastData[] = [
      { id: 'lvl1', title: 'ROOKIE PILOT', reward: 100 },
      { id: 'lvl10', title: 'SPACE VETERAN', reward: 500 },
      { id: 'lvl25', title: 'DEEP SPACE PILOT', reward: 800 },
      { id: 'lvl50', title: 'STAR COMMANDER', reward: 1500 },
      { id: 'lvl75', title: 'GALAXY GUARDIAN', reward: 2500 },
      { id: 'lvl100', title: 'GALAXY COMMANDER', reward: 5000 },
      { id: 'stars100', title: 'STAR COLLECTOR', reward: 2000 },
      { id: 'coins500', title: 'COIN HOARDER', reward: 200 },
      { id: 'ships3', title: 'FLEET COLLECTOR', reward: 1000 },
      { id: 'score1000', title: 'HIGH SCORER', reward: 350 },
    ];
    const unlocked = new Set<string>();
    if (stats.maxLevelUnlocked > 1) unlocked.add('lvl1');
    if (stats.maxLevelUnlocked >= 10) unlocked.add('lvl10');
    if (stats.maxLevelUnlocked >= 25) unlocked.add('lvl25');
    if (stats.maxLevelUnlocked >= 50) unlocked.add('lvl50');
    if (stats.maxLevelUnlocked >= 75) unlocked.add('lvl75');
    if (stats.maxLevelUnlocked >= 100) unlocked.add('lvl100');
    if ((stats.totalStars || 0) >= 100) unlocked.add('stars100');
    if (stats.coins >= 500) unlocked.add('coins500');
    if (stats.unlockedShips.length >= 3) unlocked.add('ships3');
    if (stats.highScore >= 1000) unlocked.add('score1000');
    try {
      const claimed = getClaimedAchievements();
      const next = candidates.find(a => unlocked.has(a.id) && !claimed.includes(a.id));
      if (next) setAchievementToast(next);
    } catch {}
  }, [stats]);

  const handleGameOver = (finalScore: number, coinsEarned: number) => {
    const updatedStats = addCoinsAndScore(coinsEarned, finalScore);
    setStats(updatedStats);
    soundFx.playDefeatSting();
    setGameOverData({
      show: true,
      score: finalScore,
      coinsEarned: coinsEarned
    });
  };

  const handleLevelVictory = (level: number, score: number, coinsEarned: number, stars: number) => {
    const updatedStats = completeLevel(level, stars, coinsEarned, score);
    setStats(updatedStats);
    soundFx.playVictoryFanfare();
    setVictoryData({
      show: false,
      level,
      score,
      coinsEarned,
      stars
    });
    setLevelCompleteFlight(true);
  };

  const handleSelectLevel = (levelNum: number, autoStart = true) => {
    setGameMode('CAMPAIGN');
    const updated = { ...stats, currentLevel: levelNum };
    savePlayerStats(updated);
    setStats(updated);
    setShowLevelSelect(false);
    setAutoStartGame(autoStart);
    setSessionCounter((prev) => prev + 1);
    setView('GAME');
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* 1. INTRO SPLASH SCREEN */}
      {showIntro && (
        <IntroSplashScreen onComplete={handleIntroComplete} />
      )}

      {/* 2. MAIN VIEW AREA */}
      {!showIntro && (
        <div className="flex-1 relative overflow-hidden w-full h-full">
          {view === 'MENU' && (
            <MainMenu
              onPlay={() => {
                setGameMode('CAMPAIGN');
                setAutoStartGame(true);
                soundFx.startMusic();
                setSessionCounter((prev) => prev + 1);
                setView('GAME');
              }}
              onOpenSettings={() => setShowSettings(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onOpenShop={() => setView('SHOP')}
              onOpenLevelSelect={() => setShowLevelSelect(true)}
              onOpenDaily={() => setShowDailyMissions(true)}
              playerLevel={stats.playerLevel}
              premiumGems={stats.premiumGems}
              hasAchievementAlert={(() => {
                try {
                  const claimed = getClaimedAchievements();
                  return (stats.maxLevelUnlocked > 1 && !claimed.includes('lvl1')) ||
                    (stats.maxLevelUnlocked >= 10 && !claimed.includes('lvl10')) ||
                    (stats.maxLevelUnlocked >= 25 && !claimed.includes('lvl25')) ||
                    (stats.maxLevelUnlocked >= 50 && !claimed.includes('lvl50')) ||
                    (stats.maxLevelUnlocked >= 75 && !claimed.includes('lvl75')) ||
                    (stats.maxLevelUnlocked >= 100 && !claimed.includes('lvl100')) ||
                    ((stats.totalStars || 0) >= 100 && !claimed.includes('stars100')) ||
                    (stats.coins >= 500 && !claimed.includes('coins500')) ||
                    (stats.unlockedShips.length >= 3 && !claimed.includes('ships3')) ||
                    (stats.highScore >= 1000 && !claimed.includes('score1000'));
                } catch { return false; }
              })()}
            />
          )}

          {view === 'GAME' && (
            <SpaceCanvas
              key={`${stats.currentLevel}_${sessionCounter}`}
              stats={stats}
              currentLevel={gameMode === 'ENDLESS' ? 101 : stats.currentLevel}
              autoStart={autoStartGame}
              onGameOver={handleGameOver}
              onOpenShop={() => setView('SHOP')}
              onOpenGuide={() => setView('GUIDE')}
              onOpenLevelSelect={() => setShowLevelSelect(true)}
              onLevelVictory={handleLevelVictory}
              onReturnToMenu={() => {
                soundFx.stopMusic();
                setView('MENU');
              }}
            />
          )}

          {view === 'SHOP' && (
            <HangarShop
              stats={stats}
              onUpdateStats={(newStats) => setStats(newStats)}
              onClose={() => setView('MENU')}
            />
          )}

          {view === 'GUIDE' && (
            <PlayStoreGuide onClose={() => setView('MENU')} />
          )}
        </div>
      )}

      {showDailyMissions && (
        <DailyMissionsModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setShowDailyMissions(false)}
        />
      )}

      {showStatistics && <StatisticsModal stats={stats} onClose={() => setShowStatistics(false)} />}

      {showAdvancedSystems && <AdvancedSystemsModal stats={stats} onUpdateStats={setStats} onClose={() => setShowAdvancedSystems(false)} />}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onOpenStatistics={() => setShowStatistics(true)}
          onOpenAdvancedSystems={() => setShowAdvancedSystems(true)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ACHIEVEMENTS MODAL */}
      {showAchievements && (
        <AchievementsModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* LEVEL SELECT MODAL */}
      {showLevelSelect && (
        <LevelSelectModal
          maxLevelUnlocked={stats.maxLevelUnlocked}
          levelStars={stats.levelStars}
          currentLevel={stats.currentLevel}
          onSelectLevel={(lvl) => handleSelectLevel(lvl, true)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* VICTORY MODAL */}
      {victoryData.show && (
        <VictoryModal
          level={victoryData.level}
          score={victoryData.score}
          coinsEarned={victoryData.coinsEarned}
          stars={victoryData.stars}
          onNextLevel={() => {
            const nextLvl = Math.min(100, victoryData.level + 1);
            setVictoryData((prev) => ({ ...prev, show: false }));
            handleSelectLevel(nextLvl, true);
          }}
          onReplay={() => {
            setVictoryData((prev) => ({ ...prev, show: false }));
            setAutoStartGame(true);
            setSessionCounter((prev) => prev + 1);
            setView('GAME');
          }}
          onLevelSelect={() => {
            setVictoryData((prev) => ({ ...prev, show: false }));
            setShowLevelSelect(true);
          }}
        />
      )}

      {levelCompleteFlight && (
        <LevelCompleteFlight
          active={levelCompleteFlight}
          level={victoryData.level}
          stars={victoryData.stars}
          onFinished={() => {
            setLevelCompleteFlight(false);
            setVictoryData((prev) => ({ ...prev, show: true }));
          }}
        />
      )}

      {achievementToast && <AchievementUnlockToast achievement={achievementToast} onClose={() => setAchievementToast(null)} />}
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} onStatsChanged={() => setStats(loadPlayerStats())} />}

      {/* GAMEOVER MODAL */}
      {gameOverData.show && (
        <GameOverModal
          score={gameOverData.score}
          coinsEarned={gameOverData.coinsEarned}
          stats={stats}
          onRestart={() => {
            setGameOverData({ show: false, score: 0, coinsEarned: 0 });
            setAutoStartGame(true);
            setSessionCounter((prev) => prev + 1);
            setView('GAME');
          }}
          onOpenShop={() => {
            setGameOverData({ show: false, score: 0, coinsEarned: 0 });
            setView('SHOP');
          }}
          onOpenGuide={() => {
            setGameOverData({ show: false, score: 0, coinsEarned: 0 });
            setView('GUIDE');
          }}
        />
      )}
    </div>
  );
}
