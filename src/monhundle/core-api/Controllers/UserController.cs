using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers;

[ApiController]
[Route("user")]
public class UserController(ILogger<UserController> logger, IPlayerService playerService): ControllerBase
{
    
    [HttpGet("authenticate")]
    public IActionResult IdentifyUser()
    {
        // read cookie
        string? sUID = Request.Cookies["user_id"];
        try
        {

            Guid playerUid = playerService.AuthPlayer(sUID);

            CookieOptions options = new CookieOptions
            {
                MaxAge = TimeSpan.FromDays(30),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            };


            Response.Cookies.Append("user_id", playerUid.ToString(), options);
            // return OK with cookie 1month

            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}