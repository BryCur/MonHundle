using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class PlayerDataAccessTests(PostgresDatabaseFixture fixture) : DataAccessTestBase(fixture)
{
    [Fact]
    public async Task InsertPlayer_then_GetPlayer_returns_the_inserted_player()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IPlayerDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IPlayerDataAccess>();
        Guid playerUid = Guid.NewGuid();

        await dataAccess.InsertPlayer(new Player
        {
            PlayerUid = playerUid,
            JsonPreferences = new PlayerPreferencesStruct
            {
                enableTableAccessibility = true,
                gameList = ["MHWilds"]
            }
        });

        Player? stored = await dataAccess.GetPlayer(playerUid);

        stored.Should().NotBeNull();
        stored!.PlayerUid.Should().Be(playerUid);
        stored.JsonPreferences.Should().NotBeNull();
        stored.JsonPreferences!.Value.enableTableAccessibility.Should().BeTrue();
        stored.JsonPreferences.Value.gameList.Should().BeEquivalentTo(["MHWilds"]);
    }

    [Fact]
    public async Task GetPlayer_returns_null_when_the_player_does_not_exist()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IPlayerDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IPlayerDataAccess>();

        Player? result = await dataAccess.GetPlayer(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdatePlayer_is_immediately_reflected_by_a_fresh_GetPlayer_read()
    {
        Guid playerUid = Guid.NewGuid();
        int playerId;

        using (IServiceScope insertScope = Fixture.CreateScope())
        {
            IPlayerDataAccess dataAccess = insertScope.ServiceProvider.GetRequiredService<IPlayerDataAccess>();
            Player player = new()
            {
                PlayerUid = playerUid,
                JsonPreferences = new PlayerPreferencesStruct { enableTableAccessibility = false, gameList = [] }
            };
            await dataAccess.InsertPlayer(player);
            playerId = player.Id!.Value;

            await dataAccess.GetPlayer(playerUid); // primes the second-level cache entry for this guid
        }

        using (IServiceScope updateScope = Fixture.CreateScope())
        {
            IPlayerDataAccess dataAccess = updateScope.ServiceProvider.GetRequiredService<IPlayerDataAccess>();
            await dataAccess.UpdatePlayer(new Player
            {
                Id = playerId,
                PlayerUid = playerUid,
                JsonPreferences = new PlayerPreferencesStruct { enableTableAccessibility = true, gameList = ["MHRS"] }
            });
        }

        using (IServiceScope readScope = Fixture.CreateScope())
        {
            IPlayerDataAccess dataAccess = readScope.ServiceProvider.GetRequiredService<IPlayerDataAccess>();
            Player afterUpdate = (await dataAccess.GetPlayer(playerUid))!;

            afterUpdate.JsonPreferences!.Value.enableTableAccessibility.Should()
                .BeTrue("the second-level cache is auto-invalidated by SaveChanges, so this should reflect the update");
        }
    }
}
