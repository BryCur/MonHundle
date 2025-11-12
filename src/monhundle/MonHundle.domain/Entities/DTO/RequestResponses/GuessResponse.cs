using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DTO;

public record GuessResponse(
    String monsterCode,
    MonsterCriteriaDTO criterias,
    MonsterComparisonResult comparisonResult,
    GameStates gameState
);