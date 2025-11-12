using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Interfaces.Services;

public interface IGameService
{
    public Game CreateGame(String userId);
    public Game? ResumeGame(Guid gameId, Player player);
    public (MonsterGuessDTO, GameStates) MakeGuess(Guid gameId, GuessableMonster guess, Player player);
}