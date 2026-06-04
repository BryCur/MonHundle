using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
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
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None
            };


            Response.Cookies.Append("user_id", playerUid.ToString(), options);
            // return OK with cookie 1month

            return Ok();
        }
        catch (Exception e)
        {
            logger.LogError(e, $"failed to auth player : ${e.Message}");
            return BadRequest(e.Message);
        }
    }

    [HttpGet("validate")]
    public IActionResult ValidateUser([FromQuery(Name = "user-id")] string userUuid)
    {
        bool guidParsed = Guid.TryParse(userUuid, out Guid parsedUuid);

        if (!guidParsed || !playerService.CheckPlayerExists(parsedUuid))
        {
            return BadRequest("invalid user id format"); 
        }
        
        return Ok();
    }

    [HttpGet("profile/{userUuid}")]
    public IActionResult GetProfile([FromRoute] string userUuid)
    {
        Guid parsedUuid = Guid.Parse(userUuid);
        
        return Ok(playerService.GetPlayerProfile(parsedUuid));
    }

    [HttpPost("preference")]
    public IActionResult savePreference([FromBody] UserPreferencesBody preferences)
    {
        bool guidParsed = Guid.TryParse(Request.Cookies["user_id"], out Guid parsedUuid);

        if (!guidParsed || !playerService.CheckPlayerExists(parsedUuid))
        {
            return Unauthorized("invalid user id format"); 
        }
        
        playerService.SaveUserPreferences(parsedUuid, PlayerPreferencesStruct.FromBody(preferences));

        return Ok();
    }

    [HttpGet("load")]
    public IActionResult LoadUser([FromQuery(Name = "user-id")] string userUuid)
    {
        bool currentGuidParsed = Guid.TryParse(Request.Cookies["user_id"], out Guid currentUserUuid);
        bool targetGuidParsed = Guid.TryParse(userUuid, out Guid targetUserUuid);

        if (!currentGuidParsed || !playerService.CheckPlayerExists(currentUserUuid))
        {
            return Unauthorized("invalid user id format"); 
        }
        
        if (!targetGuidParsed || !playerService.CheckPlayerExists(targetUserUuid))
        {
            return NotFound("target user id is invalid");
        }
        
        CookieOptions options = new CookieOptions
        {
            MaxAge = TimeSpan.FromDays(30),
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.None
        };


        Response.Cookies.Append("user_id", targetUserUuid.ToString(), options);

        return Ok();
    }
}