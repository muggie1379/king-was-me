# KING WAS ME — Codex 독립 전체 중간 점검

- 작성일: 2026-09-20
- 관점: 게임 디렉터 · 시스템 기획자 · UX 리뷰어 · 테크니컬 프로듀서
- 읽기 전용 독립 검토. 이 보고서만 새로 작성하며 코드·Ink·기획·이미지·매니페스트·협업 상태를 수정하지 않는다. 잠금을 취득하지 않았다.
- full-midpoint-audit_claude_20260920.md를 열지 않았고, 폐기된 full-midpoint-audit-brief-20260920.md도 제외했다. 과거 보고서의 완료 주장은 이번 실행 결과로 취급하지 않았다.
- 기준: 최신 사용자 지시 → 승인된 현행 방향 → 실제 구현. 옛 기획과 타 에이전트의 제안은 참고 자료다.
- 한계: 브라우저의 로컬 파일 접근 정책으로 HTML 실제 플레이를 하지 못했다. Unity도 실행하지 않았다. 파일·이미지·제한된 정적 검사에 기반한 판단이며 재미와 실행 안정성의 실증 결과가 아니다.

### 판독 방법

P0 진행 막음 / P1 핵심 경험 훼손 / P2 완성도·확장성 / P3 후순위.

사실은 직접 확인한 내용, 추정은 플레이 영향과 미실행 위험, 취향은 미적·연출적 선호다. 실행이 필요한 판단에는 미검증을 추가한다. 긍정적 발견의 P등급은 보존·검증 우선순위이며 결함이라는 뜻이 아니다. Event 번호는 제작용 식별자이며 플레이어에게 전체 사건 수를 노출하자는 뜻이 아니다.

## 1. 경영진 요약

**방향은 상당 부분 회복되었지만, 현재 Unity는 완성된 29사건 게임보다 ‘일부 장면의 표현이 구체화된 전체 흐름 초안’에 가깝다. 다음 제작비는 추가 이미지보다 선택의 인과관계와 짧은 플레이 구간의 완결에 써야 한다.**

[P1·추정] 가장 큰 위험은 결정을 요청한 뒤 후반에는 미리 정한 실패와 회복 이야기로 돌아가는 것이다. “내가 결정하지”라는 결말의 설득력을 약화한다. 파견 취소 후 사절 도착, 귀환 선택 후 방문 지속, 경로 공통 실패 진술이 소스에 있다. [Ink E18–20](<E:/KING WAS ME/기획/04_story_bible.ink:541>), [E24–26](<E:/KING WAS ME/기획/04_story_bible.ink:758>)

[P1·사실] 모든 선택이 가짜인 것은 아니다. 비공식 교류 중단, 북부 강경 대응, 남부 거래 단절, 직접 방문에는 실제 조건 분기와 대체 장면이 있다. 문제는 후속 상태와 결말까지 연결되지 않았다는 점이다. [E13–15](<E:/KING WAS ME/기획/04_story_bible.ink:427>), [E17 이후](<E:/KING WAS ME/기획/04_story_bible.ink:513>), [HTML 이력 분기](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1702>)

[P2·사실] Unity에는 의견 종합, 논쟁·선택 후 반응의 표시 처리, 소개된 인원 기준 좌석, ACT 배경·음악 연결이 이미 있다. 과거의 “논쟁 연출이 전혀 없다”는 진단을 재사용하면 안 된다. 다만 풍부한 콘텐츠는 E4·E6·E8에 집중되고 다른 사건과 후반 인물은 얕다. [장면 표시](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:524>), [현행 Ink](<E:/KING WAS ME/Unity/My project/Assets/Resources/Ink/story_bible.ink:73>), [에셋 참조](<E:/KING WAS ME/Unity/My project/Assets/Resources/AssetCatalog.asset>)

[P1·추정] “1회차가 재미있는가”에는 아직 합격 판정을 내릴 수 없다. HTML의 곡물·국경·수로 사건과 반응은 은유를 몰라도 이해할 수 있는 좋은 출발점이다. 이를 Unity의 한 구간 끝까지 유지하는 것이 가장 가치 있는 다음 작업이다. [첫 사건](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1767>), [남부 수로](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1869>)

**권고:** 새 인물·새 UI·날씨 변형의 대량 제작을 잠시 보류하고, 선택을 기억하는 상태 → 관찰 가능한 결과 → 대화·의견·선택 화면 → 외부 플레이 관찰을 짧은 구간 하나로 묶는다. 기존 후보는 삭제하지 않는다. 확인된 P0는 없지만, 실행 검증을 통과했다는 뜻은 아니다.

## 2. 현재 게임의 가장 강한 점 5개

| 발견 | 보존할 가치 | 근거 |
|---|---|---|
| [P1·사실] 왕국 사건의 독립성이 좋아졌다. | 장부·횃불·수로·곡물은 행정·외교 문제만으로 성립한다. | [HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1766>), [Story Bible §30](<E:/KING WAS ME/기획/04_story_bible.md:1866>) |
| [P1·사실] 주요 4인의 질문이 다르다. | 세르안은 증거, 발렌은 행동 시점, 리안은 상호작용의 여지, 카르덴은 내부 비용을 본다. | [Character Bible](<E:/KING WAS ME/기획/03_character_bible.md:21>) |
| [P1·사실] 강한 분기의 실체가 있다. | 교류 중단은 다른 상황과 재개 선택으로 이어진다. | [닫힌 교류](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2319>), [Ink E15](<E:/KING WAS ME/기획/04_story_bible.ink:473>) |
| [P2·사실] 표현과 콘텐츠가 분리되기 시작했다. | 로스터·자산·장면 단계·좌석 표시를 나눴다. 의견 비교와 한 줄씩 논쟁을 지원한다. | [EventPhase](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/EventPhase.cs>), [표시 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:557>) |
| [P2·사실] 후보와 선택본을 구분한다. | 잘린 포즈·다른 화풍·캐주얼 자료를 바로 본편에 섞지 않았다. | [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:135>), [무료 자료](<E:/KING WAS ME/Asset_Library/Free_ThirdParty/README.md>) |

## 3. 가장 큰 위험 5개

### F01. 선택과 다음 세계 상태가 충돌한다 — [P1·사실]

E18의 “파견 취소”는 취소 상태를 남기지 않고 E19로 간다. E20 기본 경로는 사절단의 입국 지연을 전제한다. E20 방문 경로의 “돌아간다”도 eastWarmth만 감소시키며 royal_visit를 유지해 후속 방문 장면으로 간다.

플레이 영향 [P1·추정]: 주의 깊게 읽을수록 결정이 무시되었다고 느낀다. 그림으로 해결할 수 없는 신뢰 문제다. 파견 여부·현재 위치·접촉 방식 같은 사실 상태를 남기고 후속 대사와 일치시켜야 한다. 모든 선택에 새 장면이 필요한 것은 아니며 조건문과 대체 문장으로 처리할 수 있다.

근거: [E18](<E:/KING WAS ME/기획/04_story_bible.ink:541>), [E20](<E:/KING WAS ME/기획/04_story_bible.ink:596>), [후속 라우팅](<E:/KING WAS ME/기획/04_story_bible.ink:648>)

### F02. 마지막 선택보다 ‘동부 실패 후 회복’이 우선한다 — [P1·사실]

E23에는 다른 의도와 답변이 있지만 E24는 관계 형태를 구체적으로 확정하지 않고 E25는 공통으로 “목표는 달성하지 못했습니다”라고 말한다. 제한 교류나 거리 유지를 원한 왕도 같은 평가를 받는다. E19의 “두 달 동안 열한 번의 동부 회의”도 실제 이력과 무관하다.

플레이 영향 [P1·추정]: 게임이 무엇을 원했고 얼마나 집착했는지 플레이어 대신 정한다. 성공/실패 등급 대신 선택한 관계 형태와 실제 비용을 서술해야 한다. 회복은 발생한 손실에 반응하고, 손실이 없던 경로에는 일상 지속과 다른 업무로의 전환이 가능해야 한다.

근거: [E19](<E:/KING WAS ME/기획/04_story_bible.ink:573>), [E23](<E:/KING WAS ME/기획/04_story_bible.ink:688>), [E24–26](<E:/KING WAS ME/기획/04_story_bible.ink:758>), [기록 원칙](<E:/KING WAS ME/기획/04_story_bible.md:1852>)

### F03. 길이에 비해 선택 결과의 밀도가 낮다 — [P1·사실]

E1·E2의 선택들은 상태 변화나 선택 후 반응 없이 같은 다음 사건으로 간다. E17은 직접 방문만 뚜렷한 장기 상태를 남긴다. E4·6·8에는 반대로 풍부한 대화·논쟁·반응이 있다. 엔진의 부재보다 장면별 완성도 격차가 크다.

7개 심리 축은 현재 Ink에서 선언만 되어 있다. eastPressure는 증가하지만 결과를 가르는 읽기가 없다. 숫자가 존재한다는 이유로 시스템이 완성된 것은 아니다.

플레이 영향 [P1·추정]: 고민의 보상보다 읽기 분량이 늘어날 수 있다. 7축을 무조건 복원하기보다 각 선택이 즉시 반응·뒤의 사실 변화·관점의 재등장 중 무엇을 약속하는지 정해야 한다. 작은 이야기에는 이력 플래그가 수치보다 명료할 수 있다.

근거: [변수](<E:/KING WAS ME/기획/04_story_bible.ink:7>), [E1–2](<E:/KING WAS ME/기획/04_story_bible.ink:40>), [E17](<E:/KING WAS ME/기획/04_story_bible.ink:513>), [E4](<E:/KING WAS ME/기획/04_story_bible.ink:73>)

### F04. 화면보다 내부 진행이 앞서간다 — [P1·사실 / 실제 재현 미검증]

AdvanceStory는 다음 선택까지 Ink를 모두 진행시켜 대사를 모은 뒤 최종 변수로 소개 여부와 ACT 무드를 갱신한다. 중간에서 소개 플래그가 켜지면 소개 대사 전에 인물이 보일 수 있다. 이전 선택의 반응과 다음 사건이 한 묶음이면 배경·제목도 앞설 여지가 있다.

플레이 영향 [P1·추정]: 인물을 먼저 본 뒤 처음 들어온다는 설명을 읽게 되어 등장 보상이 약해진다. 논리 진행과 화면 공개 상태를 분리하고 입장·배경 전환은 해당 줄의 표시 이벤트로 처리할 필요가 있다.

근거: [AdvanceStory](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:369>), [소개 갱신](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:452>), [ACT 갱신](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:476>), [리안 소개](<E:/KING WAS ME/기획/04_story_bible.ink:180>)

### F05. 자산의 양이 검증된 플레이 구간을 앞선다 — [P1·추정]

좌석 포즈 배열과 동부 사절의 초상화 참조는 비어 있고 컷신 Ink 태그도 없다. Unity에는 별도 2회차 경로가 없다. 새 묶음을 계속 만들면 사용 경로 없는 후보가 늘 수 있다. 이미 승인받아 만든 자산을 잘못된 작업이라고 보는 것이 아니라, 지금부터는 추가 생산보다 연결·선별·검증의 효과가 크다는 판단이다.

근거: [세르안 프로필](<E:/KING WAS ME/Unity/My project/Assets/Resources/Court/Advisor_seran.asset>), [사절 프로필](<E:/KING WAS ME/Unity/My project/Assets/Resources/Court/Guest_east_envoy.asset>), [컷신 진입](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:531>), [끝 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:686>)

## 4. 재미·서사·시스템·UX·기술·에셋별 평가

| 분야 | 현재 평가 | 다음 개선 |
|---|---|---|
| 재미 [P1·추정] | 관점 비교는 유망하지만 실제 재미는 미검증. 고정 결과가 반복되면 비교 동기가 사라진다. | 결정이 다음 사건의 전제에 돌아오는 구간 완결 |
| 서사 [P1·사실] | 왕국 독립성·다국가 구조는 개선. 공통 실패·회복 결론과 지문 수준의 출력이 남아 있다. | 실제 행동으로 결말 문장을 선택 |
| 시스템 [P1·사실] | 일부 플래그 분기는 유효. 7축은 미사용이고 국가 수치도 결과를 충분히 구분하지 못한다. | 계산량보다 사실·비용·회고의 일치 |
| UX [P2·사실/추정] | 의견 종합·선택 단계는 존재. 긴 문장, 요약 생략, 5인 이상 배치, 표시 시점 검증 필요 | 실제 해상도·키보드·긴 한국어 검사 |
| 기술 [P2·사실] | 자산·로스터·표시 단계 분리와 입력·오류 처리가 있다. 논리 상태와 공개 시점은 혼재 | 전면 재설계보다 표시 이벤트 경계 정리 |
| 에셋 [P2·사실/취향] | 핵심 얼굴 식별력과 차분한 배경은 좋은 기반. 연결된 포즈와 사건은 적다. | 필요한 2–3포즈와 합성 품질 |

근거: [HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1766>), [Ink](<E:/KING WAS ME/기획/04_story_bible.ink>), [장면 단계](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/EventPhase.cs>), [좌석 UI](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/SeatView.cs:240>), [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md>)

**F06 — 국가 분기 문턱이 선택을 구분하지 않는다 [P2·사실].** 서부는 8에서 시작하고 현행 변화 범위가 7–9인데 E29 조건은 7 이상이다. 해안은 3에서 시작해 감소하지 않는데 조건은 3 이상이다. 두 초대는 정상 흐름에서 항상 열린다. 반면 북부 강경 조건은 도달 가능하다. 항상 열린 관계 자체는 문제가 아니지만 선택의 성과로 제시하면 과장이다. [초깃값](<E:/KING WAS ME/기획/04_story_bible.ink:15>), [서부](<E:/KING WAS ME/기획/04_story_bible.ink:368>), [해안](<E:/KING WAS ME/기획/04_story_bible.ink:411>), [E29](<E:/KING WAS ME/기획/04_story_bible.ink:808>)

**F07 — 국가 관계의 단순화 위험 [P2·추정].** 현재 UI에 호감도는 노출되지 않는다. 다만 eastWarmth 같은 단일 문턱이 공식 교류·공동 사업·개인적 친밀함을 가까움/멀어짐으로 압축할 수 있다. 최고 점수의 국가를 고르는 구조로 확대하지 말고 관계별 행동 이력을 우선할 필요가 있다. [국가 변수](<E:/KING WAS ME/기획/04_story_bible.ink:15>), [다국가 원칙](<E:/KING WAS ME/기획/05_multi_kingdom_relationship_routes.md>)

**F08 — 타이머 경험의 차이 [P2·사실].** HTML은 취소 사건에 20초 기한과 시간 초과 후 상황이 있다. 1회차는 다시 결정 가능하고 2회차는 바뀐 선택지를 쓴다. 이는 문서상 의도된 비대칭이므로 차이 자체를 버그라 판정하지 않는다. Unity E13에는 대응하는 기한 처리가 없다. [HTML 타이머](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2527>), [2회차](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:3694>), [의도](<E:/KING WAS ME/00_START_HERE.md:49>), [Ink E13](<E:/KING WAS ME/기획/04_story_bible.ink:427>)

[P2·추정] 의견을 읽는 동안 시간이 흐르면 상황의 긴박함보다 읽기 속도가 불이익을 결정할 수 있다. 의견 비교 뒤 타이머 시작 또는 읽기 시간 완화를 검증해야 한다. 시간 초과를 숨은 감점이나 자동 정답 선택으로 만들 필요는 없다.

**F09 — 선택의 구체도 [P2·사실/추정].** E17의 “직접 확인 / 제한 접촉 / 경계 강화”는 누가 무엇을 하는지 모호하다. 시안의 “짧게 답한다”와 “우호 의사를 분명히 한다”도 동시에 가능한 행동이다. 결과를 미리 설명하지 않으면서 대상·범위·약속 수준은 명료하게 할 수 있다. 선택을 모두 왕의 직접 대사로 바꿀 필요는 없다. [E17](<E:/KING WAS ME/기획/04_story_bible.ink:525>), [선택 시안](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/06_king_decision_cards_reveal_v1.png>)

### 29사건의 필요성

[P2·추정] 29라는 숫자를 목표로 유지할 이유는 아직 입증되지 않았다. 다섯 나라의 독립적 업무는 필요하지만 모든 사건이 긴 회의일 필요는 없다. 첫 왕정 업무, 반복 접촉, 비용 발견, 관계 재결정, 다른 나라의 후속 결과는 유지 가치가 크다.

선물 E10/E22, 침묵·취소 E11/E13/E15, 준비·입국 E18/E20, 정리·복구 E24–26은 각각 새 사실이나 가능한 행동을 바꾸는지 확인한다. 같은 감정만 반복하면 짧은 서신·외부 장면으로 압축할 수 있다. E27/E28도 새 인물을 소개하기 위해서가 아니라 기존 4인으로 해결되지 않는 질문이 생길 때 필요하다. [사건 설계](<E:/KING WAS ME/기획/04_story_bible.md:330>), [리듬 원칙](<E:/KING WAS ME/기획/04_story_bible.md:1752>), [후반 Ink](<E:/KING WAS ME/기획/04_story_bible.ink:758>)

## 5. 초기 기획 대비 Drift 지도

### 비교 기준의 한계

[P2·사실] 지정된 01_original_brief.md는 보존된 v4.2 계열 자료이지, 대화에서 언급된 최초 v0.3 원본 자체는 아니다. 아래는 지정된 보존 기획과 최신 승인 방향의 비교다. v0.3 전체를 직접 검증했다고 주장하지 않는다. _shared 통합안도 읽었지만 최신 사용자 지시보다 높은 권위로 취급하지 않았다. [보존 기획](<E:/KING WAS ME/기획/01_original_brief.md:1>), [통합안](<E:/KING WAS ME/_shared/KING_WAS_ME_최신_통합_기획안_v1.0.md>)

| 분류 | 판단 | 근거 |
|---|---|---|
| 유지 [P1·사실] | 왕은 행동을 선택하고 대신은 관점을 제시한다. 마지막 자기 결정 테마도 남아 있다. | [보존 기획](<E:/KING WAS ME/기획/01_original_brief.md>), [결말](<E:/KING WAS ME/기획/04_story_bible.ink:831>) |
| 유지 [P1·사실] | 상대의 속마음을 확정하지 않고 행동을 관찰한다. | [Story Bible §30](<E:/KING WAS ME/기획/04_story_bible.md:1866>) |
| 개선 [P1·사실] | 곡물·공사·국경을 앞에 두고 동부를 여러 나라 중 하나로 만든다. | [HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1767>), [다국가 방향](<E:/KING WAS ME/기획/05_multi_kingdom_relationship_routes.md>) |
| 개선 [P1·사실] | 단일 진엔딩·최고 호감도 국가 대신 복수 관계의 지속을 인정한다. | [Story Bible](<E:/KING WAS ME/기획/04_story_bible.md:1771>), [HTML 이어지는 외교](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2577>) |
| 개선 [P2·사실] | 외부 NPC의 자기 업무, 소개/출석/발언 구분. | [캐릭터 원칙](<E:/KING WAS ME/기획/03_character_bible.md:630>), [등장 조건](<E:/KING WAS ME/기획/04_story_bible.md:1817>) |
| 위험 [P1·사실/추정] | 동부 집착→실패→회복의 고정 해석이 플레이어 목적을 덮는다. | [E19](<E:/KING WAS ME/기획/04_story_bible.ink:573>), [E25](<E:/KING WAS ME/기획/04_story_bible.ink:764>) |
| 위험 [P1·사실/추정] | HTML 2회차의 현대 관계 이야기·기능명은 최신의 작은 재해석보다 설명적이다. | [2회차](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2946>), [Full Story 미정 사항](<E:/KING WAS ME/기획/04_story_bible.md:1697>) |
| 위험 [P2·추정] | 새 대신·에셋 제작이 등장 필요성 검증보다 앞설 수 있다. | [13인 질문 표](<E:/KING WAS ME/기획/03_character_bible.md:599>), [외형 선택본](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:172>) |
| 보류 [P2·추정] | 자유 서재 허브·지도 탐색을 선형 게임의 필수 구조로 확대하는 것. | [현재 임시 화면](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/TempScreens.cs>) |
| 보류 [P2·추정] | 7축·영향력·선택지 잠금 등 옛 제안을 일괄 복원하는 것. | [통합안의 영향력 잠금 비채택](<E:/KING WAS ME/_shared/KING_WAS_ME_최신_통합_기획안_v1.0.md:565>) |
| 격리 유지 [P3·사실/취향] | 잘린 포즈·다른 화풍·캐주얼 자료를 본편 선택본처럼 사용하는 것. | [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:135>), [무료 자료 분류](<E:/KING WAS ME/Asset_Library/Free_ThirdParty/README.md>) |

[P1·추정] 초기안으로 돌아가면 나빠질 부분은 동부만의 관계 대응표, 의미를 모두 설명하는 2회차, 특정 심리를 충족해야 얻는 정답 엔딩이다. 다국가·관찰 중심·복수 결과 방향은 유지해야 한다. 반대로 승인된 직접 방문을 “왕이 자유롭게 마을을 돌아다니면 안 된다”는 원칙과 혼동해 일괄 삭제해서도 안 된다. 자유 이동과 의도된 서사적 방문은 다르다. [방문 설계](<E:/KING WAS ME/기획/04_story_bible.md:1787>)

### 아직 다른 결론을 내리는 문서

- [P2·사실] 시작 안내·DESIGN_INTENT·ROADMAP 상단에는 v6.6, 6+10, Unity 미생성/초기 단계 설명이 남아 있다. 검토 HTML은 v6.8.0, 10+10이며 Unity에는 미디어 참조가 있다. 서로 다른 MVP 파일을 하나의 “현재 버전”으로 부르면 혼동한다. [시작 안내](<E:/KING WAS ME/00_START_HERE.md:22>), [DESIGN_INTENT](<E:/KING WAS ME/MVP/development/DESIGN_INTENT.md:26>), [ROADMAP](<E:/KING WAS ME/MVP/development/ROADMAP.md:10>), [검토 HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1>)
- [P2·사실] 오르반은 캐릭터 문서에서 실제 상실/실패로 등장하지만 Ink E27은 새 협력 자리에서 무조건 소개한다. 인물을 넣기 위해 실패를 강제하지 말아야 한다. [캐릭터 표](<E:/KING WAS ME/기획/03_character_bible.md:608>), [E27](<E:/KING WAS ME/기획/04_story_bible.ink:787>)
- [P2·사실] 옛 통합안/디자인 문서의 현대 전환·마지막 최초 왕 시점과 최신의 같은 장면 재해석·왕좌 시점 시안은 적용 범위를 정리해야 한다. 최신 시안을 자동으로 위반이라 판정하지 않는다. 회의 카메라 위치와 마지막 “내가 앉는다”는 체험은 구분할 수 있다. [시점 설계](<E:/KING WAS ME/기획/02_design_bible.md:196>), [2회차](<E:/KING WAS ME/기획/04_story_bible.md:1697>), [시안](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/README.md>)

## 6. MVP와 Unity의 차이

| 항목 | 지정 HTML Kingdom Slice | 현재 Unity/Ink | 판단 |
|---|---|---|---|
| 범위 [P2·사실] | 1회차 10사건 + 현대 배경 2회차 10장면 | 29사건·방문 변형·에필로그, 별도 2회차 없음 | 장면 수와 완성도는 별개 |
| 대화/논쟁/반응 [P1·사실] | intro·courtExchange·aftermath 존재 | 처리 구조 있음, E4·6·8 중심으로 구체화 | 전혀 없다는 평가는 현재와 다름 |
| 의견 비교 [P2·사실] | 텍스트 카드 동시 비교 | 연속 의견을 모아 좌석 카드로 표시 | 가독성과 밀도 검증 필요 |
| 이력/계산 [P1·사실] | 선택 ID·7축 갱신·이력 우선 분기·개발 표시 | 일부 국가값과 플래그, 7축 미사용 | 결과 연결이 부족 |
| 강한 분기 [P1·사실] | 중단→닫힌 교류→유지/재개 | 대응 분기 및 방문·북부·남부 분기 | 합류 이후 상태 일관성 필요 |
| 기록 [P2·사실] | 제목·선택·회고·국가별 지속 관계 | 선택 문구 기록, HUD 최근 9개, 서재 목록 | 결과·사건 맥락이 얕음 |
| 타이머 [P2·사실] | 기한과 시간 초과 선택 | 대응 타이머 없음 | 같은 경험을 검증할 수 없음 |
| 표현 [P2·사실] | 단순 그림·CSS·역할명 순간 연출 | 배경 5개·오디오 12개 참조·주요 초상화 | Unity가 자산 연결 측면에서 앞섬 |
| 끝맺음 [P1·사실] | 결과 직면→일상→새 연락→빈 왕좌 | YOU·휴대폰·카메라 등이 주로 출력 지문 | 실제 엔딩 연출 완료 아님 |
| 과거 수정 [P2·사실] | 함수 title 해석과 개발자 2회차 진입 유지 | 독립 러너 | 옛 title 버그를 현재 결함으로 반복하지 않음 |

근거: [HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1766>), [제목 해석](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2731>), [2회차 러너](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:3721>), [Unity 표시](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:524>), [선택 기록](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:677>), [HUD](<E:/KING WAS ME/Unity/My project/Assets/Scripts/GameHud.cs:85>), [에필로그](<E:/KING WAS ME/기획/04_story_bible.ink:831>)

## 7. 누락된 핵심 플레이 경험

**F10 — 결과의 두 번째 접점 [P1·사실/추정].** 즉시 대사가 다른 것과 뒤의 사건이 달라지는 것은 별개다. 다음 보고·NPC 업무·다른 국가 일정에 이전 결정이 나타나야 한다. 기록도 버튼 문구에서 “무슨 조치를 했고 무엇이 관찰됐는가”로 확장할 가치가 있다. 상대의 숨은 동기까지 기록할 필요는 없다. [HTML 회고](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2577>), [Unity 기록](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:673>)

**F11 — 회의 밖에서 결정을 체감하는 장면 [P2·사실].** 컷신 프레젠터는 있지만 Ink의 scene:cutscene 태그는 0개다. 서신·상자·문지기 시안이 현재 플레이 리듬에 연결된 것은 아니다. ACT 배경 변경도 사건별 장소 전환과 다르다. 발렌과 문지기의 짧은 대화처럼 왕이 돌아다니지 않아도 결과를 보여줄 수 있다. [진입 조건](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:531>), [현행 Ink](<E:/KING WAS ME/Unity/My project/Assets/Resources/Ink/story_bible.ink>), [NPC 원칙](<E:/KING WAS ME/기획/03_character_bible.md:630>)

**F12 — 다시 읽을 때 달라지는 경험 [P1·사실/추정].** HTML 2회차는 state를 새로 만들어 현대 연락·약속 이야기로 간다. 1회차 선택을 다시 보는 모드가 아니다. Unity는 같은 이야기 재시작이다. 최신 의도의 “같은 사건·대화가 조금 다르게 들리는 경험”은 전체 플레이로 입증되지 않았다. HTML의 잠깐 보이는 “분석”은 좋은 실험이지만 특정 사건의 고정 트리거이며 불안 상태에 따른 완성된 변화는 아니다. 기존 장면 하나의 나레이션 어투만 바꿔 비교하는 것이 다음 실험으로 적합하다. [순간 연출](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2711>), [2회차 초기화](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:3808>), [Unity 끝 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:686>)

**F13 — 실제 엔딩 연출 [P1·사실].** E24의 “Good/Bad Ending처럼 평가하지 않는다”와 에필로그 카메라 이동·암전은 주석이 아니라 일반 Ink 출력 줄이다. 이를 각각 엔딩 연출로 해석하는 처리는 현재 컨트롤러에서 확인되지 않았다. 기획 지문이 플레이 텍스트로 나오는 상태다. 장면·정지·입력·음향 연결이 남아 있다. [E24](<E:/KING WAS ME/기획/04_story_bible.ink:758>), [에필로그](<E:/KING WAS ME/기획/04_story_bible.ink:831>), [표시 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:524>)

**F14 — 후반 대신의 합류 경험 [P2·사실].** 로스터는 주요 4인과 동부 사절이다. Watcher/Chaplain/Fool은 Ink 소개 플래그와 발언이 있지만 대응 좌석 프로필이 없다. 일반 텍스트로 읽는 것과 새 대신 합류 체험은 다르다. 현행 발언명도 가안/확정 이름 대신 영어 직무명이다. [로스터](<E:/KING WAS ME/Unity/My project/Assets/Resources/Court/CourtRoster.asset>), [E17](<E:/KING WAS ME/기획/04_story_bible.ink:513>), [E27–28](<E:/KING WAS ME/기획/04_story_bible.ink:787>)

**F15 — 결과를 보여주는 지도 [P2·사실].** 지도는 met 태그를 받아 국가를 표시하지만 Ink에는 그 태그가 없다. 정의된 국가는 북·동·남·서 4개이며 해안은 없다. 지도 코드의 존재가 5개국 관계 체감의 완료는 아니다. 간단한 결과 서신으로 충분한지 먼저 비교할 수 있다. [접촉 공개](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/TempScreens.cs:41>), [국가 배열](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/TempScreens.cs:160>), [태그 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:530>)

## 8. 과잉 제작된 부분과 에셋 점검

### 수량과 사용 경로

[P2·사실] 대상 폴더 집계상 AI_Generated에는 PNG 64개·MP3 12개와 매니페스트가 있다(.meta 제외). UI_System에는 SVG 108개와 Export_PNG의 PNG 252개, PixAI/Candidates에는 PNG 24개가 있다. 무료 CC0 영역에는 1,187개 파일이 있고 대부분 이미지다. 이는 고유 디자인 수·품질·낭비를 뜻하지 않는다. 크기/상태 변형과 미리보기가 포함된다.

실제 참조를 확인한 미디어는 ACT 배경 5개, 오디오 12개, 주요 초상화 4개다. 좌석 다중 포즈·신규 얼굴 토큰·외부 사절 후보·대부분 UI 프레임은 현재 사용 경로가 확인되지 않았다. [AssetCatalog](<E:/KING WAS ME/Unity/My project/Assets/Resources/AssetCatalog.asset>), [로스터](<E:/KING WAS ME/Unity/My project/Assets/Resources/Court/CourtRoster.asset>), [UI 안내](<E:/KING WAS ME/Asset_Library/UI_System/README.md>), [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md>)

| 분류 | 판정 | 다음 조치 |
|---|---|---|
| 주요 4인 [P2·사실] | 세르안·발렌·리안 v2, 카르덴 v3가 프로필에 연결됨. 얼굴·실루엣 차이가 뚜렷해짐 | 정체성 기준 유지. 팔·가구 포함 범위는 용도별 검사 |
| 신규 5인 [P2·사실] | 베이라·오르반·자벨·아르데트·니아는 선택된 비캐논 초안과 원형 UI가 있음 | 실제 역할이 생기는 순서로 연결 |
| 외형 미승인 4인 [P3·사실] | 테사리엔·도반·단·미레시아는 승인 초상화 없음 | 다음 구간에 불필요하면 보류. 이름 확정과 외형 확정 구분 |
| 좌석 Cropped_v1 [P2·사실] | 진짜 알파가 있어도 팔/소매가 잘렸고 이미 거절 후보로 분류됨 | 본편으로 재승격하지 말고 비교용 보존 |
| WideFraming 후보 [P2·사실/추정] | 넓은 프레임은 개선. v3도 존재하지만 매니페스트 연결 설명은 충분히 최신이 아님 | 실제 좌석에 합성해 테두리·손·탁자 분리 확인 |
| PixAI [P2·사실/취향] | 직접 본 거절 표본은 주요 캐스팅보다 애니메이션풍이고 어려 보임. 매니페스트도 불일치 명시 | 실루엣 탐색 자료로 보관. 유료 생성 여부로 본편 적합성 판단하지 않음 |
| 날씨/시간 배경 [P2·사실/추정] | 변형은 있으나 현재 ACT별 연결이 주 경로 | 기한·시간 경과가 필요한 사건부터 사용. 일괄 추가 생산 보류 |
| 얼굴 UI [P2·사실/추정] | 주요 4인 60종, 신규 5인 75종은 인원×상태×크기 파생물. 접촉 시트에서 얼굴 구분 가능 | 실제 64px와 다양한 배경에서 확인. 색만으로 상태 전달 금지 |
| 버튼/카드/화살표 [P2·사실] | SVG 시스템은 재사용에 유리. 알파와 9-slice 설정 완료는 별개 | 기본 버튼·선택·의견 카드 한 세트의 확대/포커스부터 검증 |
| 무료 자료 [P2·사실/취향] | 종이·돌·단색 아이콘 후보와 캐주얼 참고용의 폴더 분리가 적절 | 채택 파일만 선별. 전체 라이브러리를 본편에 통합하지 않음 |

근거: [선택본과 후보 상태](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:108>), [UI 시스템](<E:/KING WAS ME/Asset_Library/UI_System/README.md>), [신규 얼굴 토큰](<E:/KING WAS ME/Asset_Library/UI_System/Export_PNG/FutureAdvisorFaceTokens/README.md>), [무료 분류](<E:/KING WAS ME/Asset_Library/Free_ThirdParty/README.md>)

**투명도·크롭 [P2·사실]:** 확인한 초상화와 좌석 후보는 RGBA 및 투명 픽셀을 가진다. 배경 분리가 완벽하다는 의미는 아니다. 테두리 잔색·소매 잘림·가구 조각은 합성 검사 대상이다. 선택본들의 해상도와 바운딩 박스가 달라 파일 크기 통일만으로 화면 스케일이 맞지 않는다.

**포즈 일관성 [P2·사실]:** 주요 프로필의 seatedPoses는 비어 있다. SeatView 반응은 전체 인물의 이동·회전 등이며 실제로 고개·팔이 다른 포즈 이미지로 바뀌는 것과 다르다. 유용한 임시 연출이지만 다중 포즈 완료 증거는 아니다. [프로필](<E:/KING WAS ME/Unity/My project/Assets/Resources/Court/Advisor_seran.asset>), [반응 처리](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/SeatView.cs:371>)

### 라이선스·출처

권리 침해를 확인했다는 판단이 아니라 배포 준비에서 확인할 사항이다. 새 다운로드·구매·약관 동의는 하지 않았다.

| 대상 | 확인한 사실 | 남은 확인 |
|---|---|---|
| AI 생성 이미지 [P2·사실] | 내장 생성 도구·참고 이미지·일자·선택/후보·비캐논 상태가 상당 부분 기록됨 | 도구 기록은 CC0 선언이나 제3자 권리 검증이 아님. 배포 파일별 생성 도구·참고 출처·당시 조건 연결 |
| PixAI [P2·사실] | 거절/외부 캐스트 탐색 후보로 분리됨 | 모든 모델·추가 모델·참고 이미지의 배포 근거는 확정하지 못함. 유료 API만으로 일괄 상업 이용 허가라 기록하지 않음 |
| ElevenLabs [P2·사실] | 과거 기록은 Starter에서 music_v2 5곡·환경음 5·UI음 2를 생성했다고 명시. MP3와 참조가 존재 | 생성 당시 플랜·모델·일자 및 출시 형태 확인. 일반 오디오와 음악 전용 약관 구분 |
| 나눔 폰트 [P2·사실/미검증] | 공식 OFL 안내와 폰트 로더·참조 확인 | 실제 Fonts 폴더는 읽기 범위 밖. 배포 파일 종류·라이선스 동봉 미검증 |
| 무료 자료 [P2·사실] | 다운로드 기록에 출처·아카이브·SHA·라이선스 표기. Skymon 원 페이지 CC0 직접 확인 | 모든 팩을 재확인한 것은 아님. 실제 채택 파일만 원문·고지·출처 사본 확인 |

근거: [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md>), [오디오 작업 기록](<E:/KING WAS ME/MVP/development/verification/elevenlabs-audio-20260919_claude_report.md>), [무료 다운로드 기록](<E:/KING WAS ME/Asset_Library/Free_ThirdParty/download_results.json>), [폰트 로더](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/UiFonts.cs>)

**음악의 구체적 조건 [P2·사실]:** 2026-09-20 확인한 ElevenLabs Music 전용 약관은 v1/v2에 적용되고 Starter의 상업 이용 허용에 예외를 둔다. “Studio Games”는 단순히 대형 스튜디오 게임이 아니라 복수 플랫폼에 제공되는 상업 게임을 포함한다. “결제했으니 PC·콘솔·모바일 모두 가능”이라고 단정할 수 없다. 지금은 드래프트로 보관하고 배포 플랫폼과 플랜을 대조해야 한다. 음악의 플랜 변경에는 별도 조항이 있어 일반 음성 FAQ도 그대로 대입하면 안 된다. [Music 전용 약관](https://elevenlabs.io/eleven-music-model-specific-terms), [일반 생성 오디오 안내](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)

**폰트·무료 자료 [P2·사실]:** 나눔 폰트는 단독 판매 제한과 저작권/라이선스 고지 조건을 보존해야 한다. Skymon의 CC0 확인을 다른 팩에 자동 확장하지 않았다. [네이버 공식 안내](https://help.naver.com/service/11029/contents/18088?lang=ko&osType=PC), [Skymon 원 배포 페이지](https://opengameart.org/content/skymon-icon-pack-free)

### 지금 멈출 제작 / 다음 필요한 제작

- [P2·추정] 중단 권고: 새 국가 외형 확정, 후반 4인 일괄 초상화, 추가 UI 테두리/색상 묶음, 사건 없는 날씨 배경, 화풍 불일치 후보 대량 생성.
- [P1·추정] 우선 제작: 시험 구간 한 인물의 발화/청자 반응 2–3포즈, 가구 조각 없는 반신, 서신 또는 상자 한 장, 결과가 달라지는 외부 장면 한 장. 사용 시점과 화면 영역을 먼저 정한다.
- [P2·사실/추정] 후보·거절·선택 구분과 원본 보존은 유지한다. 많이 만들어 필요한 것을 고르는 승인된 탐색 단계에서, 선별·연결 단계로 전환할 시점이다.

## 9. 캐릭터별 진단

| 인물 | 구분되는 강점 | 위험과 다음 검증 |
|---|---|---|
| 세르안 [P1·사실/추정] | 사실/해석을 나누고 불확실성을 인정 | 매번 마지막 정답을 말하면 다른 인물이 들러리가 됨. 불확실해도 행동을 허용하거나 발렌을 옹호하는 장면 필요 |
| 발렌 [P1·사실/추정] | 행동 시점·미루는 비용, 짧은 말투 | 전쟁광으로 축소하지 않음. 문지기와 업무 대화, 행동하지 않기로 하는 순간이 입체성을 줌 |
| 리안 [P1·추정] | 말과 행동의 간격·상호작용의 여지 | 덜 기억되는 원인이 이름인지 노출량인지 입증 안 됨. 이름 유지, 상대의 정확한 표현을 짚어 조건을 바꾸는 대표 행동 검증. “단정하지 말자”만 반복하면 세르안과 겹침 |
| 카르덴 [P1·사실/추정] | 외부 문제를 내부 인력·시간·업무 비용으로 번역 | 단절 권유나 플레이어 비난 담당으로 고정하지 않음. E19 횟수는 실제 이력에 맞춰야 함. 여성 v3 선택은 재논의하지 않음 |
| 베이라 [P2·추정] | 가설·보고 공백 | 세르안과 달리 어떤 가설을 확인할지 새 선택을 제공. 등장 후 일반론 한 줄로 끝내지 않음 |
| 오르반 [P2·사실/추정] | 끝난 뒤 남는 신뢰와 의미 | 상실 조건과 E27 무조건 소개의 불일치 정리. 등장시키려 실패를 강제하지 않음 |
| 자벨 [P2·사실/추정] | 성숙한 농담으로 관점을 떼어냄 | 독설 정답기·플레이어 조롱 금지. 니아와 순수함 역할을 공유할 필요 없음 |
| 아르데트 [P2·추정] | 선택의 패턴 보존 | 단순 로그 낭독과 구별. “원래 이런 사람” 대신 관찰한 반복만 제시 |
| 니아 [P2·사실/추정] | 전략에 가려진 최초 목적에 대한 질문 | 진실을 아는 순수한 판정자로 만들지 않음. 목적이 바뀔 권리도 인정 |
| 단 [P2·추정] | 책임의 범위·공정함 | 세르안의 사실 구분과 차별화하고 처벌 정답 캐릭터가 되지 않음 |
| 테사리엔 [P3·추정] | 반복 문제에서 규칙 자체를 바꾸는 질문 | 구체적 제도 문제와 기존 대응 비용이 먼저 축적되어야 함 |
| 도반 [P3·추정] | 기존 목표 밖의 미래 | 발렌의 즉시 실행과 다른 장기 프로젝트가 필요. 현 슬라이스에 필수 아님 |
| 미레시아 [P3·추정] | 지속 가능한 일상 기능·회복 | 카르덴과 겹침. 심리 진단보다 구체적 휴식·업무 조정으로 구별 |

근거: [주요 4인](<E:/KING WAS ME/기획/03_character_bible.md:21>), [후반 인물](<E:/KING WAS ME/기획/03_character_bible.md:283>), [등장 질문](<E:/KING WAS ME/기획/03_character_bible.md:599>), [선택 외형](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:108>)

[P1·추정] 기억성은 얼굴 차이만으로 완성되지 않는다. 각자가 틀릴 수 있는 주장 → 다른 인물의 반박 → 자기 방식을 조금 고치는 순간을 갖는 편이 소개 대사보다 강하다. E4·6·8의 관계 대사는 보존하되 매 사건 네 명 모두 발언하게 강제하지 않는다. [성장 원칙](<E:/KING WAS ME/기획/03_character_bible.md:1>), [E8](<E:/KING WAS ME/기획/04_story_bible.ink:284>)

## 10. 현재 화면 시퀀스 평가

FixedBackgroundSequence_v1의 01–06 PNG를 모두 직접 봤다. Unity 실제 실행 캡처로 취급하지 않았다.

- [P2·사실] 같은 공간에서 인물·UI만 바뀌므로 한 만남의 연속성이 좋다. 배경 고정은 이 장면 안에서 유효하며 외부 장면까지 같은 배경일 필요는 없다.
- [P2·사실/추정] 큰 인물 → 인물 없는 의견 비교 → 선택 카드의 순서는 정보 목적을 분리한다. 왕을 그리지 않고 마지막 입력 주체를 드러낸다.
- [P3·취향] 어두운 판과 절제된 금색은 현재 톤에 어울린다. 시안만으로 모바일 수집형 게임 UI라고 판정할 정도는 아니다.

근거: [01 리안](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/01_rian_observation_v1.png>), [05 의견](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/05_advisor_opinion_summary_v1.png>), [06 선택](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/06_king_decision_cards_reveal_v1.png>)

| 항목 | 발견과 영향 | 등급 |
|---|---|---|
| 좌우 전환 | 리안의 오른쪽→왼쪽은 발화 슬롯 교체면 자연스럽지만 실제 이동으로 읽히면 혼란. 퇴장/전환 규칙 필요 | [P2·추정] |
| 시선 | 첫 리안은 화면 밖 방향, 발렌은 안쪽을 봄. 등장 방향과 상대 위치를 맞추면 안정적. 단순 반전은 광원/의상까지 뒤집음 | [P3·취향] |
| 발렌 합성 | 일러스트에 붙은 탁자 조각이 배경 가구와 겹침. 인물 단독 레이어 느낌을 깨뜨림 | [P2·사실] |
| 의견 축소 | 06의 의견 글자가 05보다 현저히 작음. 선택 순간의 비교 정보를 장식처럼 줄이지 않는 편이 좋음. 실제 해상도 검사는 미실행 | [P2·사실/추정] |
| 내용 대립 | 세 의견이 양립 가능한 신중한 대응에 가까움. 화면의 이해 용이성과 선택의 깊이는 별개 | [P2·추정] |
| 이동 연출 | PNG는 전후 상태만 보여줌. 속도·읽기 완료·포커스·이동 중 오입력은 알 수 없음 | [P2·사실] |
| 인원 확장 | 시안은 3장. Unity는 W/n < 190이면 의견 최소 폭이 좌석보다 커짐. W=909 기준 5인부터 겹칠 여지 | [P2·사실/추정] |
| 접근성 | 색 이외 상태 단서, 글자 크기, 키보드로 의견 전문 확인, 자동 연출 완화 필요. 구현된 Space/Enter·1–9는 유지 | [P2·추정] |

근거: [02 세르안](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/02_seran_response_v1.png>), [03 발렌](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/03_valen_proposal_v1.png>), [04 리안](<E:/KING WAS ME/MVP/development/mockups/Dialogue/FixedBackgroundSequence_v1/04_rian_moderation_v1.png>), [최소 폭](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/SeatView.cs:240>), [34자 요약](<E:/KING WAS ME/Unity/My project/Assets/Scripts/Court/SeatView.cs:354>), [입력](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:421>)

[P2·추정] 권장 흐름: 마지막 대사 → 의견 전문을 읽는 정지 → 진행 입력 → 의견을 상단에 유지하며 선택 표시. 이동 중 선택을 받지 않고, 이동 후에도 의견을 다시 읽을 수 있어야 한다. 자동 표시를 유지해도 대기 시간을 선택 압박으로 쓰지 않는다. 카드 수가 늘면 무조건 축소하지 말고 해당 안건의 발언자만 표시하거나 다른 배치를 검증한다.

### HTML의 잔존 표시 문제

- [P2·사실] eventNo에 현재/전체 사건 수와 진행 비율을 쓴다. 전체 길이를 숨기려는 최신 방향과 다르다. Unity 기록은 사건 번호를 숨긴다. [HTML](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2736>), [Unity](<E:/KING WAS ME/Unity/My project/Assets/Scripts/StoryController.cs:677>)
- [P2·사실] 첫 사건이 장부인데 첫 진행 버튼에 “사절을 맞이한다”가 남아 있다. 삽입 후 오래된 위치 조건이 남은 사례다. [버튼](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2753>)
- [P2·사실/표시 미검증] 일부 설명 문자열에 실제 줄바꿈 대신 역슬래시+n이 들어가는 이중 이스케이프가 있다. textContent 대입 시 문자가 노출될 수 있다. 브라우저 재현은 못 했다. [문자열](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:1771>), [표시](<E:/KING WAS ME/MVP/development/KING_WAS_ME_KINGDOM_SLICE.html:2739>)

## 11. 향후 2주 우선순위

아래는 새 구현의 자동 승인이 아니라 제작 제안이다. 기간은 추정이며 동시 작업량을 제한한다.

| 기간 | 완료할 결과 | 확인 기준 |
|---|---|---|
| 1–2일 [P1] | 파견/방문/귀환/중단 상태와 E23–26 결과 기준 정리 | 취소하면 도착하지 않음. 귀환하면 현지 장면 강제하지 않음. 마지막 선택과 결과 일치 |
| 3–5일 [P1] | 짧은 구간의 선택→반응→후속 결과 | 첫 왕정 업무, E4/E6 관계 장면, 취소/경계 재결정의 일부를 후보로 선택. 29개 동시 집필 금지 |
| 6–8일 [P1/P2] | 해당 구간의 대화→의견→선택→결과를 실제 Unity에 연결 | 소개 전에 새 인물이 보이지 않음. 이전 반응 중 다음 장소로 바뀌지 않음. 의견 재확인 가능 |
| 9–10일 [P2] | 필요한 자산만 합성·음향·화면 검증 | 3/4/5인, 1280×720·1920×1080, 긴 한국어, 키보드, 소리 크기와 반복 이음새 |
| 11–12일 [P1] | 소수 외부 플레이 관찰 | 반전을 설명하지 않은 3–5명 정도의 정성 관찰. 선택 이유·결과 이해·다음 사건 기대를 기록 |
| 13–14일 [P1/P2] | 관찰 반영과 확장 판단 | 가장 혼동한 선택/결과 수정. 2회차는 기존 한 장면의 미묘한 나레이션 변화만 별도 비교 |

[P1·추정] 좋은 완료 기준은 추가 장면 수가 아니라 다음 질문이다.

1. 선택 전에 사실과 대신의 해석을 구분했는가?
2. 두 선택 사이에서 무엇을 포기할지 설명할 수 있는가?
3. 뒤에 온 결과를 이전 조치와 연결했는가?
4. 이름을 잊어도 어떤 대신의 관점인지 구분했는가?
5. 반전을 몰라도 다음 사건을 보고 싶어 했는가?

근거: [목적 보존](<E:/KING WAS ME/MVP/development/DESIGN_INTENT.md>), [기존 자문](<E:/KING WAS ME/MVP/development/MVP_DESIGN_ADVISORY.md>), [작업 목록](<E:/KING WAS ME/MVP/development/REMAINING_WORK.md>), [로드맵](<E:/KING WAS ME/MVP/development/ROADMAP.md>)

## 12. 지금 하지 말아야 할 작업

- [P1·추정] 후반 실패를 기정사실로 두고 이전 선택을 모두 맞춰 쓰기. 선택 목적과 결과를 먼저 정리한다.
- [P2·추정] 29사건 대사 동시 확장. 검증되지 않은 반복을 늘릴 위험이 있다.
- [P2·추정] 새 대신을 먼저 그리고 그 인물을 쓰려고 장면을 발명하기.
- [P2·추정] 숨은 7축 복원만으로 전략성을 해결하려 하기.
- [P2·추정] 최고 호감도 국가 선별·관계 점수 바·감정 정답 라벨 추가.
- [P2·추정] 자유 탐색 허브·전면 지도·새 협업 대시보드를 필수 선행 작업으로 확대하기.
- [P2·추정] 사용 사건 없는 배경·버튼·표정 묶음 대량 생산.
- [P2·사실] 과거 PASS나 “오디오 없음/이미지 미연결”을 현행 검증으로 재사용하기.
- [P3·추정] 새 결론 없이 양쪽 AI가 전체 자료를 주기적으로 다시 읽기.

보호 원본을 삭제하거나 승인된 방향을 취소하자는 뜻이 아니다. 다음 작업의 순서를 제한하자는 제안이다. 근거: F01–F05, [폴링 폐지](<E:/KING WAS ME/MVP/development/ROADMAP.md:14>), [오래된 자산 설명](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:26>)

## 13. 사용자에게 필요한 결정

확정 이름·카르덴 여성 선택·다국가 방향·비캐논 구분은 재승인 항목으로 만들지 않는다.

1. **[P1·추정] 동부 결과 평가:** 모든 왕의 실패로 결론 내리지 않고 선택한 관계 형태와 실제 비용을 보여줄 것을 권한다. 거리를 유지하려던 선택도 유효해야 한다.
2. **[P1·추정] 2회차 최소 형태:** 같은 장면·대사의 작은 나레이션 차이부터 검증할 것을 권한다. HTML 현대 파트는 과거 실험으로 보존하고 전체 재집필은 별도로 판단한다.
3. **[P2·추정] 첫 시험 구간의 화면 약속:** 주요 4인과 필요한 NPC, 대화→의견→선택, 짧은 결과 컷에 집중한다. 13인 좌석·자유 지도 허브는 다음 단계다.
4. **[P2·추정] 기한의 목적:** 전령 출발이라는 상황 변화는 유지하되 읽기 속도만 벌하지 않는 시작 시점·완화 방식을 정한다.
5. **[P2·사실/미검증] 상업 배포 플랫폼과 음악 권리 범위:** 출시 형태가 정해지면 Music 전용 약관과 실제 플랜을 대조한다. 추가 결제를 먼저 할 사안으로 보지 않는다.

근거: [다국가 결말](<E:/KING WAS ME/기획/05_multi_kingdom_relationship_routes.md>), [2회차 TBD](<E:/KING WAS ME/기획/04_story_bible.md:1697>), [등장 원칙](<E:/KING WAS ME/기획/04_story_bible.md:1817>), [타이머](<E:/KING WAS ME/00_START_HERE.md:49>), [음악 약관](https://elevenlabs.io/eleven-music-model-specific-terms)

### 제작 관리와 Drift 방지의 최소 기준

**F16 — 문서 갱신 상태가 권위를 흔든다 [P2·사실].** 시작 안내·DESIGN_INTENT·ROADMAP·REMAINING_WORK는 목적/작업/순서를 나누지만 상단 현황이 서로 다른 시점을 가리킨다. 매니페스트에도 “오디오 생성 안 됨”, “초상화 연결 전”이 남아 있다. 현재 파일을 읽지 않은 다음 작업자가 해결된 문제를 반복할 수 있다. [시작 안내](<E:/KING WAS ME/00_START_HERE.md:22>), [DESIGN_INTENT](<E:/KING WAS ME/MVP/development/DESIGN_INTENT.md:26>), [ROADMAP](<E:/KING WAS ME/MVP/development/ROADMAP.md:10>), [매니페스트](<E:/KING WAS ME/Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md:26>)

**F17 — 최신 결론을 찾는 비용 [P2·사실/추정].** 확인 당시 verification Markdown 101개, reviews 29개, requests 64개였다. 수 자체가 문제는 아니지만 현재 상태를 찾기 위해 모두 읽어야 하면 검토 비용이 증가한다. 같은 문서 안에 초기 상태와 뒤의 완료 기록이 공존한다. [ROADMAP](<E:/KING WAS ME/MVP/development/ROADMAP.md>), [인수인계](<E:/KING WAS ME/MVP/development/verification/session-handoff-20260919_claude_note.md>)

**F18 — 자동화 설명 충돌 [P2·사실].** ROADMAP은 10분 폴링 폐지를 명시하지만 협업 README는 ACTIVE·10분이라고 적혀 있다. 실제 스케줄러는 이번에 조회/변경하지 않았으므로 현재 실행 중이라고 단정하지 않는다. 문서 불일치만 기록한다. [ROADMAP](<E:/KING WAS ME/MVP/development/ROADMAP.md:14>), [협업 README](<E:/KING WAS ME/MVP/development/collaboration/README.md:16>)

권고하는 최소 운영 [P2·추정]:

- 현재 플레이 파일·기준 빌드·최신 결정·다음 한 작업을 가리키는 짧은 색인을 둔다. 역사는 지우지 않는다.
- 핵심 기준 5개: 1회차 왕국 자체의 재미 / 관찰 가능한 결과 / 상대 내면 단정 금지 / 대신도 수정·성장 가능 / 재해석을 모두 설명하지 않음.
- 작업마다 바꿀 플레이 경험과 확인할 장면을 한 줄로 남긴다.
- 구현자와 검토자는 바뀐 범위와 관련 회귀를 우선 확인한다. 전체 독립 검토는 마일스톤에서 한다.
- 자산은 제안·선택된 비캐논 초안·실제 연결·거절로 구분한다. 이름 확정과 문화/나이의 캐논 확정도 나눈다.
- 공동 편집 잠금은 유지하되 이번처럼 읽기만 하는 독립 검토에 불필요한 대기를 만들지 않는다.
- 주기 폴링·토큰 대시보드 확대보다 해시·출처·최신 결과 링크를 남기는 가벼운 방식을 유지한다.

이번에는 위 문서나 자동화 설정을 수정하지 않았다.

## 14. 검토 근거와 한계

### 읽은 범위

- 시작 안내, 협업 스킬, 01–05 기획, DESIGN_INTENT, MVP_DESIGN_ADVISORY, REMAINING_WORK, ROADMAP, 지정 인수인계를 읽고 관련 조항을 대조했다. _shared 통합안은 읽기만 했다.
- 기획 Ink 870줄 및 Unity 런타임 Ink, StoryController·GameHud·Court 계열 스크립트, 로스터·프로필·AssetCatalog 참조를 확인했다.
- Unity 읽기는 Assets/Scripts, Assets/Resources, Assets/AI_Generated, ProjectSettings로 제한했다. Library·Temp·Logs를 읽지 않았고 Scenes·Editor·Fonts·Packages 내부도 읽지 않았다.
- 이미지 직접 확인: 고정 배경 시퀀스 6장, 주요/신규 얼굴 접촉 시트, UI 묶음 시트, 거절 PixAI 표본, 넓은 세르안 좌석 후보, ACT 배경 표본. 모든 이미지·모든 크기의 전수 시각 검사는 아니다.
- 과거 작업 기록은 확인의 출발점이며 다른 에이전트가 실행한 결과를 이번 실행으로 옮기지 않았다. Claude 전체 중간 점검 보고서는 읽지 않았다.
- 목록 수집 중 UI_System 일부 임시 pip 폴더의 접근이 거부되었다. 원본 UI/Export_PNG와 대상 문서를 중심으로 확인했고 임시 폴더를 우회하지 않았다.
- 공식 라이선스 웹 자료는 2026-09-20에 확인했다. 무료 팩 전체와 배포물 전체의 법적 검증은 아니다.

### 실제 수행한 검사

| 검사 | 결과와 범위 |
|---|---|
| HTML 두 script 문법 | 파일 변경 없이 Node 구문 파서로 문법 오류 없음 확인. DOM·브라우저 동작 검증 아님 |
| HTML 데이터/순수 함수의 제한 경로 | 첫 선택 위주·마지막 선택 위주·교류 중단 포함의 세 경로에서 데이터와 반응 구성 확인. 클릭·타이머·전 조합 검증 아님 |
| 기획/런타임 Ink 해시 | 두 SHA256이 동일. 과거의 불일치를 현행 문제로 재보고하지 않음 |
| Ink 변수/라우팅/태그 | 7축 선언뿐, eastPressure 읽기 없음, 취소/귀환 상태 부재, 국가 문턱, cutscene/met 태그 0개 확인. 모든 Ink 경로 실행 아님 |
| 자산 참조 | 배경 5개·MP3 12개·핵심 초상화 4개를 파일 기준 확인. 재생·음량·실제 화면 검증 아님 |
| PNG 메타데이터/시각 표본 | RGBA/투명 영역·크기·합성 시안 확인. 알파 검사가 가장자리 품질을 보증하지 않음 |

### 실행하지 못한 것

- HTML 실제 플레이: 브라우저 도구의 로컬 file URL 정책에 차단됨. 우회 서버나 다른 경로로 재접근하지 않았다.
- Unity 실행·컴파일·빌드: 수행하지 않았다. 이 세션에서 Unity 제어 도구도 확인되지 않았다. ProjectSettings 버전은 6000.1.4f1이며 빌드 설정에는 SampleScene 경로가 있으나 범위 밖 Scene 실제 연결은 미검증이다.
- 오디오 실청취: 미실행. 음악 품질·루프 이음새·음량 균형 미검증.
- 완주 시간·재미·반전 효과·이름 기억성: 직접 완주나 외부 관찰로 입증하지 못했다. 본문에서는 추정/취향으로 구분했다.
- 모든 분기·해상도·접근성: 전수 실행하지 않았다.
- 실제 자동화 상태·배포 라이선스 동봉: 조회/검증하지 않았다.

### 기준 파일 SHA256

| 파일 | SHA256 |
|---|---|
| 00_START_HERE.md | 450348c45c967a90f2a0870673a6b6ea2ef587ff103d6a0c777072688b634663 |
| MVP/development/KING_WAS_ME_KINGDOM_SLICE.html | 9aecdb66046f866f8c59c22ef27f103d8f6ae286d9c73df67846cb5cc0b467cd |
| 기획/04_story_bible.ink | b1d861879e3ddc896ef58744fa683f7fdc1c2e24383a6b7266de4999028a43ed |
| Unity/My project/Assets/Resources/Ink/story_bible.ink | b1d861879e3ddc896ef58744fa683f7fdc1c2e24383a6b7266de4999028a43ed |
| Unity/My project/Assets/Scripts/StoryController.cs | 2f5864f3ccb52c4d54fa899341cc06688df6754b953991ddf1a419e2a1e36aa6 |
| Unity/My project/Assets/AI_Generated/ASSET_MANIFEST.md | 31a9f73eff6b5fa7ed74e25adc869a88b2543c9f1ecee6eba90c375e63beecce |

보고서 완료는 게임 검증 완료가 아니다. 다음 제작의 핵심은 현재 선택이 다음 장면의 사실을 바꾸고, 그 결과를 본 플레이어가 다시 결정하는 한 구간을 실제로 확인하는 것이다.

보고서 저장 후 위 기준 파일 6개의 해시를 다시 대조했으며 모두 동일했다. 보고서의 14개 필수 절, UTF-8 문자와 근거 링크를 점검했다.

검토 종료.
