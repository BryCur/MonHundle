using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;

public class DailyGameManagementServiceTest
{
    private readonly Mock<IDailyGameManagementDataAccess> _dailyGameManagementDataAccess = new();
    private readonly Mock<IMonsterDataAccess> _monsterDataAccess = new();
    private readonly NullLogger<DailyGameManagementService> _logger = new();

    private DailyGameManagementService BuildService() =>
        new(_logger, _dailyGameManagementDataAccess.Object, _monsterDataAccess.Object);

    [Fact]
    public async Task PickRandomMonsterWithBlacklist_never_returns_a_blacklisted_monster()
    {
        _monsterDataAccess.Setup(m => m.GetAllGuessableMonsterIds()).ReturnsAsync([1, 2, 3, 4, 5]);
        List<int> blacklist = [1, 2, 3];
        int[] eligible = [4, 5];
        DailyGameManagementService service = BuildService();

        for (int i = 0; i < 100; i++)
        {
            int result = await service.PickRandomMonsterWithBlacklist(blacklist);
            Assert.DoesNotContain(result, blacklist);
            Assert.Contains(result, eligible);
        }
    }

    [Fact]
    public async Task PickRandomMonsterWithBlacklist_can_return_any_monster_when_the_blacklist_is_empty()
    {
        int[] allMonsters = [1, 2, 3];
        _monsterDataAccess.Setup(m => m.GetAllGuessableMonsterIds()).ReturnsAsync(allMonsters.ToList());

        int result = await BuildService().PickRandomMonsterWithBlacklist([]);

        Assert.Contains(result, allMonsters);
    }

    [Fact]
    public async Task PickRandomMonsterWithBlacklist_throws_when_every_monster_is_blacklisted()
    {
        _monsterDataAccess.Setup(m => m.GetAllGuessableMonsterIds()).ReturnsAsync([1, 2, 3]);

        await Assert.ThrowsAsync<ArgumentException>(
            () => BuildService().PickRandomMonsterWithBlacklist([1, 2, 3]));
    }
}
