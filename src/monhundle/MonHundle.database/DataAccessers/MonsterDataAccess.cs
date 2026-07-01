using EFCoreSecondLevelCacheInterceptor;
using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class MonsterDataAccess(AppDbContext dbContext) : IMonsterDataAccess
{
    public async Task<List<GuessableMonster>> GetGuessableMonsterPoolFromGame(String GameCode)
    {
        return await dbContext.GuessableMonsters
            .Where(gm => gm.GamesList.Contains(GameCode))
            .Select(m => GuessableMonster.FromData(m))
            .Cacheable(CacheExpirationMode.Absolute,  TimeSpan.FromHours(1))
            .ToListAsync()
            ;
    }
    
    public async Task<GuessableMonster> GetGuessableMonsterFromCode(String monsterCode)
    {
        var guessableMonsterData = await dbContext.GuessableMonsters
            .Where(gm => gm.MonsterCode.Equals(monsterCode))
            .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromHours(1))
            .FirstAsync();
        
        return GuessableMonster.FromData(guessableMonsterData);
    }
    
    public async Task<GuessableMonster?> GetGuessableMonsterFromId(int monsterId)
    {
        var guessableMonsterData = await dbContext.GuessableMonsters
            .Where(gm => gm.MonsterId.Equals(monsterId))
            .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromHours(1))
            .FirstAsync();
        
        return GuessableMonster.FromData(guessableMonsterData);
    }

    public async Task<List<String>> GetGuessableMonsterChoicesFromGames(String[] GameCodes)
    {
        Boolean getAllMonsters = GameCodes.Length < 1;
        
        return await dbContext.GuessableMonsters
                .Where(gm => getAllMonsters || gm.GamesList.Any( g => GameCodes.Contains(g)))
                .Select(monster => monster.MonsterCode)
                .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromHours(1))
                .ToListAsync()
            ;
    }

    public async Task<GuessableMonster?> GetDailyGuessableMonster(DateTime date)
    {
        DateTime justDate = date.Date;
        GuessableMonsterData? monster = await dbContext.Set<DailyMonsterData>()
            .Include(dm => dm.monsterData)
            .Where(dm => dm.Date == justDate)
            .Select(dm=> dm.monsterData)
            .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromHours(1))
            .FirstOrDefaultAsync();
        
        return monster == null ? null: GuessableMonster.FromData(monster);
    }

    public async Task<List<int>> GetAllGuessableMonsterIds()
    {
        return await dbContext.GuessableMonsters
            .Select(m => m.MonsterId)
            .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromHours(1))
            .ToListAsync();
    }
}