# Claude 작업 기록 — Unity 드래프트 플레이 체감 개선 (2026-09-19)

사용자 피드백: Unity 드래프트를 직접 플레이해보니 "잘 되는데 여전히 텍스트 중심이라 딱딱하다", "빠르게 플레이하고 싶은 게임으로" 우선순위 지시. 이후 "사용자 개입을 지금보다 최소화" 확정(자율 작업 브리핑, 이 conversation에 기록).

## 한 것

**`Assets/Scripts/StoryController.cs` 대폭 개편**:
1. 한 줄씩 넘기기(visual novel 방식) — 기존엔 `Continue()`가 끝날 때까지 텍스트를 전부 쌓아서 한 번에 보여줬는데, 이게 "그냥 클릭만 하는" 피로감의 핵심 원인으로 판단. 이제 한 줄씩 보여주고 클릭(배경 아무 곳이나, 또는 우측 하단 "▼ 클릭해서 계속" 프롬프트)으로 다음 줄 진행. 선택지는 모든 줄이 끝난 뒤에만 등장.
2. 화자별 색상 강조 — `<color=...>` 리치텍스트로 세르안/발렌/리안/카르덴 각각 고유 색 부여, 정규식으로 "이름: 대사" 패턴 자동 감지.
3. 버튼 호버/클릭 피드백 실제 동작 확인 — `Button.targetGraphic`을 명시적으로 연결(AddComponent만으론 씹힐 수 있는 부분, 실제로는 Unity가 같은 GameObject의 Graphic을 자동 연결해주는 걸 확인).
4. ACT별 배경 무드 컬러 — `기획/04_story_bible.md` §6~§10 ACT 구간(Event 번호 기준)에 맞춰 배경색이 미묘하게 전환(코루틴 0.6초 lerp). §30 Do Not Drift 5/6("친절을 사랑으로/침묵을 거절로 확정 금지")과 같은 원칙으로, 색이 감정을 확정하지 않도록 톤을 아주 미묘하게만 바꿈.

## 버그 2개 발견 및 수정

1. **무드 컬러가 처음엔 안 바뀜**: `story.state.currentPathString`이 스토리 시작 직후(첫 Awake) 빈 문자열이라 첫 Act 판정이 스킵됨. 임시 Debug.Log로 원인 확인 후, 배경 초기값 자체를 ACT I 무드 컬러로 맞추는 방식으로 해결(이후 Act부터는 코루틴 전환 정상 동작 확인).
2. **Unity 에디터 MCP 브리지가 간헐적으로 응답 없음**: 사용자가 Unity 콘솔 로그를 직접 확인해줘서 원인 파악 — `[MCP Unity] Failed to start WebSocket server: Port 8090 is already in use`. DotSoccer 프로젝트의 Unity 에디터도 기본 포트 8090을 쓰기 때문에 두 프로젝트를 동시에 켜두면 충돌. `ProjectSettings/McpUnitySettings.json`의 `Port`를 8095로 변경, Unity MCP 창에서 Restart Server + Claude Code 세션 재시작 후 정상 연결 및 재검증 완료(콘솔에 포트 충돌 경고 더 이상 없음).

## 검증

- 재컴파일 0 에러/0 경고 (여러 차례).
- Play 모드에서 `get_gameobject`로 배경색이 ACT I 무드 컬러(`{r:0.1,g:0.09,b:0.07}`)로 정확히 뜨는 것 확인.
- 임시 Editor 메뉴 스크립트(reflection으로 `ShowNextLine()` 강제 호출)로 세르안(파란색)/발렌(주황색) 대사가 한 줄씩 색상과 함께 순서대로 표시되는 것 확인 — 검증 후 스크립트는 삭제.
- 선택지 버튼 3개가 Button+Image+Text로 정상 생성되는 것도 기존과 동일하게 재확인.

## 알아둘 것

- `Unity/My project/.mcp.json`(`E:\DotSoccer\.mcp.json`에 위치, KING WAS ME 세션 root 밖)의 `mcp-unity-kingwasme` 서버 항목은 포트를 직접 지정하지 않고 `McpUnitySettings.json`에서 읽어옵니다 — 이번 포트 변경으로 별도 수정 불필요했음.
- 이제 두 프로젝트(DotSoccer/KING WAS ME) Unity 에디터를 동시에 켜도 충돌 안 남(각각 8090/8095).
- 오디오는 코덱스 쪽에도 전용 생성 도구가 없어서, Unity 코드로 직접 절차적 생성(사인파 기반 톤)하는 방향으로 다음 작업 예정.
