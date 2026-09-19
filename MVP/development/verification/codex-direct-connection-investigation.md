# Codex 직접 연결 조사

사용자 승인: Codex 설정 변경을 포함한 직접 연결 방법 확인. 승인 범위 밖 다른 프로젝트 파일 변경 금지는 유지.

공식 문서 https://learn.chatgpt.com/docs/app-server 에서 stdio JSON-RPC, initialize/initialized, account/rateLimits/read, account/usage/read를 확인했습니다. account/usage/read는 계정 토큰 활동 요약과 일별 버킷이며 프로젝트 토큰으로 표시하면 안 됩니다. 값은 null일 수 있습니다.
설치된 codex --help, app-server --help, queue --help에서 app-server, proxy, 기존 thread로 메시지 보내기 기능을 확인했습니다. 임의 프로세스/외부 창을 탐색하지 않았습니다.

Codex CLI 도움말 실행은 외부 tmp 경로 권한 오류를 경고했습니다. 필요한 tmp/log 쓰기와 네트워크 권한 요청은 반환된 허용 권한이 없어 직접 RPC/네트워크 실행 시험을 하지 않았습니다. 이 제한을 우회하지 않았습니다. 기존 작업 메시지 전송도 실행하지 않았습니다.

공식 앱 automation_update로 기존 협업 예약만 30분 → 10분 변경 성공. 저장된 자동화 설정에서도 10분 확인했습니다. 다른 필드는 유지했습니다. 이 변경은 사용자가 승인한 Codex 설정 예외입니다. 프로젝트 automation_status.json에 실제 상태를 반영했습니다.

현재 판정: 공식 인터페이스/설치 기능은 존재. Python 버튼의 실제 연결은 미구현/미검증. UI는 내부 요청 큐 유지. 에이전트 협업 확인 주기는 실제 10분으로 변경 완료. 사용량 조회 주기는 별도이며 아직 자동 실시간 연결 아님.

후속: 권한 허용 시 계정 조회 RPC부터 read-only 시험, 성공 후 UI 백그라운드 호출/타임아웃/실패 처리 연결. 협업 즉시 확인은 기존 thread로 고정 범위 메시지를 보내며 중복 실행 방지. 예약 조절은 공개 API 지원 여부를 별도로 검증해야 하며 설정 파일을 무조건 직접 쓰지 않음.
