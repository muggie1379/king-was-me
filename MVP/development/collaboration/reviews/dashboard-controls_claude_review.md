# Claude 독립 검토 — dashboard-controls

request ID: dashboard-controls
검증한 HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
발견 경로: 자동 10분 스캔
실제 GUI 검토 여부: 코드/기능은 확인, 전체 화면 시각 검토는 `collaboration-dashboard-visual_claude_review.md`와 동일한 사유(배경 창 캡처 위험)로 보류.

## 카드 종류 선택 / 입력 검증 / 요청 생성 / pending-완료 구분

`controls.py`를 코드 레벨로 전체 검토했습니다.

- `build()`: `agent∈{codex,claude}`, `scope∈{usage,collaboration}`, `action∈{check_now,set_interval}` 외 값은 `ValueError`. `set_interval`일 때 `minutes`가 bool이 아닌 1~1440 정수인지 검사(`isinstance(minutes,bool)`로 `True`가 정수로 오인되는 것도 명시적으로 막음 — 꼼꼼함).
- `submit()`: 요청을 `COLLAB/'controls'/<id>.json`에 **배타적 생성**(`open(...,'x')` — 같은 id 덮어쓰기 불가)으로 저장, 동시에 `COLLAB/'requests'/<id>.md`에 사람이 읽을 요청문 생성. 둘 다 `E:\KING WAS ME` 내부 고정 경로.
- 생성되는 요청문에 "실행 전에는 완료로 표시하지 마세요", "다른 담당자 요청은 처리하지 마세요"가 명시되어 pending/완료 혼동 방지 장치가 텍스트 레벨에도 있음.
- 독립적으로 `build()`를 직접 호출해 2개 케이스(codex/usage/check_now, claude/collaboration/set_interval=15) 검증 — 반환된 항목의 `status`, `externalWritesAllowed` 필드까지 확인, PASS.
- `E:\KING WAS ME` 밖에 쓰는 코드가 없음을 소스 레벨로 확인(경로가 전부 `ROOT=Path(__file__).resolve().parents[3]` 기준으로 고정).

## Claude 자신의 controls 요청 처리 가능 여부

현재 `development/collaboration/controls/` 폴더 자체가 비어 있어(아직 아무도 버튼을 안 눌러서) 처리할 대기 요청이 없습니다. 처리 가능성만 미리 확인:

- **`claude` + `usage` + `check_now`**: 처리 가능합니다 — `mcp__ccd_session_mgmt__get_usage`로 실제 값을 즉시 조회할 수 있고, 이미 이번 세션에서 그렇게 `usage_snapshot.json`의 `claude` 키를 채웠습니다.
- **`claude` + `usage` + `set_interval`**: 처리 가능 — 이건 화면 갱신 주기가 아니라 제 실제 사용량 조회 빈도를 뜻하는 것 같은데, 조회 자체가 가벼운 도구 호출이라 다음 10분 자동 확인 때 같이 갱신하는 식으로 반영 가능합니다.
- **`claude` + `collaboration` + `check_now`/`set_interval`**: 처리 가능 — 이미 도는 10분 자동 확인(`CronCreate`)이 이 역할이라, 버튼이 눌리면 다음 스캔에서 발견해서 즉시 처리하고 결과를 기록할 수 있습니다.

버튼이 실제로 눌리면 다음 자동 확인 때 `controls/*.json`도 같이 스캔 대상에 넣어서(현재 `review_queue.py scan`은 `controls/`를 안 보므로, 제가 매번 수동으로 `controls/` 폴더 존재 여부를 같이 체크하겠습니다) 처리하겠습니다.

## 결론

코드/입력 검증/저장 로직 전부 안전하고 견고합니다. **승인.** 전체 화면 시각 검토만 별도로 보류 상태입니다.
