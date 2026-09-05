using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
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
    
    private readonly Player _currentPlayer = new ()
    {
        Id = 1,
        PlayerUid = Guid.NewGuid()
    };

    public GameDailyControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions() {AllowAutoRedirect = false});
        _gameServiceMock = factory.GameServiceMock;
        _playerDataAccess = factory.PlayerAccessMock;
        _monsterServiceMock = factory.MonsterServiceMock;
        
        _playerDataAccess.Setup(mock => mock.GetPlayer(It.IsAny<Guid>()))
            .ReturnsAsync(_currentPlayer);
    }

    private HttpRequestMessage GetRequestWithAuthHeader(HttpMethod method, string uri)
    {
        var request = new HttpRequestMessage(method, uri);

        request.Headers.Add("Authorization", $"Bearer {_currentPlayer.PlayerUid.ToString()}");

        return request;
    }
    
    private GuessableMonster GetDefaultGuessableMonster()
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
    public async Task CreateGame_returns_200_with_id_when_no_game_exists()
    {
        GuessableMonster defaultMonster  = GetDefaultGuessableMonster();
        _gameServiceMock.Setup(g => g.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), _currentPlayer))
            .ReturnsAsync((Game?)null);
        _gameServiceMock.Setup(g => g.CreateGame(GameModes.Daily, _currentPlayer, defaultMonster))
            .ReturnsAsync(new Game() {Id = Guid.NewGuid(), Answer = defaultMonster});
        _monsterServiceMock.Setup(m => m.getDailyMonster(It.IsAny<DateTime>())).ReturnsAsync(defaultMonster);

        var request = GetRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
    }
    
    [Fact]
    public async Task CreateGame_returns_200_with_id_when_game_daily_not_started()
    {
        GuessableMonster defaultMonster  = GetDefaultGuessableMonster();
        Game existingFromYesterday = new Game() { Id = Guid.NewGuid(), Answer = defaultMonster, StartTime = DateTime.Today.AddDays(-1) };
        _gameServiceMock.Setup(g => g.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), _currentPlayer))
            .ReturnsAsync(existingFromYesterday);
        _gameServiceMock.Setup(g => g.CreateGame(GameModes.Daily, _currentPlayer, defaultMonster))
            .ReturnsAsync(new Game() {Id = Guid.NewGuid(), Answer = defaultMonster});
        _monsterServiceMock.Setup(m => m.getDailyMonster(It.IsAny<DateTime>())).ReturnsAsync(defaultMonster);

        var request = GetRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
        Assert.NotEqual(existingFromYesterday.Id.ToString(), uuid);
    }    
    
    [Fact]
    public async Task CreateGame_returns_409_with_id_when_game_daily_exists()
    {
        GuessableMonster defaultMonster  = GetDefaultGuessableMonster();
        Game existingToday = new Game() {Id = Guid.NewGuid(), Answer = defaultMonster, StartTime = DateTime.Now};
        _gameServiceMock.Setup(g => g.GetDailyGameForPlayerAtDate(It.IsAny<DateTime>(), _currentPlayer))
            .ReturnsAsync(existingToday);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Post, "/game/daily/start");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(409, (int)response.StatusCode);
        var uuid = await response.Content.ReadAsStringAsync();

        Assert.Equal(existingToday.Id.ToString(), uuid);
    }

    [Fact]
    public async Task ResumeOngoingGame_returns_404_on_non_existing_uuid()
    {
        _gameServiceMock.Setup(g => g.ResumeGame(It.IsAny<Guid>(), _currentPlayer)).ReturnsAsync((Game?)null);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Get, $"/game/daily/resume/{Guid.NewGuid().ToString()}");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task ResumeOngoingGame_returns_game_from_guid()
    {
        Game game = new Game() {Id = Guid.NewGuid(), Answer = GetDefaultGuessableMonster()};
        _gameServiceMock.Setup(g => g.ResumeGame(game.Id, _currentPlayer)).ReturnsAsync(game);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Get, $"/game/daily/resume/{game.Id}");
        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        Assert.NotEmpty(await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task MakeGuess_returns_200_with_guess_response()
    {
        GuessableMonster monster = GetDefaultGuessableMonster();
        MakeGuessBody body = new(Guid.NewGuid(), monster.GetCode());
        MonsterGuessDTO guessResult = new MonsterGuessDTO(
            "test",
            new MonsterCriteriaDTO(1, 1, Classifications.Amphibian, [], [], []),
            new MonsterComparisonResult()
            {
                Afflictions = ComparisonOutcomes.Incorrect,
                Classification = ComparisonOutcomes.Incorrect,
                Generation = ComparisonOutcomes.Incorrect,
                Habitats = ComparisonOutcomes.Incorrect,
                Weaknesses = ComparisonOutcomes.Incorrect,
                ThreatLevel = ComparisonOutcomes.Incorrect
            }
        );
        
        _monsterServiceMock.Setup(ms => ms.getMonsterFromCode(body.guessId)).ReturnsAsync(monster);
        _gameServiceMock.Setup(gs => gs.MakeGuess(body.gameId, monster, It.IsAny<Player>()))
            .ReturnsAsync((guessResult, GameStates.Ongoing));
        
        var request = GetRequestWithAuthHeader(HttpMethod.Post, $"/game/daily/guess");
        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json"
        );
        
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var respBody = JsonSerializer.Deserialize<GuessResponse?>( await response.Content.ReadAsStringAsync());
        Assert.NotNull(respBody);
    }
    
    [Fact]
    public async Task MakeGuess_throws_exception_if_monster_code_is_invalid()
    {
        MakeGuessBody body = new(Guid.NewGuid(), "invalid");
        
        _monsterServiceMock.Setup(ms => ms.getMonsterFromCode(body.guessId)).ReturnsAsync((GuessableMonster?)null);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Post, $"/game/daily/guess");
        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json"
        );
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

    }
}