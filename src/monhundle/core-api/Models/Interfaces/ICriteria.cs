namespace core_api.Models.Interfaces;

public interface ICriteria
{
    ComparisonResult Compare(ICriteria criteria);
}