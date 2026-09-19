# KING WAS ME UI System v1

Status: candidate library / non-canon / not connected to runtime  
Generated: 2026-09-19

## Contents

- `Source_SVG/Buttons/` — scalable button-state masters.
- `Source_SVG/Cards/` — scalable panels, cards, nameplates and modal masters.
- `Source_SVG/Icons/` — 48×48 line icons, including multiple arrow/navigation variants.
- `Export_PNG/` — transparent PNG exports matching every SVG master.
- `UI_KIT_PREVIEW.html` — browsable asset catalogue.
- `UI_KIT_CONTACT_SHEET.png` — single-image visual inventory.
- `tools/` — deterministic generation and PNG export scripts.

Current count: **98 SVG + 98 transparent PNG**.

## Visual rules

- restrained near-black brown surfaces;
- muted brass borders and warm paper-colored icon lines;
- square corners with minimal 3 px rounding;
- no baked text, heraldry, country identity or character interpretation;
- icons describe visible UI actions or world objects, not hidden emotional values;
- navigation arrows share one stroke weight but use distinct shapes by purpose.

## Groups

- Buttons: 7 families, each in normal / hover / pressed / disabled states.
- Cards: 16 advisor, dialogue, decision, chronicle, notice, modal, tooltip, map, settings and save frames.
- Navigation: continue, back, next, council pan, expand/collapse, up/down and fullscreen variants.
- General: close, play, pause, audio, music, settings, save, load, lock, information, sort, filter, reset and inspect.
- Game-specific: royal decision, advisor speech/arrival, envoy/letter arrival, chronicle, timer, silence, result, map, report, seat, border, trade, harbor, granary, road and bridge.
- Time/weather: day, night, sun, rain and snow.

## Unity adoption

This is a candidate library. Select only the needed pieces after target-layout review.

- Use SVG as editable masters and PNG where the Unity vector package is not adopted.
- Large buttons and cards are 9-slice candidates; final borders require Unity Sprite Editor checks.
- Apply all text with TextMeshPro at runtime.
- Keep tinting and disabled opacity in Unity for accessibility tuning.

## Validation

- Every SVG exported successfully through CairoSVG.
- All 98 PNGs are RGBA and contain transparent pixels.
- No Edge/Chrome screenshot conversion is used.
- No Unity scripts, Ink, `_shared`, `_history`, baseline HTML or runtime resources were modified.
