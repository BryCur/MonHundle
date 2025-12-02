
using Microsoft.Extensions.Logging;
using MonHundle.domain.Entities;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class MonsterService(ILogger<MonsterService> logger, IMonsterDataAccess monsterDataAccess) : IMonsterService
{
    public GuessableMonster getRandomMonster()
    {
        String forcedGame = "MHWilds"; // until more games are ready
        var monsterList = monsterDataAccess.GetGuessableMonsterPoolFromGame(forcedGame);

        if (monsterList is null || monsterList.Count < 1)
        {
            logger.LogError("Failed to get monster list for game {gameList}", forcedGame);
            throw new InvalidDataException("No monster available");
        }
        
        var random = new Random();
        return monsterList[random.Next(monsterList.Count)];

    }

    public GuessableMonster? getMonsterFromCode(string code)
    {
        return monsterDataAccess.GetGuessableMonsterFromCode(code);
    }
    
    public GuessableMonster getMonsterFromId(int id)
    {
        return monsterDataAccess.GetGuessableMonsterFromId(id) ?? throw new DataNotFoundException($"Could not find monster with id {id}");
    }

    public List<String> getMonsterChoicesFromGames(string[] gameTitles)
    {
        return monsterDataAccess.GetGuessableMonsterChoicesFromGames(gameTitles);
    }
}