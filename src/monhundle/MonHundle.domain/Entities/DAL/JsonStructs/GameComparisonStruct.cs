namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct GameComparisonStruct
{
    public ComparisonOutcomes Generation {get; init;} 
    public ComparisonOutcomes ThreatLevel {get; init;} 
    public ComparisonOutcomes Classifications {get; init;} 
    public ComparisonOutcomes Weaknesses {get; init;} 
    public ComparisonOutcomes DietSet {get; init;} 
    public ComparisonOutcomes Afflictions {get; init;} 
    public ComparisonOutcomes Habitats {get; init;}

    public GameComparisonStruct(MonsterComparisonResult result)
    {
        Generation = result.Generation;
        ThreatLevel = result.ThreatLevel;
        Classifications = result.Classification;
        Weaknesses = result.Weaknesses;
        DietSet = ComparisonOutcomes.Correct;
        Afflictions = result.Afflictions;
        Habitats = result.Habitats;
    }
}