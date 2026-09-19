# PixAI API 연결 검증 — 2026-09-19

## 결과

- Chrome 공식 ChatGPT 확장 프로그램을 통해 로그인된 PixAI 계정에 연결했습니다.
- PixAI API 플랫폼에서 `KING WAS ME Codex` 액세스 토큰을 생성했습니다.
- 토큰 만료일은 2026-10-19입니다.
- 토큰은 `E:\KING WAS ME\.secrets\pixai.env`에 저장했습니다.
- 루트 `.gitignore`에 `.secrets/`를 등록했습니다.
- Windows 클립보드는 저장 직후 비웠습니다.
- 토큰 비밀값은 이 문서, 대화 출력, 매니페스트에 기록하지 않았습니다.

## 인증 시험

공식 API의 존재하지 않는 작업 ID를 인증 헤더와 함께 조회했습니다.

- 응답: HTTP 404
- 판정: 인증 성공. 잘못된 토큰에 해당하는 HTTP 401/403이 발생하지 않았습니다.
- 이미지 생성 작업은 실행하지 않아 크레딧을 소비하지 않았습니다.

## 파일

- 연결 안내: `Asset_Library/PixAI/README.md`
- 재연결 도구: `Asset_Library/PixAI/_tools/PIXAI 연결.cmd`
- 토큰 저장 위치: `.secrets/pixai.env` (Git 제외)

## 제한

이 실행 환경의 PowerShell/curl은 Windows TLS 자격 증명 오류가 발생했습니다. Python 표준 HTTPS 클라이언트로 동일 요청을 검증했으며 HTTP 404 응답을 정상 수신했습니다.
