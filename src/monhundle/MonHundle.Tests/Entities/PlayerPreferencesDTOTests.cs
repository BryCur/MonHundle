using System.Text.Json;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.Tests.Entities;

public class PlayerPreferencesDTOTests
{
    [Fact]
    public void FromStruct_returns_defaults_when_no_preferences_are_stored()
    {
        PlayerPreferencesDTO result = PlayerPreferencesDTO.FromStruct(null);

        Assert.False(result.tableVisualAid);
        Assert.Empty(result.gameList);
        Assert.Null(result.theme);
        Assert.Null(result.preferredLanguage);
    }

    [Fact]
    public void FromStruct_copies_the_stored_values()
    {
        PlayerPreferencesStruct stored = new()
        {
            version = PlayerPreferencesStruct.CurrentVersion,
            tableVisualAid = true,
            gameList = ["MHWilds", "MHW"],
            theme = "classic",
            preferredLanguage = "fr",
        };

        PlayerPreferencesDTO result = PlayerPreferencesDTO.FromStruct(stored);

        Assert.True(result.tableVisualAid);
        Assert.Equal(new[] { "MHWilds", "MHW" }, result.gameList);
        Assert.Equal("classic", result.theme);
        Assert.Equal("fr", result.preferredLanguage);
    }

    [Fact]
    public void FromStruct_leaves_theme_and_language_null_for_a_row_written_before_they_existed()
    {
        PlayerPreferencesStruct stored = new() { tableVisualAid = true, gameList = ["MHW"] };

        PlayerPreferencesDTO result = PlayerPreferencesDTO.FromStruct(stored);

        Assert.Null(result.theme);
        Assert.Null(result.preferredLanguage);
    }

    [Fact]
    public void FromStruct_defaults_a_missing_game_list_to_an_empty_array()
    {
        // a stored json without the gameList key deserializes to a null array
        PlayerPreferencesStruct stored =
            JsonSerializer.Deserialize<PlayerPreferencesStruct>("""{"enableTableAccessibility":true}""");

        PlayerPreferencesDTO result = PlayerPreferencesDTO.FromStruct(stored);

        Assert.NotNull(result.gameList);
        Assert.Empty(result.gameList);
    }
}
