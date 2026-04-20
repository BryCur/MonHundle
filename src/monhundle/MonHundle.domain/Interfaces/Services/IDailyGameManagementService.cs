namespace MonHundle.domain.Interfaces.Services;

public interface IDailyGameManagementService
{
    List<int> GetLastDailyGameMonstersByDays(int days);
    int PickRandomMonsterWithBlacklist(List<int> monsterIdsBlacklist);
    void InsertDailyGame(DateTime date, int monsterId);
    DateTime GetLastDailyGameDate();
}