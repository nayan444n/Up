import React, { useState } from 'react';
import { soundFx } from '../utils/sound';
import { Volume2, VolumeX, Shield, RefreshCw, X, Check, Smartphone, Monitor, Gamepad2, AlertTriangle } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { resetPlayerStats, exportSaveData, importSaveData } from '../utils/storage';
import { getRecommendedQuality } from '../utils/performance';


function getSetting(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function setSetting(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

interface SettingsModalProps {
  stats: PlayerStats;
  onOpenStatistics?: () => void;
  onOpenAdvancedSystems?: () => void;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ stats, onUpdateStats, onClose, onOpenStatistics, onOpenAdvancedSystems }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.isEnabled());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(soundFx.isMusicEnabled());
  const [volume, setVolume] = useState<number>(Math.round(soundFx.getVolume() * 100));
  const [sfxVolume, setSfxVolume] = useState<number>(Math.round(soundFx.getSfxVolume() * 100));
  const [musicVolume, setMusicVolume] = useState<number>(Math.round(soundFx.getMusicVolume() * 100));
  const [controlType, setControlType] = useState<'TOUCH' | 'JOYSTICK' | 'KEYBOARD'>(() => {
    return (getSetting('galaxy_control_type') as 'TOUCH' | 'JOYSTICK' | 'KEYBOARD') || 'TOUCH';
  });
  const [graphicsQuality, setGraphicsQuality] = useState<'HIGH' | 'MED' | 'LOW'>(() => {
    return (getSetting('galaxy_graphics_quality') as 'HIGH' | 'MED' | 'LOW') || getRecommendedQuality();
  });
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [reduceEffects, setReduceEffects] = useState(() => getSetting('galaxy_reduce_effects') === 'true');
  const [largeHud, setLargeHud] = useState(() => getSetting('galaxy_large_hud') === 'true');

  const toggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundEnabled(next);
  };

  const toggleMusic = () => {
    const next = soundFx.toggleMusic();
    setMusicEnabled(next);
  };

  const handleVolume = (value: number) => { setVolume(value); soundFx.setVolume(value / 100); };
  const handleSfxVolume = (value: number) => { setSfxVolume(value); soundFx.setSfxVolume(value / 100); };
  const handleMusicVolume = (value: number) => { setMusicVolume(value); soundFx.setMusicVolume(value / 100); };

  const handleSelectControl = (type: 'TOUCH' | 'JOYSTICK' | 'KEYBOARD') => {
    soundFx.playClick();
    setControlType(type);
    setSetting('galaxy_control_type', type);
  };

  const handleSelectQuality = (qual: 'HIGH' | 'MED' | 'LOW') => {
    soundFx.playClick();
    setGraphicsQuality(qual);
    setSetting('galaxy_graphics_quality', qual);
    document.documentElement.classList.toggle('low-performance', qual === 'LOW');
  };


  const handleExportSave = async () => {
    try {
      const data = exportSaveData();
      await navigator.clipboard.writeText(data);
      soundFx.playPowerUp();
      alert('SAVE DATA COPIED. Keep it somewhere safe for backup/cloud sync.');
    } catch {
      alert('Could not copy save data on this device.');
    }
  };

  const handleImportSave = () => {
    const raw = window.prompt('Paste your Galaxy Defender save backup JSON:');
    if (!raw) return;
    try {
      const restored = importSaveData(raw);
      onUpdateStats(restored);
      soundFx.playPowerUp();
      alert('SAVE RESTORED SUCCESSFULLY.');
    } catch {
      alert('Invalid or corrupted save backup.');
    }
  };

  const handleResetData = () => {
    soundFx.playExplosion(true);
    const freshStats = resetPlayerStats();
    onUpdateStats(freshStats);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 animate-screen-enter bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none pb-[env(safe-area-inset-bottom,16px)] pt-[env(safe-area-inset-top,16px)]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">SETTINGS</h2>
              <p className="text-xs text-slate-400 font-mono">GAME PREFERENCES</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {/* Sound & Audio */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>SOUND EFFECTS</span>
              </div>
              <p className="text-[11px] text-slate-400">Lasers, explosions, and UI audio</p>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Music */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">BACKGROUND MUSIC</div>
              <p className="text-[11px] text-slate-400">Music setting is saved on this device</p>
            </div>
            <button
              onClick={toggleMusic}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${musicEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Master Volume */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">MASTER VOLUME</span>
              <span className="text-xs font-mono text-cyan-400">{volume}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-full accent-cyan-400"
              aria-label="Master volume"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80"><div className="flex justify-between mb-2"><span className="text-sm font-bold text-white">SFX VOLUME</span><span className="text-xs font-mono text-cyan-400">{sfxVolume}%</span></div><input type="range" min="0" max="100" value={sfxVolume} onChange={(e) => handleSfxVolume(Number(e.target.value))} className="w-full accent-cyan-400" /></div>
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80"><div className="flex justify-between mb-2"><span className="text-sm font-bold text-white">MUSIC VOLUME</span><span className="text-xs font-mono text-indigo-400">{musicVolume}%</span></div><input type="range" min="0" max="100" value={musicVolume} onChange={(e) => handleMusicVolume(Number(e.target.value))} className="w-full accent-indigo-400" /></div>
          </div>

          {/* Control Method */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div>
              <div className="text-sm font-bold text-white">CONTROL STYLE</div>
              <p className="text-[11px] text-slate-400">Select how you pilot your starship</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectControl('TOUCH')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 active:scale-95 ${
                  controlType === 'TOUCH'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>DIRECT DRAG</span>
              </button>
              <button
                onClick={() => handleSelectControl('JOYSTICK')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 active:scale-95 ${
                  controlType === 'JOYSTICK'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>JOYSTICK</span>
              </button>
              <button
                onClick={() => handleSelectControl('KEYBOARD')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 active:scale-95 ${
                  controlType === 'KEYBOARD'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>KEYS / ARROWS</span>
              </button>
            </div>
          </div>

          {/* Graphics Quality */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div>
              <div className="text-sm font-bold text-white">GRAPHICS & PARTICLES</div>
              <p className="text-[11px] text-slate-400">HIGH: full effects · MED: balanced · LOW: performance mode</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['HIGH', 'MED', 'LOW'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSelectQuality(q)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                    graphicsQuality === q
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>


          {/* Accessibility */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div><div className="text-sm font-bold text-white">ACCESSIBILITY</div><p className="text-[11px] text-slate-400">Reduce motion and improve HUD readability.</p></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { const v=!reduceEffects; setReduceEffects(v); setSetting('galaxy_reduce_effects', String(v)); }} className={`py-2.5 rounded-xl text-[11px] font-bold border ${reduceEffects ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{reduceEffects ? 'REDUCED EFFECTS ON' : 'REDUCED EFFECTS OFF'}</button>
              <button onClick={() => { const v=!largeHud; setLargeHud(v); setSetting('galaxy_large_hud', String(v)); }} className={`py-2.5 rounded-xl text-[11px] font-bold border ${largeHud ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{largeHud ? 'LARGE HUD ON' : 'LARGE HUD OFF'}</button>
            </div>
          </div>

          {onOpenAdvancedSystems && <button onClick={() => { soundFx.playClick(); onOpenAdvancedSystems(); }} className="w-full py-3 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-700/50 text-violet-200 font-bold text-xs">OPEN ADVANCED SYSTEMS</button>}

          {onOpenStatistics && <button onClick={() => { soundFx.playClick(); onOpenStatistics(); }} className="w-full py-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-200 font-bold text-xs">OPEN PLAYER STATISTICS</button>}

          {/* Save / cloud-ready backup */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <div><div className="text-sm font-bold text-white">SAVE BACKUP</div><p className="text-[11px] text-slate-400">Cloud-ready JSON export/import. Your data stays on your device unless you choose to upload it.</p></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleExportSave} className="py-2.5 rounded-xl bg-cyan-950/70 border border-cyan-700/50 text-cyan-200 text-xs font-bold active:scale-95">COPY BACKUP</button>
              <button onClick={handleImportSave} className="py-2.5 rounded-xl bg-violet-950/70 border border-violet-700/50 text-violet-200 text-xs font-bold active:scale-95">RESTORE BACKUP</button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <div>
              <div className="text-sm font-bold text-white">PRIVACY</div>
              <p className="text-[11px] text-slate-400">Read the current Galaxy Defender privacy policy and data practices.</p>
            </div>
            <button
              onClick={() => { soundFx.playClick(); window.open('/privacy-policy.html', '_blank', 'noopener,noreferrer'); }}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold active:scale-95"
            >
              OPEN PRIVACY POLICY
            </button>
          </div>

          {/* Reset Progress */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RESET ALL GAME PROGRESS</span>
              </button>
            ) : (
              <div className="bg-rose-950/80 border border-rose-800/80 rounded-2xl p-4 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>RESET ALL SAVED DATA?</span>
                </div>
                <p className="text-[11px] text-rose-200/80">
                  This will wipe all coins, ship unlocks, and mission level progress permanently.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleResetData}
                    className="py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl active:scale-95 shadow-md"
                  >
                    CONFIRM RESET
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl active:scale-95"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
