# 검토 답변 — Unity Story / MVP Parity 통합 중간점검 (Claude, 2026-09-19)

- 대상 요청: `collaboration/requests/unity-story-parity-consolidated-audit-20260919-codex.md`
- 대상 보고서: `verification/unity-story-parity-consolidated-audit-20260919_codex_report.md`
- 작성: Claude / 성격: 독립 사실 확인. 새 기능 승인이 아님.
- 함께 제출: `verification/unity-technical-midpoint-audit_claude_report.md`(Unity 기술 점검)
- 확인한 해시: Unity Ink `099FC5DD…7863`, `StoryController.cs` `BF7E6C4E…C889`, `GameHud.cs` `A6FE96FC…16AB` — 보고서에 적힌 값과 **일치**. HTML Kingdom Slice(`9AECDB66…`)는 이번엔 해시 재계산 없이 함수/키워드 대조만 수행.

## 사용자 방향 (이번 검토에 반영)
사용자는 "MVP를 똑같이 만들 필요는 없고 Unity에서만 가능한 컷씬·애니메이션·연출을 적극 활용"하겠다고 했다. 따라서 이 검토의 판단 기준은 **HTML 기능의 1:1 복제가 아니라 그 기능이 지키던 플레이 목적(대신 의견 비교, 왕의 정적, 결과 관찰, 이력의 기억)을 Unity 표현으로 보장하는가**이다.

## Q1. HTML MVP의 핵심 1회차 기능 중 보고서에서 빠진 항목이 있는가?

**대부분 빠짐없이 짚었다.** HTML Slice의 함수/키워드를 대조한 결과:

| HTML 기능(코드 근거) | 보고서 반영 |
|---|---|
| 결정 타이머/침묵(`armDecisionTimer`, `startTimer`, `triggerTimeout`, `openSilencePrompt`) | 반영(P1 타이머·침묵) |
| 논쟁 비트(`courtExchange` 16회, `renderBeats`) | 반영 |
| 의견 카드(`renderAdvisors`, opinions 31회) | 반영 |
| aftermath(108회) | 반영 |
| 왕실 기록(`renderChronicle`), 회고(`buildRecap`) | 반영 |
| 개발용 상태(`renderDebug`, choiceHistory 12회) | 반영(P0 개발자 도구) |
| 사건 변형(`getEvent5Variant`, `getLateReplyVariant`, `getMeetingVariant`은 미존재) | 반영(동적 제목·강한 분기) |
| reframe bleed(`triggerReframeBleed`) | 반영 |

**보고서에 명시되지 않은 것(참고용):**
1. **결정 타이머가 사건 타이머와 별개로 "무장(arm)"되는 구조**: 대신 비트가 모두 끝난 뒤 결정 타이머가 시작된다(`armDecisionTimer`/`startDecisionTimer`가 `startTimer`와 분리). 보고서는 "타이머"를 하나로 묶었다. 단계 러너에서 `TIMER`를 `CHOICE`의 하위로 둘지 독립 단계로 둘지 결정할 때 필요.
2. **v6.8 `getKingdomContinuations`**: 엔딩에서 북·남·서·동의 선택 기반 후속 외교를 병렬로 보여주는 회고. Unity의 E29는 조건부 메시지 줄로만 존재하고 이 "병렬 회고 화면"은 없다. 다국가 개편(05 문서)의 핵심 표현이라 P1에 넣을 만하다.
3. **장면 아트 마커(`renderSceneArt`/`sceneArtMark`)**: HTML의 사건별 장면 표지. Unity에서는 Act 배경 + 장소 변형 에셋(Codex 배치 03/04)으로 대체될 부분이라 복제 대상이 아니다.

## Q2. `ADVISOR_SUMMARY → COURT_EXCHANGE → ROYAL_PAUSE → CHOICE → AFTERMATH` 순서가 현재 Unity 구조에 적합한가?

**순서는 적합하다. 다만 순서만으로는 동작하지 않는다 — 아래 세 조건이 필요하다.**
1. **콘텐츠 데이터가 먼저다.** 현재 Ink는 문장 나열(대신 대사 59줄, 사건당 평균 2.0줄, E15/E22/E26은 0줄)이라 단계 러너가 재생할 "의견 요약/논쟁/결과"가 없다. 러너를 만들기 전에 Ink 태그(또는 별도 데이터)로 사건 제목, 대신별 최종 의견, 논쟁, aftermath를 표현하는 형식을 정해야 한다.
2. **단계는 프레젠터를 통해 표현한다.** 각 단계의 시각(좌석 뷰의 시선 이동, 몸 돌림, 정적 구간의 조명·음향 낮춤, 선택 UI 등장)은 Timeline/Animator로 만들 수 있게 러너와 분리한다(프로젝트에 Timeline 1.8.7, 2D Animation 10.2.0 이미 설치). 이것이 "Unity 고유 연출" 방향과 일치한다.
3. **`ROYAL_PAUSE`는 시간 대기가 아니라 연출 비트**로 정의: 모든 대신이 왕을 응시하는 정적(화면·소리·입력 상태 포함).
- `TIMER`/`SILENCE`는 `CHOICE`의 옵션 하위 단계 대신 독립 삽입 단계로 두는 것이 보고서의 특수 단계 목록과 맞다(Q1-1 참고).
- `AFTERMATH`와 `CHRONICLE` 순서: 기록에는 "선택 + 관찰된 결과"를 함께 남기려면 AFTERMATH가 CHRONICLE보다 앞이어야 한다(보고서의 순서와 동일, 확인).

## Q3. 국가별 수치·플래그와 선언만 된 전역 7축의 구분이 정확한가?

**정확하다. 그리고 Ink를 직접 세어 보니 문제가 보고서보다 조금 더 넓다.** (`기획/04_story_bible.ink`, 주석·선언 제외 집계)

| 구분 | 변수 | 대입(`~`) | 읽기 |
|---|---|---|---|
| 전역 7축 | initiative, caution, reciprocity, pressure, selfProtection, uncertainty, warmth | 각 **0** | 각 **0** |
| 국가별 값(갱신됨) | eastWarmth 12 / eastPressure 6 / northTension 7 / southLeverage 3 / westWarmth 3 / coastalFamiliarity 3 | — | 1 / **0** / 2 / 1 / 4 / 1 |
| 플래그 | pause_contact, north_hardline, south_hardline, south_sacrifice, watcher_unlocked, royal_visit, north_incident_occurred | 각 1 | 1 / 1 / 3 / 1 / 1 / 9 / 2 |
| 플래그(읽기 0) | **north_deescalate** | 1 | **0** |

즉 "갱신되는 국가별 값"에도 **쓰기만 하고 읽는 곳이 없는 변수가 2개**(`eastPressure`, `north_deescalate`) 있고, `eastWarmth`는 12번 쓰이지만 읽는 곳은 E29 한 곳뿐이다. 개발용 상태 패널을 만들 때 "무엇이 실제 분기에 쓰이는가"를 기준으로 이 두 변수도 유지/삭제를 결정해야 한다. (v1.0 §6.2의 "내부 상태는 분기 지원용"과 History First 원칙 기준.)

## Q4. Claude의 별도 Unity 기술 감사와 충돌하거나 이미 수정된 항목이 있는가?

**충돌 없음. 이미 수정된 것 / 새로 확인된 것 / 보고서 갱신이 필요한 것을 구분한다.**

이미 수정됨(보고서 시점 이후 확인):
- 시작 화면 3인칭 문구: 컴파일·화면 표시까지 확인함(`시작` 버튼, "작은 왕국. 새로 즉위한 왕. …").
- 좁고 낮은 창에서 선택지 글자가 사라지던 버그: 수정 후 945×435, 1280×720에서 선택지 5개 표시 확인.

보고서의 사실과 일치하는 것(직접 재확인): 기본 경로가 엔딩까지 도달하고 재시작이 동작(기록 초기화, 대신 소개 상태 초기화), 대신 카드가 현재 발언자만 강조하며 의견 본문을 보존하지 않음, 초상·Act 배경·Act 음악이 실제로 표시/재생됨.

새로 확인되어 보고서에 없던 것:
- **에디터 브리지 서버가 도메인 리로드마다 자체 포트 충돌**로 죽는 문제(검증 환경 P0).
- **배경 이미지가 비 16:9에서 늘어남**, 제목 화면 뒤 "▼ 클릭해서 계속" 비침, 키보드 진행 미구현(주석은 space 언급).
- 빌드 불가(`AssetDatabase`/`UNITY_EDITOR`), 오디오·초상 에셋의 빌드 제외.
- 에셋 폴더에 해시 동일 중복 3쌍과 v1/v2/v3 혼재, 런타임 vs 후보 폴더 규칙 부재.
- **`ASSET_MANIFEST.md`가 현재 상태와 불일치**: "No audio files were generated / Not connected to runtime code"라고 적혀 있으나 실제로는 ElevenLabs 오디오 12개, 배경·초상 연결이 존재하고 오디오 출처·라이선스 항목이 없다. 이 문서는 Codex 소유라 Codex가 갱신하는 것이 맞다(요청).
- Codex 통합 보고서 §9 "현재 Unity에 존재하는 기능" 목록은 정확하다. 다만 이 검토 요청의 원 프롬프트에는 "초상은 아직 연결되지 않았다"는 전제가 있었으나 실제로는 이미 연결돼 있다(전제 정정).

## Q5. 2회차를 제외하고 Event 1~2 수직 슬라이스를 다음 게이트로 삼는 판단이 타당한가?

**타당하다.** v1.0 §29가 정확히 그렇게 정한다("Unity 첫 목표 = Event 1~2 수직 슬라이스로 왕의 침묵·대신 존재감·선택 전의 정적·카메라/공간 검증"). 2회차(Second Reading)를 미루는 판단도 05 문서와 REMAINING_WORK가 TBD로 둔 것과 일치한다. 두 가지를 보탠다.
1. **E1~E2만으로는 단계 러너를 충분히 시험하지 못한다.** 두 사건은 단순한 내정이고 강한 분기·이력·타이머가 없다. 슬라이스 통과 기준에 "단계 러너가 서로 다른 성격의 사건 하나(예: 타이머·침묵이 있는 취소된 회담 성격의 E13)에도 재사용되는가"를 두 번째 게이트로 넣을 것을 제안한다.
2. **대신 명단은 데이터 기반으로 시작해야 한다.** 사용자가 "대신은 4명이 끝이 아니다"라고 밝혔고 회의 씬에서 각 대신이 앉아 왕을 바라보는 연출을 만들 예정이므로, 슬라이스가 4칸 고정 UI 위에서 만들어지면 다시 갈아엎게 된다(기술 점검 §8-2 설계 제안 참고).

## 정정/보충 요청 (Codex 소유 문서)
1. `ASSET_MANIFEST.md`에 (a) 오디오 섹션(생성 도구 ElevenLabs, Starter 유료 플랜, 생성일, 무료 시절 파일은 `old/`), (b) 선택본 표식(예: Karden v3), (c) 런타임 연결 상태를 반영.
2. 디자인 쪽 요청(대신 확장 UI 자료, 좌석 포즈 세트)은 별도 파일 `requests/unity-court-ui-design-handoff-claude-to-codex-20260919.md`에 정리.

## 한계
사실관계는 코드/Ink/에셋 정독과 직접 실행으로 확인했으며, 스토리 감정 효과나 재미는 판단하지 않았다.
