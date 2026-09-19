# Unity Story Midpoint Audit — Initial Intent vs Current Playable Draft

- Work ID: unity-story-midpoint-audit-20260919
- Date: 2026-09-19
- Reviewer: Codex
- Scope: read-only comparison; no story, Ink, Unity code or asset changes
- Unity Ink SHA256: 3f0238ab18bdf3934b052453e081ac18714aa3609a87274fb710fb540737667d
- Canon Ink SHA256: 3f0238ab18bdf3934b052453e081ac18714aa3609a87274fb710fb540737667d
- Reference: user-provided shared ChatGPT conversation, treated as non-authoritative design background

## Executive finding

The Unity draft has not lost the project's core premise. It imports the current 29-event, five-country Ink exactly, preserves the silent king until the final line, interleaves other kingdoms, and reaches the KING WAS YOU → empty throne → “내가 결정하지.” ending.

The current risk is a fidelity gap between structure and playable drama. Unity directly plays a file whose header defines it as “branch logic + representative text,” not finished prose. It contains the intended event map but not yet enough scene writing, consequences, character interaction or presentation to prove that the first playthrough is enjoyable as a kingdom game.

## Status legend

- PASS — present and aligned
- PARTIAL — direction present, playable expression incomplete
- FAIL — current playable content contradicts or omits a required behavior
- DEFERRED — deliberately undecided or outside the current Unity draft

## A. Core identity

| Check | Status | Evidence / implication |
|---|---|---|
| King represents player/Self | PASS | The king is not a speaking council member. Choices are actions. |
| King silent until ending | PASS | No direct royal dialogue before the final “내가 결정하지.” |
| Other parties’ inner feelings unknown | PASS | Eastern responses use observable speech/actions. |
| No explicit moral grading or exposed score | PASS | No GOOD/BAD labels or numeric relationship UI. |
| Final self-determination ending remains | PASS | KING WAS YOU → phone → court → empty throne → first person → final line exists. |
| First play works independently as kingdom story | PARTIAL | Political threads exist, but many events are one fact sentence plus choices. |
| Advisors feel like people | PARTIAL | Voices differ, but cross-talk, bias, mistakes and growth are sparse. |
| Player motivation remains unassigned | PASS | Records store chosen actions, not personality diagnoses. |

## B. “Kingdom game first”

| Check | Status | Evidence / implication |
|---|---|---|
| Ordinary governance precedes East | PASS | E01 inventory, E02 village dispute, E03 northern movement precede E04. |
| East begins as one of several countries | PASS | South, North, West and Coast are interleaved. |
| East becomes important through repetition | PARTIAL | Repetition exists, but emotional accumulation needs fuller scenes. |
| World continues while East is unresolved | PASS structurally | Other-country events interrupt the sequence and E26 returns to the wider map. |
| Kingdoms have independent political reasons | PARTIAL | North/South are clearest. West/Coast and several Eastern gift/festival events remain thin. |
| Living NPCs make the kingdom inhabited | FAIL in playable density | Few active guards, clerks, merchants or officials appear; most events use narration/core advisors. |
| Decisions create visible consequences | PARTIAL | Strong branches exist, but many choices immediately converge with no result vignette. |
| First run is enjoyable without metaphor | NOT PROVEN | No full 29-event Unity user test; current prose is still a structural draft. |

## C. Multi-kingdom structure

| Thread | Status | Notes |
|---|---|---|
| North | PASS structurally | E03→E07→conditional E21; reachable threshold and incident history are fixed. |
| South | PASS structurally / PARTIAL dramatically | Strong branch works, but “지난번 선택의 대가” risks evaluative framing. |
| West | PARTIAL | One substantive event plus E26/E29 callbacks; still more variable seed than relationship. |
| Coast | PARTIAL | Tonal variety and callback exist, but no arc yet. |
| East | PARTIAL / high risk | Deepest chain and visit branch exist; late outcome ignores too much history. |
| Multiple relations remain open | PASS at E29 | Several qualifying country messages can appear together. |
| Alternative relationship endings | PARTIAL | E29 offers follow-up messages, not distinct scenes or endings. |

## D. Branch and consequence

| Check | Status | Evidence / implication |
|---|---|---|
| Strong pause-contact branch | PASS | E15 becomes “닫힌 교류” with graduated reopening choices. |
| North hardline branch reachable | PASS from prior Ink verification | Start 2 + E03 +1 + E07 +2 reaches threshold 5. |
| South hardline changes later events | PASS | E14 changes and E19 becomes a bridge. |
| Direct royal visit replaces Eastern ACT IV | PASS structurally | E18/E20/E22/E23 have visit variants. |
| Visit logistics coherent | PARTIAL | Interleaved South/North scenes still need explicit remote-report/advisor-location staging. |
| Final meeting choice changes immediate response | PASS | Dedicated E23 reply knots use observable reactions. |
| Final meeting changes later relationship form | FAIL | E23 replies converge into generic E24 with no relationship-form state. |
| E25 matches all possible outcomes | FAIL | It always says “목표는 달성하지 못했습니다” and frames withdrawal. |
| Earlier distance choices alter late logistics | PARTIAL | Values change, but E18–E25 mostly occur regardless. |
| Seven original decision axes affect content | FAIL | initiative, caution, reciprocity, pressure, selfProtection, uncertainty and warmth are declared but never updated. |
| Most choices alter state or scene | PARTIAL / weak | Many choices go straight to the same event with no result beat. |
| Chronicle records facts only | PASS | Event and action are recorded without judgment. |
| Chronicle records outcomes | PARTIAL | Decisions are stored, observable consequences are not. |

## E. Characters

| Character | Introduction | Role clarity | Dramatic depth |
|---|---|---|---|
| Seran | PASS E01 | PASS | PARTIAL: little bias correction or growth |
| Valen | PASS E01 | PASS | PARTIAL: little recognition that inaction is also a choice |
| Rian | PASS E06 | PASS | PARTIAL: few negotiations with actual foreign actors |
| Karden | PASS E11 | PASS | PARTIAL: strong E19 point is fixed regardless of player history |
| Watcher | PASS conditionally | PASS | PARTIAL: one brief report |
| Chaplain | PASS E27 | PARTIAL | Automatic introduction; English role label; little setup |
| Fool | PASS E28 | PARTIAL | Automatic introduction; English role label; little setup |
| Core advisors interact | FAIL | Mostly isolated one-line comments. |
| Advisors misread king and admit it | FAIL / missing | A major promise in the initial brief is not dramatized. |

## F. Reveal and ending

| Check | Status | Evidence / implication |
|---|---|---|
| Metaphor is not directly explained | PASS | No psychological correspondence table. |
| Reality reveal reserved for ending | PASS in text order | Phone appears only after KING WAS YOU. |
| Brief visual glitches foreshadow reinterpretation | MISSING | Intended momentary “재상→분석” style bleed is absent. |
| KING WAS YOU has distinct presentation | FAIL | It is another line in the same story text pipeline. |
| Phone “뭐해?” has distinct presentation | FAIL | It is ordinary text, not a visual object/scene. |
| Empty throne is shown | FAIL | The direction “카메라가…” is printed as prose. |
| First-person walk is staged | FAIL | The movement direction is printed rather than performed. |
| Final voice lands as unique | PARTIAL | Order is right, but presentation weakens it. |
| Second Reading / NG+ exists | DEFERRED / absent | Latest strategy is TBD; original replay value is not implemented. |

## G. Unity implementation

| Check | Status | Notes |
|---|---|---|
| Unity Ink equals canonical Ink | PASS | Byte-identical SHA256. |
| Ink compile/branch evidence | PASS from prior report | 0 compile errors/warnings; 16 major combinations reached ending. |
| All 29 events clicked through in Unity | NOT VERIFIED | Setup report visually confirmed only Event 1. |
| Standalone build works | FAIL / known limit | Story loading is editor-only under UNITY_EDITOR. |
| One-line pacing | PASS | StoryController reveals one Ink line at a time. |
| Portraits integrated | NO | Generated portraits are not wired. |
| Event format variety | FAIL | Nearly all events use the same text panel plus choices. |

## H. Shared ChatGPT conversation

Useful design rationale:

1. The game should feel like kingdom governance/foreign policy first.
2. East becomes special through repetition, not privileged presentation.
3. Interleaving countries keeps the world moving and prevents an immediate “East = romance target” equation.
4. Living NPC reactions make advisors credible officials.
5. ACT V should restore the whole map visually instead of explaining the theme.
6. “고르고 보니” is central: the player may project relationship meaning after choosing; the game should not pre-label it.

Current canon already contains these principles. Unity implements points 2–3 structurally, while points 1 and 4–5 remain mostly documents rather than playable scenes. The shared conversation is background evidence, not project authority.

## Recommended order

### P0 — before more visual polish

1. Replace fixed E24/E25 resolution with relationship-form outcomes derived from actual choices.
2. Decide which hidden axes are real systems; implement or remove the seven unused axes.
3. Add short observable result beats after high-value choices.
4. Add an ending presentation router so title, phone, throne, walk and voice are staged.

### P1 — prove first-play kingdom fun

5. Finish prose for ACT I and one complete multi-country cycle before expanding all 29 scenes equally.
6. Add living NPC delivery/reaction scenes to that cycle.
7. Add advisor cross-talk, mistaken assumptions and one correction/growth beat per core advisor.
8. Give Eastern festival/gift/tribute scenes independent diplomatic purpose and practical stakes.

### P2 — replay and production

9. Decide Second Reading strategy after the first-play loop proves enjoyable.
10. Add scene-format and location variety.
11. Run full Unity click-through tests across representative strong branches.
12. Replace editor-only Ink loading before a distributable build.

## Go / no-go

- GO for continued Unity prototyping: canonical structure and major branches are present.
- NO-GO for treating the current Unity story as a narrative MVP ready for broad testing: it is a playable branching outline, not a finished first-play experience.
- Do not redesign the 29-event structure again. Complete one high-quality vertical cycle and repair the late Eastern outcome logic first.
