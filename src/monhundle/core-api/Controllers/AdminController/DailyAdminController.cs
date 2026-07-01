using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers.AdminController;

[ApiController]
[Route("admin/daily")]
[ServiceFilter(typeof(ManagementAuthFilter))]
public class DailyAdminController(ILogger<DailyAdminController> _logger,
    IDailyGameManagementService dailyService) : ControllerBase
{
    private const int DAYS_TO_REWIND = 30;
    
    [HttpGet("last-date")]
    public async Task<IActionResult> GetLastDailyDate()
    {
        return Ok(await dailyService.GetLastDailyGameDate());
    }

    /**
     * Allows to insert/update a daily challenge by specifying both the date and the answer
     */
    [HttpPost("specific-answer")]
    public async Task<IActionResult> SetDailyGameFullAnswer([FromBody] PostDailyAnswerBody body)
    {
        return await AttemptUpsertDailyGame(body.date, body.monsterId);
    }

    /**
     * Allows to define a daily challenge for a specific date, the answer will be randomly
     * chosen, using the answer of the previous days to influence the pool of possible answer
     */
    [HttpPost("generate-answer")]
    public async Task<IActionResult> GenerateDailyGameAnswerForDate([FromQuery] DateTime date)
    {
        List<int> previousAnswers = await dailyService.GetLastDailyGameMonstersByDays(DAYS_TO_REWIND);
        int proposedAnswer = await dailyService.PickRandomMonsterWithBlacklist(previousAnswers);
        
        return await AttemptUpsertDailyGame(date, proposedAnswer);
    }

    private async Task<IActionResult> AttemptUpsertDailyGame(DateTime date, int monsterId)
    {
        try
        {
            DateTime utcDate = date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(date, DateTimeKind.Utc) : date.ToUniversalTime();
            await dailyService.InsertDailyGame(utcDate, monsterId);
            return Ok();
        }
        catch (ForbiddenOperationException e)
        {
            _logger.LogError(e.Message);
            return BadRequest(e.Message);
        }
    }
}