using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class GameTitleDataAccess(AppDbContext dbContext) : IGameTitleDataAccess
{
    public List<String> GetGameTitles()
    {
        return dbContext.Games.Select(g => g.Code).ToList();
    }
}