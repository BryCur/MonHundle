using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.Services;

public interface IMonsterService
{
    public Guessable getRandomMonster();
    public Guessable getMonsterFromId(string id);
}