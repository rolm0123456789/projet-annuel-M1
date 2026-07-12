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

    SeedTenants(dbContext, app.Configuration);
}

app.Run();

// Tenant par défaut (boutique « Business First ») + rattachement des utilisateurs
// existants : tout utilisateur doit appartenir à un tenant (rapport §4.6/§5.5).
static void SeedTenants(AuthDbContext db, IConfiguration config)
{
    var defaultTenantId = Guid.Parse(config["Tenancy:DefaultTenantId"] ?? AuthService.Models.TenantDefaults.DefaultTenantId);

    if (!db.Tenants.Any(t => t.Id == defaultTenantId))
    {
        db.Tenants.Add(new AuthService.Models.Tenant
        {
            Id = defaultTenantId,
            Name = AuthService.Models.TenantDefaults.DefaultTenantName,
            Slug = AuthService.Models.TenantDefaults.DefaultTenantSlug
        });
        db.SaveChanges();
    }

    var usersWithoutTenant = db.Users
        .Where(u => !db.TenantUsers.Any(tu => tu.UserId == u.Id))
        .ToList();

    foreach (var user in usersWithoutTenant)
    {
        db.TenantUsers.Add(new AuthService.Models.TenantUser
        {
            TenantId = defaultTenantId,
            UserId = user.Id,
            Role = user.Role
        });
    }

    if (usersWithoutTenant.Count > 0)
        db.SaveChanges();
}
