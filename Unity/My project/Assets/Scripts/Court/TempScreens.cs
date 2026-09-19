using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

// 임시 UI 화면 3종(컷신 / 왕의 서재 / 지도). Codex 시안(2026-09-19 mockups/Generated)의 구조를 따르되 그림 에셋 없이 코드 UI로 만든 것이다.
// 그림/프레임이 준비되면 이 클래스의 배경·패널만 교체한다(동작/데이터 흐름은 그대로).
// 원칙: 수치(국고/민심 등), 친밀도·관계 막대, 2인칭("당신"), 진행 카운터(N/29)는 넣지 않는다(§12.1, §20, 사용자 지시).
public class TempScreens : MonoBehaviour
{
    static readonly Color Ink = new Color(0.06f, 0.055f, 0.05f, 1f); // 불투명: 테두리(Outline) 효과가 반투명 채움 아래로 비쳐 갈색이 되는 것을 막는다
    static readonly Color Gold = new Color(0.78f, 0.64f, 0.36f, 1f);
    static readonly Color Paper = new Color(0.94f, 0.9f, 0.8f, 1f);

    Transform canvas;
    RectTransform cutRoot, studyRoot, mapRoot, noteRoot;
    CanvasGroup cutGroup;
    RectTransform cutBg;
    float cutT;
    bool cutFadingOut;
    Action cutDone;

    readonly Dictionary<string, bool> met = new Dictionary<string, bool>();
    public Func<List<string>> RecordProvider;     // 왕실 기록(선택 이력)
    public Func<Sprite> BackgroundProvider;       // 현재 배경(임시 스틸로 사용)
    public Action OnConvene;                      // 서재에서 "회의 소집하기"

    public bool IsOpen => (cutRoot != null && cutRoot.gameObject.activeSelf) || (studyRoot != null && studyRoot.gameObject.activeSelf) || (mapRoot != null && mapRoot.gameObject.activeSelf);

    public static TempScreens Create(Transform canvas)
    {
        var go = new GameObject("TempScreens", typeof(RectTransform));
        go.transform.SetParent(canvas, false);
        var t = go.AddComponent<TempScreens>();
        t.canvas = go.transform;
        var rt = (RectTransform)go.transform;
        rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one; rt.offsetMin = rt.offsetMax = Vector2.zero;
        return t;
    }

    // 접촉한 이웃 나라(지도에 나타난다). Ink `# met: east|north|south|west`.
    public void MarkMet(string kingdomId) { if (!string.IsNullOrEmpty(kingdomId)) met[kingdomId] = true; }
    public void MarkAllMet() { foreach (var k in new[] { "north", "east", "south", "west" }) met[k] = true; }
    public void ResetMet() { met.Clear(); }

    // ------------------------------------------------------------------ cutscene
    public void ShowCutscene(Sprite art, string kicker, string title, string caption, Action onContinue)
    {
        canvas.SetAsLastSibling(); // HUD 버튼(서재) 위로
        if (cutRoot != null) Destroy(cutRoot.gameObject);
        cutRoot = Node("Cutscene", canvas);
        Stretch(cutRoot);
        cutGroup = cutRoot.gameObject.AddComponent<CanvasGroup>();
        cutGroup.alpha = 0f;
        cutT = 0f; cutFadingOut = false; cutDone = onContinue;

        var bg = Node("Art", cutRoot);
        Stretch(bg);
        cutBg = bg;
        var img = bg.gameObject.AddComponent<Image>();
        img.sprite = art;
        img.color = art != null ? Color.white : new Color(0.12f, 0.1f, 0.09f);
        img.raycastTarget = true; // 뒤 UI로 클릭이 새지 않게

        Shade(cutRoot, new Vector2(0f, 0.55f), new Vector2(1f, 1f), true);   // 상단 그림자(제목 가독)
        Shade(cutRoot, new Vector2(0f, 0f), new Vector2(1f, 0.28f), false);  // 하단 그림자

        var bar = Node("Bar", cutRoot);
        bar.anchorMin = bar.anchorMax = new Vector2(0.03f, 0.9f); bar.pivot = new Vector2(0f, 1f);
        bar.sizeDelta = new Vector2(4, 96);
        bar.gameObject.AddComponent<Image>().color = Gold;

        var k = Label(cutRoot, kicker ?? "", 20, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.7f), UiFonts.Sans);
        Place(k.rectTransform, new Vector2(0.037f, 0.9f), new Vector2(0.6f, 0.9f), new Vector2(0f, 1f), new Vector2(0, 28));
        var t = Label(cutRoot, title ?? "", 46, TextAnchor.UpperLeft, Color.white, UiFonts.Serif);
        Place(t.rectTransform, new Vector2(0.037f, 0.87f), new Vector2(0.7f, 0.87f), new Vector2(0f, 1f), new Vector2(0, 66));
        var c = Label(cutRoot, caption ?? "", 24, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.88f), UiFonts.Serif);
        c.lineSpacing = 1.25f;
        Place(c.rectTransform, new Vector2(0.037f, 0.79f), new Vector2(0.62f, 0.79f), new Vector2(0f, 1f), new Vector2(0, 110));

        var btn = Button(cutRoot, "계속하기  →", () => { cutFadingOut = true; });
        Place(btn, new Vector2(0.97f, 0.05f), new Vector2(0.97f, 0.05f), new Vector2(1f, 0f), new Vector2(240, 60));

        var tag = Label(cutRoot, "임시 컷신 화면 (일러스트 대기)", 15, TextAnchor.LowerLeft, new Color(1f, 1f, 1f, 0.35f), UiFonts.Sans);
        Place(tag.rectTransform, new Vector2(0.03f, 0.03f), new Vector2(0.5f, 0.03f), new Vector2(0f, 0f), new Vector2(0, 26));
        cutRoot.gameObject.SetActive(true);
    }

    // ------------------------------------------------------------------ study
    public void ShowStudy(List<string> agenda)
    {
        canvas.SetAsLastSibling(); // HUD 버튼(서재) 위로
        if (studyRoot != null) Destroy(studyRoot.gameObject);
        studyRoot = Node("Study", canvas);
        Stretch(studyRoot);
        var bgSprite = BackgroundProvider != null ? BackgroundProvider() : null;
        var back = studyRoot.gameObject.AddComponent<Image>();
        back.sprite = bgSprite;
        back.color = bgSprite != null ? new Color(0.35f, 0.3f, 0.27f, 1f) : new Color(0.08f, 0.065f, 0.055f);
        Shade(studyRoot, new Vector2(0f, 0f), new Vector2(1f, 1f), false, 0.35f);

        var title = Label(studyRoot, "왕의 서재", 42, TextAnchor.UpperLeft, Color.white, UiFonts.Serif);
        Place(title.rectTransform, new Vector2(0.03f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(0f, 1f), new Vector2(0, 60));

        // 좌: 현안
        var left = Panel(studyRoot, "Agenda", new Vector2(0.02f, 0.5f), new Vector2(0.27f, 0.86f));
        Label(left, "오늘의 현안", 24, TextAnchor.UpperLeft, Color.white, UiFonts.Serif, new Vector2(18, 14));
        var list = Label(left, AgendaText(agenda), 18, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.8f), UiFonts.Sans, new Vector2(18, 58));
        list.lineSpacing = 1.2f;

        // 우: 서한/알현(임시 자리)
        var right = Panel(studyRoot, "Letters", new Vector2(0.73f, 0.5f), new Vector2(0.98f, 0.86f));
        Label(right, "서한과 알현", 24, TextAnchor.UpperLeft, Color.white, UiFonts.Serif, new Vector2(18, 14));
        Label(right, "처리할 서한이나\n예정된 알현이 없다.\n(임시 화면)", 18, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.6f), UiFonts.Sans, new Vector2(18, 58));

        // 책상 위 물건들(핫스팟)
        var spots = new[] { ("국정 현황", "왕국의 상황을 살핀다.", "note:현재 상황 요약은 준비 중입니다(임시)."), ("지역 지도", "각지의 동향을 확인한다.", "map"), ("외교 서한", "이웃 나라와 오간 서한.", "note:주고받은 서한 목록은 준비 중입니다(임시)."), ("왕의 기록", "지난 결정을 돌아본다.", "records") };
        for (int i = 0; i < spots.Length; i++)
        {
            float x0 = 0.06f + i * 0.225f;
            var (name, desc, action) = spots[i];
            var b = HotSpot(studyRoot, name, desc, () => Spot(action));
            Place(b, new Vector2(x0, 0.28f), new Vector2(x0 + 0.2f, 0.28f), new Vector2(0f, 0f), new Vector2(0, 88));
        }

        // 회의 소집
        var convene = Button(studyRoot, "회의 소집하기  ▶", () => { Close(studyRoot); OnConvene?.Invoke(); });
        Place(convene, new Vector2(0.5f, 0.07f), new Vector2(0.5f, 0.07f), new Vector2(0.5f, 0f), new Vector2(380, 74));
        var back2 = Button(studyRoot, "닫기 (Esc)", () => Close(studyRoot));
        Place(back2, new Vector2(0.97f, 0.95f), new Vector2(0.97f, 0.95f), new Vector2(1f, 1f), new Vector2(160, 44));
        var tag = Label(studyRoot, "임시 서재 화면 (일러스트 대기)", 15, TextAnchor.LowerLeft, new Color(1f, 1f, 1f, 0.35f), UiFonts.Sans);
        Place(tag.rectTransform, new Vector2(0.03f, 0.02f), new Vector2(0.4f, 0.02f), new Vector2(0f, 0f), new Vector2(0, 24));
        studyRoot.gameObject.SetActive(true);
    }

    static string AgendaText(List<string> agenda)
    {
        if (agenda == null || agenda.Count == 0) return "표시할 현안이 없다.";
        var sb = new System.Text.StringBuilder();
        foreach (var a in agenda) sb.AppendLine("· " + a);
        return sb.ToString();
    }

    void Spot(string action)
    {
        if (action == "map") ShowMap();
        else if (action == "records") ShowNote("왕의 기록", RecordText());
        else if (action.StartsWith("note:")) ShowNote("안내", action.Substring(5));
    }

    string RecordText()
    {
        var recs = RecordProvider != null ? RecordProvider() : null;
        if (recs == null || recs.Count == 0) return "아직 기록이 없다.";
        var sb = new System.Text.StringBuilder();
        for (int i = recs.Count - 1; i >= 0; i--) sb.AppendLine("· " + recs[i]);
        return sb.ToString();
    }

    // ------------------------------------------------------------------ map
    static readonly (string id, string name, Vector2 pos, string blurb)[] Kingdoms =
    {
        ("north", "북부 변경국", new Vector2(0.50f, 0.80f), "북쪽 국경 너머의 이웃."),
        ("east",  "동부 왕국",   new Vector2(0.80f, 0.52f), "동쪽의 이웃 왕국."),
        ("south", "남부 상업국", new Vector2(0.50f, 0.22f), "남쪽의 상업 도시들."),
        ("west",  "서부",        new Vector2(0.20f, 0.52f), "서쪽 너머의 이웃."),
    };

    public void ShowMap()
    {
        canvas.SetAsLastSibling(); // HUD 버튼(서재) 위로
        if (mapRoot != null) Destroy(mapRoot.gameObject);
        mapRoot = Node("Map", canvas);
        Stretch(mapRoot);
        mapRoot.gameObject.AddComponent<Image>().color = new Color(0.26f, 0.2f, 0.13f, 1f);

        var sheet = Node("Sheet", mapRoot);
        sheet.anchorMin = new Vector2(0.25f, 0.13f); sheet.anchorMax = new Vector2(0.75f, 0.93f);
        sheet.offsetMin = sheet.offsetMax = Vector2.zero;
        sheet.gameObject.AddComponent<Image>().color = new Color(0.72f, 0.62f, 0.44f, 1f);
        var frame = sheet.gameObject.AddComponent<Outline>();
        frame.effectColor = new Color(0.3f, 0.22f, 0.12f, 1f); frame.effectDistance = new Vector2(3, -3);

        var title = Label(mapRoot, "지역 지도", 40, TextAnchor.UpperLeft, Color.white, UiFonts.Serif);
        Place(title.rectTransform, new Vector2(0.03f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(0f, 1f), new Vector2(0, 56));

        // 우리 왕국 + 접촉한 이웃(길로 연결). 접촉 전 이웃은 지도에 나타나지 않는다(미확인 자리표시 없음).
        var centerPos = new Vector2(0.5f, 0.5f);
        foreach (var k in Kingdoms)
        {
            if (!met.ContainsKey(k.id)) continue;
            Route(sheet, centerPos, k.pos);
        }
        Marker(sheet, "우리 왕국", centerPos, new Color(0.35f, 0.16f, 0.12f), 64, () => Detail("우리 왕국", "지금 다스리는 곳."));
        foreach (var k in Kingdoms)
        {
            if (!met.ContainsKey(k.id)) continue;
            var kk = k;
            Marker(sheet, kk.name, kk.pos, new Color(0.16f, 0.24f, 0.32f), 48, () => Detail(kk.name, kk.blurb));
        }

        // 좌: 지난 일
        var left = Panel(mapRoot, "Recent", new Vector2(0.02f, 0.13f), new Vector2(0.24f, 0.88f));
        Label(left, "지난 일", 24, TextAnchor.UpperLeft, Color.white, UiFonts.Serif, new Vector2(16, 14));
        var recent = Label(left, RecordText(), 17, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.8f), UiFonts.Sans, new Vector2(16, 56));
        recent.lineSpacing = 1.15f;
        recent.verticalOverflow = VerticalWrapMode.Truncate;

        // 우: 선택한 곳
        var detail = Panel(mapRoot, "Detail", new Vector2(0.76f, 0.13f), new Vector2(0.98f, 0.88f));
        detailTitle = Label(detail, "지도에서 한 곳을 고르면\n알려진 이야기가 보인다.", 20, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.75f), UiFonts.Serif, new Vector2(16, 14));
        detailBody = Label(detail, "", 18, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.8f), UiFonts.Sans, new Vector2(16, 120));

        var back = Button(mapRoot, "◀  서재로 돌아가기", () => Close(mapRoot));
        Place(back, new Vector2(0.02f, 0.03f), new Vector2(0.02f, 0.03f), new Vector2(0f, 0f), new Vector2(300, 56));
        var tag = Label(mapRoot, "임시 지도 화면 (일러스트 대기)", 15, TextAnchor.LowerRight, new Color(1f, 1f, 1f, 0.35f), UiFonts.Sans);
        Place(tag.rectTransform, new Vector2(0.98f, 0.03f), new Vector2(0.98f, 0.03f), new Vector2(1f, 0f), new Vector2(360, 24));
        mapRoot.gameObject.SetActive(true);
    }

    Text detailTitle, detailBody;
    void Detail(string name, string blurb)
    {
        detailTitle.text = name;
        detailTitle.fontSize = 28;
        detailTitle.color = Color.white;
        detailBody.text = blurb + "\n\n(알려진 이야기는 접촉이 쌓이면 여기에 남는다. 임시)";
    }

    void Marker(RectTransform parent, string label, Vector2 pos, Color color, float size, Action onClick)
    {
        var m = Node("Marker_" + label, parent);
        m.anchorMin = m.anchorMax = pos; m.pivot = new Vector2(0.5f, 0.5f);
        m.sizeDelta = new Vector2(size, size);
        var img = m.gameObject.AddComponent<Image>();
        img.color = color;
        var o = m.gameObject.AddComponent<Outline>();
        o.effectColor = new Color(0.95f, 0.85f, 0.6f, 0.9f); o.effectDistance = new Vector2(2, -2);
        var b = m.gameObject.AddComponent<UnityEngine.UI.Button>();
        b.targetGraphic = img;
        b.onClick.AddListener(() => onClick());
        var t = Label(m, label, 20, TextAnchor.MiddleCenter, new Color(0.15f, 0.1f, 0.06f), UiFonts.Serif);
        Place(t.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 1f), new Vector2(180, 28));
        t.rectTransform.anchoredPosition = new Vector2(0, -4);
    }

    void Route(RectTransform parent, Vector2 a, Vector2 b)
    {
        // 앵커 좌표 두 점을 잇는 가는 선: sheet 크기를 기준으로 계산
        var r = parent.rect;
        var pa = new Vector2(a.x * r.width, a.y * r.height);
        var pb = new Vector2(b.x * r.width, b.y * r.height);
        if (r.width < 10) { pa = new Vector2(a.x * 640, a.y * 560); pb = new Vector2(b.x * 640, b.y * 560); }
        var line = Node("Route", parent);
        line.anchorMin = line.anchorMax = Vector2.zero; line.pivot = new Vector2(0f, 0.5f);
        var d = pb - pa;
        line.anchoredPosition = pa;
        line.sizeDelta = new Vector2(d.magnitude, 4);
        line.localRotation = Quaternion.Euler(0, 0, Mathf.Atan2(d.y, d.x) * Mathf.Rad2Deg);
        var im = line.gameObject.AddComponent<Image>();
        im.color = new Color(0.36f, 0.24f, 0.12f, 0.9f);
        im.raycastTarget = false;
    }

    // ------------------------------------------------------------------ note popup
    void ShowNote(string title, string body)
    {
        if (noteRoot != null) Destroy(noteRoot.gameObject);
        noteRoot = Node("Note", canvas);
        Stretch(noteRoot);
        var dim = noteRoot.gameObject.AddComponent<Image>();
        dim.color = new Color(0f, 0f, 0f, 0.6f);
        var b = noteRoot.gameObject.AddComponent<UnityEngine.UI.Button>();
        b.targetGraphic = dim;
        b.onClick.AddListener(() => Destroy(noteRoot.gameObject));
        var box = Panel(noteRoot, "Box", new Vector2(0.3f, 0.2f), new Vector2(0.7f, 0.8f));
        Label(box, title, 30, TextAnchor.UpperLeft, Color.white, UiFonts.Serif, new Vector2(24, 18));
        var t = Label(box, body, 20, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.85f), UiFonts.Sans, new Vector2(24, 76));
        t.lineSpacing = 1.2f;
        t.verticalOverflow = VerticalWrapMode.Truncate;
        var hint = Label(box, "아무 곳이나 눌러 닫기", 16, TextAnchor.LowerRight, new Color(1f, 1f, 1f, 0.45f), UiFonts.Sans, new Vector2(20, 12));
    }

    // ------------------------------------------------------------------ update / close
    void Update()
    {
        if (cutRoot != null && cutRoot.gameObject.activeSelf)
        {
            cutT += Time.unscaledDeltaTime;
            cutGroup.alpha = cutFadingOut ? Mathf.MoveTowards(cutGroup.alpha, 0f, Time.unscaledDeltaTime / 0.5f)
                                          : Mathf.MoveTowards(cutGroup.alpha, 1f, Time.unscaledDeltaTime / 0.7f);
            float s = 1f + 0.07f * Mathf.Clamp01(cutT / 14f); // 아주 느린 카메라 이동(Ken Burns)
            cutBg.localScale = new Vector3(s, s, 1f);
            if (cutFadingOut && cutGroup.alpha <= 0.001f)
            {
                var done = cutDone; cutDone = null;
                cutRoot.gameObject.SetActive(false);
                done?.Invoke();
            }
        }

        var kb = UnityEngine.InputSystem.Keyboard.current;
        if (kb != null && kb.escapeKey.wasPressedThisFrame)
        {
            if (noteRoot != null) Destroy(noteRoot.gameObject);
            else if (mapRoot != null && mapRoot.gameObject.activeSelf) Close(mapRoot);
            else if (studyRoot != null && studyRoot.gameObject.activeSelf) Close(studyRoot);
        }
        if (cutRoot != null && cutRoot.gameObject.activeSelf && kb != null && !cutFadingOut &&
            (kb.spaceKey.wasPressedThisFrame || kb.enterKey.wasPressedThisFrame)) cutFadingOut = true;
    }

    void Close(RectTransform root) { if (root != null) root.gameObject.SetActive(false); }

    // ------------------------------------------------------------------ ui helpers
    static RectTransform Node(string name, Transform parent)
    {
        var go = new GameObject(name, typeof(RectTransform));
        go.transform.SetParent(parent, false);
        return go.GetComponent<RectTransform>();
    }
    static RectTransform Node(string name, RectTransform parent) => Node(name, (Transform)parent);

    static void Stretch(RectTransform rt) { rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one; rt.offsetMin = rt.offsetMax = Vector2.zero; }

    static void Place(RectTransform rt, Vector2 anchorMin, Vector2 anchorMax, Vector2 pivot, Vector2 size)
    {
        rt.anchorMin = anchorMin; rt.anchorMax = anchorMax; rt.pivot = pivot;
        rt.anchoredPosition = Vector2.zero;
        // 같은 앵커면 고정 크기, 다르면 가로는 앵커 폭(0)+높이만 지정
        rt.sizeDelta = size;
    }

    static RectTransform Panel(RectTransform parent, string name, Vector2 min, Vector2 max)
    {
        var p = Node(name, parent);
        p.anchorMin = min; p.anchorMax = max; p.offsetMin = p.offsetMax = Vector2.zero;
        p.gameObject.AddComponent<Image>().color = Ink;
        var o = p.gameObject.AddComponent<Outline>();
        o.effectColor = new Color(Gold.r, Gold.g, Gold.b, 0.55f); o.effectDistance = new Vector2(1.5f, -1.5f);
        return p;
    }

    static Text Label(RectTransform parent, string text, int size, TextAnchor anchor, Color color, Font font, Vector2? pad = null)
    {
        var rt = Node("Text", parent);
        rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
        var p = pad ?? Vector2.zero;
        rt.offsetMin = new Vector2(p.x, p.y); rt.offsetMax = new Vector2(-p.x, -p.y);
        var t = rt.gameObject.AddComponent<Text>();
        t.font = font; t.fontSize = size; t.alignment = anchor; t.color = color; t.text = text;
        t.supportRichText = true;
        t.horizontalOverflow = HorizontalWrapMode.Wrap; t.verticalOverflow = VerticalWrapMode.Overflow;
        t.raycastTarget = false;
        // 패딩이 있는 패널 안 글자는 좌상단 기준으로 배치하기 위해 앵커 보정
        if (pad.HasValue) { rt.offsetMin = new Vector2(p.x, p.y); rt.offsetMax = new Vector2(-p.x, -p.y); }
        return t;
    }

    static RectTransform Button(RectTransform parent, string label, Action onClick)
    {
        var b = Node("Button", parent);
        var img = b.gameObject.AddComponent<Image>();
        img.color = new Color(0.10f, 0.085f, 0.07f, 1f);
        var o = b.gameObject.AddComponent<Outline>();
        o.effectColor = Gold; o.effectDistance = new Vector2(2, -2);
        var btn = b.gameObject.AddComponent<UnityEngine.UI.Button>();
        btn.targetGraphic = img;
        var cs = btn.colors; cs.highlightedColor = new Color(1.4f, 1.25f, 1.05f, 1f); cs.pressedColor = new Color(0.8f, 0.75f, 0.65f, 1f); btn.colors = cs;
        btn.onClick.AddListener(() => onClick());
        var t = Label(b, label, 24, TextAnchor.MiddleCenter, new Color(0.96f, 0.92f, 0.82f), UiFonts.Serif);
        return b;
    }

    static RectTransform HotSpot(RectTransform parent, string name, string desc, Action onClick)
    {
        var b = Button(parent, "", onClick);
        foreach (var t in b.GetComponentsInChildren<Text>()) Destroy(t.gameObject);
        var n = Label(b, name, 22, TextAnchor.UpperLeft, new Color(0.96f, 0.92f, 0.82f), UiFonts.Serif, new Vector2(14, 10));
        var d = Label(b, desc, 16, TextAnchor.LowerLeft, new Color(1f, 1f, 1f, 0.65f), UiFonts.Sans, new Vector2(14, 10));
        return b;
    }

    static void Shade(RectTransform parent, Vector2 min, Vector2 max, bool topDown, float alpha = 0.75f)
    {
        var s = Node("Shade", parent);
        s.anchorMin = min; s.anchorMax = max; s.offsetMin = s.offsetMax = Vector2.zero;
        var img = s.gameObject.AddComponent<Image>();
        const int n = 32;
        var tex = new Texture2D(1, n, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp };
        for (int y = 0; y < n; y++)
        {
            float t = (float)y / (n - 1);                 // 아래 0 -> 위 1
            float a = topDown ? t : 1f - t;               // topDown: 위가 진함
            tex.SetPixel(0, y, new Color(0.03f, 0.03f, 0.04f, alpha * a * a));
        }
        tex.Apply();
        img.sprite = Sprite.Create(tex, new Rect(0, 0, 1, n), new Vector2(0.5f, 0.5f));
        img.raycastTarget = false;
    }
}
