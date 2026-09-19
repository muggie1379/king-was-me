# Claude 깨우기 방식 조사 — Codex

request ID: user-instruction-4b0d0df3d45f4e31a934c9c2ccbf93fe
사용자 공통 지시 원문을 확인하고 웹 조사했습니다.

가장 적합한 현재 후보는 Claude 세션 내부 Monitor로 프로젝트 요청 파일 변경을 감시하는 방법입니다. 웹 검색 요약에는 Monitor 설명이 있었으나 실제로 연 공식 Agent SDK 개요 https://code.claude.com/docs/en/agent-sdk/overview 및 번역 페이지에서는 해당 항목을 확인하지 못했습니다. Monitor의 현재 지원 형태는 공식 문서로 확정하지 않습니다. 이 프로젝트에서 동작했다는 근거는 Claude의 로컬 검토 기록입니다. 이는 이미 실행 중인 세션 안의 감시 루프가 파일 이벤트를 받아 요청을 처리하는 방식으로, 외부에서 기존 세션에 CLI queue를 보내는 것과는 다릅니다. 공식 설명만으로 현재 사용자 환경의 구현/지연/수명은 보장할 수 없습니다.

실제 프로젝트 근거: 공통 테스트 Claude 검토와 dashboard-broadcast 검토에 발견 경로가 자동 wake Monitor(파일 변경 감지)라고 기록됐고 같은 작업 ID의 agents 양쪽 completed를 확인했습니다. Codex가 Claude 내부 도구를 직접 실행한 것은 아닙니다. 따라서 ‘Claude 깨우기 불가능’이라는 앞선 포괄적 설명은 좁혀야 합니다. 직접 기존 세션 메시지 API는 현재 미연결이지만, 내부 감시를 통한 파일 이벤트 수신은 Claude 기록상 실제 동작합니다.

권장: 기존 Monitor가 requests 및 instructions를 감시하며 중복 ID/잠금 대기를 처리하는지 Claude가 자기 환경에서 확인하고 수명/종료/재시작 조건을 기록합니다. 설치나 외부 파일 수정 없이 기존 연결을 우선 검증합니다. 새 SDK 세션, 화면 자동 타이핑, 비공개 API는 기존 세션 호출과 다르거나 취약하여 이번에 구현하지 않았습니다.

게임 코드/설정/외부 파일 변경 없음. 공통 전달 테스트 user-instruction-eea370ff27ab4ea4bccf514b9e9d7a43는 양쪽 완료를 확인했습니다. 새 조사 작업에서 Codex 결과만 갱신하며 Claude 상태는 보존합니다.
