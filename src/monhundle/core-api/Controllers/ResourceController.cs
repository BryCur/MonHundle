using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers;

[ApiController]
[Route("resources")]
public class ResourceController : ControllerBase
{
    private readonly IGameTitleService _gameTitleService;

    public ResourceController(IGameTitleService gameTitleService)
    {
        _gameTitleService = gameTitleService;
    }
    
    [HttpGet("game-titles")]
    public IActionResult GetGameTitles()
    {
        return Ok(_gameTitleService.GetAllGameTitles());
    }
}