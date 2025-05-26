using core_api.Models.Interfaces;

namespace core_api.Models.Criterias;

public class CriteriaNumber(int val) : AbstractCriteria<int, CriteriaNumber>(val)
{
    public override ComparisonResult Compare(CriteriaNumber other)
    {
        return other.Value == this.Value ? ComparisonResult.Correct : ComparisonResult.Incorrect;
    }
}