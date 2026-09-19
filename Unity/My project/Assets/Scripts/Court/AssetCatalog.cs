using System;
using System.Collections.Generic;
using Ink.UnityIntegration;
using UnityEngine;

// 런타임이 쓰는 에셋 참조 모음. 파일명/AssetDatabase 경로 대신 직렬화된 참조를 쓰므로
// (1) 빌드에 포함되고 (2) Codex가 AI_Generated 폴더를 재구성해도 GUID로 연결이 유지된다.
// 생성/갱신: 메뉴 KingWasMe/Court/Build or Update Asset Catalog (Editor/AssetCatalogBuilder.cs).
[Serializable]
public class ActAssets
{
    public string label;
    public int minEvent, maxEvent;
    [Tooltip("배경 그림 위에 얹는 무드 틴트(알파는 코드가 0.45로 고정). 색으로 감정을 확정하지 않는다(§30 5/6).")]
    public Color tint = Color.black;
    [Tooltip("AI 오디오가 없을 때 쓰는 절차적 드론 주파수(Hz).")]
    public float droneHz = 220f;
    public Sprite background;
    public AudioClip music;
    public AudioClip ambient;
}

[CreateAssetMenu(menuName = "KingWasMe/Asset Catalog", fileName = "AssetCatalog")]
public class AssetCatalog : ScriptableObject
{
    public const string ResourcePath = "AssetCatalog";

    [Tooltip("컴파일된 Ink 스토리(InkFile.storyJson은 직렬화되어 빌드에 포함된다).")]
    public InkFile story;
    public List<ActAssets> acts = new List<ActAssets>();
    [Tooltip("배포용 세리프 한글 폰트(대사/제목). 비워두면 OS 폰트(임시).")]
    public Font serifFont;
    [Tooltip("배포용 산세리프 한글 폰트(라벨/기록). 비워두면 OS 폰트(임시).")]
    public Font sansFont;
    public AudioClip uiClick;
    public AudioClip uiChoice;

    public int ActIndexOf(int eventNum)
    {
        for (int i = 0; i < acts.Count; i++)
        {
            if (eventNum >= acts[i].minEvent && eventNum <= acts[i].maxEvent) return i;
        }
        return acts.Count - 1;
    }

    // ACT 구간은 04_story_bible.md §6~§10(Event 번호 기준). 톤은 미묘하게만 바뀐다.
    public static List<ActAssets> DefaultActs()
    {
        return new List<ActAssets>
        {
            new ActAssets { label = "ACT I 작은 왕국",       minEvent = 1,  maxEvent = 3,  tint = new Color(0.10f, 0.09f, 0.07f), droneHz = 220.00f },
            new ActAssets { label = "ACT II 여러 이웃",      minEvent = 4,  maxEvent = 10, tint = new Color(0.07f, 0.09f, 0.13f), droneHz = 246.94f },
            new ActAssets { label = "ACT III 흔들리는 국경", minEvent = 11, maxEvent = 17, tint = new Color(0.12f, 0.08f, 0.07f), droneHz = 196.00f },
            new ActAssets { label = "ACT IV 필요 없었던 전쟁", minEvent = 18, maxEvent = 25, tint = new Color(0.05f, 0.05f, 0.07f), droneHz = 174.61f },
            new ActAssets { label = "ACT V 나라를 지키는 법", minEvent = 26, maxEvent = 99, tint = new Color(0.10f, 0.09f, 0.06f), droneHz = 233.08f },
        };
    }

    // 카탈로그 에셋이 없어도(빌더 미실행) 색/절차적 오디오만으로 게임이 뜬다.
    public static AssetCatalog Load()
    {
        var asset = Resources.Load<AssetCatalog>(ResourcePath);
        if (asset != null && asset.acts.Count > 0) return asset;

        Debug.LogWarning("[AssetCatalog] Resources/AssetCatalog 에셋이 없어 기본값(그림/음악 없음)으로 시작합니다. 메뉴 KingWasMe/Court/Build or Update Asset Catalog 를 실행하세요.");
        var c = CreateInstance<AssetCatalog>();
        c.name = "AssetCatalog(Default)";
        c.acts = DefaultActs();
        return c;
    }
}
