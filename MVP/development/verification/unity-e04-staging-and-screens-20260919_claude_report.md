# Unity 사건 4 실적용 + 연출 검증 + 화면 확장 — Claude (2026-09-19)

## 변경 기록 (DESIGN_INTENT §E 형식)
- **변경 ID**: unity-e04-staging-20260919
- **근거**: 사용자 지시("적용하고 연출 검증해줘", 이후 대화에서 사절 등장/폰트/임시 UI 화면 3종/진행 길이 노출 금지/문구 삭제) + Codex 인게임 시안 검토(`collaboration/reviews/priority-ingame-scenes-v1_claude_review.md`).
- **영향 파일**
  - Ink: `기획/04_story_bible.ink` = `Unity/My project/Assets/Resources/Ink/story_bible.ink` (두 파일 SHA-256 일치: `b3a121037975c3893f623179cf864592fd45098e9eeb7a0acdfdf8a1847d1bb1`; 변경 전 `099FC5DD…7863`). **event_04 블록만** 교체(도입 대화/의견/선택 후 반응/태그). 선택지 4개 이름, `eastWarmth` 증감, `-> event_05` 연결은 원본과 동일.
  - Unity: `Scripts/StoryController.cs`, `GameHud.cs`, `Court/{EventPhase,SeatView,HudPhasePresenter,AdvisorProfile,CourtRoster,AssetCatalog,UiFonts,TempScreens}.cs`, `Editor/{DevCaptureTools,CourtRosterBuilder,AssetCatalogBuilder}.cs`, 에셋 `Resources/{AssetCatalog,Court/*}.asset`, `Fonts/*`.
  - 문서 미갱신: `기획/04_story_bible.md`(사건 4 표)는 이번 Ink 변경을 아직 반영하지 않았다 — 스토리 문서 소유자(Codex) 확인 필요.
- **검증 방식**: inkjs 컴파일 0/0, 16조합 스윕 0 failed, E4 4개 선택 경로 실행(다음 사건 연결/eastWarmth 확인), Unity 실플레이 캡처.

## Ink 적용 내용 (사건 4 "동부 왕국의 첫 사절")
- 출처: HTML `KING_WAS_ME_KINGDOM_SLICE.html`의 `first_envoy` intro/opinions/aftermath를 이식(원문 대사 유지).
- 태그(추가 전용): `# scene: council`, `# title`, `# phase: narration|exchange|advisors|aftermath`, `# endphase`, `# to: <id>`, `# stance: question|clarify|counter|support`, `# enter: east_envoy`, `# exit: east_envoy`.
- **새로 쓴 부분(확인 필요)**: Ink에만 있고 MVP에는 없는 선택지 "추가 정보 확인"의 선택 후 반응 3줄(발렌/세르안 대사 + 서술). 나머지 3개 선택지의 반응은 MVP 원문.
- 의견 문장은 MVP의 `opinions`(세르안/발렌)로 교체했다(원래 Ink의 한 줄 대사 2개를 대체).

## Unity 구현 (사용자 피드백 반영)
| 요청 | 구현 | 확인 |
|---|---|---|
| 정적의 의도가 보이게 | 의견 카드 닫힘 + 동일 밝기 + 비네트 + 시점 확대 + 음악 낮춤 | 캡처(Toggle Royal Gaze로 유지 상태 확인) |
| 대신 등장/의견/마우스오버 확대 | 좌석 뷰 + 의견 카드(마우스오버 확대, 클릭 시 팝업, 접힌 카드는 앞 34자+…) | 캡처. 마우스오버 직접 조작은 미검증 |
| UI 구분 | 발화 팝업(탁자 앞) / 서술 박스 / 결정 카드(가로, 번호) | 캡처 |
| 2명 어색 | 좌석 수 = 현재 인원(중앙 대형 배치), 빈 의자 제거 | 캡처 |
| 대신 간 관계 | `to`/`stance`: 청자가 화자 쪽으로 기울고 반박은 화자 강조. **관계선 없음**(Codex 의견 수용) | 캡처(세르안→발렌 지지 장면에서 발렌 기울임 확인) |
| 사절 등장/대화 참여 | `AdvisorProfile.isGuest` + `# enter/exit` 태그. 중앙에 서고 대신들은 양옆으로 나뉨, 발언은 큰 팝업. 그림 없어 **임시 실루엣+이름표** | 캡처 |
| 진행 길이 노출 금지 | "사건 N/29", "ACT I~V", 기록의 "사건 N" 제거, 사건 제목(`# title`)만 표시 | 캡처 |
| 해석 예고 문구 삭제 | 제목 화면 "대신들은 저마다 다르게 읽는다", 기록 패널 "무엇을 했는지만 남는다" 삭제 | 캡처(제목 화면) |
| 폰트 | 나눔명조(세리프: 대사/제목/결정), 나눔고딕(산세리프: 라벨/기록). AssetCatalog에 연결. OS 폰트는 임시 폴백 | 캡처(서리프 적용 확인, 카탈로그 연결 0 missing). 나눔 폰트 적용 후 재캡처는 Unity 연결 끊김으로 미확인 |
| 임시 UI 화면 3종(컷신/서재 허브/지도) | `TempScreens.cs` 작성, HUD 우상단 "서재" 버튼, Ink `# scene: cutscene` 태그, `# met:` 태그로 지도에 이웃 표시 | **미컴파일/미검증** — 작성 직후 Unity 브리지가 끊겨 컴파일 결과를 못 봤다 |
- 버그 수정: 이전 사건 의견 카드 잔존, 카드 페이드 후 이름 글자 잔존, 발화 강조 시 머리가 마스크에 잘림(마스크 상단 여유 확대), 정적 때 팝업/서술 텍스트 처리.
- 개발 도구: `KingWasMe/Dev/*` — Keep Player Loop Ticking(백그라운드에서도 플레이 루프 구동), Jump to event_04, Preview Exchange/Reply Popup, Toggle Royal Gaze, Preview Screen: Cutscene/Study/Map.

## 폰트 (사용자 승인: "적절한 걸로 판단해서 직접 다운로드")
- `Assets/Fonts/NanumMyeongjo-Regular.ttf`(3,058,408 B), `NanumGothic-Regular.ttf`(2,054,744 B), 출처 github.com/google/fonts (ofl/nanummyeongjo, ofl/nanumgothic), SIL OFL 1.1, 라이선스 파일 동봉, 상세 `Assets/Fonts/FONTS.md`. Bold는 미포함(합성).

## 임시 UI (Codex 에셋으로 교체 예정, 사용자가 요청 예정)
- 사절 실루엣 → 사절 서 있는 포즈 스프라이트(`AdvisorProfile.seatedPoses`)
- 컷신 스틸(현재 Act 배경 재사용), 서재/지도 화면의 패널·프레임·배경 일러스트, 지도 노드/길 아이콘
- 좌석 포즈(현재는 서 있는 전신 초상을 하단 20% 마스크로 자름)
- 시안 반영 제외 항목(수치/친밀도/2인칭/진행 카운터/선택지 부제/진영 라벨)은 임시 UI에도 없음.

## 미검증/남은 일
- `TempScreens` 컴파일·화면 확인, 나눔 폰트 적용 재캡처(Unity 브리지 복구 필요: MCP Unity 창 "Start Server" 또는 Unity 재시작).
- 마우스오버 확대/클릭 팝업 직접 조작, 5명 이상 레이아웃, 좌우 팬(미구현), 사운드 낮춤 실청, 다양한 해상도.
- 사건 번호 기반 Act 구간(배경/음악)을 태그 기반으로 전환(사건이 늘고 분기/건너뛰기가 생기므로).
- 서재 허브/지도는 사용자 지시로 임시 구현했으나 기획상 구조 결정(허브가 사건 흐름에 들어가는 시점, 지도에 표시할 정보)은 아직 미정 — 지금은 HUD 버튼으로만 접근.
