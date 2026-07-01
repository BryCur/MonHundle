using MonHundle.domain.Entities.DAL;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IDailyGameManagementDataAccess
{
    Task UpsertDailyGame(DateTime date, int monsterId);
    Task<List<DailyMonsterData>> GetLastDailyGamesByDays(int days);
    Task<DateTime> GetLastDailyGameDate();
}