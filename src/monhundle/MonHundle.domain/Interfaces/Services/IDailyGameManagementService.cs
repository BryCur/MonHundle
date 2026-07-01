namespace MonHundle.domain.Interfaces.Services;

public interface IDailyGameManagementService
{
    Task<List<int>> GetLastDailyGameMonstersByDays(int days);
    Task<int> PickRandomMonsterWithBlacklist(List<int> monsterIdsBlacklist);
    Task InsertDailyGame(DateTime date, int monsterId);
    Task<DateTime> GetLastDailyGameDate();
}