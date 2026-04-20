using Microsoft.Extensions.Logging;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class DailyGameManagementService(ILogger<DailyGameManagementService> _logger, 
    IDailyGameManagementDataAccess dailygameManagementDataAccess,
    IMonsterDataAccess monsterDataAccess) : IDailyGameManagementService
{
    public List<int> GetLastDailyGameMonstersByDays(int days)
    {
        return dailygameManagementDataAccess.GetLastDailyGamesByDays(days)
            .Select(dg => dg.MonsterId)
            .ToList();
    }

    public int PickRandomMonsterWithBlacklist(List<int> monsterIdsBlacklist)
    {
        List<int> eligibleMonsters = monsterDataAccess.GetAllGuessableMonsterIds().Except(monsterIdsBlacklist).ToList();
        if (eligibleMonsters.Count < 1)
        {
            _logger.LogError("Tried to pick a random monster, but list was empty after blacklisted monsters exlusion. {blacklisted}", monsterIdsBlacklist);
            throw new ArgumentException($"No monster found after blacklisted {monsterIdsBlacklist.Count} monsters excluded.");
        }   
        
        return eligibleMonsters[new Random().Next(eligibleMonsters.Count)];
    }

    /**
     * Will perform an upsert for a daily game record. If a record for the
     * specified date exist then an update operation is issued. The update will
     * fail if game sessions for daily mode were already created for the specified
     * date with a ForbiddenOperationException. 
     */
    public void InsertDailyGame(DateTime date, int monsterId)
    {
        _logger.LogInformation("Inserting daily game {date}, {mId}", date, monsterId);
        dailygameManagementDataAccess.UpsertDailyGame(date, monsterId);
    }

    public DateTime GetLastDailyGameDate()
    {
        return dailygameManagementDataAccess.GetLastDailyGameDate();
    }
}