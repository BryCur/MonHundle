

using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.Tests.Services;

public class MockGameService: IGameService
{
    public Game CreateGame(string playerId)
    {
        return new Game()
        {
            playerId = Guid.Parse(playerId),
        }; 
    }

    public Game? ResumeGame(Guid gameId)
    {
        return null;
    }
}