using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class GameTitleDataAccessTests(PostgresDatabaseFixture fixture)
{
    [Fact]
    public async Task GetGameTitles_returns_the_seeded_game_codes()
    {
        using IServiceScope scope = fixture.CreateScope();
        IGameTitleDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IGameTitleDataAccess>();

        List<string> titles = await dataAccess.GetGameTitles();

        // 01_games.sql seeds 14 non-commented-out international releases.
        titles.Should().HaveCount(14);
        titles.Should().Contain(["MHWilds", "MHR", "MHRS", "MHWorld"]);
    }
}
