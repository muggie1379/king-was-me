using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

// "무슨 게임인지"를 화면에서 바로 읽히게 하는 HUD (2026-09-19 사용자 피드백).
// 02_design_bible.md §13 루프(사건 -> 대신들의 해석 -> 선택 -> 결과)와 §29 왕실 기록을 화면에 올린다.
// 금지: 호감도/점수 등 수치 노출(§12.1), 대신 역할을 장기 매칭표로 해설(§30), 상대 속마음 확정.
public class GameHud
{
    // 진행 표시는 하지 않는다: "사건 N/29", "ACT I~V"는 엔딩까지의 길이를 알려 주고(건너뛰기/분기로 실제 길이도 달라진다),
    // 막 제목은 결말을 예고할 수 있다(사용자 지시 2026-09-19). 화면 좌상단에는 사건 제목(Ink `# title` 태그)만 나온다.

    readonly Font font;
    readonly Transform root;
    // 대신 표시는 SeatView(좌석 뷰)가 맡는다. 명단은 CourtRoster 데이터가 정한다(4명 고정 아님).
    readonly CourtRoster roster;
    public SeatView Seats { get; private set; }
    readonly bool[] introduced;
    readonly List<string> records = new List<string>();
    Text recordBody;
    Text chapterText;
    GameObject titlePanel;

    public GameHud(Transform root, Font font, CourtRoster roster)
    {
        this.root = root;
        this.font = font;
        this.roster = roster;
        introduced = new bool[roster.advisors.Count];
        BuildChapter();
        Seats = SeatView.Create(root, font, roster);
        BuildRecordPanel();
    }

    public int AdvisorCount => roster.advisors.Count;
    public int IntroducedCount => Seats.IntroducedCount;

    // ---- 챕터/진행 표시 ----
    void BuildChapter()
    {
        var go = NewRect("Chapter", root, new Vector2(0.05f, 0.955f), new Vector2(0.75f, 0.995f));
        chapterText = AddText(go, 20, TextAnchor.MiddleLeft, new Color(1f, 1f, 1f, 0.7f));
        SetTitle(null);
    }

    public void SetTitle(string title)
    {
        chapterText.text = string.IsNullOrEmpty(title) ? "" : title;
    }

    // ---- 대신 (좌석 뷰로 위임) ----
    public void SetIntroduced(int index, bool value)
    {
        if (introduced[index] == value) return;
        introduced[index] = value;
        Seats.SetIntroduced(index, value);
    }

    public void Highlight(string speaker) { Seats.Highlight(speaker); }

    // 왕의 정적: 좌석 뷰가 시선/시점/비네트로 표현한다.
    public void SetGaze(bool value) { Seats.SetGaze(value); }

    // ---- 왕실 기록 (§29: 무엇을 했는지만 남긴다) ----
    void BuildRecordPanel()
    {
        var go = NewRect("RoyalRecord", root, new Vector2(0.76f, 0.35f), new Vector2(0.95f, 0.945f));
        var bg = go.AddComponent<Image>();
        bg.color = new Color(0f, 0f, 0f, 0.42f);
        bg.raycastTarget = false;
        recordBody = AddText(go, 17, TextAnchor.UpperLeft, new Color(1f, 1f, 1f, 0.85f), new Vector2(12, 10));
        recordBody.font = UiFonts.Sans;
        Refresh();
    }

    public List<string> RecordsSnapshot() { return new List<string>(records); }

    public void ClearRecords()
    {
        records.Clear();
        Refresh();
    }

    public void AddRecord(string line)
    {
        records.Add(line);
        Refresh();
    }

    void Refresh()
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("<b>왕실 기록</b>");
        sb.AppendLine();
        if (records.Count == 0)
        {
            sb.AppendLine("<color=#777777>아직 기록이 없다.</color>");
        }
        int start = Mathf.Max(0, records.Count - 9);
        for (int i = start; i < records.Count; i++)
        {
            sb.AppendLine("· " + records[i]);
        }
        recordBody.text = sb.ToString();
    }

    // ---- 첫 화면: 무슨 게임인지 ----
    public void ShowTitle(Action onStart)
    {
        titlePanel = NewRect("TitlePanel", root, Vector2.zero, Vector2.one);
        var bg = titlePanel.AddComponent<Image>();
        bg.color = new Color(0.03f, 0.03f, 0.04f, 0.88f);

        var title = NewRect("Title", titlePanel.transform, new Vector2(0.1f, 0.62f), new Vector2(0.9f, 0.82f));
        AddText(title, 76, TextAnchor.MiddleCenter, Color.white).text = "KING WAS ME";

        var body = NewRect("Premise", titlePanel.transform, new Vector2(0.15f, 0.33f), new Vector2(0.85f, 0.6f));
        var bodyText = AddText(body, 30, TextAnchor.MiddleCenter, new Color(1f, 1f, 1f, 0.9f));
        bodyText.lineSpacing = 1.3f;
        // v1.0 §20(KING WAS YOU 반전)/§28.1(왕의 침묵 프라이밍 금지): 3인칭 사실 서술만. '당신은 왕' '말하지 않는다' '결정한다'는 물론, 플레이어가 스스로 해석할 것을 미리 설명하는 문장('저마다 다르게 읽는다' 등)도 쓰지 않는다(사용자 지시 2026-09-19).
        bodyText.text = "작은 왕국.\n새로 즉위한 왕.\n\n이웃 나라에서 사절이 온다.";

        var btn = NewRect("StartButton", titlePanel.transform, new Vector2(0.4f, 0.14f), new Vector2(0.6f, 0.25f));
        var img = btn.AddComponent<Image>();
        img.color = new Color(0.2f, 0.35f, 0.55f, 1f);
        var button = btn.AddComponent<Button>();
        button.targetGraphic = img;
        AddText(btn, 30, TextAnchor.MiddleCenter, Color.white).text = "시작";
        button.onClick.AddListener(() =>
        {
            titlePanel.SetActive(false);
            onStart();
        });
    }

    // ---- helpers ----
    static GameObject NewRect(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax)
    {
        var go = new GameObject(name, typeof(RectTransform));
        go.transform.SetParent(parent, false);
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
        return go;
    }

    Text AddText(GameObject go, int size, TextAnchor anchor, Color color, Vector2? padding = null)
    {
        var textGO = new GameObject("Text", typeof(RectTransform));
        textGO.transform.SetParent(go.transform, false);
        var rt = textGO.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        var p = padding ?? Vector2.zero;
        rt.offsetMin = new Vector2(p.x, p.y);
        rt.offsetMax = new Vector2(-p.x, -p.y);
        var t = textGO.AddComponent<Text>();
        t.font = font;
        t.fontSize = size;
        t.color = color;
        t.alignment = anchor;
        t.supportRichText = true;
        t.horizontalOverflow = HorizontalWrapMode.Wrap;
        t.verticalOverflow = VerticalWrapMode.Overflow;
        t.raycastTarget = false;
        return t;
    }
}
