using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class DailyGameManagementDataAccess(AppDbContext dbContext): IDailyGameManagementDataAccess
{
    public void UpsertDailyGame(DateTime date, int monsterId)
    {
        DailyMonsterData? toUpdate  = dbContext.DailyMonsters.FirstOrDefault(x => x.Date.Date == date.Date);

        if (toUpdate != null)
        {
            if (DailyGameHasSessions(date))
            {
                throw new ForbiddenOperationException($"Upsert daily game is forbidden: {date} already has sessions.");    
            } 
                
            dbContext.DailyMonsters.Update(toUpdate);
        }
        else
        {
            DailyMonsterData toInsert = new DailyMonsterData() { Date = date.Date, MonsterId = monsterId };
            dbContext.DailyMonsters.Add(toInsert);
        }
        
        dbContext.SaveChanges();
    }
    
    public List<DailyMonsterData> GetLastDailyGamesByDays(int days)
    {
        DateTime minDate = DateTime.Today.AddDays(-days);
        return dbContext.DailyMonsters
            .Where(dm => dm.Date.Date >= minDate.Date)
            .ToList();
    }

    public DateTime GetLastDailyGameDate()
    {
        return dbContext.DailyMonsters.Max(x => x.Date).Date;
    }
    
    private bool DailyGameHasSessions(DateTime date)
    {
        // checks whether the specified date for daily mode has any game session created.
        return dbContext.GameSessions.Any(gs => gs.StartTime.Date == date.Date && gs.GameMode == GameModes.Daily);
    }
}