# Advisor portrait set generation report

- Work ID: character-ui-advisor-set-v1
- Date: 2026-09-19
- Owner: Codex
- Scope: user-approved remaining advisor portrait generation
- Base HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
- Runtime code changed: no

## Result

Completed a four-file advisor portrait set using the existing Seran portrait as the visual baseline. Rian and Karden were generated with the baseline as a style reference. The first Valen result resembled Seran too closely and was rejected; Valen was regenerated without the image reference while retaining the written style specification.

Each portrait uses a documented habit rather than an explicit body-organ metaphor:
- Seran: aligned documents and a precise pointing gesture
- Valen: forward posture and an active map marker
- Rian: open hand and unmarked sealed correspondence
- Karden: internal ledger and room-monitoring gaze

All appearances remain non-canon proposals.

## Changed files

- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_seran.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_valen.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_rian.png
- Unity/My project/Assets/AI_Generated/Images/Characters/advisor_karden.png
- Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md
- MVP/development/verification/character-ui-advisor-set-v1_codex_report.md
- MVP/development/collaboration/requests/character-ui-advisor-set-v1.md

## Technical verification

| File | Native size | Pixel format | Corner alpha | SHA256 |
|---|---:|---|---|---|
| advisor_seran.png | 1209x1300 | Format32bppArgb | 0,0,0,0 | 73ac5838185d4094eb73d0899fee2d114c5566237d312a7be5c7ae9211420e87 |
| advisor_valen.png | 1180x1333 | Format32bppArgb | 0,0,248,249 | 808d08e882da86f883516cfaa2a39cb8d7fb0c2012b1c9dae1b59c915efbff68 |
| advisor_rian.png | 1209x1300 | Format32bppArgb | 0,0,0,0 | 2e7ae962ea8eb8c17d385919a7ff959d1ab78e0fc9521cea360cb11225a9dfbd |
| advisor_karden.png | 1209x1300 | Format32bppArgb | 0,0,17,0 | ce677c863d3edc0bc25381fdd4939a8dae175be4d333f6634ba796e82bd8ca25 |

All files use 32-bit ARGB PNG data with transparent backgrounds. Seran and Rian have fully transparent corners. Valen's map table reaches both lower corners, and Karden's ledger produces a small amount of lower-left edge alpha; these are foreground-edge pixels rather than an opaque backdrop. Built-in generation does not provide exact 512x768 output control, so the high-resolution native outputs were preserved without destructive stretching or cropping. Unity should apply consistent card framing or a shared portrait mask during integration.

## Visual verification

- Painterly realism, side-light direction, low saturation and material language are consistent.
- Four silhouettes remain distinguishable through posture, props and accent color.
- No readable text, national flags, heraldry or explicit anatomical symbolism was observed.
- Valen avoids a war-loving expression.
- Rian's gesture reads as conversational space rather than romance.
- Karden reads as protective resource attention rather than fear.
- None of the portraits is wired into Assets/Scripts.

## Remaining review

The generated images necessarily propose visible age, gender presentation and appearance even though these are not canonical. Review them only as casting proposals. Card-scale UI readability and crop should be verified inside Unity before acceptance.

