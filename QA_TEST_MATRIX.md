# QA Test Matrix

## Core
- [ ] Start campaign
- [x] Restart after Game Over
- [x] Complete normal level
- [x] Complete boss level
- [ ] Endless mode does not unlock campaign levels
- [ ] Shop purchase and ship selection
- [ ] Weapon evolution limits
- [ ] Prestige requirement

## Save safety
- [ ] Normal save/load
- [ ] Primary save corruption -> backup recovery
- [ ] Rotating backup recovery
- [ ] Invalid currency is clamped
- [ ] Invalid ship selection is corrected
- [ ] Export/import checksum rejection

## Release security
- [ ] `?debug=1` works only in DEV
- [ ] Production bundle exposes no debug controls
- [ ] Third-party license notice present
- [ ] Copyright audit present

## Performance
- [ ] HIGH/MED/LOW settings
- [ ] FPS snapshot appears in DEV debug panel
- [ ] Particle-heavy boss fight remains playable

- [x] Mini-boss level victory path and boss-chest isolation (static regression check)
- [x] Corrupted primary + backup recovery chain (static regression check)
- [x] Strict save version/checksum validation (static regression check)
- [x] Touch cancel / browser blur input release (static regression check)
