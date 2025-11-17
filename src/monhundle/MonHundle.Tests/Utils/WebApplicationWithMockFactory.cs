using core_api;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using Moq;

namespace MonHundle.Tests.Utils;

public class WebApplicationWithMockFactory : WebApplicationFactory<Program>
{
    public Mock<IGameService> GameServiceMock { get; } = new();
    public Mock<IMonsterService> MonsterServiceMock { get; } = new();
    public Mock<IPlayerDataAccess> MockPlayerAccess { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(s =>
        {
            s.RemoveAll(typeof(IGameService));
            s.AddScoped(_ => GameServiceMock.Object);
            s.RemoveAll(typeof(IMonsterService));
            s.AddScoped(_ => MonsterServiceMock.Object);            
            s.RemoveAll(typeof(IPlayerDataAccess));
            s.AddScoped(_ => MockPlayerAccess.Object);
        });
    }
}