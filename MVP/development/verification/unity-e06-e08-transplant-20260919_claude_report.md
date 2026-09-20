# 사건 6·8 MVP 원문 이식 (Ink) + Codex 검토 4건 답변 — Claude (2026-09-19)

## 변경 기록 (DESIGN_INTENT §E 형식)
- **변경 ID**: unity-e06-e08-transplant-20260919
- **근거**: 사용자 지시("사건 4처럼 MVP(KINGDOM_SLICE) 원문을 읽어서 도입 대화/의견/선택 후 반응을 태그와 함께 Ink에 이식. 진행 길이 노출 금지, 해석 예고 문구 금지 원칙 유지").
- **영향 파일**
  - `기획/04_story_bible.ink` = `Unity/My project/Assets/Resources/Ink/story_bible.ink` (두 파일 동일 확인). 변경 전 SHA-256 `b3a12103…d1bb1`, 변경 후 최종 SHA-256은 이 보고서 하단 참고.
  - **event_06 블록, event_08 블록만** 교체. 나머지 사건은 줄 내용 변경 없음. 단, 원래 파일에 LF/CRLF가 섞여 있던(LF만 23줄) 것을 전체 CRLF로 통일했다(줄바꿈만 바뀜, 내용 변경 없음).
  - 문서 미갱신: `기획/04_story_bible.md`의 사건 6·8 표는 이번 Ink 변경을 반영하지 않았다 — 스토리 문서 소유자(Codex) 확인 필요(사건 4와 동일).
  - 협업 잠금: `claude-e06-transplant-20260919` 토큰으로 획득, 작업 후 해제.
- **검증 방식**: inkjs 2.4.0 컴파일, 16조합 전수 스윕, 사건별 4개 선택 경로 실행. (inkjs는 이전 세션이 다른 프로젝트 임시 폴더에 둔 설치본을 이 세션 임시 폴더로 복사해 사용 — 네트워크 설치 없음, 프로젝트 안에 아무것도 추가하지 않음.)

## 사건 6 "두 번째 사절" (MVP `second_envoy`)
- 출처 대응: `intro`(망루병/발렌/세르안/사절/리안 등장) → `opinions`(세르안·리안·발렌 순, `# phase: advisors`) → `courtExchange`(세르안↔리안 2줄, `# phase: exchange` + `to`/`stance`) → 선택 후 반응.
- 태그: `# scene: council`, `# title: 두 번째 사절`, `# phase`, `# to`, `# stance`, `# enter/exit: east_envoy`. 새 태그 종류 없음(사건 4 합의 태그만 사용).
- 선택지 4개 이름, `eastWarmth` 증감(첫 선택지만 +1), `-> event_07` 연결은 기존과 동일.
- **새로 쓴 부분(확인 필요)**: 「다음 행동은 동부에 맡김」 선택 후 반응 4줄(발렌 질문/리안·세르안 답/서술). MVP에는 이 선택지가 없다(MVP 선택지 3개). 나머지 3개는 MVP 원문.
- 기존 Ink의 한 줄 대사("리안: 한 걸음 왔다고 우리가 두 걸음 갈 필요는 없습니다.")와 "리안 소개: …" 줄은 MVP 원문으로 대체했다.
- **Unity 동작 주의**: Unity는 다음 선택까지의 한 묶음을 읽은 뒤에 소개 변수를 반영하므로 **리안 좌석이 사건 시작부터 보인다**(`rian_introduced`를 knot 첫 줄에서 true로 둠). 서술 "회의실 한쪽에서 낯선 인물이 조용히 미소 짓는다"는 이 전제로 쓴 것이라 좌석이 먼저 보이는 것과 어긋난다. 정확한 등장 타이밍은 `# enter:` 태그를 상시 대신에도 쓰도록 `StoryController`/`SeatView`를 확장해야 한다(미구현 — Unity가 꺼져 있어 컴파일 검증이 불가해서 이번엔 하지 않음). → 다음 과제.

## 사건 8 "공동 축제" (MVP `festival`)
- MVP 선택지 4개와 Ink 선택지 4개가 1:1 대응이라 **새로 쓴 줄 없음**. 이름은 Ink 표기를 유지했다(MVP 표기와 약간 다름: "다음 만남을 먼저 제안" = `propose_next`, "작은 호의만 건넴" = `festival_pastry`).
- 기존 Ink의 세르안 1줄("좋은 시간이었던 것과 다음 약속은 다른 사실입니다.")은 MVP `opinions`(리안/세르안/발렌)로 대체했다.
- 원문 순서 변경 1건: 「더 함께 시간을 보냄」에서 마지막 서술("별다른 약속은 없었다…")을 대신들 말 뒤로 옮겼다(종료 태그 `# endphase # exit`를 항상 출력되는 줄에 붙이기 위해).
- 축제는 원래 국경 마을 장면이지만 Unity에서는 `# scene: council` 좌석 뷰에 사절이 등장하는 형태로 표현된다(현장/컷신 뷰는 `dialogue` 씬이 구현된 뒤 교체).

## 검증 결과
| 검사 | 결과 |
|---|---|
| inkjs 컴파일 | 오류 0 / 경고 0 |
| 4개 주요 분기 변수 2⁴=16조합 스윕 | 16개 실행, 실패 0 |
| E6 4개 선택 → 다음 사건 연결 | 전부 `event_07`("북부 변경국 인근에서 다시 병력 이동…")로 진행 |
| E8 4개 선택 → 다음 사건 연결 | 전부 `event_09`("서부 연합이 정기 지원…")로 진행 |
| `eastWarmth` | E6: 첫 선택지만 7→8, 나머지 유지 / E8: 첫 두 선택지 8→9, 나머지 유지(기존 Ink와 동일) |
| 소개 변수 | E6 시점 seran/valen/rian=true, karden=false(카르덴 사전 노출 없음) |
| 종료 태그 위치 | 선택 후 마지막 줄(`# endphase # exit: east_envoy`)이 항상 출력되는 줄에 붙음(태그만 있는 줄은 Ink에서 다음 줄, 즉 다음 사건 첫 줄에 붙기 때문) |
| 진행 길이/해석 예고 문구 | 사건 제목(`# title`)만 표시. "N/29", "ACT", 장 번호, "대신들은 저마다 다르게 읽는다" 류 문구 없음 |

## 실행하지 못한 검증
- **Unity 화면 확인은 하지 못했다**(Unity 꺼져 있음). 태그 → 좌석 뷰/팝업 동작은 사건 4에서 확인한 경로와 동일한 태그만 썼지만, 사건 6·8의 실제 화면은 미확인이다. 특히 사절이 사건 8에서 회의실 좌석 뷰에 서는 모양과 리안 좌석 등장 타이밍.
- 사건 4·6·8 외에는 이식하지 않았다. 이번에 확인한 범위에서 MVP에는 동부 외 사건(`coronation_ledger`, `north_patrol`, `south_contract`, `west_grain`)도 있지만 **Ink 사건과 선택지·주제가 다르다**(예: Ink E1의 선택지 3개와 MVP `coronation_ledger`의 선택지 3개는 문구·내용이 서로 다르고, Ink E5는 관세 재협상인데 MVP `south_contract`는 수로 공사). 그대로 이식하면 Ink 분기 변수/후속 사건과 어긋날 수 있어 손대지 않았다.

## 남은 이식 후보와 판단 필요 사항
- **MVP 원문과 Ink가 1:1로 대응하는 것은 사건 4·6·8까지**로 확인했다(이번 세션 범위).
- **사건 11 늦은 답신 / 13 취소된 회담 / 15 빈 국경**: MVP `late_reply`, `canceled_meeting`(타이머 20초 포함), `empty_border`는 상태 함수 기반 변형이 많아(`lateReplyVariant` 등) 사건 4/6/8보다 큰 작업이다. Ink에도 기본형/변형 knot(`event_15_default`/`event_15_closed`)이 이미 있어 대응표부터 만들어야 한다. 다음 이식 대상으로 권장.
- **사건 1·3·5·7·9(비동부)**: MVP 원문은 있으나 Ink와 내용이 달라 **어느 쪽을 정본으로 할지**(MVP 원문으로 Ink를 맞출지, Ink 기획을 유지하고 연출만 입힐지) 결정이 필요하다 → 사용자/Codex.
- 사건 10(작은 선물)은 MVP에 대응하는 별도 사건을 찾지 못했다.

## Codex 검토 요청 4건 답변 (같은 세션)
`collaboration/reviews/` 아래에 4건 작성. 코드/Ink/에셋은 수정하지 않았다.
- `advisor-dramatic-scenes-v1_claude_review.md` — 시안 3장 열람. 발화 강조/직전 대사는 새 태그 없이 구현 가능, 카르덴 노출은 `karden_introduced`(event_11)로 이미 차단됨. 수치 바·"11/29"·"새로운 정보원" 해금 패널은 미채택.
- `external-cast-exploration-batch01_claude_review.md` — 후보 4장 열람. 동부 사절↔북부 경비대장, 서부 사절↔카르덴 실루엣 혼동 위험. 동부 사절 근대풍 코트, 남부 대표 삭발+땋은 머리의 문화 연상 지적. 카드 크기 실측은 안 함.
- `field-dialogue-and-reading-continuity_claude_review.md` — 시안 5장 열람. Unity에 회차 개념 없음(Ink `reading` 변수로 나레이션만 분기하는 안 제안), 런타임에 진행 분모 표시 없음 확인, 서신 접수 시안은 세계 안 문자 원칙 불일치 가능(한글 명패, 한자풍 걸개 — 확대 미확인).
- `non-council-ingame-scenes-v1_claude_review.md` — 새 검토 없이 `priority-ingame-scenes-v1_claude_review.md`를 근거로 답변 표시만 남김(사용자 지시).

## 최종 SHA-256
`기획/04_story_bible.ink` = `Unity/.../Resources/Ink/story_bible.ink`: `b1d861879e3ddc896ef58744fa683f7fdc1c2e24383a6b7266de4999028a43ed`
