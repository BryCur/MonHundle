using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.Services;

public interface IMonsterService
{
    public GuessableMonster getRandomMonster();
    public GuessableMonster getDailyMonster(DateTime date);
    public GuessableMonster? getMonsterFromCode(string code);
    public GuessableMonster getMonsterFromId(int id);
    public List<String> getMonsterChoicesFromGames(string[] gameTitles);
}