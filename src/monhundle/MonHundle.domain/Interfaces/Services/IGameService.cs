using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Interfaces.Services;

public interface IGameService
{
    public Task<Game> CreateUnlimitedGameSessionWithRandomMonster(Player gameOwner);
    public Game CreateGame(GameModes mode, Player gameOwner, GuessableMonster monster);
    public Task<Game?> ResumeGame(Guid gameId, Player player);
    public Task<Game?> GetDailyGameForPlayerAtDate(DateTime date, Player player);
    public Task<(MonsterGuessDTO, GameStates)> MakeGuess(Guid gameId, GuessableMonster guess, Player player);
}