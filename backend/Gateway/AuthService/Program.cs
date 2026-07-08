using AuthService.Data;
using AuthService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel();
// Add services
// PostgreSQL si une chaîne de connexion est fournie (conteneurs), sinon SQLite (dev local).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var usePostgres = !string.IsNullOrWhiteSpace(connectionString);
builder.Services.AddDbContext<AuthDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite("Data Source=auth.db");
});

builder.Services.AddScoped<TokenService>();

builder.Services.AddControllers();

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    if (usePostgres)
    {
        // Les migrations du projet sont générées pour SQLite : sur PostgreSQL le schéma
        // est créé depuis le modèle (avec attente de disponibilité de la base).
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                dbContext.Database.EnsureCreated();
                break;
            }
            catch (Exception) when (attempt < 30)
            {
                Thread.Sleep(TimeSpan.FromSeconds(2));
            }
        }
    }
    else
    {
        dbContext.Database.Migrate();
    }
}

app.Run();
