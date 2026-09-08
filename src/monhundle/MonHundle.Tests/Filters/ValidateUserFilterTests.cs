using core_api.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.Tests.Utils;
using Moq;

namespace MonHundle.Tests.Filters;

public class ValidateUserFilterTests
{
    private readonly Mock<IPlayerDataAccess> _playerDataAccess = new();

    private ActionExecutingContext ContextWithBearer(string? bearerValue)
    {
        var httpContext = new DefaultHttpContext();
        if (bearerValue is not null)
        {
            httpContext.Request.Headers.Authorization = $"Bearer {bearerValue}";
        }

        return FilterContextFactory.ExecutingContext(httpContext);
    }

    private async Task<(ActionExecutingContext context, bool nextCalled)> Execute(ActionExecutingContext context)
    {
        bool nextCalled = false;
        ActionExecutionDelegate next = () =>
        {
            nextCalled = true;
            return Task.FromResult(FilterContextFactory.ExecutedContext(context));
        };

        await new ValidateUserFilter(_playerDataAccess.Object).OnActionExecutionAsync(context, next);
        return (context, nextCalled);
    }

    [Fact]
    public async Task OnActionExecutionAsync_attaches_the_player_and_proceeds_when_the_bearer_is_a_known_player()
    {
        Guid playerUid = Guid.NewGuid();
        Player player = new() { Id = 1, PlayerUid = playerUid };
        _playerDataAccess.Setup(p => p.GetPlayer(playerUid)).ReturnsAsync(player);

        (ActionExecutingContext context, bool nextCalled) = await Execute(ContextWithBearer(playerUid.ToString()));

        Assert.True(nextCalled);
        Assert.Null(context.Result);
        Assert.Same(player, context.HttpContext.Items["PlayerData"]);
    }

    [Fact]
    public async Task OnActionExecutionAsync_returns_401_when_no_bearer_token_is_present()
    {
        (ActionExecutingContext context, bool nextCalled) = await Execute(ContextWithBearer(null));

        Assert.False(nextCalled);
        Assert.IsType<UnauthorizedResult>(context.Result);
        _playerDataAccess.Verify(p => p.GetPlayer(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task OnActionExecutionAsync_returns_401_when_the_bearer_token_is_not_a_guid()
    {
        (ActionExecutingContext context, bool nextCalled) = await Execute(ContextWithBearer("not-a-guid"));

        Assert.False(nextCalled);
        Assert.IsType<UnauthorizedResult>(context.Result);
        _playerDataAccess.Verify(p => p.GetPlayer(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task OnActionExecutionAsync_returns_401_when_the_player_is_unknown()
    {
        Guid unknownUid = Guid.NewGuid();
        _playerDataAccess.Setup(p => p.GetPlayer(unknownUid)).ReturnsAsync((Player?)null);

        (ActionExecutingContext context, bool nextCalled) = await Execute(ContextWithBearer(unknownUid.ToString()));

        Assert.False(nextCalled);
        Assert.IsType<UnauthorizedResult>(context.Result);
        Assert.False(context.HttpContext.Items.ContainsKey("PlayerData"));
    }
}
