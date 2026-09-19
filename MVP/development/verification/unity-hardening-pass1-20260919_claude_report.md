# Unity 하드닝 1차 — Claude (2026-09-19)

대상: `Unity/My project/Assets/Scripts/StoryController.cs` (Ink/에셋/기획 문서 변경 없음)

## 변경
- 입력 잠금(`inputLocked`): 선택/재시작 클릭 후 다음 화면 생성까지 입력 무시(Destroy 지연으로 인한 중복 클릭 방지).
- 오류 표면화: `story.onError` 구독, `AdvanceStory`/`ChooseChoiceIndex` try-catch, 화면에 오류 문구 + "처음부터 다시 시작" 버튼.
- `story.variablesState` 조회 예외 보호(대신 소개 변수).
- 키보드: 대사 대기 Space/Enter, 선택지 대기 1~9.
- 제목 화면 동안 "▼ 클릭해서 계속"/진행 캐처 비활성.
- `RestartStory()`로 재시작 경로 통일(`lastEventPath`도 초기화).

## 검증
- 컴파일 0 에러/0 경고.
- Play: StartGame → AutoPlay200, 사건 19까지 콘솔 에러 0, 화면 정상(캡처 확인).
- **미검증**: 키보드 입력(Space/Enter/숫자)과 제목 화면 프롬프트 비침 — 실제 화면/입력으로 확인 못 함. 오류 화면 경로(ShowFatal) 강제 발생 테스트 안 함.

## 남은 하드닝
AssetCatalog(빌드 가능 경로), 배경 종횡비 fill, Enter Play Mode Options, 대신 명단 데이터화.

## 추가: 데이터 기반 대신 명단 (같은 날)
- 신규: `Scripts/Court/AdvisorProfile.cs`, `CourtRoster.cs`, `Editor/CourtRosterBuilder.cs`(메뉴 `KingWasMe/Court/Build or Update Roster Assets`).
- 에셋: `Assets/Resources/Court/CourtRoster.asset` + `Advisor_{seran,valen,rian,karden}.asset`. 초상은 스프라이트 참조(GUID)라 `AI_Generated` 폴더 이동에 안전.
- `GameHud`: 4칸 고정 제거 → 가로 레이아웃 카드 줄, 소개된 대신만 표시("? ? ?" 자리표시 제거). `StoryController`: 소개 변수·대사 색을 명단에서 조회. 에셋이 없으면 코드 내 기본 4인으로 폴백.
- 검증: 컴파일 0/0, Play 사건 19까지 콘솔 오류 0, 4명 카드+초상 표시 캡처 확인.
- **미검증**: 5명 이상 카드 줄, 좌석 뷰(미구현), 빌드에서의 동작(빌드는 별도 과제).

## 추가: AssetCatalog + 단계 러너 1차
- 1-c AssetCatalog: Scripts/Court/AssetCatalog.cs, Editor/AssetCatalogBuilder.cs(메뉴 KingWasMe/Court/Build or Update Asset Catalog), 에셋 Resources/AssetCatalog.asset.
  Act별 배경/음악/앰비언스 + UI 사운드 + Ink 스토리(InkFile)를 직렬화 참조로 보관 -> StoryController에서 AssetDatabase/#if UNITY_EDITOR/하드코딩 파일명 전부 제거(빌드 가능 경로 확보; 스탠드얼론 빌드 자체는 미시도).
  검증: 컴파일 0/0, 찾지 못한 항목 0, Play 사건 19까지 오류 0, 배경/초상 표시 동일. 미검증: 오디오 실제 재생(귀로 확인 못함), 스탠드얼론 빌드.
  남음: 배경 종횡비 fill, Enter Play Mode Options.
- 1-d 단계 러너 1차: Scripts/Court/EventPhase.cs(EventPhase enum, StoryBeat, BeatParser, IPhasePresenter), HudPhasePresenter.cs. StoryController가 줄을 StoryBeat로 파싱(Ink 태그 지원).
  ROYAL_PAUSE 구현: 선택지 직전 1.4초(태그 `# pause: N`으로 조절) 동안 입력 잠금, 모든 소개된 대신 카드 동일 밝기(왕을 봄), 텍스트 톤만 낮춤, 진행 프롬프트/선택지 숨김. 예고 문구 없음(§28.1).
  Ink 태그 형식(추가 전용, 없으면 추론): `# phase: advisors|exchange|pause|aftermath|narration`, `# pause: 1.5`, `# gaze: king|<id>`, `# pose: speaking|turn_left|turn_right|thinking`. 태그 없는 기존 Ink는 그대로 동작(화자 접두어=AdvisorSummary, 그 외=Narration, 선택 직전=RoyalPause 자동).
  -> Codex 확인 요청: 위 태그 형식으로 Ink 콘텐츠를 쓸 수 있는지(Ink 소유자 합의 필요, 아직 Ink는 수정하지 않음).
  검증: 사건 1 실제 화면 캡처로 정적 상태(카드 균일 점등, 선택지 없음) -> 1.4초 뒤 선택지 확인, 자동 진행 사건 3까지 오류 0. 미검증: phase/pause 태그 경로(Ink에 태그 없음), 5인 이상, 사운드 낮춤(정적 중 오디오 처리 미구현).

## 추가: 좌석 뷰 1차 (사용자 피드백 반영)
사용자 피드백(2026-09-19): (1) 정적의 의도가 화면에 안 보임 (2) MVP처럼 대신들이 화면에 등장해 의견을 내고, 마우스오버로 확대되는 연출 필요 (3) 대신이 2명뿐인 화면 어색, UI가 구겨짐 -> 대신 발언 큰 팝업 UI와 선택 버튼 UI를 분리. 예시 이미지 제공(큰 반신 인물 + 탁자 위 의견 카드 + 하단 가로 결정 바). 추가 제안: 대신이 많아지면 좌우 화살표로 회의실을 둘러보는 연출(배경 파노라마는 필수 아님).
구현(Scripts/Court/SeatView.cs, GameHud/StoryController 연동):
- 대신 카드 줄 삭제 -> 좌석 뷰: 소개된 대신이 큰 인물로 착석(부채꼴 배치, 등장 애니메이션), 미소개 좌석은 빈 의자 자리(이름표/물음표 없음). 좌석 수 = max(4, 로스터).
- 의견 카드(탁자 앞): 이름·역할 + 의견 -> 마우스오버 시 확대(전문), 클릭 시 큰 발언 팝업(이름표+꼬리, 화자 위치 추종).
- 발언 팝업: CourtExchange 단계에서도 사용(코드 있음, 태그 Ink 없어 미검증).
- 선택지: 하단 가로 결정 카드(어두운 판+금색 테두리+번호). 키보드 1~9 유지.
- 왕의 정적 연출(의도 표현): 의견 카드 닫힘 + 모든 대신 동일 밝기 + 가장자리 비네트 + 시점 확대(6%) + 음악/앰비언스 35%로 낮춤(0.8초 페이드) + 텍스트 톤 다운. 정적이 끝나면 의견 카드가 돌아와 선택하며 다시 읽을 수 있다.
- 서술 텍스트는 상단 박스로 이동, 의견 줄(화자 접두어)은 개별 클릭 대신 카드로 한 번에 표시.
- 발견/수정한 버그: 이전 사건의 의견 카드가 다음 사건에 남음(ClearOpinions가 카드를 숨기지 않음) -> 수정. 리치텍스트 색 때문에 카드 페이드 후 이름이 남음 -> CanvasGroup으로 수정.
- 검증 환경 발견: Application.runInBackground=false라 에디터 비포커스 시 플레이 루프가 멈춘다(Time.frameCount 고정) -> 캡처가 갱신 전 상태로 찍힘. DevCaptureTools에 "Keep Player Loop Ticking (toggle)" 메뉴 추가(runInBackground=true + 루프 강제 갱신). 이후 캡처는 이 메뉴를 켠 뒤 촬영. 이전에 "캡처로 확인"한 정적(Royal Pause) 화면은 애니메이션 진행 없이 첫 프레임 상태였을 수 있음(이번 좌석 뷰 버전은 루프 구동 상태에서 재확인).
- 확인 완료: 사건 1~2에서 의견 카드 표시/이전 카드 제거, 결정 카드 가로 배치, 정적(gaze hold)에서 카드 닫힘·비네트·점등·시점 확대 캡처.
- 미검증: 마우스오버 확대와 클릭 팝업의 정상 상호작용(사용자 플레이에서 팝업은 관찰됨, 제가 직접 조작 검증은 아님), 5명 이상 레이아웃, 좌우 팬(미구현), 사운드 낮춤 실청, 다양한 해상도.
- 데이터 준수: 예시 이미지의 수치 표시(국고/민심/경계/피로), "당신의 판단은?" 2인칭 문구, 선택지 부제(결과 설명)는 §12.1/§20·§28.1/§7.2 충돌이라 채택하지 않음.
