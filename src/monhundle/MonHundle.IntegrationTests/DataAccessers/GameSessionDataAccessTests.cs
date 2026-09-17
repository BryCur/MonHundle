using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.IntegrationTests.Fixtures;

namespace MonHundle.IntegrationTests.DataAccessers;

[Collection(DatabaseCollection.Name)]
public class GameSessionDataAccessTests(PostgresDatabaseFixture fixture) : DataAccessTestBase(fixture)
{
    private static async Task<(int PlayerId, Guid PlayerUid)> CreatePlayer(IServiceProvider services)
    {
        Guid playerUid = Guid.NewGuid();
        Player player = new() { PlayerUid = playerUid };
        await services.GetRequiredService<IPlayerDataAccess>().InsertPlayer(player);
        return (player.Id!.Value, playerUid);
    }

    private static Task<GuessableMonster> GetAnswerMonster(IServiceProvider services) =>
        services.GetRequiredService<IMonsterDataAccess>().GetGuessableMonsterFromCode("arkveld");

    [Fact]
    public async Task CreateGame_then_GetGame_returns_the_created_session()
    {
        using IServiceScope scope = Fixture.CreateScope();
        (int playerId, Guid playerUid) = await CreatePlayer(scope.ServiceProvider);
        GuessableMonster answer = await GetAnswerMonster(scope.ServiceProvider);
        IGameDataAccess gameDataAccess = scope.ServiceProvider.GetRequiredService<IGameDataAccess>();

        Game game = new()
        {
            Id = Guid.NewGuid(),
            PlayerId = playerUid,
            GameMode = GameModes.Unlimited,
            Answer = answer,
            StartTime = DateTime.UtcNow
        };
        await gameDataAccess.CreateGame(game);

        GameSession stored = await gameDataAccess.GetGame(game.Id, playerId);

        stored.GameUid.Should().Be(game.Id);
        stored.PlayerId.Should().Be(playerId);
        stored.AnswerMonsterId.Should().Be(answer.GetId());
        stored.GameMode.Should().Be(GameModes.Unlimited);
        stored.State.Should().Be(nameof(GameStates.Ongoing));
    }

    [Fact]
    public async Task CreateGame_throws_when_the_player_does_not_exist()
    {
        using IServiceScope scope = Fixture.CreateScope();
        GuessableMonster answer = await GetAnswerMonster(scope.ServiceProvider);
        IGameDataAccess gameDataAccess = scope.ServiceProvider.GetRequiredService<IGameDataAccess>();

        Game game = new()
        {
            Id = Guid.NewGuid(),
            PlayerId = Guid.NewGuid(), // no matching player row
            GameMode = GameModes.Unlimited,
            Answer = answer,
            StartTime = DateTime.UtcNow
        };

        await Assert.ThrowsAsync<DataNotFoundException>(() => gameDataAccess.CreateGame(game));
    }

    [Fact]
    public async Task SaveGame_persists_changes_made_after_the_game_was_loaded()
    {
        Guid gameId = Guid.NewGuid();
        int playerId;

        // Loaded and saved from separate scopes, mirroring two distinct HTTP requests each
        // getting their own AppDbContext - SaveGame relies on EF's disconnected-entity
        // Update() to work correctly here, which a single shared context would not exercise.
        using (IServiceScope arrangeScope = Fixture.CreateScope())
        {
            (playerId, Guid playerUid) = await CreatePlayer(arrangeScope.ServiceProvider);
            GuessableMonster answer = await GetAnswerMonster(arrangeScope.ServiceProvider);
            Game game = new()
            {
                Id = gameId,
                PlayerId = playerUid,
                GameMode = GameModes.Unlimited,
                Answer = answer,
                StartTime = DateTime.UtcNow
            };
            await arrangeScope.ServiceProvider.GetRequiredService<IGameDataAccess>().CreateGame(game);
        }
        
        GameSession loaded;
        using (IServiceScope loadScope = Fixture.CreateScope())
        {
            loaded = await loadScope.ServiceProvider.GetRequiredService<IGameDataAccess>().GetGame(gameId, playerId);
            loaded.State = nameof(GameStates.Win);
            loaded.EndTime = DateTime.UtcNow;
        }

        using (IServiceScope saveScope = Fixture.CreateScope())
        {
            await saveScope.ServiceProvider.GetRequiredService<IGameDataAccess>().SaveGame(loaded);
        }

        using IServiceScope assertScope = Fixture.CreateScope();
        GameSession updated = await assertScope.ServiceProvider.GetRequiredService<IGameDataAccess>().GetGame(gameId, playerId);

        updated.State.Should().Be(nameof(GameStates.Win));
        updated.EndTime.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDailyGameForPlayerAtDate_returns_the_matching_daily_game()
    {
        using IServiceScope scope = Fixture.CreateScope();
        (int playerId, Guid playerUid) = await CreatePlayer(scope.ServiceProvider);
        GuessableMonster answer = await GetAnswerMonster(scope.ServiceProvider);
        IGameDataAccess gameDataAccess = scope.ServiceProvider.GetRequiredService<IGameDataAccess>();
        DateTime today = DateTime.UtcNow;

        Game dailyGame = new()
        {
            Id = Guid.NewGuid(),
            PlayerId = playerUid,
            GameMode = GameModes.Daily,
            Answer = answer,
            StartTime = today
        };
        await gameDataAccess.CreateGame(dailyGame);

        GameSession? found = await gameDataAccess.GetDailyGameForPlayerAtDate(today, playerId);

        found.Should().NotBeNull();
        found!.GameUid.Should().Be(dailyGame.Id);
    }

    [Fact]
    public async Task GetDailyGameForPlayerAtDate_returns_null_when_no_game_matches()
    {
        using IServiceScope scope = Fixture.CreateScope();
        (int playerId, _) = await CreatePlayer(scope.ServiceProvider);
        IGameDataAccess gameDataAccess = scope.ServiceProvider.GetRequiredService<IGameDataAccess>();

        GameSession? found = await gameDataAccess.GetDailyGameForPlayerAtDate(DateTime.UtcNow, playerId);

        found.Should().BeNull();
    }

    [Fact]
    public async Task GetOngoingUnlimitedGamesForPlayer_returns_only_ongoing_unlimited_games()
    {
        using IServiceScope scope = Fixture.CreateScope();
        (int playerId, Guid playerUid) = await CreatePlayer(scope.ServiceProvider);
        GuessableMonster answer = await GetAnswerMonster(scope.ServiceProvider);
        IGameDataAccess gameDataAccess = scope.ServiceProvider.GetRequiredService<IGameDataAccess>();

        Game ongoingUnlimited = new()
        {
            Id = Guid.NewGuid(), PlayerId = playerUid, GameMode = GameModes.Unlimited,
            Answer = answer, State = GameStates.Ongoing, StartTime = DateTime.UtcNow
        };
        Game finishedUnlimited = new()
        {
            Id = Guid.NewGuid(), PlayerId = playerUid, GameMode = GameModes.Unlimited,
            Answer = answer, State = GameStates.Win, StartTime = DateTime.UtcNow
        };
        Game ongoingDaily = new()
        {
            Id = Guid.NewGuid(), PlayerId = playerUid, GameMode = GameModes.Daily,
            Answer = answer, State = GameStates.Ongoing, StartTime = DateTime.UtcNow
        };
        await gameDataAccess.CreateGame(ongoingUnlimited);
        await gameDataAccess.CreateGame(finishedUnlimited);
        await gameDataAccess.CreateGame(ongoingDaily);

        List<GameSession> result = await gameDataAccess.GetOngoingUnlimitedGamesForPlayer(playerId);

        result.Select(g => g.GameUid).Should().BeEquivalentTo([ongoingUnlimited.Id]);
    }
}
