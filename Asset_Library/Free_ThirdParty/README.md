# KING WAS ME — 무료 서드파티 에셋 후보 라이브러리

이 폴더는 웹에서 조사한 무료 에셋의 **검토용 보관소**다. Unity 프로젝트의 `Assets/` 안에 있지 않으며, 현재 게임에는 하나도 적용되지 않았다.

## 중요한 스타일 판정

첫 수집분은 모두 CC0지만, 실제 미리보기 결과 상당수가 밝고 캐주얼한 RPG·모바일 게임풍이다. KING WAS ME의 낮은 채도, 절제된 궁정극, 과장되지 않은 판타지 톤과 바로 맞는 자료는 제한적이다.

### `CC0/01_REVIEW_CANDIDATES/` — 우선 검토 가능

- `textures_paper/paper-textures-seamless/` — 종이·기록·서신 패널의 미세 질감으로 사용 가능. 채도를 낮추고 대비를 약하게 적용할 것.
- `textures_stone_earth_wall/` — 궁정·성벽 배경의 보조 질감 후보. 사진풍이 강한 것은 제외.
- `icons_hand_drawn/skymon-icons-free/` — 단색 흰색 아이콘이라 재채색과 축소가 쉬움. 필요한 기호만 선별할 것.
- `icons_documents/` — 문서·봉인·지도 의미를 확인하기 위한 작은 아이콘 참고. 픽셀 스타일은 최종 UI에 직접 사용하지 않는 편이 적절함.

### `CC0/90_REFERENCE_ONLY_CASUAL/` — 참고 전용, 현재 화풍과 맞지 않음

- `ui_fantasy_vector_png/` — 밝고 캐주얼하며 모바일 RPG풍. 구조 참고만 하고 직접 적용 비권장.
- `props_parchment/` — 붉은 봉인과 광택이 강하고 만화적. 소품 종류 참고용.
- `icons_medieval_inventory/` — 인벤토리 게임용으로 KING WAS ME 핵심 UI와 거리가 있음.
- `reference_castle_isometric/` — 도시 건설·아이소메트릭 참고용. 현재 장면 화풍과 직접 혼용 금지.
- `reference_background/` — 해상도와 화풍이 최종 배경에 부족해 구도 참고만 가능.

폴더 이름 자체가 적용 가능 여부를 나타낸다. `90_REFERENCE_ONLY_CASUAL`의 파일은 별도 재검토 없이 Unity로 옮기지 않는다.

## 라이선스

현재 보관한 항목은 각 OpenGameArt 배포 페이지에서 CC0로 명시된 자료만 포함한다. 원본 압축파일은 `_archives/`에 보존했고, 다운로드 결과·출처·SHA256은 `download_results.json`에 기록했다.

CC0라도 최종 적용 전 다음을 다시 확인한다.

1. `download_results.json`의 원본 배포 페이지
2. 압축본에 동봉된 README 또는 라이선스 파일
3. 실제 사용할 개별 파일이 해당 묶음의 라이선스 범위에 포함되는지
4. 다른 화풍과 섞었을 때 화면 일관성이 유지되는지

## 사용 원칙

- 이 폴더에서 Unity `Assets/`로 자동 복사하지 않는다.
- 사용자 또는 담당자가 개별 파일을 눈으로 확인한 뒤 필요한 것만 선별한다.
- 밝은 금색 테두리, 보석, 별점, 과장된 광택, 모바일 RPG식 버튼은 사용하지 않는다.
- 무료라는 이유만으로 게임의 시각 언어를 바꾸지 않는다.
- 최종 적용 파일은 별도 출처·라이선스 목록에 다시 기록한다.
