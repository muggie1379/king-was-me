# 공통 지시 메시지 원문 표시
사용자 요청으로 broadcast가 wake(job=job)를 호출하도록 변경하고 기본 깨우기 메시지 아래에 공통 작업 ID와 원문을 줄바꿈으로 추가했습니다. 일반 깨우기 메시지는 그대로입니다. 새 이벤트에 instructionId를 기록합니다.
수정: dashboard/wake.py, visual_dashboard.py 및 이 기록/검토 요청. 기존 잠금 취득과 저장 직전 파일 동일 확인 적용.
검증: 일반 메시지 동일, 다중 줄/인용/특수문자 원문 보존, 실제 subprocess 인자 구성(mock, shell=False) PASS. launcher GUI smoke 후속 실행. 실제 사용자 메시지 임의 전송 없음. 게임 코드/외부 파일 수정 없음.
