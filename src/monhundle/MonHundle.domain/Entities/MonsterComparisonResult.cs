using MonHundle.domain.Entities.DAL.JsonStructs;

namespace MonHundle.domain.Entities;

public struct MonsterComparisonResult
{
        public ComparisonOutcomes Generation {get; init;}
        public ComparisonOutcomes ThreatLevel {get; init;}
        public ComparisonOutcomes Classification {get; init;}
        public ComparisonOutcomes Weaknesses {get; init;}
        public ComparisonOutcomes Afflictions {get; init;}
        public ComparisonOutcomes Habitats {get; init;}
        
        public static MonsterComparisonResult fromStruct(GameComparisonStruct comparisonStruct)
        {
                return new MonsterComparisonResult()
                {
                        Afflictions = comparisonStruct.Afflictions,
                        Classification = comparisonStruct.Classifications,
                        Generation = comparisonStruct.Generation,
                        Habitats = comparisonStruct.Habitats,
                        Weaknesses = comparisonStruct.Weaknesses,
                        ThreatLevel = comparisonStruct.ThreatLevel,
                };
        }
}