# Claude 작업 기록 — ElevenLabs 오디오 연동 (2026-09-19)

사용자 요청: 절차적(사인파) 오디오가 "구리다" → 웹/도구로 실제 오디오 확보. 코덱스도 오디오 생성 도구가 없어서 Claude가 처리. 관련 이전 기록: `procedural-audio-20260919_claude_report.md`(임시 대체품), `background-art-integration-20260919_claude_report.md`.

## 한 것

1. **도구 조사**: Claude 커넥터 디렉토리의 ElevenLabs 커넥터는 음성 에이전트 관리용이라 부적합. 실제 SFX/음악 생성은 로컬 `elevenlabs-mcp` 패키지.
2. **연결**(사용자 승인 후): `pip install elevenlabs-mcp`(uv 없음), `E:\DotSoccer\.mcp.json`에 `elevenlabs` 서버 추가(세션 루트가 DotSoccer라 그 파일만 로드됨 — `mcp-unity-kingwasme`와 같은 사유). `ELEVENLABS_MCP_BASE_PATH`는 `Assets/AI_Generated/Audio`.
3. **자격증명 처리**: 사용자의 Chrome에서 API 키 생성(이름 `KING_WAS_ME_audio`, 효과음 + 뮤직 생성 권한만 부여 — 최소 권한). 키 값은 사용자가 직접 `.mcp.json`에 붙여넣음. Claude는 키를 어디에도 입력/재출력하지 않음. 구독 조회(`user_read`)는 권한 없음으로 401 — 정상.
4. **플랜**: 무료 플랜에서 음악 API는 402(`paid_plan_required`). 사용자가 Starter($6/월, 상업용 라이선스 포함)로 직접 업그레이드.
5. **생성물**(`Unity/My project/Assets/AI_Generated/Audio/`): `act01~05_ambient.mp3`(5초 루프, SFX API), `ui_click.mp3`/`ui_choice.mp3`(0.5초), `act01~05_music.mp3`(30초 instrumental, `music_v2`). 프롬프트는 DESIGN_INTENT 톤(절제, 승리/전투 음악 금지, 국가·문화 비캐논)을 따름.
6. **무료 시절 산출물 교체**: 무료 플랜에서 만든 SFX 7개는 상업 라이선스가 소급되지 않는다고 알고 있어(정확한 약관은 사용자 확인 권장) 유료 상태로 재생성. 원본은 삭제하지 않고 `E:\KING WAS ME\old\free-tier-audio-20260919\`로 이동.
7. **`StoryController.cs`**: 실제 오디오를 우선 로드(`LoadAiAudioClip`, 에디터 전용)하고 없으면 `ProceduralAudio` 사인파로 폴백. Act별 `musicSource`(볼륨 0.7, 루프) + 앰비언스 0.45 겹침(`PlayActMusic`). UI 클릭/선택지 클릭은 서로 다른 클립.

## 검증

- 재컴파일 0 에러/0 경고. 새 mp3 임포트 후 Play 모드에서 AudioSource 상태 확인: `act01_music`(vol 0.7)과 `act01_ambient`(vol 0.45)가 동시에 `isPlaying: true, loop: true`.
- **실제 소리는 확인 못 함**(청취 불가). 품질 판단은 사용자 몫.

## 알아둘 것

- 30초 음악은 루프 이음매가 들릴 수 있음(드래프트 허용 수준).
- ElevenLabs Starter 크레딧(30k/월) 소모량 미확인. 대량 생성 전 확인 필요.
- **⚠ 보안 사고(2026-09-19 확인)**: `E:\DotSoccer\.mcp.json`에 API 키가 평문으로 들어 있는데, 이 파일은 DotSoccer git 저장소에 추적되고(`.gitignore` 대상 아님) 자동 커밋 스크립트가 커밋 `3707f94`(11:13)에 키를 포함해 **공개 저장소 origin/master로 푸시**했다. 이미 공개된 것으로 간주해야 하므로 **해당 키는 폐기(revoke)하고 새로 발급**해야 한다. 새 키는 추적되는 파일에 두지 않는다(사용자 범위 MCP 설정 등). 히스토리 재작성/강제 푸시는 이미 공개된 키에 효과가 없어 권하지 않으며 사용자 지시 없이 하지 않는다. 

### 사후 조치 (같은 날)
- 사용자 지시로 Chrome에서 ElevenLabs 대시보드의 `KING_WAS_ME_audio`(끝자리 7843) 키를 **비활성화**함(삭제가 아니라 되돌릴 수 있는 토글 — "다시 활성화하기 전까지 작동하지 않음" 확인 창 승인 후 토스트 "API 키가 비활성화되었습니다" 확인). 완전 삭제는 사용자가 원하면 대시보드 `…` 메뉴에서 진행.
- `E:\DotSoccer\.mcp.json`에서 `elevenlabs` 항목 제거(키 문자열 0건 확인, JSON 유효). 이 파일의 변경은 아직 커밋 전(`M`) — 자동 커밋이 다음 주기에 올림.
- 이미 푸시된 커밋 `3707f94`에는 (이제 무효인) 키가 남아 있음. 히스토리 재작성은 하지 않음(공개된 키에는 효과 없음, 강제 푸시는 사용자 지시 필요).
- **현재 세션의 `elevenlabs` MCP는 키가 죽어서 더 못 씀.** 새 키는 추적되는 파일 밖(사용자 범위 MCP 설정)에 둘 것. 그때까지 오디오 추가 생성 불가(이미 만든 파일은 Unity에 있음).
- 교훈: 비밀값을 넣는 설정 파일은 쓰기 전에 `git check-ignore`/`git ls-files`로 추적 여부를 먼저 확인한다.
- 코덱스 요청 사항: 오디오는 이제 Claude 쪽에서 해결됨. 이미지 작업(`Assets/AI_Generated/Images`)은 계속 코덱스 담당.
