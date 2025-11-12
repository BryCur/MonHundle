using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class PlayerDataAccess(AppDbContext dbContext): IPlayerDataAccess
{
    public void InsertPlayer(Player toSave)
    {
        dbContext.Players.Add(toSave);
        dbContext.SaveChanges();
    }

    public void UpdatePlayer(Player toSave)
    {
        dbContext.Players.Update(toSave);
        dbContext.SaveChanges();
    }

    public Player? GetPlayer(Guid playerId)
    {
        return dbContext.Players.FirstOrDefault(p => playerId.Equals(p.PlayerUid)); 
    }
}