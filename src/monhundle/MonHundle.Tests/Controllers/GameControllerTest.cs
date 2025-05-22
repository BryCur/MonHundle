using System.Net;
using core_api;
using core_api.Models;
using core_api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc.Testing;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Controllers;

public class GameControllerTest : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client;
    private readonly Mock<IGameService> _gameServiceMock;

    public GameControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient();
        _gameServiceMock = factory.GameServiceMock;
    }

    [Fact]
    public async Task GameController_create_game_returns_200_with_id()
    {
        _gameServiceMock.Setup(g => g.CreateGame()).Returns(new Game() {Id = Guid.NewGuid(), Answer = "ouai"});
        var response = await _client.PostAsync("/game/start", null);
        
        response.EnsureSuccessStatusCode();
        var uuid = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(uuid));
    }

    [Fact]
    public async Task GameController_get_game_returns_404_on_non_existing_uuid()
    {
        _gameServiceMock.Setup(g => g.GetGame(It.IsAny<Guid>())).Returns((Game?)null);
        
        var response = await _client.GetAsync($"/game/resume/{Guid.NewGuid().ToString()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task GameController_get_game_returns_game_from_guid()
    {
        Game game = new Game() {Id = Guid.NewGuid(), Answer = "ouai"};
        _gameServiceMock.Setup(g => g.GetGame(game.Id)).Returns(game);
        
        var response = await _client.GetAsync($"/game/resume/{game.Id}");
        response.EnsureSuccessStatusCode();
        Assert.NotEmpty(await response.Content.ReadAsStringAsync());
    }
}