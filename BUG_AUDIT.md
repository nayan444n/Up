# Galaxy Defender – Bug Audit & Fixes

## Fixed in this pass

1. **Duplicate Game Over rewards/callbacks**
   - Added a per-session `gameOverTriggered` guard so coins/score are finalized only once.

2. **Touch input edge cases**
   - Touch handlers guard against missing touch points before reading `touches[0]`.

3. **Corrupted localStorage can crash the shop/game**
   - Saved ship IDs are validated against `SHIPS_CONFIG`.
   - Invalid/locked selections fall back to a valid unlocked ship.

4. **Invalid saved upgrade/level values**
   - Coins, upgrades, levels, ship parts, and progression values are normalized and bounded.

5. **Mutable default player state**
   - Default arrays/objects are copied when returning a fresh player state.

6. **TypeScript compile errors in saved-state fallback**
   - Fixed the `['ALPHA']` fallback so it is correctly typed as `ShipType[]`.

7. **HUD render-scope bug**
   - The JSX HUD referenced `g` even though `g` only existed inside the animation loop. This caused TypeScript errors and would break the build. The render path now gets `g` from `gameRef.current`.

8. **Frame-rate dependent gameplay**
   - The active game loop uses a clamped delta-time/frame scale for movement, bullets, enemies, particles, timers, and effects.

9. **Active-canvas resize handling**
   - Gameplay objects are scaled/repositioned when the viewport changes, with player bounds clamped to the new playfield.

## Verification

- TypeScript was run with the globally available compiler.
- After the fixes, no project-specific TypeScript errors remained in the output; remaining errors were dependency/type-resolution errors because npm dependencies could not be installed in this sandbox.
- `npm install` was attempted but the configured package registry returned `404` for `@tailwindcss/vite`, so a full Vite production build could not be completed here.
- Local image imports used by the game were checked against the archive and are present.

## Remaining recommendation

Run `npm install`/`bun install` in a normal development environment with access to the project's package registry, then run:

- `npm run lint`
- `npm run build`

The code-level bugs identified in this audit have been fixed in the supplied project.


## Additional deep-pass fixes (2026-08-11)

10. **Mini-boss levels could become unwinnable**
   - Levels divisible by 8 could spawn a mini-boss after the kill target, but defeating it did not trigger victory because `miniBossSpawned` prevented the next victory branch.
   - Mini-boss defeat now completes the level with the normal star calculation and victory flight.

11. **Mini-boss could consume the real boss chest reward**
   - The shared `chestDropped` flag meant an elite mini-boss could claim the one boss chest before the actual boss.
   - The chest is now restricted to real bosses.

12. **Save recovery could stop at a corrupted primary backup**
   - The old loader only checked rotating backups when the single backup key was absent, so a corrupted backup could block healthy rotating backups.
   - Recovery now walks primary, backup, rotating backups, and legacy storage in order.

13. **Import/save validation was too permissive**
   - Versioned saves now require the current save format and a valid checksum during import/load.
   - Malformed level-star, score, mastery, and daily-mission data is sanitized before the game uses it.

14. **Corrupted current level could bypass progression**
   - `currentLevel` is now clamped to `maxLevelUnlocked`, preventing a damaged save from starting a locked campaign level.

15. **Touch cancellation / browser blur input lock**
   - `touchcancel` and window blur now release active touch/joystick state so interrupted gestures cannot leave controls stuck.

16. **Delayed victory callbacks after leaving gameplay**
   - Delayed boss/level-victory callbacks now stop when the canvas effect is disposed or a game-over has already occurred.

## Verification performed
- TypeScript/TSX syntax transpilation: PASS for modified source files.
- QA smoke script: pending dependency-free execution in release packaging step.
- Full Vite production build: not available in this sandbox because npm dependency installation timed out.

## Final hardening pass

17. **Versioned save loader accepted unversioned/old envelopes**
   - `unpackSave()` now requires the current save format version and a checksum before accepting a non-legacy save.

18. **Daily missions could roll over at the wrong time zone boundary**
   - Daily mission keys now use the device's local calendar date instead of UTC.

19. **Restricted-storage browsers could crash settings/progress UI**
   - Settings, achievement persistence, progression markers, and game HUD storage reads now fail safely when `localStorage` is unavailable.

20. **Release URL audit produced false positives**
   - The audit now scans the source tree correctly and ignores SVG namespace URLs and documentation placeholders.

## Final verification

- Release asset audit: PASS — 34 binary assets, 1 real external URL reference.
- QA smoke: PASS.
- Release security: PASS.
- TS/TSX transpile syntax check: PASS.
- Dependency-free storage runtime smoke: PASS.
- Full Vite build remains unverified in this sandbox because npm dependency installation timed out.
