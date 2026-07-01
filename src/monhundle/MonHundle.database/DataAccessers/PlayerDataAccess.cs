using EFCoreSecondLevelCacheInterceptor;
using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class PlayerDataAccess(AppDbContext dbContext): IPlayerDataAccess
{
    public async Task InsertPlayer(Player toSave)
    {
        dbContext.Players.Add(toSave);
        await dbContext.SaveChangesAsync();
    }

    public async Task UpdatePlayer(Player toSave)
    {
        dbContext.Players.Update(toSave);
        await dbContext.SaveChangesAsync();
    }

    public async Task<Player?> GetPlayer(Guid playerId)
    {
        return await dbContext.Players
            .Where(p => playerId.Equals(p.PlayerUid))
            .Cacheable(CacheExpirationMode.Absolute, TimeSpan.FromMinutes(10))
            .FirstOrDefaultAsync(); 
    }
}