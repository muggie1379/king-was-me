# Claude 작업 기록 — Unity MCP 연결 + 플레이 가능 드래프트 (2026-09-19)

사용자 요청: "MCP를 활용한 작업은 Claude 우위이니, Claude가 기반 작업을 시작할 것입니다" → 그 뒤 "내가 테스트 할 수 있게 게임 초안만 빠르게 만들어줘" → "Unity에서 최소 플레이 가능한 드래프트"로 확정.

## 한 것

1. **Unity MCP 브리지 연결**
   - `E:\KING WAS ME\Unity\My project\Packages\manifest.json`에 `com.gamelovers.mcp-unity`(DotSoccer 클라이언트와 동일 패키지) 추가.
   - 이 Claude Code 세션 자체가 `E:\DotSoccer`용 `.mcp.json`에 고정되어 있어서 처음엔 KING WAS ME Unity 에디터에 연결이 안 됐음(원인 진단 상세는 Claude 개인 메모리 참고). `E:\DotSoccer\.mcp.json`에 `mcp-unity-kingwasme`라는 별도 이름으로 두 번째 서버 항목을 추가(기존 `mcp-unity`는 DotSoccer용으로 그대로 둠), 세션 재시작 후 정상 연결 확인(`get_scene_info` → SampleScene 응답).
   - Unity 공식 1st-party 플러그인(`unity-agent-plugin`)도 검토했으나 2026-09-19 기준 GitHub에서 여전히 `0.1.6-beta`로 확인되어, DotSoccer와 동일하게 커뮤니티 `mcp-unity`를 계속 쓰기로 결정(사용자 확인 받음). 두 브리지를 같은 에디터에 동시에 켜지 않는다는 기존 원칙 유지.

2. **Ink 스토리 파이프라인 연결**
   - `com.inkle.ink-unity-integration`(공식 ink Unity 통합, git#upm) 패키지 추가.
   - **버전 2.0 API 확인 필요**: 이 패키지는 1.x의 "별도 .json 컴파일" 방식이 아니라 ScriptedImporter 기반 `InkFile` 에셋으로 바뀜(`MIGRATION.md` 확인). `new Story(jsonTextAsset.text)` 대신 `new Story(inkFile.storyJson)`을 써야 함 — 이 부분에서 한 번 삽질(Resources.Load<TextAsset> 시도 → null, 원인 파악 후 API 교체)했음, 상세는 Claude 메모리에 기록.
   - `기획/04_story_bible.ink`(29개 이벤트, 5개국 인터리브, Codex와 함께 검증된 최신 버전)를 `Unity/My project/Assets/Resources/Ink/story_bible.ink`로 복사. 내용은 전혀 수정하지 않음 — 원본은 `기획/` 그대로 유지.

3. **StoryController.cs 작성** (`Unity/My project/Assets/Scripts/StoryController.cs`)
   - 씬에 미리 Canvas/Text/Button을 수동 배치하는 대신, **런타임에 전부 코드로 UI를 생성**하는 방식을 택함. 이유: mcp-unity 툴로는 인스펙터의 에셋/씬오브젝트 참조 필드를 직접 연결할 수 없다는 게 DotSoccer 작업 때도 확인된 제약이라(devlog 참고), 참조 와이어링이 필요 없도록 설계.
   - 씬에는 빈 GameObject 하나("StoryController")에 이 컴포넌트만 붙어 있음. Awake()에서 EventSystem(InputSystemUIInputModule — 프로젝트가 새 Input System 패키지 사용 중이라 레거시 StandaloneInputModule 대신 이걸 씀) + Canvas + 스크롤 텍스트 영역 + 선택지 버튼 컨테이너를 전부 생성.
   - `AssetDatabase.LoadAssetAtPath<InkFile>(...)`로 InkFile을 로드(에디터 전용 — `#if UNITY_EDITOR`로 감쌈, 빌드에서는 안내 문구만 표시). 이야기 진행/선택지 클릭/재시작까지 동작.

## 검증

- `recompile_scripts` MCP 툴로 0 에러/0 경고 컴파일 확인(처음엔 `FindObjectOfType` obsolete 경고 1개 있었으나 `FindFirstObjectByType`로 즉시 수정).
- Unity 콘솔에 "Ink import complete (1 file): Assets/Resources/Ink/story_bible.ink" 로그 확인 — 컴파일 에러 없음.
- 실제 Play 모드 진입 후 `get_gameobject`로 StoryText 컴포넌트 값을 읽어 확인: Event 1 본문("창고 장부와 실제 재고가...")과 세르안/발렌 대사가 정상 출력됨.
- 선택지 버튼 3개가 `ChoicesContainer` 하위에 Button+Text 컴포넌트로 정상 생성됨.
- Play 모드 종료 후 씬 저장 완료(`Assets/Scenes/SampleScene.unity`).

## 알아둘 점 / 한계

- 지금은 **1번째 사건(Event 1)만 육안 확인**했음 — 29개 이벤트 전체를 Unity Play 모드에서 끝까지 눌러보며 검증하지는 않았음(Ink 컴파일/로직 자체는 이미 inkjs로 exhaustive하게 검증됐던 파일을 그대로 가져온 것이라 논리적으로는 문제 없을 것으로 예상하지만, 실제 클릭 플레이로 끝까지 확인하는 건 아직 안 함).
- UI는 최소 스타일(어두운 배경 + 파란 버튼)만 입혀놓은 "기능 드래프트"임 — 아트/폰트/레이아웃 다듬기는 전혀 안 되어 있음.
- InkFile 로딩이 `#if UNITY_EDITOR`로 감싸져 있어서 **에디터 Play 모드에서만 동작**. 실제 빌드(exe)로 내보내려면 런타임 로딩 방식(Resources 등)으로 바꿔야 함 — 지금은 "에디터에서 테스트"가 목적이라 이 범위로 한정함.
- `Unity/My project/`는 `old/`로 옮기지 않고 그대로 유지, `기획/04_story_bible.ink` 원본도 안 건드림.

## 남은 것

- 사용자가 직접 Unity 에디터에서 Play를 눌러 끝까지(선택지 여러 개, 엔딩까지) 플레이해보고 피드백 주시면 좋을 것 같음.
- 원하면 이후 진행: 씬 배경/폰트 다듬기, 저장/불러오기, 더 많은 이벤트 스킵/분기 케이스를 실제 버튼 클릭으로 확인.
