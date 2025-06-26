using core_api.Models;

namespace core_api.Services.Interfaces;

public interface IMonsterService
{
    public Guessable getRandomMonster();
    public Guessable getMonsterFromId(string id);
}