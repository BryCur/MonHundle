
using System.Security.Authentication;
using MonHundle.database.Interfaces.DataAccess;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DAL.Mappers;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.domain.Services;

public class GameService : IGameService
{
    private static readonly Dictionary<Guid, Game> Games = new Dictionary<Guid, Game>(); // en attendant Redis / DB
    private readonly IGameDataAccess _gameDataAccess;
    private readonly IMonsterService _monsterService;

    public GameService(IMonsterService monsterService, IGameDataAccess gameDataAccess)
    {
        _monsterService = monsterService ?? throw new ArgumentNullException(nameof(monsterService));
        _gameDataAccess = gameDataAccess ?? throw new ArgumentNullException(nameof(gameDataAccess));
    }
    
    /**
     * <summary> Initiate a new game session with a unique identifier owned by the userId. Also save the new game in database </summary>
     * <param name="userId"> Unique identifier of the player starting the game </param>
     * <returns> "bare" Game object with a newly created identifier </returns>
     */
    public Game CreateGame(String userId)
    {
        Game game = new Game
        {
            Id = Guid.NewGuid(), 
            Answer = _monsterService.getRandomMonster(), 
            playerId = Guid.Parse((ReadOnlySpan<char>)userId)
        };
        
        Games.Add(game.Id, game);
        _gameDataAccess.CreateGame(game);
        return game;
    }

    /**
     * <summary>Used to make a game progress, by comparing the guess to the answer and saving the new state</summary>
     * <param name="gameId"> Unique identifier of the game to update </param>
     * <param name="guess"> Monster data of the guess made </param>
     * <returns>Structure containing the necessary information to update client on the game state</returns>
     */
    public (MonsterGuessDTO, GameStates) MakeGuess(Guid gameId, GuessableMonster guess, Player player)
    {
        if (!player.Id.HasValue)
        {
            throw new AuthenticationException("no game owner provided");
        }
        
        GameSession game = _gameDataAccess.GetGame(gameId, player.Id.Value);
        GuessableMonster answerMonster = _monsterService.getMonsterFromId(game.AnswerMonsterId);
        MonsterComparisonResult comparisonResult = answerMonster.compareTo(guess);

        GameStates stateAfterGuess = GetGameStateAfterGuess(game, guess);
        
        saveNewGuess(game, guess, comparisonResult, stateAfterGuess);

        // create response obj
        MonsterGuessDTO monsterGuessDto = new MonsterGuessDTO(
            guess.GetCode(), 
            MonsterCriteriaDTO.ToDto(guess.GetCriterias()), 
            comparisonResult
        );
        
        
        return (monsterGuessDto, stateAfterGuess);
    }

    public Game? ResumeGame(Guid gameId, Player player)
    {
        if (!player.Id.HasValue)
        {
            throw new AuthenticationException("no game owner provided");
        }
        
        GameSession gameData = _gameDataAccess.GetGame(gameId, player.Id.Value);
        GuessableMonster answer = _monsterService.getMonsterFromId(gameData.AnswerMonsterId);

        return GameSessionMapper.ToDto(gameData, player, answer);
    }

    /**
     * TODO update when introducing new game modes
     *
     * <summary> Identify the state of the game after the guess </summary>
     * <param name="game"> game data object, reflects the game state before the guess</param>
     * <param name="guess"> guess provided by the player </param>
     *
     * <returns> the state after the guess </returns>
     */
    private GameStates GetGameStateAfterGuess(GameSession game, GuessableMonster guess)
    {
        return game.AnswerMonsterId == guess.GetId() ? GameStates.Win : GameStates.Ongoing;
    }

    /**
     * <summary>
     * Update the game object in database with the following:
     * - add the new guess
     * - update the state if guess is right
     * </summary>
     * <param name="game"> game data object, reflects the game state before the guess</param>
     * <param name="guess"> guess provided by the player </param>
     * <param name="comparisonResult"> new state of the game </param>
     */
    private void saveNewGuess(GameSession game, GuessableMonster guess, MonsterComparisonResult comparisonResult, GameStates stateAfterGuess)
    {
        game.LastUpdate = DateTime.UtcNow;
        game.State = stateAfterGuess.ToString();
        game.GameGuesses.Add(new GameGuessStruct() {
            MonsterCode = guess.GetCode(), 
            Criterias = new GameCriteriaStruct(guess.GetCriterias()),
            Comparisons = new GameComparisonStruct(comparisonResult),
        });
        
        _gameDataAccess.SaveGame(game);

    }
}