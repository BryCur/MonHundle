using core_api.Models;
using core_api.Services.Interfaces;

namespace core_api.Services;

public class GameService : IGameService
{
    private readonly Dictionary<Guid, Game> _games = new Dictionary<Guid, Game>(); // en attendant Redis / DB 
    private readonly IMonsterService _monsterService;
    
    public GameService(IMonsterService monsterService) { _monsterService = monsterService ?? throw new ArgumentNullException(nameof(monsterService)); }
    
    public Game CreateGame()
    {
        Game game = new Game {Id = Guid.NewGuid(), Answer = _monsterService.getRandomMonster()};
        
        _games.Add(game.Id, game);
        return game;
    }

    public Game? GetGame(Guid gameId)
    {
        return _games.GetValueOrDefault(gameId, null);
    }
}