using MonHundle.database.Interfaces.DataAccess;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.Mappers;
using MonHundle.domain.Exceptions.DAL;

namespace MonHundle.database.DataAccessers;

public class GameSessionDataAccess(AppDbContext dbContext): IGameDataAccess {

    public void CreateGame(Game game)
    {
        int playerUid = GetPlayerIdFromGuid(game.PlayerId);
        
        var gameSessionEntity = GameSessionMapper.ToEntity(game, playerUid);
        
        dbContext.GameSessions.Add(gameSessionEntity);
        dbContext.SaveChanges();
    }

    public GameSession GetGame(Guid gameId, int playerId)
    {
        return dbContext.GameSessions.First(gs => gs.GameUid.Equals(gameId) && gs.PlayerId == playerId) 
               ?? throw new DataNotFoundException("Game not found"); // TODO map entity to domain object
    }

    public void SaveGame(GameSession game)
    {
        dbContext.GameSessions.Update(game);
        dbContext.SaveChanges();
    }

    private int GetPlayerIdFromGuid(Guid guid)
    {
        int? p = dbContext.Players
            .Where(p => p.PlayerUid.Equals(guid))
            .Select(p => p.Id)
            .FirstOrDefault();
        
        if (!p.HasValue)
        {
            throw new DataNotFoundException("Player not found");
        }
        
        return p.Value;
        
    }
}