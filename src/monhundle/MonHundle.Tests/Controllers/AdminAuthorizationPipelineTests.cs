using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using MonHundle.Tests.Utils;

namespace MonHundle.Tests.Controllers;

// verify that admin routes are correctly wired through the admin filter
public class AdminAuthorizationPipelineTests(WebApplicationWithMockFactory factory) : IClassFixture<WebApplicationWithMockFactory>
{
    private readonly HttpClient _client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

    [Theory]
    [InlineData("admin/cache/tables")]
    [InlineData("admin/daily/last-date")]
    public async Task Admin_routes_reject_requests_without_a_valid_bearer_token(string route)
    {
        HttpResponseMessage response = await _client.GetAsync(route);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
