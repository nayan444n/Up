# QA / Bug-Hunt Plan

## Smoke tests
- Start game, open each Home menu item, return to Home.
- Play campaign level, die, retry, return Home.
- Complete level, replay it, verify best score/stars.
- Purchase/select ship, restart app, verify persistence.
- Change audio sliders, restart app, verify persistence.
- Export/import save, then intentionally corrupt checksum and verify recovery.
- Open `?debug=1` and test developer controls; confirm normal URL has no debug panel.

## Combat tests
- Critical hit text and sound.
- Shield depletion and shield-break warning.
- Boss warning/music and victory.
- Power-up pickup and weapon evolution.
- Endless score persistence.

## Economy tests
- Currency never becomes negative.
- Upgrade levels never exceed their caps.
- Invalid ship IDs are rejected.
- Reset clears player progress.

## Regression target
No changes to Home Page artwork, character, background, or logo.
