using Microsoft.EntityFrameworkCore;
using MonHundle.domain.Entities.DAL;

namespace MonHundle.database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameTitle> games { get; set; }
}