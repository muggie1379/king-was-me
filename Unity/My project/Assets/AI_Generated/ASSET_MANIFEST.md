# AI Generated Asset Manifest

Status: visual draft / non-canon
Date: 2026-09-19
Generator: Codex built-in image generation tool

These images are evidence assets for the Unity draft. They do not canonize country names, culture, architecture, heraldry, costume, or geography. Review them before wiring them into StoryController.

## Images

| File | Act | Intended mood |
|---|---|---|
| Images/act01_small_kingdom.png | ACT I, Event 1–3 | modest governance beginning; warm near-black brown |
| Images/act02_many_neighbors.png | ACT II, Event 4–10 | multiple neighbors and roads; cool blue-gray |
| Images/act03_uncertain_borders.png | ACT III, Event 11–17 | incomplete reports and contained unease; muted rust-brown |
| Images/act04_unneeded_war.png | ACT IV, Event 18–25 | costly preparation and absence; charcoal/violet-black |
| Images/act05_world_continues.png | ACT V, Event 26+ | recovery without closure; subdued ochre/olive |

All images:
- PNG, 1672×941, landscape
- restrained painterly environment concept art
- no characters or readable text
- central/lower region kept relatively quiet for story UI
- no specific country's culture or heraldry is canonicalized

## Audio

No audio files were generated. This Codex environment had an image generation tool but no audio/music generation tool. Audio/ is reserved for a later tool-enabled pass. No synthesized placeholder or third-party asset was substituted.

## Integration status

Not connected to runtime code. Assets/Scripts and Assets/Resources/Ink were deliberately not modified.
## Location Variant Set 01 — Council Gallery

Source composition: Images/act01_small_kingdom.png

| File | Time / weather |
|---|---|
| Images/Locations/council_gallery/clear_sunrise.png | clear sunrise reference |
| Images/Locations/council_gallery/fog_predawn.png | foggy pre-dawn |
| Images/Locations/council_gallery/rain_late_afternoon.png | steady rain, late afternoon |
| Images/Locations/council_gallery/snow_blue_hour.png | light snow, winter blue hour |
| Images/Locations/council_gallery/clear_night_after_rain.png | clear night after rain |

The variants preserve the same viewpoint, arches, table, town, bridge, river and hill tower. They are environmental alternatives, not emotional truth labels.

## Additional Location Sources

- Images/Locations/border_watch/fog_dawn.png — source composition for future border-watch variants
- Images/Locations/granary/clear_dry_noon.png — source composition for future granary variants

These locations remain non-canon visual drafts. Future batches should vary time and weather while preserving each source composition.
## Batch 03 — Border Variants and UI Draft Kit

### Border watch variants

- Images/Locations/border_watch/fog_dawn.png
- Images/Locations/border_watch/clear_dry_noon.png
- Images/Locations/border_watch/snow_night_brazier.png

### UI draft kit

Buttons:
- UI/Buttons/choice_normal.png
- UI/Buttons/choice_hover.png
- UI/Buttons/choice_pressed.png

Panels and icons:
- UI/Panels/dialogue_panel.png
- UI/Icons/continue_chevron.png
- UI/Icons/chronicle_ledger.png

All UI files have a real alpha channel and contain no text. They are visual drafts, not wired runtime assets. Before use, review import settings, crop transparent padding, establish Pixels Per Unit, and define 9-slice borders for the button and dialogue panel. The generated textures must not replace accessibility contrast checks or native Unity button state behavior.
## Batch 04 — Granary Variants and Extended UI

Granary matched-location set:
- Images/Locations/granary/clear_dry_noon.png
- Images/Locations/granary/rain_cloudy_morning.png
- Images/Locations/granary/snow_winter_noon.png
- Images/Locations/granary/dry_lantern_evening.png

Additional UI:
- UI/Panels/advisor_opinion_card.png
- UI/Panels/confirmation_modal.png
- UI/Icons/kingdom_map.png
- UI/Icons/decision_hourglass.png
- UI/Icons/sealed_message.png

All five UI files have true alpha and no baked text. Icons communicate interface functions only; they do not define a country, character personality or emotional interpretation. Panels remain unintegrated candidates and require Sprite Editor / 9-slice review.

## Batch 05 — Character UI Calibration

- Characters/Seran/seran_base_portrait_v1.png — Seran base upper-body portrait; transparent background; council-light reference for the advisor set

This is a non-canon visual draft for character-UI calibration. Seran is depicted through an aligned document stack, a precise pointing gesture and restrained concern. The portrait avoids explicit organ symbolism and is not yet connected to runtime UI. The costume and apparent age remain visual proposals pending cast-wide review.

## Batch 06 — Advisor Portrait Set

| File | Character cue | Accent |
|---|---|---|
| Images/Characters/advisor_seran.png | aligned documents and precise pointing gesture | muted slate blue |
| Images/Characters/advisor_valen.png | forward posture and moving map marker | muted coral rust |
| Images/Characters/advisor_rian.png | open hand and unmarked sealed correspondence | muted sage |
| Images/Characters/advisor_karden.png | internal ledger and room-monitoring gaze | muted ochre |

Status: **visual draft / non-canon**. These portraits translate documented habits into tentative visual cues. They do not canonize age, gender, ethnicity, national culture, costume, or a direct body-organ correspondence. The four files have transparent backgrounds and no baked text. They are not connected to runtime code. Review at approximately 200 px card size before integration.

## Batch 07 — Advisor Portrait Set v2: Distinct Casting

The v1 set remains available for comparison and rollback. The v2 set responds to review that the advisors looked too similar.

| File | Distinguishing proposal |
|---|---|
| Images/Characters/advisor_seran_v2.png | lean older figure; long narrow face; tied silver hair; tall vertical coat silhouette |
| Images/Characters/advisor_valen_v2.png | broad athletic frame; square face; close-cropped dark hair; forward map-table posture |
| Images/Characters/advisor_rian_v2.png | younger androgynous figure; oval face; long dark braid; open layered sleeve silhouette |
| Images/Characters/advisor_karden_v2.png | sturdy middle-aged man; broad round face; short salt-and-pepper curls and beard; compact patched mantle |

Status: **visual draft / non-canon**. The stronger differences are casting proposals for UI readability, not story canon for age, ethnicity or appearance. Karden is male in v2 by direct user preference. All v2 portraits use transparent PNG backgrounds, contain no baked text, and remain unconnected to runtime code.

## Batch 08 — Karden Casting Comparison

- Images/Characters/Karden/Candidates/karden_male_candidate_v1.png
- Images/Characters/Karden/Candidates/karden_female_candidate_v1.png

Status: **visual draft / non-canon casting candidates**. Both images use the same role interpretation, mature-attractiveness direction, ledger cue, maintained warden clothing, lighting and composition. Gender presentation is the intended comparison variable. Neither candidate is selected or connected to runtime code.

## Karden Casting Selection — User Decision

Selected current visual direction:
- Images/Characters/advisor_karden_v3.png — female Karden, promoted from karden_female_candidate_v1.png

The user selected the female candidate for her mature authority and visual appeal. The male candidate and earlier Karden versions remain as rollback history. This selection establishes the current visual direction for the character art draft; runtime integration is still pending and no story or dialogue was changed.

## Batch 09 — Seran Seated Pose Pilot (superseded framing)

Original pose candidates, moved after framing review:

- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_seated_idle_gaze_v1.png
- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_speaking_v1.png
- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_turn_left_v1.png
- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_turn_right_v1.png
- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_thinking_v1.png
- Images/Characters/Seated/Candidates/Seran/Cropped_v1/advisor_seran_silent_gaze_v1.png

Status: **visual draft / non-canon, rejected framing candidates**. Generated on 2026-09-19 with the Codex built-in image generation tool using `advisor_seran_v2.png` and the first seated result as identity references. All six files are 1024×1536 PNGs with real alpha transparency, but user review found that the sleeves and arms were cropped too tightly for practical seat composition. They are not runtime selections.

PixAI API was also tested for the same pilot. Its three outputs were internally consistent but substantially younger and more anime-stylized than the existing cast, and the thinking pose ignored the pose constraint. Those files remain comparison-only under `Asset_Library/PixAI/Candidates/Seran/Pilot_01_Rejected/` and are not Unity selections.

Wide framing correction candidate:

- Images/Characters/Seated/Candidates/Seran/WideFraming_v2/advisor_seran_seated_idle_gaze_wide_candidate_v2.png

This candidate pulls the camera back so both arms, elbows, hands and chair width are visible. It remains a candidate until the full council-screen layout is approved.

## Batch 10 — External Cast Exploration 01

PixAI was used only to explore differentiated silhouettes and prop directions. The resulting PixAI images remain under `Asset_Library/PixAI/Candidates/External_Cast/` and are not Unity selections because their anime rendering does not match the current game.

The selected silhouette directions were re-rendered as restrained painterly candidates:

| File | Exploration direction |
|---|---|
| Images/Characters/External/Candidates/Batch_01/external_eastern_envoy_candidate_v1.png | lean mature envoy, teal-charcoal travel coat, document case |
| Images/Characters/External/Candidates/Batch_01/external_western_envoy_candidate_v1.png | broad mature woman, burgundy-slate diplomatic coat, document tube |
| Images/Characters/External/Candidates/Batch_01/external_southern_merchant_representative_candidate_v1.png | sturdy trade representative, utility sash, account board |
| Images/Characters/External/Candidates/Batch_01/external_northern_guard_captain_candidate_v1.png | older weathered captain, heavy coat, border report case |

Status: **visual draft / non-canon / candidate only**. Directional country labels identify current story function and do not canonize ethnicity, costume, culture, heraldry, personality, or relationship role. None is connected to runtime code. User selection is required before identity-preserving pose or expression work.
