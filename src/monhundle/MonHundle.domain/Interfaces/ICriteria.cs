using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces;

public interface ICriteria
{
    ComparisonOutcomes Compare(ICriteria criteria);
}