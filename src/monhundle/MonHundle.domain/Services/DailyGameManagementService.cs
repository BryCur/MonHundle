using Microsoft.Extensions.Logging;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class DailyGameManagementService(ILogger<DailyGameManagementService> _logger, 
    IDailyGameManagementDataAccess dailygameManagementDataAccess,
    IMonsterDataAccess monsterDataAccess) : IDailyGameManagementService
{
    public async Task<List<int>> GetLastDailyGameMonstersByDays(int days)
    {
        List<DailyMonsterData> LastDailyGame = await dailygameManagementDataAccess.GetLastDailyGamesByDays(days);
        
        return LastDailyGame
            .Select(dg => dg.MonsterId)
            .ToList();
    }

    public async Task<int> PickRandomMonsterWithBlacklist(List<int> monsterIdsBlacklist)
    {
        List<int> allMonsters = await monsterDataAccess.GetAllGuessableMonsterIds();
        List<int> eligibleMonsters = allMonsters.Except(monsterIdsBlacklist).ToList();
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
    public async Task InsertDailyGame(DateTime date, int monsterId)
    {
        _logger.LogInformation("Inserting daily game {date}, {mId}", date, monsterId);
        await dailygameManagementDataAccess.UpsertDailyGame(date, monsterId);
    }

    public async Task<DateTime> GetLastDailyGameDate()
    {
        return await dailygameManagementDataAccess.GetLastDailyGameDate();
    }
}