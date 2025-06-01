using core_api.Models.Criterias.Enums;
using core_api.Models.Interfaces;

namespace core_api.Models.Criterias;

public struct GameCriteria
{
    public CriteriaNumber Generation { get; set; }
    public CriteriaNumber ThreatLevel { get; set; }
    public CriteriaObject<Classification> Classification { get; set; }
    public CriteriaSet<Weakness> Weaknesses { get; set; }
    public CriteriaSet<Diet> Diets { get; set; }
    public CriteriaSet<Affliction> InflictedAilments { get; set; }

    public ICriteria[] GetCriterias()
    {
        return new ICriteria[]
        {
            Generation,
            ThreatLevel,
            Classification,
            Weaknesses,
            Diets,
            InflictedAilments
        };
    }
}