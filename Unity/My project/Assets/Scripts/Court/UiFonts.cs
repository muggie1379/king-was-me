using UnityEngine;

// UI 폰트 두 종: 본문/대사용 세리프, 라벨/기록용 산세리프.
// 우선순위: AssetCatalog에 지정한 폰트(빌드 포함, 배포용) -> OS 폰트(Windows 임시 미리보기 전용) -> 내장 폰트.
// OS 폰트(바탕/맑은 고딕)는 재배포 라이선스가 없고 다른 OS에는 없으므로 출시용이 아니다. 배포용은 OFL 등 상업 이용 가능한 한글 폰트를 프로젝트에 넣고 카탈로그에 연결한다.
public static class UiFonts
{
    public static Font Serif { get; private set; }
    public static Font Sans { get; private set; }

    public static void Init(AssetCatalog catalog)
    {
        var builtin = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        Serif = catalog.serifFont != null ? catalog.serifFont : OsFont(new[] { "Batang", "Malgun Gothic" }) ?? builtin;
        Sans = catalog.sansFont != null ? catalog.sansFont : OsFont(new[] { "Malgun Gothic" }) ?? builtin;
    }

    static Font OsFont(string[] names)
    {
        try
        {
            var f = Font.CreateDynamicFontFromOSFont(names, 32);
            return f;
        }
        catch (System.Exception)
        {
            return null;
        }
    }
}
