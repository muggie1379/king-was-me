# Claude 작업 기록 — 절차적 오디오 추가 (2026-09-19)

ROADMAP.md "사용자 방향 전환" 항목 중 오디오 파트. 코덱스도 전용 오디오 생성 도구가 없다고 확인돼서, 다운로드/외부 API 없이 Unity 코드로 직접 생성.

## 한 것

- `Assets/Scripts/ProceduralAudio.cs` 신규: `AudioClip.Create` + `SetData`로 사인파 기반 오디오를 코드로 직접 생성하는 정적 헬퍼 2개.
  - `CreateAmbientDrone`: 3개 파르티알(루트+5도+약간 디튠된 옥타브) 합성 + 느린 볼륨 LFO로 밋밋한 테스트톤이 아니게 함. 길이가 파형 주기의 정배수라 루프 이음매가 안 튐.
  - `CreateUiBlip`: 사인 곡선 엔벨로프(0→1→0)로 클릭/팝 노이즈 없는 짧은 UI 효과음.
- `StoryController.cs`에 연결:
  - ACT별 배경음 베이스 주파수(A3/B3/G3/F3/A#3)를 기존 `ActMoods` 배열에 같이 넣어서, 배경색 전환과 같은 시점에 오디오도 같이 바뀌게 함(`UpdateActMood()` 안에서 색 코루틴 시작과 동시에 `AudioSource.clip` 교체).
  - 텍스트 한 줄 넘길 때, 선택지 클릭할 때 짧은 UI 블립 재생.

## 버그 1개(색상 버그와 동일 원인) 발견/수정

배경음도 처음엔(Event 1) 안 나왔음 — 이유는 색상 버그와 완전히 동일: `story.state.currentPathString`이 스토리 시작 직후 빈 문자열이라 `UpdateActMood()`가 스킵됨. 색 때와 같은 방식으로, `BuildAudio()`에서 ACT I 드론을 직접 재생하도록 초기화해서 해결.

## 검증

- 재컴파일 0 에러/0 경고.
- Play 모드에서 `get_gameobject`로 AudioSource 상태 직접 확인: `clip: "ambient_220hz"`, `isPlaying: true`, 루프 재생 중.
- UI 블립용 두 번째 AudioSource는 `PlayOneShot` 전용이라 평상시 `clip: null, isPlaying: false`가 정상 상태임을 확인(버그 아님).

## 알아둘 것

- 이건 어디까지나 "완전 무음" 상태를 메우는 placeholder입니다 — 사인파 합성이라 소리 자체의 완성도는 낮습니다. 실제 작곡/녹음된 음악·효과음으로 교체하는 게 정식 방향이고, 그 전까지 최소한의 분위기만 채우는 용도입니다.
- 코덱스가 생성 중인 배경 이미지가 들어오면, 이 배경색/배경음 전환 타이밍(ACT 경계)에 이미지 크로스페이드도 같이 넣는 게 다음 단계로 자연스러워 보입니다.
