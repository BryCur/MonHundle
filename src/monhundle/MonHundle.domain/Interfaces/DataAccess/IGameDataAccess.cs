using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IGameDataAccess
{
    Task CreateGame(Game game);
    Task<GameSession> GetGame(Guid gameId, int playerId);
    Task SaveGame(GameSession game);
    Task<GameSession?> GetDailyGameForPlayerAtDate(DateTime date, int playerId);
    Task<List<GameSession>> GetOngoingUnlimitedGamesForPlayer(int playerId);
}