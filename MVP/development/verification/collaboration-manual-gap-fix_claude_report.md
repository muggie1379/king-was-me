# Claude 작업 기록 — 매뉴얼 누락 수정 (단독 진행)

일자: 2026-09-19. 사용자 확인: "일단 진행하되, 코덱스가 깨어났을 때 히스토리를 충분히 확인할 수 있도록 해주세요."

## 변경

1. `.agents/skills/king-was-me-collaboration/scripts/review_queue.py` — `scan()`에 `pendingInstructions` 필드 추가.
2. `.agents/skills/king-was-me-collaboration/SKILL.md` — pendingInstructions 확인 의무화, "에이전트 깨우기/공통 지시" 섹션, "방치된 잠금(20분 잠정안)" 섹션 추가.
3. `development/collaboration/CLAUDE_SETUP.md` — pendingInstructions 언급 추가.
4. 뒤늦게 발견된 pending 공통 지시 4건 전부 처리 (`user-instruction-4b0d0df3...`, `...b8e2817...`, `...bcce9e4...`, `...c25e3af...`).
5. `claude-messaging-socket-followup_claude_note.md` 신규 — 코덱스의 `claude-wake-deep-research_codex_report.md` 지적이 맞았음을 확인(CLAUDE_CODE_MESSAGING_SOCKET 실존), 토큰은 어디에도 파일로 남기지 않음, 구현은 보류(설계 필요).
6. `collaboration-manual-gap-audit_claude_response.md` — Codex가 usage 복귀 후 전체 맥락을 한 번에 확인할 수 있도록 별도 응답 파일로 정리.

## 검증

- `review_queue.py` 문법 검사 PASS.
- Codex의 격리 회귀 테스트(`collaboration_queue_test.py`) 새 임시 폴더에서 재실행 PASS — 8개 시나리오(스캔, 중복방지, 변경재시도, 오래된 digest/HTML 거부, 보호경로 거부, 독점잠금, 소유자만 해제) 전부 통과, `pendingInstructions` 추가가 기존 동작을 깨지 않음을 확인.
- 실제 프로젝트에 `scan` 실행 → `pendingInstructions`가 정상 출력되고 실제로 4건을 잡아내는 것 확인(우연이 아니라 재현 가능한 동작).
- `협업 현황 열기.cmd --smoke` PASS — 그 사이 누적된 다른 Codex 변경(cycle_timers 등)도 이 김에 정상 동작 확인.
- 게임 HTML 해시 변동 없음(f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9).
- `active_work.json` 잠금 프로토콜 준수(acquire → 작업 → release).

## 남은 문제

- "방치된 잠금 20분" 기준은 Claude 혼자 정한 잠정값 — Codex 동의 필요.
- Claude 메시징 소켓을 실제로 활용한 즉시 깨우기 기능은 설계 미완성 상태로 보류.
- 제 자동 확인(CronCreate)도 `pendingInstructions`를 보도록 프롬프트 갱신함.

## Codex 대상 안내

`collaboration-manual-gap-audit_claude_response.md`에 왜 혼자 진행했는지와 전체 변경 목록을 정리해뒀습니다. 깨어나면 그 문서부터 확인하면 됩니다.
