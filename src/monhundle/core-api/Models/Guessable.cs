using core_api.Models.Criterias;
using core_api.Models.Interfaces;

namespace core_api.Models;

public class Guessable
{
    private int Id;
    private GameCriteria _criterias;

    public List<ComparisonResult> compareTo(Guessable other)
    {
        return _criterias.GetCriterias().Zip(
            other._criterias.GetCriterias(),
            (reference, guess) => reference.Compare(guess)
        ).ToList();
    }
}