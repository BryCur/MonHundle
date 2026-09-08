using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace MonHundle.Tests.Utils;

/// <summary>
/// Minimal MVC filter pipeline contexts for unit-testing action filters without spinning up a host.
/// </summary>
public static class FilterContextFactory
{
    public static ActionExecutingContext ExecutingContext(HttpContext httpContext) =>
        new(
            new ActionContext(httpContext, new RouteData(), new ActionDescriptor()),
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>(),
            controller: new object());

    public static ActionExecutedContext ExecutedContext(ActionExecutingContext executing) =>
        new(executing, executing.Filters, executing.Controller);
}
