using core_api.Models;
using core_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace core_api.Controllers;

[ApiController]
[Route("game")]
public class GameController : ControllerBase
{
    private readonly GameService _gameService;
    
    public GameController(GameService gameService){ _gameService = gameService; }

    [HttpPost("start")]
    public IActionResult StartGame()
    {
        // start a new game
        Game newGame = _gameService.CreateGame();
        // return game ID
        return Ok(newGame.Id);
    }

    [HttpGet("resume/{gameId:guid}")]
    public IActionResult ResumeOngoingGame(Guid gameId)
    {
        Game? game = _gameService.GetGame(gameId);
        
        if (game == null)
        {
            return NotFound();
        }
        
        return Ok(game);
    }
}