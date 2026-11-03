using System.Text.Json;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.Tests.Entities;

public class PlayerPreferencesStructTests
{
    [Fact]
    public void FromBody_copies_the_provided_values()
    {
        UserPreferencesBody body = new(true, ["MHWilds", "MHW"]);

        PlayerPreferencesStruct result = PlayerPreferencesStruct.FromBody(body);

        Assert.True(result.tableVisualAid);
        Assert.Equal(new[] { "MHWilds", "MHW" }, result.gameList);
    }

    [Fact]
    public void FromBody_defaults_a_null_flag_to_false()
    {
        UserPreferencesBody body = new(null, []);

        PlayerPreferencesStruct result = PlayerPreferencesStruct.FromBody(body);

        Assert.False(result.tableVisualAid);
    }

    [Fact]
    public void FromBody_defaults_a_null_game_list_to_an_empty_array()
    {
        UserPreferencesBody body = new(false, null!);

        PlayerPreferencesStruct result = PlayerPreferencesStruct.FromBody(body);

        Assert.NotNull(result.gameList);
        Assert.Empty(result.gameList);
    }

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
