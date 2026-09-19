using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

// 회의 좌석 뷰: 대신들이 왕(카메라) 앞 탁자에 앉아 있다. 대신 카드 줄을 대체한다.
//  - 의견 말풍선: 대신 머리 위 짧은 칩 -> 마우스를 올리면 전문으로 확대 -> 클릭하면 큰 발언 팝업.
//  - 발언 팝업: 대신이 말할 때 크게 뜨는 UI(선택 버튼과 모양을 분리).
//  - 왕의 정적(SetGaze): 말풍선이 닫히고 모두가 같은 밝기로 정면을 향하며 시점이 다가간다 -> "모두가 왕의 결정을 기다린다".
// 좌석 수는 로스터 크기(최소 4)로 정해진다. 소개되지 않은 좌석은 빈 의자만 보인다(이름표/물음표 없음).
// 좌석 포즈 스프라이트(seatedPoses)가 준비되면 GetPose로 교체한다(현재는 초상 스프라이트 사용).
public class SeatView : MonoBehaviour
{
    class Seat
    {
        public AdvisorProfile profile;
        public RectTransform slot;      // 위치 기준(좌석 중심, 바닥)
        public RectTransform figure;
        public Image figureImage;
        public Image chair;
        public RectTransform bubble;
        public CanvasGroup bubbleGroup;
        public Image bubbleBg;
        public Text bubbleText;
        public Image bubbleAccent;
        public string opinion;
        public string shortText, fullText; // 접힌 카드(앞부분+…) / 펼친 카드(전문)
        public bool introduced;
        public float appear;            // 0..1 등장 애니메이션
        public bool hovered;
        public float expand;            // 0..1 말풍선 확대
        public bool speaking;
        public Text label;              // 임시 이름표(그림이 없는 방문자용)
        public Vector2 targetPos;       // 인원 변화에 따른 자리(부드럽게 이동)
        public bool listening;          // 지금 발언의 청자
        public float punch;             // 발화 강세(stance)에 따른 순간 반응, 0으로 감쇠
    }

    // 현재 초상 스프라이트는 아랫부분(탁자 소품 등)이 배경 없이 잘려 있어 아래 20%를 가린다. 투명 컷아웃 좌석 포즈가 오면 0으로.
    const float FigureClip = 0.20f;
    const float ChipH = 92f, OpenW = 360f, CardBottom = 8f, FigureLift = 64f;
    float chipW = 200f;

    Font font;
    CourtRoster roster;
    RectTransform region;
    RectTransform zoomRoot;
    RectTransform overlay;
    readonly List<Seat> seats = new List<Seat>();
    int seatCount;

    // 발언 팝업
    RectTransform popup;
    Image popupBg, popupTail, popupNameBg;
    Text popupName, popupText;
    int popupSeat = -1;
    bool popupAbove;   // 의견 카드가 떠 있을 때는 카드 위쪽에 띄워 서로 겹치지 않게
    float popupT;

    // 왕의 정적
    bool gazing;
    float gazeT;
    Image vignette;
    Text hint;
    bool opinionsActive;   // 이번 사건에 의견 말풍선이 있는가
    bool bubblesVisible;
    float bubbleAlpha;

    public bool GazeActive => gazing;
    public System.Action<int> OnBubbleClicked;

    public static SeatView Create(Transform canvas, Font font, CourtRoster roster)
    {
        var go = new GameObject("SeatView", typeof(RectTransform));
        go.transform.SetParent(canvas, false);
        var v = go.AddComponent<SeatView>();
        v.Build(go.GetComponent<RectTransform>(), font, roster, canvas);
        return v;
    }

    // ---------------------------------------------------------------- build
    void Build(RectTransform root, Font f, CourtRoster r, Transform canvas)
    {
        font = f; roster = r;
        region = root;
        region.anchorMin = new Vector2(0.03f, 0.25f);
        region.anchorMax = new Vector2(0.74f, 0.83f);
        region.offsetMin = region.offsetMax = Vector2.zero;

        // 정적 때 시점이 다가가는 효과: zoomRoot만 스케일한다.
        zoomRoot = NewRect("Zoom", region);
        Stretch(zoomRoot);
        seatCount = Mathf.Max(4, roster.advisors.Count);

        var all = new List<AdvisorProfile>(roster.advisors);
        all.AddRange(roster.guests);
        for (int i = 0; i < all.Count; i++)
        {
            var s = new Seat { profile = all[i] };
            s.slot = NewRect("Seat_" + s.profile.id, zoomRoot);
            s.slot.anchorMin = s.slot.anchorMax = new Vector2(0f, 0f);
            s.slot.pivot = new Vector2(0.5f, 0f);
            s.slot.gameObject.AddComponent<RectMask2D>();

            var chairGO = NewRect("Chair", s.slot);
            s.chair = chairGO.gameObject.AddComponent<Image>();
            s.chair.color = new Color(0f, 0f, 0f, 0.28f);
            s.chair.raycastTarget = false;
            chairGO.anchorMin = new Vector2(0.5f, 0f); chairGO.anchorMax = new Vector2(0.5f, 0f);
            chairGO.pivot = new Vector2(0.5f, 0f);

            s.figure = NewRect("Figure", s.slot);
            s.figure.anchorMin = s.figure.anchorMax = new Vector2(0.5f, 0f);
            s.figure.pivot = new Vector2(0.5f, 0f);
            s.figureImage = s.figure.gameObject.AddComponent<Image>();
            s.figureImage.preserveAspect = true;
            s.figureImage.raycastTarget = false;
            var pose = s.profile.GetPose(SeatPose.Idle);
            s.figureImage.sprite = pose != null ? pose : s.profile.portrait;
            if (s.figureImage.sprite == null) s.figureImage.sprite = PlaceholderFigure(); // 임시 UI: 그림이 없는 인물은 실루엣
            s.figureImage.enabled = true;
            if (s.profile.isGuest) s.label = MakeLabel(s);
            seats.Add(s);
        }

        // 오버레이(말풍선/팝업)는 인물 위에 그린다. zoomRoot 밖이라 확대되지 않는다.
        overlay = NewRect("Overlay", region);
        Stretch(overlay);
        var shade = NewRect("TableShade", overlay);
        shade.anchorMin = new Vector2(0f, 0f); shade.anchorMax = new Vector2(1f, 0f);
        shade.pivot = new Vector2(0.5f, 0f);
        shade.sizeDelta = new Vector2(0f, 110f);
        var shadeImg = shade.gameObject.AddComponent<Image>();
        shadeImg.sprite = MakeVerticalGradientSprite();
        shadeImg.raycastTarget = false;
        foreach (var s in seats) BuildBubble(s);
        BuildPopup();

        var hintGO = NewRect("Hint", region);
        hintGO.anchorMin = new Vector2(0f, 1f); hintGO.anchorMax = new Vector2(1f, 1f);
        hintGO.pivot = new Vector2(0.5f, 1f);
        hintGO.sizeDelta = new Vector2(0, 26);
        hintGO.anchoredPosition = new Vector2(0, 4);
        hint = hintGO.gameObject.AddComponent<Text>();
        StyleText(hint, 16, TextAnchor.MiddleCenter, new Color(1f, 1f, 1f, 0.5f));
        hint.font = UiFonts.Sans;
        hint.text = "의견 카드에 마우스를 올리면 크게 볼 수 있다";
        hint.raycastTarget = false;
        hint.gameObject.SetActive(false);

        // 비네트(전체 화면): 정적 때 가장자리가 어두워진다.
        var vg = NewRect("Vignette", canvas as RectTransform);
        Stretch(vg);
        vg.SetSiblingIndex(region.GetSiblingIndex() + 1);
        vignette = vg.gameObject.AddComponent<Image>();
        vignette.sprite = MakeVignetteSprite();
        vignette.color = new Color(0f, 0f, 0f, 0f);
        vignette.raycastTarget = false;

        LayoutSeats();
    }

    void BuildBubble(Seat s)
    {
        s.bubble = NewRect("Bubble_" + s.profile.id, overlay);
        s.bubble.anchorMin = s.bubble.anchorMax = new Vector2(0f, 0f);
        s.bubble.pivot = new Vector2(0.5f, 0f);
        s.bubbleBg = s.bubble.gameObject.AddComponent<Image>();
        s.bubbleBg.color = new Color(0.08f, 0.08f, 0.1f, 0.92f);
        s.bubbleGroup = s.bubble.gameObject.AddComponent<CanvasGroup>();
        s.bubbleGroup.alpha = 0f;

        var accent = NewRect("Accent", s.bubble);
        accent.anchorMin = new Vector2(0, 0); accent.anchorMax = new Vector2(0, 1);
        accent.sizeDelta = new Vector2(5, 0); accent.pivot = new Vector2(0, 0.5f);
        s.bubbleAccent = accent.gameObject.AddComponent<Image>();
        s.bubbleAccent.color = s.profile.accent;
        s.bubbleAccent.raycastTarget = false;

        var t = NewRect("Text", s.bubble);
        Stretch(t);
        t.offsetMin = new Vector2(14, 6); t.offsetMax = new Vector2(-10, -6);
        s.bubbleText = t.gameObject.AddComponent<Text>();
        StyleText(s.bubbleText, 20, TextAnchor.MiddleLeft, Color.white);
        s.bubbleText.font = UiFonts.Sans;
        s.bubbleText.raycastTarget = false;

        var h = s.bubble.gameObject.AddComponent<BubbleHover>();
        int idx = seats.IndexOf(s);
        h.owner = this; h.index = idx;
        s.bubble.gameObject.SetActive(false);
    }

    void BuildPopup()
    {
        popup = NewRect("SpeakPopup", overlay);
        popup.anchorMin = popup.anchorMax = new Vector2(0f, 0f);
        popup.pivot = new Vector2(0.5f, 0f);
        popup.sizeDelta = new Vector2(600, 118);
        popupBg = popup.gameObject.AddComponent<Image>();
        popupBg.color = new Color(0.05f, 0.05f, 0.07f, 0.96f);

        var tail = NewRect("Tail", popup);
        tail.anchorMin = tail.anchorMax = new Vector2(0.5f, 1f);
        tail.sizeDelta = new Vector2(26, 26);
        tail.localRotation = Quaternion.Euler(0, 0, 45);
        popupTail = tail.gameObject.AddComponent<Image>();
        popupTail.color = popupBg.color;
        popupTail.raycastTarget = false;

        var nameBg = NewRect("NameTag", popup);
        nameBg.anchorMin = nameBg.anchorMax = new Vector2(0f, 1f);
        nameBg.pivot = new Vector2(0f, 0.5f);
        nameBg.sizeDelta = new Vector2(190, 36);
        nameBg.anchoredPosition = new Vector2(16, 0);
        popupNameBg = nameBg.gameObject.AddComponent<Image>();
        popupNameBg.raycastTarget = false;
        var nameT = NewRect("Name", nameBg);
        Stretch(nameT);
        popupName = nameT.gameObject.AddComponent<Text>();
        StyleText(popupName, 20, TextAnchor.MiddleCenter, Color.white);
        popupName.fontStyle = FontStyle.Bold;
        popupName.font = UiFonts.Sans;
        popupName.raycastTarget = false;

        var body = NewRect("Body", popup);
        Stretch(body);
        body.offsetMin = new Vector2(26, 14); body.offsetMax = new Vector2(-26, -30);
        popupText = body.gameObject.AddComponent<Text>();
        StyleText(popupText, 28, TextAnchor.MiddleLeft, Color.white);
        popupText.raycastTarget = false;

        popup.gameObject.AddComponent<PopupClick>().owner = this;
        popup.gameObject.SetActive(false);
    }

    // ---------------------------------------------------------------- layout
    // 좌석 수 = 지금 소개된 인원. 2명이면 크게 중앙에, 늘어나면 자리가 벌어진다(빈 의자/물음표 없음).
    const float MaxSlotW = 330f;
    void LayoutSeats()
    {
        float W = region.rect.width, H = region.rect.height;
        if (W < 10) { W = 909; H = 374; }
        int n = Mathf.Max(1, PresentCount);
        float slotW = Mathf.Min(W / n, MaxSlotW);
        chipW = Mathf.Max(190f, slotW * 0.94f);
        float figH = Mathf.Min((H - FigureLift) * 1.0f, slotW * 2.1f);
        float startX = (W - slotW * n) / 2f;
        // 좌석 순서: 왼쪽 대신들 - 방문자 - 오른쪽 대신들(방문자가 없으면 대신만 순서대로).
        var order = new List<Seat>();
        int advisorsPresent = 0;
        foreach (var a in seats) if (a.introduced && !a.profile.isGuest) advisorsPresent++;
        int leftCount = (advisorsPresent + 1) / 2, placed = 0;
        bool guestPlaced = false;
        foreach (var a in seats)
        {
            if (!a.introduced || a.profile.isGuest) continue;
            if (placed == leftCount) { foreach (var g in seats) if (g.introduced && g.profile.isGuest) order.Add(g); guestPlaced = true; }
            order.Add(a);
            placed++;
        }
        if (!guestPlaced) foreach (var g in seats) if (g.introduced && g.profile.isGuest) order.Add(g);

        for (int i = 0; i < seats.Count; i++)
        {
            var s = seats[i];
            float x = W / 2f, t = 0f;
            int rank = order.IndexOf(s);
            if (rank >= 0)
            {
                x = startX + slotW * (rank + 0.5f);
                t = n > 1 ? (rank + 0.5f) / n * 2f - 1f : 0f;
            }
            // 가운데 좌석이 살짝 앞(낮게), 가장자리는 살짝 뒤(높게): 부채꼴 배치
            s.targetPos = new Vector2(x, FigureLift + 14f * t * t);
            s.slot.sizeDelta = new Vector2(slotW, figH * (1f - FigureClip + 0.35f)); // 위쪽 여유: 발화 강조로 인물이 커져도 머리가 마스크에 잘리지 않게(마스크는 아래쪽만 자른다)
            s.figure.sizeDelta = new Vector2(slotW * 0.95f, figH);
            s.chair.gameObject.SetActive(false);
        }
        lastW = region.rect.width; lastH = region.rect.height;
    }

    float lastW, lastH;

    // ---------------------------------------------------------------- API
    public void SetIntroduced(int index, bool value)
    {
        var s = seats[index];
        if (s.introduced == value) return;
        s.introduced = value;
        if (!value) s.appear = 0f; // 재시작 등: 다시 등장 연출
        LayoutSeats();
        if (value) s.slot.anchoredPosition = s.targetPos; // 새로 온 대신은 제자리에서 등장, 이웃이 옆으로 비켜난다
    }

    // 회의 구성원(대신) 중 소개된 수. 방문자는 제외한다(정적/좌석 판단은 대신 기준).
    public int IntroducedCount { get { int n = 0; foreach (var s in seats) if (s.introduced && !s.profile.isGuest) n++; return n; } }
    int PresentCount { get { int n = 0; foreach (var s in seats) if (s.introduced) n++; return n; } }

    public bool IsGuest(string speaker)
    {
        var i = IndexOf(speaker);
        return i >= 0 && seats[i].profile.isGuest;
    }

    // 방문자 등장/퇴장(Ink `# enter: <id>`, `# exit: <id>`). 대신들은 방문자 양옆으로 나뉘어 앉는다.
    public void SetGuestPresent(string id, bool present)
    {
        var i = IndexOfId(id);
        if (i < 0 || !seats[i].profile.isGuest) return;
        SetIntroduced(i, present);
    }

    public void ClearGuests()
    {
        for (int i = 0; i < seats.Count; i++) if (seats[i].profile.isGuest && seats[i].introduced) SetIntroduced(i, false);
    }

    public bool IsIntroduced(string speaker)
    {
        var i = IndexOf(speaker);
        return i >= 0 && seats[i].introduced;
    }

    public int IndexOfId(string id)
    {
        if (string.IsNullOrEmpty(id)) return -1;
        for (int i = 0; i < seats.Count; i++) if (seats[i].profile.id == id) return i;
        return -1;
    }

    public int IndexOf(string speaker)
    {
        for (int i = 0; i < seats.Count; i++) if (seats[i].profile.displayName == speaker) return i;
        return -1;
    }

    // 현재 화자 강조(선택 상태가 아니라 "지금 말하는 사람"). 화자가 없으면 모두 보통 밝기.
    public void Highlight(string speaker)
    {
        for (int i = 0; i < seats.Count; i++) seats[i].speaking = seats[i].profile.displayName == speaker;
    }

    public void ClearOpinions()
    {
        foreach (var s in seats) { s.opinion = null; s.hovered = false; s.expand = 0f; s.bubble.gameObject.SetActive(false); }
        opinionsActive = false;
        bubblesVisible = false;
        HidePopup();
        hint.gameObject.SetActive(false);
    }

    // (좌석 index, 의견 전문). 소개된 대신만 넘긴다.
    public void ShowOpinions(List<KeyValuePair<int, string>> opinions)
    {
        foreach (var kv in opinions)
        {
            var s = seats[kv.Key];
            s.opinion = kv.Value;
            var head = $"<b><color={s.profile.AccentHex}>{s.profile.displayName}</color> · {s.profile.role}</b>\n";
            s.fullText = head + kv.Value;
            s.shortText = head + (kv.Value.Length > 34 ? kv.Value.Substring(0, 34).TrimEnd() + "…" : kv.Value);
            s.bubbleText.text = s.shortText;
            s.bubble.gameObject.SetActive(true);
        }
        opinionsActive = opinions.Count > 0;
        bubblesVisible = opinionsActive;
        hint.gameObject.SetActive(opinionsActive);
    }

    public void Speak(int index, string text, int listenerIndex = -1, string stance = null)
    {
        foreach (var o in seats) o.listening = false;
        if (listenerIndex >= 0 && listenerIndex < seats.Count && listenerIndex != index) seats[listenerIndex].listening = true;
        // stance는 관찰 가능한 발화 행동(연출용): counter는 앞으로 기울며 강하게, question/clarify는 가볍게, support는 부드럽게.
        seats[index].punch = stance == "counter" ? 1f : stance == "question" ? 0.6f : stance == "clarify" ? 0.45f : stance == "support" ? 0.3f : 0.2f;
        var s = seats[index];
        popupSeat = index;
        popupAbove = bubblesVisible && opinionsActive && !gazing;
        popupName.text = s.profile.displayName + (string.IsNullOrEmpty(s.profile.role) ? "" : "  ·  " + s.profile.role);
        popupNameBg.color = s.profile.accent * 0.75f + new Color(0, 0, 0, 0.25f);
        popupText.text = text;
        popupT = 0f;
        popup.gameObject.SetActive(true);
        PositionPopup();
        Highlight(s.profile.displayName);
    }

    public void HidePopup()
    {
        foreach (var o in seats) o.listening = false;
        popupSeat = -1;
        popup.gameObject.SetActive(false);
    }

    public bool PopupOpen => popupSeat >= 0;

    // 왕의 정적: 말풍선/팝업을 닫고 모두가 정면(=왕)을 본다. 해제하면 의견 말풍선이 칩으로 돌아온다(선택하면서 다시 읽을 수 있게).
    public void SetGaze(bool value)
    {
        gazing = value;
        if (value)
        {
            HidePopup();
            Highlight(null);
        }
    }

    // ---------------------------------------------------------------- update
    void Update()
    {
        if (Mathf.Abs(region.rect.width - lastW) > 1f || Mathf.Abs(region.rect.height - lastH) > 1f) LayoutSeats();
        float dt = Time.unscaledDeltaTime;
        gazeT = Mathf.MoveTowards(gazeT, gazing ? 1f : 0f, dt / 0.9f);
        float ease = gazeT * gazeT * (3f - 2f * gazeT);

        // 시점이 왕 쪽으로 다가간다 + 가장자리 어두워짐
        float zoom = 1f + 0.06f * ease;
        zoomRoot.localScale = new Vector3(zoom, zoom, 1f);
        var vc = vignette.color; vc.a = 0.75f * ease; vignette.color = vc;

        float targetBubble = (bubblesVisible && !gazing) ? (popupSeat >= 0 ? 0.3f : 1f) : 0f; // 팝업이 열려 있으면 카드는 흐리게
        bubbleAlpha = Mathf.MoveTowards(bubbleAlpha, targetBubble, dt / 0.25f);

        float W = region.rect.width;
        for (int i = 0; i < seats.Count; i++)
        {
            var s = seats[i];
            s.slot.anchoredPosition = Vector2.Lerp(s.slot.anchoredPosition, s.targetPos, 1f - Mathf.Exp(-8f * dt));
            s.appear = Mathf.MoveTowards(s.appear, s.introduced ? 1f : 0f, dt / 0.6f);
            float a = s.appear * s.appear * (3f - 2f * s.appear);

            // 밝기: 정적에서는 모두 동일하게 밝다(누구도 앞서지 않는다). 평소엔 화자만 밝고 나머지는 살짝 어둡다.
            float dim = 0.72f;
            float lit = gazeT > 0f ? Mathf.Lerp(s.speaking ? 1f : dim, 1f, ease) : (s.speaking ? 1f : dim);
            if (!opinionsActive && !s.speaking) lit = Mathf.Max(lit, 0.85f);
            if (s.listening) lit = Mathf.Max(lit, 0.92f);
            s.figureImage.color = new Color(lit, lit, lit, a);
            float bob = 1f + 0.012f * Mathf.Sin(Time.unscaledTime * 1.2f + i) * (1f - ease);
            s.punch = Mathf.MoveTowards(s.punch, 0f, dt / 0.9f);
            float pop = (s.speaking ? 1.04f : 1f) + 0.05f * s.punch;
            s.figure.localScale = new Vector3(pop * bob, pop * bob, 1f);
            // 청자는 화자 쪽으로 살짝 몸을 기울인다(선 대신 몸 방향으로 관계를 보여준다).
            float leanTarget = 0f;
            if (s.listening && popupSeat >= 0) leanTarget = (seats[popupSeat].slot.anchoredPosition.x < s.slot.anchoredPosition.x ? 1f : -1f) * 3f;
            float lean = Mathf.LerpAngle(s.figure.localEulerAngles.z, leanTarget, 1f - Mathf.Exp(-10f * dt));
            s.figure.pivot = new Vector2(0.5f, 0f);
            s.figure.localRotation = Quaternion.Euler(0f, 0f, lean);
            s.figure.anchoredPosition = new Vector2(0, -s.slot.sizeDelta.y * FigureClip / (1f - FigureClip) - 24f * (1f - a)); // 아래 일부는 마스크로 가리고, 등장 때는 아래에서 올라온다
            s.chair.color = new Color(0f, 0f, 0f, 0.28f * (1f - a));
            if (s.label != null) { var lc = s.label.color; lc.a = 0.85f * a; s.label.color = lc; }

            // 말풍선
            if (s.bubble.gameObject.activeSelf)
            {
                s.expand = Mathf.MoveTowards(s.expand, s.hovered && bubbleAlpha > 0.5f ? 1f : 0f, dt / 0.12f);
                float e = s.expand * s.expand * (3f - 2f * s.expand);
                float openW = Mathf.Max(chipW, OpenW);
                float openH = Mathf.Max(ChipH, s.bubbleText.cachedTextGenerator.GetPreferredHeight(s.fullText ?? "", s.bubbleText.GetGenerationSettings(new Vector2(openW - 24, 0))) / s.bubbleText.pixelsPerUnit + 22);
                float w = Mathf.Lerp(chipW, openW, e);
                float h = Mathf.Lerp(ChipH, openH, e);
                float cx = s.slot.anchoredPosition.x;
                cx = Mathf.Clamp(cx, w / 2f, Mathf.Max(w / 2f, W - w / 2f));
                s.bubble.anchoredPosition = new Vector2(cx, CardBottom);
                s.bubble.sizeDelta = new Vector2(w, h);
                s.bubbleText.horizontalOverflow = e > 0.4f ? HorizontalWrapMode.Wrap : HorizontalWrapMode.Wrap;
                s.bubbleText.verticalOverflow = VerticalWrapMode.Truncate;
                s.bubbleText.alignment = TextAnchor.MiddleLeft;
                var wantText = e > 0.4f ? s.fullText : s.shortText;
                if (s.bubbleText.text != wantText) s.bubbleText.text = wantText;
                s.bubbleText.fontSize = e > 0.4f ? 22 : 17;
                s.bubbleText.lineSpacing = 1.05f;
                float al = bubbleAlpha * a;
                s.bubbleGroup.alpha = al; // 배경/강조선/글자(리치 텍스트 색 포함)를 한 번에 페이드
                s.bubbleGroup.blocksRaycasts = al > 0.5f;
                if (s.hovered) s.bubble.SetAsLastSibling();
            }
        }

        if (popupSeat >= 0)
        {
            popupT = Mathf.MoveTowards(popupT, 1f, dt / 0.14f);
            float e = 1f - (1f - popupT) * (1f - popupT);
            popup.localScale = Vector3.one * Mathf.Lerp(0.86f, 1f, e);
            var c = popupBg.color; c.a = 0.96f * e; popupBg.color = c; popupTail.color = c;
            PositionPopup();
        }

        hint.color = new Color(1f, 1f, 1f, 0.5f * bubbleAlpha);
    }

    void PositionPopup()
    {
        if (popupSeat < 0) return;
        var s = seats[popupSeat];
        float W = region.rect.width;
        float pw = popup.sizeDelta.x;
        float cx = Mathf.Clamp(s.slot.anchoredPosition.x, pw / 2f, Mathf.Max(pw / 2f, W - pw / 2f));
        popup.anchoredPosition = new Vector2(cx, popupAbove ? CardBottom + ChipH + 12f : 6f); // 논쟁: 탁자 앞(인물 아래) / 카드 클릭: 카드 위
        // 꼬리: 화자 쪽을 가리킨다(팝업이 좌우로 밀려도 화자 위치 유지)
        var tail = (RectTransform)popupTail.transform;
        float dx = Mathf.Clamp(s.slot.anchoredPosition.x - cx, -pw / 2f + 40f, pw / 2f - 40f);
        tail.anchoredPosition = new Vector2(dx, 0f);
    }

    // ---------------------------------------------------------------- input from helpers
    internal void BubbleEnter(int i) { seats[i].hovered = true; }
    internal void BubbleExit(int i) { seats[i].hovered = false; }
    internal void BubbleClick(int i)
    {
        if (gazing || string.IsNullOrEmpty(seats[i].opinion)) return;
        OnBubbleClicked?.Invoke(i);
    }
    internal void PopupClicked() { HidePopup(); Highlight(null); }

    public string OpinionOf(int i) => seats[i].opinion;

    // 개발용: 현재 레이아웃/애니메이션 상태(캡처가 UI 갱신 전에 찍혔는지 판별).
    public string DebugState()
    {
        var sb = new System.Text.StringBuilder();
        sb.Append($"frame={Time.frameCount} region={region.rect.width:0}x{region.rect.height:0} chipW={chipW:0} gazeT={gazeT:0.00} bubbleAlpha={bubbleAlpha:0.00}");
        foreach (var s in seats) sb.Append($" | {s.profile.id}: intro={s.introduced} appear={s.appear:0.00} slot={s.slot.anchoredPosition} size={s.slot.sizeDelta} fig={s.figure.rect.size} bubbleOn={s.bubble.gameObject.activeSelf}");
        return sb.ToString();
    }

    // ---------------------------------------------------------------- helpers
    static RectTransform NewRect(string name, Transform parent)
    {
        var go = new GameObject(name, typeof(RectTransform));
        go.transform.SetParent(parent, false);
        return go.GetComponent<RectTransform>();
    }

    static void Stretch(RectTransform rt)
    {
        rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
        rt.offsetMin = rt.offsetMax = Vector2.zero;
    }

    void StyleText(Text t, int size, TextAnchor anchor, Color color)
    {
        t.font = font; t.fontSize = size; t.alignment = anchor; t.color = color;
        t.supportRichText = true;
        t.horizontalOverflow = HorizontalWrapMode.Wrap;
        t.verticalOverflow = VerticalWrapMode.Overflow;
    }

    Text MakeLabel(Seat s)
    {
        var rt = NewRect("Label", s.slot);
        rt.anchorMin = new Vector2(0f, 0f); rt.anchorMax = new Vector2(1f, 0f);
        rt.pivot = new Vector2(0.5f, 0f);
        rt.sizeDelta = new Vector2(0f, 28f);
        rt.anchoredPosition = new Vector2(0f, 0f);
        var t = rt.gameObject.AddComponent<Text>();
        StyleText(t, 18, TextAnchor.MiddleCenter, new Color(1f, 1f, 1f, 0f));
        t.text = s.profile.displayName;
        t.raycastTarget = false;
        return t;
    }

    static Sprite placeholderFigure;
    // 임시 UI: 그림이 없는 인물(사절 등)의 머리+어깨 실루엣.
    static Sprite PlaceholderFigure()
    {
        if (placeholderFigure != null) return placeholderFigure;
        const int w = 128, h = 192;
        var tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
        var body = new Color(0.30f, 0.28f, 0.26f, 1f);
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dx = x - w / 2f;
                // 머리: 중심 (64,138) 반지름 26
                float hd = Mathf.Sqrt(dx * dx + (y - 138f) * (y - 138f));
                bool head = hd < 26f;
                // 어깨/몸통: 아래로 갈수록 넓어지는 둥근 사다리꼴
                float top = 104f;
                float half = Mathf.Lerp(30f, 60f, Mathf.Clamp01((top - y) / 60f));
                bool torso = y < top && Mathf.Abs(dx) < half && (y > 8 || Mathf.Abs(dx) < half - (8 - y));
                bool neck = y >= 96 && y < 116 && Mathf.Abs(dx) < 11f;
                tex.SetPixel(x, y, head || torso || neck ? body : new Color(0, 0, 0, 0));
            }
        }
        tex.Apply();
        placeholderFigure = Sprite.Create(tex, new Rect(0, 0, w, h), new Vector2(0.5f, 0f));
        return placeholderFigure;
    }

    // 아래쪽이 어두운 세로 그라디언트: 인물의 아랫부분을 탁자 그림자로 덮어 자리에 앉은 느낌을 준다.
    static Sprite MakeVerticalGradientSprite()
    {
        const int n = 64;
        var tex = new Texture2D(1, n, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp };
        for (int y = 0; y < n; y++)
        {
            float t = 1f - (float)y / (n - 1); // y=0(아래) -> 1
            tex.SetPixel(0, y, new Color(0.04f, 0.03f, 0.03f, Mathf.SmoothStep(0f, 0.7f, t)));
        }
        tex.Apply();
        return Sprite.Create(tex, new Rect(0, 0, 1, n), new Vector2(0.5f, 0.5f));
    }

    static Sprite MakeVignetteSprite()
    {
        const int n = 128;
        var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp };
        for (int y = 0; y < n; y++)
        {
            for (int x = 0; x < n; x++)
            {
                float dx = (x + 0.5f) / n * 2f - 1f, dy = (y + 0.5f) / n * 2f - 1f;
                float d = Mathf.Sqrt(dx * dx + dy * dy) / 1.4142f;
                float a = Mathf.SmoothStep(0.25f, 1f, d);
                tex.SetPixel(x, y, new Color(0, 0, 0, a));
            }
        }
        tex.Apply();
        return Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(0.5f, 0.5f));
    }

    // ---- 포인터 이벤트 중계 ----
    class BubbleHover : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler, IPointerClickHandler
    {
        public SeatView owner; public int index;
        public void OnPointerEnter(PointerEventData e) { owner.BubbleEnter(index); }
        public void OnPointerExit(PointerEventData e) { owner.BubbleExit(index); }
        public void OnPointerClick(PointerEventData e) { owner.BubbleClick(index); }
    }

    class PopupClick : MonoBehaviour, IPointerClickHandler
    {
        public SeatView owner;
        public void OnPointerClick(PointerEventData e) { owner.PopupClicked(); }
    }
}
