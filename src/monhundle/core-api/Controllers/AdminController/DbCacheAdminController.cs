using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers.AdminController;

[ApiController]
[Route("admin/cache")]
[ServiceFilter(typeof(ManagementAuthFilter))]
public class DbCacheAdminController(ILogger<DailyAdminController> _logger,
    IDatabaseCacheService dbCacheService) : ControllerBase
{
    [HttpDelete("all")]
    public IActionResult FlushAllDbCaches()
    {
        _logger.LogInformation("FlushAllDbCaches - flushing all DB caches");
        dbCacheService.InvalidateAll();
        return Ok();
    }

    [HttpGet("tables")]
    public IActionResult GetAvailableTables()
    {
        return Ok(dbCacheService.GetAvailableTables());
    }


    [HttpDelete("tables")]
    public IActionResult DeleteTablesCache([FromQuery(Name = "keys")] List<string> tableKeys)
    {
        if (!tableKeys.Any())
        {
            return BadRequest(new { message = "At least one table key must be specified" });
        }

        _logger.LogInformation("DeleteTablesCache - flushing cache for keys {keys}", tableKeys);
        if (!dbCacheService.TryInvalidateTables(tableKeys, out var invalidKeys))
        {
            _logger.LogWarning("DeleteTablesCache - flushing failed, unknown keys: {failedKeys}", invalidKeys);
            return BadRequest(new { message = "Unknown table keys", keys = invalidKeys });
        }

        return NoContent();
    }
    
}