using System.Runtime.InteropServices.JavaScript;
using System.Security.Authentication;
using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.Services;

namespace core_api.Controllers.GameModeControllers;

[ApiController]
[Route("game/daily")]
[ServiceFilter(typeof(ValidateUserFilter))]
public class GameDailyController : ControllerBase
{
    private readonly ILogger<GameDailyController> _logger;
    private readonly IGameService _gameService;
    private readonly IMonsterService _monsterService;

    public GameDailyController(ILogger<GameDailyController> logger, IGameService gameService, IMonsterService monsterService)
    {
        _logger = logger;
        _gameService = gameService;
        _monsterService = monsterService;
    }

    [HttpPost("start")]
    public IActionResult StartGame()
    {
        Player player = GetPlayerFromContext();
        Game? todaysGame = _gameService.GetDailyGameForPlayerAtDate(DateTime.UtcNow, player);

        if (todaysGame != null && todaysGame.StartTime.Date.Equals(DateTime.Today.Date))
        {
            _logger.LogInformation("The player {playerId} already had a daily game created", player.Id);
            Response.Headers.Add(HeaderNames.Location, $"/game/daily/resume/{todaysGame.Id.ToString()}");
            return StatusCode(303);
        }
        
        GuessableMonster dailyMonster = _monsterService.getDailyMonster(DateTime.UtcNow);
        Game newGame = _gameService.CreateGame(GameModes.Daily, player, dailyMonster);
        
        // return game ID
        _logger.LogInformation("The player {playerId} started a new game", player.Id);
        return Ok(newGame.Id);
    }

    [HttpGet("resume/{gameId:guid}")]
    public IActionResult ResumeOngoingGame(Guid gameId)
    {
        Player player = GetPlayerFromContext();
        Game? game = _gameService.ResumeGame(gameId, player);
        
        if (game == null)
        {
            _logger.LogWarning("The player {playerId}, tried to resume game {gameId}, but game was not found", player.Id, gameId);
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