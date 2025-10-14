using MonHundle.domain.Criterias;
using MonHundle.domain.Criterias.Enums;
using MonHundle.domain.Entities;

namespace MonHundle.domain.DummyData;

public class MonsterList
{
    public static readonly List<Guessable> monsterList = new()
    {
        new Guessable("kushala_daora", new MonsterCriteria(
            new CriteriaNumber(2),
            new CriteriaNumber(8), 
            new CriteriaObject<Classifications>(Classifications.ElderDragon),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>() { Weaknesses.Thunder, Weaknesses.Poison}),
            new CriteriaSet<Diets>(new HashSet<Diets>(){Diets.Unknown}),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>()),
            new CriteriaSet<Habitats>(new HashSet<Habitats>() { Habitats.Snowfield, Habitats.Desert, Habitats.Forest })
            
        )),
        new Guessable("zinogre", new MonsterCriteria(
            new CriteriaNumber(3),
            new CriteriaNumber(6), 
            new CriteriaObject<Classifications>(Classifications.FangedWyvern),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>() { Weaknesses.Ice }),
            new CriteriaSet<Diets>(new HashSet<Diets>(){Diets.Meat}),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>() { Afflictions.Thunder }),
            new CriteriaSet<Habitats>(new HashSet<Habitats>() { Habitats.Forest })
        )),
        new Guessable("rathalos", new MonsterCriteria(
            new CriteriaNumber(1),
            new CriteriaNumber(6), 
            new CriteriaObject<Classifications>(Classifications.FlyingWyvern),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>() { Weaknesses.Thunder, Weaknesses.Dragon }),
            new CriteriaSet<Diets>(new HashSet<Diets>() {Diets.Meat}),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>() { Afflictions.Poison, Afflictions.Fire }),
            new CriteriaSet<Habitats>(new HashSet<Habitats>() { Habitats.Forest, Habitats.Volcano })
        )),
        new Guessable("glavenus", new MonsterCriteria(
            new CriteriaNumber(4),
            new CriteriaNumber(5), 
            new CriteriaObject<Classifications>(Classifications.BruteWyvern),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>() { Weaknesses.Water }),
            new CriteriaSet<Diets>(new HashSet<Diets>() { Diets.Meat }),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>() { Afflictions.Fire }),
            new CriteriaSet<Habitats>(new HashSet<Habitats>() { Habitats.Forest, Habitats.Desert, Habitats.Volcano })

        )),
        new Guessable("balahara", new MonsterCriteria(
            new CriteriaNumber(6),
            new CriteriaNumber(4), 
            new CriteriaObject<Classifications>(Classifications.Leviathan),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>() { Weaknesses.Thunder }),
            new CriteriaSet<Diets>(new HashSet<Diets>() { Diets.Meat }),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>() { Afflictions.Water }),
            new CriteriaSet<Habitats>(new HashSet<Habitats>() { Habitats.Desert })
        )),
    };
}