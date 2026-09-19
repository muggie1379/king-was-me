using UnityEditor;
using UnityEngine;

// Play 진입 시 도메인 리로드를 끈다. MCP Unity 브리지 서버가 도메인 리로드 때마다 포트 충돌("Port 8095 is already in use")로 죽어
// 검증(캡처/자동 진행)이 자주 끊겼다. 런타임 코드는 정적 상태에 의존하지 않는다(UiFonts/플레이스홀더는 null 검사로 재생성 가능).
// 되돌리려면 Project Settings > Editor > Enter Play Mode Settings 에서 Reload Domain 을 다시 켠다.
[InitializeOnLoad]
public static class PlayModeSettings
{
    static PlayModeSettings()
    {
        const EnterPlayModeOptions wanted = EnterPlayModeOptions.DisableDomainReload | EnterPlayModeOptions.DisableSceneReload;
        if (!EditorSettings.enterPlayModeOptionsEnabled || EditorSettings.enterPlayModeOptions != wanted)
        {
            EditorSettings.enterPlayModeOptionsEnabled = true;
            EditorSettings.enterPlayModeOptions = wanted;
            Debug.Log("[PlayModeSettings] Enter Play Mode Options: 도메인/씬 리로드 비활성화");
        }
    }
}
