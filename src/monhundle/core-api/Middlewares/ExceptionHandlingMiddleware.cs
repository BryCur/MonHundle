using System.Net;
using System.Security.Authentication;
using System.Text.Json;
using MonHundle.domain.Exceptions.DAL;

namespace core_api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");
            
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";
        
        // default values
        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred.";

        switch (exception)
        {
            case DataNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                message = "Resource not found.";
                break;
            
            case InvalidDataException:
                statusCode = HttpStatusCode.BadRequest;
                message = "Invalid data.";
                break;
            
            case AuthenticationException:
                statusCode = HttpStatusCode.Unauthorized;
                message = "Invalid credentials.";
                break;
        }

        response.StatusCode = (int)statusCode;

        var result = JsonSerializer.Serialize(new
        {
            error = message,
            status = (int)statusCode,
            type = exception.GetType().Name,
            operational = true
        });

        await response.WriteAsync(result);
    }
}
