using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities.DAL;

namespace MonHundle.database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameTitle> Games { get; set; }
    public DbSet<GuessableMonsterData> GuessableMonsters { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<GuessableMonsterData>()
            .HasNoKey()
            .ToView("guessable_monsters_v", "public");
    }
}