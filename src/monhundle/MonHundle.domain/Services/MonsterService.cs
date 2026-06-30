
using Microsoft.Extensions.Logging;
using MonHundle.domain.Entities;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class MonsterService(ILogger<MonsterService> logger, IMonsterDataAccess monsterDataAccess) : IMonsterService
{
    public async Task<GuessableMonster> getRandomMonster()
    {
        String forcedGame = "MHWilds"; // until more games are ready
        var monsterList = await monsterDataAccess.GetGuessableMonsterPoolFromGame(forcedGame);

        if (monsterList is null || monsterList.Count < 1)
        {
            logger.LogError("Failed to get monster list for game {gameList}", forcedGame);
            throw new InvalidDataException("No monster available");
        }
        
        var random = new Random();
        return monsterList[random.Next(monsterList.Count)];

    }

    public async Task<GuessableMonster> getDailyMonster(DateTime date)
    {
        GuessableMonster monsterForDate = await monsterDataAccess.GetDailyGuessableMonster(date);

        if (monsterForDate is null)
        {
            logger.LogError("Failed to get monster for date {date}", date);
            throw new InvalidDataException("No monster available");
        }
        
        return monsterForDate;
    }

    public async Task<GuessableMonster?> getMonsterFromCode(string code)
    {
        return await monsterDataAccess.GetGuessableMonsterFromCode(code);
    }
    
    public async Task<GuessableMonster> getMonsterFromId(int id)
    {
        return await monsterDataAccess.GetGuessableMonsterFromId(id) ?? throw new DataNotFoundException($"Could not find monster with id {id}");
    }

    public async Task<List<String>> getMonsterChoicesFromGames(string[] gameTitles)
    {
        return await monsterDataAccess.GetGuessableMonsterChoicesFromGames(gameTitles);
    }
}