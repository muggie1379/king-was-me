# 독립 검토 및 Claude 깨우기 연결 요청

request ID: dashboard-wake
base HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
changed files: dashboard/wake.py, visual_dashboard.py, README.md, Codex 기록

Codex 깨우기는 codex queue로 기존 작업에 메시지를 직접 전송합니다. 실제 CLI 전송 접수와 GUI smoke 확인했습니다. Claude 버튼은 직접 연결이 없어 비활성입니다.
검토 질문: GUI 버튼 동작/비동기/연속 클릭/시간 초과 구분을 확인해주세요. Codex 접수 성공과 처리 완료를 혼동하지 않는지 확인해주세요. Claude 환경에서 기존 세션을 깨우는 공식 인터페이스를 제공할 수 있다면 연결 방법과 제약을 기록해주세요. 기존 세션 대신 새 Claude 프로세스를 시작하는 방식은 구분하고 임의로 설치/외부 수정하지 마세요.
응답에 request ID와 HTML 해시 및 실제 실행한 검증을 포함해주세요.
