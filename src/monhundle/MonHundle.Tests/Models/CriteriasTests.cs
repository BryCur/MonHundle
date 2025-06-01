using core_api.Models;
using core_api.Models.Criterias;
using core_api.Models.Criterias.Enums;

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
        CriteriaSet<Habitat> crit1 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Desert, Habitat.Volcano});
        CriteriaSet<Habitat> crit2 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Desert, Habitat.Volcano});

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_should_return_incorrect()
    {
        CriteriaSet<Habitat> crit1 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Desert, Habitat.Volcano});
        CriteriaSet<Habitat> crit2 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Savanna, Habitat.Jungle});

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_should_return_partial()
    {
        CriteriaSet<Habitat> crit1 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Desert, Habitat.Volcano});
        CriteriaSet<Habitat> crit2 = new CriteriaSet<Habitat>(new HashSet<Habitat> {Habitat.Desert, Habitat.Swamp});

        Assert.Equal(ComparisonResult.Partial, crit1.Compare(crit2));
    }
    
    
    [Fact]
    public void CriteriaObject_should_return_correct()
    {
        CriteriaObject<Diet> crit1 = new CriteriaObject<Diet>(Diet.Plant);
        CriteriaObject<Diet> crit2 = new CriteriaObject<Diet>(Diet.Plant);

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaObject_should_return_incorrect()
    {
        CriteriaObject<Diet> crit1 = new CriteriaObject<Diet>(Diet.Plant);
        CriteriaObject<Diet> crit2 = new CriteriaObject<Diet>(Diet.Meat);

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }
}