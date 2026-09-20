# Unity 화면 확인(CLI) + 수정안 3건 — Claude (2026-09-20)

## 변경 기록 (DESIGN_INTENT §E 형식)
- **변경 ID**: unity-screen-check-20260920
- **근거**: 사용자 지시("A 화면 확인 마무리 → B 원인 조사 후 수정안 먼저 → C 설계하고 확인받은 뒤 구현 → D 대응표부터").
- **영향 파일**: 프로젝트 코드/Ink/에셋 **변경 없음**(조사와 제안만). 문서: 이 보고서, `ROADMAP.md` 1-f 행 한 줄, `session-handoff-20260919_claude_note.md` 하단 갱신.
- **검증 방식**: Unity 6000.1.4f1 에디터를 Unity CLI(`unity command …`, Pipeline 7800)로 제어해 Play 모드에서 오버레이 UI 캡처(1280x720). 캡처 8장은 프로젝트 밖(세션 임시 폴더 `scratchpad/shots2/`)에만 보관했고 `Assets/Temp`는 삭제했다. Keep Player Loop Ticking은 사용 후 다시 껐고 Play 모드는 정지했다. 콘솔 오류는 MCP 8095 포트 경고(알려진 무해 항목)뿐이었다.

## A. Unity 화면 확인 결과
| 항목 | 결과 | 근거 |
|---|---|---|
| 의견 카드 클릭 팝업이 카드 **위쪽**에 뜨는가 | **PASS** | 사건 4 의견 단계에서 `BubbleClick(0)` 후 상태값 `popupAbove=True`, 캡처에서 팝업이 카드 행 위에 표시 |
| 팝업이 열려 있는 동안 카드가 흐려지는가 | **PASS** | 팝업 열림 `bubbleAlpha=0.30`(열기 전 1.00), 캡처에서 카드 글자가 흐려짐 |
| 서재 임시 화면 패널 불투명 | **PASS** | 패널 채움이 불투명(뒤 HUD/배경이 비치지 않음) |
| 지도 임시 화면 | **PASS** | 전체 불투명 |
| 임시 화면이 HUD "서재" 버튼 위에 오는가 | **PASS** | 서재/지도/컷신 화면에서 HUD "서재" 버튼이 보이지 않고 서재 화면 우상단은 "닫기 (Esc)"가 차지 |
| 나눔 폰트 | PASS(어제 확인 유지) | 제목/서술/카드/서재 제목 세리프(나눔명조), 라벨은 산세리프 |
| 사건 8 화면 | **PASS** | 제목 "공동 축제", 세르안·발렌·리안 3좌석, 사절 중앙 임시 실루엣, 발언 팝업, 의견 카드 3장, 결정 카드 4개(1~4) 정상. 진행 길이 표기 없음 |
| 사건 6 화면(어제) | PASS | 어제 확인 |

**A에서 새로 본 시각 문제(모두 경미, 수정하지 않음)**
1. 사건 8 결정 단계에서 결정 카드 행이 의견 카드 하단을 일부 가린다(세르안/리안 카드의 두 번째 줄이 잘려 보임, `…` 전에 끊김).
2. 지도 임시 화면: 길(연결선)이 "북부 변경국", "우리 왕국" 라벨 글자를 가로지른다.
3. 컷신 임시 화면: 밝은 하늘 위 흰 글자라 캡션 가독성이 약하다(어두운 그라데이션 없음).
4. 의견 카드 클릭 팝업이 카드 위 인물 몸통 일부를 덮는다(정보 손실 없음).

## B. 제목 화면 비침 — 원인과 수정안 (**수정 미실행, 확인 대기**)
- **원인**: `GameHud.ShowTitle`이 만든 `TitlePanel` 배경이 반투명(`alpha 0.88`)이라 그 아래 이미 만들어져 있는 HUD 요소가 그대로 비친다 — 서술 패널(위쪽 반투명 사각형), "왕실 기록" 패널, HUD "서재" 버튼(`StoryController.BuildTempScreens`가 제목 패널보다 먼저 생성). 하드닝 1-a는 "클릭해서 계속" 프롬프트와 클릭 캐처만 숨겼다(`StoryController.Awake`) — 나머지 HUD 요소는 처리하지 않았다.
- **수정안(권장)**: 시작 전에는 HUD 요소를 숨긴다. 제목 화면은 지금처럼 배경 그림이 은은하게 비치게 두고(alpha 0.88 유지), `RoyalRecord` 패널·서술 패널·`StudyButton`을 `SetActive(false)`(또는 `CanvasGroup.alpha=0`)로 두었다가 `BeginStory()`에서 켠다. 변경 위치: `GameHud`에 `SetHudVisible(bool)`, `StoryController.Awake`(제목 표시 직후 false)·`BeginStory`(true). 재시작(엔딩 후 자동 재시작)은 제목을 다시 띄우지 않으므로 영향 없음. 약 15줄.
- 대안: 제목 배경을 alpha 1.0으로 올림. 가장 간단하지만 은은한 배경 그림이 사라진다.
- 검증 계획: 컴파일(CLI `console_status` 오류 0) → Play에서 제목 캡처 → 시작 후 HUD 복귀 캡처.

## C. `# enter:`를 상시 대신에도 쓰는 설계 (**구현 미실행, 확인 대기**)
- **현재 동작**: `StoryController.AdvanceStory()`가 다음 선택까지의 줄을 한 번에 읽고 `RefreshAdvisors()`가 그 묶음 끝의 `*_introduced` 변수를 좌석에 반영 → 새로 소개되는 대신은 **묶음의 첫 줄부터** 보인다(사건 6의 리안). `# enter: <id>`는 `isGuest`(사절)에게만 작동한다(`SetGuestPresent`).
- **설계**: (1) `RefreshAdvisors()`가 이번 묶음의 `pendingLines`에서 `enter` 태그 id를 모아 둔다. 상시 대신의 소개 변수가 새로 true가 됐고 그 id가 `enter` 태그로 예고돼 있으면 좌석 표시를 보류한다(기존 `SetIntroduced(index,false)` 유지). (2) 그 줄이 표시될 때(`ShowNextLine`의 enter 처리 옆) 보류된 좌석을 `SetIntroduced(index,true)`로 켜서 기존 0.6초 착석 연출을 그대로 쓴다. (3) `enter` 태그가 없으면 지금처럼 묶음 시작에 표시(하위 호환). (4) Ink: 사건 6의 "회의실 한쪽에서 낯선 인물이 조용히 미소 짓는다." 줄에 `# enter: rian`을 추가, 사건 11의 카르덴 등장 줄에도 `# enter: karden` 추가.
- **변경 파일**: `StoryController.cs`(약 20줄), Ink 2줄(협업 잠금 필요). `SeatView`는 변경 없음.
- **위험/검증**: 컴파일(CLI 도메인 리로드가 처음이라 연결 유지 여부도 함께 시험), 사건 6에서 리안이 해당 줄에서 나타나는지 캡처, 사건 4/8(상시 대신 태그 없음)과 사건 11(태그 있음) 회귀 확인, inkjs 컴파일·스윕. 서재/지도 화면 중에는 보류 좌석이 나타나지 않게 IsOpen 가드는 기존 ShowNextLine 경로와 동일.
- **결정 필요**: 카르덴 사건 11의 등장 서술도 같은 방식으로 맞출지(권장: 예).

## D. 사건 11/13/15 대응표 (MVP KINGDOM_SLICE ↔ Ink)
공통 원칙: MVP는 **선택 이력으로 변형을 고르는 함수형 사건**(`getLateReplyVariant`/`getEvent5Variant`/`getEvent6Variant`)이고, Ink는 지금 **변형이 없는 한 벌짜리 knot**(사건 15만 기본/닫힘 2형)이다. 이식하려면 Ink에 이력 기록용 변수가 필요하다.

| Ink 사건 | MVP 사건 | MVP 변형(선택 기준) | Ink 현재 | 선택지 대응 | 이식 시 필요한 것 |
|---|---|---|---|---|---|
| **E11 늦은 답신** (`event_11`, 카르덴 소개) | `late_reply` | 3형 — active/mutual/cautious. 기준: E8 선택(`propose_next`→active, `stay_longer`·`festival_pastry`→mutual, `end_warmly`→cautious) 우선, 없으면 E6 선택(`warmer_welcome`→active, `match_effort`→mutual, `observe_more`→cautious), 마지막에 initiative/caution 수치 | 변형 없음, 서술 1줄 + 카르덴 1줄 | 4개 1:1: `wait`=먼저 연락하지 않고 기다림 / `check_in`=부담 적게 확인 / `propose_meeting`=직접 회담 제안(+eastPressure) / `lower_contact`=교류 빈도 낮춤(−eastWarmth). Ink 효과값은 유지 | **Ink 변수 신설**(예: `festival_pick`, `second_pick`; E8/E6 선택지에서 기록). 수치 fallback은 불필요: Ink 축 변수는 갱신되지 않는 죽은 변수이고, E8/E6 선택이 항상 E11보다 앞서므로 이력만으로 결정됨(E6 「다음 행동은 동부에 맡김」은 MVP에 없는 선택지라 E8 값으로 결정). MVP 본문 3형(intro/opinions/courtExchange) + 카르덴 등장 대사 이식 |
| **E13 취소된 회담** (`event_13`) | `canceled_meeting` (`timed:true`, 20초) | 5형 — active/cautious/protective/mutual/fallback. 기준: E11 선택(`propose_meeting`→active, `wait`→cautious, `lower_contact`→protective, `check_in`→mutual, 그 외 fallback) | 변형 없음, 서술 1줄 + 대신 4줄(카르덴 포함) | Ink 4개 ↔ MVP: 「다른 날을 먼저 제안」=`reschedule`, 「취소 이유 직접 확인」=`ask_reason`, 「대체 회담을 먼저 제안하지 않음」=`leave_ball`, 「당분간 비공식 교류 중단」=`pause_contact`(Strong Choice, `pause_contact=true`, eastWarmth −1). **MVP의 active형 5번째 `stop_initiating`(이번에는 먼저 제안하지 않는다)은 Ink에 없음** — `leave_ball`과 의미 중복 가능 | E11 선택 기록 변수 신설. fallback은 E11이 앞서므로 도달 불가. **타이머 20초**: Unity 미구현(`# timer` 태그는 "나중에" 목록) → 이식에서 제외하고 사용자 결정. MVP는 선택지 문구도 변형별로 다름(예: active형 접두 "우리가 먼저 청했던 자리였지만, ") — Ink 고정 이름 유지 vs 변형별 문구는 결정 필요 |
| **E15 빈 국경** (`event_15` 라우터 → `event_15_default`/`event_15_closed`) | `empty_border` | 2형 — `default`/`closed_by_us`. 기준: E13의 `pause_contact` | **이미 2형(같은 기준)**. 라우터는 `{ pause_contact: closed - else: default }` | default 4개 1:1: `continue_contact`=평소처럼 교류 / `wait_their_move`=다음 움직임은 동부가 먼저 하게 둠 / `lower_priority`=우선순위 낮춤(−eastWarmth) / `formal_only`=공식 교류만 유지. closed 3개 1:1: `keep_closed`=중단 유지 / `reopen_formal`=공식 교류부터 재개(+1) / `reopen_informal`=비공식 교류까지 재개(+2) | 변수 신설 불필요(가장 쉬움). 본문(intro/opinions/courtExchange/aftermath) 이식만. 카르덴 대사가 많아 `karden_introduced` 가드 필요 |

**권장 순서**: E15(변수 불필요, 가장 작음) → E11(변수 2개, 카르덴 등장) → E13(E11 변수 재사용, 타이머·`stop_initiating` 결정 필요).
**결정 필요(사용자/Codex)**: (a) 이력 변수 이름/위치 — `04_story_bible.md §5.1` 변수 목록에 추가되므로 Codex 문서 갱신 필요, (b) 타이머 20초를 Unity에서 재현할지(`# timer` 태그 신설 여부), (c) E13 active형 `stop_initiating` 처리, (d) 변형별 선택지 문구 유지 여부. (e) 사건 6 「다음 행동은 동부에 맡김」은 MVP에 없어 E11 변형 기준이 E8 값뿐이다 — 이 경우 E6 기준은 쓰지 않아도 되는지 확인.

## 남은 일
B 수정 확인 → C 확인 후 구현 → D 결정 후 E15부터 이식. Codex 새 검토 요청 2건(`future-advisor-face-tokens-and-dialogue-mockup`, `future-advisor-naming-and-keeper`)은 이번 지시 범위 밖이라 열어 보지 않았다.
