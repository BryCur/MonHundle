using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class MonsterDataAccess(AppDbContext dbContext) : IMonsterDataAccess
{
    public List<GuessableMonster> GetGuessableMonsterPoolFromGame(String GameCode)
    {
        var guessableMonsterPool = dbContext.GuessableMonsters
            .Where(gm => gm.GamesList.Contains(GameCode))
            .ToList();
        
        return guessableMonsterPool.Select(m => GuessableMonster.FromData(m)).ToList();
    }
    
    public GuessableMonster GetGuessableMonsterFromCode(String MonsterCode)
    {
        var guessableMonsterData = dbContext.GuessableMonsters
            .First(gm => gm.MonsterCode.Contains(MonsterCode));
        
        return GuessableMonster.FromData(guessableMonsterData);
    }
    
}