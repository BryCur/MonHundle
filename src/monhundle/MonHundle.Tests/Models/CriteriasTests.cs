using core_api.Models;
using core_api.Models.Criterias;

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
    public void CriteriaNumber_should_return_incorrect()
    {
        CriteriaNumber crit1 = new CriteriaNumber(2);
        CriteriaNumber crit2 = new CriteriaNumber(3);

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }

    [Fact]
    public void CriteriaSet_shouhld_return_correct()
    {
        CriteriaSet<String> crit1 = new CriteriaSet<string>(new HashSet<string> {"test", "test2"});
        CriteriaSet<String> crit2 = new CriteriaSet<string>(new HashSet<string> {"test", "test2"});

        Assert.Equal(ComparisonResult.Correct, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_shouhld_return_incorrect()
    {
        CriteriaSet<String> crit1 = new CriteriaSet<string>(new HashSet<string> {"test", "test2"});
        CriteriaSet<String> crit2 = new CriteriaSet<string>(new HashSet<string> {"test3", "test4"});

        Assert.Equal(ComparisonResult.Incorrect, crit1.Compare(crit2));
    }
    
    [Fact]
    public void CriteriaSet_shouhld_return_partial()
    {
        CriteriaSet<String> crit1 = new CriteriaSet<string>(new HashSet<string> {"test", "test2"});
        CriteriaSet<String> crit2 = new CriteriaSet<string>(new HashSet<string> {"test2", "test3"});

        Assert.Equal(ComparisonResult.Partial, crit1.Compare(crit2));
    }
}