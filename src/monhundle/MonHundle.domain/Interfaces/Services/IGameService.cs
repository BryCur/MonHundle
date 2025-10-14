using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces.Services;

public interface IGameService
{
    public Game CreateGame();
    public Game? GetGame(Guid gameId);
}