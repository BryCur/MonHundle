using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DAL.Mappers;

public class GameSessionMapper
{
    public static GameSession ToEntity(Game game, int playerId)
    {
        return new GameSession
        {
            GameUid = game.Id,
            PlayerId = playerId,
            AnswerMonsterId = game.Answer.GetId(),
            GameGuesses = game.Guesses.Select(
                    g => new GameGuessStruct()
                    {
                        MonsterCode = g.MonsterCode,
                        Criterias = new GameCriteriaStruct(g.Criterias),
                        Comparisons = new GameComparisonStruct(g.ComparisonResult)
                    }
                ).ToList(),
            State = game.State.ToString(),
            LastUpdate = DateTime.UtcNow
        };
    }

    public static Game ToDto(GameSession gameSession, Player player, GuessableMonster answer)
    {
        if (!GameStates.TryParse(gameSession.State, out GameStates state))
        {
            throw new ArgumentException("Invalid state");
        }
        
        return new Game()
        {
            Id = gameSession.GameUid,
            playerId = player.PlayerUid,
            Answer = answer,
            Guesses = gameSession.GameGuesses.Select(g => new MonsterGuessDTO(
                g.MonsterCode,
                MonsterCriteriaDTO.ToDto(g.Criterias),
                MonsterComparisonResult.fromStruct(g.Comparisons)
            )).ToList(),
            State = state,
        };
    }
}