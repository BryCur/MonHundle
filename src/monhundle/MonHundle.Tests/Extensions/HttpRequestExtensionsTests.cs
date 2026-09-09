using core_api.Extensions;
using Microsoft.AspNetCore.Http;

namespace MonHundle.Tests.Extensions;

public class HttpRequestExtensionsTests
{
    [Theory]
    [InlineData(null, null)]
    [InlineData("", null)]
    [InlineData("Basic dXNlcjpwYXNz", null)]
    [InlineData("bearer abc", null)]           // lowercase scheme, compared with StringComparison.Ordinal
    [InlineData("Bearer ", null)]              // no token
    [InlineData("Bearer    ", null)]           // whitespace-only token, trimmed to empty
    [InlineData("Bearer abc", "abc")]
    [InlineData("Bearer   abc  ", "abc")]      // surrounding whitespace is trimmed
    public void GetUserId_extracts_the_bearer_token(string? header, string? expected)
    {
        HttpRequest request = new DefaultHttpContext().Request;
        if (header is not null)
        {
            request.Headers.Authorization = header;
        }

        Assert.Equal(expected, request.GetUserId());
    }
}
