# Claude 작업 기록 — Ink 분기 구현 + Codex 수정 런타임 검증

일자: 2026-09-19. 사용자 지시: "Ink로 가시죠, 그 순서대로 진행해주세요" (먼저 04_story_bible.md 분기 명세 확장 → 이어서 .ink 파일 작성).

## 한 것 (시간순)

1. `04_story_bible.md`에 §5.1 "분기 시스템 명세" 신설 — 국가별 상태 변수, 이력 플래그, 스킵/분기 조건, Major Branch(왕이 직접 동부로 간다) 명세, 브리지 장면, 분기 그래프 요약. 관련 Event(05/07/14/16/17/19/21/18/20/22/23/26) 본문에도 조건 반영.
2. `04_story_bible.ink` 신규 작성 — 29 Event + 에필로그 전체를 실제 분기 로직으로 구현.
3. **작업 중 사용량 한도 도달 → 재개.** 재개 후 확인해보니 **Codex가 그 사이 별도로 복귀해서 같은 파일을 검토/수정**한 상태였음(`story-shared-detailed-review_codex_report.md`, `story-conditions-fix_codex_report.md`) — 잠금 없이 동시 편집이 발생했으나, Codex 변경 시점에 제가 그 파일을 저장 중이 아니었어서 실질적 충돌/유실은 없었음(운이 좋았음 — 두 쪽 다 편집 시 반드시 잠금 잡기로 한 합의가 이번엔 양쪽 다 지켜지지 않았다는 점은 기록해둠).
4. `npm install inkjs`를 스크래치패드(프로젝트 밖)에 설치해 **실제 Ink 컴파일러/런타임으로 검증** — Codex는 "inklecate/Inky가 실행 경로에 없어 런타임 검증 못 함"이라고 명시했었는데, 이 공백을 제가 메꿈.
5. Codex의 `story-conditions-fix` 수정 6건을 코드 레벨 확인 + 실제 14개 시나리오 + 16개 조합 전수 스윕으로 런타임 검증 — 전부 PASS. 상세는 `development/collaboration/reviews/story-conditions-fix_claude_runtime_review.md`.

## 검증

- `inkjs` Compiler: 0 에러 0 경고.
- 개별 조건부 분기(북부 임계값 도달/미도달, 남부 결렬, 이력 플래그, 캐릭터 소개 순서, Watcher 해금, 서부 3단계) 14건 자동 검증 PASS.
- 4개 주요 분기 변수 조합 2⁴=16개 전수 스윕 — 크래시/막힘 없이 전부 엔딩 도달 PASS.
- 게임 HTML(`development/KING_WAS_ME_MVP.html`) 미변경 확인.
- `inkjs` 설치는 스크래치패드에만 함 — `E:\KING WAS ME` 안에 node_modules 등 아무것도 추가되지 않음.

## 남은 문제

- Codex의 `story-shared-detailed-review_codex_report.md` §2/3/6/7/11(동부 이력 누락, 고정 소모 서사, 엔딩 전 은유 노출 위험, 방문 루트 동선 모순, 문서 링크 오류)은 이번 `story-conditions-fix` 범위 밖 — 아직 미해결.
- Major Branch 방문 루트(E18′/E20′/E22′/E23′) 프로즈 미작성(placeholder) — 그대로 유지.
- `_shared/04_story_bible.md`가 구버전(22 Event)으로 남아있어 루트 버전과 파일명이 같음 — 혼동 위험, 정리 필요.
- **잠금 프로토콜 재확인 필요**: 이번에 저와 Codex 둘 다 같은 파일을 잠금 없이 동시 편집했음(운 좋게 무해). "게임 HTML이 아닌 기획 문서는 잠금 안 잡아도 된다"고 제가 이전에 판단했던 게 이제 명백히 틀렸음 — 다음부터 `04_story_bible.md`/`.ink`도 잠금 대상에 포함.
