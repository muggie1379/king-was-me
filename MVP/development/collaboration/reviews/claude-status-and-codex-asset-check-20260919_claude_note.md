# Claude → Codex 상태 공유 + 산출물 확인 (2026-09-19)

## 확인한 Codex 산출물
대신 초상화 v1/v2(카르덴은 사용자 선택으로 여성 v3), 세르안 베이스, Unity 아트 배치 03/04(환경 변형, UI 에셋: 어드바이저 카드/확인 모달/지도·모래시계·봉인 아이콘), 다국가 v6.8.0 Kingdom Slice + `05_multi_kingdom_relationship_routes.md`. 보고서 기준 Assets/Scripts·Ink를 건드리지 않은 점 확인, 협업 규칙 준수 감사합니다. 런타임 연결은 Claude가 진행합니다.

## Claude가 한 것 (상세는 각 리포트)
- `phase1-2-e23-east-replies-20260919_claude_report.md`: E23 동부 측 대사(기본/방문 x 의도 5) — Ink + 04_story_bible.md 반영, 10경로 검증. **v6.8.0 Ink(Event 29 등)는 그대로 보존**, 패치는 E23 영역만.
- `unity-hud-pass-20260919_claude_report.md`: Unity 첫 화면/대신 카드/왕실 기록/챕터 표시 + 버그 3건(첫 글자 잘림, Act 전환 미동작, 좁은 창에서 선택지 글자 사라짐).
- `elevenlabs-audio-20260919_claude_report.md`: ElevenLabs 유료(Starter)로 Act별 음악·앰비언스·UI 사운드 교체. **⚠ 보안 사고 기록 포함**(API 키가 DotSoccer 공개 저장소에 푸시됨 → 키 비활성화, 설정에서 제거). 코덱스 쪽에도 같은 실수 방지를 위해: 비밀값을 넣는 파일은 git 추적 여부부터 확인.
- `SKILL.md`에 "잠금 중 읽기는 항상 허용(사용자 지시)" 규칙 추가.
- Unity `Assets/Editor/DevCaptureTools.cs`: Play UI를 PNG로 캡처/자동 진행/이벤트 점프하는 개발용 메뉴(`KingWasMe/Dev/*`). 코덱스는 Unity 파일 비수정 원칙 유지 부탁드립니다.

## 코덱스에게 요청/질문
1. 기존 공지(폴더 재편, 유휴 시 자율 착수 정책, 로드맵, 에셋 프롬프트)에 대한 의견 파일이 아직 없습니다. 필요하면 `reviews/`에 남겨주세요.
2. 초상화 후속: 카드에 붙일 최종 캐스팅(v2/v3 중 확정본)과 파일명 확정본을 `ASSET_MANIFEST.md`에 표시해주시면 그대로 연결하겠습니다. 패널 텍스처는 9-slice 처리가 필요해 Unity 임포트에서 제가 처리합니다.
