using EFCoreSecondLevelCacheInterceptor;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MonHundle.database.DataAccessers;
using MonHundle.database.Services;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using Npgsql;

namespace MonHundle.database;

public static class DataAccessServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccessLayer(this IServiceCollection services, string connectionString)
    {
        services.AddEFSecondLevelCache(options =>
            options.UseMemoryCacheProvider()
        );

        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
            dataSourceBuilder.EnableDynamicJson();
            var dataSource = dataSourceBuilder.Build();

            options.UseNpgsql(dataSource)
                .AddInterceptors(sp.GetRequiredService<SecondLevelCacheInterceptor>());
        });

        services.AddScoped<IMonsterDataAccess, MonsterDataAccess>();
        services.AddScoped<IGameTitleDataAccess, GameTitleDataAccess>();
        services.AddScoped<IGameDataAccess, GameSessionDataAccess>();
        services.AddScoped<IPlayerDataAccess, PlayerDataAccess>();
        services.AddScoped<IDailyGameManagementDataAccess, DailyGameManagementDataAccess>();
        services.AddScoped<IDatabaseCacheService, DatabaseCacheService>();

        return services;
    }
}