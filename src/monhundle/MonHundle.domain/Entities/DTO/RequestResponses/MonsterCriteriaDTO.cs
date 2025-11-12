
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DTO;

public record MonsterCriteriaDTO(
    int Generation,
    int ThreatLevel,
    Classifications Classification,
    Weaknesses[] Weaknesses,
    // Diets[] DietSet,
    Afflictions[] Afflictions,
    Habitats[] Habitats
)
{
    public static MonsterCriteriaDTO ToDto(MonsterCriteria criteria)
    {
        return new MonsterCriteriaDTO(
            criteria.Generation.GetValue(),
            criteria.ThreatLevel.GetValue(),
            criteria.Classification.GetValue(),
            criteria.WeaknessesSet.GetValue().ToArray(),
            criteria.InflictedAilments.GetValue().ToArray(),
            criteria.Habitat.GetValue().ToArray()
        );
    }
}