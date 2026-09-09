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

        Assert.True(result.enableTableAccessibility);
        Assert.Equal(new[] { "MHWilds", "MHW" }, result.gameList);
    }

    [Fact]
    public void FromBody_defaults_a_null_flag_to_false()
    {
        UserPreferencesBody body = new(null, []);

        PlayerPreferencesStruct result = PlayerPreferencesStruct.FromBody(body);

        Assert.False(result.enableTableAccessibility);
    }

    [Fact]
    public void FromBody_defaults_a_null_game_list_to_an_empty_array()
    {
        UserPreferencesBody body = new(false, null!);

        PlayerPreferencesStruct result = PlayerPreferencesStruct.FromBody(body);

        Assert.NotNull(result.gameList);
        Assert.Empty(result.gameList);
    }
}
