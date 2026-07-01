
using System.Security.Authentication;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;


public class GameServiceTest
{
    private readonly Mock<IMonsterService> _monsterServiceMock = new ();
    private readonly Mock<IGameDataAccess> _gameDataAccessMock = new ();
    private readonly NullLogger<GameService> _loggerMock = new ();
    
    private readonly Player _currentPlayer = new Player()
    {
        Id = 1,
        PlayerUid = Guid.NewGuid()
    };
    
    [Fact]
    public async Task GameService_should_create_a_new_unlimited_game_by_default()
    {
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        Game game = await service.CreateUnlimitedGameSessionWithRandomMonster(_currentPlayer);
        
        Assert.NotNull(game);
        Assert.NotEqual(Guid.Empty, game.Id);
        Assert.Equal(_currentPlayer.PlayerUid, game.PlayerId);
        Assert.Equal(GameModes.Unlimited, game.GameMode);
        _monsterServiceMock.Verify(s => s.getRandomMonster(), Times.Once);
        _gameDataAccessMock.Verify(s => s.CreateGame(game), Times.Once);
    }
    
    [Fact]
    public async Task GameService_should_create_a_new_of_specified_mode()
    {
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        GuessableMonster defaultMonster = GetDefaultGuessableMonster();
        
        Game game = await service.CreateGame(GameModes.Daily, _currentPlayer, defaultMonster);
        
        Assert.NotNull(game);
        Assert.NotEqual(Guid.Empty, game.Id);
        Assert.Equal(_currentPlayer.PlayerUid, game.PlayerId);
        Assert.Equal(GameModes.Daily, game.GameMode);
        Assert.Equal(game.Answer.GetCode(), defaultMonster.GetCode());
        _gameDataAccessMock.Verify(s => s.CreateGame(game), Times.Once);
    }

    [Fact]
    public async Task GameService_MakeGuess_should_update_the_game()
    {
        GameSession currentGame = new GameSession()
        {
            Id = 1,
            GameUid = Guid.NewGuid(),
            PlayerId = _currentPlayer.Id!.Value,
            AnswerMonsterId = 1,
            State = nameof(GameStates.Ongoing),
            GameGuesses = [],
        };
        GuessableMonster guess = GetDefaultGuessableMonster();
        GameSession? gameAfterGuess = null;
        
        GameGuessStruct addedGuess = new GameGuessStruct()
        {
            MonsterCode = guess.GetCode(),
            Criterias = new GameCriteriaStruct(guess.GetCriterias()),
            Comparisons = new GameComparisonStruct(guess.compareTo(guess)),
        };
        
        _gameDataAccessMock.Setup(mock => mock.GetGame(currentGame.GameUid, _currentPlayer.Id!.Value))
            .Returns(Task.FromResult(currentGame));
        _gameDataAccessMock.Setup(mock => mock.SaveGame(It.IsAny<GameSession>()))
            .Callback<GameSession>(gameParam => gameAfterGuess = gameParam); // intercept the parameter from the saveGame
        _monsterServiceMock.Setup(mock => mock.getMonsterFromId(currentGame.AnswerMonsterId))
            .Returns(Task.FromResult(guess));
        
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        (MonsterGuessDTO guessResult, GameStates stateAfterGuess) = await service.MakeGuess(currentGame.GameUid, guess, _currentPlayer);

        _gameDataAccessMock.Verify(mock => mock.SaveGame(It.IsAny<GameSession>()), Times.Once);
        Assert.NotNull(gameAfterGuess);
        Assert.Contains(addedGuess, gameAfterGuess.GameGuesses);
        Assert.Equal(guessResult.MonsterCode, guess.GetCode());
        Assert.Equal(GameStates.Win, stateAfterGuess);
    }
    
    [Fact]
    public async Task GameService_MakeGuess_continue_game_if_not_right_answer()
    {
        GameSession currentGame = new GameSession()
        {
            Id = 1,
            GameUid = Guid.NewGuid(),
            PlayerId = _currentPlayer.Id!.Value,
            AnswerMonsterId = 2,
            State = nameof(GameStates.Ongoing),
            GameGuesses = [],
        };
        GuessableMonster guess = GetDefaultGuessableMonster();
        
        _gameDataAccessMock.Setup(mock => mock.GetGame(currentGame.GameUid, _currentPlayer.Id!.Value))
            .Returns(Task.FromResult(currentGame));
        _monsterServiceMock.Setup(mock => mock.getMonsterFromId(currentGame.AnswerMonsterId))
            .Returns(Task.FromResult(guess));
        
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        (MonsterGuessDTO guessResult, GameStates stateAfterGuess) = await service.MakeGuess(currentGame.GameUid, guess, _currentPlayer);
        
        Assert.NotNull(guessResult);
        Assert.Equal(GameStates.Ongoing, stateAfterGuess);
    }
    
    [Fact]
    public async Task GameService_should_throw_if_player_as_no_id_on_resume_game()
    {
        var badPlayer = new Player()
        {
            Id = null,
            PlayerUid = Guid.NewGuid()
        };
        
        GameService service = new GameService( _loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        await Assert.ThrowsAsync<AuthenticationException>(async () => await service.ResumeGame(Guid.NewGuid(), badPlayer));
    }

    private GuessableMonster GetDefaultGuessableMonster()
    {
        return new GuessableMonster(
            1,
            "test_monster",
            new MonsterCriteria(
                new CriteriaNumber(1),
                new CriteriaNumber(1),
                new CriteriaObject<Classifications>(Classifications.Amphibian),
                new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>()),
                new CriteriaSet<Diets>(new HashSet<Diets>()),
                new CriteriaSet<Afflictions>(new HashSet<Afflictions>()),
                new CriteriaSet<Habitats>(new HashSet<Habitats>())
            )
        );
    }
}