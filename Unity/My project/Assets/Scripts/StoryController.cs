using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using Ink.Runtime;
using Ink.UnityIntegration;

// KING WAS ME - Unity playable draft.
// Builds its own UI at runtime (no manual scene wiring needed) and drives
// it from 기획/04_story_bible.ink, compiled by ink-unity-integration into
// Assets/Resources/Ink/story_bible.json.
//
// Reveals story text one line at a time (click/Space/Enter to advance, 1~9 to choose) instead of
// dumping a whole paragraph before the next choice — the wall-of-text
// dump-then-click pattern was the main source of reading fatigue in the
// first draft (2026-09-19 user feedback: "플레이하고 싶은 게임으로").
public class StoryController : MonoBehaviour
{
    static readonly Dictionary<string, string> SpeakerColors = new Dictionary<string, string>
    {
        { "세르안", "#7FB3FF" },
        { "발렌", "#FF8A65" },
        { "리안", "#66D9A6" },
        { "카르덴", "#D9A566" },
        { "Watcher", "#B39DDB" },
        { "Chaplain", "#B39DDB" },
        { "Fool", "#B39DDB" },
    };
    const string DefaultSpeakerColor = "#CFCFCF";
    static readonly Regex SpeakerLine = new Regex(@"^([가-힣A-Za-z][가-힣A-Za-z ]{0,10}):\s*(.*)$");
    static readonly Regex EventPathNumber = new Regex(@"event_(\d+)");

    Story story;
    Text storyText;
    Image bgImage;
    Image bgArtImage;
    RectTransform choicesContainer;
    ScrollRect scrollRect;
    Button advanceCatcher;
    Coroutine moodCoroutine;
    int lastActEventNum = -1;
    GameHud hud;
    TempScreens screens;
    CourtRoster roster;
    AssetCatalog catalog;

    AudioSource musicSource;
    AudioSource ambientSource;
    AudioSource uiSource;
    AudioClip uiBlipClip;
    AudioClip uiChoiceClip;
    readonly System.Collections.Generic.Dictionary<float, AudioClip> ambientClipCache = new System.Collections.Generic.Dictionary<float, AudioClip>();

    readonly List<StoryBeat> pendingLines = new List<StoryBeat>();
    int lineIndex;
    EventPhase? stickyPhase;
    EventPhase currentPhase = EventPhase.Narration;
    IPhasePresenter presenter;
    bool royalPauseDone;
    Coroutine pauseCoroutine;
    const float DefaultRoyalPauseSeconds = 1.4f;

    void Awake()
    {
        catalog = AssetCatalog.Load();
        UiFonts.Init(catalog);
        BuildAudio();
        BuildUI();

        // 스토리는 카탈로그가 직렬화해 둔 InkFile에서 읽는다 - 에디터/빌드 공통.
        if (catalog.story == null || string.IsNullOrEmpty(catalog.story.storyJson))
        {
            storyText.text = "[오류] Ink 스토리를 찾지 못했습니다.@@메뉴 KingWasMe/Court/Build or Update Asset Catalog 를 실행하고, Unity 콘솔에 Ink 컴파일 에러가 없는지 확인해주세요.".Replace("@@", "\n");
            return;
        }

        story = new Story(catalog.story.storyJson);
        story.onError += OnStoryError;
        advancePromptText.gameObject.SetActive(false); // 제목 화면 뒤로 "클릭해서 계속"이 비쳐 보이지 않게
        advanceCatcher.gameObject.SetActive(false);
        hud.ShowTitle(BeginStory);
    }

    void BuildAudio()
    {
        musicSource = gameObject.AddComponent<AudioSource>();
        musicSource.loop = true;
        musicSource.playOnAwake = false;
        musicSource.volume = 0.7f;

        ambientSource = gameObject.AddComponent<AudioSource>();
        ambientSource.loop = true;
        ambientSource.playOnAwake = false;
        ambientSource.volume = 1f; // clip samples already carry the intended low volume

        uiSource = gameObject.AddComponent<AudioSource>();
        uiSource.playOnAwake = false;
        uiBlipClip = catalog.uiClick != null ? catalog.uiClick : ProceduralAudio.CreateUiBlip("ui_blip");
        uiChoiceClip = catalog.uiChoice != null ? catalog.uiChoice : uiBlipClip;

        // story.state.currentPathString은 첫 틱에 비어 있어 UpdateActMood()가 못 잡는다 - ACT I 오디오를 직접 시작한다.
        ApplyActAudio(catalog.acts[0]);
    }

    // AI 음악이 있으면 앰비언스는 뒤로 낮춰서 깐다. 없으면(카탈로그 미채움) 절차적 드론만.
    void ApplyActAudio(ActAssets act)
    {
        var ambient = act.ambient != null ? act.ambient : GetProceduralDrone(act.droneHz);
        if (ambientSource.clip != ambient)
        {
            ambientSource.clip = ambient;
            ambientSource.Play();
        }

        if (act.music == null)
        {
            ambientBaseVolume = 1f;
            return;
        }

        ambientBaseVolume = 0.45f;
        if (musicSource.clip != act.music)
        {
            musicSource.clip = act.music;
            musicSource.Play();
        }
    }

    AudioClip GetProceduralDrone(float droneHz)
    {
        if (!ambientClipCache.TryGetValue(droneHz, out var clip))
        {
            clip = ProceduralAudio.CreateAmbientDrone($"ambient_{droneHz:0}hz", droneHz);
            ambientClipCache[droneHz] = clip;
        }
        return clip;
    }

    void BuildUI()
    {
        if (FindFirstObjectByType<EventSystem>() == null)
        {
            var es = new GameObject("EventSystem");
            es.AddComponent<EventSystem>();
            es.AddComponent<InputSystemUIInputModule>();
        }

        var canvasGO = new GameObject("UICanvas");
        var canvas = canvasGO.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = canvasGO.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1280, 720);
        scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.Expand; // 창이 낮고 넓어도 UI 높이가 줄지 않게(줄면 선택지 글자가 잘려 사라진다)
        canvasGO.AddComponent<GraphicRaycaster>();

        var bgArtGO = new GameObject("BackgroundArt", typeof(RectTransform));
        bgArtGO.transform.SetParent(canvasGO.transform, false);
        var bgArtRT = bgArtGO.GetComponent<RectTransform>();
        bgArtRT.anchorMin = Vector2.zero;
        bgArtRT.anchorMax = Vector2.one;
        bgArtRT.offsetMin = Vector2.zero;
        bgArtRT.offsetMax = Vector2.zero;
        bgArtImage = bgArtGO.AddComponent<Image>();
        bgArtImage.color = Color.white;
        bgArtImage.raycastTarget = false;
        bgArtImage.sprite = catalog.acts[0].background;
        bgArtImage.preserveAspect = false; // 1672x941(~1.78) ≈ 1280x720 reference res, 왜곡 거의 없음

        var bgGO = new GameObject("Background", typeof(RectTransform));
        bgGO.transform.SetParent(canvasGO.transform, false);
        var bgRT = bgGO.GetComponent<RectTransform>();
        bgRT.anchorMin = Vector2.zero;
        bgRT.anchorMax = Vector2.one;
        bgRT.offsetMin = Vector2.zero;
        bgRT.offsetMax = Vector2.zero;
        bgImage = bgGO.AddComponent<Image>();
        // ACT I 초기값 - story.state.currentPathString이 첫 프레임엔 비어 있어 UpdateActMood()가 못 잡는 경우를 대비한 기본값.
        // 알파를 낮춰서 BackgroundArt 위에 얹는 무드 틴트로만 씀 (배경 그림을 가리지 않게).
        var initialTint = catalog.acts[0].tint;
        initialTint.a = 0.45f;
        bgImage.color = initialTint;
        // Click-anywhere-to-advance catcher: only active while a line is
        // waiting to be revealed, disabled while real choices are shown so
        // it can't be mistaken for one of them.
        advanceCatcher = bgGO.AddComponent<Button>();
        var catcherColors = advanceCatcher.colors;
        catcherColors.normalColor = Color.white;
        catcherColors.highlightedColor = Color.white;
        catcherColors.pressedColor = Color.white;
        advanceCatcher.colors = catcherColors;
        advanceCatcher.onClick.AddListener(() =>
        {
            if (inputLocked) return;
            uiSource.PlayOneShot(uiBlipClip);
            ShowNextLine();
        });

        var scrollGO = new GameObject("StoryScroll", typeof(RectTransform));
        scrollGO.transform.SetParent(canvasGO.transform, false);
        var scrollRT = scrollGO.GetComponent<RectTransform>();
        scrollRT.anchorMin = new Vector2(0.03f, 0.81f);
        scrollRT.anchorMax = new Vector2(0.74f, 0.95f);
        scrollRT.offsetMin = Vector2.zero;
        scrollRT.offsetMax = Vector2.zero;
        var scrollImg = scrollGO.AddComponent<Image>();
        scrollImg.color = new Color(0f, 0f, 0f, 0.5f);
        scrollImg.raycastTarget = false; // let clicks pass through to the Background advance-catcher
        scrollRect = scrollGO.AddComponent<ScrollRect>();
        var mask = scrollGO.AddComponent<Mask>();
        mask.showMaskGraphic = true;

        var viewportGO = new GameObject("Viewport", typeof(RectTransform));
        viewportGO.transform.SetParent(scrollGO.transform, false);
        var viewportRT = viewportGO.GetComponent<RectTransform>();
        viewportRT.anchorMin = Vector2.zero;
        viewportRT.anchorMax = Vector2.one;
        viewportRT.offsetMin = Vector2.zero;
        viewportRT.offsetMax = Vector2.zero;

        var contentGO = new GameObject("Content", typeof(RectTransform));
        contentGO.transform.SetParent(viewportGO.transform, false);
        var contentRT = contentGO.GetComponent<RectTransform>();
        contentRT.anchorMin = new Vector2(0, 1);
        contentRT.anchorMax = new Vector2(1, 1);
        contentRT.pivot = new Vector2(0.5f, 1);
        contentRT.anchoredPosition = Vector2.zero;
        contentRT.sizeDelta = Vector2.zero; // 새 RectTransform 기본 sizeDelta(100,100)이 남으면 폭이 양옆 50px씩 넘쳐 첫 글자가 잘린다
        var fitter = contentGO.AddComponent<ContentSizeFitter>();
        fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

        var textGO = new GameObject("StoryText", typeof(RectTransform));
        textGO.transform.SetParent(contentGO.transform, false);
        var textRT = textGO.GetComponent<RectTransform>();
        textRT.anchorMin = new Vector2(0, 1);
        textRT.anchorMax = new Vector2(1, 1);
        textRT.pivot = new Vector2(0.5f, 1);
        textRT.offsetMin = new Vector2(20, 0);
        textRT.offsetMax = new Vector2(-20, 0);
        storyText = textGO.AddComponent<Text>();
        storyText.font = UiFonts.Serif;
        storyText.fontSize = 26;
        storyText.color = Color.white;
        storyText.alignment = TextAnchor.UpperLeft;
        storyText.horizontalOverflow = HorizontalWrapMode.Wrap;
        storyText.verticalOverflow = VerticalWrapMode.Overflow;
        storyText.supportRichText = true;
        storyText.raycastTarget = false; // let clicks pass through to the Background advance-catcher
        var textFitter = textGO.AddComponent<ContentSizeFitter>();
        textFitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

        scrollRect.content = contentRT;
        scrollRect.viewport = viewportRT;
        scrollRect.horizontal = false;
        scrollRect.vertical = true;

        var promptGO = new GameObject("AdvancePrompt", typeof(RectTransform));
        promptGO.transform.SetParent(canvasGO.transform, false);
        var promptRT = promptGO.GetComponent<RectTransform>();
        promptRT.anchorMin = new Vector2(0.74f, 0.81f);
        promptRT.anchorMax = new Vector2(0.74f, 0.81f);
        promptRT.pivot = new Vector2(1, 0);
        promptRT.anchoredPosition = new Vector2(0, 8);
        promptRT.sizeDelta = new Vector2(140, 30);
        advancePromptText = promptGO.AddComponent<Text>();
        advancePromptText.font = UiFonts.Sans;
        advancePromptText.fontSize = 18;
        advancePromptText.color = new Color(1f, 1f, 1f, 0.55f);
        advancePromptText.alignment = TextAnchor.MiddleRight;
        advancePromptText.text = "▼ 클릭해서 계속";

        var choicesGO = new GameObject("ChoicesContainer", typeof(RectTransform));
        choicesGO.transform.SetParent(canvasGO.transform, false);
        choicesContainer = choicesGO.GetComponent<RectTransform>();
        choicesContainer.anchorMin = new Vector2(0.03f, 0.02f);
        choicesContainer.anchorMax = new Vector2(0.97f, 0.26f);
        choicesContainer.offsetMin = Vector2.zero;
        choicesContainer.offsetMax = Vector2.zero;
        // 결정 카드는 가로로 나란히(발언 팝업/의견 카드와 모양이 겹치지 않는 별도 UI).
        var hlg = choicesGO.AddComponent<HorizontalLayoutGroup>();
        hlg.spacing = 12;
        hlg.childForceExpandHeight = true;
        hlg.childForceExpandWidth = true;
        hlg.childControlHeight = true;
        hlg.childControlWidth = true;

        roster = CourtRoster.Load();
        hud = new GameHud(canvasGO.transform, storyText.font, roster);
        presenter = new HudPhasePresenter(hud, storyText, SetAudioDuck);
        BuildTempScreens(canvasGO.transform);
        hud.Seats.OnBubbleClicked = i =>
        {
            uiSource.PlayOneShot(uiBlipClip);
            hud.Seats.Speak(i, hud.Seats.OpinionOf(i));
        };
    }

    Text advancePromptText;

    // 임시 화면(컷신/서재/지도) 연결과 HUD의 서재 버튼. 그림이 준비되면 TempScreens의 배경만 교체한다.
    void BuildTempScreens(Transform canvasT)
    {
        screens = TempScreens.Create(canvasT);
        screens.RecordProvider = () => hud.RecordsSnapshot();
        screens.BackgroundProvider = () => bgArtImage != null ? bgArtImage.sprite : null;
        screens.OnConvene = () => { /* 회의는 이미 진행 중인 화면으로 돌아간다 */ };

        var go = new GameObject("StudyButton", typeof(RectTransform));
        go.transform.SetParent(canvasT, false);
        var rt = (RectTransform)go.transform;
        rt.anchorMin = rt.anchorMax = new Vector2(0.97f, 0.985f);
        rt.pivot = new Vector2(1f, 1f);
        rt.sizeDelta = new Vector2(120, 36);
        var img = go.AddComponent<Image>();
        img.color = new Color(0.10f, 0.085f, 0.07f, 0.85f);
        var o = go.AddComponent<Outline>();
        o.effectColor = new Color(0.78f, 0.64f, 0.36f, 0.8f); o.effectDistance = new Vector2(1.5f, -1.5f);
        var btn = go.AddComponent<Button>();
        btn.targetGraphic = img;
        btn.onClick.AddListener(() =>
        {
            if (!storyStarted || inputLocked || screens.IsOpen) return;
            uiSource.PlayOneShot(uiBlipClip);
            screens.ShowStudy(null);
        });
        var tGO = new GameObject("Text", typeof(RectTransform));
        tGO.transform.SetParent(go.transform, false);
        var trt = (RectTransform)tGO.transform;
        trt.anchorMin = Vector2.zero; trt.anchorMax = Vector2.one; trt.offsetMin = trt.offsetMax = Vector2.zero;
        var t = tGO.AddComponent<Text>();
        t.font = UiFonts.Sans; t.fontSize = 18; t.alignment = TextAnchor.MiddleCenter; t.color = new Color(0.96f, 0.92f, 0.82f);
        t.text = "서재"; t.raycastTarget = false;
    }

    // 입력 잠금: Destroy()는 프레임 끝에 실행되므로 한 프레임 안에 클릭이 겹치면 이미 선택된 버튼이 다시 눌릴 수 있다.
    // 선택 → 다음 화면이 그려질 때까지 잠근다.
    bool inputLocked;
    bool storyStarted;

    // 왕의 정적 동안 음악/앰비언스를 낮춘다(소리로도 "모두가 멈춘다"를 전달). 기본 볼륨은 ApplyActAudio가 정한다.
    float duckTarget = 1f, duckCurrent = 1f;
    float ambientBaseVolume = 1f;
    const float MusicBaseVolume = 0.7f, DuckedFactor = 0.35f;

    void SetAudioDuck(bool ducked) { duckTarget = ducked ? DuckedFactor : 1f; }

    void OnStoryError(string message, Ink.ErrorType type)
    {
        Debug.LogError($"[Ink {type}] {message}");
        if (type == Ink.ErrorType.Error) ShowFatal($"[Ink 오류]\n{message}");
    }

    void ShowFatal(string message)
    {
        pendingLines.Clear();
        lineIndex = 0;
        foreach (Transform child in choicesContainer) Destroy(child.gameObject);
        storyText.text = $"<color=#FF8A80>{message}</color>";
        SetChoiceMode(false);
        advanceCatcher.gameObject.SetActive(false);
        advancePromptText.gameObject.SetActive(false);
        inputLocked = false;
        CreateButton("-- 처음부터 다시 시작 --", new Color(0.5f, 0.2f, 0.2f, 1f), RestartStory);
        SetChoiceMode(true);
    }

    void AdvanceStory()
    {
        try
        {
            pendingLines.Clear();
            hud.Seats.ClearOpinions();
            while (story.canContinue)
            {
                var line = story.Continue().TrimEnd();
                CaptureEventPath();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    pendingLines.Add(BeatParser.Parse(line, story.currentTags, ref stickyPhase));
                }
            }
            lineIndex = 0;
            royalPauseDone = false;
            stickyPhase = null; // 명시 phase 태그는 한 번의 Continue 묶음(= 다음 선택까지) 안에서만 유지
            UpdateActMood();
            RefreshAdvisors();
            ShowNextLine();
        }
        catch (System.Exception e)
        {
            Debug.LogException(e);
            ShowFatal($"[오류] 이야기를 진행하지 못했습니다.\n{e.Message}");
        }
        finally
        {
            inputLocked = false;
        }
    }

    void BeginStory()
    {
        storyStarted = true;
        AdvanceStory();
    }

    void RestartStory()
    {
        if (pauseCoroutine != null) { StopCoroutine(pauseCoroutine); pauseCoroutine = null; }
        currentPhase = EventPhase.Narration;
        hud.Seats.ClearGuests();
        story.ResetState();
        hud.ClearRecords();
        lastActEventNum = -1;
        lastEventPath = null;
        hud.SetTitle(null);
        AdvanceStory();
    }

    // 키보드 진행: 대사 대기 중엔 Space/Enter로 다음 줄, 선택지 대기 중엔 1~9로 선택.
    void Update()
    {
        duckCurrent = Mathf.MoveTowards(duckCurrent, duckTarget, Time.unscaledDeltaTime / 0.8f);
        musicSource.volume = MusicBaseVolume * duckCurrent;
        ambientSource.volume = ambientBaseVolume * duckCurrent;

        if (!storyStarted || inputLocked || (screens != null && screens.IsOpen)) return;
        var kb = UnityEngine.InputSystem.Keyboard.current;
        if (kb == null) return;

        if (advanceCatcher.gameObject.activeSelf)
        {
            if (kb.spaceKey.wasPressedThisFrame || kb.enterKey.wasPressedThisFrame || kb.numpadEnterKey.wasPressedThisFrame)
            {
                advanceCatcher.onClick.Invoke();
            }
            return;
        }

        var digits = new[] { kb.digit1Key, kb.digit2Key, kb.digit3Key, kb.digit4Key, kb.digit5Key, kb.digit6Key, kb.digit7Key, kb.digit8Key, kb.digit9Key };
        for (int i = 0; i < digits.Length && i < choicesContainer.childCount; i++)
        {
            if (!digits[i].wasPressedThisFrame) continue;
            var btn = choicesContainer.GetChild(i).GetComponent<Button>();
            if (btn != null && btn.gameObject.activeSelf) btn.onClick.Invoke();
            break;
        }
    }


    void RefreshAdvisors()
    {
        for (int i = 0; i < roster.advisors.Count; i++)
        {
            var varName = roster.advisors[i].IntroVar;
            object value = null;
            try { value = story.variablesState[varName]; }
            catch (System.Exception e) { Debug.LogWarning($"[Ink] 변수 '{varName}' 읽기 실패: {e.Message}"); }
            hud.SetIntroduced(i, value is bool b && b);
        }
    }

    string lastEventPath;

    // currentPathString은 선택지 대기 시점에 자주 비어 있다. Continue() 직후의 현재/직전 포인터에서 event_NN을 계속 모아둔다.
    void CaptureEventPath()
    {
        var candidates = new[] { story.state.currentPathString, story.state.previousPointer.isNull ? null : story.state.previousPointer.path.ToString() };
        foreach (var c in candidates)
        {
            if (!string.IsNullOrEmpty(c) && EventPathNumber.IsMatch(c)) lastEventPath = c;
        }
    }

    void UpdateActMood()
    {
        var path = lastEventPath;
        if (string.IsNullOrEmpty(path))
        {
            return;
        }

        var match = EventPathNumber.Match(path);
        if (!match.Success)
        {
            return;
        }

        var eventNum = int.Parse(match.Groups[1].Value);
        if (eventNum == lastActEventNum)
        {
            return;
        }
        lastActEventNum = eventNum;
        var actIndex = catalog.ActIndexOf(eventNum);
        var act = catalog.acts[actIndex];
        hud.SetTitle(null); // 새 사건: 이전 제목을 지운다(제목 태그가 있으면 그 줄에서 다시 표시)

        if (moodCoroutine != null)
        {
            StopCoroutine(moodCoroutine);
        }
        var tint = act.tint;
        tint.a = 0.45f; // BackgroundArt 위 무드 틴트 - art를 가리지 않는 수준
        moodCoroutine = StartCoroutine(LerpBackground(tint));
        bgArtImage.sprite = act.background;
        ApplyActAudio(act);
    }

    System.Collections.IEnumerator LerpBackground(Color target)
    {
        var start = bgImage.color;
        float t = 0f;
        while (t < 1f)
        {
            t += Time.deltaTime / 0.6f;
            bgImage.color = Color.Lerp(start, target, t);
            yield return null;
        }
        bgImage.color = target;
    }

    void ShowNextLine()
    {
        if (lineIndex < pendingLines.Count)
        {
            var beat = pendingLines[lineIndex];
            if (beat.tags.TryGetValue("title", out var eventTitle)) { hud.SetTitle(eventTitle); hud.Seats.ClearGuests(); } // 새 사건: 이전 방문자는 물러난다
            if (beat.tags.TryGetValue("met", out var metId)) screens.MarkMet(metId);
            if (beat.tags.TryGetValue("scene", out var sceneKind) && sceneKind == "cutscene")
            {
                // 컷신: 이 줄과 이어지는 서술 줄(최대 3줄)을 캡션으로, 전체 화면 스틸 + 느린 카메라 이동. 끝나면 다음 줄부터 이어간다.
                var caption = new System.Text.StringBuilder(beat.text);
                int used = 1;
                while (lineIndex + used < pendingLines.Count && used < 3)
                {
                    var nb = pendingLines[lineIndex + used];
                    if (nb.speaker != null || nb.tags.ContainsKey("scene") || nb.tags.ContainsKey("title")) break;
                    caption.Append("\n").Append(nb.text);
                    used++;
                }
                beat.tags.TryGetValue("title", out var cutTitle);
                lineIndex += used;
                SetChoiceMode(false);
                advanceCatcher.gameObject.SetActive(false);
                advancePromptText.gameObject.SetActive(false);
                inputLocked = true;
                screens.ShowCutscene(bgArtImage != null ? bgArtImage.sprite : null, null, cutTitle, caption.ToString(), () => { inputLocked = false; ShowNextLine(); });
                return;
            }
            if (beat.tags.TryGetValue("enter", out var enterId)) hud.Seats.SetGuestPresent(enterId, true);
            if (beat.tags.TryGetValue("exit", out var exitId)) hud.Seats.SetGuestPresent(exitId, false);
            var seat = hud.Seats.IndexOf(beat.speaker);
            var known = seat >= 0 && hud.Seats.IsIntroduced(beat.speaker);
            var guestSpeaker = known && hud.Seats.IsGuest(beat.speaker);
            if (known && !guestSpeaker && beat.phase == EventPhase.AdvisorSummary)
            {
                // 대신들의 의견: 연속된 의견 줄을 한 번에 좌석의 의견 카드로 올린다(한 줄씩 읽히지 않는다).
                EnterPhase(EventPhase.AdvisorSummary, beat);
                var opinions = new List<KeyValuePair<int, string>>();
                while (lineIndex < pendingLines.Count)
                {
                    var b = pendingLines[lineIndex];
                    var si = hud.Seats.IndexOf(b.speaker);
                    if (b.phase != EventPhase.AdvisorSummary || si < 0 || !hud.Seats.IsIntroduced(b.speaker)) break;
                    opinions.Add(new KeyValuePair<int, string>(si, SpeakerLine.Match(b.text).Groups[2].Value));
                    lineIndex++;
                }
                hud.Seats.HidePopup();
                storyText.color = Color.white;
                hud.Seats.ShowOpinions(opinions);
                presenter.OnBeat(null);
            }
            else if (known && (guestSpeaker || beat.phase == EventPhase.CourtExchange || beat.phase == EventPhase.Aftermath))
            {
                // 대신 간 논쟁 / 선택 후 각자의 해석: 발언 팝업을 크게 띄운다(청자와 발화 행동은 태그에서).
                EnterPhase(beat.phase, beat);
                beat.tags.TryGetValue("to", out var toId);
                beat.tags.TryGetValue("stance", out var stance);
                hud.Seats.Speak(seat, SpeakerLine.Match(beat.text).Groups[2].Value, hud.Seats.IndexOfId(toId), stance);
                storyText.color = new Color(1f, 1f, 1f, 0.45f); // 상황 서술은 배경으로 물러나고 발언 팝업이 앞에 선다
                lineIndex++;
            }
            else
            {
                hud.Seats.HidePopup(); // 서술로 돌아오면 이전 발언 팝업을 닫는다
                storyText.color = Color.white;
                EnterPhase(beat.phase, beat);
                storyText.text = Colorize(beat.text);
                presenter.OnBeat(beat);
                lineIndex++;
            }
            SetChoiceMode(false);
        }
        else
        {
            ShowChoicesOrEnd();
        }
    }

    void SetChoiceMode(bool showingChoices)
    {
        advanceCatcher.gameObject.SetActive(!showingChoices);
        advancePromptText.gameObject.SetActive(!showingChoices);

        foreach (Transform child in choicesContainer)
        {
            child.gameObject.SetActive(showingChoices);
        }
    }

    string Colorize(string line)
    {
        var match = SpeakerLine.Match(line);
        if (!match.Success)
        {
            return line;
        }

        var speaker = match.Groups[1].Value;
        var rest = match.Groups[2].Value;
        var profile = roster != null ? roster.FindBySpeaker(speaker) : null;
        var color = profile != null ? profile.AccentHex : (SpeakerColors.TryGetValue(speaker, out var c) ? c : DefaultSpeakerColor);
        return $"<color={color}>{speaker}</color>: {rest}";
    }

    void EnterPhase(EventPhase phase, StoryBeat beat)
    {
        if (phase == currentPhase && lineIndex > 0) return;
        presenter.OnPhaseExit(currentPhase);
        currentPhase = phase;
        presenter.OnPhaseEnter(phase, beat);
    }

    // 왕의 정적: 선택지가 나오기 직전, 모든 대신이 왕을 바라보는 연출 비트. 대사 텍스트는 이 정적을 예고하지 않는다(§28.1).
    // 선택지 없이 끝나는 화면(엔딩)과 대신이 아무도 소개되지 않은 초반에는 건너뛴다.
    System.Collections.IEnumerator RoyalPauseThenChoices(float seconds)
    {
        inputLocked = true;
        EnterPhase(EventPhase.RoyalPause, null);
        yield return new WaitForSeconds(seconds);
        royalPauseDone = true;
        pauseCoroutine = null;
        inputLocked = false;
        ShowChoicesOrEnd();
    }

    void ShowChoicesOrEnd()
    {
        if (pauseCoroutine != null) return; // 왕의 정적 진행 중
        if (!royalPauseDone && story.currentChoices.Count > 0 && hud.IntroducedCount > 0)
        {
            float seconds = DefaultRoyalPauseSeconds;
            if (pendingLines.Count > 0 && pendingLines[pendingLines.Count - 1].TryGetFloat("pause", out var tagged)) seconds = tagged;
            SetChoiceMode(false);
            advanceCatcher.gameObject.SetActive(false);
            advancePromptText.gameObject.SetActive(false);
            pauseCoroutine = StartCoroutine(RoyalPauseThenChoices(seconds));
            return;
        }

        EnterPhase(EventPhase.Choice, null);
        foreach (Transform child in choicesContainer)
        {
            Destroy(child.gameObject);
        }

        if (story.currentChoices.Count > 0)
        {
            foreach (var choice in story.currentChoices)
            {
                CreateChoiceCard(choice.index + 1, choice.text, () =>
                {
                    if (inputLocked) return;
                    inputLocked = true;
                    hud.AddRecord(choice.text); // 사건 번호는 표시하지 않는다(진행 길이 추정 방지)
                    try { story.ChooseChoiceIndex(choice.index); }
                    catch (System.Exception e) { Debug.LogException(e); ShowFatal($"[오류] 선택을 적용하지 못했습니다.\n{e.Message}"); return; }
                    AdvanceStory();
                });
            }
        }
        else
        {
            CreateButton("-- 이야기 끝 (다시 시작) --", new Color(0.5f, 0.2f, 0.2f, 1f), () =>
            {
                if (inputLocked) return;
                inputLocked = true;
                RestartStory();
            });
        }

        SetChoiceMode(true);
    }

    // 왕의 결정 카드: 발언 팝업/의견 카드와 다른 모양(어두운 판 + 금색 테두리 + 번호). 버튼 문구는 추상적으로 둔다(§7.2).
    void CreateChoiceCard(int number, string label, UnityEngine.Events.UnityAction onClick)
    {
        var go = new GameObject("Choice_" + number, typeof(RectTransform));
        go.transform.SetParent(choicesContainer, false);
        var le = go.AddComponent<LayoutElement>();
        le.minHeight = 64;
        le.preferredHeight = 84;
        var img = go.AddComponent<Image>();
        img.color = new Color(0.10f, 0.085f, 0.07f, 0.96f);
        var outline = go.AddComponent<Outline>();
        outline.effectColor = new Color(0.72f, 0.58f, 0.32f, 0.9f);
        outline.effectDistance = new Vector2(2, -2);
        var btn = go.AddComponent<Button>();
        btn.targetGraphic = img;
        var colors = btn.colors;
        colors.normalColor = Color.white;
        colors.highlightedColor = new Color(1.35f, 1.25f, 1.05f, 1f);
        colors.pressedColor = new Color(0.8f, 0.75f, 0.65f, 1f);
        btn.colors = colors;

        var txtGO = new GameObject("Text", typeof(RectTransform));
        txtGO.transform.SetParent(go.transform, false);
        var rt = txtGO.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
        rt.offsetMin = new Vector2(14, 6); rt.offsetMax = new Vector2(-14, -6);
        var txt = txtGO.AddComponent<Text>();
        txt.font = UiFonts.Serif;
        txt.fontSize = 22;
        txt.color = new Color(0.96f, 0.92f, 0.82f);
        txt.alignment = TextAnchor.MiddleCenter;
        txt.horizontalOverflow = HorizontalWrapMode.Wrap;
        txt.verticalOverflow = VerticalWrapMode.Overflow;
        txt.supportRichText = true;
        txt.raycastTarget = false;
        txt.text = $"<color=#C9A25A>{number}.</color> {label}";

        btn.onClick.AddListener(() =>
        {
            uiSource.PlayOneShot(uiChoiceClip);
            onClick();
        });
    }

    void CreateButton(string label, Color color, UnityEngine.Events.UnityAction onClick)
    {
        var btnGO = new GameObject("Button", typeof(RectTransform));
        btnGO.transform.SetParent(choicesContainer, false);
        var le = btnGO.AddComponent<LayoutElement>();
        le.preferredHeight = 44;
        le.minHeight = 38;
        var img = btnGO.AddComponent<Image>();
        img.color = color;
        var btn = btnGO.AddComponent<Button>();
        btn.targetGraphic = img; // wire it explicitly - AddComponent doesn't auto-assign this, so hover/press feedback silently does nothing without it

        var txtGO = new GameObject("Text", typeof(RectTransform));
        txtGO.transform.SetParent(btnGO.transform, false);
        var txtRT = txtGO.GetComponent<RectTransform>();
        txtRT.anchorMin = Vector2.zero;
        txtRT.anchorMax = Vector2.one;
        txtRT.offsetMin = new Vector2(12, 4);
        txtRT.offsetMax = new Vector2(-12, -4);
        var txt = txtGO.AddComponent<Text>();
        txt.font = UiFonts.Sans;
        txt.fontSize = 22;
        txt.color = Color.white;
        txt.alignment = TextAnchor.MiddleLeft;
        txt.horizontalOverflow = HorizontalWrapMode.Wrap;
        txt.verticalOverflow = VerticalWrapMode.Overflow; // 기본값 Truncate는 줄이 높이보다 크면 글자를 통째로 숨긴다
        txt.text = label;

        btn.onClick.AddListener(() =>
        {
            uiSource.PlayOneShot(uiChoiceClip);
            onClick();
        });
    }
}
