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


    [Fact]
    public async Task Authenticate_creates_user_if_no_cookie()
    {
        Guid  newPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(null)).Returns(newPlayerId);

        var request = new HttpRequestMessage(HttpMethod.Get, "user/authenticate");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.NotNull(setCookieString);
        Assert.StartsWith($"user_id={newPlayerId}", setCookieString);

    }

    [Fact]
    public async Task Authenticate_use_cookie_id_if_present_and_valid()
    {
        
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(playerId.ToString())).Returns(playerId);

        var request = new HttpRequestMessage(HttpMethod.Get, "user/authenticate");
        request.Headers.Add("Cookie", $"user_id={playerId}");
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.NotNull(setCookieString);
        Assert.StartsWith($"user_id={playerId}", setCookieString);
        
    }

    [Fact]
    public async Task Authenticate_sends_bad_request_if_cookie_present_but_invalid()
    {
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(playerId.ToString())).Throws(new DataNotFoundException("test"));

        var request = new HttpRequestMessage(HttpMethod.Get, "user/authenticate");
        request.Headers.Add("Cookie", $"user_id={playerId}");
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.Null(setCookieString);
    }

    [Fact]
    public async Task Validate_returns_ok_when_cookie_parsed_and_valid()
    {
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).Returns(true);

        var requestUri = new UriBuilder()
        {
            Path = "user/validate",
            Query = $"user-id={Uri.EscapeDataString(playerId.ToString())}"
        };
        
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
    }
    
    
    [Fact]
    public async Task Validate_returns_badrequest_when_cookie_parsed_and_invalid()
    {
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).Returns(false);
        
        var requestUri = new UriBuilder()
        {
            Path = "user/validate",
            Query = $"user-id={Uri.EscapeDataString(playerId.ToString())}"
        };
        
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
    
    
    [Fact]
    public async Task Validate_returns_badrequest_when_cookie_unparsed()
    {
        Guid  playerId = Guid.NewGuid();
        
        var requestUri = new UriBuilder()
        {
            Path = "user/validate",
            Query = "user-id=invalid"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
    

    [Fact]
    public async Task SavePreferences_returns_ok_when_cookie_parsed_and_valid()
    {
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).Returns(true);

        var request = new HttpRequestMessage(HttpMethod.Post, "user/preference");
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );
        request.Headers.Add("Cookie", $"user_id={playerId}");
        
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
    }
    
    
    [Fact]
    public async Task SavePreferences_returns_unauthorised_when_cookie_parsed_and_invalid()
    {
        Guid  playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).Returns(false);
        
        var request = new HttpRequestMessage(HttpMethod.Post, "user/preference");
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );
        request.Headers.Add("Cookie", $"user_id={playerId}");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    
    
    [Fact]
    public async Task SavePreferences_returns_unauthorized_when_cookie_unparsed()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "user/preference");
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );
        request.Headers.Add("Cookie", "user_id=invalid");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    
    [Fact]
    public async Task Load_returns_ok_when_cookie_and_param_parsed_and_valid()
    {
        Guid  cookiePlayerId = Guid.NewGuid();
        Guid  paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(cookiePlayerId)).Returns(true);
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(paramPlayerId)).Returns(true);

        var requestUri = new UriBuilder()
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        request.Headers.Add("Cookie", $"user_id={cookiePlayerId}");
        
        var response = await _client.SendAsync(request);
        
        response.EnsureSuccessStatusCode();
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.NotNull(setCookieString);
        Assert.StartsWith($"user_id={paramPlayerId}", setCookieString);
    }
    
    
    [Fact]
    public async Task Load_returns_unauthorized_when_cookie_parsed_and_invalid()
    {
        Guid  cookiePlayerId = Guid.NewGuid();
        Guid  paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(cookiePlayerId)).Returns(false);

        var requestUri = new UriBuilder()
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        request.Headers.Add("Cookie", $"user_id={cookiePlayerId}");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.Null(setCookieString);
    }
    
    [Fact]
    public async Task Load_returns_unauthorized_when_cookie_not_parsed()
    {
        Guid  paramPlayerId = Guid.NewGuid();

        var requestUri = new UriBuilder()
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        request.Headers.Add("Cookie", "user_id=invalid");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.Null(setCookieString);
    }
    [Fact]
    public async Task Load_returns_notFound_when_cookie_parsed_and_invalid()
    {
        Guid  cookiePlayerId = Guid.NewGuid();
        Guid  paramPlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(cookiePlayerId)).Returns(true);
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(paramPlayerId)).Returns(false);

        var requestUri = new UriBuilder()
        {
            Path = "user/load",
            Query = $"user-id={paramPlayerId}"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        request.Headers.Add("Cookie", $"user_id={cookiePlayerId}");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.Null(setCookieString);
    }
    
    [Fact]
    public async Task Load_returns_notFound_when_cookie_not_parsed()
    {
        Guid  cookiePlayerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.CheckPlayerExists(cookiePlayerId)).Returns(true);
        

        var requestUri = new UriBuilder()
        {
            Path = "user/load",
            Query = "user-id=invalid"
        };
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri.Uri);
        request.Headers.Add("Cookie", $"user_id={cookiePlayerId}");
        
        var response = await _client.SendAsync(request);
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var setCookieString = response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> values) ? values.FirstOrDefault() : null;
        Assert.Null(setCookieString);
    }
}