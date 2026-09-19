# Claude 즉시 깨우기/직접 지시 전달 — 심층 조사 (Codex)

조사일: 2026-09-18. 사용자 요청으로 기존 세션 직접 전달, 세션 내부 감시, 별도 실행을 구분했습니다. 공식 문서 본문을 실제 열어 확인했습니다. 설치/프로그램 실행/외부 설정 변경/인증 정보 추출은 하지 않았습니다. 기존 공동 잠금 취득 후 조사 기록만 저장합니다.

## 결론과 앞선 설명 정정
‘Claude에 직접 전달 방법 자체가 없다’는 설명은 부정확했습니다. 현재 공식 문서는 수신 소켓과 Channels를 설명합니다. 지금 대시보드에 그 연결이 구현되지 않은 것과 플랫폼이 지원하지 않는 것은 다릅니다. 설치 CLI 도움말만 확인한 이전 조사는 충분하지 않았습니다. 문서상 지원과 이 사용자의 실제 세션 동작은 구분하며 아직 직접 연결 성공을 주장하지 않습니다.

## 1. 기존 세션 수신 소켓/Windows named pipe — 우선 확인할 후보
공식 cross-session messaging 문서의 ‘The session’s inbox socket’ 절은 스크립트/훅이 세션에 메시지를 게시하는 상황을 다룹니다. Windows 최소 버전은 2.1.234입니다. 세션의 /status 또는 CLAUDE_CODE_MESSAGING_SOCKET에서 수신 경로를 확인할 수 있으며, Windows는 인증된 연결이 필요합니다. CLAUDE_CODE_MESSAGING_TOKEN이 세션 내부에 제공됩니다. 수신 정책은 accept/hold/refuse로 나뉘며, 유휴 수신자는 전달된 메시지로 새 turn을 시작하고 실행 중이면 도구 호출 사이에서 읽습니다.

현재 정보: Claude 로컬 보고서에 번들 2.1.275가 적혀 있지만 Codex가 실제 세션 버전/수신 경로를 확인하지는 않았습니다. standalone 대시보드가 세션의 자식 프로세스처럼 자동 승인된다고 가정할 수 없습니다. 먼저 Claude 쪽에서 경로/토큰 존재 여부와 정책을 확인하고 메시지 형식 및 인증 시험을 수행해야 합니다. 공개 본문에 전체 메시지 payload 형식은 명확히 제시되지 않아 추측으로 송신 코드를 만들지 않았습니다. 인증 값을 공유 문서에 복사하지 않습니다.

출처: https://code.claude.com/docs/en/cross-session-messaging

## 2. Channels + 로컬 webhook — 명시적인 외부 이벤트 인터페이스
Channels는 MCP 서버가 이미 열린 Claude Code 세션으로 이벤트를 밀어 넣는 연구 미리보기 기능입니다. 일반 MCP 도구 연결만으로는 push가 되지 않습니다. 사용자 opt-in 및 세션 활성 상태가 필요합니다. 도움말에 관련 플래그가 보이지 않을 수 있다고 공식 문서가 명시합니다. 따라서 --help에 없었다는 이유로 기능 부재를 단정할 수 없습니다. 로그인 방식/조직 설정과 런타임 지원을 확인해야 합니다.

공식 Channels reference에는 localhost HTTP POST를 세션 이벤트로 변환하는 예제가 있습니다. Node-compatible runtime와 MCP SDK, channel capability 및 notifications/claude/channel이 연결의 핵심입니다. 내 판단: 대시보드→프로젝트 로컬 bridge→Claude 세션 구조가 이 작업에 잘 맞습니다. 사용자 정의 채널은 preview allowlist/개발 opt-in 절차가 있으므로 자동으로 우회 플래그를 켜지 않습니다. 현재 Desktop 세션에서 해당 등록/opt-in을 할 수 있는지는 아직 확인하지 못했습니다. 필요 시 CLI 세션으로 옮기는 비용을 고려합니다. 프로젝트 파일은 E 내부에 둘 수 있어도 런타임/설정 저장 경로까지 내부라고 보장할 수는 없습니다.

출처: https://code.claude.com/docs/en/channels
출처: https://code.claude.com/docs/en/channels-reference

## 3. Monitor + 파일 감시 — 이미 동작한 로컬 근거
공통 전달 테스트에서 Claude가 ‘자동 wake Monitor(파일 변경 감지)’를 발견 경로로 기록했습니다. 양쪽 같은 작업 ID 완료를 확인했습니다. 이는 실사용 근거이며 Codex가 감시 프로세스를 직접 검증한 것은 아닙니다. 세션 수명/재시작/감시 폴더/이벤트 누락 시 예약 fallback을 확인하면 기존 방식으로도 짧은 지연에 반응할 가능성이 있습니다. 지금 가장 적은 변경으로 유지할 수 있는 방법입니다. 이전 조사에서 Monitor 검색 요약과 실제 공식 문서가 불일치했으므로 공식 지원 형태를 확정하지 않습니다.

로컬 근거: collaboration/reviews/user-instruction-eea370ff27ab4ea4bccf514b9e9d7a43_claude_review.md

## 4. Agent SDK/CLI headless worker — 직접 제어 가능하지만 별도 프로세스
SDK의 지속 클라이언트/streaming input과 CLI -p로 자체 작업자를 구동할 수 있습니다. 프로그램이 입력과 응답을 관리할 수 있습니다. 다만 기존 Desktop 실행 프로세스에 그대로 메시지를 끼워 넣는 것과는 다릅니다. resume은 기록을 이어가는 선택지로, 같은 살아 있는 세션에 중복 프로세스로 붙이는 것을 안전한 attach라고 해석할 수 없습니다. 별도 전용 검토 작업자를 운영한다면 명시적인 역할/기록/사용량/프로세스 종료를 관리해야 합니다. 구형 SDK V2 send/stream 예제는 현재 공식 문서에서 제거된 API로 표시되어 새 구현 기반으로 사용하지 않습니다.

출처: https://code.claude.com/docs/en/agent-sdk/sessions
출처: https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode
출처: https://code.claude.com/docs/en/headless

## 5. Remote Control — 사용자가 기존 세션을 조종하는 공식 경로
claude.ai/code나 모바일에서 로컬 세션에 접근하는 기능입니다. 기존 세션 연속성이 필요하고 사람이 직접 지시할 때 쓸 수 있습니다. 공개 문서를 검토한 범위에서 Python 대시보드가 사용할 일반적인 메시지 POST API는 확인하지 못했습니다. 웹 UI 자동화는 별도 연결로 취급해야 합니다.
출처: https://code.claude.com/docs/en/remote-control

## 6. Deep link 및 UI 자동 입력 — 마지막 선택지
claude-cli:// 링크는 새 터미널에 prompt를 채우며 사용자가 Enter를 눌러 전송합니다. 무인 즉시 실행이나 기존 Desktop 세션 전달을 제공하지 않습니다.
출처: https://code.claude.com/docs/en/deep-links

화면/키보드 자동화는 사용자 창 포커스와 입력 상태에 의존합니다. named pipe/Channels를 검증하기 전에 그 방식으로 구현할 근거가 없습니다. 비공개 서비스 요청 재현, 자격증명 추출, 사용 중인 Desktop 대화 기록 직접 덮어쓰기는 이번 조사/구현에서 수행하지 않았습니다.

## 실행 순서 제안
1. Claude가 자기 세션의 inbox 지원 여부/수신 정책/실제 버전을 확인. 토큰 내용은 출력하지 않고 존재 여부만 기록.
2. 지원된다면 동일 세션의 인증된 수신 시험과 대시보드 연동 설계. 실패면 원인을 구분하고 승인 우회하지 않음.
3. inbox 지원이 없거나 등록 방식이 맞지 않으면 Channels 로컬 webhook 시험. 세션 전환/외부 설정 변경이 필요하면 그 범위만 사용자에게 확인.
4. 기존 Monitor는 백업 경로로 유지. 전송 접수/held/실제 수신/작업 완료를 서로 다른 상태로 표시.

## 산출물과 현재 한계
이 조사 보고서와 Codex 발신 Claude 환경 확인 요청을 남겼습니다. 깊은 조사 요청은 구현/설치 권한으로 확대하지 않았습니다. 게임 HTML/대시보드 코드/외부 파일 변경 없음. 직접 연결 실험은 Claude 세션 정보가 필요하여 아직 실행하지 않았습니다. 대상 HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9.
