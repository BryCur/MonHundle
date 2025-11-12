
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces;

namespace MonHundle.domain.Entities.Criterias;

public record MonsterCriteria(
    CriteriaNumber Generation,
    CriteriaNumber ThreatLevel,
    CriteriaObject<Classifications> Classification,
    CriteriaSet<Weaknesses> WeaknessesSet,
    CriteriaSet<Diets> DietSet,
    CriteriaSet<Afflictions> InflictedAilments,
    CriteriaSet<Habitats> Habitat
) {
    
    // habitats? 
    // first appearance? --> gen
    
    public ICriteria[] GetCriterias()
    {
        return new ICriteria[]
        {
            Generation,
            ThreatLevel,
            Classification,
            WeaknessesSet,
            DietSet,
            InflictedAilments,
            Habitat
        };
    }
}