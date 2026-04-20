using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace core_api.Filters;

public class ManagementAuthFilter(ILogger<ManagementAuthFilter> logger, IConfiguration configuration) : IActionFilter
{
    public void OnActionExecuted(ActionExecutedContext context){}

    public void OnActionExecuting(ActionExecutingContext context)
    {
        string authHeader = context.HttpContext.Request.Headers["Authorization"];

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            logger.LogWarning("Request for management auth header is missing");
            context.Result = new UnauthorizedResult();
            return;
        }

        // 3. Extraire le token (sans le préfixe "Bearer ")
        string reqToken = authHeader.Substring("Bearer ".Length).Trim();
        
        string? authToken = configuration["MANAGEMENT_AUTH_TOKEN"]
                            ?? Environment.GetEnvironmentVariable("MANAGEMENT_AUTH_TOKEN");

        if (!reqToken.Equals(authToken))
        {
            logger.LogWarning("Authentication failed for management endpoint, returning 401");
            context.Result = new UnauthorizedResult();
        }
    }
}