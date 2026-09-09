using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;

namespace MonHundle.Tests.Entities;

public class GuessableMonsterTests
{
    private static GuessableMonster Monster(
        int generation = 5,
        int threatLevel = 5,
        Classifications classification = Classifications.FlyingWyvern,
        Weaknesses[]? weaknesses = null,
        Afflictions[]? afflictions = null,
        Habitats[]? habitats = null) =>
        new(
            1,
            "monster_code",
            new MonsterCriteria(
                new CriteriaNumber(generation),
                new CriteriaNumber(threatLevel),
                new CriteriaObject<Classifications>(classification),
                new CriteriaSet<Weaknesses>((weaknesses ?? [Weaknesses.Fire]).ToHashSet()),
                new CriteriaSet<Diets>([]),
                new CriteriaSet<Afflictions>((afflictions ?? [Afflictions.Poison]).ToHashSet()),
                new CriteriaSet<Habitats>((habitats ?? [Habitats.Volcano]).ToHashSet())
            ));

    [Fact]
    public void compareTo_itself_reports_every_criterion_as_correct()
    {
        GuessableMonster monster = Monster();

        MonsterComparisonResult result = monster.compareTo(monster);

        Assert.Equal(ComparisonOutcomes.Correct, result.Generation);
        Assert.Equal(ComparisonOutcomes.Correct, result.ThreatLevel);
        Assert.Equal(ComparisonOutcomes.Correct, result.Classification);
        Assert.Equal(ComparisonOutcomes.Correct, result.Weaknesses);
        Assert.Equal(ComparisonOutcomes.Correct, result.Afflictions);
        Assert.Equal(ComparisonOutcomes.Correct, result.Habitats);
    }

    [Fact]
    public void compareTo_a_fully_different_monster_reports_no_criterion_as_correct()
    {
        GuessableMonster answer = Monster(
            generation: 5, threatLevel: 5, classification: Classifications.FlyingWyvern,
            weaknesses: [Weaknesses.Fire], afflictions: [Afflictions.Poison], habitats: [Habitats.Volcano]);
        GuessableMonster guess = Monster(
            generation: 1, threatLevel: 9, classification: Classifications.Leviathan,
            weaknesses: [Weaknesses.Ice], afflictions: [Afflictions.Sleep], habitats: [Habitats.Cave]);

        MonsterComparisonResult result = answer.compareTo(guess);

        Assert.NotEqual(ComparisonOutcomes.Correct, result.Generation);
        Assert.NotEqual(ComparisonOutcomes.Correct, result.ThreatLevel);
        Assert.NotEqual(ComparisonOutcomes.Correct, result.Classification);
        Assert.NotEqual(ComparisonOutcomes.Correct, result.Weaknesses);
        Assert.NotEqual(ComparisonOutcomes.Correct, result.Afflictions);
        Assert.NotEqual(ComparisonOutcomes.Correct, result.Habitats);
    }

    [Fact]
    public void compareTo_does_not_cross_wire_the_two_numeric_criteria()
    {
        GuessableMonster answer = Monster(generation: 3, threatLevel: 7);
        GuessableMonster guess = Monster(generation: 9, threatLevel: 7);

        MonsterComparisonResult result = answer.compareTo(guess);

        Assert.NotEqual(ComparisonOutcomes.Correct, result.Generation);
        Assert.Equal(ComparisonOutcomes.Correct, result.ThreatLevel);
    }

    private static GuessableMonsterData Data(int[]? classificationList = null) =>
        new(
            MonsterId: 42,
            MonsterCode: "rathalos",
            Generation: 1,
            ThreatLevel: 5,
            ClassificationList: classificationList ?? [(int)Classifications.FlyingWyvern],
            WeaknessList: [(int)Weaknesses.Dragon],
            AfflictionList: [(int)Afflictions.Fire],
            HabitatList: [(int)Habitats.Forest],
            GamesList: ["MHWilds"]);

    [Fact]
    public void FromData_maps_identity_and_casts_the_int_columns_to_their_enums()
    {
        GuessableMonster monster = GuessableMonster.FromData(Data());
        MonsterCriteria criteria = monster.GetCriterias();

        Assert.Equal(42, monster.GetId());
        Assert.Equal("rathalos", monster.GetCode());
        Assert.Equal(1, criteria.Generation.GetValue());
        Assert.Equal(Classifications.FlyingWyvern, criteria.Classification.GetValue());
        Assert.Contains(Weaknesses.Dragon, criteria.WeaknessesSet.GetValue());
        Assert.Contains(Afflictions.Fire, criteria.InflictedAilments.GetValue());
        Assert.Contains(Habitats.Forest, criteria.Habitat.GetValue());
    }

    [Fact]
    public void FromData_throws_when_the_classification_list_is_empty()
    {
        Assert.Throws<InvalidOperationException>(() => GuessableMonster.FromData(Data(classificationList: [])));
    }
}
