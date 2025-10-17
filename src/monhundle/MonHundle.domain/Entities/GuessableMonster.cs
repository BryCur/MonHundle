using System.Runtime.CompilerServices;
using MonHundle.domain.Criterias;
using MonHundle.domain.Criterias.Enums;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces;

namespace MonHundle.domain.Entities;

public class GuessableMonster(string code, MonsterCriteria monsterCriteria)
{
    private readonly string _code = code;
    private readonly MonsterCriteria _MonsterCriteria = monsterCriteria;

    public List<ComparisonResult> compareTo(GuessableMonster other)
    {
        return _MonsterCriteria.GetCriterias().Zip(
            other._MonsterCriteria.GetCriterias(),
            (reference, guess) => reference.Compare(guess)
        ).ToList();
    }
    
    public string GetId() {return _code;}

    public static GuessableMonster FromData(GuessableMonsterData monsterData)
    {
        String classificationStr = monsterData.ClassificationList
            .Split(",")
            .First() // only primary classification, not sub-species and stuff yet
            .Trim(); 
        Classifications classification = (Classifications)Enum.Parse(typeof(Classifications), classificationStr);
        
        HashSet<Weaknesses> weaknesses = monsterData.WeaknessList is not null ? monsterData.WeaknessList
            .Split(",")
            .Select(s => s.Trim())
            .Select(s => (Weaknesses)Enum.Parse(typeof(Weaknesses), s))
            .ToHashSet() : new HashSet<Weaknesses>();
        
        HashSet<Afflictions> affliction = monsterData.AfflictionList is not null ? monsterData.AfflictionList
            .Split(",")
            .Select(s => s.Trim())
            .Select(s => (Afflictions)Enum.Parse(typeof(Afflictions), s))
            .ToHashSet() : new HashSet<Afflictions>();
        
        HashSet<Habitats> biomes = monsterData.HabitatList
            .Split(",")
            .Select(s => s.Trim())
            .Select(s => (Habitats)Enum.Parse(typeof(Habitats), s))
            .ToHashSet();
        
        MonsterCriteria criterion = new MonsterCriteria(
            new CriteriaNumber(monsterData.Generation),
            new CriteriaNumber(monsterData.ThreatLevel),
            new CriteriaObject<Classifications>(classification),
            new CriteriaSet<Weaknesses>(weaknesses),
            new CriteriaSet<Diets>(new HashSet<Diets>()),
            new CriteriaSet<Afflictions>(affliction),
            new CriteriaSet<Habitats>(biomes)
        );
        
        return new GuessableMonster(monsterData.MonsterCode, criterion);
    }
}