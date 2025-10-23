using Microsoft.AspNetCore.Mvc;

namespace core_api.Controllers;

[ApiController]
[Route("user")]
public class UserController: ControllerBase
{
    [HttpGet("authenticate")]
    public IActionResult IdentifyUser()
    {
        // read cookie
        string? sUID = Request.Cookies["user_id"];
        
        // if cookie not exists -> create UUID and save
        if (sUID == null)
        {
            sUID = Guid.NewGuid().ToString(); 
        }

        CookieOptions options = new CookieOptions
        {
            MaxAge = TimeSpan.FromDays(30),
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        };
        
        Response.Cookies.Append("user_id", sUID, options);
        // return OK with cookie 1month
        
        return Ok();
    }
}