# 세르안 좌석 포즈 시범 제작 — Codex, 2026-09-19

- 작업 ID: `seran-seated-pose-pilot-20260919`
- 범위: 비캐논 시각 초안, 세르안 v2 좌석 포즈 6종
- 시작 HTML SHA256: `f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9` (협업 스캔 기준)
- 현재 MVP HTML은 수정하지 않음
- 매니페스트 시작 SHA256: `b105df89b80ac7b8271c573333230a71dd96cdb5ecb2021edc0db95866e3433f`
- 매니페스트 완료 SHA256: `3f51f5eb4d6452af6f8f8aa5b0ea56f311eda7b5b256b0ad724ee206a285dc0f`

## 결과

세르안 v2 외형을 유지한 좌석 포즈 6종을 `Images/Characters/Seated/`에 만들었다. 모든 파일은 1024×1536 PNG이며 네 모서리 알파 값을 확인해 실제 투명 영역이 있음을 검증했다.

포즈:

1. seated_idle_gaze
2. speaking
3. turn_left
4. turn_right
5. thinking
6. silent_gaze

## PixAI 시범

PixAI Tsubaki.2, 동일 시드와 고정 프롬프트로 idle/speaking/thinking 세 장을 먼저 생성했다. 얼굴·의상 내부 일관성은 있었지만 기존 세르안보다 젊고 애니메이션풍이 강했으며 thinking이 턱 괴기 금지를 지키지 않았다. Unity 선택본으로 사용하지 않고 `Asset_Library/PixAI/Candidates/Seran/Pilot_01_Rejected/`에 비교 자료로 보존했다.

## 선택본

내장 이미지 생성 도구의 identity-preserve 편집으로 기존 `advisor_seran_v2.png`를 참조했다. 성숙한 얼굴, 묶은 은발, 수직형 관복, 서류 단서, 조명과 카메라 거리를 유지했다. 최초 speaking 요청 한 건은 출력 안전 필터에서 실패해 단순화한 동일 범위 프롬프트로 다시 생성했다.

## 검증

- 파일 수: 6
- 크기: 전부 1024×1536
- 픽셀 포맷: 전부 32bpp ARGB
- 네 모서리 투명도: 전부 255 미만 알파 확인
- 왕의 모습, 글자, 국기, 국가 문양, 무기 없음
- `Assets/Scripts`, `Assets/Resources/Ink`, `_shared`, `_history`, blind_test 수정 없음
- Unity 런타임 연결은 Claude 담당이므로 수행하지 않음

## 남은 작업

- Unity 카드/좌석 실제 크기에서 200px 축소 가독성 확인
- Claude 독립 검토 후 세르안 시범 승인 여부 결정
- 승인 뒤 다른 대신 포즈, 중립 실루엣, 5/7/9석 회의장, Court UI 키트 순서로 확장
