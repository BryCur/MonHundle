using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class PlayerService(IPlayerDataAccess playerDataAccess): IPlayerService
{
    public Guid AuthPlayer(string? playerUid)
    {
        if (playerUid is null)
        {
            Player player = new Player { PlayerUid = Guid.NewGuid(), last_connection = DateTime.UtcNow };
            playerDataAccess.InsertPlayer(player);
            
            return player.PlayerUid;
        }
        else
        {
            
            Guid pUid = Guid.Parse(playerUid);
            Player? player = playerDataAccess.GetPlayer(pUid);

            if (player is null)
            {
                throw new DataNotFoundException($"Player {playerUid} not found");
            }
            
            player.last_connection = DateTime.UtcNow;
            playerDataAccess.UpdatePlayer(player);

            return player.PlayerUid;
        }
    }
}