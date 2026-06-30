using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.Services;

public interface IMonsterService
{
    public Task<GuessableMonster> getRandomMonster();
    public Task<GuessableMonster> getDailyMonster(DateTime date);
    public Task<GuessableMonster?> getMonsterFromCode(string code);
    public Task<GuessableMonster> getMonsterFromId(int id);
    public Task<List<String>> getMonsterChoicesFromGames(string[] gameTitles);
}