using System.Security.Authentication;
using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;

namespace core_api.Controllers;

[ApiController]
[Route("game")]
[ServiceFilter(typeof(ValidateUserFilter))]
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
        Player player = GetPlayerFromContext();
        Game newGame = _gameService.CreateGame(player);
        
        // return game ID
        return Ok(newGame.Id);
    }

    [HttpGet("resume/{gameId:guid}")]
    public IActionResult ResumeOngoingGame(Guid gameId)
    {
        Player player = GetPlayerFromContext();
        Game? game = _gameService.ResumeGame(gameId, player);
        
        if (game == null)
        {
            return NotFound();
        }
        
        return Ok(new GameStateResponse(
            game.Id,
            game.State,
            game.Guesses
        ));
    }

    [HttpPost("guess")]
    public IActionResult MakeGuess([FromBody] MakeGuessBody body)
    {
        GuessableMonster guess = _monsterService.getMonsterFromCode(body.guessId) ??
                           throw new InvalidOperationException($"no monster matches id {body.guessId}");
        
        Player player = GetPlayerFromContext();
        (MonsterGuessDTO resp, GameStates stateAfterGuess) = _gameService.MakeGuess(body.gameId, guess, player);
        
        return Ok(new GuessResponse(
            resp.MonsterCode,
            resp.Criterias,
            resp.ComparisonResult,
            stateAfterGuess
        ));
    }

    private Player GetPlayerFromContext()
    {
        return HttpContext.Items["PlayerData"] as Player ?? throw new AuthenticationException();
    }
}