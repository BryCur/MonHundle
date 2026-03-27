using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;

namespace MonHundle.database.Interfaces.DataAccess;

public interface IGameDataAccess
{
    void CreateGame(Game game);
    GameSession GetGame(Guid gameId, int playerId);
    void SaveGame(GameSession game);
    GameSession? GetLastGameForPlayer(GameModes mode, int playerId);
}