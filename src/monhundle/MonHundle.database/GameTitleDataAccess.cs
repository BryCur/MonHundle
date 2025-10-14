using MonHundle.domain.Interfaces;

namespace MonHundle.database;

public class GameTitleDataAccess(AppDbContext dbContext) : IGameTitleDataAccess
{
    public List<String> GetGameTitles()
    {
        return dbContext.games.Select(g => g.code).ToList();
    }
}