using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MonHundle.database;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;

namespace core_api.Filters;

// not adding the Attribute class because we need Dependence Injection to work here (get player data)
public class ValidateUserFilter(IPlayerDataAccess playerDataAccess) : IActionFilter 
{

    public void OnActionExecuting(ActionExecutingContext context)
    {
        var cookies = context.HttpContext.Request.Cookies;

        if (
            !cookies.TryGetValue("user_id", out var userId) 
            || !Guid.TryParse(userId, out var guid)
            || !PlayerExists(guid, out Player? player)
        ){
            context.Result = new UnauthorizedResult();
            return;
        }

        // Attache le joueur au contexte
        context.HttpContext.Items["PlayerData"] = player;
    }

    private bool PlayerExists(Guid playerId, out Player? playerData)
    {
        playerData = playerDataAccess.GetPlayer(playerId);
        return playerData != null;
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
