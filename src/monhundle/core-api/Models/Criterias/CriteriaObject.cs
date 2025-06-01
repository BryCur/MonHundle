using core_api.Models.Interfaces;

namespace core_api.Models.Criterias;

public class CriteriaObject<T>(T val) : AbstractCriteria<T, CriteriaObject<T>>(val)
{
    public override ComparisonResult Compare(CriteriaObject<T> other)
    {
        if (other == null || other.Value == null) {
            throw new ArgumentNullException(nameof(other));
        }
        
        return other.Value.Equals(this.Value) ? ComparisonResult.Correct : ComparisonResult.Incorrect;
    }
}