using Microsoft.Extensions.DependencyInjection;
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
            .Returns(Task.FromResult(player));
        _playerDataAccess.Setup(pda => pda.UpdatePlayer(player));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        Guid result = await service.AuthPlayer(player.PlayerUid.ToString());
        
        Assert.Equal(player.PlayerUid, result);
    }

    [Fact]
    public void AuthPlayer_throw_DataNotFound_if_uid_not_valid()
    {
        Guid missingUid = Guid.NewGuid();
        _playerDataAccess.Setup(pda => pda.GetPlayer(missingUid));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        Assert.ThrowsAsync<DataNotFoundException>(async () => await service.AuthPlayer(missingUid.ToString()));
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
            .Returns(Task.FromResult(new Player() { PlayerUid = missingUid, Id = null}));
        
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
            .Returns(Task.FromResult(player));
        _gameDataAccess.Setup(gda => gda.GetOngoingUnlimitedGamesForPlayer(player.Id.Value))
            .Returns(Task.FromResult(new List<GameSession>() {
               new GameSession() { GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing) } 
            }));
        _gameDataAccess.Setup(gda => gda.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), player.Id.Value))
            .Returns(Task.FromResult(new GameSession() {GameUid = Guid.NewGuid(), State = nameof(GameStates.Ongoing)}));
        
        PlayerService service = new PlayerService(_logger, _playerDataAccess.Object, _gameDataAccess.Object);
        
        var result = await service.GetPlayerProfile(player.PlayerUid);
        
        Assert.NotNull(result);

    }
}