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

    public MonsterComparisonResult compareTo(GuessableMonster other)
    {
        return new MonsterComparisonResult()
        {
            Generation = _MonsterCriteria.Generation.Compare(other._MonsterCriteria.Generation),
            ThreatLevel = _MonsterCriteria.ThreatLevel.Compare(other._MonsterCriteria.ThreatLevel),
            Classification = _MonsterCriteria.Classification.Compare(other._MonsterCriteria.Classification),
            Weaknesses = _MonsterCriteria.WeaknessesSet.Compare(other._MonsterCriteria.WeaknessesSet),
            Afflictions = _MonsterCriteria.InflictedAilments.Compare(other._MonsterCriteria.InflictedAilments),
            Habitats = _MonsterCriteria.Habitat.Compare(other._MonsterCriteria.Habitat),
        };
    }
    
    public string GetId() {return _code;}
    public MonsterCriteria GetCriterias() {return _MonsterCriteria;}

    public static GuessableMonster FromData(GuessableMonsterData monsterData)
    {
        int classificationId = monsterData.ClassificationList
            .First(); // only primary classification, not sub-species and stuff yet; 
        Classifications classification = (Classifications)classificationId;
        
        HashSet<Weaknesses> weaknesses = monsterData.WeaknessList
            .OfType<int>()
            .Select(w => (Weaknesses)w)
            .ToHashSet();
        
        HashSet<Afflictions> affliction = monsterData.AfflictionList
            .OfType<int>()
            .Select(a => (Afflictions)a)
            .ToHashSet();
        
        HashSet<Habitats> biomes = monsterData.HabitatList
            .Select(h => (Habitats)h)
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