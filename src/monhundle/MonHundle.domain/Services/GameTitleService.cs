using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class GameTitleService: IGameTitleService
{
    private readonly IGameTitleDataAccess _gameTitleDataAccess;

    public GameTitleService(IGameTitleDataAccess gameTitleDataAccess)
    {
        _gameTitleDataAccess = gameTitleDataAccess;
    }
    
    public async Task<List<String>> GetAllGameTitles()
    {
        return await _gameTitleDataAccess.GetGameTitles();
    }
}