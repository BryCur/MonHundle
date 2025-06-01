using core_api.Models;
using core_api.Services;
using core_api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace core_api.Controllers;

[ApiController]
[Route("game")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;
    
    public GameController(IGameService gameService){ _gameService = gameService; }

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

    [HttpPost("guess")]
    public IActionResult MakeGuess([FromBody] Guid gameId, [FromBody] Guessable guess)
    {
        Game? game = _gameService.GetGame(gameId);
        if (game == null)
        {
            return NotFound();
        }
        
        List<ComparisonResult> results = game.Answer.compareTo(guess);
        
        return Ok(results);
    }
}