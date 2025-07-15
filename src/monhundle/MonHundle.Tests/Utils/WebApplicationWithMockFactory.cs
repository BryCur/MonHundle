using core_api;
using core_api.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace MonHundle.Tests.Utils;

public class WebApplicationWithMockFactory : WebApplicationFactory<Program>
{
    public Mock<IGameService> GameServiceMock { get; } = new();
    public Mock<IMonsterService> MonsterServiceMock { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(s =>
        {
            s.RemoveAll(typeof(IGameService));
            s.AddSingleton(_ => GameServiceMock.Object);
            s.RemoveAll(typeof(IMonsterService));
            s.AddSingleton(_ => MonsterServiceMock.Object);
        });
    }
}