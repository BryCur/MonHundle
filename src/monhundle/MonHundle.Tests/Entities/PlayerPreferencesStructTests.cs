using System.Text.Json;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.Tests.Entities;

public class PlayerPreferencesStructTests
{
    // AppDbContext (de)serializes the preferences column with JsonSerializerOptions.Default
    [Fact]
    public void Deserialize_reads_a_row_written_before_versioning()
    {
        const string storedJson = """{"enableTableAccessibility":true,"gameList":["MHW"]}""";

        PlayerPreferencesStruct result =
            JsonSerializer.Deserialize<PlayerPreferencesStruct>(storedJson, JsonSerializerOptions.Default);

        Assert.True(result.tableVisualAid);
        Assert.Equal(new[] { "MHW" }, result.gameList);
        Assert.Equal(0, result.version);
        Assert.Null(result.theme);
        Assert.Null(result.preferredLanguage);
    }

    [Fact]
    public void Serialize_keeps_the_original_json_key_for_the_visual_aid_flag()
    {
        PlayerPreferencesStruct preferences = new() { tableVisualAid = true, gameList = [] };

        string json = JsonSerializer.Serialize(preferences, JsonSerializerOptions.Default);

        Assert.Contains("\"enableTableAccessibility\":true", json);
        Assert.DoesNotContain("tableVisualAid", json);
    }
}
