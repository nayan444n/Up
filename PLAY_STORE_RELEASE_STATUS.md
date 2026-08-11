# Google Play Release Status

This repository is **release-prepared but not an AAB**. The web game includes a valid web manifest, privacy-policy page, low-end performance fallbacks, and production debug locking.

Before Play Console submission, the publisher must:

1. Build the production web bundle with `npm run build` in a networked development environment.
2. Package the resulting bundle as an Android App Bundle using a maintained TWA/Capacitor/Bubblewrap workflow.
3. Set the Android target API to the level required by Google Play at submission time (Google currently requires the latest target API level; the August 31, 2026 deadline is documented by Google).
4. Sign the AAB with the publisher's release key and test the signed build on physical low-RAM Android devices.
5. Host `public/privacy-policy.html` at a stable public HTTPS URL and enter that URL in Play Console.
6. Complete the Play Console Data safety, content rating, target audience, app access, and developer verification declarations accurately.
7. Verify ownership/licensing records for every bundled artwork/audio asset before commercial distribution.

No private key, signing credential, or developer-account information is included in this repository.
