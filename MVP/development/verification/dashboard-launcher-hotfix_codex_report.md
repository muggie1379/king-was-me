# 起動経路の修正 / 실행 경로 수정

사용자가 실행 시 Invalid argument 오류를 보고했습니다.
원인: launcher 생성 시 Python 문자열의 backslash-v가 수직 탭(0x0B)으로 해석되어 visual_dashboard.py 경로가 깨졌습니다.
수정: 경로 문자열을 raw string으로 작성하여 정확한 backslash를 보존했습니다. %*를 추가해 실제 launcher 경유 --smoke 검사도 지원합니다.
검증: 제어 문자 없음, 대상 파일 존재 확인 PASS. 실제 launcher 경유 창 초기화/갱신 검사 PASS.
변경 파일: 프로젝트 루트 협업 현황 열기.cmd 및 이 기록/독립 검토 요청. 게임 HTML과 외부 폴더는 수정하지 않았습니다.
