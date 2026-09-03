using core_api.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MonHundle.database;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace core_api.Filters;

// not adding the Attribute class because we need Dependence Injection to work here (get player data)
public class ValidateUserFilter(IPlayerDataAccess playerDataAccess) : IAsyncActionFilter 
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.Request.GetUserId();
        Player? player = null;

        if (Guid.TryParse(userId, out var guid))
        {
            player = await playerDataAccess.GetPlayer(guid);
        }

        if (player == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Attache le joueur au contexte
        context.HttpContext.Items["PlayerData"] = player;
        
        await next();
    } 
}
