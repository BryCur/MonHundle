using Microsoft.Extensions.Logging;
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
    public async Task<Guid> AuthPlayer(string? playerUid)
    {
        if (!Guid.TryParse(playerUid, out Guid pUid))
        {
            return await CreateNewPlayer();
        }

        Player? player = await playerDataAccess.GetPlayer(pUid);

        if (player is null)
        {
            logger.LogInformation("Player {playerId} not recognised, issuing a fresh identity", playerUid);
            return await CreateNewPlayer();
        }

        logger.LogInformation("Player {playerId} returning, refreshing last connection", playerUid);
        player.last_connection = DateTime.UtcNow;
        await playerDataAccess.UpdatePlayer(player);

        return player.PlayerUid;
    }

    private async Task<Guid> CreateNewPlayer()
    {
        logger.LogInformation("Creating a new player identity");
        Player player = new Player { PlayerUid = Guid.NewGuid(), last_connection = DateTime.UtcNow };
        await playerDataAccess.InsertPlayer(player);

        return player.PlayerUid;
    }

    public async Task<bool> CheckPlayerExists(Guid playerUid)
    {
        return await playerDataAccess.GetPlayer(playerUid) != null;
    }

    public async Task<PlayerProfileResponse> GetPlayerProfile(Guid playerUid)
    {
        Player? player = await playerDataAccess.GetPlayer(playerUid);
        if (player is null || player.Id is null)
        {
            throw new DataNotFoundException($"Player {playerUid} not found");
        }
        
        List<GameSession> ongoingUnlimitedGames = await gameDataAccess.GetOngoingUnlimitedGamesForPlayer(player.Id.Value);
        GameSession? latestUnlimited = ongoingUnlimitedGames.MaxBy(gs => gs.StartTime);
        GameSession? ongoingDaily = await gameDataAccess.GetDailyGameForPlayerAtDate(DateTime.UtcNow, player.Id!.Value);

        return new PlayerProfileResponse(
            player.JsonPreferences?.enableTableAccessibility ?? false,
            player.JsonPreferences?.gameList ?? [],
            ongoingDaily?.GameUid.ToString() ?? null,
            latestUnlimited?.GameUid.ToString() ?? null
        );
    }

    public async Task SaveUserPreferences(Guid playerUid, PlayerPreferencesStruct updatedPreferences)
    {
        Player? player = await playerDataAccess.GetPlayer(playerUid);
        if (player is null)
        {
            throw new DataNotFoundException($"Player {playerUid} not found");
        }

        player.JsonPreferences = updatedPreferences;
        await playerDataAccess.UpdatePlayer(player);
    }
}