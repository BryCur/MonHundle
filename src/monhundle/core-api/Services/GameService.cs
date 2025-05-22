using core_api.Models;
using core_api.Services.Interfaces;

namespace core_api.Services;

public class GameService : IGameService
{
    private readonly Dictionary<Guid, Game> _games = new Dictionary<Guid, Game>(); // en attendant Redis / DB 

    public Game CreateGame()
    {
        Game game = new Game {Id = Guid.NewGuid(), Answer = "I'm an answer"};
        
        _games.Add(game.Id, game);
        return game;
    }

    public Game? GetGame(Guid gameId)
    {
        return _games.GetValueOrDefault(gameId, null);
    }
}