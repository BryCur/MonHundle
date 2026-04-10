using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers.AdminController;

[ApiController]
[Route("admin/daily")]
public class DailyAdminController(ILogger<DailyAdminController> _logger,
    IDailyGameManagementService dailyService) : ControllerBase
{
    private const int DAYS_TO_REWIND = 30;
    
    [HttpGet("last-date")]
    public IActionResult GetLastDailyDate()
    {
        return Ok(dailyService.GetLastDailyGameDate());
    }

    /**
     * Allows to insert/update a daily challenge by specifying both the date and the answer
     */
    [HttpPost("specific-answer")]
    public IActionResult SetDailyGameFullAnswer([FromBody] PostDailyAnswerBody body)
    {
        return AttemptUpsertDailyGame(body.date, body.monsterId);
    }

    /**
     * Allows to define a daily challenge for a specific date, the answer will be randomly
     * chosen, using the answer of the previous days to influence the pool of possible answer
     */
    [HttpPost("generate-answer")]
    public IActionResult GenerateDailyGameAnswerForDate([FromQuery] DateTime date)
    {
        List<int> previousAnswers = dailyService.GetLastDailyGameMonstersByDays(DAYS_TO_REWIND);
        int proposedAnswer = dailyService.PickRandomMonsterWithBlacklist(previousAnswers);
        
        return AttemptUpsertDailyGame(date, proposedAnswer);
    }

    private IActionResult AttemptUpsertDailyGame(DateTime date, int monsterId)
    {
        try
        {
            DateTime utcDate = date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(date, DateTimeKind.Utc) : date.ToUniversalTime();
            dailyService.InsertDailyGame(utcDate, monsterId);
            return Ok();
        }
        catch (ForbiddenOperationException e)
        {
            _logger.LogError(e.Message);
            return BadRequest(e.Message);
        }
    }
}