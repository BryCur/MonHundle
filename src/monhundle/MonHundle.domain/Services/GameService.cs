
using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class GameService : IGameService
{
    private static readonly Dictionary<Guid, Game> Games = new Dictionary<Guid, Game>(); // en attendant Redis / DB 
    private readonly IMonsterService _monsterService;
    
    public GameService(IMonsterService monsterService) { _monsterService = monsterService ?? throw new ArgumentNullException(nameof(monsterService)); }
    
    public Game CreateGame(String userId)
    {
        Game game = new Game
        {
            Id = Guid.NewGuid(), 
            Answer = _monsterService.getRandomMonster(), 
            playerId = Guid.Parse((ReadOnlySpan<char>)userId)
        };
        
        Games.Add(game.Id, game);
        return game;
    }

    public Game? GetGame(Guid gameId)
    {
        return Games.GetValueOrDefault(gameId, null);
    }
}