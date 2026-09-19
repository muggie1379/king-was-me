# Unity ACT Background Draft — Codex report

Date: 2026-09-19
Scope: Unity/My project/Assets/AI_Generated only
Status: image evidence complete; audio blocked by unavailable generation tool

## Tool check

Available: built-in image generation tool.
Unavailable: audio/music/sound-effect generation tool.
Decision: generated five images only. Did not use procedural synthesis, downloaded music, stock audio, or other workaround.

## Design references read

- MVP/development/DESIGN_INTENT.md
- 기획/04_story_bible.md §30 Story Do Not Drift and §31 TBD
- Unity/My project/Assets/Scripts/StoryController.cs ActMoods

Applied constraints:
- visuals work as literal kingdom environments without requiring metaphor
- ACT II gives no special visual privilege to the East
- national cultures, names, heraldry, costume and architecture remain non-canon
- understated, low-saturation presentation
- no characters or explanatory text
- UI-readable central/lower composition

## Deliverables

Unity/My project/Assets/AI_Generated/Images:
- act01_small_kingdom.png — 95a15f7f25a9a83f22893d33fb8f10514e5aa118c535dde291776d7a006fe528
- act02_many_neighbors.png — e4da6a346f304f3ac83e01cc9ed477fa3c8ae50bf94f52c35d53ae311d7549f7
- act03_uncertain_borders.png — 18f647c0f364ae04a75ab30d1d7da892b32e1da342b21d681a8b3c4a2a08aeb4
- act04_unneeded_war.png — ada28a488e4a51ce7f14c79cb92cc44256f12b93c70cb40314119b8e7f7635fe
- act05_world_continues.png — d0f018ba67f54b1a0dd2d424b69de52fe1494a2cdfd4c1e2684177fd7eec2e4f

All five are valid PNG files at 1672×941.

## Excluded

- no Audio files
- no StoryController wiring
- no Scripts changes
- no Resources/Ink changes
- no _shared changes
- no country-specific canon decisions

Observed protected-file hashes after work:
- StoryController.cs: 5835b97a73efb97a7c7cae9c8f577c2c943366d32df611212ce32266b9ad26a7
- Unity Resources Ink source: 8b6b36c40b05d54de2fb4549659a8aa043c3335ca30c9d9e662f6ebf0391e8e7

## Required review before expansion

1. Inspect the five images in Unity at 1280×720 with the current text panel.
2. Check text readability and crop behavior for 16:9 Game view.
3. Decide whether the shared council-gallery viewpoint is a useful continuity device.
4. Mark individual images accepted/revise/reject.
5. Only after approval, wire backgrounds to ActMoods and generate wider scene coverage.
6. Generate BGM and UI SFX only in an environment with an actual audio generation tool.
