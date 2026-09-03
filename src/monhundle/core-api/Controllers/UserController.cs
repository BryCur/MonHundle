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
        string? sUID = Request.GetUserId();
        try
        {

            Guid playerUid = await playerService.AuthPlayer(sUID);

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

        // return the loaded identifier (JSON string) so the caller can persist it and use it as its bearer token
        return Ok(targetUserUuid);
    }
}