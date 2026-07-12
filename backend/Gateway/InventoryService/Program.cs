using InventoryService.Data;
using InventoryService.Messaging;
using InventoryService.Tenancy;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel();

// Contexte tenant : résolu par requête (header Gateway) ou par message consommé.
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<TenantConnectionInterceptor>();

// Add services
// PostgreSQL si une chaîne de connexion est fournie (conteneurs), sinon SQLite (dev local).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var usePostgres = !string.IsNullOrWhiteSpace(connectionString);
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    if (usePostgres)
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite("Data Source=Inventory.db");

    // Positionne app.current_tenant sur chaque connexion : la RLS s'applique.
    options.AddInterceptors(sp.GetRequiredService<TenantConnectionInterceptor>());
});

// RabbitMQ (désactivé si RabbitMq:HostName n'est pas configuré)
var rabbitOptions = builder.Configuration.GetSection("RabbitMq").Get<RabbitMqOptions>() ?? new RabbitMqOptions();
builder.Services.AddSingleton(rabbitOptions);
if (rabbitOptions.Enabled)
{
    builder.Services.AddSingleton<RabbitMqConnection>();
    builder.Services.AddSingleton<IEventPublisher, RabbitMqEventPublisher>();
    builder.Services.AddHostedService<OrderCreatedConsumer>();
}
else
{
    builder.Services.AddSingleton<IEventPublisher, NullEventPublisher>();
}

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (usePostgres)
    {
        InventoryDbStartup.EnsureCreatedWithRetry(db, app.Logger);
    }
    else
    {
        // Base SQLite locale jetable : recréée depuis le modèle (le schéma
        // a évolué avec tenant_id, les anciennes migrations ne suffisent plus).
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }

    // Row-Level Security PostgreSQL sur les tables métiers (rapport §4.7, Annexe D).
    TenantRls.Apply(db, "Inventorys");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Résolution du tenant courant depuis le header interne posé par la Gateway.
app.UseMiddleware<TenantMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();

internal static class InventoryDbStartup
{
    public static void EnsureCreatedWithRetry(DbContext db, ILogger logger)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                db.Database.EnsureCreated();
                return;
            }
            catch (Exception ex) when (attempt < 30)
            {
                logger.LogWarning(ex, "Base de données indisponible (tentative {Attempt}/30), nouvel essai dans 2s", attempt);
                Thread.Sleep(TimeSpan.FromSeconds(2));
            }
        }
    }
}
