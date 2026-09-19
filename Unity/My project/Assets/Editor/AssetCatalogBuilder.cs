using System.IO;
using Ink.UnityIntegration;
using UnityEditor;
using UnityEngine;

// AssetCatalog 생성/보충. 비어 있는 슬롯만 채우고 수동 지정은 덮어쓰지 않는다.
// 파일은 이름으로 프로젝트 전체에서 찾으므로 AI_Generated 폴더 구조가 바뀌어도 다시 실행하면 된다.
public static class AssetCatalogBuilder
{
    const string Dir = "Assets/Resources";
    const string InkPath = "Assets/Resources/Ink/story_bible.ink";

    static readonly string[] BgFiles =
    {
        "act01_small_kingdom.png", "act02_many_neighbors.png", "act03_uncertain_borders.png",
        "act04_unneeded_war.png", "act05_world_continues.png",
    };

    [MenuItem("KingWasMe/Court/Build or Update Asset Catalog")]
    public static void Build()
    {
        Directory.CreateDirectory(Dir);
        var path = $"{Dir}/AssetCatalog.asset";
        var cat = AssetDatabase.LoadAssetAtPath<AssetCatalog>(path);
        if (cat == null)
        {
            cat = ScriptableObject.CreateInstance<AssetCatalog>();
            AssetDatabase.CreateAsset(cat, path);
        }

        if (cat.acts.Count == 0) cat.acts = AssetCatalog.DefaultActs();
        if (cat.story == null) cat.story = AssetDatabase.LoadAssetAtPath<InkFile>(InkPath);
        int missing = cat.story == null ? 1 : 0;

        for (int i = 0; i < cat.acts.Count; i++)
        {
            var a = cat.acts[i];
            var n = (i + 1).ToString("00");
            if (a.background == null && i < BgFiles.Length) a.background = Find<Sprite>(BgFiles[i], ref missing);
            if (a.music == null) a.music = Find<AudioClip>($"act{n}_music.mp3", ref missing);
            if (a.ambient == null) a.ambient = Find<AudioClip>($"act{n}_ambient.mp3", ref missing);
        }
        if (cat.serifFont == null) cat.serifFont = Find<Font>("NanumMyeongjo-Regular.ttf", ref missing);
        if (cat.sansFont == null) cat.sansFont = Find<Font>("NanumGothic-Regular.ttf", ref missing);
        if (cat.uiClick == null) cat.uiClick = Find<AudioClip>("ui_click.mp3", ref missing);
        if (cat.uiChoice == null) cat.uiChoice = Find<AudioClip>("ui_choice.mp3", ref missing);

        EditorUtility.SetDirty(cat);
        AssetDatabase.SaveAssets();
        Debug.Log($"[AssetCatalog] 갱신 완료: {path} (찾지 못한 항목 {missing}개)");
    }

    static T Find<T>(string fileName, ref int missing) where T : Object
    {
        var stem = Path.GetFileNameWithoutExtension(fileName);
        foreach (var guid in AssetDatabase.FindAssets(stem))
        {
            var p = AssetDatabase.GUIDToAssetPath(guid);
            if (Path.GetFileName(p) != fileName) continue;
            foreach (var o in AssetDatabase.LoadAllAssetsAtPath(p))
            {
                if (o is T t) return t;
            }
        }
        Debug.LogWarning($"[AssetCatalog] 파일을 찾지 못했습니다: {fileName}");
        missing++;
        return null;
    }
}
