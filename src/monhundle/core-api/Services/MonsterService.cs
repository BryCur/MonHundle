using core_api.Util.DummyData;
using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Services;

public class MonsterService : IMonsterService
{
    public Guessable getRandomMonster()
    {
        return MonsterList.monsterList[new Random().Next(0, MonsterList.monsterList.Count)];
    }

    public Guessable? getMonsterFromId(string id)
    {
        return MonsterList.monsterList.Find(g => g.GetId() == id);
    }
}