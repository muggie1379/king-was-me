# Claude 독립 검토 — collaboration-dashboard-visual

request ID: collaboration-dashboard-visual
검증한 HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
발견 경로: 자동 10분 스캔

## 1. 실제 창의 가독성/잘림/사용 한도 막대/카운트다운 — 부분적으로만 확인, 전체 시각 검토는 미완료

전체 화면 스크린샷으로 확인하려고 두 번 시도했으나, 두 번 다 배경에 떠 있던 사용자의 다른 앱(ChatGPT) 창 내용이 함께 캡처되었습니다. 사용자 사생활 문제라 **두 스크린샷 모두 즉시 삭제**했고, 그 내용은 검토에 활용하지 않았습니다. 이후 창 핸들 기준으로 캡처 영역을 좁혀봤지만 여전히 겹치는 부분이 있어 같은 문제가 반복될 위험이 있다고 판단, **전체 시각 검증은 보류**합니다. 코드 레벨 검토와 `--smoke` 실행 결과로 기능 동작은 확인했으나, "가독성/잘림"처럼 실제 눈으로 봐야 하는 항목은 사용자가 직접 스크린샷을 공유해주시거나, 제가 창만 안전하게 자르는 방법을 찾을 때까지 미확인 상태로 남습니다. **완료로 표시하지 않습니다.**

## 2. --smoke 및 기한 만료 갱신, 프로젝트 밖 쓰기 여부

- 코드 레벨 검토: `import`가 tkinter/pathlib/datetime/runpy/time/math/sys뿐 — 네트워크(`requests`/`urllib`/`socket`), 프로세스 실행(`subprocess`) 없음. 파일 쓰기 호출도 소스에 없음(순수 읽기).
- 실제 런처(`협업 현황 열기.cmd --smoke`, PowerShell 경유) 실행 — `Visual dashboard startup / refresh / countdown PASS` 확인. (이후 Claude 사용량 막대 추가 병합본 기준으로도 재실행해 PASS 재확인함 — `claude-usage-dashboard_report.md` 참고.)
- 10초 카운트다운의 만료→재조회→재시작 로직(`tick()`)도 코드 확인 — `time.monotonic()` 기준이라 시스템 시계 변경에 영향받지 않음.

## 3. 계정 사용 한도 ≠ 정확한 토큰 수 / 프로젝트 비용 — 혼동 방지 확인

`self.note`에 "정확한 토큰 수: 계정 전체 사용 한도이며 프로젝트 비용이 아닙니다"라고 명시(제가 Claude 막대 추가하며 문구도 갱신). 조회 시각과 경과 시간(`~분 전 조회`)도 codex/claude 각각 분리 표시하도록 되어 있음 — 설계 원칙과 일치.

## 4. Claude 사용량 연결 제안 → 이미 실제로 연결함

이 요청이 들어온 뒤 사용자가 직접 채팅으로 "클로드 사용량 연결하고 대시보드에 띄워줘"라고 요청해서, 제안에 그치지 않고 실제로 연결했습니다. `mcp__ccd_session_mgmt__get_usage`(Claude Code 플랜 사용량 도구, `session_id: self`)로 실제 값을 가져와 `usage_snapshot.json`의 `claude` 키에 기록, `visual_dashboard.py`에 Claude 막대 2개 추가. 자세한 내용은 `development/verification/claude-usage-dashboard_report.md` 참고. **작업 중 Codex와 같은 파일에서 동시 편집이 실제로 발생**해 별도로 `lock-scope-proposal.md`를 만들어뒀습니다.

## 결론

기능(읽기 전용, 미승인 외부 쓰기 없음, PASS)은 확인됐으나 요청하신 실제 화면 시각 검토는 아직 완료하지 못했습니다. **조건부 — 코드/동작은 승인, 시각 검토는 보류.**
