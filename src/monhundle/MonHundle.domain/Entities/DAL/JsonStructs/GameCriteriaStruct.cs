using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct GameCriteriaStruct
{
    public  int Generation {get; init;}
    public  int ThreatLevel {get; init;}
    public  Classifications Classifications {get; init;}
    public  Weaknesses[] Weaknesses {get; init;}
    // public [] DietSet {get; init;}
    public  Afflictions[] Afflictions {get; init;}
    public  Habitats[] Habitats {get; init;}

    public GameCriteriaStruct(MonsterCriteriaDTO criteriaDto)
    {
        Generation = criteriaDto.Generation;
        ThreatLevel = criteriaDto.ThreatLevel;
        Classifications = criteriaDto.Classification;
        Weaknesses = criteriaDto.Weaknesses;
        Afflictions = criteriaDto.Afflictions;
        Habitats = criteriaDto.Habitats;
    }
    
    public GameCriteriaStruct(MonsterCriteria criteria)
    {
        Generation = criteria.Generation.GetValue();
        ThreatLevel = criteria.ThreatLevel.GetValue();
        Classifications = criteria.Classification.GetValue();
        Weaknesses = criteria.WeaknessesSet.GetValue().ToArray();
        Afflictions = criteria.InflictedAilments.GetValue().ToArray();
        Habitats = criteria.Habitat.GetValue().ToArray();
    }
}