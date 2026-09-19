using System.Collections.Generic;
using UnityEngine;

// 회의에 나올 수 있는 대신 전체 명단(등록 순서 = 좌석/카드 표시 순서). UI는 이 명단 중 "소개된" 대신만 그린다.
[CreateAssetMenu(menuName = "KingWasMe/Court Roster", fileName = "CourtRoster")]
public class CourtRoster : ScriptableObject
{
    public const string ResourcePath = "Court/CourtRoster";

    public List<AdvisorProfile> advisors = new List<AdvisorProfile>();
    [Tooltip("방문자(사절 등). 좌석 중앙에 서서 대화에 참여한다.")]
    public List<AdvisorProfile> guests = new List<AdvisorProfile>();

    public AdvisorProfile FindBySpeaker(string speaker)
    {
        if (string.IsNullOrEmpty(speaker)) return null;
        foreach (var a in advisors)
        {
            if (a != null && a.displayName == speaker) return a;
        }
        foreach (var g in guests)
        {
            if (g != null && g.displayName == speaker) return g;
        }
        return null;
    }

    // 에셋이 없어도 게임이 뜨도록 하는 코드 내 기본 명단(초기 4인). 에셋(Resources/Court/CourtRoster)이 있으면 그것이 우선한다.
    public static CourtRoster Load()
    {
        var asset = Resources.Load<CourtRoster>(ResourcePath);
        if (asset != null && asset.advisors.Count > 0)
        {
            if (asset.guests.Count == 0) asset.guests.Add(DefaultGuest()); // 구버전 에셋 보정(에디터에서 빌더를 다시 돌리면 에셋으로 저장됨)
            return asset;
        }

        var roster = CreateInstance<CourtRoster>();
        roster.name = "CourtRoster(Default)";
        roster.advisors.Add(AdvisorProfile.CreateRuntime("seran", "세르안", "재상", "#7FB3FF"));
        roster.advisors.Add(AdvisorProfile.CreateRuntime("valen", "발렌", "원수", "#FF8A65"));
        roster.advisors.Add(AdvisorProfile.CreateRuntime("rian", "리안", "외교관", "#66D9A6"));
        roster.advisors.Add(AdvisorProfile.CreateRuntime("karden", "카르덴", "수호관", "#D9A566"));
        roster.guests.Add(DefaultGuest());
        return roster;
    }

    // 사절: 국가 문화를 확정하지 않는 중립 색. 실제 그림은 Codex 에셋이 오면 프로필의 포즈에 연결한다(그 전에는 임시 실루엣).
    static AdvisorProfile DefaultGuest()
    {
        var g = AdvisorProfile.CreateRuntime("east_envoy", "동부 사절", "", "#CFC3A2");
        g.isGuest = true;
        return g;
    }
}
