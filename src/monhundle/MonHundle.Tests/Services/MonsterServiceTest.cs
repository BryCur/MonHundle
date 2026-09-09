using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;

public class MonsterServiceTest
{
    private readonly Mock<IMonsterDataAccess> _dataAccess = new();
    private readonly NullLogger<MonsterService> _logger = new();

    private MonsterService BuildService() => new(_logger, _dataAccess.Object);

    private static GuessableMonster AnyMonster(int id = 1) => new(
        id,
        "monster_code",
        new MonsterCriteria(
            new CriteriaNumber(1),
            new CriteriaNumber(1),
            new CriteriaObject<Classifications>(Classifications.Amphibian),
            new CriteriaSet<Weaknesses>([]),
            new CriteriaSet<Diets>([]),
            new CriteriaSet<Afflictions>([]),
            new CriteriaSet<Habitats>([])));

    [Fact]
    public async Task getRandomMonster_returns_a_monster_from_the_pool()
    {
        GuessableMonster onlyOne = AnyMonster();
        _dataAccess.Setup(d => d.GetGuessableMonsterPoolFromGame(It.IsAny<string>()))
            .ReturnsAsync([onlyOne]);

        Assert.Same(onlyOne, await BuildService().getRandomMonster());
    }

    [Fact]
    public async Task getRandomMonster_throws_when_the_pool_is_null()
    {
        _dataAccess.Setup(d => d.GetGuessableMonsterPoolFromGame(It.IsAny<string>()))
            .ReturnsAsync((List<GuessableMonster>)null!);

        await Assert.ThrowsAsync<InvalidDataException>(() => BuildService().getRandomMonster());
    }

    [Fact]
    public async Task getRandomMonster_throws_when_the_pool_is_empty()
    {
        _dataAccess.Setup(d => d.GetGuessableMonsterPoolFromGame(It.IsAny<string>()))
            .ReturnsAsync([]);

        await Assert.ThrowsAsync<InvalidDataException>(() => BuildService().getRandomMonster());
    }

    [Fact]
    public async Task getDailyMonster_returns_the_monster_when_present()
    {
        GuessableMonster monster = AnyMonster();
        _dataAccess.Setup(d => d.GetDailyGuessableMonster(It.IsAny<DateTime>())).ReturnsAsync(monster);

        Assert.Same(monster, await BuildService().getDailyMonster(DateTime.UtcNow));
    }

    [Fact]
    public async Task getDailyMonster_throws_when_the_data_access_returns_null()
    {
        _dataAccess.Setup(d => d.GetDailyGuessableMonster(It.IsAny<DateTime>()))
            .ReturnsAsync((GuessableMonster?)null);

        await Assert.ThrowsAsync<InvalidDataException>(() => BuildService().getDailyMonster(DateTime.UtcNow));
    }

    [Fact]
    public async Task getMonsterFromId_returns_the_monster_when_present()
    {
        GuessableMonster monster = AnyMonster(7);
        _dataAccess.Setup(d => d.GetGuessableMonsterFromId(7)).ReturnsAsync(monster);

        Assert.Same(monster, await BuildService().getMonsterFromId(7));
    }

    [Fact]
    public async Task getMonsterFromId_throws_DataNotFound_when_the_monster_is_missing()
    {
        _dataAccess.Setup(d => d.GetGuessableMonsterFromId(It.IsAny<int>()))
            .ReturnsAsync((GuessableMonster)null!);

        await Assert.ThrowsAsync<DataNotFoundException>(() => BuildService().getMonsterFromId(99));
    }

    [Fact]
    public async Task getMonsterFromCode_passes_the_data_access_result_through()
    {
        GuessableMonster monster = AnyMonster();
        _dataAccess.Setup(d => d.GetGuessableMonsterFromCode("rathalos")).ReturnsAsync(monster);

        Assert.Same(monster, await BuildService().getMonsterFromCode("rathalos"));
    }

    [Fact]
    public async Task getMonsterChoicesFromGames_passes_the_data_access_result_through()
    {
        List<string> choices = ["rathalos", "nargacuga"];
        _dataAccess.Setup(d => d.GetGuessableMonsterChoicesFromGames(It.IsAny<string[]>())).ReturnsAsync(choices);

        Assert.Equal(choices, await BuildService().getMonsterChoicesFromGames(["MHWilds"]));
    }
}
