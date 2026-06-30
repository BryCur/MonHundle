using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IGameDataAccess
{
    void CreateGame(Game game);
    GameSession GetGame(Guid gameId, int playerId);
    void SaveGame(GameSession game);
    GameSession? GetDailyGameForPlayerAtDate(DateTime date, int playerId);
    List<GameSession> GetOngoingUnlimitedGamesForPlayer(int playerId);
}