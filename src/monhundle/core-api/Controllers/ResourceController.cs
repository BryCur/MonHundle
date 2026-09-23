using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers;

[ApiController]
[Route("resources")]
public class ResourceController : ControllerBase
{
    private readonly IGameTitleService _gameTitleService;
    private readonly IMonsterService _monsterService;

    public ResourceController(IGameTitleService gameTitleService, IMonsterService monsterService)
    {
        _gameTitleService = gameTitleService;
        _monsterService = monsterService;
    }
    
    [HttpGet("game-titles")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<string>>> GetGameTitles()
    {
        return Ok(await _gameTitleService.GetAllGameTitles());
    }

    [HttpGet("monster-choices")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<string>>> GetMonsterChoices([FromQuery] string? gameTitles)
    {
        String[] gamelist;

        if (gameTitles == null || gameTitles.Length == 0)
        {
            gamelist = new String[] { };
        }
        else
        {
            gamelist = gameTitles.Split(',');
        }
        
        return Ok( await _monsterService.getMonsterChoicesFromGames(gamelist));
    }
    
}