using System.Net;
using System.Text;
using System.Text.Json;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Exceptions.DAL;
using MonHundle.domain.Interfaces.Services;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Controllers;

public class UserControllerTest : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client;
    private readonly Mock<IPlayerService> _playerServiceMock;

    private readonly UserPreferencesBody _preferences =
        new UserPreferencesBody(true, new[] { "MHWilds", "MHWI", "MHW" });

    public UserControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient();
        _playerServiceMock = factory.PlayerServiceMock;
    }

    private static HttpRequestMessage BearerRequest(HttpMethod method, string uri, object token)
    {
        var request = new HttpRequestMessage(method, uri);
        request.Headers.Add("Authorization", $"Bearer {token}");
        return request;
    }

    private static string? ReadIdBody(HttpResponseMessage response)
    {
        return JsonSerializer.Deserialize<string>(response.Content.ReadAsStringAsync().Result);
    }

    private static void AssertNoIdentityCookie(HttpResponseMessage response)
    {
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }


    [Fact]
    public async Task Authenticate_creates_user_when_no_identifier()
    {
        Guid newPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(null)).ReturnsAsync(newPlayerId);

        var request = new HttpRequestMessage(HttpMethod.Get, "user/authenticate");
        var response = await _client.SendAsync(request);

        response.EnsureSuccessStatusCode();
        AssertNoIdentityCookie(response);
        Assert.Equal(newPlayerId.ToString(), ReadIdBody(response));
    }

    [Fact]
    public async Task Authenticate_uses_bearer_token_when_present_and_valid()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(playerId.ToString())).ReturnsAsync(playerId);

        var response = await _client.SendAsync(BearerRequest(HttpMethod.Get, "user/authenticate", playerId));

        response.EnsureSuccessStatusCode();
        Assert.Equal(playerId.ToString(), ReadIdBody(response));
        _playerServiceMock.Verify(ps => ps.AuthPlayer(playerId.ToString()), Times.Once);
    }

    [Fact]
    public async Task Authenticate_returns_bad_request_when_identifier_present_but_unknown()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(playerId.ToString())).Throws(new DataNotFoundException("test"));

        var response = await _client.SendAsync(BearerRequest(HttpMethod.Get, "user/authenticate", playerId));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        AssertNoIdentityCookie(response);
    }

    [Fact]
    public async Task Validate_returns_ok_when_param_parsed_and_valid()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).ReturnsAsync(true);

        var requestUri = new UriBuilder
        {
            Path = "user/validate",
            Query = $"user-id={Uri.EscapeDataString(playerId.ToString())}"
        };

        var response = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri.Uri));

        response.EnsureSuccessStatusCode();
    }


    [Fact]
    public async Task Validate_returns_badrequest_when_param_parsed_and_invalid()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).ReturnsAsync(false);

        var requestUri = new UriBuilder
        {
            Path = "user/validate",
            Query = $"user-id={Uri.EscapeDataString(playerId.ToString())}"
        };

        var response = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri.Uri));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }


    [Fact]
    public async Task Validate_returns_badrequest_when_param_unparseable()
    {
        var requestUri = new UriBuilder
        {
            Path = "user/validate",
            Query = "user-id=invalid"
        };

        var response = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri.Uri));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }


    [Fact]
    public async Task SavePreferences_returns_ok_when_bearer_token_parsed_and_valid()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).ReturnsAsync(true);

        var request = BearerRequest(HttpMethod.Post, "user/preference", playerId);
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.SendAsync(request);

        response.EnsureSuccessStatusCode();
    }


    [Fact]
    public async Task SavePreferences_returns_unauthorised_when_bearer_token_parsed_and_invalid()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).ReturnsAsync(false);

        var request = BearerRequest(HttpMethod.Post, "user/preference", playerId);
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }


    [Fact]
    public async Task SavePreferences_returns_unauthorized_when_bearer_token_unparseable()
    {
        var request = BearerRequest(HttpMethod.Post, "user/preference", "invalid");
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }


    [Fact]
    public async Task SavePreferences_returns_unauthorized_when_no_bearer_token()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "user/preference")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(this._preferences),
                Encoding.UTF8,
                "application/json"
            )
        };

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }


    [Fact]
    public async Task Load_returns_ok_when_bearer_token_and_param_parsed_and_valid()
    {
        Guid currentPlayerId = Guid.NewGuid();
        Guid paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(currentPlayerId)).ReturnsAsync(true);
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(paramPlayerId)).ReturnsAsync(true);

        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = BearerRequest(HttpMethod.Get, requestUri.Uri.ToString(), currentPlayerId);

        var response = await _client.SendAsync(request);

        response.EnsureSuccessStatusCode();
        AssertNoIdentityCookie(response);
        Assert.Equal(paramPlayerId.ToString(), ReadIdBody(response));
    }


    [Fact]
    public async Task Load_returns_unauthorized_when_bearer_token_parsed_and_invalid()
    {
        Guid currentPlayerId = Guid.NewGuid();
        Guid paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(currentPlayerId)).ReturnsAsync(false);

        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = BearerRequest(HttpMethod.Get, requestUri.Uri.ToString(), currentPlayerId);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        AssertNoIdentityCookie(response);
    }

    [Fact]
    public async Task Load_returns_unauthorized_when_no_bearer_token()
    {
        Guid paramPlayerId = Guid.NewGuid();

        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        AssertNoIdentityCookie(response);
    }

    [Fact]
    public async Task Load_returns_notFound_when_target_param_parsed_and_invalid()
    {
        Guid currentPlayerId = Guid.NewGuid();
        Guid paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(currentPlayerId)).ReturnsAsync(true);
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(paramPlayerId)).ReturnsAsync(false);

        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = BearerRequest(HttpMethod.Get, requestUri.Uri.ToString(), currentPlayerId);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        AssertNoIdentityCookie(response);
    }

    [Fact]
    public async Task Load_returns_notFound_when_target_param_unparseable()
    {
        Guid currentPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(currentPlayerId)).ReturnsAsync(true);

        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = "user-id=invalid"
        };
        var request = BearerRequest(HttpMethod.Get, requestUri.Uri.ToString(), currentPlayerId);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        AssertNoIdentityCookie(response);
    }
}
