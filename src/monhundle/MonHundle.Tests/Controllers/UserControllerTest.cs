using System.Net;
using System.Text;
using System.Text.Json;
using MonHundle.domain.Entities.DTO;
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
    
    // describes the type of bearer token to use
    public enum TokenKind
    {
        None,
        Unparseable,
        Valid
    };    
    
    // describes the type of UID passed as parameters/bodies
    public enum ParamKind
    {
        ValidExisting,
        ValidMissing,
        Unparseable
    };

    public UserControllerTest(WebApplicationWithMockFactory factory)
    {
        _client = factory.CreateClient();
        _playerServiceMock = factory.PlayerServiceMock;
    }

    private static HttpRequestMessage BearerRequest(HttpMethod method, string uri, object? token)
    {
        var request = new HttpRequestMessage(method, uri);
        if (token != null)
        {
            request.Headers.Add("Authorization", $"Bearer {token}");
        }
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
    public async Task Authenticate_returns_bad_request_when_auth_fails_unexpectedly()
    {
        Guid playerId = Guid.NewGuid();
        _playerServiceMock.Setup(ps => ps.AuthPlayer(playerId.ToString())).Throws(new InvalidOperationException("boom"));

        var response = await _client.SendAsync(BearerRequest(HttpMethod.Get, "user/authenticate", playerId));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        AssertNoIdentityCookie(response);
    }
    
    [Theory]
    [InlineData(ParamKind.ValidExisting, HttpStatusCode.OK)]
    [InlineData(ParamKind.ValidMissing, HttpStatusCode.BadRequest)]
    [InlineData(ParamKind.Unparseable, HttpStatusCode.BadRequest)]
    public async Task Validate_returns_correct_status_code_based_on_uid_validation(
        ParamKind paramKind, HttpStatusCode expectedStatusCode
    ) {
        Guid playerId = Guid.NewGuid();
        
        if (paramKind != ParamKind.Unparseable)
        {
            _playerServiceMock.Setup(ps => ps.CheckPlayerExists(playerId)).ReturnsAsync(paramKind == ParamKind.ValidExisting);    
        }

        var requestUri = new UriBuilder
        {
            Path = "user/validate",
            Query = $"user-id={(paramKind == ParamKind.Unparseable ? "invalid" : Uri.EscapeDataString(playerId.ToString()))}"
        };

        var response = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri.Uri));

        Assert.Equal(expectedStatusCode, response.StatusCode);
    }

    
    [Theory]
    [InlineData(TokenKind.Valid, true, HttpStatusCode.OK)]
    [InlineData(TokenKind.Valid, false, HttpStatusCode.Unauthorized)]
    [InlineData(TokenKind.Unparseable, false, HttpStatusCode.Unauthorized)]
    [InlineData(TokenKind.None, false, HttpStatusCode.Unauthorized)]
    public async Task SavePreferences_returns_correct_status_code_based_on_token(
        TokenKind tokenKind, bool validation, HttpStatusCode expectedStatusCode)
    {
        if (tokenKind == TokenKind.Valid)
        {
            _playerServiceMock.Setup(ps => ps.CheckPlayerExists(It.IsAny<Guid>())).ReturnsAsync(validation);    
        }

        var request = BearerRequest(
            HttpMethod.Post, 
            "user/preference", 
            (tokenKind == TokenKind.None ? null: tokenKind == TokenKind.Valid ? Guid.NewGuid() : "invalid")
        );
        
        request.Content = new StringContent(
            JsonSerializer.Serialize(this._preferences),
            Encoding.UTF8,
            "application/json"
        );
        
        var response = await _client.SendAsync(request);

        Assert.Equal(expectedStatusCode, response.StatusCode);
    }

    [Theory]
    [InlineData(TokenKind.Valid, true, ParamKind.ValidExisting, HttpStatusCode.OK)]
    [InlineData(TokenKind.Valid, false, ParamKind.ValidExisting, HttpStatusCode.Unauthorized)]
    [InlineData(TokenKind.None, false, ParamKind.ValidExisting, HttpStatusCode.Unauthorized)]
    [InlineData(TokenKind.Valid, true, ParamKind.ValidMissing, HttpStatusCode.NotFound)]
    [InlineData(TokenKind.Valid, true, ParamKind.Unparseable, HttpStatusCode.NotFound)]
    public async Task Load_returns_correct_status_code_based_on_token_and_param_uids(
        TokenKind bearerKind, bool bearerValidation, ParamKind paramKind, HttpStatusCode expectedStatusCode
    ) {

        Guid paramId = Guid.NewGuid();
        if (bearerKind == TokenKind.Valid)
        {
            _playerServiceMock.Setup(ps => ps.CheckPlayerExists(It.IsAny<Guid>())).ReturnsAsync(bearerValidation);
        }

        if (paramKind != ParamKind.Unparseable)
        {
            _playerServiceMock.Setup(ps => ps.CheckPlayerExists(paramId)).ReturnsAsync(paramKind == ParamKind.ValidExisting);
        }
        
        var requestUri = new UriBuilder
        {
            Path = "user/load",
            Query = $"user-id={(paramKind == ParamKind.Unparseable ? "invalid": paramId.ToString())}"
        };

        var request = BearerRequest(
            HttpMethod.Get, 
            requestUri.Uri.ToString(), 
            (bearerKind == TokenKind.None ? null : bearerKind == TokenKind.Valid ? Guid.NewGuid() : "invalid")
        );
        var response = await _client.SendAsync(request);

        Assert.Equal(expectedStatusCode, response.StatusCode);
        AssertNoIdentityCookie(response);
        
        if (expectedStatusCode == HttpStatusCode.OK)
        {
            Assert.Equal(paramId.ToString(), ReadIdBody(response));
        }
    }
}
