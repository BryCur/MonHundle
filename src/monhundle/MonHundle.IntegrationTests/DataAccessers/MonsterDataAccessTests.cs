using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.domain.Entities;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class MonsterDataAccessTests(PostgresDatabaseFixture fixture) : DataAccessTestBase(fixture)
{
    [Fact]
    public async Task GetGuessableMonsterPoolFromGame_returns_the_monsters_tied_to_that_game()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        List<GuessableMonster> monsters = await dataAccess.GetGuessableMonsterPoolFromGame("MHWilds");

        monsters.Should().NotBeEmpty();
        monsters.Should().Contain(m => m.GetCode() == "arkveld");
        monsters.Should().NotContain(m => m.GetCode() == "zinogre");
    }

    [Fact]
    public async Task GetGuessableMonsterFromCode_returns_the_matching_monster()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        GuessableMonster monster = await dataAccess.GetGuessableMonsterFromCode("arkveld");

        monster.GetCode().Should().Be("arkveld");
    }

    [Fact]
    public async Task GetGuessableMonsterFromCode_throws_when_the_monster_does_not_exist()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        await Assert.ThrowsAsync<DataNotFoundException>(
            () => dataAccess.GetGuessableMonsterFromCode("not_a_real_monster"));
    }

    [Fact]
    public async Task GetGuessableMonsterFromId_returns_the_matching_monster()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();
        int monsterId = (await dataAccess.GetGuessableMonsterFromCode("arkveld")).GetId();

        GuessableMonster monster = await dataAccess.GetGuessableMonsterFromId(monsterId);

        monster.GetCode().Should().Be("arkveld");
    }

    [Fact]
    public async Task GetGuessableMonsterFromId_throws_when_the_monster_does_not_exist()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        await Assert.ThrowsAsync<DataNotFoundException>(
            () => dataAccess.GetGuessableMonsterFromId(-1));
    }

    [Fact]
    public async Task GetGuessableMonsterChoicesFromGames_filters_by_the_given_games()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        List<string> choices = await dataAccess.GetGuessableMonsterChoicesFromGames(["MHWilds"]);

        choices.Should().Contain("arkveld");
        choices.Should().NotContain("zinogre");
    }

    [Fact]
    public async Task GetGuessableMonsterChoicesFromGames_returns_every_game_when_no_game_is_specified()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        List<string> choices = await dataAccess.GetGuessableMonsterChoicesFromGames([]);

        choices.Should().Contain("arkveld"); // MHWilds
        choices.Should().Contain("zinogre"); // MHRise/Sunbreak
    }

    [Fact]
    public async Task GetDailyGuessableMonster_returns_the_monster_registered_for_that_date()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess monsterDataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();
        IDailyGameManagementDataAccess dailyDataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int monsterId = (await monsterDataAccess.GetGuessableMonsterFromCode("arkveld")).GetId();
        DateTime date = DateTime.UtcNow.Date;

        await dailyDataAccess.UpsertDailyGame(date, monsterId);
        GuessableMonster? dailyMonster = await monsterDataAccess.GetDailyGuessableMonster(date);

        dailyMonster.Should().NotBeNull();
        dailyMonster!.GetCode().Should().Be("arkveld");
    }

    [Fact]
    public async Task GetDailyGuessableMonster_returns_null_when_no_entry_exists_for_that_date()
    {
        using IServiceScope scope = Fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();
        
        GuessableMonster? dailyMonster = await dataAccess.GetDailyGuessableMonster(DateTime.UtcNow.Date.AddDays(-1));

        dailyMonster.Should().BeNull();
    }
}
