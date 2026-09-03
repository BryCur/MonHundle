


using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces;

namespace MonHundle.Tests.Models;

public class CriteriasTests
{
    private static readonly HashSet<Habitats> RefSet = [Habitats.Desert, Habitats.Volcano ];
    private static readonly HashSet<Habitats> CompSetCorrect = [Habitats.Desert, Habitats.Volcano ];
    private static readonly HashSet<Habitats> CompSetPartial = [Habitats.Desert, Habitats.Forest ];
    private static readonly HashSet<Habitats> CompSetIncorrect = [Habitats.Savanna, Habitats.Highland ];
    
    public static IEnumerable<object[]> Data =>
        new List<object[]>
        {
            new object[] { RefSet, CompSetCorrect, ComparisonOutcomes.Correct },
            new object[] { RefSet, CompSetPartial, ComparisonOutcomes.Partial },
            new object[] { RefSet, CompSetIncorrect, ComparisonOutcomes.Incorrect },
        };
    
    [Theory]
    [InlineData(2, 2, ComparisonOutcomes.Correct)]
    [InlineData(2, 3, ComparisonOutcomes.Lower)]
    [InlineData(3, 2, ComparisonOutcomes.Higher)]
    public void CriteriaNumber_should_return_correct_comparison_result(int num1, int num2, ComparisonOutcomes expected)
    {
        CriteriaNumber crit1 = new CriteriaNumber(num1);
        CriteriaNumber crit2 = new CriteriaNumber(num2);

        Assert.Equal(expected, crit1.Compare(crit2));
    }
    
    [Theory]
    [MemberData(nameof(Data))]
    public void CriteriaSet_should_return_correct_comparison_result(HashSet<Habitats> set1, HashSet<Habitats> set2, ComparisonOutcomes expected)
    {
        CriteriaSet<Habitats> crit1 = new CriteriaSet<Habitats>(set1);
        CriteriaSet<Habitats> crit2 = new CriteriaSet<Habitats>(set2);

        Assert.Equal(expected, crit1.Compare(crit2));
    }
    
    [Theory]
    [InlineData(Diets.Plant, Diets.Plant, ComparisonOutcomes.Correct)]
    [InlineData(Diets.Plant, Diets.Meat, ComparisonOutcomes.Incorrect)]
    public void CriteriaObject_should_return_correct_comparison_result(Diets d1, Diets d2, ComparisonOutcomes expected)
    {
        CriteriaObject<Diets> crit1 = new CriteriaObject<Diets>(d1);
        CriteriaObject<Diets> crit2 = new CriteriaObject<Diets>(d2);

        Assert.Equal(expected, crit1.Compare(crit2));
    }
}