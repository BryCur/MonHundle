using MonHundle.domain.Entities.DAL.JsonStructs;

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
                        MonsterCode = g.monsterCode,
                        Criterias = new GameCriteriaStruct(g.criterias),
                        Comparisons = new GameComparisonStruct(g.comparisonResult)
                    }
                ).ToList(),
            State = game.State.ToString(),
            LastUpdate = DateTime.UtcNow
        };
    }
}