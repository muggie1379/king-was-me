using System.Reflection;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

// Dev-only (Editor): Play 모드 UI를 PNG로 캡처하고 자동 진행해서 눈으로 확인하기 위한 도구.
// Game 뷰가 안 그려지는 상황(MCP 자동화)에서도 캔버스를 임시 카메라로 직접 렌더링해 저장한다.
public static class DevCaptureTools
{
    const string ShotDir = "C:/Users/ldw12/AppData/Local/Temp/claude/E--DotSoccer/94759ae9-6b2b-4b55-b04c-2a7d7043e5e5/scratchpad/shots";

    static StoryController Sc => Object.FindFirstObjectByType<StoryController>();

    [MenuItem("KingWasMe/Dev/Capture Canvas PNG")]
    public static void Shot2()
    {
        System.IO.Directory.CreateDirectory(ShotDir);
        var canvas = GameObject.Find("UICanvas").GetComponent<Canvas>();
        var rt = new RenderTexture(capW, capH, 24);
        var camGO = new GameObject("TmpShotCam");
        var cam = camGO.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        cam.orthographic = true;
        cam.nearClipPlane = 0.1f;
        cam.farClipPlane = 10f;
        cam.targetTexture = rt;

        var prevMode = canvas.renderMode;
        canvas.renderMode = RenderMode.ScreenSpaceCamera;
        canvas.worldCamera = cam;
        canvas.planeDistance = 1f;
        Canvas.ForceUpdateCanvases();
        cam.Render();

        var prev = RenderTexture.active;
        RenderTexture.active = rt;
        var tex = new Texture2D(capW, capH, TextureFormat.RGB24, false);
        tex.ReadPixels(new Rect(0, 0, capW, capH), 0, 0);
        tex.Apply();
        RenderTexture.active = prev;

        var path = $"{ShotDir}/canvas_{System.DateTime.Now:HHmmss_fff}.png";
        System.IO.File.WriteAllBytes(path, tex.EncodeToPNG());

        canvas.renderMode = prevMode;
        Object.DestroyImmediate(camGO);
        rt.Release();
        Object.DestroyImmediate(tex);
        Debug.Log("TESTSHOT2 " + path);
    }

    static int capW = 1280, capH = 720;

    [MenuItem("KingWasMe/Dev/Capture Size 16x9")]
    public static void SizeNormal() { capW = 1280; capH = 720; }

    [MenuItem("KingWasMe/Dev/Capture Size Wide (945x435)")]
    public static void SizeWide() { capW = 945; capH = 435; }

    [MenuItem("KingWasMe/Dev/AutoPlay200")]
    public static void AutoPlay200() { autoSteps = 200; EditorApplication.update -= AutoStep; EditorApplication.update += AutoStep; }

    static int autoSteps;

    [MenuItem("KingWasMe/Dev/AutoPlay40")]
    public static void AutoPlay40()
    {
        autoSteps = 40;
        EditorApplication.update -= AutoStep;
        EditorApplication.update += AutoStep;
    }

    static void AutoStep()
    {
        if (autoSteps-- <= 0 || !Application.isPlaying) { EditorApplication.update -= AutoStep; return; }
        var container = GameObject.Find("ChoicesContainer");
        Button target = null;
        foreach (Transform child in container.transform)
        {
            var b = child.GetComponent<Button>();
            if (b != null && child.gameObject.activeInHierarchy && b.enabled) { target = b; break; }
        }
        if (target != null) target.onClick.Invoke();
        else typeof(StoryController).GetMethod("ShowNextLine", BindingFlags.NonPublic | BindingFlags.Instance).Invoke(Sc, null);
    }

    [MenuItem("KingWasMe/Dev/Jump to event_23_default")]
    public static void JumpE23()
    {
        var sc = Sc;
        var story = (Ink.Runtime.Story)typeof(StoryController).GetField("story", BindingFlags.NonPublic | BindingFlags.Instance).GetValue(sc);
        story.ChoosePathString("event_23_default");
        typeof(StoryController).GetMethod("AdvanceStory", BindingFlags.NonPublic | BindingFlags.Instance).Invoke(sc, null);
    }

    // 에디터가 백그라운드일 때(MCP 검증 중) 플레이 루프가 멈춰 Update/코루틴/애니메이션이 진행되지 않는다. 이 메뉴는 매 에디터 틱마다 루프를 강제로 한 번 더 돌린다.
    static bool keepTicking;
    [MenuItem("KingWasMe/Dev/Keep Player Loop Ticking (toggle)")]
    public static void ToggleKeepTicking()
    {
        keepTicking = !keepTicking;
        Application.runInBackground = keepTicking; // 에디터가 포커스를 잃어도 플레이 루프가 멈추지 않게
        EditorApplication.update -= TickPlayerLoop;
        if (keepTicking) EditorApplication.update += TickPlayerLoop;
        Debug.Log("KEEPTICKING " + keepTicking);
    }

    static void TickPlayerLoop()
    {
        if (!Application.isPlaying) return;
        EditorApplication.QueuePlayerLoopUpdate();
        UnityEditorInternal.InternalEditorUtility.RepaintAllViews();
    }

    [MenuItem("KingWasMe/Dev/Toggle Royal Gaze (hold)")]
    public static void ToggleGaze()
    {
        var v = Object.FindFirstObjectByType<SeatView>();
        if (v != null) v.SetGaze(!v.GazeActive);
    }

    [MenuItem("KingWasMe/Dev/Preview Exchange Popup (seran->valen counter)")]
    public static void PreviewExchange()
    {
        var v = Object.FindFirstObjectByType<SeatView>();
        if (v == null) return;
        int from = v.IndexOfId("seran"), to = v.IndexOfId("valen");
        v.Speak(from, "모든 문제를 병력 수로 판단하실 겁니까?", to, "question");
    }

    [MenuItem("KingWasMe/Dev/Preview Reply Popup (valen->seran counter)")]
    public static void PreviewReply()
    {
        var v = Object.FindFirstObjectByType<SeatView>();
        if (v == null) return;
        v.Speak(v.IndexOfId("valen"), "전쟁은 그렇게 시작됩니다.", v.IndexOfId("seran"), "counter");
    }

    static TempScreens Screens() { return Object.FindFirstObjectByType<TempScreens>(); }

    [MenuItem("KingWasMe/Dev/Preview Screen: Cutscene")]
    public static void PreviewCutscene()
    {
        var t = Screens(); if (t == null) return;
        var bg = GameObject.Find("BackgroundArt");
        var sprite = bg != null ? bg.GetComponent<UnityEngine.UI.Image>().sprite : null;
        t.ShowCutscene(sprite, null, "무너진 교량", "밤새 내린 폭우로 왕국의 주요 교역로에 있는 교량이 일부 붕괴되었습니다." + "\n" + "상인들의 행렬이 발이 묶인 가운데, 관군이 현장을 살피고 있습니다.", null);
    }

    [MenuItem("KingWasMe/Dev/Preview Screen: Study")]
    public static void PreviewStudy()
    {
        var t = Screens(); if (t == null) return;
        t.ShowStudy(new System.Collections.Generic.List<string> { "동부 왕국의 첫 사절", "북쪽 국경의 움직임" });
    }

    [MenuItem("KingWasMe/Dev/Preview Screen: Map (all met)")]
    public static void PreviewMap()
    {
        var t = Screens(); if (t == null) return;
        t.MarkAllMet();
        t.ShowMap();
    }

    [MenuItem("KingWasMe/Dev/Log SeatView State")]
    public static void LogSeatView()
    {
        var v = Object.FindFirstObjectByType<SeatView>();
        Debug.Log("SEATSTATE paused=" + EditorApplication.isPaused + " runInBg=" + Application.runInBackground + " timeScale=" + Time.timeScale + " udt=" + Time.unscaledDeltaTime + " focused=" + Application.isFocused + " " + (v == null ? "none" : v.DebugState()));
    }

    [MenuItem("KingWasMe/Dev/Jump to event_04 (seran+valen)")]
    public static void JumpE04()
    {
        var sc = Sc;
        var story = (Ink.Runtime.Story)typeof(StoryController).GetField("story", BindingFlags.NonPublic | BindingFlags.Instance).GetValue(sc);
        story.variablesState["seran_introduced"] = true;
        story.variablesState["valen_introduced"] = true;
        var title = GameObject.Find("TitlePanel");
        if (title != null) title.SetActive(false);
        typeof(StoryController).GetField("storyStarted", BindingFlags.NonPublic | BindingFlags.Instance).SetValue(sc, true);
        story.ChoosePathString("event_04");
        typeof(StoryController).GetMethod("AdvanceStory", BindingFlags.NonPublic | BindingFlags.Instance).Invoke(sc, null);
    }

    [MenuItem("KingWasMe/Dev/StartGame")]
    public static void StartGame()
    {
        var title = GameObject.Find("TitlePanel");
        if (title != null) title.SetActive(false);
        typeof(StoryController).GetMethod("BeginStory", BindingFlags.NonPublic | BindingFlags.Instance).Invoke(Sc, null);
    }

    [MenuItem("KingWasMe/Dev/NextLine")]
    public static void NextLine()
    {
        typeof(StoryController).GetMethod("ShowNextLine", BindingFlags.NonPublic | BindingFlags.Instance).Invoke(Sc, null);
    }

    [MenuItem("KingWasMe/Dev/ClickFirstChoice")]
    public static void ClickFirstChoice()
    {
        var container = GameObject.Find("ChoicesContainer");
        foreach (Transform child in container.transform)
        {
            var b = child.GetComponent<Button>();
            if (b != null && child.gameObject.activeSelf && b.enabled)
            {
                b.onClick.Invoke();
                return;
            }
        }
    }
}
