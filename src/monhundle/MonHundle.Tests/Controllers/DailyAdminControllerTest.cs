using core_api.Controllers.AdminController;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.Services;
using Moq;

namespace MonHundle.Tests.Controllers;

public class DailyAdminControllerTest
{
    private readonly Mock<IDailyGameManagementService> _dailyService = new();

    private DailyAdminController BuildController() =>
        new(NullLogger<DailyAdminController>.Instance, _dailyService.Object);

    [Fact]
    public async Task GetLastDailyDate_returns_the_date_from_the_service()
    {
        DateTime expected = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        _dailyService.Setup(s => s.GetLastDailyGameDate()).ReturnsAsync(expected);

        ActionResult<DateTime> result = await BuildController().GetLastDailyDate();

        OkObjectResult ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task SetDailyGameFullAnswer_normalizes_an_unspecified_date_to_utc()
    {
        DateTime unspecifiedDate = new(2026, 3, 15, 12, 0, 0, DateTimeKind.Unspecified);
        DateTime? captured = null;
        _dailyService.Setup(s => s.InsertDailyGame(It.IsAny<DateTime>(), It.IsAny<int>()))
            .Callback<DateTime, int>((date, _) => captured = date)
            .Returns(Task.CompletedTask);

        IActionResult result = await BuildController().SetDailyGameFullAnswer(new PostDailyAnswerBody(unspecifiedDate, 1));

        Assert.IsType<OkResult>(result);
        Assert.Equal(DateTimeKind.Utc, captured!.Value.Kind);
        Assert.Equal(unspecifiedDate.Ticks, captured.Value.Ticks); // SpecifyKind relabels the kind without shifting the clock value
    }

    [Fact]
    public async Task SetDailyGameFullAnswer_converts_a_non_utc_date_to_utc()
    {
        DateTime localDate = DateTime.SpecifyKind(new DateTime(2026, 3, 15, 12, 0, 0), DateTimeKind.Local);
        DateTime? captured = null;
        _dailyService.Setup(s => s.InsertDailyGame(It.IsAny<DateTime>(), It.IsAny<int>()))
            .Callback<DateTime, int>((date, _) => captured = date)
            .Returns(Task.CompletedTask);

        await BuildController().SetDailyGameFullAnswer(new PostDailyAnswerBody(localDate, 1));

        Assert.Equal(DateTimeKind.Utc, captured!.Value.Kind);
        Assert.Equal(localDate.ToUniversalTime(), captured.Value); // Local (not Unspecified) takes the ToUniversalTime() branch, which does shift the clock value
    }

    [Fact]
    public async Task SetDailyGameFullAnswer_returns_bad_request_when_the_daily_game_is_forbidden()
    {
        _dailyService.Setup(s => s.InsertDailyGame(It.IsAny<DateTime>(), It.IsAny<int>()))
            .ThrowsAsync(new ForbiddenOperationException("sessions already exist"));

        IActionResult result = await BuildController().SetDailyGameFullAnswer(new PostDailyAnswerBody(DateTime.UtcNow, 1));

        BadRequestObjectResult badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("sessions already exist", badRequest.Value);
    }

    [Fact]
    public async Task GenerateDailyGameAnswerForDate_picks_a_monster_excluding_the_recent_answers()
    {
        List<int> recentAnswers = [1, 2, 3];
        _dailyService.Setup(s => s.GetLastDailyGameMonstersByDays(30)).ReturnsAsync(recentAnswers);
        _dailyService.Setup(s => s.PickRandomMonsterWithBlacklist(recentAnswers)).ReturnsAsync(42);

        IActionResult result = await BuildController().GenerateDailyGameAnswerForDate(DateTime.UtcNow);

        Assert.IsType<OkResult>(result);
        _dailyService.Verify(s => s.InsertDailyGame(It.IsAny<DateTime>(), 42), Times.Once);
    }
}
