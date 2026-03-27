using System.Net;
using System.Runtime.InteropServices.JavaScript;
using Microsoft.AspNetCore.Mvc.Testing;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Controllers;

public class GameDailyControllerTest : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client;
    private readonly Mock<IGameService> _gameServiceMock;
    private readonly Mock<IMonsterService> _monsterServiceMock;
    private readonly Mock<IPlayerDataAccess> _playerDataAccess;
    
    private readonly Player _currentPlayer = new Player()
    {
        Id = 1,
        PlayerUid = new Guid()
    };

    public GameDailyControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions() {AllowAutoRedirect = false});
        _gameServiceMock = factory.GameServiceMock;
        _playerDataAccess = factory.MockPlayerAccess;
        _monsterServiceMock = factory.MonsterServiceMock;
        
        _playerDataAccess.Setup(mock => mock.GetPlayer(It.IsAny<Guid>()))
            .Returns(_currentPlayer);
    }

    private HttpRequestMessage getRequestWithAuthHeader(HttpMethod method, string uri)
    {
        var request = new HttpRequestMessage(method, uri);
        
        request.Headers.Add("Cookie", $"user_id={_currentPlayer.PlayerUid.ToString()}");
        
        return request;
    }
    
    private GuessableMonster getDefaultGuessableMonster()
    {
        return new GuessableMonster(
            1,
            "test_monster",
            new MonsterCriteria(
                new CriteriaNumber(1),
                new CriteriaNumber(1),
                new CriteriaObject<Classifications>(Classifications.Amphibian),
                new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>()),
                new CriteriaSet<Diets>(new HashSet<Diets>()),
                new CriteriaSet<Afflictions>(new HashSet<Afflictions>()),
                new CriteriaSet<Habitats>(new HashSet<Habitats>())
            )
        );
    }

    [Fact]
    public async Task GameController_create_game_returns_200_with_id_when_no_game_exists()
    {
        GuessableMonster defaultMonster  = getDefaultGuessableMonster();
        _gameServiceMock.Setup(g => g.GetLastGame(GameModes.Daily, _currentPlayer))
            .Returns(() => null);
        _gameServiceMock.Setup(g => g.CreateGame(GameModes.Daily, _currentPlayer, defaultMonster))
            .Returns(new Game() {Id = Guid.NewGuid(), Answer = defaultMonster});
        _monsterServiceMock.Setup(m => m.getDailyMonster(It.IsAny<DateTime>())).Returns(defaultMonster);

        var request = getRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
    }
    
    [Fact]
    public async Task GameController_create_game_returns_200_with_id_when_game_daily_not_started()
    {
        GuessableMonster defaultMonster  = getDefaultGuessableMonster();
        Game existingFromYesterday = new Game() { Id = Guid.NewGuid(), Answer = defaultMonster, StartTime = DateTime.Today.AddDays(-1) };
        _gameServiceMock.Setup(g => g.GetLastGame(GameModes.Daily, _currentPlayer))
            .Returns(() => existingFromYesterday);
        _gameServiceMock.Setup(g => g.CreateGame(GameModes.Daily, _currentPlayer, defaultMonster))
            .Returns(new Game() {Id = Guid.NewGuid(), Answer = defaultMonster});
        _monsterServiceMock.Setup(m => m.getDailyMonster(It.IsAny<DateTime>())).Returns(defaultMonster);

        var request = getRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
        Assert.NotEqual(existingFromYesterday.Id.ToString(), uuid);
    }    
    
    [Fact]
    public async Task GameController_create_game_returns_303_with_id_when_game_daily_exists()
    {
        GuessableMonster defaultMonster  = getDefaultGuessableMonster();
        Game existingToday = new Game() {Id = Guid.NewGuid(), Answer = defaultMonster, StartTime = DateTime.Now};
        _gameServiceMock.Setup(g => g.GetLastGame(GameModes.Daily, _currentPlayer))
            .Returns(() => existingToday);
        
        var request = getRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(303, (int)response.StatusCode);
        var location = response.Headers.GetValues("Location").FirstOrDefault();
        Assert.False(string.IsNullOrWhiteSpace(location));
        Assert.Contains(existingToday.Id.ToString(), location);
    }

    [Fact]
    public async Task GameController_get_game_returns_404_on_non_existing_uuid()
    {
        _gameServiceMock.Setup(g => g.ResumeGame(It.IsAny<Guid>(), _currentPlayer)).Returns((Game?)null);
        
        var request = getRequestWithAuthHeader(HttpMethod.Get, $"/game/daily/resume/{Guid.NewGuid().ToString()}");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task GameController_get_game_returns_game_from_guid()
    {
        Game game = new Game() {Id = Guid.NewGuid(), Answer = getDefaultGuessableMonster()};
        _gameServiceMock.Setup(g => g.ResumeGame(game.Id, _currentPlayer)).Returns(game);
        
        var request = getRequestWithAuthHeader(HttpMethod.Get, $"/game/daily/resume/{game.Id}");
        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        Assert.NotEmpty(await response.Content.ReadAsStringAsync());
    }
}