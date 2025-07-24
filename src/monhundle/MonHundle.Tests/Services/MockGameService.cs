using core_api.Models;
using core_api.Services.Interfaces;

namespace MonHundle.Tests.Services;

public class MockGameService: IGameService
{
    public Game CreateGame()
    {
        return new Game(); 
    }

    public Game? GetGame(Guid gameId)
    {
        return null;
    }
}