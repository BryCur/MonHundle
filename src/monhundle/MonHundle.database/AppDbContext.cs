using Microsoft.EntityFrameworkCore;
using MonHundle.database.Converters;
using MonHundle.domain.Entities.DAL;

namespace MonHundle.database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameTitle> Games { get; init; }
    public DbSet<GuessableMonsterData> GuessableMonsters { get; init; }
    public DbSet<GameSession> GameSessions { get; init; }
    public DbSet<Player> Players { get; init; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<GuessableMonsterData>()
            .HasNoKey()
            .ToView("guessable_monsters_v", "public");
        
        modelBuilder
            .Entity<GameTitle>()
            .ToView("game_titles", "public");  
        
        modelBuilder
            .Entity<GameSession>()
            .ToView("game_sessions", "public");        
        
        modelBuilder
            .Entity<Player>()
            .ToView("players", "public");
    }
    
    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        builder.Properties<DateTime>()
            .HaveConversion<DateTimeUtcKindConverter>();
    }
}