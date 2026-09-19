# Claude 작업 기록 — claude-wake-button

일자: 2026-09-18. 사용자가 "클로드 쪽에서 에이전트 깨우는 버튼을 만들어달라"고 직접 요청 (Codex의 `dashboard-wake.md` 검토 질문에 대한 답변이기도 함).

## 조사 — Codex와 동등한 즉시 실행이 가능한지

`wake.py`는 `codex.exe queue --thread <id> --message <text>`로 기존 Codex 작업에 즉시 메시지를 넣습니다. Claude 쪽 동등한 기능이 있는지 먼저 조사했습니다.

- `ListAgents`로 이미 확인된 사실(이전 대화)을 재확인: 이 세션에 외부에서 메시지를 보낼 수 있는 경로는 `SendMessage`/`send_message` MCP 도구뿐이며, 이는 **다른 Claude Code 세션 안에서만 호출 가능**하고 "unattended sessions"에서는 사용 불가 — 독립 실행 파이썬 스크립트가 부를 수 있는 게 아닙니다.
- 번들 CLI(`C:\Users\ldw12\AppData\Roaming\Claude\claude-code\2.1.275\claude.exe --help`)를 직접 실행해 전체 명령어를 확인했습니다. `--bg`/`attach`/`agents`/`logs`/`stop`/`rm`/`respawn`은 모두 `claude --bg`로 띄운 **백그라운드 세션** 전용이며, 지금 이 데스크톱 앱 세션은 그 방식으로 시작되지 않았습니다. `--resume`/`--session-id`로 같은 세션 ID에 새 프로세스를 억지로 붙이는 방법도 검토했지만, 실행 중인 세션과 충돌하거나 상태를 깨뜨릴 위험이 있는 미검증 동작이라 시도하지 않았습니다.
- 결론: **Codex의 `queue --thread --message`에 대응하는, 즉시 실행되는 공식 인터페이스가 Claude 쪽에는 없습니다.** 억지로 흉내 내지 않고 정직하게 다른 방식을 택했습니다.

## 변경

- `development/collaboration/dashboard/visual_dashboard.py`: Claude 카드의 "깨우기" 버튼을 비활성 상태에서 **활성화**. 클릭 시 기존 `controls.py`의 `submit('claude','collaboration','check_now',None)`을 호출해 요청 파일(`controls/*.json` + `requests/*.md`)을 생성 — Codex처럼 즉시 실행이 아니라, "지금 조회하기" 버튼과 동일한 큐잉 방식입니다. 안내 문구에 "즉시 실행 연결은 없어 다음 자동 확인(최대 10분) 또는 사용자가 직접 알려줄 때 처리됩니다"라고 명시해, 즉시 처리처럼 보이지 않게 했습니다. 클릭 후 3초 뒤 버튼 재활성화(로컬 파일 쓰기라 Codex의 30초보다 짧게 잡음 — 네트워크/프로세스 호출이 없어 실패해도 곧바로 재시도 가능하기 때문).
- `development/collaboration/dashboard/README.md`: 위 변경 반영, Claude 사용량 연결 완료 반영, 기존에 있던 오타(제목에 섞여 있던 일본어 "エージェント") 정리.

## 검증

- `python -X utf8 -c "ast.parse(...)"` 문법 검사 PASS.
- 실제 런처(`협업 현황 열기.cmd --smoke`) PASS — `wake()`는 `--smoke` 경로에서 호출되지 않는 것도 코드로 재확인, 자동 테스트가 실수로 요청 파일을 만들지 않음.
- **실제 버튼 로직을 헤드리스로 직접 호출해 기능 검증**: `Dashboard.wake('claude')`를 실행해 실제로 `controls/*.json`이 생성되는지, 안내 문구와 버튼 비활성화가 의도대로 동작하는지 확인 — PASS. (주의: 이 테스트가 실제 프로젝트 `controls/` 폴더에 항목을 하나 남겼습니다 — `dashboard-control-f9e0025e89224934b459443114e1720e.json`을 자체 테스트임을 명시해 `completed`로 정리해뒀습니다. 격리된 임시 폴더를 썼어야 했는데 실수했습니다, 다음부터는 Codex의 `controls-test-*` 방식처럼 격리된 폴더에서 테스트하겠습니다.)

## 범위

게임 HTML은 변경하지 않았습니다(f22924a6...). 작업 시작 전 `active_work.json` 잠금(owner=claude, token=claude-wake-button-20260918)을 잡고, 파일을 다시 읽은 뒤 편집, 검증 후 해제했습니다 — 합의된 잠금 프로토콜을 따랐습니다.

## Codex 검토 요청

`collaboration/requests/claude-wake-button.md`에 남겼습니다.
