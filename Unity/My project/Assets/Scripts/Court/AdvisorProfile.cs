using System;
using System.Collections.Generic;
using UnityEngine;

// 대신 1명의 데이터. 대신은 4명이 끝이 아니므로(2026-09-19 사용자 지시) UI/연출 코드는 이 프로필 목록만 본다.
// 새 대신 = 프로필 에셋 1개 추가 + CourtRoster에 등록. 코드 수정 없음.
// 금지(§30): 역할을 장기/신체 부위와 매칭하지 않는다. 호감도·점수 수치는 프로필에 두지 않는다.
public enum SeatPose
{
    Idle,        // seated_idle_gaze - 왕을 응시하며 대기
    Speaking,    // 발언(약간 앞으로)
    TurnLeft,    // 다른 대신 쪽으로 몸을 돌림
    TurnRight,
    Thinking,
    SilentGaze,  // 왕의 정적 - 모두가 왕을 봄
}

[Serializable]
public struct SeatPoseSprite
{
    public SeatPose pose;
    public Sprite sprite;
}

[CreateAssetMenu(menuName = "KingWasMe/Advisor Profile", fileName = "Advisor_")]
public class AdvisorProfile : ScriptableObject
{
    [Tooltip("소문자 식별자. Ink 소개 변수 기본값 '<id>_introduced', 좌석 포즈 파일명 advisor_<id>_<pose>_v<N>.png의 연결 키.")]
    public string id;
    [Tooltip("Ink 대사 접두어와 같아야 한다(예: '세르안: ...').")]
    public string displayName;
    public string role;
    [Tooltip("회의 구성원이 아닌 방문자(사절 등). 소개 변수 대신 Ink `# enter: <id>` / `# exit: <id>` 태그로 등장/퇴장한다.")]
    public bool isGuest;
    [Tooltip("비워두면 '<id>_introduced'.")]
    public string introVar;
    public Color accent = new Color(0.8f, 0.8f, 0.8f);
    [Tooltip("카드용 초상(세로로 긴 그림은 런타임에 위쪽 정사각형만 잘라 쓴다).")]
    public Sprite portrait;
    [Tooltip("좌석 뷰용 포즈 스프라이트. 없는 포즈는 Idle → portrait 순으로 대체한다.")]
    public List<SeatPoseSprite> seatedPoses = new List<SeatPoseSprite>();

    public string IntroVar => string.IsNullOrEmpty(introVar) ? id + "_introduced" : introVar;

    public string AccentHex => "#" + ColorUtility.ToHtmlStringRGB(accent);

    public Sprite GetPose(SeatPose pose)
    {
        Sprite idle = null;
        foreach (var p in seatedPoses)
        {
            if (p.sprite == null) continue;
            if (p.pose == pose) return p.sprite;
            if (p.pose == SeatPose.Idle) idle = p.sprite;
        }
        return idle;
    }

    // 카드용: 세로로 긴 초상화의 위쪽 정사각형(머리~어깨). 읽기 가능 텍스처가 필요 없다(Sprite.Create는 픽셀을 읽지 않는다).
    Sprite cardSprite;
    public Sprite GetCardSprite()
    {
        if (cardSprite != null) return cardSprite;
        if (portrait == null) return null;
        var tex = portrait.texture;
        var r = portrait.textureRect;
        var side = Mathf.Min(r.width, r.height);
        cardSprite = Sprite.Create(tex, new Rect(r.x, r.y + r.height - side, side, side), new Vector2(0.5f, 0.5f));
        return cardSprite;
    }

    public static AdvisorProfile CreateRuntime(string id, string displayName, string role, string hexColor)
    {
        var p = CreateInstance<AdvisorProfile>();
        p.id = id;
        p.displayName = displayName;
        p.role = role;
        if (ColorUtility.TryParseHtmlString(hexColor, out var c)) p.accent = c;
        p.name = "Advisor_" + id;
        return p;
    }
}
