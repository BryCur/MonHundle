using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces;

namespace MonHundle.domain.Criterias;

public abstract class AbstractCriteria<T, TSelf>(T initialValue) : ICriteria where TSelf : AbstractCriteria<T, TSelf>
{
    protected T Value { get; } = initialValue;
    public abstract ComparisonOutcomes Compare(TSelf other);

    ComparisonOutcomes ICriteria.Compare(ICriteria other)
    {
        if (other is TSelf otherCriteria)
        {
            return Compare(otherCriteria);
        }
        
        throw new ArgumentException($"Cannot compare criteria of type {this.GetType().Name} to {other.GetType().Name}");
    }
    
    public T GetValue() => Value;
}