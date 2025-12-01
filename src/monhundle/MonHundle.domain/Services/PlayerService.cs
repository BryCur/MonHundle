using Microsoft.Extensions.Logging;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class PlayerService(ILogger<PlayerService> logger, IPlayerDataAccess playerDataAccess): IPlayerService
{
    public Guid AuthPlayer(string? playerUid)
    {
        if (playerUid is null)
        {
            logger.LogInformation("New player visiting, creating new uid");
            Player player = new Player { PlayerUid = Guid.NewGuid(), last_connection = DateTime.UtcNow };
            playerDataAccess.InsertPlayer(player);
            
            return player.PlayerUid;
        }
        else
        {
            logger.LogInformation("player returning, verifying {playerId}", playerUid);

            Guid pUid = Guid.Parse(playerUid);
            Player? player = playerDataAccess.GetPlayer(pUid);

            if (player is null)
            {
                logger.LogInformation("Player {playerId} not found, refusing auth", playerUid);
                throw new DataNotFoundException($"Player {playerUid} not found");
            }
            
            logger.LogInformation("Player {playerId} found, refreshing cookie lifespan", playerUid);
            player.last_connection = DateTime.UtcNow;
            playerDataAccess.UpdatePlayer(player);

            return player.PlayerUid;
        }
    }
}