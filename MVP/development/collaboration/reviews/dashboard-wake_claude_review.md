# Claude 독립 검토 — dashboard-wake

request ID: dashboard-wake
검증한 HTML SHA256: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
발견 경로: 사용자가 채팅으로 "코덱스가 요청 보냈대"라고 직접 알려줌 (자동 10분 스캔보다 먼저 수동으로 확인)

## GUI 버튼 동작 / 비동기 / 연속 클릭 / 타임아웃 구분

`visual_dashboard.py`의 `wake()`/`poll_wake()`를 코드로 확인했습니다.
- 버튼 클릭 즉시 `self.wake_buttons['codex'].config(state='disabled')` — 연속 클릭 방지가 클릭 시점에 바로 걸립니다.
- 실제 전송은 `threading.Thread(target=send, daemon=True).start()`로 별도 스레드에서 실행, `queue.Queue()`로 결과를 GUI 메인 루프에 전달(`self.app.after(150,self.poll_wake)`로 폴링) — Tk 메인 루프를 막지 않는 정상적인 패턴입니다.
- 결과 수신 후 `self.app.after(30000, ...)`로 30초 뒤 버튼 재활성화 — 성공/실패/타임아웃 관계없이 동일하게 30초 쿨다운.
- `wake.py`의 `wake()` 내부에서 `subprocess.run([exe,'queue','--thread',THREAD,'--message',MESSAGE], timeout=25, shell=False, ...)` — 리스트 인자라 셸 인젝션 위험 없음. `TimeoutExpired`/`Exception` 각각 별도 status(`uncertain`/`failed`)로 기록, 무조건 성공 처리 안 함.

## 접수 성공 ≠ 처리 완료 혼동 여부

`wake.py` line 24-26: `returncode==0 and 'Queued message' in r.stdout`일 때만 `status='queued'`, 텍스트도 "Codex 작업에 메시지 접수됨 · **작업 완료는 아직 확인되지 않았습니다**"로 명시 — 접수와 완료를 명확히 구분합니다. 완료(`completed`) 상태로 자동 전환하는 코드는 어디에도 없습니다.

## `--smoke` 안전성 (직접 실행해 확인)

`--smoke` 블록은 `ui.refresh()`만 호출하고 `wake()`는 절대 호출하지 않습니다(코드 확인). 실제로 `& '.\협업 현황 열기.cmd' --smoke`를 다시 실행해 `Visual dashboard startup / refresh / countdown PASS`만 나오고 `wake_events/`에 새 이벤트가 생기지 않는 것도 확인했습니다 — **자동 테스트가 실수로 실제 메시지를 보낼 위험 없음.**

## ⚠ 사용자 확인이 필요한 부분

이건 지금까지의 협업 도구와 성격이 다릅니다 — `wake.py`가 `C:\Users\ldw12\AppData\Local\OpenAI\Codex\bin\...\codex.exe`(E:\KING WAS ME 바깥 경로)를 찾아서 **실제로 외부 프로그램을 실행**합니다. 코드 자체(인자 분리, 타임아웃, 에러 처리, 프로젝트 내부에만 로그 기록)는 안전하게 짜여 있다고 판단하지만, "파일을 읽고 쓰는" 지금까지의 협업 방식과 달리 **외부 프로세스를 실행하는 첫 사례**라 제가 임의로 "완전 승인"이라고 하기보다는 사용자께 이 버튼의 존재를 알려드리고 넘어가는 게 맞다고 생각합니다. (제가 이 버튼을 직접 누르거나 wake()를 실행하지는 않았습니다 — 코드 검토만 했습니다.)

## Claude 쪽 동등한 "깨우기" 인터페이스 제공 가능 여부

없습니다. `ListAgents`로 이미 확인했듯 이 세션에 외부에서 메시지를 보낼 수 있는 공식 채널이 없고, Codex처럼 CLI로 `queue --thread --message`를 실행해줄 대상도 없습니다. 대신:
- Claude 쪽은 이미 `CronCreate`로 10분마다 자체적으로 깨어나 협업 상태를 확인하는 반복 작업이 돌고 있어서, "주기적으로 깨우기"라는 목적 자체는 이미 충족되어 있습니다.
- 즉시 깨우기가 필요하면, 지금처럼 사용자가 채팅으로 알려주시는 게 가장 확실합니다.
- 별도의 "Claude 깨우기" 훅을 만들려면 이 프로젝트 밖에 뭔가(리스너 프로세스, 설치 등)가 필요할 가능성이 높은데, 이는 사용자의 하드 바운더리(E:\KING WAS ME 밖 승인 없이 금지)에 걸리는 영역이라 제가 임의로 만들지 않겠습니다.

## 대시보드 버튼으로 들어온 실제 요청 처리

`controls/dashboard-control-15da7051c6fc41bc99525917c0402e57.json`(담당: claude, 협업 확인 / 지금 조회)을 발견해 지금 이 검토와 함께 실제로 처리했습니다 — `status: completed`로 기록. 같은 배치의 codex 담당 요청 2건은 제 담당이 아니라 손대지 않았습니다.

## 결론

코드 품질/안전성은 양호합니다(인젝션 없음, 타임아웃 처리, 접수/완료 구분 명확, smoke 테스트 안전). 다만 외부 프로세스 실행이라는 새로운 성격 때문에 **기능 승인은 사용자 확인 후로 남겨둡니다** — 사용자님, 이 "Codex 깨우기" 버튼을 실제로 쓰셔도 괜찮다고 보시나요?
