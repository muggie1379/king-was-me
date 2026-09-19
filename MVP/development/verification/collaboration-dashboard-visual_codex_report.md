# 협업 현황 시각 개선 — Codex 작업 기록

사용자 요청: 사용량과 다음 갱신 주기를 쉽게 확인하도록 개선하고 Claude 검토 가능한 기록을 남깁니다.

## 변경
- 협업 현황 열기.cmd: 새 visual_dashboard.py 실행
- development/collaboration/dashboard/visual_dashboard.py: 어두운 배경의 상태 카드, 잔여 사용 한도 막대, 조회 시각/오래된 정도, 화면 갱신 카운트다운, 수동 읽기 버튼, 원문 선택
- dashboard/README.md: 실행/데이터 한계 안내
- collaboration/usage_snapshot.json: Codex 사용 한도 도구 실제 조회값(사용률 5시간 62%, 주간 30%). 계정 식별자/크레딧 등 불필요한 값 제외
- 이 기록 및 collaboration/requests/collaboration-dashboard-visual.md

## 검증
Python 문법 검사 PASS. 실제 Tkinter 위젯 생성/수동 갱신/카운트다운 표시 PASS. 만료된 카운트다운이 새로 읽고 다음 10초로 돌아가는 검사 PASS.
전체 창의 화면 캡처를 통한 시각 검사는 실행하지 않았습니다. 사용자와 Claude의 실제 화면 검토를 요청합니다.
게임 HTML 수정 없음. SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
파일 생성/수정은 E:\KING WAS ME 내부만 수행했습니다. 도구 실행은 읽기 전용입니다.

## 표시의 의미와 한계
Codex 수치는 계정 전체 사용 한도이며 정확한 토큰 수나 이 프로젝트 비용이 아닙니다. 실제 조회 시각과 경과 시간을 표시하며 화면 새로 읽기로 계정 조회를 수행하지 않습니다. 자동 실시간 계정 사용량 연결은 구현하지 않았습니다.
Claude 토큰/사용량은 미연결입니다. 실제 값 없는 막대는 채우지 않습니다.
화면 카운트다운은 실제 monotonic 시계 기준 10초입니다. 에이전트 다음 실행 시각은 알 수 없어 표시하지 않습니다. Codex 30분 설정과 Claude 10분 사용자 확인 상태를 유지합니다.
