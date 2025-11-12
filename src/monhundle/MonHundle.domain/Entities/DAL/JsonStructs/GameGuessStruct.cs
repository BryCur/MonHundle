using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct GameGuessStruct
{
    public string MonsterCode { get; init; }
    public GameCriteriaStruct Criterias { get; init; }
    public GameComparisonStruct Comparisons { get; init; }

    public static GameGuessStruct fromGuessDTO(MonsterGuessDTO monsterGuessObject)
    {
        return new GameGuessStruct()
        {
            MonsterCode = monsterGuessObject.MonsterCode,
            Criterias = new GameCriteriaStruct(monsterGuessObject.Criterias),
            Comparisons = new GameComparisonStruct(monsterGuessObject.ComparisonResult)
        };
    }
}