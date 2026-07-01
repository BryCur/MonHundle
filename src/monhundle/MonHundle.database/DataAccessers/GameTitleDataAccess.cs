using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Interfaces.DataAccess;

namespace MonHundle.database.DataAccessers;

public class GameTitleDataAccess(AppDbContext dbContext) : IGameTitleDataAccess
{
    public async Task<List<String>> GetGameTitles()
    {
        return await dbContext.Games
            .Select(g => g.Code)
            .ToListAsync();
    }
}