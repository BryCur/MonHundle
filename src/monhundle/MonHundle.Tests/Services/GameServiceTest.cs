using core_api.Models;
using core_api.Services;
using core_api.Services.Interfaces;
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
        GameService service = new GameService();
        
        Game game = service.CreateGame();
        
        Assert.NotNull(game);
        Assert.NotEqual(Guid.Empty, game.Id);
    }

    [Fact]
    public void GameService_should_save_the_game()
    {
        GameService service = new GameService();
        Game game = service.CreateGame();
        Assert.NotNull(game);
        
        Game? fetchedGame = service.GetGame(game.Id);
        Assert.NotNull(fetchedGame);
        Assert.Equal(game.Id, fetchedGame!.Id);
    }

    [Fact]
    public void GameService_should_return_null_if_game_does_not_exist()
    {
        GameService service = new GameService();
        Game? fetchedGame = service.GetGame(Guid.NewGuid());
        Assert.Null(fetchedGame);
    }
}