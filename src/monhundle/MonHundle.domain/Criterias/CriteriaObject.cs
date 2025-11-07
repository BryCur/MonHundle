using MonHundle.domain.Entities;

namespace MonHundle.domain.Criterias;

public class CriteriaObject<T>(T val) : AbstractCriteria<T, CriteriaObject<T>>(val)
{
    public override ComparisonOutcomes Compare(CriteriaObject<T> other)
    {
        if (other == null || other.Value == null) {
            throw new ArgumentNullException(nameof(other));
        }
        
        return other.Value.Equals(this.Value) ? ComparisonOutcomes.Correct : ComparisonOutcomes.Incorrect;
    }
}