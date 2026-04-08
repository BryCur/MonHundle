using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class MonsterDataAccess(AppDbContext dbContext) : IMonsterDataAccess
{
    public List<GuessableMonster> GetGuessableMonsterPoolFromGame(String GameCode)
    {
        var guessableMonsterPool = dbContext.GuessableMonsters
            .ToList()
            .Where(gm => gm.GamesList.Contains(GameCode))
            ;
        
        return guessableMonsterPool.Select(m => GuessableMonster.FromData(m)).ToList();
    }
    
    public GuessableMonster GetGuessableMonsterFromCode(String monsterCode)
    {
        var guessableMonsterData = dbContext.GuessableMonsters
            .First(gm => gm.MonsterCode.Equals(monsterCode));
        
        return GuessableMonster.FromData(guessableMonsterData);
    }
    
    public GuessableMonster? GetGuessableMonsterFromId(int monsterId)
    {
        var guessableMonsterData = dbContext.GuessableMonsters
            .First(gm => gm.MonsterId.Equals(monsterId));
        
        return GuessableMonster.FromData(guessableMonsterData);
    }

    public List<String> GetGuessableMonsterChoicesFromGames(String[] GameCodes)
    {
        Boolean getAllMonsters = GameCodes.Length < 1;
        
        var guessableMonsterPool = dbContext.GuessableMonsters
                .ToList()
                .Where(gm => getAllMonsters || gm.GamesList.Any( g => GameCodes.Contains(g)))
                .Select(monster => monster.MonsterCode)
            ;
        return guessableMonsterPool.ToList();
    }

    public GuessableMonster? GetDailyGuessableMonster(DateTime date)
    {
        DateTime justDate = date.Date;
        GuessableMonsterData? monster = dbContext.Set<DailyMonsterData>()
            .Include(dm => dm.monsterData)
            .Where(dm => dm.Date == justDate)
            .Select(dm=> dm.monsterData)
            .FirstOrDefault();
        
        return monster == null ? null: GuessableMonster.FromData(monster);
    }
}