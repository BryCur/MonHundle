using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers;

[ApiController]
[Route("game")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly IMonsterService _monsterService;

    public GameController(IGameService gameService, IMonsterService monsterService)
    {
        _gameService = gameService;
        _monsterService = monsterService;
    }

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
    public IActionResult MakeGuess([FromBody] MakeGuessBody body)
    {
        Game? game = _gameService.GetGame(body.gameId);
        if (game == null)
        {
            return NotFound("game was not found");
        }

        GuessableMonster guess = _monsterService.getMonsterFromId(body.guessId) ??
                           throw new InvalidOperationException($"no monster matches id {body.guessId}");
        
        List<ComparisonResult> results = game.Answer.compareTo(guess);
        
        return Ok(results);
    }
}