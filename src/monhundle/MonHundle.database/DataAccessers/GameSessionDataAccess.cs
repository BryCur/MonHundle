using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.Mappers;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class GameSessionDataAccess(AppDbContext dbContext): IGameDataAccess {

    public async Task CreateGame(Game game)
    {
        int playerUid = await GetPlayerIdFromGuid(game.PlayerId);
        
        var gameSessionEntity = GameSessionMapper.ToEntity(game, playerUid);
        
        dbContext.GameSessions.Add(gameSessionEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task<GameSession> GetGame(Guid gameId, int playerId)
    {
        return await dbContext.GameSessions
            .Where(gs => gs.GameUid.Equals(gameId) && gs.PlayerId == playerId)
            .FirstAsync() 
               ?? throw new DataNotFoundException("Game not found"); // TODO map entity to domain object
    }

    public async Task<GameSession?> GetDailyGameForPlayerAtDate(DateTime date, int playerId)
    {
        return await dbContext.GameSessions
            .Where(gs =>
                    gs.GameMode == GameModes.Daily  // daily mode
                    && gs.PlayerId == playerId // match player
                    && gs.StartTime.Date.Equals(date.Date) // match date
            )
            .FirstOrDefaultAsync();
    }

    public async Task SaveGame(GameSession game)
    {
        dbContext.GameSessions.Update(game);
        await dbContext.SaveChangesAsync();
    }

    private async Task<int> GetPlayerIdFromGuid(Guid guid)
    {
        int? p = await dbContext.Players
            .Where(p => p.PlayerUid.Equals(guid))
            .Select(p => p.Id)
            .FirstOrDefaultAsync();
        
        if (!p.HasValue)
        {
            throw new DataNotFoundException("Player not found");
        }
        
        return p.Value;
        
    }

    public async Task<List<GameSession>> GetOngoingUnlimitedGamesForPlayer(int playerId)
    {
        return await dbContext.GameSessions
            .Where(gs => 
                gs.PlayerId.Equals(playerId) 
                && gs.State.Equals(nameof(GameStates.Ongoing))
                && gs.GameMode == GameModes.Unlimited
            )
            .ToListAsync();
    }
}