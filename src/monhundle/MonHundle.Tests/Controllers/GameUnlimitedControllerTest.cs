using System.Net;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Controllers;

public class GameUnlimitedControllerTest : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client;
    private readonly Mock<IGameService> _gameServiceMock;
    private readonly Mock<IPlayerDataAccess> _playerDataAccess;
    
    private readonly Player _currentPlayer = new ()
    {
        Id = 1,
        PlayerUid = Guid.NewGuid()
    };

    public GameUnlimitedControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient();
        _gameServiceMock = factory.GameServiceMock;
        _playerDataAccess = factory.PlayerAccessMock;
        
        _playerDataAccess.Setup(mock => mock.GetPlayer(It.IsAny<Guid>()))
            .ReturnsAsync(_currentPlayer);
    }

    private HttpRequestMessage GetRequestWithAuthHeader(HttpMethod method, string uri)
    {
        var request = new HttpRequestMessage(method, uri);
        
        request.Headers.Add("Cookie", $"user_id={_currentPlayer.PlayerUid.ToString()}");
        
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
    public async Task GameController_create_game_returns_200_with_id()
    {
        _gameServiceMock.Setup(g => g.CreateUnlimitedGameSessionWithRandomMonster(_currentPlayer))
            .ReturnsAsync(new Game() { Id = Guid.NewGuid(), Answer = GetDefaultGuessableMonster() });

        var request = GetRequestWithAuthHeader(HttpMethod.Post, "/game/unlimited/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
    }

    [Fact]
    public async Task GameController_get_game_returns_404_on_non_existing_uuid()
    {
        _gameServiceMock.Setup(g => g.ResumeGame(It.IsAny<Guid>(), _currentPlayer)).ReturnsAsync((Game?)null);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Get, $"/game/unlimited/resume/{Guid.NewGuid().ToString()}");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task GameController_get_game_returns_game_from_guid()
    {
        Game game = new Game() {Id = Guid.NewGuid(), Answer = GetDefaultGuessableMonster()};
        _gameServiceMock.Setup(g => g.ResumeGame(game.Id, _currentPlayer)).ReturnsAsync(game);
        
        var request = GetRequestWithAuthHeader(HttpMethod.Get, $"/game/unlimited/resume/{game.Id}");
        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        Assert.NotEmpty(await response.Content.ReadAsStringAsync());
    }
}