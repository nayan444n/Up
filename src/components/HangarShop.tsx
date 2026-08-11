import PremiumCoinIcon from './PremiumCoinIcon';
import React from 'react';
import { PlayerStats, ShipType } from '../types/game';
import { SHIPS_CONFIG, savePlayerStats, upgradeShipPart } from '../utils/storage';
import { soundFx } from '../utils/sound';
import alphaShipImg from '../assets/images/neon_green_beetle_ship_1785863166332.jpg';
import crimsonShipImg from '../assets/images/beetle_skin_crimson.png';
import azureShipImg from '../assets/images/beetle_skin_azure.png';
import goldenShipImg from '../assets/images/beetle_skin_golden.png';
import purpleShipImg from '../assets/images/beetle_skin_purple.png';
import emeraldShipImg from '../assets/images/beetle_skin_emerald.png';
import iceShipImg from '../assets/images/beetle_skin_ice.png';
import shadowShipImg from '../assets/images/beetle_skin_shadow.png';
import neonShipImg from '../assets/images/beetle_skin_neon.png';
import solarShipImg from '../assets/images/beetle_skin_solar.png';
import voidShipImg from '../assets/images/beetle_skin_void.png';
import prismShipImg from '../assets/images/beetle_skin_prism.png';
import { Shield, Zap, Gauge, Heart, Check, Lock, ArrowLeft, Sparkles, Crosshair, Package, Gem, TrendingUp } from 'lucide-react';
import { spendPremiumGems } from '../utils/progression';

const BEETLE_SKIN_IMAGES: Record<ShipType, string> = {
  ALPHA: alphaShipImg,
  CRIMSON: crimsonShipImg,
  AZURE: azureShipImg,
  GOLDEN: goldenShipImg,
  PURPLE: purpleShipImg,
  EMERALD: emeraldShipImg,
  ICE: iceShipImg,
  SHADOW_GREEN: shadowShipImg,
  NEON: neonShipImg,
  SOLAR: solarShipImg,
  VOID: voidShipImg,
  PRISM: prismShipImg,
};

interface HangarShopProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const HangarShop: React.FC<HangarShopProps> = ({ stats, onUpdateStats, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'FLEET' | 'UPGRADES' | 'MODULES'>('FLEET');
  const [pendingPurchase, setPendingPurchase] = React.useState<ShipType | null>(null);

  const getRarity = (price: number) => price >= 2300 ? 'LEGENDARY' : price >= 1400 ? 'EPIC' : price >= 800 ? 'RARE' : price > 0 ? 'UNCOMMON' : 'STARTER';

  const handleSelectShip = (shipId: ShipType) => {
    soundFx.playClick();
    const config = SHIPS_CONFIG[shipId];
    if (stats.unlockedShips.includes(shipId)) {
      const updated = { ...stats, selectedShip: shipId };
      onUpdateStats(updated);
      savePlayerStats(updated);
    } else if (stats.coins >= config.price) {
      setPendingPurchase(shipId);
    }
  };

  const confirmPurchase = () => {
    if (!pendingPurchase) return;
    const config = SHIPS_CONFIG[pendingPurchase];
    if (stats.coins < config.price) { setPendingPurchase(null); return; }
    soundFx.playPowerUp();
    const updated: PlayerStats = {
      ...stats,
      coins: stats.coins - config.price,
      unlockedShips: [...stats.unlockedShips, pendingPurchase],
      selectedShip: pendingPurchase
    };
    onUpdateStats(updated);
    savePlayerStats(updated);
    setPendingPurchase(null);
  };

  const handleUpgrade = (type: 'HEALTH' | 'POWER' | 'SPEED') => {
    const currentLevel = type === 'HEALTH' ? stats.maxHealthUpgrade : type === 'POWER' ? stats.firePowerUpgrade : stats.speedUpgrade;
    const cost = 150 * (currentLevel + 1);
    if (currentLevel >= 5 || stats.coins < cost) return;

    soundFx.playPowerUp();
    let updated = { ...stats, coins: stats.coins - cost };

    if (type === 'HEALTH' && stats.maxHealthUpgrade < 5) {
      updated.maxHealthUpgrade += 1;
    } else if (type === 'POWER' && stats.firePowerUpgrade < 5) {
      updated.firePowerUpgrade += 1;
    } else if (type === 'SPEED' && stats.speedUpgrade < 5) {
      updated.speedUpgrade += 1;
    }

    onUpdateStats(updated);
    savePlayerStats(updated);
  };

  const buyEmergencySupply = () => {
    if (stats.premiumGems < 5) return;
    const afterSpend = spendPremiumGems(stats, 5);
    const updated = { ...afterSpend, coins: afterSpend.coins + 250 };
    savePlayerStats(updated);
    onUpdateStats(updated);
    soundFx.playPowerUp();
  };

  const recommended = stats.maxHealthUpgrade <= stats.firePowerUpgrade && stats.maxHealthUpgrade <= stats.speedUpgrade ? 'HEALTH' : stats.firePowerUpgrade <= stats.speedUpgrade ? 'POWER' : 'SPEED';

  return (
    <div className="min-h-screen animate-screen-enter bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO GAME</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 font-bold text-sm">
            <PremiumCoinIcon size={16} />
            <span>{stats.coins} COINS</span><span className="ml-2 text-cyan-300 flex items-center gap-1"><Gem className="w-3.5 h-3.5" /> {stats.premiumGems}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            COMMAND HANGAR
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Build your fleet, tune your systems, and install permanent modules. Every purchase matters.
          </p>
        </div>

        {/* Premium Hangar Navigation */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5 sticky top-0 z-20 backdrop-blur-md">
          {[
            ['FLEET', 'FLEET', Shield],
            ['UPGRADES', 'UPGRADES', Crosshair],
            ['MODULES', 'MODULES', Package],
          ].map(([key, label, Icon]) => (
            <button key={key as string} onClick={() => { soundFx.playClick(); setActiveTab(key as 'FLEET' | 'UPGRADES' | 'MODULES'); }} className={`py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeTab === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
              <Icon className="w-3.5 h-3.5" /> {label as string}
            </button>
          ))}
        </div>

        {/* Premium Hangar Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3"><div className="text-[9px] text-slate-500 uppercase font-black">Fleet</div><div className="text-lg font-black text-white">{stats.unlockedShips.length}/{Object.keys(SHIPS_CONFIG).length}</div></div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3"><div className="text-[9px] text-slate-500 uppercase font-black">System Lv</div><div className="text-lg font-black text-white">{stats.maxHealthUpgrade + stats.firePowerUpgrade + stats.speedUpgrade}/15</div></div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><div className="text-[9px] text-slate-500 uppercase font-black">Modules</div><div className="text-lg font-black text-white">{Object.values(stats.shipParts || {}).reduce<number>((a, b) => a + Number(b), 0)}/20</div></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between"><div><div className="text-[9px] text-slate-500 uppercase font-black">Recommended Upgrade</div><div className="text-xs font-black text-emerald-300">{recommended === 'HEALTH' ? 'HULL REINFORCEMENT' : recommended === 'POWER' ? 'PLASMA CANNON' : 'THRUSTER BOOST'}</div></div><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-center justify-between gap-3"><div><div className="text-[9px] text-slate-500 uppercase font-black">PREMIUM SUPPLY</div><div className="text-[10px] text-slate-400">5 gems → 250 coins</div></div><button disabled={stats.premiumGems < 5} onClick={buyEmergencySupply} className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-[10px] font-black disabled:opacity-30">EXCHANGE</button></div>
        </div>

        {activeTab === 'FLEET' && (<>
        {/* Ship Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(SHIPS_CONFIG) as ShipType[]).map((shipKey) => {
            const ship = SHIPS_CONFIG[shipKey];
            const isUnlocked = stats.unlockedShips.includes(shipKey);
            const isSelected = stats.selectedShip === shipKey;

            return (
              <div
                key={shipKey}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center border border-white/10 shadow-sm overflow-hidden bg-slate-950"
                        style={{ borderColor: ship.color }}
                      >
                        <img src={BEETLE_SKIN_IMAGES[shipKey]} alt={ship.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base">{ship.name}</h3>
                          <span className="text-[8px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full border border-cyan-400/25 bg-cyan-400/5 text-cyan-300">{getRarity(ship.price)}</span>
                          {!isUnlocked && <span className="text-[8px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300">LOCKED</span>}
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ship.weaponType === 'SINGLE' ? 'SINGLE LASER' : ship.weaponType === 'DOUBLE' ? 'DOUBLE LASER' : ship.weaponType === 'SPREAD' ? 'SPREAD SHOT' : ship.weaponType === 'LASER' ? 'MEGA LASER' : 'TRIPLE PLASMA'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,.12),transparent_60%)] p-2">
                    <img src={BEETLE_SKIN_IMAGES[shipKey]} alt="" className="w-full h-24 sm:h-28 object-contain drop-shadow-[0_0_18px_rgba(99,102,241,.18)]" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ship.description}</p>

                  {/* Ship Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">HEALTH</span>
                      <span className="font-bold text-rose-400">{ship.health}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SPEED</span>
                      <span className="font-bold text-cyan-400">{ship.speed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">FIRE RATE</span>
                      <span className="font-bold text-amber-400">{ship.fireRate}ms</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleSelectShip(shipKey)}
                      disabled={isSelected}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isSelected ? 'CURRENTLY SELECTED' : 'SELECT SHIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectShip(shipKey)}
                      disabled={stats.coins < ship.price}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                        stats.coins >= ship.price
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNLOCK (${ship.price} COINS)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        </>)}

        {activeTab === 'UPGRADES' && (<>
        {/* Core Ship Tech Upgrades */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            SYSTEM TECH UPGRADES (ESCALATING COST)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Health Upgrade */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                  <Heart className="w-4 h-4" />
                  <span>HULL REINFORCEMENT</span>
                </div>
                <p className="text-[11px] text-slate-400">+25 Max Health per level</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full ${
                        lvl <= stats.maxHealthUpgrade ? 'bg-rose-500' : 'bg-slate-800'
                      }`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => handleUpgrade('HEALTH')}
                  disabled={stats.coins < 150 * (stats.maxHealthUpgrade + 1) || stats.maxHealthUpgrade >= 5}
                  className="w-full py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold text-xs disabled:opacity-50"
                >
                  {stats.maxHealthUpgrade >= 5 ? 'MAX LEVEL' : `UPGRADE (${150 * (stats.maxHealthUpgrade + 1)})`}
                </button>
              </div>
            </div>

            {/* Firepower Upgrade */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                  <Zap className="w-4 h-4" />
                  <span>PLASMA CANNON OVERCLOCK</span>
                </div>
                <p className="text-[11px] text-slate-400">+15% Damage & Fire Speed</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full ${
                        lvl <= stats.firePowerUpgrade ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => handleUpgrade('POWER')}
                  disabled={stats.coins < 150 * (stats.firePowerUpgrade + 1) || stats.firePowerUpgrade >= 5}
                  className="w-full py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 font-bold text-xs disabled:opacity-50"
                >
                  {stats.firePowerUpgrade >= 5 ? 'MAX LEVEL' : `UPGRADE (${150 * (stats.firePowerUpgrade + 1)})`}
                </button>
              </div>
            </div>

            {/* Speed Upgrade */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                  <Gauge className="w-4 h-4" />
                  <span>THRUSTER BOOST</span>
                </div>
                <p className="text-[11px] text-slate-400">+1.0 Additional Speed</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full ${
                        lvl <= stats.speedUpgrade ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => handleUpgrade('SPEED')}
                  disabled={stats.coins < 150 * (stats.speedUpgrade + 1) || stats.speedUpgrade >= 5}
                  className="w-full py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 font-bold text-xs disabled:opacity-50"
                >
                  {stats.speedUpgrade >= 5 ? 'MAX LEVEL' : `UPGRADE (${150 * (stats.speedUpgrade + 1)})`}
                </button>
              </div>
            </div>
          </div>
        </div>

        </>)}

        {activeTab === 'MODULES' && (<>
        {/* MODULAR SHIP PARTS */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-cyan-900/50 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-300" /> MODULAR SHIP PARTS</h3>
          <p className="text-[11px] text-slate-400">Permanent part levels stack with your existing upgrades.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([['engine','ENGINE','+ movement'],['weapon','WEAPON','+ damage'],['shield','SHIELD','+ shield'],['core','CORE','+ ultimate charge']] as const).map(([part,label,desc]) => {
              const level = stats.shipParts?.[part] || 0;
              const cost = 300 * (level + 1);
              return <div key={part} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <div className="text-cyan-300 text-xs font-black">{label}</div>
                <div className="text-[10px] text-slate-500 mb-2">{desc}</div>
                <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(i => <span key={i} className={`h-1.5 flex-1 rounded ${i <= level ? 'bg-cyan-400' : 'bg-slate-800'}`} />)}</div>
                <button disabled={level >= 5 || stats.coins < cost} onClick={() => { const updated = upgradeShipPart(part); onUpdateStats(updated); soundFx.playPowerUp(); }} className="w-full py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 text-[10px] font-bold disabled:opacity-40">{level >= 5 ? 'MAX' : `UPGRADE ${cost}`}</button>
              </div>;
            })}
          </div>
        </div>
        </>)}
      </div>

      {pendingPurchase && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-amber-400/30 bg-slate-900 p-5 shadow-2xl shadow-amber-950/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center"><Package className="w-6 h-6 text-amber-300"/></div>
              <div><div className="text-[9px] font-black tracking-[.2em] text-amber-300 uppercase">Confirm Purchase</div><h3 className="text-lg font-black text-white">{SHIPS_CONFIG[pendingPurchase].name}</h3></div>
            </div>
            <p className="text-sm text-slate-400">Unlock this ship for <span className="font-black text-amber-300">{SHIPS_CONFIG[pendingPurchase].price} coins</span>? It will become your active ship.</p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button onClick={() => setPendingPurchase(null)} className="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95">CANCEL</button>
              <button onClick={confirmPurchase} className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs active:scale-95">UNLOCK NOW</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
