namespace core_api.Models.Interfaces;

public abstract class AbstractCriteria<T, TSelf>(T initialValue) : ICriteria where TSelf : AbstractCriteria<T, TSelf>
{
    protected T Value { get; } = initialValue;
    public abstract ComparisonResult Compare(TSelf other);

    ComparisonResult ICriteria.Compare(ICriteria other)
    {
        if (other is TSelf otherCriteria)
        {
            return Compare(otherCriteria);
        }
        
        throw new ArgumentException($"Cannot compare criteria of type {this.GetType().Name} to {other.GetType().Name}");
    }
}