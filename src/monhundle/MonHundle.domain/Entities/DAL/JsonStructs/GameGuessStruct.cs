using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct GameGuessStruct
{
    public string MonsterCode { get; init; }
    public GameCriteriaStruct Criterias { get; init; }
    public GameComparisonStruct Comparisons { get; init; }

    public static GameGuessStruct fromGuessDTO(GuessResponse guessObject)
    {
        return new GameGuessStruct()
        {
            MonsterCode = guessObject.monsterCode,
            Criterias = new GameCriteriaStruct(guessObject.criterias),
            Comparisons = new GameComparisonStruct(guessObject.comparisonResult)
        };
    }
}