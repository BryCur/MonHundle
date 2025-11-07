using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.Services;

public interface IMonsterService
{
    public GuessableMonster getRandomMonster();
    public GuessableMonster? getMonsterFromId(string id);
    public List<String> getMonsterChoicesFromGames(string[] gameTitles);
}