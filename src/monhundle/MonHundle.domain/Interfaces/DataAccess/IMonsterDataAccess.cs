using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IMonsterDataAccess
{
    List<GuessableMonster> GetGuessableMonsterPoolFromGame(String GameCode);
    List<String> GetGuessableMonsterChoicesFromGames(String[] GameCodes);

    GuessableMonster? GetGuessableMonsterFromCode(String monsterCode);
    GuessableMonster? GetGuessableMonsterFromId(int monsterId);
}