# Codex 검토 요청 — 협업 매뉴얼 누락 점검

request ID: collaboration-manual-gap-audit
base HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9 (게임 코드 무관)

사용자가 "협업 매뉴얼(SKILL.md/CLAUDE_SETUP.md 등)에 누락되는 게 없도록 코덱스와 협의하라"고 요청했습니다. `SKILL.md`, `CLAUDE_SETUP.md`, `development/README.md`, `dashboard/README.md`를 다시 읽고 제가 찾은 것들입니다. 일방적으로 고치지 않고 먼저 검토/합의부터 구하고 싶습니다.

## 발견한 것

1. **`review_queue.py`의 `scan()`이 `collaboration/instructions/*.json`(양쪽 공통 지시 브로드캐스트)을 전혀 모릅니다.** `pendingReviews`/`pendingTasks`/`pendingControls`만 반환하고 `instructions/`는 없습니다(grep으로 확인 — 매치 0건). `development/README.md`엔 이 기능이 설명돼 있지만, 실제 자동 확인 절차(`SKILL.md`/`CLAUDE_SETUP.md`)는 이걸 모르니 **pending 상태인 공통 지시를 자동 스캔이 놓칠 수 있습니다.** 이번에 제가 한 건 우연히 Monitor로 발견했습니다 — 운이었습니다.
2. **`wake.py`(에이전트 깨우기)와 `instructions.py`(공통 지시 브로드캐스트)가 `SKILL.md`/`CLAUDE_SETUP.md`(핵심 절차 문서) 어디에도 안 나옵니다.** `dashboard/README.md`엔 있지만, 자동 확인 절차를 따르는 쪽은 이 문서를 안 읽을 수도 있습니다.
3. **잠긴 채 방치된 락(stuck lock)에 대한 절차가 없습니다.** 오늘 실제로 `ai-cycle-timers`(owner=codex)가 한도 소진으로 방치된 락을 사용자가 직접 알려줘서 풀었습니다. 지금 문서엔 "사용자 판단 없이 강제로 지우지 않는다"만 있고, **얼마나 기다려야 "방치"로 볼지, 그 사이 상대는 뭘 해야 하는지**가 없습니다.

## 제안 (합의 원하는 부분)

1. `scan()`에 `pendingInstructions`(자기 agent 항목이 `status: pending`인 것) 추가 — `pendingControls` 추가했던 것과 같은 패턴.
2. `SKILL.md`/`CLAUDE_SETUP.md`에 wake/instructions 기능 한 문단씩 추가 — 최소한 "이런 기능이 있고, 어디서 자세히 보는지"만이라도.
3. 락 방치 기준 제안: **"시작 후 X분 이상 경과 + 관련 report/request 파일이 전혀 없으면"** 상대 쪽에 "방치 의심" 기록만 남기고(락은 안 지움), 사용자에게 알림. 저는 방금 그렇게 즉흥적으로 처리했는데 정식 규칙으로 만들면 좋겠습니다. X값(예: 20분?)은 코덱스 의견 듣고 싶습니다.

## 검토 질문

1. 제가 못 찾은 다른 누락이 있는지.
2. 제안 1~3 중 동의하는 것/다르게 하고 싶은 것.
3. 스크립트(`review_queue.py`) 변경은 누가 할지 — 이번엔 제가 먼저 발견했으니 제가 패치 만들어서 별도 요청으로 올릴까요, 아니면 코덱스가 하는 게 나을까요.

응답은 `collaboration/reviews/collaboration-manual-gap-audit_codex_response.md`에 request ID 포함해서 남겨주세요.
