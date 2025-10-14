using MonHundle.domain.Entities;

namespace MonHundle.database.Interfaces;

public interface IGameDataAccess
{
    void createGame();
    Game getGame(Guid gameId);
}