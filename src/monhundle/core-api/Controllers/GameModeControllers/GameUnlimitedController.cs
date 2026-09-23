using System.Security.Authentication;
using core_api.Filters;
using Microsoft.AspNetCore.Mvc;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;

namespace core_api.Controllers.GameModeControllers;

[ApiController]
[Route("game/unlimited")]
[ServiceFilter(typeof(ValidateUserFilter))]
public class GameUnlimitedController : ControllerBase
{
    private readonly ILogger<GameUnlimitedController> _logger;
    private readonly IGameService _gameService;
    private readonly IMonsterService _monsterService;

    public GameUnlimitedController(ILogger<GameUnlimitedController> logger, IGameService gameService, IMonsterService monsterService)
    {
        _logger = logger;
        _gameService = gameService;
        _monsterService = monsterService;
    }

    [HttpPost("start")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    public async Task<ActionResult<Guid>> StartGame()
    {
        Player player = GetPlayerFromContext();
        Game newGame = await _gameService.CreateUnlimitedGameSessionWithRandomMonster(player);
        
        // return game ID
        _logger.LogInformation("The player {playerId} started a new game", player.Id);
        return Ok(newGame.Id);
    }

    [HttpGet("resume/{gameId:guid}")]
    [ProducesResponseType(typeof(GameStateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GameStateResponse>> ResumeOngoingGame(Guid gameId)
    {
        Player player = GetPlayerFromContext();
        Game? game = await _gameService.ResumeGame(gameId, player);
        
        if (game == null)
        {
            _logger.LogWarning("The player {playerId}, tried to resume game {gameId}, but game was not found", player.Id, gameId);
            return NotFound();
        }
        
        return Ok(new GameStateResponse(
            game.Id,
            game.State,
            game.Guesses,
            game.GameMode
        ));
    }

    [HttpPost("guess")]
    [ProducesResponseType(typeof(GuessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GuessResponse>> MakeGuess([FromBody] MakeGuessBody body)
    {
        GuessableMonster guess = await _monsterService.getMonsterFromCode(body.guessId) ??
                           throw new InvalidDataException($"no monster matches id {body.guessId}");
        
        Player player = GetPlayerFromContext();
        (MonsterGuessDTO resp, GameStates stateAfterGuess) = await _gameService.MakeGuess(body.gameId, guess, player);
        
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