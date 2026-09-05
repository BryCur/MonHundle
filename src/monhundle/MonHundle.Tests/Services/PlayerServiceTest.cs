using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
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
    public void GetPlayerProfile_throws_DataNotFound_if_guid_not_valid()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        Assert.ThrowsAsync<DataNotFoundException>(async () => await service.GetPlayerProfile(missingUid));
    }
    
        
    [Fact]
    public void GetPlayerProfile_throws_DataNotFound_if_player_id_null()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid))
            .ReturnsAsync(new Player() { PlayerUid = missingUid, Id = null});
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        Assert.ThrowsAsync<DataNotFoundException>(async () => await service.GetPlayerProfile(missingUid));
    }

    [Fact]
    public async Task GetPlayerProfile_returns_correctly_if_uid_valid()
    {
        Player player = new Player() {
            PlayerUid = Guid.NewGuid(), 
            Id = 1, 
            JsonPreferences = new PlayerPreferencesStruct() {
                    enableTableAccessibility = true,
                    gameList = ["MHWilds", "MHR", "MHW"]
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

    }
    
    [Fact]
    public async Task SaveUserPreferences_calls_update_method_if_guid_valid()
    {
        Guid callParam = Guid.NewGuid();
        PlayerPreferencesStruct preferences = new PlayerPreferencesStruct()
            { enableTableAccessibility = true, gameList = [] };
        Player player = new Player() {
            PlayerUid = callParam,
            Id = 1, 
            JsonPreferences = preferences
        };
        
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync(player);
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        await service.SaveUserPreferences(callParam, preferences);
        
        _playerDataAccess.Verify(pda => pda.GetPlayer(callParam), Times.Once);
        _playerDataAccess.Verify(pda => pda.UpdatePlayer(player), Times.Once);
    }
    
    [Fact]
    public async Task SaveUserPreferences_throws_DataNotFound_if_guid_not_found()
    {
        Guid callParam = Guid.NewGuid();
        PlayerPreferencesStruct preferences = new PlayerPreferencesStruct()
            { enableTableAccessibility = true, gameList = [] };
        
        _playerDataAccess.Setup(pda => pda.GetPlayer(callParam)).ReturnsAsync((Player?) null);
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        await Assert.ThrowsAsync<DataNotFoundException>(() => service.SaveUserPreferences(callParam, preferences));
        _playerDataAccess.Verify(pda => pda.GetPlayer(callParam), Times.Once);
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