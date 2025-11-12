using MonHundle.domain.Entities;

namespace MonHundle.domain.Entities.Criterias;

public class CriteriaSet<TS>(HashSet<TS> initialValue) : AbstractCriteria<HashSet<TS>, CriteriaSet<TS>>(initialValue)
{
    public override ComparisonOutcomes Compare(CriteriaSet<TS> other)
    {
        if (other.Value.SetEquals(Value))
        {
            return ComparisonOutcomes.Correct;
        }

        if (other.Value.Overlaps(Value))
        {
            return ComparisonOutcomes.Partial;
        }

        return ComparisonOutcomes.Incorrect;
    }    
}