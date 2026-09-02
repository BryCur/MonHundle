using core_api.Extensions;
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
    public async Task<IActionResult> IdentifyUser()
    {
        // read the identifier from the Authorization header, falling back to the legacy cookie
        string? sUID = Request.GetUserId();
        try
        {

            Guid playerUid = await playerService.AuthPlayer(sUID);

            // still emit the cookie for non-Safari clients and future same-site deployments,
            // but the identifier is now primarily returned in the body so the SPA can store it
            // and send it back as a bearer token.
            Response.Cookies.Append("user_id", playerUid.ToString(), BuildUserCookieOptions());

            // returned as a JSON string ("<guid>") so the SPA can read it via response.json()
            return Ok(playerUid);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"failed to auth player : ${e.Message}");
            return BadRequest(e.Message);
        }
    }

    [HttpGet("validate")]
    public async Task<IActionResult> ValidateUser([FromQuery(Name = "user-id")] string userUuid)
    {
        bool guidParsed = Guid.TryParse(userUuid, out Guid parsedUuid);

        if (!guidParsed ||  !await playerService.CheckPlayerExists(parsedUuid))
        {
            return BadRequest("invalid user id format"); 
        }
        
        return Ok();
    }

    [HttpGet("profile/{userUuid}")]
    public async Task<IActionResult> GetProfile([FromRoute] string userUuid)
    {
        Guid parsedUuid = Guid.Parse(userUuid);
        
        return Ok( await playerService.GetPlayerProfile(parsedUuid));
    }

    [HttpPost("preference")]
    public async Task<IActionResult> SavePreference([FromBody] UserPreferencesBody preferences)
    {
        bool guidParsed = Guid.TryParse(Request.GetUserId(), out Guid parsedUuid);

        if (!guidParsed || ! await playerService.CheckPlayerExists(parsedUuid))
        {
            return Unauthorized("invalid user id format");
        }

        await playerService.SaveUserPreferences(parsedUuid, PlayerPreferencesStruct.FromBody(preferences));

        return Ok();
    }

    [HttpGet("load")]
    public async Task<IActionResult> LoadUser([FromQuery(Name = "user-id")] string userUuid)
    {
        bool currentGuidParsed = Guid.TryParse(Request.GetUserId(), out Guid currentUserUuid);
        bool targetGuidParsed = Guid.TryParse(userUuid, out Guid targetUserUuid);

        if (!currentGuidParsed || ! await playerService.CheckPlayerExists(currentUserUuid))
        {
            return Unauthorized("invalid user id format"); 
        }
        
        if (!targetGuidParsed || ! await playerService.CheckPlayerExists(targetUserUuid))
        {
            return NotFound("target user id is invalid");
        }

        Response.Cookies.Append("user_id", targetUserUuid.ToString(), BuildUserCookieOptions());

        // return the loaded identifier (JSON string) so the SPA can persist it and use it as a bearer token
        return Ok(targetUserUuid);
    }

    private static CookieOptions BuildUserCookieOptions() => new CookieOptions
    {
        MaxAge = TimeSpan.FromDays(30),
        HttpOnly = false,
        Secure = true,
        SameSite = SameSiteMode.None
    };
}