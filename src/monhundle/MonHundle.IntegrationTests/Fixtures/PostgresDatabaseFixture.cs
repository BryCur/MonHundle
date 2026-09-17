using Microsoft.Extensions.DependencyInjection;
using MonHundle.database;
using Npgsql;
using Testcontainers.PostgreSql;

namespace MonHundle.IntegrationTests.Fixtures;

public class PostgresDatabaseFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:15")
        .WithDatabase("monhundle_db")
        .WithUsername("dev")
        .WithPassword("D3vP4ssw0rd")
        .Build();

    private ServiceProvider _serviceProvider = null!;

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        await ApplyDbScripts();

        ServiceCollection services = new();
        services.AddLogging();
        services.AddDataAccessLayer(_container.GetConnectionString());
        _serviceProvider = services.BuildServiceProvider();
    }

    public async Task DisposeAsync()
    {
        if (_serviceProvider is not null)
        {
            await _serviceProvider.DisposeAsync();
        }

        await _container.DisposeAsync();
    }

    // expose CreateScope to let testing scenarios request the relevant DataAcess class,
    // instead of having a centralised and shared collection of classes.
    public IServiceScope CreateScope() => _serviceProvider.CreateScope();

    // Tables written to by DataAccess tests - reset between tests to avoid test data leaks.
    private static readonly string[] TransactionalTables = ["game_sessions", "players", "history_daily_mode"];

    public async Task ResetTransactionalDataAsync()
    {
        await using NpgsqlConnection connection = new(_container.GetConnectionString());
        await connection.OpenAsync();

        string tables = string.Join(", ", TransactionalTables);
        await using NpgsqlCommand command = new($"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE;", connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task ApplyDbScripts()
    {
        string scriptsDirectory = Path.Combine(AppContext.BaseDirectory, "DbScripts");
        string[] scriptFiles = Directory.GetFiles(scriptsDirectory, "*.sql")
            .OrderBy(Path.GetFileName, StringComparer.Ordinal)
            .ToArray();

        await using NpgsqlConnection connection = new(_container.GetConnectionString());
        await connection.OpenAsync();

        foreach (string scriptFile in scriptFiles)
        {
            string script = await File.ReadAllTextAsync(scriptFile);
            await using NpgsqlCommand command = new(script, connection);
            await command.ExecuteNonQueryAsync();
        }
    }
}
