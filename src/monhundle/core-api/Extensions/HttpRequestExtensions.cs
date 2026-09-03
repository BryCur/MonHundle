namespace core_api.Extensions;

public static class HttpRequestExtensions
{
    private const string BearerPrefix = "Bearer ";

    /// <summary>
    /// Resolves the current player identifier from the <c>Authorization: Bearer &lt;uuid&gt;</c> header.
    /// The web app and the API are served from different sites, so the identifier cannot be carried in a
    /// cookie: Safari/iOS refuses to store or resend a third-party cookie. Returns <c>null</c> when no
    /// usable bearer token is present.
    /// </summary>
    public static string? GetUserId(this HttpRequest request)
    {
        string? authHeader = request.Headers.Authorization;

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith(BearerPrefix, StringComparison.Ordinal))
        {
            return null;
        }

        string token = authHeader[BearerPrefix.Length..].Trim();

        return string.IsNullOrEmpty(token) ? null : token;
    }
}
