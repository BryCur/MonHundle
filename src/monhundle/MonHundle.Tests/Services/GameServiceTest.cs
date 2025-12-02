
using System.Security.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using MonHundle.database.Interfaces.DataAccess;
using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;


public class GameServiceTest
{
    private readonly Mock<IMonsterService> _monsterServiceMock;
    private readonly Mock<IGameDataAccess> _gameDataAccessMock;
    private readonly NullLogger<GameService> _loggerMock;
    
    private readonly Player _currentPlayer = new Player()
    {
        Id = 1,
        PlayerUid = new Guid()
    };


    public GameServiceTest()
    {
        _monsterServiceMock = new Mock<IMonsterService>();
        _gameDataAccessMock = new Mock<IGameDataAccess>();
        _loggerMock = new NullLogger<GameService>();
    }
    
    [Fact]
    public void GameService_should_create_a_new_game()
    {
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        Game game = service.CreateGame(_currentPlayer);
        
        Assert.NotNull(game);
        Assert.NotEqual(Guid.Empty, game.Id);
        Assert.Equal(_currentPlayer.PlayerUid, game.PlayerId);
        _monsterServiceMock.Verify(s => s.getRandomMonster(), Times.Once);
        _gameDataAccessMock.Verify(s => s.CreateGame(game), Times.Once);
    }

    [Fact]
    public void GameService_MakeGuess_should_update_the_game()
    {
        GameSession currentGame = new GameSession()
        {
            Id = 1,
            GameUid = Guid.NewGuid(),
            PlayerId = _currentPlayer.Id!.Value,
            AnswerMonsterId = 1,
            State = GameStates.Ongoing.ToString(),
            GameGuesses = [],
        };
        GuessableMonster guess = getDefaultGuessableMonster();
        GameSession? gameAfterGuess = null;
        
        GameGuessStruct addedGuess = new GameGuessStruct()
        {
            MonsterCode = guess.GetCode(),
            Criterias = new GameCriteriaStruct(guess.GetCriterias()),
            Comparisons = new GameComparisonStruct(guess.compareTo(guess)),
        };
        
        _gameDataAccessMock.Setup(mock => mock.GetGame(currentGame.GameUid, _currentPlayer.Id!.Value))
            .Returns(currentGame);
        _gameDataAccessMock.Setup(mock => mock.SaveGame(It.IsAny<GameSession>()))
            .Callback<GameSession>(gameParam => gameAfterGuess = gameParam); // intercept the parameter from the saveGame
        _monsterServiceMock.Setup(mock => mock.getMonsterFromId(currentGame.AnswerMonsterId))
            .Returns(guess);
        
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        (MonsterGuessDTO guessResult, GameStates stateAfterGuess) = service.MakeGuess(currentGame.GameUid, guess, _currentPlayer);

        _gameDataAccessMock.Verify(mock => mock.SaveGame(It.IsAny<GameSession>()), Times.Once);
        Assert.NotNull(gameAfterGuess);
        Assert.Contains(addedGuess, gameAfterGuess.GameGuesses);
        Assert.Equal(guessResult.MonsterCode, guess.GetCode());
        Assert.Equal(GameStates.Win, stateAfterGuess);
    }
    
    [Fact]
    public void GameService_MakeGuess_continue_game_if_not_right_answer()
    {
        GameSession currentGame = new GameSession()
        {
            Id = 1,
            GameUid = Guid.NewGuid(),
            PlayerId = _currentPlayer.Id!.Value,
            AnswerMonsterId = 2,
            State = GameStates.Ongoing.ToString(),
            GameGuesses = [],
        };
        GuessableMonster guess = getDefaultGuessableMonster();
        
        _gameDataAccessMock.Setup(mock => mock.GetGame(currentGame.GameUid, _currentPlayer.Id!.Value))
            .Returns(currentGame);
        _monsterServiceMock.Setup(mock => mock.getMonsterFromId(currentGame.AnswerMonsterId))
            .Returns(guess);
        
        GameService service = new GameService(_loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        (MonsterGuessDTO guessResult, GameStates stateAfterGuess) = service.MakeGuess(currentGame.GameUid, guess, _currentPlayer);
        
        Assert.Equal(GameStates.Ongoing, stateAfterGuess);
    }
    
    [Fact]
    public void GameService_should_throw_if_player_as_no_id_on_resume_game()
    {
        var badPlayer = new Player()
        {
            Id = null,
            PlayerUid = new Guid()
        };
        
        GameService service = new GameService( _loggerMock, _monsterServiceMock.Object, _gameDataAccessMock.Object);
        
        Assert.Throws<AuthenticationException>(() => service.ResumeGame(new Guid(), badPlayer));
    }

    public GuessableMonster getDefaultGuessableMonster()
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