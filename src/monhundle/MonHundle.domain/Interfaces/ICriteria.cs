using MonHundle.domain.Entities;

namespace MonHundle.domain.Interfaces;

public interface ICriteria
{
    ComparisonResult Compare(ICriteria criteria);
}