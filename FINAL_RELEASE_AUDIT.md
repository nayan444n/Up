# Final Release Audit

This release batch focuses on quality and release readiness.

## Included
- Advanced combat retained: elite enemies, mini-bosses, weapon evolution, loadouts, hazards, boss phases.
- Bounded dynamic difficulty director.
- Three rotating local save backups plus versioned/checksummed save envelope.
- Production debug lock: `?debug=1` is DEV-only.
- Automated smoke checks and release security audit scripts.
- Game balance rules and release checklist.
- Audio/visual polish and performance monitoring retained.
- Endgame systems retained: Endless mode, Boss Rush/Survival-ready architecture, collection/progression, prestige.

## Intentionally excluded
- Device compatibility certification/test matrix.
- Localization system.
- Combo system.
- 3-2-1 countdown.
- Mission/Objective system.
- First-time tutorial.

## Home page constraint
The original Home artwork/character/background/logo remain untouched. The required menu order remains PLAY -> LEVEL -> SHOP -> ACHIEVEMENT -> SETTING, with no EXIT button.

## Verification
Run `npm run qa` after dependencies are installed. This environment may not have network access to install npm dependencies, so a successful source-level audit is not equivalent to a completed production build.
