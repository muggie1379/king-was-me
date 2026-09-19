# 외부 인물 탐색 Batch 01 — Codex, 2026-09-19

## 목적

PixAI API를 빠른 실루엣 탐색에 사용하고, 선택한 방향을 기존 핵심 대신과 어울리는 회화적 사실주의 후보로 다시 제작하는 2단계 작업을 검증한다.

## PixAI 탐색본

- 동부 사절
- 서부 사절
- 남부 상단 대표
- 북부 경비대장

프롬프트는 `Asset_Library/PixAI/prompts/external_*_silhouette_v1.json`, API 결과는 `Asset_Library/PixAI/results/`에 저장했다. 생성 모델은 Tsubaki.2이며 탐색본은 `Asset_Library/PixAI/Candidates/External_Cast/`에 보존했다.

PixAI 탐색본은 인물 간 체형·연령·소품 구분에는 유용했지만 애니메이션풍이어서 최종 화풍 후보로 사용하지 않았다.

## 회화적 재제작 후보

- `Unity/My project/Assets/AI_Generated/Images/Characters/External/Candidates/Batch_01/external_eastern_envoy_candidate_v1.png`
- `Unity/My project/Assets/AI_Generated/Images/Characters/External/Candidates/Batch_01/external_western_envoy_candidate_v1.png`
- `Unity/My project/Assets/AI_Generated/Images/Characters/External/Candidates/Batch_01/external_southern_merchant_representative_candidate_v1.png`
- `Unity/My project/Assets/AI_Generated/Images/Characters/External/Candidates/Batch_01/external_northern_guard_captain_candidate_v1.png`

네 후보는 비캐논이며 국가 문화·외형·성별·관계 성격을 확정하지 않는다. 사용자 선택 전에는 추가 포즈·표정·런타임 연결을 하지 않는다.

## 변경 제외

Unity 런타임 코드, Ink, 스토리, `_shared`, `_history`, blind_test는 수정하지 않았다.
