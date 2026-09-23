using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers.AdminController;

[ApiController]
[Route("admin/cache")]
[ServiceFilter(typeof(ManagementAuthFilter))]
[ApiExplorerSettings(GroupName = "admin")]
public class DbCacheAdminController(ILogger<DailyAdminController> _logger,
    IDatabaseCacheService dbCacheService) : ControllerBase
{
    [HttpDelete("all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult FlushAllDbCaches()
    {
        _logger.LogInformation("FlushAllDbCaches - flushing all DB caches");
        dbCacheService.InvalidateAll();
        return Ok();
    }

    [HttpGet("tables")]
    [ProducesResponseType(typeof(IReadOnlyCollection<string>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<string>> GetAvailableTables()
    {
        return Ok(dbCacheService.GetAvailableTables());
    }


    [HttpDelete("tables")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(CacheKeysErrorResponse), StatusCodes.Status400BadRequest)]
    public IActionResult DeleteTablesCache([FromQuery(Name = "keys")] List<string> tableKeys)
    {
        if (!tableKeys.Any())
        {
            return BadRequest(new CacheKeysErrorResponse("At least one table key must be specified"));
        }

        _logger.LogInformation("DeleteTablesCache - flushing cache for keys {keys}", tableKeys);
        if (!dbCacheService.TryInvalidateTables(tableKeys, out var invalidKeys))
        {
            _logger.LogWarning("DeleteTablesCache - flushing failed, unknown keys: {failedKeys}", invalidKeys);
            return BadRequest(new CacheKeysErrorResponse("Unknown table keys", invalidKeys));
        }

        return NoContent();
    }

}