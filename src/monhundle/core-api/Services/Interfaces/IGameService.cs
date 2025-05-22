using core_api.Models;

namespace core_api.Services.Interfaces;

public interface IGameService
{
    public Game CreateGame();
    public Game? GetGame(Guid gameId);
}