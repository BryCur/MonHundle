using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Interfaces.Services;

public interface IGameService
{
    public Game CreateGame(String userId);
    public Game? ResumeGame(Guid playerId, Guid gameId);
    public GuessResponse MakeGuess(Guid gameId, GuessableMonster guess);
}