using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DTO;

public record MonsterGuessDTO(
    String MonsterCode,
    MonsterCriteriaDTO Criterias,
    MonsterComparisonResult ComparisonResult
);