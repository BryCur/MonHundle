
using MonHundle.domain.Entities;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;
using Moq;

namespace MonHundle.Tests.Services;


public class GameServiceTest
{
    private readonly Mock<IMonsterService> _monsterServiceMock;

    public GameServiceTest()
    {
        _monsterServiceMock = new Mock<IMonsterService>();
    }
    
    [Fact]
    public void GameService_should_create_a_new_game()
    {
        GameService service = new GameService(_monsterServiceMock.Object);
        
        Game game = service.CreateGame("player_1");
        
        Assert.NotNull(game);
        Assert.NotEqual(Guid.Empty, game.Id);
        Assert.Equal("player_1", game.playerId.ToString());
        _monsterServiceMock.Verify(s => s.getRandomMonster(), Times.Once);
    }

    [Fact]
    public void GameService_should_save_the_game()
    {
        GameService service = new GameService(_monsterServiceMock.Object);
        Game game = service.CreateGame("player_1");
        Assert.NotNull(game);
        
        Game? fetchedGame = service.ResumeGame(game.Id);
        Assert.NotNull(fetchedGame);
        Assert.Equal(game.Id, fetchedGame!.Id);
    }

    [Fact]
    public void GameService_should_return_null_if_game_does_not_exist()
    {
        GameService service = new GameService(_monsterServiceMock.Object);
        Game? fetchedGame = service.ResumeGame(Guid.NewGuid());
        Assert.Null(fetchedGame);
    }
}