using Microsoft.Extensions.Logging;
using MonHundle.database.Interfaces.DataAccess;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class PlayerService(
    ILogger<PlayerService> logger, 
    IPlayerDataAccess playerDataAccess,
    IGameDataAccess gameDataAccess
): IPlayerService {
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

    public bool CheckPlayerExists(Guid playerUid)
    {
        return playerDataAccess.GetPlayer(playerUid) != null;
    }

    public PlayerProfileResponse GetPlayerProfile(Guid playerUid)
    {
        Player? player = playerDataAccess.GetPlayer(playerUid);
        if (player is null || player.Id is null)
        {
            throw new DataNotFoundException($"Player {playerUid} not found");
        }
        
        List<GameSession> ongoingUnlimitedGames = gameDataAccess.GetOngoingUnlimitedGamesForPlayer(player.Id.Value);
        GameSession? latestUnlimited = ongoingUnlimitedGames.MaxBy(gs => gs.StartTime);
        GameSession? ongoingDaily = gameDataAccess.GetDailyGameForPlayerAtDate(DateTime.Today, player.Id!.Value);

        return new PlayerProfileResponse(
            player.JsonPreferences?.enableTableAccessibility ?? false,
            String.Join(",", player.JsonPreferences?.gameList ?? []) ?? null,
            ongoingDaily?.GameUid.ToString() ?? null,
            latestUnlimited?.GameUid.ToString() ?? null
        );
    }

    public void SaveUserPreferences(Guid playerUid, PlayerPreferencesStruct updatedPreferences)
    {
        Player? player = playerDataAccess.GetPlayer(playerUid);
        if (player is null)
        {
            throw new DataNotFoundException($"Player {playerUid} not found");
        }

        player.JsonPreferences = updatedPreferences;
        playerDataAccess.UpdatePlayer(player);
    }
}