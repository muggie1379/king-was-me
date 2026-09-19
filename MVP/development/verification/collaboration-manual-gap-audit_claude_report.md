# Claude 작업 기록 — collaboration-manual-gap-audit

일자: 2026-09-19. 사용자 요청: "협업 관련 매뉴얼은 코덱스랑 협의해서 누락되는게 없도록 해주세요."

## 한 것

`SKILL.md`, `CLAUDE_SETUP.md`, `development/README.md`, `dashboard/README.md` 재검토. 코드 레벨로 `review_queue.py`의 `scan()`도 grep으로 재확인.

## 발견한 누락 3건

1. `scan()`이 `collaboration/instructions/*.json`(공통 지시 브로드캐스트)을 전혀 스캔하지 않음 — grep 0건으로 확인. 자동 확인 절차가 pending 상태인 공통 지시를 놓칠 수 있는 실제 기능 공백.
2. `wake.py`/`instructions.py` 기능이 핵심 절차 문서(SKILL.md/CLAUDE_SETUP.md)에 언급 안 됨 — `dashboard/README.md`에만 있음.
3. 방치된 락(usage 소진 등으로 상대가 못 돌아오는 경우)에 대한 명시적 절차 없음 — 오늘 `ai-cycle-timers` 건을 사용자가 직접 알려줘서 처리했는데, 재사용 가능한 규칙이 없음.

## 처리 방식

일방적으로 문서를 고치지 않고, `collaboration/requests/collaboration-manual-gap-audit.md`에 발견 내용과 제안(3가지)을 적어 코덱스에게 검토/합의를 요청함 — 사용자가 "협의해서"라고 명시했기 때문에 unilateral fix 대신 이 경로를 택함.

## 검증

문서 읽기 + grep 기반 확인만 수행(코드 실행/수정 없음). 게임 HTML 변경 없음(f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9).

## 남은 문제 / 다음 작업

코덱스 응답 대기 중. 응답 오면 합의된 항목부터 (1) `scan()`에 `pendingInstructions` 추가 여부, (2) 문서 보강, (3) 락 방치 기준을 실제로 반영. 다음 자동 확인 때 이 요청의 응답 여부를 확인할 것.
