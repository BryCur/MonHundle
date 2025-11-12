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
        // start a new game
        string? sUID = Request.Cookies["user_id"];
        if (string.IsNullOrEmpty(sUID))
        {
            return Unauthorized("user not recognised");
        }
        
        Game newGame = _gameService.CreateGame(sUID);
        
        // return game ID
        return Ok(newGame.Id);
    }

    [HttpGet("resume/{gameId:guid}")]
    public IActionResult ResumeOngoingGame(Guid gameId)
    {
        // TODO automatically do user_id check before reaching any endpoints
        Guid playerId;
        bool parsedPlayer;
        
        parsedPlayer = Guid.TryParse(Request.Cookies["user_id"], out playerId) && playerId != Guid.Empty;

        if (!parsedPlayer)
        {
            return Unauthorized("user not recognised");
        }
        
        Game? game = _gameService.ResumeGame(playerId, gameId);
        
        if (game == null)
        {
            return NotFound();
        }
        
        return Ok(game);
    }

    [HttpPost("guess")]
    public IActionResult MakeGuess([FromBody] MakeGuessBody body)
    {
        
        // TODO automatically do user_id check before reaching any endpoints
        Guid playerId;
        bool parsedPlayer;
        
        parsedPlayer = Guid.TryParse(Request.Cookies["user_id"], out playerId) && playerId != Guid.Empty;

        if (!parsedPlayer)
        {
            return Unauthorized("user not recognised");
        }
        
        GuessableMonster guess = _monsterService.getMonsterFromCode(body.guessId) ??
                           throw new InvalidOperationException($"no monster matches id {body.guessId}");
        
        
        GuessResponse resp = _gameService.MakeGuess(body.gameId, guess);
        
        return Ok(resp);
    }
}