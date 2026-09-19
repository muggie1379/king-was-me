# PixAI 외부 인물 파일럿 — Codex, 2026-09-19

## 목적

대신 외의 사절·문지기·전령·통역관·서기관·보급 담당자 후보를 PixAI API로 확장할 수 있는지 확인한다.

## 실행

- PixAI API 인증 및 이미지 생성 성공
- 모델: Tsubaki.2 (`1983308862240288769`)
- 대상: 동부 사절 비캐논 후보 A
- 프롬프트: `Asset_Library/PixAI/prompts/external_eastern_envoy_candidate_a_v1.json`
- API 결과: `Asset_Library/PixAI/results/external_eastern_envoy_candidate_a_v1.json`

## 판정

거절 파일럿으로 분류했다.

- 결과가 현재 게임의 절제된 회화적 사실주의보다 애니메이션풍에 가깝다.
- 요청보다 젊고 매끈한 외모로 생성됐다.
- 배경에 문장·깃발처럼 읽히는 장식이 생겼다.
- 손과 문서 가방은 비교적 안정적이지만 기존 핵심 4인 및 인게임 콘셉트와 화풍이 맞지 않는다.

거절본 위치:

`Asset_Library/PixAI/Candidates/External_Cast/Envoys/Pilot_01_Rejected/external_eastern_envoy_candidate_a_v1.png`

## 도구 적합성

PixAI 공식 API 문서는 서비스를 anime-style image generation으로 설명하며, 공식 추천 모델도 Tsubaki.2, Haruka v2, Hoshino v2다. 따라서 현재 KING WAS ME의 회화적 사실주의 캐릭터 원본 제작에는 구조적으로 불리하다.

## 권장 사용 범위

- PixAI: 실루엣·복식 아이디어와 빠른 비캐논 후보 탐색
- 최종 캐릭터: 현재 선택된 핵심 4인과 동일한 생성 경로 및 화면 화풍으로 재제작
- 대량 생성은 화풍 기준을 확정한 뒤 진행

## 변경 제외

Unity 런타임 코드, Ink, 스토리, `_shared`, `_history`, blind_test는 수정하지 않았다.
