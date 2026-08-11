# Galaxy Defender v1.0.0 — Release Checklist

## Included in this batch
- Full game-balance configuration and documented difficulty rules.
- Hidden developer/QA panel enabled only with `?debug=1`.
- Save checksum validation, backup recovery, and versioned save envelope.
- Audio mix controls plus critical-hit and shield-break SFX.
- Performance sampling and last-session performance snapshot.
- Unified visual tokens/focus states for UI consistency.
- Release metadata, privacy policy, credits, and third-party license notice.
- Automated asset SHA-256 manifest via `npm run release:audit`.

## Intentionally excluded
- Device compatibility certification (requested exclusion #7).
- Localization system (requested exclusion #9).
- Mission system, tutorial, combo system, and 3-2-1 countdown remain excluded per earlier instructions.

## Before store submission
1. Install dependencies in a normal internet-enabled environment.
2. Run `npm run lint` and `npm run build`.
3. Run `npm run release:audit` and review `RELEASE_ASSET_MANIFEST.json`.
4. Replace the privacy policy with the publisher's actual policy URL/text.
5. Verify ownership/licensing for every artwork and audio asset.
6. Preserve third-party notices for bundled dependencies.
7. Test Android touch/audio permissions and background/foreground lifecycle on real devices.
8. Create final signed production package (APK/AAB/PWA as applicable).
9. Remove `?debug=1` from normal QA/release links; the panel is inert unless explicitly enabled.
