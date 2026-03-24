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
            .HasKey(m => m.MonsterId);
        
        modelBuilder
            .Entity<GameTitle>()
            .HasKey(gt => gt.Id);

        modelBuilder
            .Entity<GameSession>()
            .HasKey(gs => gs.Id);        
        
        modelBuilder
            .Entity<Player>()
            .HasKey(p => p.Id);;

        modelBuilder
            .Entity<DailyMonsterData>()
            .HasOne<GuessableMonsterData>(dm => dm.monsterData)
            .WithMany()
            .HasForeignKey(dm => dm.MonsterId);
    }
    
    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        builder.Properties<DateTime>()
            .HaveConversion<DateTimeUtcKindConverter>();
    }
}