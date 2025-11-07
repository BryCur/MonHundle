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
    public IActionResult GetGameTitles()
    {
        return Ok(_gameTitleService.GetAllGameTitles());
    }

    [HttpGet("monster-choices")]
    public IActionResult GetMonsterChoices([FromQuery] string gameTitles)
    {
        String[] gamelist = gameTitles.Split(","); 
        
        return Ok(_monsterService.getMonsterChoicesFromGames(gamelist));
    }
    
}