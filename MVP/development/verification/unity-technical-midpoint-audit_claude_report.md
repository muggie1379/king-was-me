# Unity 기술 중간점검 — Claude 독립 감사 (2026-09-19)

- Work ID: `unity-technical-midpoint-audit`
- 요청: Codex 작성 점검 프롬프트(사용자 전달) — 점검 전용, 게임 코드/Ink/스토리/에셋 무수정
- 대상: `E:\KING WAS ME\Unity\My project\` (Unity 6000.1.4f1, `SampleScene`)
- 방식: 직접 실행·에디터 상태로 확인한 것만 PASS. 과거 보고서의 PASS는 인용하지 않고 재검증. 추론은 PASS로 쓰지 않음.
- 상태 표기: `PASS` / `PARTIAL` / `FAIL` / `NOT TESTED` / `DEFERRED`
- 함께 참고한 것(판단 근거로만 사용, PASS 근거 아님): `unity-story-midpoint-audit-20260919_codex_report.md`, `unity-story-parity-consolidated-audit-20260919_codex_report.md`, 제 `story-midpoint-audit_claude_double-check_20260919.md`

---

## 1. 종합 판정

**Unity 작업은 "건강하게 진행 중"이지만 아직 "플레이 가능한 초안(에디터 전용)" 단계다.** 기술 데모는 넘었고(29개 사건 기본 경로가 처음부터 끝까지 클릭으로 재생되고 재시작도 동작), 내러티브 MVP나 배포 후보는 아니다.

- 잘 되는 것: 컴파일 0 오류/0 경고, Play 진입·종료 후 씬 무손상, Ink 원본과 바이트 동일, 기본 경로 완주·재시작, 배경/초상/음악 연결, 좁은 창(945×435)에서도 선택지 5개 표시.
- 다음 단계의 실제 병목은 버그가 아니라 **구조**다: 사건을 단계(의견 종합 → 논쟁 → 왕의 정적 → 선택 → 결과)로 재생하는 상태 구조가 없고, 연출·에셋 정보가 코드에 하드코딩돼 있으며, 빌드 경로가 없다.
- 사용자 방향(MVP 복제가 아니라 Unity 고유의 컷씬·애니메이션·연출 활용)에 비추면, 지금의 "코드로 UI를 생성하는 단일 컨트롤러" 구조는 **연출 확장에 부적합**하다. 프로젝트에 이미 `com.unity.timeline 1.8.7`과 `com.unity.2d.animation 10.2.0`이 있어 도구는 갖춰져 있다.

## 2. P0 — 다음 기능 작업 전에 반드시 해결

| # | 문제 | 근거 | 권장 |
|---|---|---|---|
| P0-1 | **사건 재생 구조 부재**: 현재는 `DIALOGUE → CHOICE` 2단계이며 사건 단계 개념이 없다. 이 위에 기능을 얹으면 `StoryController`가 계속 커진다. | `StoryController.cs` 595줄; `AdvanceStory`/`ShowNextLine`/`ShowChoicesOrEnd`가 유일한 흐름. Codex 통합 보고서의 `ADVISOR_SUMMARY → … → AFTERMATH`와 같은 진단 | 콘텐츠 작성 전에 **사건 단계 모델 + Ink 태그/데이터 형식**부터 결정(§3, §8-1). |
| P0-2 | **에디터 검증 환경 불안정**: 도메인 리로드(컴파일/Play 진입) 때 MCP 브리지 서버가 자기 자신의 낡은 리스너와 포트 충돌(`Port 8095 is already in use`)로 시작 실패 → 자동 검증이 반복해서 끊김. | Editor.log에 8095 충돌 반복; `netstat`상 8095를 Unity 프로세스 자신(PID 31920)이 LISTENING, 새 서버는 10회 재시도 후 포기. 에디터 재시작 후에도 제 컴파일 검증 한 번에 다시 끊김(재현 2회). | Enter Play Mode Options(도메인 리로드 비활성) 검토, MCP Unity 서버 설정 점검. 원인 확정 전까지 라이브 검증은 리로드 최소화. |

## 3. P1 — MVP 테스트 전에 해결

| # | 문제 | 근거 | 권장 |
|---|---|---|---|
| P1-1 | **스탠드얼론 빌드 불가**(에디터 전용) | `Awake()`의 `#if UNITY_EDITOR` else 분기가 "이 드래프트는 에디터 전용입니다"만 출력. Ink/배경/초상/오디오 전부 `AssetDatabase.LoadAssetAtPath`. 빌드에서 살아남는 것은 `ProceduralAudio` 폴백뿐. | `ActProfile`/`EventPresentation` ScriptableObject가 Sprite/AudioClip/Ink를 직렬화 참조하도록 전환(자동으로 빌드 포함). Ink는 `Resources` 또는 참조 필드. |
| P1-2 | **클릭 잠금·예외 표면화 없음** | `AddListener` 2곳, `RemoveListener`/`OnDestroy`/`try` 0건. `RefreshAdvisors`는 Ink 변수명이 바뀌면 예외(`story.variablesState[...]`)로 진행 중단. `story.Continue()` 오류를 잡지 않아 플레이어는 멈춘 화면만 본다. 빠른 연속 호출 시 파괴 대기 중인 낡은 버튼의 `onClick`이 실행될 수 있음(§4-9). | 전환 중 입력 잠금 플래그, `story.onError` 처리와 플레이어용 오류 화면, 변수 조회 방어. |
| P1-3 | **대신 UI가 4명 고정** | `GameHud.Advisors`가 정적 배열 4개, 카드 위치 상수(startX/cardW/gap). Full Game은 Watcher/Chaplain/Fool 등 확장 예정(사용자: "4개가 끝이 아님"). "? ? ?" 슬롯은 인원을 미리 노출. | 데이터 기반 대신 명단(`AdvisorProfile` 목록) + 동적 레이아웃(§8-2). |
| P1-4 | **에셋 관리 규칙 없음, 중복·버전 혼재** | 해시 동일 중복 3쌍(`advisor_seran.png`=`Characters/Seran/seran_base_portrait_v1.png`, `advisor_karden_v3.png`=`Karden/Candidates/karden_female_candidate_v1.png`, `act01…png`=`council_gallery/clear_sunrise.png`). `advisor_karden.png`(v1)/`_v2`(남)/`_v3`(선택). 코드는 파일명 문자열을 직접 참조. | Runtime / Candidates / Archive 폴더 규칙, 선택본 표식, 코드의 파일명 하드코딩을 카탈로그로 이동. |
| P1-5 | **`ASSET_MANIFEST.md`가 현재 상태와 불일치** | "No audio files were generated", "Not connected to runtime code"라고 적혀 있으나 실제로는 ElevenLabs 음악/앰비언스/UI 사운드 12개와 배경·초상 연결이 존재. 오디오 출처·라이선스(유료 플랜에서 생성, 무료 시절 파일은 `old/`로 이동) 항목 없음. Karden v3 선택 기록 없음. | 매니페스트에 오디오 섹션(도구·플랜·생성일·라이선스 주의)과 선택본/연결 상태 반영(Codex 소유 문서). |
| P1-5b | **한글 폰트가 빌드에서 보장되지 않음** | 모든 Text가 `LegacyRuntime.ttf`(OS 폴백 의존). Windows 에디터에서는 표시되지만 빌드/타 환경 보장 없음. | 빌드 전에 한글 지원 폰트 에셋 포함(TMP 전환 시 SDF 폰트, 폰트 라이선스 확인). |
| P1-6 | **죽은 변수·미구현 개발용 상태 화면** | Ink: 전역 7축(initiative…warmth) 선언만 있고 대입 0·읽기 0. `eastPressure`(대입 6·읽기 0), `north_deescalate`(대입 1·읽기 0)도 읽는 곳이 없다. Unity에는 상태 확인 패널이 없다. | 개발용 상태 패널 + 실제 쓰는 값만 유지하는 결정(Codex 통합 보고서 2단계와 일치). |
| P1-7 | **버전 관리·백업 없음** | `Unity/My project`와 `KING WAS ME` 모두 `.git`/`.gitignore` 없음. 복귀 지점은 HTML용 `_history`뿐. | 초기화 시점에 `.gitignore`(Library/Temp/Logs/UserSettings/obj) 준비. 주의: DotSoccer 공개 저장소에 섞지 말 것. |
| P1-8 | **배경 왜곡(비 16:9)** | 배경 `Image.preserveAspect=false`로 캔버스 전체에 늘림. 945×435 캡처에서 가로로 늘어남. 16:9에서는 정상. | 종횡비 유지 채우기(자르기) 방식. |
| P1-9 | **키보드 진행 미구현** | 코드 주석은 "click/space"라 쓰지만 키 입력 처리 없음(`Keyboard/InputAction/KeyCode` 실사용 0). | 입력 액션 추가 또는 주석 정정. |

## 4. P2 — 이후 제작 단계에서 해결 가능

- ACT 전환이 배경 스프라이트 즉시 교체 + 색 틴트 0.6초 lerp + 오디오 즉시 교체(교차 페이드 없음). 컷씬 단계에서 연출로 대체될 예정.
- 30초 음악 루프의 이음매가 하드 컷일 수 있음(생성물 특성, 청취 미검증).
- 텍스처: 40개 PNG 모두 `Sprite / Multiple / Max 2048 / 밉맵 없음 / 읽기 불가 / Bilinear`. 1672×941 등 4의 배수가 아닌 크기는 블록 압축 불가(추정: 미압축 RGBA32, 장당 약 6.3MB) — **실측 아님**.
- Unity AI 패키지(`com.unity.ai.assistant`)가 약 0.4초마다 `NoSubscription` 로그를 콘솔에 누적(게임과 무관한 노이즈).
- 런타임에 만드는 `ProceduralAudio` 클립·`Sprite.Create`는 파괴하지 않음(수명이 짧은 현재 규모에서는 무시 가능).
- 저장/불러오기, 2회차(Second Reading), 엔딩 연출, 여러 UI 형식: 아직 미구현(§8, §9).

---

## 5. 체크리스트 표

### 5.1 프로젝트 기본 건강 상태

| 항목 | 상태 | 직접 확인 근거 | 영향 | 권장 |
|---|---|---|---|---|
| Unity 프로젝트가 정상적으로 열림 | PASS | Unity 6000.1.4f1 프로세스 정상, 이번 점검 중 2회 재시작 후에도 열림 | — | — |
| 버전·패키지 의존성 기록 | PARTIAL | `ProjectVersion.txt`, `manifest.json`, `packages-lock.json`에 해시 고정(ink `73cc1479…`, mcp-unity `382a43a3…`). 두 패키지는 git URL(네트워크 필요) | 재현에 네트워크 필요 | 유지, 오프라인 재현 필요 시 로컬 미러 |
| Console compile error/exception/warning | PASS | `recompile_scripts`: 0 오류/0 경고. 콘솔에는 Unity AI `NoSubscription` 정보 로그만 | 노이즈 | AI 패키지 제거 검토 |
| 브리지(MCP) 서버 안정성 | FAIL | 리로드 후 `Port 8095 is already in use`, 서버 미기동 재현 2회 | 자동 검증 불안정 | P0-2 |
| SampleScene 열림 + Play 진입 | PASS | 편집/Play 모두 확인, 씬 정보 정상 | — | — |
| 필수 오브젝트 | PASS | 루트 3개(Main Camera, Global Light 2D, StoryController); Play 시 EventSystem 1, UICanvas 1 생성 | — | — |
| Missing Component 없음 | PASS | 편집 모드 계층에서 모든 컴포넌트 타입 해석됨(StoryController 포함) | — | — |
| Play 종료 후 씬/에디터 손상 없음 | PASS | 종료 후 `Is Dirty: false`, 루트 3개 유지(2회 측정) | — | — |
| 재실행 후 같은 결과 | PASS | 에디터 2회 재시작 후 Play·계층·오브젝트 동일 | — | — |
| 자동 생성 UI 중복/누적 없음 | PARTIAL | 정상 속도: 중복 없음(EventSystem 1/UICanvas 1). 자동 입력이 프레임보다 빠를 때 `ChoicesContainer`에 낡은 버튼 239개가 누적(§5.4, 5.10) | 실플레이 영향은 미확인 | P1-2 |

### 5.2 Ink 파이프라인

| 항목 | 상태 | 직접 확인 근거 | 영향 | 권장 |
|---|---|---|---|---|
| `기획/04_story_bible.ink` = Unity `Resources/Ink/story_bible.ink` | PASS | 두 파일 SHA256 동일 `099FC5DD…7863`, `cmp` 일치 | — | — |
| Unity에서 오류 없이 컴파일 | PASS | 게임이 `InkFile.storyJson`으로 실행됨, 콘솔에 Ink 오류 없음 | — | — |
| 첫 사건부터 엔딩까지 실제 클릭 도달 | PASS(기본 경로 한정) | 자동 클릭으로 E1→E19→…→종료 후 자동 재시작해 E1부터 재진입 확인. **엔딩 장면 자체는 캡처하지 못함** | — | 엔딩 캡처는 별도 |
| 대표 6경로 Unity 실행 | PARTIAL | Unity에서는 기본 경로(항상 첫 선택)만 실행. 나머지 5경로(pause_contact / south_hardline / 북부 발생 / 북부 스킵 / royal_visit)는 기존 개발 메뉴로 선택 지정 불가 → 코드 수정 없이는 불가. **Ink 런타임(inkjs) 16조합 스윕은 전부 통과**(이는 Unity 클릭 검증이 아님) | 분기 Unity 표시 미확인 | 선택 지정 개발 도구 필요(별도 승인) |
| 29개 사건 전체 클릭 vs 대표 경로 구분 | PARTIAL | 기본 경로 상 사건 진행은 확인. 사건별 화면 육안 점검은 E1, E6, E11, E19, E23만 | 커버리지 제한 | 위와 동일 |
| 재시작이 Ink 상태/기록/소개/ACT를 초기화 | PARTIAL | 재시작 후 기록 패널이 사건 1부터 다시 쌓임(이전 기록 소거), 카르덴이 "? ? ?"로 복귀(소개 상태 초기화), ACT II 정상 진행. 재시작 직후 ACT I 표시/배경·음악 초기화는 직접 관찰하지 못함 | — | ACT 초기화 직접 확인 |
| 선택지 클릭 중복 처리 없음 | NOT TESTED | 실제 더블클릭을 재현하지 않음. 코드에 클릭 잠금 없음(§5.3) | 전략 분기 오확정 위험 | P1-2 |
| 분기 후 이전 선택지/텍스트 잔존 없음 | PARTIAL | 정상 캡처(E1→E2, E6, E11, E19, E23)에서는 잔존 없음. 빠른 자동 입력에서는 낡은 버튼 누적 | — | P1-2 |
| Ink import/재컴파일 후 에셋 갱신 | PARTIAL | `Ink import complete` 로그와 재실행 시 동작 확인. E23 새 답변이 Unity에서 클릭으로 표시되는지는 미확인(inkjs로만 확인) | — | 경로 지정 도구 |

### 5.3 StoryController 구조 (코드 정독, `StoryController.cs` 595줄 / `GameHud.cs` 246줄)

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 한 클래스가 너무 많은 책임 | PARTIAL | UI 조립(`BuildUI` ≈ 150줄), 오디오(3 AudioSource+로딩), 에셋 로딩, Ink 진행, ACT 무드, 기록·HUD 연동이 한 클래스. HUD는 `GameHud`로 일부 분리됨 | 지금 규모(1,000줄 미만)는 유지 가능. 기능 추가 시 급증 | **지금 필요한 분리 / 나중 분리**는 §6 |
| 다음 기능의 병목 | PARTIAL | 초상: 카드 고정 4칸. 장면별 배경: 사건 번호→ACT 표에 묶임. 특수 엔딩: 훅 없음. 저장: 기록·ACT는 Ink 밖 상태. 2회차: 색/문구 하드코딩. 여러 UI 형식: 전부 코드 생성 | §6 표 | — |
| `UNITY_EDITOR` vs 빌드 분리 | FAIL | 게임플레이 클래스 안에 인라인 `#if UNITY_EDITOR` 5블록, 빌드 분기는 안내 문구뿐 | 빌드 불가 | P1-1 |
| 에셋 경로 하드코딩 | PARTIAL | `Assets/Resources/Ink/story_bible.ink`, `Assets/AI_Generated/{Images,Images/Characters,Audio}/` 접두사 3곳 + 파일명 상수 12개(ActMoods 5행 + 초상 4 + UI 사운드 2) | 이름 변경 시 조용히 폴백/실패 | 카탈로그 |
| 사건 번호만으로 연출 판단 | PARTIAL | `event_(\d+)` 정규식으로 ACT 결정, `bridge_*`는 무시. 현재 29개+변형에선 동작하나, 사건별 배경/컷씬/음악을 개별 지정하려면 태그가 필요 | 확장 시 취약 | Ink 태그(`# act:` `# scene:` `# phase:`) |
| 수명주기·리스너 정리 | PARTIAL | `OnDestroy` 없음, `RemoveListener` 없음, 코루틴은 교체 시 정지. 캐시는 인스턴스 필드(정적 아님)라 재시작 후 잔존 문제 없음. 런타임 생성 클립/스프라이트 미파괴 | 현재 단일 수명에서는 문제 없음 | OnDestroy 정리 |
| 예외 시 플레이어가 상태를 이해 | FAIL | `try/catch` 0, `story.onError` 미처리, Ink 변수 조회 방어 없음 | 멈춘 화면 | P1-2 |
| 코드 분리 시점 | — | 판단은 §6 | — | — |

### 5.4 UI · 입력 · 해상도 (직접 캡처: 개발 도구로 캔버스를 임시 카메라에 렌더링)

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 1280×720 | PASS | 첫 화면, 사건 1, 사건 11, 사건 19, 사건 23(선택지 5개) 캡처 확인. 본문/선택지 잘림 없음 | — | — |
| 945×435(좁고 낮은 창) | PASS | 사건 23 선택지 5개 글자 정상(깨끗한 상태에서 재확인). 사용자 실플레이에서 처음 제보된 "글자 사라짐"은 `screenMatchMode=Expand`+`verticalOverflow=Overflow`+버튼 최소 높이로 수정됨 | — | — |
| 1920×1080 / 2560×1440 | NOT TESTED | 개발 도구는 1280×720과 945×435만 지원(도구 수정은 점검 범위 밖). 같은 16:9라 Expand 스케일링상 동일 배치일 것이라는 것은 **추정** | — | 캡처 크기 추가 |
| 16:10 | NOT TESTED | 위와 동일 | — | — |
| 긴 한국어 문장 + 선택지 5개 동시 | PARTIAL | 사건 23(본문 2줄 + 선택지 5개)은 확인. 더 긴 선택지 문장(2줄 줄바꿈) 사례는 현재 Ink에 없어 검증 대상 없음 | — | — |
| 본문 스크롤 | NOT TESTED | 본문이 한 줄씩 교체돼 스크롤이 필요한 길이가 나오지 않음 | — | — |
| 클릭 영역 · 배경 클릭 진행과 선택지 충돌 | PARTIAL | 코드상 선택지 모드에서 배경 클릭 캐처 비활성. 사용자 실플레이에서 사건 23까지 진행됨. 자동 입력에서는 낡은 버튼 클릭 발생 | 오확정 위험 | 잠금/확인 |
| 키보드·마우스 입력 | FAIL(키보드) / PASS(마우스) | 마우스: 실플레이 확인. 키보드: 처리 코드 없음(주석은 space 언급) | 접근성 | P1-9 |
| EventSystem 중복 | PASS | 계층에서 1개 | — | — |
| UI 스케일 | PASS | 16:9와 2.17:1 두 비율에서 CanvasScaler `Expand`로 안정 | — | — |
| ACT 표시·기록 패널 가독성 | PARTIAL | 캡처상 읽힘. 기록 본문 17pt(기준해상도), 좁은 창에서 작음. 기록 10개 초과 시 최근 9개만 | 소형 창 가독 | 글자 크기 옵션 |
| 배경 이미지 왜곡 | PARTIAL | 16:9 정상, 2.17:1에서 가로로 늘어남(P1-8) | — | 종횡비 유지 |
| 색 대비 | PARTIAL | 본문 패널 알파 0.5 위 흰 글자로 육안 양호. 대비비 수치 측정 없음 | — | — |
| 작은 글씨 | PARTIAL | 카드 직함 15pt, 기록 부제 14pt, "클릭해서 계속" 18pt | — | — |
| 가장자리 여백 | PASS | 육안 확인 | — | — |
| 제목 화면 뒤 "▼ 클릭해서 계속" 프롬프트 비침 | FAIL(경미) | 첫 화면 캡처에서 확인 | 시각 결함 | 제목 표시 중 숨김 |

### 5.5 게임 진행 감각 (상호작용만; 스토리 품질 제외)

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 클릭 한 번에 한 줄 진행 | PASS | 자동 클릭·사용자 실플레이 모두 한 줄씩 진행 | — | — |
| 클릭 가능/선택 상태 구분 | PARTIAL | 진행 프롬프트("▼")와 선택 버튼 모드가 명확히 다름. 호버 피드백은 색조 전환 | — | — |
| 지금 무엇을 눌러야 하는지 | PARTIAL | 진행 프롬프트가 우하단에 작게 표시. 버튼은 명확 | — | — |
| 선택 후 반응 즉시 | PARTIAL | 클릭음 + 즉시 텍스트 교체. 시각 반응(애니메이션) 없음 | 체감 약함 | 연출 |
| 사건 전환 인지 | FAIL | 사건 전환 표시는 상단 "사건 N/29" 숫자 변화뿐 | 전환 감각 없음 | 컷/전환 연출 |
| ACT 전환 인지 | PARTIAL | 색 틴트 0.6초 + 배경 즉시 교체 + 음악 즉시 교체 — 갑작스러움 | — | 교차 페이드 |
| 29개 사건 동안 피로 | NOT TESTED | 사람의 플레이 감각 필요 | — | 블라인드/사용자 테스트 |
| 시선이 같은 곳에 머무름 | PARTIAL | 본문 위치 고정. 말하는 대신 카드 강조는 상단, 본문은 아래로 시선 이동 | — | 말풍선/좌석 연출 |
| 잘못 눌러 의도치 않은 확정 | PARTIAL(위험) | 선택은 한 번 클릭 즉시 확정, 확인 단계·입력 잠금 없음. 강한 분기(예: 교류 중단)도 동일 | 오확정 | 강한 분기 확인/짧은 입력 잠금 |
| 선택 기록 패널의 효용 | PARTIAL | 선택 이력이 남아 결과 체감에 도움. 항상 우측 20% 차지, 결과(관찰)는 없고 선택 문구만 | — | 결과 연결 기록 |

### 5.6 배경 · 초상 · UI 에셋

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| ACT별 배경 로드 | PARTIAL | ACT I, II, III, IV 캡처에서 실제 표시 확인. ACT V는 이번 점검에서 화면 확인 못 함(파일·메타 정상) | — | ACT V 캡처 |
| 배경 전환 깨짐/번쩍임/빈 프레임 | PARTIAL | 캡처에서 깨짐 없음. 프레임 단위 번쩍임 검사는 도구 한계로 NOT TESTED | — | — |
| 배경 종횡비 | PARTIAL | §5.4 |  | P1-8 |
| 배경-텍스트 대비 | PASS | 본문 패널 알파 0.5로 모든 캡처에서 가독 | — | — |
| import 설정 | PARTIAL | 40개 PNG 동일 설정(Sprite/Multiple/2048/밉맵 없음/읽기 불가/Bilinear/`alphaIsTransparency`). Multiple 스프라이트 모드가 단일 이미지에 쓰임(코드는 `Texture2D`로 로드해 우회). 압축 결과는 미확인 | 메모리 | Single 모드/압축 형식 결정 |
| 초상 연결 상태 | PASS(전제와 다름) | 요청 전제("아직 연결되지 않음")와 달리 **이미 연결됨**: 카드에 v2 3명 + Karden v3, 정사각 상단 크롭, 미소개 시 실루엣. 캡처로 확인 | — | — |
| 선택된 카르덴 파일 | PASS | 코드가 `advisor_karden_v3.png` 사용, 캡처에서 여성 카르덴 확인 | — | — |
| 여러 버전 혼재로 잘못 연결될 위험 | FAIL(위험) | §3 P1-4 | 오연결 | 폴더 규칙 |
| `.meta` 누락/미임포트 | PASS | `AI_Generated` 하위 60개 파일 모두 `.meta` 존재 | — | — |
| 런타임 vs 후보/보관 폴더 규칙 | FAIL(부재) | 후보는 `Characters/Karden/Candidates/`만, 나머지 규칙 없음 | 혼재 | 규칙 필요 |
| 대신 UI 공간·구조(확장성) | FAIL(확장성) | 카드 4칸 고정, 초상은 정사각 크롭 한 종류 | 사용자 요구(대신 4명 이상, 회의 좌석 연출) 불충족 | §8-2 |

### 5.7 오디오

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| ambient/music 12개 정상 import | PASS | 12개 mp3 모두 `.meta` 있음(Vorbis, Decompress On Load) | — | — |
| 실제 AudioClip 로드 | PARTIAL | ACT I·ACT II에서 `act01_*`, `act02_*`가 실제 AudioSource에 할당·재생 확인(`isPlaying: true`, `loop: true`). ACT III–V는 이번 점검에서 재생 확인 못 함 | — | — |
| AI 오디오 없을 때 절차적 폴백 | NOT TESTED | 폴백 코드는 있으나 파일을 치워 실행해 보지 않음(점검 중 에셋 이동 금지) | 빌드에서 유일한 소리 | — |
| ACT 전환 시 이전 음악/환경음 교체 | PASS(교체) / PARTIAL(품질) | 재시작 후 ACT II에서 music/ambient가 각각 `act02_*`로 교체돼 재생. 교차 페이드 없이 즉시 교체 | 갑작스러움 | P2 |
| 중복 재생·끊김·볼륨 급변 | PARTIAL | AudioSource 3개(음악/앰비언스/UI)로 중복 없음. 볼륨 급변은 청취 검증 불가 | — | — |
| UI 클릭/선택음 반복 | PARTIAL | 모든 줄 넘김·선택에서 0.5초 효과음. 청취 검증 불가 | 피로 가능 | 사용자 청취 |
| 음원 길이/loop | PARTIAL | ambient 5초, music 30초 루프. 이음매 청취 검증 불가 | — | — |
| 합산 음량이 읽기를 방해 | NOT TESTED | 음량 측정·청취 불가 | — | — |
| 에디터에서만 작동하는가 | FAIL | `LoadAiAudioClip`이 빌드에서 null → 빌드에서는 절차적 사인파만 | 빌드 | P1-1 |
| 오디오 라이선스·출처 추적 | FAIL | 매니페스트에 없음. `elevenlabs-audio-20260919_claude_report.md`에만 기록(Starter 유료 플랜 생성, 무료 시절 파일 `old/`로 이동, 무료 플랜 상업 사용 불가 주의) | 출시 시 법적 근거 | P1-5 |

### 5.8 엔딩 표현 가능성 (Ink 텍스트 정독 + 실행 경로 확인)

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| `KING WAS YOU` | PARTIAL | Ink `king_was_you` 노드의 한 줄 텍스트로 같은 본문 창에 출력 | 전용 타이틀 연출 없음 | 아래 최소 구조 |
| 휴대폰 `뭐해?` | PARTIAL | "휴대폰에 짧은 메시지. 뭐해?" 지문+대사 한 줄, 소품/화면 없음 | — | — |
| 궁정 복귀 | PARTIAL | 대신 대사 여러 줄이 일반 텍스트로 재생(각 대신 카드 강조는 동작) | 왕좌 응시 연출 없음 | — |
| 빈 왕좌 | FAIL | "카메라가 왕의 자리로 이동한다. 왕좌가 비어 있다. **설명하지 않는다.**"가 그대로 출력(연출 지시문이 플레이어 텍스트로 노출) | 스포일러성 메모 노출 | — |
| 1인칭 왕좌 이동 | FAIL | "발걸음. 카메라가 플레이어 시점으로 이동한다. 왕좌까지 걷는다…"가 지문으로 출력 | 핵심 연출 부재 | — |
| `내가 결정하지.` | PARTIAL | 순서는 맞으나 다른 줄과 같은 방식으로 출력 | 펀치 약화 | — |
| `KING WAS ME` | PARTIAL | `final_line`에서 "암전." 뒤 텍스트 한 줄 | 최종 타이틀 연출 없음 | — |

**필요한 최소 구조(구현하지 않음, 제안만)**: (1) Ink 태그로 연출 명령 전달(`# stage:king_was_you`, `# stage:phone`, `# stage:throne`, `# stage:walk`, `# voice:final`), (2) `EndingDirector`(코루틴 또는 Timeline `PlayableDirector`)가 태그를 받아 단계 재생, (3) 전체 화면 전환 레이어(페이드/암전), (4) 휴대폰 UI 프리팹(알림/읽음 표시), (5) 왕좌 장면(2D 배경 + 카메라 이동/패럴랙스 또는 `Timeline`), (6) 입력 잠금(연출 중 클릭 무시), (7) 보이스 재생 훅(마지막 한 줄만), (8) 지문 텍스트는 Ink에서 제거하거나 주석화. 프로젝트에 `Timeline 1.8.7`이 이미 있음.

### 5.9 저장 · 재시작 · 빌드

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 저장/불러오기 | DEFERRED(미구현) | 코드에 없음 | — | 필요 시점: MVP 테스트 후 |
| Ink state 직렬화 가능 | NOT TESTED(가능성만) | ink-runtime의 `story.state.ToJson()` 지원 예상이나 실행하지 않음 | — | 기록 목록·`lastEventPath`는 Ink 밖 상태라 함께 저장 필요 |
| 재시작 동작 | PARTIAL | §5.2 |  | — |
| 스탠드얼론 빌드 가능 | FAIL(설계상) / NOT TESTED(빌드 미실행) | 빌드 시 안내 문구만 표시됨(코드 정독). 실제 빌드는 실행하지 않음 | — | P1-1 |
| 빌드에 Ink/배경/오디오 포함 | FAIL(추정 근거 코드) | 배경·오디오는 `AI_Generated`(Resources 아님)에서 `AssetDatabase`로만 로드 → 직렬화 참조가 없어 빌드에서 제외. Ink는 `Resources`에 있으나 로드 경로가 에디터 전용 | — | 참조 필드 |
| `AssetDatabase` 의존으로 빠지는 기능 | FAIL | 스토리 로드·배경·초상·음악·UI 사운드 전부 | 빌드에서 게임 자체가 안 됨 | P1-1 |
| 적합한 방식 | — | 현재 규모: **ScriptableObject 카탈로그(직렬화 참조)** 권장. `Resources`는 Ink 한 파일 정도, Addressables는 콘텐츠가 커진 뒤 | — | §6 |
| 한글 폰트 | NOT TESTED / 위험 | `LegacyRuntime.ttf` 의존 | 빌드 글자 깨짐 위험 | P1-5b |
| 빌드 크기/원본 해상도 영향 | NOT TESTED | PNG 원본 합계 80MB(디스크), mp3 4MB. 실제 빌드 크기는 참조되는 에셋 수에 좌우 | — | 참조만 포함 |

### 5.10 성능 · 안정성

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 시작 시 이미지·오디오 로딩 지연 | NOT TESTED | 프로파일러 미사용 | — | — |
| 메모리 사용량 | NOT TESTED | 실측 없음. **추정(측정 아님)**: 배경 5장 + 초상 4장이 미압축 RGBA32라면 각 약 6.3MB ≈ 57MB, 음악 30초×5는 Decompress On Load라 약 5MB씩 | 추정 | 프로파일러 |
| 고해상도 배경·초상 메모리 비용 | NOT TESTED | 위와 동일 | — | — |
| ACT 전환마다 Sprite/AudioClip 중복 생성 | PASS(코드 근거)/PARTIAL | `bgArtCache`, `aiAudioCache`, `ambientClipCache`로 재사용. 초상은 시작 시 1회 생성. 런타임 측정은 없음 | — | — |
| 버튼 반복 생성·파괴 누수 | PARTIAL | 정상 프레임에서는 파괴되는 것으로 보임. 자동 입력이 프레임보다 빠르면 파괴 전 재생성이 쌓임: **재현**: 개발 메뉴 `AutoPlay200` 실행 후 `ChoicesContainer` 자식 239개(전부 활성)로 확인, 이후에도 그대로 유지. **예상 원인**: `ShowChoicesOrEnd`에서 `Destroy()`가 프레임 끝까지 미뤄지는 동안 같은 프레임에 여러 번 호출되고, `SetChoiceMode(true)`가 파괴 대기 중 낡은 버튼까지 다시 활성화. 에디터 미포커스 시 플레이어 루프 프레임이 극도로 느렸던 것과 결합(오디오 `time`이 0에 머무름). 실제 사용자 마우스 속도에서 재현되는지는 미확인 | 입력 폭주 시 낡은 `onClick` 실행 위험 | 입력 잠금/버튼 풀링 |
| 장시간 플레이 GC spike/프레임 저하 | NOT TESTED | — | — | — |
| 정적 캐시가 재시작 후 남는가 | PASS | 캐시는 인스턴스 필드, 재시작 시 새 스토리·HUD 기록만 초기화 | — | — |
| 콘솔 로그 반복 누적 | PARTIAL | Unity AI 패키지 `NoSubscription` 로그가 약 0.4초 간격으로 누적(게임 무관). 점검 도구로 AudioSource를 덤프할 때 폐기된 속성 오류(`rolloffFactor` 등)가 콘솔에 생김 — **측정 도구의 부작용**이며 게임 오류 아님 | 노이즈 | — |

### 5.11 프로젝트 관리 상태

| 항목 | 상태 | 근거 | 영향 | 권장 |
|---|---|---|---|---|
| 불필요 파일이 버전 관리 대상 | PARTIAL(위험) | 버전 관리 자체가 없음. 프로젝트 폴더에 `Library/Temp/Logs/UserSettings/*.csproj/*.sln`이 존재 | git 도입 시 `.gitignore` 필요 | P1-7 |
| `.gitignore` | FAIL(부재) | `Unity/My project`, `Unity`, 루트 모두 없음 | — | — |
| ProjectSettings/Packages 재현성 | PARTIAL | `manifest.json` + `packages-lock.json` 존재, git URL 의존 | 네트워크 필요 | — |
| AI 원본·선택본·폐기 후보 구분 | PARTIAL | 후보/버전 파일이 같은 폴더에 혼재, 선택 표식은 파일명 규칙뿐 | 오연결 | P1-4 |
| 파일명·폴더 규칙 | PARTIAL | 접미사(v2/v3)와 폴더가 혼용 | — | — |
| 보고서와 실제 상태 일치 | PARTIAL | `ASSET_MANIFEST.md` 불일치(P1-5). Codex 보고서의 해시(Ink/StoryController/GameHud)는 실제와 일치. 이 점검 프롬프트의 전제 "초상은 아직 연결되지 않음"은 실제와 다름(이미 연결) | — | 매니페스트 갱신 |
| 다른 개발자가 같은 결과 재현 | PARTIAL | Unity 6000.1.4f1 + 네트워크로 패키지 해결 필요. `DevCaptureTools`(에디터 메뉴)는 선택 사항 | — | README 작성 |
| 현재 백업/복귀 지점 | FAIL(부족) | Unity 프로젝트 백업 없음 | 실수 시 복구 불가 | P1-7 |

---

## 6. StoryController — 지금 꼭 필요한 분리 vs 나중에 해도 되는 분리

**지금(MVP 슬라이스 착수 전) 필요한 것 — 4가지**
1. **사건 단계 러너**: `EventPhase`(DIALOGUE / ADVISOR_SUMMARY / COURT_EXCHANGE / ROYAL_PAUSE / CHOICE / AFTERMATH …)를 순서대로 재생하는 작은 상태 머신. `StoryController`는 Ink를 읽어 **사건 데이터**를 만들고 러너에 넘기기만 한다. (컷씬·애니메이션은 각 단계를 여는 "프레젠터"가 맡음 — 사용자 방향인 Unity 고유 연출과 직결.)
2. **콘텐츠 데이터 경계**: 사건 제목/설명, 대신 의견, 논쟁, aftermath를 Ink 태그 또는 별도 데이터로 표현하는 규칙. 지금 Ink는 문장 나열이라 단계 러너가 만들 정보가 없다.
3. **에셋 카탈로그(ScriptableObject)**: Act별 배경/음악/앰비언스, 대신 프로필, UI 사운드를 직렬화 참조로 보관 → 하드코딩 파일명 제거 + 빌드 가능성 확보.
4. **입력 잠금과 오류 표면화**: 전환 중 클릭 무시, `story.onError`와 변수 조회 예외를 플레이어용 메시지로.

**나중에 해도 되는 것**: 오디오 매니저 분리(교차 페이드 포함), UI를 프리팹/TMP로 이관(현재 코드 생성 UI는 슬라이스 검증에는 충분), 저장/불러오기, 2회차 테마 데이터(ThemeData) 분리, 엔딩 디렉터(엔딩 구현 시점에), Addressables.

**분리를 미뤄도 되는 근거**: 현재 코드는 1,000줄 미만이고 단일 씬·단일 흐름이라 유지 가능하다. 다만 위 1–2번은 "구조가 아니라 데이터가 없어서" 막히는 지점이라, 콘텐츠를 더 쓰기 전에 형식을 정해야 재작업이 없다.

## 7. 실행한 검증

- **Unity 버전**: 6000.1.4f1 (03270eb687c6), URP 17.1.0, Input System 1.14.0, 2D Animation 10.2.0, Timeline 1.8.7
- **씬**: `Assets/Scenes/SampleScene.unity` (편집/Play)
- **해상도**: 1280×720, 945×435 (캔버스 임시 카메라 렌더링). 1920×1080, 2560×1440, 16:10은 미실행
- **플레이 경로**: 기본 경로(항상 첫 선택) E1→…→종료→자동 재시작→E6 관측. 사건 23 점프(`Jump to event_23_default`)로 5선택지 화면 2개 크기 확인. 다른 5개 대표 경로는 Unity 미실행(inkjs 16조합 통과는 별개)
- **Console 결과**: 컴파일 0/0. 게임 관련 오류 없음. 노이즈: Unity AI `NoSubscription`, 브리지 포트 충돌 경고
- **빌드 여부**: 실행하지 않음(NOT TESTED)
- **에디터 재시작**: 점검 중 2회(브리지 포트 충돌 복구). 씬 무손상 재확인

## 8. 사용자 추가 요청 반영 (점검 중 접수)

### 8-1. Unity 고유 연출을 위한 구조 (MVP 복제 아님)
사용자 방향: HTML MVP를 그대로 만들지 않고 Unity에서만 가능한 컷씬·애니메이션·연출을 적극 활용. 이를 위해 **"기능 목적은 복원, 표현은 Unity로"** 원칙을 제안한다: 사건 단계(러너)는 기능 목적(의견 비교, 왕의 정적, 결과 관찰)을 보장하고, 각 단계의 시각 표현은 프레젠터(Timeline/Animator/카메라)로 교체 가능하게 한다.

### 8-2. 확장 가능한 대신 UI 설계 (사용자: 대신은 4명이 끝이 아니다)

문제: `GameHud`는 4명 고정 배열·고정 좌표, 미소개 "? ? ?" 슬롯. Full Game 대신은 Watcher/Chaplain/Fool 등 최소 7명 이상 예상, 회의 씬에서 **각 대신이 앉아 왕을 바라보는 연출**이 예정.

제안 구조:
1. **데이터 기반 명단**: `AdvisorProfile`(ScriptableObject) — id, 표시명, 직함(1회차/2회차 라벨), 소개 변수명(Ink), 강조색, 포즈 스프라이트 세트(아래), 좌석 번호 선호. 명단은 `CourtRoster`가 목록으로 관리. 새 대신은 프로필 하나 추가로 등장.
2. **UI 두 층 분리**: (A) **회의 씬 좌석 뷰**(월드/2D 연출 레이어): 좌석 슬롯 N개에 소개된 대신만 나타남(미소개 슬롯은 만들지 않음 → 인원 노출 방지, M3 해소), (B) **의견 종합 카드 UI**(`ADVISOR_SUMMARY`): 현재 사건에 의견을 낸 대신 수만큼 동적 생성되는 카드 그리드/스크롤. 상단 고정 4칸 카드는 폐기 대상.
3. **동적 레이아웃**: 좌석은 반원형 또는 양측 열 배치에서 인원 수에 따라 자동 재배치(좌석 프리셋 2~3종: 5/7/9석). 카드 영역은 `GridLayoutGroup`/`HorizontalLayoutGroup`+스크롤, 최대 표시 수 초과 시 페이지/스크롤.
4. **왕은 화면에 보이지 않는다**(§4.4): 좌석 뷰는 대신들의 **시선 방향**으로 왕의 존재를 표현(카메라=왕좌 위치). 왕 얼굴/모델은 없음.
5. **상태 기계 per 대신**: Idle(앉아서 왕을 응시) / Listening / Speaking / Objecting(다른 대신 쪽으로 몸을 돌림) / Thinking / Silent-Gaze(정적, 모두가 왕을 봄).

필요한 애니메이션·UI(사용자 질문 "필요한 UI나 애니메이션"에 대한 답):
- **입장/착석**: 대신이 소개될 때 자리에 앉는 등장 컷(페이드+슬라이드 또는 프레임 애니메이션).
- **왕을 응시하는 대기(루프)**: 미세한 호흡/시선 흔들림. 2D 리깅(`com.unity.2d.animation`, 이미 설치됨)으로 머리·눈·손 파츠 애니메이션, 또는 포즈 스프라이트 교체(저비용).
- **발언**: 앞으로 기울임, 말하는 동안 발언 강조(밝기/스케일), 이름표 표시.
- **몸을 돌림(논쟁 COURT_EXCHANGE)**: 다른 대신 방향으로 회전(3/4 좌·우 포즈).
- **왕의 정적(ROYAL_PAUSE)**: 모든 대신이 동시에 왕을 응시하며 조명/음향이 낮아지는 비트(Timeline 트랙: 라이트, 오디오 덕킹, 대신 상태).
- **회의 종료 후 결정 대기 → 선택 UI 등장**: 선택 버튼이 내려앉는 전환.
- **UI 요소**: 이름표(9-slice), 발언 인디케이터, 좌석 슬롯 마커(에디터용), 의견 카드 프레임(가변 개수), 시선/주목 아이콘(선택), 진행 표시 막대.

디자인 자료 수량은 코덱스에 넘기는 프롬프트(별도 파일)에 정리.

## 9. 검증하지 못한 항목 (NOT TESTED 요약)

1920×1080/2560×1440/16:10 해상도, 본문 스크롤, 선택지 더블클릭 중복 처리, 대표 5경로의 Unity 클릭 실행, 재시작 직후 ACT/오디오 초기화, ACT V 배경·ACT III–V 오디오 재생, 절차적 오디오 폴백 실행, 음량·이음매·피로(청취/플레이 감각), 시작 로딩 시간·메모리·GC·장시간 프레임, 스탠드얼론 빌드 및 한글 폰트, 엔딩 장면 캡처, Ink `state` 직렬화.

## 10. 추천하는 다음 3개 작업

1. **사건 단계 러너 + 콘텐츠 데이터 형식 결정 → Event 1~2 수직 슬라이스**: 의견 종합, 짧은 논쟁, 왕의 정적, 선택, aftermath, 왕실 기록(결과 연결)을 Unity 프레젠터(Timeline/애니메이션)로 구현. 대신 명단은 처음부터 데이터 기반으로(§8-2).
2. **하드닝 묶음**: 입력 잠금·오류 표면화·`AssetCatalog` ScriptableObject(빌드 가능 경로 확보)·제목 화면 결함·배경 종횡비·키보드 입력. 그리고 Enter Play Mode Options/브리지 안정화.
3. **콘텐츠·자산 정리**: 플레이어 노출 설계 메모 5곳 교체(Ink, 코덱스와 조율), `ASSET_MANIFEST.md` 갱신(오디오 출처/라이선스, 선택본), 에셋 폴더 규칙(Runtime/Candidates/Archive), `.gitignore`와 백업 지점 마련.

## 11. 변경 파일

이번 점검으로 생성/변경한 파일:
- `MVP/development/verification/unity-technical-midpoint-audit_claude_report.md` (이 문서)
- `MVP/development/collaboration/reviews/unity-story-parity-consolidated-audit-20260919_claude_review.md` (코덱스 검토 요청 답변)
- 점검 중 게임 코드/Ink/에셋 수정 없음.

**점검 시작 전(같은 세션)에 이미 있던 변경**(기록): `GameHud.cs` 시작 화면 문구를 3인칭으로 교체(이번 점검에서 컴파일·표시 확인), `Assets/Editor/DevCaptureTools.cs`(개발용 캡처/자동진행/점프 메뉴), 초상 연결, 좁은 창 선택지 수정. 점검 중 발생한 불가피한 Unity 변경: 에디터 재시작·리로드, 자동 임포트로 인한 `.meta` 갱신 없음(누락 없음 확인).

## 12. 해시 (SHA256)

| 파일 | SHA256 |
|---|---|
| `기획/04_story_bible.ink` | `099FC5DD95487E20B7F3DE6E2E27E8227E076ADADB158D52D645615460437863` |
| `Unity/My project/Assets/Resources/Ink/story_bible.ink` | `099FC5DD95487E20B7F3DE6E2E27E8227E076ADADB158D52D645615460437863` |
| `Assets/Scripts/StoryController.cs` | `BF7E6C4E3C01BF618C308CBA1A3696B7A4B2EE2B4318C9B9E1302FFC8689C889` |
| `Assets/Scripts/GameHud.cs` | `A6FE96FCA53C92093CDC9A3CE76C37A5370AA525616755B968CDF54A25D316AB` |
| `Assets/Scripts/ProceduralAudio.cs` | `361A7D9F3E039BCDBDE06C40DA34199DEE85E748C4FDB4329EEFB5F96A536047` |
| `Assets/Editor/DevCaptureTools.cs` | `BEE213A2B629F773C52549796E838F0D684B1B9E6D4CDA909A413693B79925E0` |
| `Assets/Scenes/SampleScene.unity` | `31CC45AA2613C8DB741172A5A732FB039F3FCEFFF10158210C2BF5C281A0635E` |
| `Packages/manifest.json` | `C33CD2D4C4EE7BECA53D56F65B7AEDCD05E90A5443A026214B54F476824BEBA3` |
| `ProjectSettings/ProjectVersion.txt` | `CA86DDB4A11E0EAF8EAF477483818E232CF027A38E364B525AE55A7683257283` |
| `Assets/AI_Generated/ASSET_MANIFEST.md` | `B105DF89B80AC7B8271C573333230A71DD96CDB5ECB2021EDC0DB95866E3433F` |
