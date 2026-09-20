# Fixed-background dialogue sequence v1 — Codex report

## Problem

Individually generated dialogue screenshots resembled the same receiving room but changed window, chair, table, flower, and camera positions. They did not read as consecutive shots in one fixed location.

## Change

Created one empty receiving-room master background and composited all subsequent character and UI layers from that same raster file.

1. Rian observation — character right
2. Seran response — character left
3. Valen proposal — character right
4. Rian moderation — character left
5. Three advisor opinion cards — no large character
6. Opinion cards shifted upward; three king action-choice cards revealed below

## Choice copy

- 먼저 짧게 답신한다.
- 상대의 다음 움직임을 기다린다.
- 우호의 뜻을 분명히 밝힌다.

The choices use matched action-level specificity and do not expose hidden values or script the king's spoken dialogue.

## Verification

- Six screenshots and one background master were written successfully.
- All six frames load the same `royal_reception_day_background_master_v1.png` before adding overlays.
- Scene label decoration that rendered as a missing glyph was removed.
- No runtime, HTML, Ink, `_shared`, `_history`, or blind-test file was modified.

## Path

`MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/`
