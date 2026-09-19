# Claude 작업 기록 — claude-usage-dashboard

일자: 2026-09-18. 사용자 요청으로 대시보드에 Claude 사용량 연결.

## 변경

- `development/collaboration/usage_snapshot.json`: `claude` 필드를 실제 `get_usage`(session self) 결과로 채움. `codex` 필드는 그대로 보존(merge, 덮어쓰지 않음). primary=5시간(27% 사용, 2026-09-18 16:20 UTC 초기화), secondary=주간·전체 모델(12% 사용, 2026-09-25 06:00 UTC 초기화). 이 값은 Claude Code 플랜 사용량 도구가 반환한 실제 값이며 추정치 아님.
- `development/collaboration/dashboard/visual_dashboard.py`: 사용량 막대를 Codex 2개 → Codex+Claude 4개로 확장. 조회 시각/경과 표시도 codex/claude 각각 분리 표시. `--smoke` 검증 기준(`len(ui.bars)==2`→`4`)도 같이 갱신.

## ⚠ 작업 중 실제 동시 편집 충돌 발생

`active_work.json` 잠금(owner=claude, token=claude-usage-dashboard-20260918, expected-html-sha 확인 후 획득)을 잡은 상태에서 `visual_dashboard.py`를 편집하려다, **Codex가 같은 파일에 `controls.py`(대시보드에서 "지금 조회하기"/"주기 요청" 버튼으로 요청 파일을 생성하는 기능)를 동시에 추가한 것을 발견**했습니다(Edit 시도 시 "파일이 마지막으로 읽은 후 변경됨" 오류로 감지). 제가 가진 잠금은 이 편집을 막지 못했습니다 — 잠금이 game HTML 기준으로만 걸려 있고, 대시보드 도구 파일은 잠금 범위 밖이기 때문입니다.

처리: 클로버링하지 않고 Codex의 `controls.py` 통합 버전을 다시 읽어서, 그 위에 제 변경(4개 막대)을 병합했습니다. `controls.py`는 코드 레벨로 검토 — agent/scope/action/minutes 입력 검증, `COLLAB/controls`에만 배타적 생성(`open(...,'x')`)으로 쓰기, `externalWritesAllowed:false` 명시, 실행 아님(요청 파일 생성만) — 안전하다고 판단했습니다.

## 검증

- `python -X utf8 -c "ast.parse(...)"` 문법 검사 PASS (병합 후).
- 실제 런처(`협업 현황 열기.cmd --smoke`, PowerShell 호출 경유) PASS — 4개 막대 확인, 카운트다운 표시 확인.
- `controls.py` 자체 검증(`python controls.py`) PASS — 요청 파일 생성 없이 입력 검증만 확인.
- 시각 확인은 이번에 진행하지 못했습니다 — 창만 골라 캡처를 두 번 시도했는데 둘 다 배경의 사용자 다른 앱(ChatGPT) 창이 부분적으로 같이 찍혀서, 사생활 문제로 즉시 삭제하고 시각 검증은 보류했습니다. 필요하면 사용자가 직접 스크린샷을 찍어 공유해주는 방식으로 진행 예정입니다.

## 결론

기능은 정상 동작(코드+smoke 기준)하나, 실제 화면 캡처 검증은 아직 없습니다. 게임 HTML은 이번 작업으로 변경되지 않았습니다(f22924a6...). 작업 끝나고 잠금 해제(`release --token claude-usage-dashboard-20260918`) 완료.

## 다음: 동시 편집 충돌에 대한 별도 제안

이번에 실제로 겪은 충돌 사례를 바탕으로 협업 프로토콜 개선 제안을 `collaboration/requests/lock-scope-proposal.md`에 남겼습니다. Codex 검토 요청.
