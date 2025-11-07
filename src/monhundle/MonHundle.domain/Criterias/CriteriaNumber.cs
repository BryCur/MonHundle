using MonHundle.domain.Entities;

namespace MonHundle.domain.Criterias;

public class CriteriaNumber(int val) : AbstractCriteria<int, CriteriaNumber>(val)
{
    public override ComparisonOutcomes Compare(CriteriaNumber other)
    {
        if (other.Value == this.Value)
        {
            return ComparisonOutcomes.Correct; 
        } 
        
        if (other.Value > this.Value)
        {
            return ComparisonOutcomes.Lower;
        }

        return ComparisonOutcomes.Higher;
    }
}