import React from 'react';
import { Lock, Star, Play, X, Sparkles, Crown } from 'lucide-react';
import foxImg from '../assets/images/orange_fox_enemy_1785848127913.jpg';
import beetleImg from '../assets/images/vibrant_robot_beetle_1785862658408.jpg';
import frogImg from '../assets/images/warrior_frog_enemy_1785848214735.jpg';
import greenImg from '../assets/images/leaf_creature_enemy_1785848098690.jpg';
import neonBeetleImg from '../assets/images/neon_green_beetle_ship_1785863166332.jpg';

interface LevelSelectModalProps {
  maxLevelUnlocked: number;
  levelStars: Record<number, number>;
  currentLevel: number;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

const TOTAL_LEVELS = 100;
const CHAPTER_SIZE = 10;

const chapters = [
  { name: 'STARLIGHT FRONTIER', colors: 'from-cyan-400 via-blue-500 to-indigo-500', glow: 'rgba(56,189,248,.45)', character: foxImg, side: 'right' },
  { name: 'CRIMSON BELT', colors: 'from-fuchsia-400 via-pink-500 to-rose-500', glow: 'rgba(236,72,153,.42)', character: beetleImg, side: 'left' },
  { name: 'VERDANT NEBULA', colors: 'from-emerald-300 via-green-500 to-teal-500', glow: 'rgba(34,197,94,.42)', character: frogImg, side: 'right' },
  { name: 'ALIEN GARDENS', colors: 'from-lime-300 via-emerald-500 to-cyan-500', glow: 'rgba(132,204,22,.42)', character: greenImg, side: 'left' },
  { name: 'NEON ORBIT', colors: 'from-violet-400 via-purple-500 to-fuchsia-500', glow: 'rgba(168,85,247,.44)', character: neonBeetleImg, side: 'right' },
  { name: 'SOLAR DRIFT', colors: 'from-amber-300 via-orange-500 to-red-500', glow: 'rgba(249,115,22,.44)', character: foxImg, side: 'left' },
  { name: 'ICE RIFT', colors: 'from-sky-300 via-cyan-500 to-blue-600', glow: 'rgba(14,165,233,.44)', character: frogImg, side: 'right' },
  { name: 'SHADOW RING', colors: 'from-indigo-400 via-violet-600 to-slate-700', glow: 'rgba(99,102,241,.46)', character: beetleImg, side: 'left' },
  { name: 'PRISM CORE', colors: 'from-pink-300 via-purple-500 to-cyan-400', glow: 'rgba(217,70,239,.46)', character: greenImg, side: 'right' },
  { name: 'FINAL GALAXY', colors: 'from-yellow-300 via-orange-500 to-fuchsia-600', glow: 'rgba(245,158,11,.52)', character: foxImg, side: 'left' },
];

const chapterFor = (level: number) => Math.min(9, Math.floor((level - 1) / CHAPTER_SIZE));

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  maxLevelUnlocked,
  levelStars,
  currentLevel,
  onSelectLevel,
  onClose,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`[data-level="${currentLevel}"]`);
    target?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
  }, [currentLevel]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#030712] text-white animate-screen-enter">
      {/* Floating close only — no top/bottom navigation bars */}
      <button
        onClick={onClose}
        aria-label="Close level select"
        className="absolute right-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-slate-300 shadow-xl backdrop-blur-xl transition hover:bg-slate-800 hover:text-white active:scale-95"
      >
        <X className="h-5 w-5" />
      </button>

      <div ref={scrollRef} className="level-map-scroll h-full overflow-y-auto overscroll-contain">
        <div className="relative mx-auto w-full max-w-[760px] px-4 pb-24 pt-8 sm:px-8 sm:pt-10">
          {/* Space atmosphere */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="level-map-nebula level-map-nebula-a" />
            <div className="level-map-nebula level-map-nebula-b" />
            <div className="level-map-stars" />
          </div>

          <div className="relative z-10">
            {Array.from({ length: 10 }, (_, chapterIndex) => {
              const chapter = chapters[chapterIndex];
              const start = chapterIndex * CHAPTER_SIZE + 1;
              const end = start + CHAPTER_SIZE - 1;
              const chapterUnlocked = start <= maxLevelUnlocked;

              return (
                <section key={chapterIndex} className="relative mb-10 sm:mb-14">
                  {/* Character checkpoint */}
                  <div className={`level-map-character ${chapter.side === 'left' ? 'left-0 sm:left-2' : 'right-0 sm:right-2'}`}>
                    <div className="level-map-character-glow" style={{ boxShadow: `0 0 70px ${chapter.glow}` }} />
                    <div className="level-map-character-frame">
                      <img src={chapter.character} alt="" className="level-map-character-img" draggable={false} />
                    </div>
                    <div className={`mt-1 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[8px] font-black tracking-[.18em] text-white/70 backdrop-blur-md ${chapter.side === 'left' ? 'text-left' : 'text-right'}`}>
                      {chapterIndex === 9 ? 'FINAL ZONE' : `ZONE ${chapterIndex + 1}`}
                    </div>
                  </div>

                  <div className="relative z-10 mx-auto mb-5 max-w-[420px] text-center">
                    <div className={`mx-auto mb-2 h-1 w-20 rounded-full bg-gradient-to-r ${chapter.colors} shadow-[0_0_18px_rgba(255,255,255,.18)]`} />
                    <p className="text-[10px] font-black tracking-[.28em] text-white/45">LEVELS {start} — {end}</p>
                    <h2 className="mt-1 text-sm font-black tracking-[.14em] text-white/90 sm:text-base">{chapter.name}</h2>
                  </div>

                  <div className="relative mx-auto w-full max-w-[500px]">
                    {/* Soft path behind nodes */}
                    <div className={`level-map-path level-map-path-${chapterIndex}`} />

                    {Array.from({ length: CHAPTER_SIZE }, (_, i) => {
                      const lvl = start + i;
                      const stars = levelStars[lvl] || 0;
                      const unlocked = lvl <= maxLevelUnlocked;
                      const current = lvl === currentLevel;
                      const boss = lvl % 10 === 0;
                      const finalBoss = lvl === 100;
                      const side = i % 2 === 0 ? 'left' : 'right';
                      const completed = stars > 0;

                      return (
                        <div key={lvl} data-level={lvl} className="relative flex h-[122px] items-center justify-center sm:h-[138px]">
                          <button
                            type="button"
                            disabled={!unlocked}
                            onClick={() => unlocked && onSelectLevel(lvl)}
                            className={`level-map-node ${side === 'left' ? 'level-map-node-left' : 'level-map-node-right'} ${current ? 'level-map-node-current' : ''} ${boss ? 'level-map-node-boss' : ''} ${finalBoss ? 'level-map-node-final' : ''} ${!unlocked ? 'level-map-node-locked' : ''}`}
                            aria-label={`Level ${lvl}${boss ? ' boss' : ''}`}
                          >
                            <div className="level-map-node-ring" />
                            <div className="level-map-node-core">
                              {unlocked ? <span>{lvl}</span> : <Lock className="h-5 w-5 text-white/35" />}
                            </div>
                            <div className="level-map-stars">
                              {[1, 2, 3].map((s) => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/18'}`} />
                              ))}
                            </div>
                            {current && <span className="level-map-current">CURRENT</span>}
                            {boss && <span className="level-map-boss">{finalBoss ? 'FINAL BOSS' : 'BOSS'}</span>}
                            {unlocked && !current && (
                              <span className="level-map-play"><Play className="h-3 w-3 fill-current" /></span>
                            )}
                            {completed && <span className="level-map-complete-dot" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chapter transition */}
                  <div className="relative mx-auto mt-2 flex max-w-[500px] items-center justify-center gap-3">
                    <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-white/10`} />
                    <div className={`flex items-center gap-1 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 backdrop-blur-md ${!chapterUnlocked ? 'opacity-40' : ''}`}>
                      {chapterIndex === 9 ? <Crown className="h-3.5 w-3.5 text-amber-300" /> : <Sparkles className="h-3.5 w-3.5 text-cyan-300" />}
                      <span className="text-[9px] font-black tracking-[.18em] text-white/50">{chapterIndex === 9 ? 'FINAL GALAXY' : 'NEXT ZONE'}</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                  </div>
                </section>
              );
            })}

            <div className="pt-3 text-center text-[9px] font-black tracking-[.24em] text-white/25">
              100 LEVELS • SCROLL TO EXPLORE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
