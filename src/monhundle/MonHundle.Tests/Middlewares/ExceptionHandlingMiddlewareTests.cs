using System.Security.Authentication;
using System.Text.Json;
using core_api.Middlewares;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Exceptions.DAL;

namespace MonHundle.Tests.Middlewares;

public class ExceptionHandlingMiddlewareTests
{
    public static IEnumerable<object[]> ExceptionStatusCases => new List<object[]>
    {
        new object[] { new DataNotFoundException("boom"), 404 },
        new object[] { new InvalidDataException("boom"), 400 },
        new object[] { new AuthenticationException("boom"), 401 },
        new object[] { new Exception("boom"), 500 },
    };

    [Theory]
    [MemberData(nameof(ExceptionStatusCases))]
    public async Task InvokeAsync_maps_the_exception_to_the_expected_status_code(Exception thrown, int expectedStatus)
    {
        HttpContext context = await RunWith(thrown);

        Assert.Equal(expectedStatus, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_writes_an_operational_error_payload_without_leaking_the_message()
    {
        HttpContext context = await RunWith(new Exception("internal secret detail"));

        string body = await ReadBody(context);
        using JsonDocument payload = JsonDocument.Parse(body);

        Assert.Equal("application/json", context.Response.ContentType);
        Assert.Equal(500, payload.RootElement.GetProperty("status").GetInt32());
        Assert.Equal(nameof(Exception), payload.RootElement.GetProperty("type").GetString());
        Assert.True(payload.RootElement.GetProperty("operational").GetBoolean());
        Assert.DoesNotContain("internal secret detail", body);
    }

    [Fact]
    public async Task InvokeAsync_passes_through_when_no_exception_is_thrown()
    {
        var middleware = new ExceptionHandlingMiddleware(
            next: ctx => { ctx.Response.StatusCode = 200; return Task.CompletedTask; },
            logger: NullLogger<ExceptionHandlingMiddleware>.Instance);
        var context = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        await middleware.InvokeAsync(context);

        Assert.Equal(200, context.Response.StatusCode);
    }

    private static async Task<HttpContext> RunWith(Exception thrown)
    {
        var middleware = new ExceptionHandlingMiddleware(
            next: _ => throw thrown,
            logger: NullLogger<ExceptionHandlingMiddleware>.Instance);
        var context = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        await middleware.InvokeAsync(context);

        return context;
    }

    private static async Task<string> ReadBody(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        return await new StreamReader(context.Response.Body).ReadToEndAsync();
    }
}
