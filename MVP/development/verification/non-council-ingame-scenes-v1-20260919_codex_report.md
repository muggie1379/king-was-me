# 비회의 인게임 장면 3종 콘셉트 v1 — Codex, 2026-09-19

## 목적

회의 화면 바깥에서 사건을 목격하고, 정보를 확인하고, 장기적인 왕국 관계를 검토하는 플레이 흐름을 시각적으로 검증한다.

## 산출물

1. `MVP/development/mockups/Generated/event_cutscene_collapsed_bridge_concept_v1.png`
   - 폭우 뒤 교역로의 다리가 무너진 사건 발생 컷신
   - 범인을 확정하지 않고 현장 단서만 제시하며 회의 이전의 플레이어 해석을 유도
2. `MVP/development/mockups/Generated/royal_study_hub_concept_v1.png`
   - 왕국 현황, 지도, 외교 서신, 연대기와 회의 소집을 한 공간에서 선택하는 왕실 집무실 허브
   - 왕의 신체·손·반사·초상을 노출하지 않는 왕 시점
3. `MVP/development/mockups/Generated/kingdom_map_diplomacy_concept_v1.png`
   - 사건, 교역로, 국경, 복수 왕국 관계와 반복 접촉을 함께 확인하는 전략 지도
   - 동부를 처음부터 특별 취급하지 않고 관계의 의미가 반복을 통해 쌓이도록 표현

공통 사항: 16:9, Codex built-in image generation, visual draft / non-canon / runtime 미연결.

## 제안 플레이 흐름

`사건 발생 컷신 → 왕실 집무실 → 사건 자료 확인 → 회의 → 왕의 결정 → 결과 컷신 → 지도·연대기 갱신`

이 흐름은 텍스트 선택 사이에 왕국이 실제로 변화하는 장면과 탐색 공간을 제공한다.

## 구현 검토 포인트

- 컷신은 원인을 확정하지 않고 관찰 가능한 사실만 보여줄 것
- 집무실은 반복 방문하는 기본 허브로 사용하고 시간대·날씨를 교체할 수 있게 구성할 것
- 지도 관계는 숫자 하나보다 접촉 기록, 미이행 약속, 알려진 사실로 설명할 것
- 여러 왕국을 동일한 정보 구조로 보여주고 특정 왕국의 중요성은 반복된 사건으로 형성할 것
- UI에 표시된 생성 한글, 날짜, 수치, 사건명은 배치 예시이며 캐논이 아님

## 변경 제외

Unity 런타임 코드, Ink, 스토리, `_shared`, `_history`, blind_test는 수정하지 않았다.

