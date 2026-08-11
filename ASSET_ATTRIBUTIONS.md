# Asset Attribution & Rights Register

This file is a release-control document. It is intentionally conservative: an asset is **not** treated as copyright-cleared merely because no web match was found.

## Required status before commercial distribution

Every bundled artwork/audio asset must have one of these statuses, backed by evidence retained by the publisher:

- **ORIGINAL** — created by the publisher/team; keep the source/project record.
- **COMMISSIONED** — created for the publisher; keep the agreement granting redistribution/commercial rights.
- **LICENSED** — obtained from a third party; record the source URL, creator, license, and proof of the license.
- **REPLACED** — replaced by an asset whose rights are documented.

## Bundled artwork register

The current package contains local artwork assets listed in `RELEASE_ASSET_MANIFEST.json`. Their filenames alone do not establish ownership or a license.

Before release, the publisher must assign a rights status and evidence to **every** asset in that manifest. Do not publish an asset whose rights are unknown.

## Audio

Gameplay audio is synthesized in `src/utils/sound.ts`. Keep the source code as the provenance record and verify that any future audio changes remain original or appropriately licensed.

## Release rule

**Unknown provenance = not cleared for commercial distribution.**

This register is a practical release-control document, not legal advice or a legal opinion.
