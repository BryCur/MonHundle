using Microsoft.EntityFrameworkCore;
using MonHundle.database;
using MonHundle.domain.Interfaces;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;

namespace core_api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();

        // define the injectable classes
        builder.Services.AddSingleton<IGameService, GameService>();
        builder.Services.AddSingleton<IMonsterService, MonsterService>();
        
        builder.Services.AddScoped<IGameTitleService, GameTitleService>();
        builder.Services.AddScoped<IGameTitleDataAccess, GameTitleDataAccess>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.MapControllers();
        app.Run();
    }
}
