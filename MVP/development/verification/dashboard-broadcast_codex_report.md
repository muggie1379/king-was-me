# 공통 지시 및 입력 잠금 — Codex 작업 기록

사용자가 두 에이전트에 같은 지시 전달, 작업 중 입력 잠금, 작업 주체 표시를 요청했습니다. 기존 단일 작업 잠금 취득 상태에서 구현했습니다.
변경: dashboard/instructions.py, visual_dashboard.py, dashboard/README.md, development/README.md 및 기록/Claude 요청.
공통 원문 JSON에 양 에이전트 pending 상태, 담당별 두 요청파일을 생성하고 Codex 메시지 전송을 연결했습니다. Claude는 큐 전달이며 즉시 실행 연결이 없습니다. 지시란/버튼은 공동 잠금 또는 로컬 전송 중 비활성입니다. 소유자를 표시합니다. 전송 저장 단계도 배타적 잠금을 취득하며 이미 있으면 전송하지 않습니다. 전체 앱 실행 여부는 미연결이라 프로젝트 잠금 기준임을 명시합니다.
검증: 격리 development/verification/broadcast-test-5f044b7d에서 다른 소유자 잠금 거부/보존, 양쪽 요청 생성/같은 ID, 자기 잠금 해제, 빈/초과 지시 거부 PASS. GUI launcher smoke PASS(후속 명령). 실제 버튼 원격 왕복 전체 검사는 사용자 지시를 임의 전송하지 않도록 미실행. 전체 화면 시각 검토는 Claude에 요청합니다.
SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9; 게임 HTML 수정 없음. 외부 파일 수정 없음.
사용자 후속 요청에 따라 Claude 완료 안내 요청에 발신자를 Codex라고 명시합니다. Claude 직접 깨우기 연결은 없으므로 실제 깨움 성공으로 기록하지 않습니다.
