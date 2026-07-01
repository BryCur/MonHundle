using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IMonsterDataAccess
{
    Task<List<GuessableMonster>> GetGuessableMonsterPoolFromGame(String GameCode);
    Task<List<String>> GetGuessableMonsterChoicesFromGames(String[] GameCodes);

    Task<GuessableMonster> GetGuessableMonsterFromCode(String monsterCode);
    Task<GuessableMonster> GetGuessableMonsterFromId(int monsterId);
    Task<GuessableMonster?> GetDailyGuessableMonster(DateTime date);
    Task<List<int>> GetAllGuessableMonsterIds();
}