# Galaxy Defender – Major Upgrade Pack

Implemented in this build:
- Frame-rate independent core movement using delta time.
- Mobile/desktop movement smoothing normalized to frame time.
- Responsive resize/orientation handling that scales active gameplay objects and clamps the player safely.
- Fixed duplicated canvas DPR scaling that could make rendering incorrect on high-DPI screens.
- Existing gameplay systems retained: enemy formations, power-ups, boss fights, upgrades, ships, achievements, missions/progression, sound/music settings, smart bomb, score multipliers, shield, rapid fire, speed boost, and level stars.
- Existing touch and mouse controls retained with safer touch handling.

Recommended next production steps: install dependencies and run `npm run lint` and `npm run build` in `game/` before deploying.


## Premium Shooting Background Update
- Replaced the previous shooting-screen background with the new premium space artwork.
- Added aspect-ratio-safe cover cropping so the artwork is not stretched on different phone screens.
- Added a subtle cinematic dark grade to keep gameplay elements readable.


## Deep Bug & Performance Fixes
- Implemented a functional virtual joystick control mode.
- Graphics quality setting now changes particle limits and expensive glow/shadow effects.
- Particle physics and floating-text lifetime now use frame delta.
- Screen-shake decay is frame-rate independent.
- Added a lightweight synthesized ambient background music loop with working ON/OFF and volume controls.
- Music starts from user interaction and stops when returning to the main menu.
- Added periodic settings synchronization so control/graphics changes take effect while the game is open.
- Fixed a TypeScript save-data typing issue in `storage.ts`.

## New Feature Pack (excluding companion drone)
- Endless Mode (unlimited escalating waves with asteroid-storm hazards).
- Weapon Evolution during a run (weapon level increases every 12 kills, up to Lv.8).
- Ship Ultimate Nova with charge meter and mobile button / E shortcut.
- Multi-phase bosses at 75% / 50% / 25% HP with faster and stronger patterns.
- Kill missions with bonus coin rewards.
- Boss reward chest drops.
- Modular ship parts: Engine, Weapon, Shield, Core (5 levels each).
- Ship mastery and total-kill persistence.
- Per-level best score and Endless best score persistence for replay challenges.
- Existing features and the premium shooting background are preserved.


## Final XYPORASTK STUDIO Splash
- Replaced the old rocket-based splash presentation with the supplied beetle ship.
- Beetle is isolated from its white source background and animated independently.
- Added subtle hover/rotation, launch acceleration, green energy glow, moving stars, and responsive layout.
- Branding changed to XYPORASTK STUDIO.
- Splash duration is kept short for mobile startup.

## Final Boss Set — XYPORASTK STUDIO
- Replaced the old animal-themed boss set with original sci-fi bosses: Void Juggernaut, Iron Maelstrom, Celestial Warden, Shadow Revenant, Nova Devourer, Crystal Titan, and Xeno Overlord.
- Boss visuals are drawn as original vector/canvas silhouettes with glowing cores and phase auras, so gameplay no longer depends on the old animal boss artwork.
- Boss attack patterns were updated per boss family; Level 100 uses Xeno Overlord as the final boss.
- Added the final Boss Gallery artwork to `src/assets/images/xyporastk_boss_gallery.png` for future gallery UI use.


## Beetle Skin Collection
- Added six selectable Beetle skins: Classic Green, Emerald Armor, Energy Beetle, Battle Green, Shadow Green, Elite Green.
- All six retain the same gameplay stats, hitbox and current fire system; they are visual skins.
- Added responsive Hangar previews and runtime sprite selection based on the selected ship.
- Preserved the user's current Beetle ship as the default Classic Green skin.


## Beetle Ship Design Collection — Final
- Added all 12 Beetle designs/colors from the approved collection.
- Classic Green keeps the current player Beetle asset.
- Crimson, Azure, Golden, Purple, Emerald, Ice, Shadow, Neon, Solar, Void and Prism are cosmetic skins with identical gameplay stats and Fire System.
- Enemy ships and the Fire System remain unchanged in this pass.
