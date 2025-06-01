using core_api.Models.Interfaces;

namespace core_api.Models.Criterias;

public class CriteriaNumber(int val) : AbstractCriteria<int, CriteriaNumber>(val)
{
    public override ComparisonResult Compare(CriteriaNumber other)
    {
        if (other.Value == this.Value)
        {
            return ComparisonResult.Correct; 
        } 
        
        if (other.Value > this.Value)
        {
            return ComparisonResult.Lower;
        }

        return ComparisonResult.Higher;
    }
}