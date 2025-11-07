using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities.DAL;

namespace MonHundle.database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameTitle> Games { get; init; }
    public DbSet<GuessableMonsterData> GuessableMonsters { get; init; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<GuessableMonsterData>()
            .HasNoKey()
            .ToView("guessable_monsters_v", "public");
        
        modelBuilder
            .Entity<GameTitle>()
            .ToView("game_titles", "public");
    }
}