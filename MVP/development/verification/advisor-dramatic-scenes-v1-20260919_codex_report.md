# 대신 상호작용 장면 3종 콘셉트 v1 — Codex, 2026-09-19

## 목적

HTML MVP에서 잘 드러났던 대신 간 실랑이, 서로의 말을 듣고 답하는 과정, 새 대신의 조건부 등장을 Unity 화면 구성에 참고할 수 있는 인게임 시안으로 만든다.

## 산출물

1. `MVP/development/mockups/Generated/advisor_quarrel_dialogue_concept_v1.png`
   - 발렌과 세르안의 통제된 실랑이, 리안의 중재 준비, 카르덴의 장부 확인
   - 현재 한 줄 대사와 이전 논의 흐름을 함께 표시
2. `MVP/development/mockups/Generated/advisor_two_person_exchange_concept_v1.png`
   - 세르안과 리안이 서로 다른 자료를 대조하며 직접 대화
   - 현재 발화와 직전 발화를 연결해 독립 의견 카드가 아닌 대화 리듬을 표현
3. `MVP/development/mockups/Generated/advisor_karden_first_entrance_concept_v1.png`
   - 카르덴이 적절한 후반 등장 시점에 처음 회의실로 들어오는 장면
   - 등장 전 빈 좌석·물음표 슬롯 없이, 첫 대사 뒤 이름과 담당 정보가 드러나는 구조

공통 사항: 16:9, Codex built-in image generation, visual draft / non-canon / runtime 미연결.

## 구현 원칙

- 대신들은 왕에게 보고만 하지 않고 서로 듣고 반박하고 보완한다.
- 왕의 선택지는 논쟁과 의견 종합이 끝난 뒤에만 표시한다.
- 등장 조건을 만족하지 않은 인물은 좌석, 카드, 이름표로 미리 노출하지 않는다.
- 새 인물은 맡은 정보 범위와 행동으로 소개하고 감정이나 왕과의 관계를 단정하지 않는다.
- 이미지 속 대사, 이름·직함 배치, 수치와 사건명은 화면 예시이며 확정 캐논이 아니다.

## 변경 제외

Unity 런타임 코드, Ink, 스토리, `_shared`, `_history`, blind_test는 수정하지 않았다.

