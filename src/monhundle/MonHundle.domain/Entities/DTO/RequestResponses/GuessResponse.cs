using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DTO;

public record GuessResponse(
    String MonsterCode,
    MonsterCriteriaDTO Criterias,
    MonsterComparisonResult ComparisonResult,
    GameStates GameStateAfterGuess
);