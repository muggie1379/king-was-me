# 공지 — 폴더 재편 (2026-09-19, 사용자 승인)

request ID: folder-reorg-20260919
base HTML SHA256(이동 전/후 동일, 내용 미변경): f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9

사용자가 직접 요청해서 진행했습니다: "MVP 관련 자료는 MVP 폴더로, 공통 자료도 특정 폴더에 모으고, Unity 프로젝트도 별도 폴더에, 불필요한 자료는 삭제 대신 old 폴더로."

## 무엇이 바뀌었나

- `development/`, `blind_test/`, `verification/`, 루트 `KING_WAS_ME_MVP.html`, `KING_WAS_ME_blind_test.zip` → **전부 `MVP/` 아래로 이동**.
- `01_original_brief.md`, `02_design_bible.md`, `03_character_bible.md`, `04_story_bible.md`, `04_story_bible.ink` → **`기획/` 아래로 이동**.
- `Unity/`, `old/` 신규 생성(둘 다 지금은 거의 비어 있음, 각 폴더에 README로 용도 설명).
- `.agents/`, `협업 현황 열기.cmd`, `00_START_HERE.md`는 루트에 그대로.
- **게임 HTML 내용은 전혀 안 바뀜** — 파일만 옮겼습니다.

## 코드/문서 수정 (경로 반영)

- `.agents/skills/king-was-me-collaboration/scripts/review_queue.py`: 모든 `"development/..."` → `"MVP/development/..."`.
- `development/collaboration/dashboard/*.py`(controls, dashboard, instructions, wake): `ROOT=Path(__file__).resolve().parents[3]` → `parents[4]`(폴더 깊이 +1), 내부 상대경로 문자열에 `MVP/` 접두사 추가.
- `협업 현황 열기.cmd`: 대상 경로에 `MVP\` 추가.
- `SKILL.md`, `CLAUDE_SETUP.md`, `00_START_HERE.md`, `MVP/development/README.md`, `MVP/development/collaboration/README.md`: 경로 프로즈 갱신.
- `MVP/development/verification/collaboration_queue_test.py`: 격리 테스트 픽스처도 새 경로로 갱신.

## ⚠ 꼭 확인해야 하는 것 — codex_state.json

`codex_state.json`의 `processed` 키가 옛 경로(`development/verification/...`, `development/collaboration/reviews/...`)로 저장돼 있습니다. 이번 이동으로 실제 상대경로가 `MVP/development/...`로 바뀌면서, **다음 `scan`에서 예전에 이미 처리 완료했던 검토 16건이 "새로 pending"인 것처럼 다시 나타납니다** (이미 실제로 확인함). 내용이 진짜로 바뀐 게 아니라 경로 접두사 때문에 digest 매칭이 깨진 것뿐입니다. `codex_state.json`은 Codex 전용 파일이라 Claude가 직접 안 건드렸습니다 — Codex가 새 경로 기준으로 키를 갱신(또는 재확인 후 새로 기록)해주세요.

## 검증

- `review_queue.py` 문법 검사 + 격리 회귀 테스트(8개 시나리오) 새 경로 기준으로 재실행 PASS.
- 실제 `scan` 명령 새 경로로 정상 출력 확인.
- `acquire`/`release` 사이클 재테스트 PASS.
- 실제 런처(`협업 현황 열기.cmd --smoke`) PASS.
- `기획/04_story_bible.ink`도 이동 후 재컴파일 + 14개 시나리오 재검증 PASS (내용 무관, 위치만 이동이라 영향 없을 거라 예상했고 실제로 그랬음).
- 게임 HTML 해시 전후 동일.

## 앞으로

경로 참조할 때 항상 `MVP/development/...` 기준으로 써주세요. 과거 로그 파일(이미 작성된 `_codex_report.md`/`_claude_review.md` 등)은 당시 기준 그대로 안 건드렸습니다 — 역사 기록이라 수정 안 함.

Codex 쪽 외부 예약 작업이 `E:\KING WAS ME`를 `--root`로 넘기는 방식이라면 그 자체는 안 바뀌어도 됩니다 — 스크립트 내부에서 알아서 `MVP/`를 붙입니다.
