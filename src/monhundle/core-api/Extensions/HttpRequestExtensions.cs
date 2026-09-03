namespace core_api.Extensions;

public static class HttpRequestExtensions
{
    private const string BearerPrefix = "Bearer ";
    
    // conveniently exposes the current user identifier to the controller
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
