# 세션 인계 노트 — Claude (2026-09-19 저녁, 사용자 외출로 중단)

다음 세션은 이 문서 → `ROADMAP.md`(Phase 2 결정 여부) → 아래 "남은 일" 순으로 읽고 시작한다. 이 문서는 새 기능 승인이 아니라 현재 상태 스냅샷이다.

## 1. 이번 세션에서 끝낸 것
| 항목 | 상태 | 근거 |
|---|---|---|
| GitHub private 저장소 `muggie1379/king-was-me` 생성 + 커밋 03b9d8b push | 완료 (push 전 비밀 검색 0건, 자동 푸시 설정 없음) | 이 노트 |
| Codex 검토 4건 답변 | 완료 | `collaboration/reviews/{advisor-dramatic-scenes-v1, external-cast-exploration-batch01, field-dialogue-and-reading-continuity, non-council-ingame-scenes-v1}_claude_review.md` (non-council은 `priority-ingame-scenes-v1_claude_review.md` 근거 표시만) |
| 사건 6 "두 번째 사절", 사건 8 "공동 축제" MVP 원문 이식(Ink) | 완료, inkjs 검증 PASS, Unity 사건 6 화면 확인 | `verification/unity-e06-e08-transplant-20260919_claude_report.md` |
| Unity CLI 시험 | 성공 (연결/콘솔/플레이/캡처/메뉴/eval, 끊김 없음) | 아래 §4 |

Ink 최종 SHA-256: `b1d861879e3ddc896ef58744fa683f7fdc1c2e24383a6b7266de4999028a43ed` (`기획/04_story_bible.ink` = `Unity/.../Resources/Ink/story_bible.ink`).

## 2. 지금 저장소 상태 (커밋하지 않음)
- 내가 바꾼 것(미커밋): `기획/04_story_bible.ink`, `Unity/.../Resources/Ink/story_bible.ink`, `MVP/development/ROADMAP.md`, 검토 파일 4개, `unity-e06-e08-transplant-…report.md`, 이 노트.
- **Codex 작업분(건드리지 말 것)**: `Unity/.../AI_Generated/ASSET_MANIFEST.md`(수정), `AI_Generated/Images/Characters/FutureAdvisors/`(+`.meta`), `verification/{advisor-generated-face-tokens-v1, future-advisor-casting-batch02, future-advisor-casting-fool-keeper}-…_codex_report.md`. 내 파일만 골라 커밋할 것(`git add`를 파일 지정으로).
- 협업 잠금(`active_work.json`)은 해제된 상태.
- 사용자가 커밋을 요청하기 전에는 커밋/푸시하지 않는다.

## 3. 남은 일 (우선순위)
1. **Unity 화면 확인 마무리(CLI)**: 의견 카드 클릭 팝업이 카드 위쪽에 뜨는지 + 열려 있는 동안 카드가 흐려지는지 / 서재·지도 임시 화면 패널 불투명도 + 임시 화면이 HUD "서재" 버튼 위에 오는지 / 사건 8 화면. (확인됨: 나눔명조 적용, 사건 6 사절이 가운데 서고 발언이 탁자 앞 팝업으로 뜸.)
2. **제목 화면 비침 버그**: 시작 화면에서 HUD의 "서재" 버튼과 "왕실 기록" 패널이 비쳐 보인다(하드닝 1-a에서 고쳤다고 기록된 항목이 완전하지 않음). 화면을 바꾸는 수정이라 **사용자 확인 후** 진행하기로 했다.
3. **리안 좌석 등장 타이밍**: Unity가 한 묶음을 읽은 뒤 소개 변수를 반영해서 리안이 사건 6 시작부터 보인다("낯선 인물" 서술과 어긋남). `# enter:`를 상시 대신에도 쓰도록 `StoryController`/`SeatView` 확장 필요(컴파일 검증 필요).
4. **사건 11/13/15 이식**: MVP `late_reply`/`canceled_meeting`(타이머 20초)/`empty_border`는 상태 함수 기반 변형이 많아 대응표(MVP 변형 ↔ Ink `event_15_default`/`event_15_closed` 등)부터 만든다.
5. **사용자/Codex 결정 대기**: 비동부 사건(1·3·5·7·9)은 MVP와 Ink 내용이 달라 정본을 어느 쪽으로 할지 / 1회차·2회차를 Ink `reading` 변수 분기로 갈지 / 서신 접수 시안 문자 원칙 재제작 / 동부 사절 근대풍 코트·남부 대표 변발 연상 조정 / 현장 장면 "관찰한 사실" 카드 채택 여부.
6. **Codex 확인 요청**: `04_story_bible.md`의 사건 4·6·8 표가 이번 Ink 변경을 반영하지 않았다. 「다음 행동은 동부에 맡김」(사건 6) 선택 후 반응 4줄은 내가 새로 쓴 것.
7. **ROADMAP**: 1-e 행은 이미 갱신함. 1-f는 "코드 작성됨, 화면 확인 필요"에서 "컴파일 통과, 화면 확인 일부"로 바꿀 여지가 있음(확인 끝난 뒤 갱신).
8. 보류 중: 새 ElevenLabs 키를 user-scope에 등록(사용자가 직접). 등록 전에는 추가 오디오 생성 불가.

## 4. Unity CLI 사용법 (검증한 것만)
- 경로: `C:/Users/ldw12/AppData/Local/Unity/bin/unity.exe` (`1.0.0-beta.8`), `muggie1379`로 로그인됨, 프로젝트에 `com.unity.pipeline 0.7.0-exp.1`이 이미 있음(→ `pipeline install`은 불필요, 실행하지 않았다). Pipeline 서버는 에디터가 켜지면 자동으로 뜬다(포트 7800). MCP Unity 창의 Start Server와 무관.
- 상태: `unity pipeline list`, `unity status`, `unity command editor_status`, `console_status`, `console --level error --tail N`.
- 명령 목록: `unity command --list` / `--query <검색어>`. 메뉴: `unity command menu "KingWasMe/Dev/..."`.
- 플레이: `editor_play` / `editor_stop`. **화면 검증 전 `KingWasMe/Dev/Keep Player Loop Ticking (toggle)`을 켜야 텍스트가 그려진다**(끝나면 다시 토글해서 끔).
- 캡처: `capture_game_view --source screen --save_path "<프로젝트 안 경로>"` (Play 모드에서만 오버레이 UI 포함). **저장 경로는 프로젝트 안이어야 하고 `Temp/x.png`를 주면 `Assets/Temp/x.png`로 저장된다.** 본 뒤 프로젝트 밖으로 복사하고 `delete_asset --asset Assets/Temp --confirm true`로 지운다.
- C# 즉석 실행: `eval_file --file <.cs>` (파일 안 `using` 금지, 전체 네임스페이스 사용, 마지막에 `return "..."`). 사건 이동 예: `StoryController`의 private `story`를 리플렉션으로 읽어 `ChoosePathString("event_06")` 후 `AdvanceStory` 호출.
- 대사 진행: `menu "KingWasMe/Dev/NextLine"`, 선택: `ClickFirstChoice`(사건 6은 6~8번 NextLine 후 사절 등장).
- 아직 안 해 본 것: 재컴파일(도메인 리로드) 중 연결 유지, `unity build`/`unity test`(에디터가 열린 상태에서는 쓰지 않는다).
- MCP 서버는 별개로 켜져 있을 수 있다. 8095를 이 Unity 프로세스가 자기 자신이 잡고 있어 "Port 8095 is already in use" 경고가 반복되는데, 서버가 이미 Listen 중이면 무해하다.

## 5. 원칙 재확인(이번 작업에 적용한 것)
- 진행 길이(N/29, ACT 번호, 장 번호) 노출 금지, 해석 예고 문구 금지, 수치·친밀도·2인칭 금지.
- 공유 파일(Ink, ROADMAP 등) 수정 전 잠금: `review_queue.py acquire --owner claude --token <값> --expected-html-sha <MVP/development/KING_WAS_ME_MVP.html 해시>`, 끝나면 `release`.
- Ink 수정 후: 두 사본 동일 확인(`cmp`), inkjs로 컴파일/스윕/선택 경로 검증(스크래치패드 `ink_check/`에 inkjs 복사본이 있었으나 세션 임시 폴더라 없을 수 있음 — 없으면 다른 프로젝트 임시 폴더의 설치본을 복사하거나 설치 전 사용자 확인).
- Ink 태그는 "태그만 있는 줄"이 다음 줄에 붙으므로 종료/퇴장 태그는 항상 출력되는 내용 줄 끝에 붙인다.

## 6. 2026-09-20 갱신 (다음 세션은 이 절부터)
- 위 §3의 1번(화면 확인)은 **완료**: 결과와 새로 본 경미한 시각 문제 4건은 `unity-screen-check-and-proposals-20260920_claude_report.md` A절.
- §3의 2·3번(B 제목 비침 / C 리안 등장 타이밍)은 **원인·설계를 같은 보고서 B·C절에 적었고, 사용자 확인 대기**(코드 수정 안 함).
- §3의 4번(사건 11/13/15)은 같은 보고서 D절에 **대응표 완료**, 결정 항목 (a)~(e) 대기. 권장 이식 순서 E15 → E11 → E13.
- Codex 새 검토 요청 2건은 **답변 완료**(2026-09-20): `collaboration/reviews/future-advisor-naming-and-keeper-20260919_claude_review.md`, `…/future-advisor-face-tokens-and-dialogue-mockup-20260919_claude_review.md`. 핵심: 니아 해금 조건을 왕국 사건 언어로 다시 쓰기(#17)·질문에 응답 선택지 없음 명시(#2/#10), `카르덴`↔`아르데트` 이름 유사, 후반 토큰 링 체계/색 충돌, `04_story_bible.md` 후반 후보 8인→9인 갱신 필요.
- 여전히 미커밋. Unity는 Play 정지, Keep Ticking 꺼짐, `Assets/Temp` 없음.
