namespace MonHundle.domain.Entities;

public struct MonsterComparisonResult
{
        public ComparisonOutcomes Generation {get; init;}
        public ComparisonOutcomes ThreatLevel {get; init;}
        public ComparisonOutcomes Classification {get; init;}
        public ComparisonOutcomes Weaknesses {get; init;}
        public ComparisonOutcomes Afflictions {get; init;}
        public ComparisonOutcomes Habitats {get; init;}
}