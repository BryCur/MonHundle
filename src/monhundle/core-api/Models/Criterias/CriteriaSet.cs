using core_api.Models.Interfaces;

namespace core_api.Models.Criterias;

public class CriteriaSet<TS>(HashSet<TS> initialValue) : AbstractCriteria<HashSet<TS>, CriteriaSet<TS>>(initialValue)
{
    public override ComparisonResult Compare(CriteriaSet<TS> other)
    {
        if (other.Value.SetEquals(Value))
        {
            return ComparisonResult.Correct;
        }

        if (other.Value.Overlaps(Value))
        {
            return ComparisonResult.Partial;
        }

        return ComparisonResult.Incorrect;
    }    
}