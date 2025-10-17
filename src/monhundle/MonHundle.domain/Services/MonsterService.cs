
using MonHundle.domain.DummyData;
using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class MonsterService(IMonsterDataAccess monsterDataAccess) : IMonsterService
{
    public GuessableMonster getRandomMonster()
    {
        String forcedGame = "MHWilds"; // until more games are ready
        var monsterList = monsterDataAccess.GetGuessableMonsterPoolFromGame(forcedGame);
        
        if (monsterList is null || monsterList.Count < 1) throw new InvalidDataException("No monster available");
        
        var random = new Random();
        return monsterList[random.Next(monsterList.Count)];

    }

    public GuessableMonster? getMonsterFromId(string id)
    {
        return monsterDataAccess.GetGuessableMonsterFromCode(id);
    }
}