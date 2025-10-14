

using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.Services;

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