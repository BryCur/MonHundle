using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;

public class PlayerServiceTest
{
    private readonly Mock<IPlayerDataAccess> _playerDataAccess = new ();
    private readonly Mock<IGameDataAccess> _gameDataAccess = new ();
    private readonly NullLogger<PlayerService> _logger = new ();

    [Fact]
    public void AuthPlayer_creates_new_player_if_uid_is_null()
    {
        _playerDataAccess.Setup(pda => pda.InsertPlayer(It.IsAny<Player>()));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        var result =  service.AuthPlayer(null);
        
        Assert.NotNull(result);
    }

    [Fact]
    public async Task AuthPlayer_returns_existing_record_if_guid_valid()
    {
        Player player = new Player() {PlayerUid = Guid.NewGuid()};
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid))
            .ReturnsAsync(player);
        _playerDataAccess.Setup(pda => pda.UpdatePlayer(player));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        Guid result = await service.AuthPlayer(player.PlayerUid.ToString());
        
        Assert.Equal(player.PlayerUid, result);
    }

    [Fact]
    public async Task AuthPlayer_refreshes_last_connection_of_returning_player()
    {
        Player player = new Player() { PlayerUid = Guid.NewGuid(), last_connection = DateTime.UtcNow.AddDays(-10) };
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        DateTime beforeCall = DateTime.UtcNow;
        await service.AuthPlayer(player.PlayerUid.ToString());

        Assert.True(player.last_connection >= beforeCall);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(player), Times.Once);
    }

    [Fact]
    public async Task AuthPlayer_issues_new_identity_if_uid_not_recognised()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid)).ReturnsAsync((Player?)null);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        Guid result = await service.AuthPlayer(missingUid.ToString());

        Assert.NotEqual(missingUid, result);
        Assert.NotEqual(Guid.Empty, result);
        _playerDataAccess.Verify(pda => pda.InsertPlayer(It.Is<Player>(p => p.PlayerUid == result)), Times.Once);
    }

    [Fact]
    public async Task AuthPlayer_issues_new_identity_if_uid_unparseable()
    {
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        Guid result = await service.AuthPlayer("not-a-guid");

        Assert.NotEqual(Guid.Empty, result);
        _playerDataAccess.Verify(pda => pda.InsertPlayer(It.Is<Player>(p => p.PlayerUid == result)), Times.Once);
        _playerDataAccess.Verify(pda => pda.GetPlayer(It.IsAny<Guid>()), Times.Never);
    }
    
    [Fact]
    public async Task GetPlayerProfile_throws_DataNotFound_if_guid_not_valid()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        await Assert.ThrowsAsync<DataNotFoundException>(async () => await service.GetPlayerProfile(missingUid));
    }
    
        
    [Fact]
    public async Task GetPlayerProfile_throws_DataNotFound_if_player_id_null()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid))
            .ReturnsAsync(new Player() { PlayerUid = missingUid, Id = null});
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        await Assert.ThrowsAsync<DataNotFoundException>(async () => await service.GetPlayerProfile(missingUid));
    }

    [Fact]
    public async Task GetPlayerProfile_returns_correctly_if_uid_valid()
    {
        Player player = new Player() {
            PlayerUid = Guid.NewGuid(), 
            Id = 1, 
            JsonPreferences = new PlayerPreferencesStruct() {
                    tableVisualAid = true,
                    gameList = ["MHWilds", "MHR", "MHW"],
                    theme = "classic",
                    preferredLanguage = "fr"
            }
        };
        
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid))
            .ReturnsAsync(player);
        _gameDataAccess.Setup(gda => gda.GetOngoingUnlimitedGamesForPlayer(player.Id.Value))
            .ReturnsAsync([
               new GameSession() { GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing) } 
            ]);
        _gameDataAccess.Setup(gda => gda.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), player.Id.Value))
            .ReturnsAsync(new GameSession() {GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing)});
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        var result = await service.GetPlayerProfile(player.PlayerUid);

        Assert.NotNull(result);
        Assert.True(result.preferences.tableVisualAid);
        Assert.Equal(new[] { "MHWilds", "MHR", "MHW" }, result.preferences.gameList);
        Assert.Equal("classic", result.preferences.theme);
        Assert.Equal("fr", result.preferences.preferredLanguage);
        Assert.NotNull(result.currentDailyGameUuid);
        Assert.NotNull(result.currentUnlimitedGameUuid);
    }

    [Fact]
    public async Task GetPlayerProfile_returns_defaults_when_no_games_and_no_preferences()
    {
        Player player = new Player() { PlayerUid = Guid.NewGuid(), Id = 1, JsonPreferences = null };

        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);
        _gameDataAccess.Setup(gda => gda.GetOngoingUnlimitedGamesForPlayer(1)).ReturnsAsync([]);
        _gameDataAccess.Setup(gda => gda.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), 1)).ReturnsAsync((GameSession?)null);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        var result = await service.GetPlayerProfile(player.PlayerUid);

        Assert.False(result.preferences.tableVisualAid);
        Assert.Empty(result.preferences.gameList);
        Assert.Null(result.currentDailyGameUuid);
        Assert.Null(result.currentUnlimitedGameUuid);
    }

    [Fact]
    public async Task GetPlayerProfile_returns_the_most_recent_ongoing_unlimited_game()
    {
        Player player = new Player() { PlayerUid = Guid.NewGuid(), Id = 1 };
        GameSession older = new GameSession()
            { GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing), StartTime = DateTime.UtcNow.AddHours(-3) };
        GameSession newer = new GameSession()
            { GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing), StartTime = DateTime.UtcNow };

        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);
        _gameDataAccess.Setup(gda => gda.GetOngoingUnlimitedGamesForPlayer(1)).ReturnsAsync([older, newer]);
        _gameDataAccess.Setup(gda => gda.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), 1)).ReturnsAsync((GameSession?)null);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        var result = await service.GetPlayerProfile(player.PlayerUid);

        Assert.Equal(newer.GameUid.ToString(), result.currentUnlimitedGameUuid);
    }

    [Fact]
    public async Task SetUserPreferences_calls_update_method_if_guid_valid()
    {
        Guid callParam = Guid.NewGuid();
        PlayerPreferencesStruct preferences = new PlayerPreferencesStruct()
            { tableVisualAid = true, gameList = [] };
        Player player = new Player() {
            PlayerUid = callParam,
            Id = 1, 
            JsonPreferences = preferences
        };
        
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync(player);
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.SetUserPreferences(callParam, preferences);
        
        _playerDataAccess.Verify(pda => pda.GetPlayer(callParam), Times.Once);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(player), Times.Once);
    }
    
    [Fact]
    public async Task SetUserPreferences_throws_DataNotFound_if_guid_not_found()
    {
        Guid callParam = Guid.NewGuid();
        PlayerPreferencesStruct preferences = new PlayerPreferencesStruct()
            { tableVisualAid = true, gameList = [] };
        
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync((Player?) null);
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        await Assert.ThrowsAsync<DataNotFoundException>(() => service.SetUserPreferences(callParam, preferences));
        _playerDataAccess.Verify(pda => pda.GetPlayer(callParam), Times.Once);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(It.IsAny<Player>()), Times.Never);
    }

    [Fact]
    public async Task UpdateUserPreferences_only_changes_the_provided_fields()
    {
        Player player = new Player() {
            PlayerUid = Guid.NewGuid(),
            Id = 1,
            JsonPreferences = new PlayerPreferencesStruct() {
                version = PlayerPreferencesStruct.CurrentVersion,
                tableVisualAid = true,
                gameList = ["MHWilds"],
                theme = "classic",
                preferredLanguage = "en"
            }
        };
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.UpdateUserPreferences(player.PlayerUid, new UpdatePreferencesBody(null, null, "dark", null));

        PlayerPreferencesStruct saved = player.JsonPreferences!.Value;
        Assert.Equal("dark", saved.theme);
        Assert.True(saved.tableVisualAid);
        Assert.Equal(new[] { "MHWilds" }, saved.gameList);
        Assert.Equal("en", saved.preferredLanguage);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(player), Times.Once);
    }

    [Fact]
    public async Task UpdateUserPreferences_replaces_every_provided_field()
    {
        Player player = new Player() {
            PlayerUid = Guid.NewGuid(),
            Id = 1,
            JsonPreferences = new PlayerPreferencesStruct() {
                tableVisualAid = true,
                gameList = ["MHWilds"],
                theme = "classic",
                preferredLanguage = "en"
            }
        };
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.UpdateUserPreferences(
            player.PlayerUid,
            new UpdatePreferencesBody(false, ["MHW", "MHR"], "dark", "fr"));

        PlayerPreferencesStruct saved = player.JsonPreferences!.Value;
        Assert.False(saved.tableVisualAid);
        Assert.Equal(new[] { "MHW", "MHR" }, saved.gameList);
        Assert.Equal("dark", saved.theme);
        Assert.Equal("fr", saved.preferredLanguage);
    }

    [Fact]
    public async Task UpdateUserPreferences_starts_from_defaults_when_no_preferences_are_stored()
    {
        Player player = new Player() { PlayerUid = Guid.NewGuid(), Id = 1, JsonPreferences = null };
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.UpdateUserPreferences(player.PlayerUid, new UpdatePreferencesBody(null, null, null, "fr"));

        Assert.NotNull(player.JsonPreferences);
        PlayerPreferencesStruct saved = player.JsonPreferences.Value;
        Assert.Equal(PlayerPreferencesStruct.CurrentVersion, saved.version);
        Assert.False(saved.tableVisualAid);
        Assert.Empty(saved.gameList);
        Assert.Null(saved.theme);
        Assert.Equal("fr", saved.preferredLanguage);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(player), Times.Once);
    }

    [Fact]
    public async Task UpdateUserPreferences_upgrades_a_row_written_before_versioning()
    {
        // a row stored before versioning: version 0, and possibly no gameList key at all
        Player player = new Player() {
            PlayerUid = Guid.NewGuid(),
            Id = 1,
            JsonPreferences = new PlayerPreferencesStruct() { version = 0, tableVisualAid = true, gameList = null! }
        };
        _playerDataAccess.Setup(pda => pda.GetPlayer(player.PlayerUid)).ReturnsAsync(player);

        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.UpdateUserPreferences(player.PlayerUid, new UpdatePreferencesBody(null, null, "classic", null));

        PlayerPreferencesStruct saved = player.JsonPreferences!.Value;
        Assert.Equal(PlayerPreferencesStruct.CurrentVersion, saved.version);
        Assert.NotNull(saved.gameList);
        Assert.Empty(saved.gameList);
        Assert.True(saved.tableVisualAid);
    }

    [Fact]
    public async Task UpdateUserPreferences_throws_DataNotFound_if_guid_not_found()
    {
        Guid callParam = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync((Player?) null);
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);

        await Assert.ThrowsAsync<DataNotFoundException>(
            () => service.UpdateUserPreferences(callParam, new UpdatePreferencesBody(true, null, null, null)));
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(It.IsAny<Player>()), Times.Never);
    }

    [Theory]
    [InlineData(true, true)]
    [InlineData(false, false)]
    public async Task CheckPlayerExists_returns_result_according_to_db(bool playerFound, bool expectedOutcome)
    {
        Guid callParam = Guid.NewGuid();
        Player fromDb = new Player() { PlayerUid = Guid.NewGuid() };
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync(playerFound ? fromDb : null);
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        Assert.Equal(expectedOutcome, await service.CheckPlayerExists(callParam));
        _playerDataAccess.Verify(pda => pda.GetPlayer(callParam), Times.Once);
    }
}