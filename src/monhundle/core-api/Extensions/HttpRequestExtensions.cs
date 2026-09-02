namespace core_api.Extensions;

public static class HttpRequestExtensions
{
    private const string BearerPrefix = "Bearer ";

    /// <summary>
    /// Resolves the current player identifier for the request.
    /// The identifier is primarily carried by the <c>Authorization: Bearer &lt;uuid&gt;</c> header,
    /// which is required for cross-site setups where browsers (Safari/iOS in particular) refuse to
    /// store or send the third-party <c>user_id</c> cookie. The legacy cookie is still read as a
    /// fallback so clients that have not migrated yet keep working.
    /// </summary>
    public static string? GetUserId(this HttpRequest request)
    {
        string? authHeader = request.Headers.Authorization;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith(BearerPrefix, StringComparison.Ordinal))
        {
            string token = authHeader[BearerPrefix.Length..].Trim();

            if (!string.IsNullOrEmpty(token))
            {
                return token;
            }
        }

        return request.Cookies["user_id"];
    }
}
