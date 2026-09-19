using UnityEngine;
using UnityEngine.UI;

// 현재 HUD(대신 카드 줄 + 텍스트 박스)로 단계를 표현하는 프레젠터.
// 좌석 뷰/Timeline 프레젠터가 생기면 이 클래스를 교체하거나 조합한다. 러너는 이 클래스를 몰라도 된다.
public class HudPhasePresenter : IPhasePresenter
{
    readonly GameHud hud;
    readonly Text storyText;
    readonly System.Action<bool> duckAudio;

    public HudPhasePresenter(GameHud hud, Text storyText, System.Action<bool> duckAudio = null)
    {
        this.hud = hud;
        this.storyText = storyText;
        this.duckAudio = duckAudio;
    }

    public void OnPhaseEnter(EventPhase phase, StoryBeat beat)
    {
        switch (phase)
        {
            case EventPhase.RoyalPause:
                hud.Highlight(null);
                hud.SetGaze(true);       // 의견 카드가 닫히고 모두가 정면을 본다, 가장자리가 어두워지고 시점이 다가간다
                duckAudio?.Invoke(true); // 소리도 낮아진다
                // 글자를 지우지 않고 톤만 낮춘다 - 예고 문구 없이 화면의 정적으로만 전달(§28.1).
                storyText.color = new Color(1f, 1f, 1f, 0.55f);
                break;
            case EventPhase.Choice:
                hud.Highlight(null);
                break;
        }
    }

    public void OnBeat(StoryBeat beat)
    {
        hud.Highlight(beat?.speaker);
    }

    public void OnPhaseExit(EventPhase phase)
    {
        if (phase == EventPhase.RoyalPause)
        {
            hud.SetGaze(false);
            duckAudio?.Invoke(false);
            storyText.color = Color.white;
        }
    }
}
