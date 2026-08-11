# Galaxy Defender

Galaxy Defender is a standalone arcade space shooter with ship upgrades, boss battles, power-ups, progression, achievements, statistics, and mobile controls.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`
3. Create a production build:
   `npm run build`

## Quality checks

Run the release checks after dependencies are installed:

`npm run qa`

The QA suite covers TypeScript validation, release asset auditing, gameplay smoke checks, and release-security checks.

## Distribution notes

- No external image/CDN URL is required for the bundled gameplay artwork.
- Review `ASSET_ATTRIBUTIONS.md` and `COPYRIGHT_AUDIT.md` before commercial distribution.
- Review `THIRD_PARTY_LICENSES.md` and preserve applicable dependency notices.


## v1.0.1 CLEAN BUILD
This package removes unused artwork/preload-only assets and fixes session-coin double-awarding during periodic progression checkpoints. Only runtime-referenced image assets are retained.
