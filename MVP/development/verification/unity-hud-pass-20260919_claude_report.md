# Claude 작업 기록 — Unity "게임처럼 보이게" HUD 작업 + 버그 3건 (2026-09-19)

사용자 피드백: "뭔 게임인지 잘 모르겠다. 프롬프트(기획 의도)를 다시 점검하고, 완벽하진 않아도 플레이하고 싶은 게임으로." 이전 작업: `unity-play-feel-pass`, `background-art-integration`, `elevenlabs-audio`.

## 진단 (기획서 재점검)

`01_original_brief.md`, `02_design_bible.md` 재독. 핵심 루프(§13): 사건 → 대신들의 서로 다른 해석 → 선택 → 즉시/지연 결과. MVP 검증 질문(§14): "대신을 UI가 아니라 캐릭터로 느끼는가", "선택이 다음에 영향을 주는 것이 체감되는가". 당시 Unity 드래프트는 Ink 골격을 글로만 흘려서 (1) 게임 전제가 안 보이고 (2) 대신이 화면에 없고 (3) 선택이 남는 곳이 없었다.

## 한 것

신규 `Assets/Scripts/GameHud.cs` + `StoryController.cs` 연결:
- 첫 화면(전제 문구 + "즉위한다").
- 대신 카드 4장: Ink `*_introduced` 변수로 해금 표시("? ? ?" → 이름/직함), 말하는 대신 강조. 호감도 등 수치 노출 없음(§12.1).
- 왕실 기록 패널(§29): 선택을 "사건 N · 선택 텍스트"로 최근 9개 표시. 무엇을 했는지만 남김.
- 챕터 표시("ACT III · 흔들리는 국경 · 사건 11 / 29"), 이야기 패널을 카드 아래로 이동하고 어둡게(가독성).
- `Assets/Editor/DevCaptureTools.cs`: Play 모드 UI를 임시 카메라로 렌더링해 PNG로 저장(Game 뷰가 안 그려지는 MCP 자동화 환경 대응). 메뉴 `KingWasMe/Dev/*`: 캡처(16:9 / 좁은 창 945x435), StartGame, NextLine, ClickFirstChoice, AutoPlay40/200, Jump to event_23_default.

## 스크린샷으로 발견/수정한 버그

1. **모든 대사의 첫 글자가 잘림**(첫 드래프트부터): `Content` RectTransform이 기본 `sizeDelta (100,100)`을 유지해 양옆 50px 넘침 → `sizeDelta = Vector2.zero`.
2. **Act I 이후 배경/음악/색/챕터가 안 바뀜**: `story.state.currentPathString`이 선택지 대기 시점에 자주 비어 있음 → `CaptureEventPath()`로 `Continue()` 중 현재/직전 포인터에서 `event_NN` 수집. 수정 후 자동 진행으로 Act III까지 배경·대신 해금·기록 확인.
3. **선택지 글자 사라짐**(사용자가 Game 뷰 스크린샷으로 제보, 사건 23의 5개 선택지): 창이 넓고 낮으면 캔버스 높이가 줄고, 버튼이 글줄 높이보다 눌리며, 레거시 `Text` 기본 `verticalOverflow=Truncate`가 글자를 통째로 숨김 → `screenMatchMode=Expand`, 버튼 `minHeight=38`, `verticalOverflow=Overflow`, 간격 6. 945x435에서 재현/수정 확인.

## 검증

- 재컴파일 0 에러/0 경고, 첫 화면/사건1 대사·선택지/기록 패널/사건 11 상태/사건 23(좁은 창)을 렌더링 PNG로 직접 확인.
- 한계: 16:9 고정 캡처는 3번 버그를 못 잡았다 — 이후 좁은 창 캡처를 추가.
- 실제 소리·손맛·재미는 사람이 플레이해야 확인 가능. 마우스 클릭 경로(advanceCatcher)는 사용자 실플레이로 검증됨(사건 23까지 진행 확인).

## 알아둘 것 / 남은 것

- 대신은 아직 글자 카드. 코덱스가 초상화(v2, 카르덴 v3)와 UI 에셋(카드/모달/지도·모래시계·봉인 아이콘) 산출 — 다음 작업은 카드에 초상화를 붙이는 Unity 연결(런타임 연결은 Claude 범위).
- 결과가 텍스트로 즉시 보이지는 않음(기록 패널만). 즉시/지연 결과 표현은 후속.
- `05_multi_kingdom_relationship_routes.md`(다국가 이식 기준)는 Unity에 아직 미이식(Ink 변경분은 반영됨).
- 점프(`Jump to event_23_default`)는 대신 해금 플래그를 건너뛰므로 카드가 "???"로 보임(도구 특성).
