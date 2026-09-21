using core_api.Controllers.AdminController;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Interfaces.Services;
using Moq;

namespace MonHundle.Tests.Controllers;

/// <summary>
/// Direct controller unit tests: the <see cref="core_api.Filters.ManagementAuthFilter"/> guarding
/// these routes runs only in the MVC pipeline and is covered separately.
/// </summary>
public class DbCacheAdminControllerTest
{
    private readonly Mock<IDatabaseCacheService> _cacheService = new();

    private DbCacheAdminController BuildController() =>
        new(NullLogger<DailyAdminController>.Instance, _cacheService.Object);

    [Fact]
    public void FlushAllDbCaches_invalidates_everything_and_returns_ok()
    {
        IActionResult result = BuildController().FlushAllDbCaches();

        _cacheService.Verify(s => s.InvalidateAll(), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void GetAvailableTables_returns_the_list_from_the_service()
    {
        string[] tables = ["ef_games", "ef_players"];
        _cacheService.Setup(s => s.GetAvailableTables()).Returns(tables);

        ActionResult<IReadOnlyCollection<string>> result = BuildController().GetAvailableTables();

        OkObjectResult ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Same(tables, ok.Value);
    }

    [Fact]
    public void DeleteTablesCache_returns_bad_request_when_no_key_is_provided()
    {
        IActionResult result = BuildController().DeleteTablesCache([]);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void DeleteTablesCache_returns_bad_request_when_a_key_is_unknown()
    {
        IEnumerable<string> invalidKeys = new[] { "bogus" };
        _cacheService.Setup(s => s.TryInvalidateTables(It.IsAny<IEnumerable<string>>(), out invalidKeys))
            .Returns(false);

        IActionResult result = BuildController().DeleteTablesCache(["bogus"]);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void DeleteTablesCache_returns_no_content_when_every_key_is_valid()
    {
        IEnumerable<string> invalidKeys = Array.Empty<string>();
        _cacheService.Setup(s => s.TryInvalidateTables(It.IsAny<IEnumerable<string>>(), out invalidKeys))
            .Returns(true);

        IActionResult result = BuildController().DeleteTablesCache(["games"]);

        Assert.IsType<NoContentResult>(result);
    }
}
