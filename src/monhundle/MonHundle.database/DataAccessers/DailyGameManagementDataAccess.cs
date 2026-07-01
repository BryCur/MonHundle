using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class DailyGameManagementDataAccess(AppDbContext dbContext): IDailyGameManagementDataAccess
{
    public async Task UpsertDailyGame(DateTime date, int monsterId)
    {
        DailyMonsterData? toUpdate  = dbContext.DailyMonsters.FirstOrDefault(x => x.Date.Date == date.Date);

        if (toUpdate != null)
        {
            if (await DailyGameHasSessions(date))
            {
                throw new ForbiddenOperationException($"Upsert daily game is forbidden: {date} already has sessions.");    
            } 
            
            toUpdate.MonsterId = monsterId;
            dbContext.DailyMonsters.Update(toUpdate);
        }
        else
        {
            DailyMonsterData toInsert = new DailyMonsterData() { Date = date.Date, MonsterId = monsterId };
            dbContext.DailyMonsters.Add(toInsert);
        }
        
        await dbContext.SaveChangesAsync();
    }
    
    public async Task<List<DailyMonsterData>> GetLastDailyGamesByDays(int days)
    {
        DateTime minDate = DateTime.Today.AddDays(-days);
        return await dbContext.DailyMonsters
            .Where(dm => dm.Date.Date >= minDate.Date)
            .ToListAsync();
    }

    public async Task<DateTime> GetLastDailyGameDate()
    {
        DateTime lastDailyGamedate = await dbContext.DailyMonsters.MaxAsync(x => x.Date);
        return lastDailyGamedate.Date;
    }
    
    private async Task<bool> DailyGameHasSessions(DateTime date)
    {
        // checks whether the specified date for daily mode has any game session created.
        return await dbContext.GameSessions.AnyAsync(gs => gs.StartTime.Date == date.Date && gs.GameMode == GameModes.Daily);
    }
}