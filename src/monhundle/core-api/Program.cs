using core_api.Filters;
using core_api.Middlewares;
using Microsoft.EntityFrameworkCore;
using MonHundle.database;
using MonHundle.database.DataAccessers;
using MonHundle.database.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.DataAccess;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;
using Npgsql;

namespace core_api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddDbContext<AppDbContext>(options =>
        {
            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
            dataSourceBuilder.EnableDynamicJson(); // allows dynamic parsing of json data
            var dataSource = dataSourceBuilder.Build();

            options.UseNpgsql(dataSource);
        });

        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();

        // define the injectable classes
        builder.Services.AddScoped<IGameService, GameService>();
        builder.Services.AddScoped<IMonsterService, MonsterService>();
        builder.Services.AddScoped<IPlayerService, PlayerService>();
        builder.Services.AddScoped<IMonsterDataAccess, MonsterDataAccess>();
        builder.Services.AddScoped<IGameTitleService, GameTitleService>();
        builder.Services.AddScoped<IGameTitleDataAccess, GameTitleDataAccess>();
        builder.Services.AddScoped<IGameDataAccess, GameSessionDataAccess>();
        builder.Services.AddScoped<IPlayerDataAccess, PlayerDataAccess>();
        builder.Services.AddScoped<ValidateUserFilter>();


        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend",
                policy => policy
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        
        app.UseCors("AllowFrontend");
        
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseHttpsRedirection();
        app.MapControllers();
        app.Run();
    }
}
