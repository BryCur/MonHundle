using MonHundle.domain.Entities.DAL;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IDailyGameManagementDataAccess
{
    void UpsertDailyGame(DateTime date, int monsterId);
    List<DailyMonsterData> GetLastDailyGamesByDays(int days);
    DateTime GetLastDailyGameDate();
}