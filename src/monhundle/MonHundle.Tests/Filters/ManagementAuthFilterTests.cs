using core_api.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.Tests.Utils;

namespace MonHundle.Tests.Filters;

public class ManagementAuthFilterTests
{
    private const string ConfiguredToken = "s3cr3t-management-token";

    private static ManagementAuthFilter BuildFilter(string? configuredToken = ConfiguredToken)
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["MANAGEMENT_AUTH_TOKEN"] = configuredToken })
            .Build();

        return new ManagementAuthFilter(NullLogger<ManagementAuthFilter>.Instance, configuration);
    }

    private static ActionExecutingContext ContextWithHeader(string? authorizationHeader)
    {
        var httpContext = new DefaultHttpContext();
        if (authorizationHeader is not null)
        {
            httpContext.Request.Headers.Authorization = authorizationHeader;
        }

        return FilterContextFactory.ExecutingContext(httpContext);
    }

    [Fact]
    public void OnActionExecuting_allows_the_request_when_the_bearer_token_matches_configuration()
    {
        ActionExecutingContext context = ContextWithHeader($"Bearer {ConfiguredToken}");

        BuildFilter().OnActionExecuting(context);

        Assert.Null(context.Result);
    }

    [Theory]
    [InlineData(null)]                       // no Authorization header
    [InlineData("")]                         // empty header
    [InlineData("s3cr3t-management-token")]  // token without the Bearer scheme
    [InlineData("Bearer wrong-token")]       // wrong token
    public void OnActionExecuting_returns_401_for_missing_or_invalid_credentials(string? header)
    {
        ActionExecutingContext context = ContextWithHeader(header);

        BuildFilter().OnActionExecuting(context);

        Assert.IsType<UnauthorizedResult>(context.Result);
    }

    [Fact]
    public void OnActionExecuting_returns_401_when_no_management_token_is_configured()
    {
        ActionExecutingContext context = ContextWithHeader("Bearer anything");

        BuildFilter(configuredToken: null).OnActionExecuting(context);

        Assert.IsType<UnauthorizedResult>(context.Result);
    }
}
