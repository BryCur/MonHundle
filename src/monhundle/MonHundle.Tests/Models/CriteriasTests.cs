

using MonHundle.domain.Criterias;
using MonHundle.domain.Criterias.Enums;
using MonHundle.domain.Entities;

namespace MonHundle.Tests.Models;

public class CriteriasTests
{
    [Fact]
    public void CriteriaNumber_should_return_correct()
    {
        CriteriaNumber crit1 = new CriteriaNumber(2);
        CriteriaNumber crit2 = new CriteriaNumber(2);

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }

    [Fact]
    public void CriteriaNumber_should_return_lower()
    {
        CriteriaNumber crit1 = new CriteriaNumber(2);
        CriteriaNumber crit2 = new CriteriaNumber(3);

        Assert.Equal(ComparisonResult.Lower, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaNumber_should_return_higher()
    {
        CriteriaNumber crit1 = new CriteriaNumber(3);
        CriteriaNumber crit2 = new CriteriaNumber(2);

        Assert.Equal(ComparisonResult.Higher, crit1.Compare(crit2));
    }

    [Fact]
    public void CriteriaSet_should_return_correct()
    {
        CriteriaSet<Habitats> crit1 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Desert, Habitats.Volcano});
        CriteriaSet<Habitats> crit2 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Desert, Habitats.Volcano});

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_should_return_incorrect()
    {
        CriteriaSet<Habitats> crit1 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Desert, Habitats.Volcano});
        CriteriaSet<Habitats> crit2 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Savanna, Habitats.Forest});

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_should_return_partial()
    {
        CriteriaSet<Habitats> crit1 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Desert, Habitats.Volcano});
        CriteriaSet<Habitats> crit2 = new CriteriaSet<Habitats>(new HashSet<Habitats> {Habitats.Desert, Habitats.Swamp});

        Assert.Equal(ComparisonResult.Partial, crit1.Compare(crit2));
    }
    
    
    [Fact]
    public void CriteriaObject_should_return_correct()
    {
        CriteriaObject<Diets> crit1 = new CriteriaObject<Diets>(Diets.Plant);
        CriteriaObject<Diets> crit2 = new CriteriaObject<Diets>(Diets.Plant);

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaObject_should_return_incorrect()
    {
        CriteriaObject<Diets> crit1 = new CriteriaObject<Diets>(Diets.Plant);
        CriteriaObject<Diets> crit2 = new CriteriaObject<Diets>(Diets.Meat);

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }
}