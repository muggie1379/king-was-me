# Claude 작업 기록 — 코덱스 배경 아트 연동 (2026-09-19)

사용자 요청: "코덱스가 생성해준 이미지 확인해보고 적용해줘".

## 확인한 것

`Unity/My project/Assets/AI_Generated/`에 코덱스가 만든 결과물 확인:
- `ASSET_MANIFEST.md` — Act 5개 배경(1672×941 PNG), 국가/문화 비캐논 명시, `Assets/Scripts`/`Assets/Resources/Ink` 안 건드렸다고 명시(요청 프롬프트대로 지켜짐).
- 이미지 2개(act01, act04) 직접 열어서 톤 확인 — 절제된 painterly 스타일, 캐릭터/텍스트 없음, 매니페스트 설명과 일치. 나머지 3개도 같은 생성기/스타일이라 개별 확인 생략.

## 적용한 것

`Assets/Scripts/StoryController.cs`:
- `ActMoods` 배열에 `bgFile` 필드 추가, 기존 Act 색상/오디오 매핑과 같은 테이블에 배경 이미지 파일명도 연결.
- 새 `BackgroundArt` Image 레이어를 기존 `Background`(무드 컬러) 레이어 **뒤에** 추가 — 배경 그림이 기본이 되고, 기존 무드 컬러는 알파 0.45짜리 틴트로 위에 얹어서 Act 전환 시 색 전환 애니메이션은 그대로 유지.
- `LoadActBackgroundSprite()`: 에디터 전용(`AssetDatabase.LoadAssetAtPath<Texture2D>` + `Sprite.Create`)으로 런타임 로드, 캐싱. Import 설정(Single/Multiple 스프라이트 모드)에 의존하지 않는 방식이라 코덱스가 만든 .meta를 그대로 신뢰하지 않고도 안전하게 작동.
- `UpdateActMood()`가 Act 전환 시 배경색 코루틴과 함께 `bgArtImage.sprite`도 같이 교체.
- 이미지 비율(1672×941 ≈ 1.78:1)이 Canvas 참조 해상도(1280×720, 1.78:1)와 거의 동일해서 `preserveAspect=false`로 채워도 왜곡이 거의 없음.

## 검증

- 재컴파일 0 에러/0 경고.
- Play 모드에서 `get_gameobject`로 `BackgroundArt`의 `Image.preferredWidth/Height`가 `1672/941`(소스 PNG 크기와 정확히 일치)인 것 확인 — 스프라이트가 실제로 로드됐음을 코드 레벨에서 확인.
- 실제 렌더링 결과(눈으로 보는 최종 그림)는 스크린샷 도구가 없어 직접 확인은 못 했음 — 사용자가 Play 눌러 직접 봐주셔야 함.

## 알아둘 것

- 여전히 에디터 전용(`#if UNITY_EDITOR`)입니다 — 빌드에는 아직 안 나옵니다.
- 오디오는 여전히 절차적 생성(사인파) 그대로입니다. 코덱스 쪽에 오디오 생성 도구가 생기면 그때 같은 방식으로 교체 가능합니다.
