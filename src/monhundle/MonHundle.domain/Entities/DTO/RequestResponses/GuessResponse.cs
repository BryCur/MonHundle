using MonHundle.domain.Criterias;

namespace MonHundle.domain.Entities.DTO;

public record GuessResponse(
    String monsterCode,
    MonsterCriteriaDTO criterias,
    MonsterComparisonResult comparisonResult
);