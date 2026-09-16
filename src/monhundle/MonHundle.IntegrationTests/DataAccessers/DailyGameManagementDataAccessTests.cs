using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.database;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class DailyGameManagementDataAccessTests(PostgresDatabaseFixture fixture)
{
    // A DateTime property gets forced to UTC on write (see DateTimeUtcKindConverter). Using
    // Kind=Unspecified/Local dates here (e.g. DateTime.Today) would silently shift by the
    // local timezone offset and could land on a different calendar day, so every date used
    // against history_daily_mode is built explicitly as UTC.
    private static DateTime Utc(int year, int month, int day) => new(year, month, day, 0, 0, 0, DateTimeKind.Utc);

    private static async Task<int> GetMonsterId(IServiceProvider services, string monsterCode)
    {
        GuessableMonster monster = await services.GetRequiredService<IMonsterDataAccess>()
            .GetGuessableMonsterFromCode(monsterCode);
        return monster.GetId();
    }

    [Fact]
    public async Task UpsertDailyGame_inserts_a_new_entry_when_none_exists_for_the_date()
    {
        using IServiceScope scope = fixture.CreateScope();
        IDailyGameManagementDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int monsterId = await GetMonsterId(scope.ServiceProvider, "arkveld");
        DateTime date = Utc(2010, 1, 1);

        await dataAccess.UpsertDailyGame(date, monsterId);

        List<DailyMonsterData> entries = await dataAccess.GetLastDailyGamesByDays(10_000);
        entries.Should().ContainSingle(d => d.Date.Date == date.Date && d.MonsterId == monsterId);
    }

    [Fact]
    public async Task UpsertDailyGame_updates_the_existing_entry_when_no_session_exists_yet()
    {
        using IServiceScope scope = fixture.CreateScope();
        IDailyGameManagementDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int firstMonsterId = await GetMonsterId(scope.ServiceProvider, "arkveld");
        int secondMonsterId = await GetMonsterId(scope.ServiceProvider, "doshaguma");
        DateTime date = Utc(2010, 2, 1);

        await dataAccess.UpsertDailyGame(date, firstMonsterId);
        await dataAccess.UpsertDailyGame(date, secondMonsterId);

        List<DailyMonsterData> entries = await dataAccess.GetLastDailyGamesByDays(10_000);
        entries.Should().ContainSingle(d => d.Date.Date == date.Date)
            .Which.MonsterId.Should().Be(secondMonsterId);
    }

    [Fact]
    public async Task UpsertDailyGame_throws_when_a_session_already_exists_for_that_date()
    {
        using IServiceScope scope = fixture.CreateScope();
        AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        IDailyGameManagementDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int monsterId = await GetMonsterId(scope.ServiceProvider, "arkveld");
        DateTime date = Utc(2010, 3, 1);
        
        await dataAccess.UpsertDailyGame(date, monsterId);

        Player player = new() { PlayerUid = Guid.NewGuid() };
        dbContext.Players.Add(player);
        await dbContext.SaveChangesAsync();

        dbContext.GameSessions.Add(new GameSession
        {
            GameUid = Guid.NewGuid(),
            PlayerId = player.Id!.Value,
            AnswerMonsterId = monsterId,
            GameMode = GameModes.Daily,
            State = nameof(GameStates.Ongoing),
            StartTime = date,
            LastUpdate = date
        });
        await dbContext.SaveChangesAsync();

        await Assert.ThrowsAsync<ForbiddenOperationException>(() => dataAccess.UpsertDailyGame(date, monsterId));
    }

    [Fact]
    public async Task GetLastDailyGamesByDays_only_returns_entries_within_the_window()
    {
        using IServiceScope scope = fixture.CreateScope();
        IDailyGameManagementDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int monsterId = await GetMonsterId(scope.ServiceProvider, "arkveld");
        DateTime withinWindow = DateTime.UtcNow.Date.AddDays(-1);
        DateTime outsideWindow = Utc(2010, 4, 1);

        await dataAccess.UpsertDailyGame(withinWindow, monsterId);
        await dataAccess.UpsertDailyGame(outsideWindow, monsterId);

        List<DailyMonsterData> result = await dataAccess.GetLastDailyGamesByDays(3);

        result.Should().Contain(d => d.Date.Date == withinWindow.Date);
        result.Should().NotContain(d => d.Date.Date == outsideWindow.Date);
    }

    [Fact]
    public async Task GetLastDailyGameDate_returns_the_most_recent_date_across_all_entries()
    {
        // GetLastDailyGameDate reads the max date across the WHOLE table, which every test
        // in this class shares (no per-test reset). A date far in the future keeps this
        // assertion valid no matter what dates the other tests in this class insert.
        using IServiceScope scope = fixture.CreateScope();
        IDailyGameManagementDataAccess dataAccess = scope.ServiceProvider.GetRequiredService<IDailyGameManagementDataAccess>();
        int firstMonsterId = await GetMonsterId(scope.ServiceProvider, "arkveld");
        int secondMonsterId = await GetMonsterId(scope.ServiceProvider, "rathalos");
        DateTime farFuture = Utc(2106, 1, 1);
        DateTime tomorrow = DateTime.UtcNow.Date.AddDays(1);

        await dataAccess.UpsertDailyGame(farFuture, firstMonsterId);
        await dataAccess.UpsertDailyGame(tomorrow, secondMonsterId);

        DateTime lastDate = await dataAccess.GetLastDailyGameDate();

        lastDate.Date.Should().Be(farFuture.Date);
        lastDate.Date.Should().NotBe(tomorrow.Date);
    }
}
