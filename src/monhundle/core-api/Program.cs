using core_api.Filters;
using core_api.Middlewares;
using MonHundle.database;
using MonHundle.domain.Interfaces.Services;
using MonHundle.domain.Services;
using Serilog;

namespace core_api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var connectionStringTemplate = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
        String connectionString = builder.Configuration["AZURE_POSTGRESQL_CONNECTIONSTRING"] ?? String.Format(
            connectionStringTemplate,
            builder.Configuration["HOST_ADDRESS"],
            builder.Configuration["HOST_PORT"],
            builder.Configuration["DB_NAME"],
            builder.Configuration["DB_USER"],
            builder.Configuration["DB_PWD"]
        );
        
        builder.Services.AddDataAccessLayer(connectionString);
        
        // logger configuration
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console(
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .CreateLogger();
        builder.Host.UseSerilog();

        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();

        // define the injectable classes
        builder.Services.AddScoped<IGameService, GameService>();
        builder.Services.AddScoped<IMonsterService, MonsterService>();
        builder.Services.AddScoped<IPlayerService, PlayerService>();
        builder.Services.AddScoped<IDailyGameManagementService, DailyGameManagementService>();
        builder.Services.AddScoped<IGameTitleService, GameTitleService>();
        builder.Services.AddScoped<ValidateUserFilter>();
        builder.Services.AddScoped<ManagementAuthFilter>();
    
        string[] allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(",") ?? Array.Empty<string>();
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend",
                policy => policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod());
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
