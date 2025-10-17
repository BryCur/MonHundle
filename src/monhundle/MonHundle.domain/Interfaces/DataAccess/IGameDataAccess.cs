using MonHundle.domain.Entities;

namespace MonHundle.database.Interfaces.DataAccess;

public interface IGameDataAccess
{
    void createGame();
    Game getGame(Guid gameId);
}