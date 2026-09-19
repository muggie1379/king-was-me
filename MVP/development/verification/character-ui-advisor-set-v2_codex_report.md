# Advisor portrait distinct-casting v2 report

- Work ID: character-ui-advisor-set-v2
- Date: 2026-09-19
- Owner: Codex
- Base HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
- Trigger: user review that all v1 advisors looked too similar
- Runtime code changed: no

## Change

Generated a new versioned portrait for all four advisors without using another portrait as an image reference. The shared art direction was retained in text while facial structure, hairstyle, body shape, posture and clothing silhouette were separated.

- Seran: lean, older presentation; long narrow face; tied silver hair; high vertical collar.
- Valen: broad athletic frame; square face; close-cropped hair; forward action over a map.
- Rian: younger androgynous presentation; oval face; long braid; open sleeves and hand gesture.
- Karden: sturdy middle-aged male; round broad face; short curled salt-and-pepper hair and beard; ledger held close.

Karden was regenerated as a male character following direct user preference.

## Files

- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_seran_v2.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_valen_v2.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_rian_v2.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_karden_v2.png
- Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md
- MVP/development/verification/character-ui-advisor-set-v2_codex_report.md
- MVP/development/collaboration/requests/character-ui-advisor-set-v2.md

## Verification

| File | Size | Format | Corner alpha | SHA256 |
|---|---:|---|---|---|
| advisor_seran_v2.png | 1024x1536 | 32-bit ARGB | 0,0,1,0 | 89c3e84bdf9110ddc8cf37871df8db781b0b870a479f995f5fa9f802f039400b |
| advisor_valen_v2.png | 1145x1374 | 32-bit ARGB | 0,0,251,249 | 1a6b34628ac3f71365145403bb776f8b19347010c11113412126795ff249d690 |
| advisor_rian_v2.png | 1024x1536 | 32-bit ARGB | 0,0,0,0 | 29c2316f20dd70fa2a2c8f9319268eb4d936d1a1e013a28b9bb075d635b28846 |
| advisor_karden_v2.png | 1145x1374 | 32-bit ARGB | 0,0,0,0 | b8154519b86c98727311d3ad578b639befe2983e2eb056ece65b5f97c795124c |

All four PNGs contain alpha transparency. Valen's foreground map table reaches the lower corners; this is foreground content rather than an opaque background. The portraits are visually distinguishable by face, hair, build and silhouette before props are considered.

## Scope

The v1 files were preserved. Assets/Scripts, Ink, MVP HTML, blind_test, _shared and _history were not modified. Unity card integration and final casting acceptance remain separate review steps.
