using System.IO;
using UnityEditor;
using UnityEngine;

// 대신 명단 에셋 생성/보충 도구. 이미 있는 에셋은 덮어쓰지 않고, 비어 있는 초상만 채운다(수동 편집 보존).
// 초상은 스프라이트 참조로 직렬화되므로 Codex가 AI_Generated 폴더를 옮겨도(GUID 유지) 연결이 깨지지 않는다.
public static class CourtRosterBuilder
{
    const string Dir = "Assets/Resources/Court";

    struct Seed
    {
        public string id, name, role, hex, portraitFile;
    }

    static readonly Seed[] Seeds =
    {
        new Seed { id = "seran", name = "세르안", role = "재상", hex = "#7FB3FF", portraitFile = "advisor_seran_v2.png" },
        new Seed { id = "valen", name = "발렌", role = "원수", hex = "#FF8A65", portraitFile = "advisor_valen_v2.png" },
        new Seed { id = "rian", name = "리안", role = "외교관", hex = "#66D9A6", portraitFile = "advisor_rian_v2.png" },
        new Seed { id = "karden", name = "카르덴", role = "수호관", hex = "#D9A566", portraitFile = "advisor_karden_v3.png" },
    };

    [MenuItem("KingWasMe/Court/Build or Update Roster Assets")]
    public static void Build()
    {
        Directory.CreateDirectory(Dir);
        var rosterPath = $"{Dir}/CourtRoster.asset";
        var roster = AssetDatabase.LoadAssetAtPath<CourtRoster>(rosterPath);
        if (roster == null)
        {
            roster = ScriptableObject.CreateInstance<CourtRoster>();
            AssetDatabase.CreateAsset(roster, rosterPath);
        }

        foreach (var seed in Seeds)
        {
            var path = $"{Dir}/Advisor_{seed.id}.asset";
            var profile = AssetDatabase.LoadAssetAtPath<AdvisorProfile>(path);
            if (profile == null)
            {
                profile = ScriptableObject.CreateInstance<AdvisorProfile>();
                profile.id = seed.id;
                profile.displayName = seed.name;
                profile.role = seed.role;
                ColorUtility.TryParseHtmlString(seed.hex, out profile.accent);
                AssetDatabase.CreateAsset(profile, path);
            }
            if (profile.portrait == null) profile.portrait = FindPortrait(seed.portraitFile);
            EditorUtility.SetDirty(profile);
            if (!roster.advisors.Contains(profile)) roster.advisors.Add(profile);
        }

        // 방문자(사절): 소개 변수 없이 태그로 등장한다. 그림이 없으면 임시 실루엣.
        var guestPath = $"{Dir}/Guest_east_envoy.asset";
        var guest = AssetDatabase.LoadAssetAtPath<AdvisorProfile>(guestPath);
        if (guest == null)
        {
            guest = ScriptableObject.CreateInstance<AdvisorProfile>();
            guest.id = "east_envoy";
            guest.displayName = "동부 사절";
            guest.isGuest = true;
            ColorUtility.TryParseHtmlString("#CFC3A2", out guest.accent);
            AssetDatabase.CreateAsset(guest, guestPath);
        }
        EditorUtility.SetDirty(guest);
        if (!roster.guests.Contains(guest)) roster.guests.Add(guest);

        EditorUtility.SetDirty(roster);
        AssetDatabase.SaveAssets();
        Debug.Log($"[CourtRoster] {roster.advisors.Count}명 등록: {rosterPath}");
    }

    // 파일명으로 프로젝트 어디서든 찾는다(폴더 이동에 견딤).
    static Sprite FindPortrait(string fileName)
    {
        var stem = Path.GetFileNameWithoutExtension(fileName);
        foreach (var guid in AssetDatabase.FindAssets(stem + " t:Texture2D"))
        {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            if (Path.GetFileName(path) != fileName) continue;
            foreach (var o in AssetDatabase.LoadAllAssetsAtPath(path))
            {
                if (o is Sprite sp) return sp;
            }
        }
        Debug.LogWarning($"[CourtRoster] 초상 파일을 찾지 못했습니다: {fileName}");
        return null;
    }
}
