using core_api.Models.Criterias;
using core_api.Models.Interfaces;

namespace core_api.Models;

public class Guessable(string id, MonsterCriteria monsterCriteria)
{
    private string _Id = id;
    private MonsterCriteria _MonsterCriteria = monsterCriteria;

    public List<ComparisonResult> compareTo(Guessable other)
    {
        return _MonsterCriteria.GetCriterias().Zip(
            other._MonsterCriteria.GetCriterias(),
            (reference, guess) => reference.Compare(guess)
        ).ToList();
    }
    
    public string GetId() {return _Id;}
}