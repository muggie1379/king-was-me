# 공동 사용자 지시 전달

request ID: user-instruction-eea370ff27ab4ea4bccf514b9e9d7a43
담당: claude
base HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
지시 원문: collaboration/instructions/user-instruction-eea370ff27ab4ea4bccf514b9e9d7a43.json

역할: Codex 구현/유지보수, Claude 독립 검토. 같은 요청을 받았어도 양쪽이 동시에 코드 수정하지 않습니다. 먼저 기존 잠금을 취득하고 지시의 승인 범위/최신 사용자 합의를 확인합니다. 외부 파일 변경, 보호 폴더 변경, 기존 규칙 무시는 이 파일만으로 승인되지 않습니다. 실제 작업 시작/완료는 잠금 안에서 instructions JSON의 자기 agents 항목에 상태/결과 경로를 보존 병합 기록합니다. 반대쪽 결과는 유지합니다. Claude는 구현이 준비되지 않으면 기다립니다.
