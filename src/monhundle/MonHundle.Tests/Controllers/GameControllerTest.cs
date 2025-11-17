using System.Net;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Controllers;

public class GameControllerTest : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client;
    private readonly Mock<IGameService> _gameServiceMock;
    private readonly Mock<IPlayerDataAccess> _playerDataAccess;
    
    private readonly Player _currentPlayer = new Player()
    {
        Id = 1,
        PlayerUid = new Guid()
    };

    public GameControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient();
        _gameServiceMock = factory.GameServiceMock;
        _playerDataAccess = factory.MockPlayerAccess;
        
        _playerDataAccess.Setup(mock => mock.GetPlayer(It.IsAny<Guid>()))
            .Returns(_currentPlayer);
    }

    private HttpRequestMessage getRequestWithAuthHeader(HttpMethod method, string uri)
    {
        var request = new HttpRequestMessage(method, uri);
        
        request.Headers.Add("Cookie", $"user_id={_currentPlayer.PlayerUid.ToString()}");
        
        return request;
    }

    [Fact]
    public async Task GameController_create_game_returns_200_with_id()
    {
        _gameServiceMock.Setup(g => g.CreateGame(_currentPlayer)).Returns(new Game() {Id = Guid.NewGuid(), Answer = null});

        var request = getRequestWithAuthHeader(HttpMethod.Post, "/game/start");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
    }

    [Fact]
    public async Task GameController_get_game_returns_404_on_non_existing_uuid()
    {
        _gameServiceMock.Setup(g => g.ResumeGame(It.IsAny<Guid>(), _currentPlayer)).Returns((Game?)null);
        
        var request = getRequestWithAuthHeader(HttpMethod.Get, $"/game/resume/{Guid.NewGuid().ToString()}");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task GameController_get_game_returns_game_from_guid()
    {
        Game game = new Game() {Id = Guid.NewGuid(), Answer = null};
        _gameServiceMock.Setup(g => g.ResumeGame(game.Id, _currentPlayer)).Returns(game);
        
        var request = getRequestWithAuthHeader(HttpMethod.Get, $"/game/resume/{game.Id}");
        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        Assert.NotEmpty(await response.Content.ReadAsStringAsync());
    }
}