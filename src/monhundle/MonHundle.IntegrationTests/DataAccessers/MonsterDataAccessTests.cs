using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.domain.Entities;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class MonsterDataAccessTests(PostgresDatabaseFixture fixture)
{
    [Fact]
    public async Task GetGuessableMonsterPoolFromGame_returns_the_monsters_tied_to_that_game()
    {
        using IServiceScope scope = fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        List<GuessableMonster> monsters = await dataAccess.GetGuessableMonsterPoolFromGame("MHWilds");

        monsters.Should().NotBeEmpty();
        monsters.Should().Contain(m => m.GetCode() == "arkveld");
    }

    [Fact]
    public async Task GetGuessableMonsterFromCode_returns_the_matching_monster()
    {
        using IServiceScope scope = fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        GuessableMonster monster = await dataAccess.GetGuessableMonsterFromCode("arkveld");

        monster.GetCode().Should().Be("arkveld");
    }

    [Fact]
    public async Task GetGuessableMonsterFromCode_throws_when_the_monster_does_not_exist()
    {
        using IServiceScope scope = fixture.CreateScope();
        IMonsterDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IMonsterDataAccess>();

        await Assert.ThrowsAsync<DataNotFoundException>(
            () => dataAccess.GetGuessableMonsterFromCode("not_a_real_monster"));
    }
}
