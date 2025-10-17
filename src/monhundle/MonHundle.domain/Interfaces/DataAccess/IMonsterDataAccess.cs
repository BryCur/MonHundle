using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IMonsterDataAccess
{
    List<GuessableMonster> GetGuessableMonsterPoolFromGame(String GameCode);
    GuessableMonster? GetGuessableMonsterFromCode(String MonsterCode);
}