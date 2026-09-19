using System.Collections.Generic;
using System.Text.RegularExpressions;

// 사건 재생 단계. 사건은 "텍스트 덩어리"가 아니라 단계의 나열로 재생된다(2026-09-19 확정, next-priorities-proposal 1단계).
// 각 단계의 "보여주는 방식"은 프레젠터(IPhasePresenter)가 맡는다 -> Timeline/Animator/좌석 뷰를 러너 수정 없이 붙일 수 있다.
public enum EventPhase
{
    Narration,      // 상황 서술(사건 제목/사실)
    AdvisorSummary, // 대신들의 의견(대신별 한 줄)
    CourtExchange,  // 대신 간 짧은 논쟁
    RoyalPause,     // 왕의 정적: 모든 대신이 왕을 본다. 시간 대기가 아니라 연출 비트(화면·소리·입력 상태 포함).
    Choice,         // 선택지
    Aftermath,      // 결과(관찰된 것만)
    Chronicle,      // 왕실 기록
}

// Ink 한 줄 + 그 줄에 붙은 태그.
// 태그 형식(추가 전용, 없으면 추론): `# phase: advisors|exchange|pause|aftermath|narration`, `# endphase`(이 줄에서 phase 종료), `# to: <id>`(청자), `# stance: question|clarify|counter|support|pause`(발화의 행동 종류, 연출용·수치 아님), `# pause: 1.5`.
// 태그가 없는 기존 Ink도 그대로 동작한다: 화자 접두어가 있으면 AdvisorSummary, 없으면 Narration, 선택 직전엔 RoyalPause가 자동 삽입된다.
public class StoryBeat
{
    public string text;
    public string speaker;
    public EventPhase phase;
    public Dictionary<string, string> tags = new Dictionary<string, string>();

    public bool TryGetFloat(string key, out float value)
    {
        value = 0f;
        return tags.TryGetValue(key, out var s) && float.TryParse(s, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out value);
    }
}

public static class BeatParser
{
    static readonly Regex SpeakerLine = new Regex(@"^([가-힣A-Za-z][가-힣A-Za-z ]{0,10}):\s*(.*)$");

    public static string SpeakerOf(string line)
    {
        var m = SpeakerLine.Match(line);
        return m.Success ? m.Groups[1].Value : null;
    }

    // stickyPhase: 명시된 phase 태그는 다음 phase 태그가 나올 때까지 유지된다(사건 경계에서 러너가 리셋).
    public static StoryBeat Parse(string line, IList<string> inkTags, ref EventPhase? stickyPhase)
    {
        var beat = new StoryBeat { text = line, speaker = SpeakerOf(line) };
        if (inkTags != null)
        {
            foreach (var raw in inkTags)
            {
                var i = raw.IndexOf(':');
                if (i <= 0) { beat.tags[raw.Trim().ToLowerInvariant()] = ""; continue; }
                beat.tags[raw.Substring(0, i).Trim().ToLowerInvariant()] = raw.Substring(i + 1).Trim();
            }
        }

        if (beat.tags.TryGetValue("phase", out var p) && TryParsePhase(p, out var explicitPhase))
        {
            stickyPhase = explicitPhase;
        }
        beat.phase = stickyPhase ?? (beat.speaker != null ? EventPhase.AdvisorSummary : EventPhase.Narration);
        if (beat.tags.ContainsKey("endphase")) stickyPhase = null; // 이 줄까지가 해당 단계(다음 줄부터는 추론으로 복귀)
        return beat;
    }

    public static bool TryParsePhase(string s, out EventPhase phase)
    {
        switch (s.Trim().ToLowerInvariant())
        {
            case "narration": case "dialogue": phase = EventPhase.Narration; return true;
            case "advisors": case "summary": phase = EventPhase.AdvisorSummary; return true;
            case "exchange": phase = EventPhase.CourtExchange; return true;
            case "pause": phase = EventPhase.RoyalPause; return true;
            case "aftermath": phase = EventPhase.Aftermath; return true;
            default: phase = EventPhase.Narration; return false;
        }
    }
}

// 단계별 "보여주기" 훅. 러너(StoryController)는 상태만 관리하고, 시각/음향 표현은 구현체가 정한다.
public interface IPhasePresenter
{
    // 단계가 바뀔 때 1회. beat는 그 단계의 첫 비트(RoyalPause/Choice에서는 null일 수 있다).
    void OnPhaseEnter(EventPhase phase, StoryBeat beat);
    // 비트(한 줄)가 화면에 나올 때.
    void OnBeat(StoryBeat beat);
    // 단계가 끝날 때(다음 단계 진입 직전 또는 선택 확정).
    void OnPhaseExit(EventPhase phase);
}
