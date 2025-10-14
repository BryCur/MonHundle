using MonHundle.domain.Entities;

namespace MonHundle.domain.Criterias;

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