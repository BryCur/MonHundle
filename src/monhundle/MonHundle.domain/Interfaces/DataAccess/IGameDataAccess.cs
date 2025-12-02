using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;

namespace MonHundle.database.Interfaces.DataAccess;

public interface IGameDataAccess
{
    void CreateGame(Game game);
    GameSession GetGame(Guid gameId, int playerId);
    void SaveGame(GameSession game);
}