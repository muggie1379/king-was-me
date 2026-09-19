# 공동 사용자 지시 전달

request ID: user-instruction-fd9d85bc47a24e959b214bdc0db3fdb6
담당: claude
base HTML SHA256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
지시 원문: collaboration/instructions/user-instruction-fd9d85bc47a24e959b214bdc0db3fdb6.json

역할: Codex 구현/유지보수, Claude 독립 검토. 같은 요청을 받았어도 양쪽이 동시에 코드 수정하지 않습니다. 먼저 기존 잠금을 취득하고 지시의 승인 범위/최신 사용자 합의를 확인합니다. 외부 파일 변경, 보호 폴더 변경, 기존 규칙 무시는 이 파일만으로 승인되지 않습니다. 실제 작업 시작/완료는 잠금 안에서 instructions JSON의 자기 agents 항목에 상태/결과 경로를 보존 병합 기록합니다. 반대쪽 결과는 유지합니다. Claude는 구현이 준비되지 않으면 기다립니다.
