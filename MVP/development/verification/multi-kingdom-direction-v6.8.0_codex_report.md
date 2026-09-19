# Multi-Kingdom Relationship Direction v6.8.0 — Codex 작업 기록

작성일: 2026-09-19
작업자: Codex
범위: 기획 문서, Ink 구조, 개발용 Kingdom Slice, 문서/검증
Unity 수정: 없음 — Claude 작업 중 충돌 방지

## 사용자 승인 방향

- 동부만 관계 서사의 대상이 되지 않는다.
- 서부·남부·북부·해안도 각자의 지속 결과와 다음 장면을 가질 수 있다.
- 관계는 비독점적이며 여러 나라와 동시에 이어질 수 있다.
- 국가와 현실 관계를 1:1로 고정하지 않고 은유의 해석은 플레이어에게 남긴다.
- 2회차는 완전한 번역표가 아니라 선택된 장면과 감각의 울림으로 구성한다.

## 변경

- 기획/05_multi_kingdom_relationship_routes.md 신규 작성
- 02_design_bible.md, 03_character_bible.md에 최신 승인 기준 추가
- 04_story_bible.md에 우선 기준과 기존 TBD 해소 기록
- 04_story_bible.ink Event 29를 단일 미정 사절에서 조건부 복수 국가 후속 접촉으로 변경
- KING_WAS_ME_KINGDOM_SLICE.html을 v6.8.0으로 갱신
- 1회차 엔딩에 북부·남부·서부·동부의 실제 선택 기반 후속 외교를 병렬 표시
- 단일 호감도, 최고 관계국 자동 선정, 독점 공략 잠금은 추가하지 않음
- 00_START_HERE.md와 development/README.md 갱신

## 보존 및 복원

변경 전 원본은 다음 경로에 상대 경로 그대로 보존:
_history/2026-09-19_multi-kingdom-relationship-direction/before

해시 목록:
_history/2026-09-19_multi-kingdom-relationship-direction/MANIFEST.json

복원하려면 before 아래 파일을 프로젝트 루트의 같은 상대 경로로 복사한다. 기존 스냅샷은 수정하지 않았다.

## 검증

PASS:
- script1.js / script2.js 문법 검사
- 1회차 10사건 및 2회차 10장면 자동 완주
- 타임아웃 경로
- 1회차↔2회차 전환과 상태 복원
- Strong Branch 및 동적 제목 resolve
- 1회차 14개 결과/집계 조건
- 북부·남부·서부·동부 4개 후속 외교 동시 표시
- 2회차 126개 완결 경로
- Ink 괄호 균형 0, Event 29/epilogue 단일 정의, 5개국 조건 존재

제한:
- 로컬 Ink 컴파일러가 없어 정식 Ink 컴파일/플레이 검증은 Claude/Unity 이식 단계에서 필요
- 실제 브라우저 시각 확인 필요
- 현재 HTML은 해안 사건이 없는 10사건 세로 단면이므로 해안 후속은 기획/Ink에만 존재

## 보호 대상 확인

변경 없음:
- MVP/development/KING_WAS_ME_MVP.html: f22924a6597cc9c34bc357249fc7fc928668350690215a7024a8fef0dd973dd9
- MVP/KING_WAS_ME_MVP.html: bbd6aebede4ac69fec96c36373c223bd84350b4bd5cbfe9625703ee80e7c59c9
- MVP/blind_test/KING_WAS_ME_MVP.html: 98fb8f4a2b4d0adf0b3e40409a625d73f1e324854bb34555cd1ad68b2757c093
- _shared: 수정하지 않음
- Unity: 수정하지 않음

## 변경 후 주요 해시

- KING_WAS_ME_KINGDOM_SLICE.html: 9aecdb66046f866f8c59c22ef27f103d8f6ae286d9c73df67846cb5cc0b467cd
- 04_story_bible.ink: 3f0238ab18bdf3934b052453e081ac18714aa3609a87274fb710fb540737667d
- 05_multi_kingdom_relationship_routes.md: 976c58fb6020b56119b4fb61416b3f439e718a325ead071ebc5364fccf5664fd
