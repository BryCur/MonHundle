using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities;
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
    
}