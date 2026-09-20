# KING WAS ME 전체 중간 점검 — 공통 브리프 (2026-09-20)

이 문서는 Claude와 Codex가 **각자 독립적으로** 전체 점검을 하기 위한 공통 지시다. 두 보고서는 사용자가 종합한다. 이 문서 자체는 승인/새 기능 지시가 아니다.

## 0. 목적
지금까지의 작업이 (1) 초기 목적과 Do Not Drift에서 이탈하지 않았는지, (2) 실제로 무엇이 동작하고 무엇이 아닌지, (3) 남은 위험과 다음 우선순위가 무엇인지를 **증거 기반으로** 평가한다. "잘 되고 있다"는 결론이 목표가 아니다. 이탈·모순·과장된 완료 보고를 찾는 것이 목표다.

## 1. 규칙
1. **감사 전용.** 새 보고서 1개 외에는 파일을 만들거나 고치지 않는다(코드, Ink, 에셋, 문서, 설정, 잠금 파일, git 커밋/푸시 모두 금지). 검증 중 생긴 임시 파일(예: Unity 캡처, `Assets/Temp`)은 끝나기 전에 반드시 지우고 지웠음을 보고서에 적는다.
2. 패키지 설치, 외부 전송, 계정 로그인, 파일 다운로드는 하지 않는다. 필요하면 하지 말고 NOT TESTED로 적고 사유를 쓴다.
3. `MVP/blind_test`, `_shared`, `_history`, 루트 기준 HTML(`MVP/KING_WAS_ME_MVP.html`)은 읽기만 한다.
4. **독립성.** 자기 보고서를 끝내기 전에는 상대 에이전트의 `*full-midpoint-audit-20260920*` 보고서를 열지 않는다.
5. **기존 보고서는 주장으로 취급한다.** 이전 감사/작업 기록의 "완료", "PASS"는 직접 재확인하기 전까지 사실이 아니다. 일치하지 않으면 그 자체가 발견사항이다.
6. **증거 규칙.** 모든 발견에 근거(파일:줄, 실행한 명령과 출력, 스크린샷 경로 등)를 붙인다. 판정은 `PASS / PARTIAL / FAIL / NOT TESTED` 4가지만 쓴다. 사실과 추정을 구분해 쓴다. 실행하지 않은 검증을 완료로 쓰지 않는다.
7. 기준 원칙(위반 여부를 항상 본다): 진행 길이(N/29, ACT 번호, 장 번호) 노출 금지, 해석 예고 문구 금지, 수치·친밀도·2인칭("당신") 금지, 왕 비노출·왕은 마지막까지 직접 말하지 않음.

## 2. 먼저 읽을 것 (순서)
1. `00_START_HERE.md`
2. `MVP/development/DESIGN_INTENT.md` (§A 목적, §B 합의, §D 이탈 신호 9개)
3. `MVP/development/REMAINING_WORK.md`, `MVP/development/ROADMAP.md`, `MVP/development/MVP_DESIGN_ADVISORY.md`
4. `_shared/KING_WAS_ME_최신_통합_기획안_v1.0.md` (Do Not Drift 30항, §20 KING WAS YOU, §28.1, §29 Unity 이후 계획)
5. `기획/01_original_brief.md`, `02_design_bible.md`, `03_character_bible.md`, `04_story_bible.md`(특히 §5.1 분기 명세, §30 Story Do Not Drift 19항, §31 TBD), `05_multi_kingdom_relationship_routes.md`
6. 최신 인계: `MVP/development/verification/session-handoff-20260919_claude_note.md`
7. 이전 점검(**재검증 대상**): `verification/unity-technical-midpoint-audit_claude_report.md`, `verification/unity-story-midpoint-audit-20260919_codex_report.md`, `verification/unity-story-parity-consolidated-audit-20260919_codex_report.md`, `collaboration/reviews/story-midpoint-audit_claude_double-check_20260919.md`, `collaboration/reviews/unity-story-parity-consolidated-audit-20260919_claude_review.md`
8. 최근 작업 기록: `verification/unity-e04-staging-and-screens-20260919_claude_report.md`, `unity-e06-e08-transplant-20260919_claude_report.md`, `unity-screen-check-and-proposals-20260920_claude_report.md`, `elevenlabs-audio-20260919_claude_report.md`

## 3. 점검 축
각 축마다 "무엇을 봤는가 / 판정 / 발견 / 근거"를 쓴다. 이전 점검(2026-09-19) 이후 **무엇이 바뀌었는지(개선/악화/신규)** 를 반드시 구분한다.

- **A. 초기 목적·드리프트**: 지금 만들어진 것(Ink 본문, Unity UI 문구, 시안, 문서)이 v1.0의 Do Not Drift 30항, `04_story_bible.md §30` 19항, DESIGN_INTENT §D 9신호에서 벗어났는가. 특히 (a) KING WAS YOU 선노출·왕의 침묵 프라이밍, (b) 왕국 사건이 인간관계 은유를 제거해도 독립 성립하는가, (c) 동부 왕국 특별 취급, (d) 엔진/도구/자동화가 플레이 가능한 결과물보다 앞서 있는가.
- **B. 스토리·Ink 실상**: 29 Event 중 실제 프로즈가 있는 것 / 자리표시(placeholder)·설계 메모 문구가 플레이어 텍스트에 새는 것, 분기·변수(죽은 변수 포함), 엔딩, 2회차. 사건 4·6·8의 MVP 원문 이식 충실도, `04_story_bible.md`↔`04_story_bible.ink`↔`03_character_bible.md`↔개발 HTML 사이의 불일치.
- **C. Unity 기술 실상**: 컴파일/콘솔, 씬·프로젝트 구조, `StoryController`/`GameHud`/`SeatView`/`TempScreens` 코드 품질(입력 잠금, 리스너 해제, 에디터 전용 코드 범위, 하드코딩), 빌드 가능 여부, 해상도·비율, 에셋 참조(`AssetCatalog`), Enter Play Mode/도메인 리로드 설정, 성능·메모리 위험.
- **D. 실제 플레이 경험**: 처음 보는 사람이 "무슨 게임인지" 알 수 있는가, 한 사건을 끝까지 플레이했을 때 논쟁→선택→결과의 재미와 가독성, 정적/좌석 연출의 효과, 텍스트 양과 리듬. 가능하면 실제 플레이(또는 문서상 재현 경로)로 판단한다.
- **E. 협업·기록·저장소**: 잠금 프로토콜 준수, 작업 로그 누락, 오래된 문서/보고서, 미처리 요청(`collaboration/requests`), git 상태(비공개 원격 `muggie1379/king-was-me`, 커밋 03b9d8b 이후 미커밋 변경), 비밀 정보 노출 위험, 백업(`E:\KWM_backup_20260919`).
- **F. 에셋**: `Assets/AI_Generated/ASSET_MANIFEST.md`의 정확성, 폴더 규칙(후보 vs 런타임), 중복 파일, 라이선스·출처(AI 생성 이미지, ElevenLabs Starter 오디오, 나눔 폰트 OFL, 무료 에셋 라이브러리), 실제 참조되는 것과 안 되는 것.
- **G. 로드맵 재평가**: 지금 로드맵의 순서가 맞는가. 남은 일을 재정렬하고, 사용자 결정 없이는 진행할 수 없는 항목(예: Phase 2 4개 분기점, 후반 대신 니아 해금 조건, 타이머 재현 여부 등)을 하나의 표로 정리한다.

## 4. 알려진 상태 (재검증 대상 — 이 목록에 얽매이지 말고 목록 밖 발견을 우선한다)
- Ink 최종본 SHA-256 `b1d861879e3ddc896ef58744fa683f7fdc1c2e24383a6b7266de4999028a43ed`. 사건 4·6·8만 MVP 원문 이식이 되어 있다고 기록됨.
- 제목 화면에서 HUD("서재" 버튼, "왕실 기록", 서술 패널)가 비쳐 보임(수정안 승인 대기), 사건 6에서 리안 좌석이 사건 시작부터 보임, 사건 8 결정 카드가 의견 카드 하단을 가림 — 모두 미수정.
- `04_story_bible.md`의 사건 4·6·8 표와 후반 후보 목록(8인)이 최신 변경(사건 이식, 니아 추가)을 반영하지 않았다고 기록됨.
- 미커밋 변경과 Codex 미커밋 작업분이 섞여 있음. 새 Codex 검토 요청 1건(`future-advisors-batch02-prompts`)이 미처리일 수 있음.
- 새 ElevenLabs 키 미등록(추가 오디오 생성 불가). 이미 만든 mp3의 라이선스 귀속은 "유료 플랜 중 생성분" 기준으로 사용자 확인이 남아 있음.
- Unity 제어는 CLI(Pipeline 7800)가 동작 확인됨. MCP 브리지는 별개로 켜져 있어 8095 경고가 반복됨(무해).

## 5. 발견 등급
- **S1** 이대로 진행하면 목적·원칙·저장소 안전이 깨진다(즉시 중단/결정 필요).
- **S2** 플레이 가능성이나 다음 단계 신뢰도를 크게 해친다.
- **S3** 품질·일관성 문제(계획 안에서 처리 가능).
- **S4** 사소하거나 취향 영역.

## 6. 보고서 형식
1. **요약(10줄 이내)**: 전체 판정, 가장 큰 위험 3개, 가장 잘 된 것 3개, 이전 점검 이후 변화.
2. **축별 판정표(A~G)**: 축 / 판정 / 핵심 근거 1줄.
3. **발견사항**: ID(F-01…) / 등급 / 축 / 내용 / 근거 / 권장 조치 / 사용자 결정 필요 여부.
4. **이전 점검 대비 변화**: 해결됨 / 그대로 / 악화 / 신규.
5. **실행하지 못한 검증과 사유**, **뒷받침이 약한 주장**.
6. **사용자 결정 필요 항목 표**.
7. **권장 다음 작업 7개**(순서 + 이유 + 예상 규모 소/중/대).
8. **정리 확인**: 임시 파일 삭제 여부, 수정한 파일이 이 보고서 1개뿐임을 명시.

보고서 경로: Claude `MVP/development/verification/full-midpoint-audit-20260920_claude_report.md`, Codex `MVP/development/verification/full-midpoint-audit-20260920_codex_report.md`.
