using ShippingService.Data;
using ShippingService.Messaging;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel();
// Add services
// PostgreSQL si une chaîne de connexion est fournie (conteneurs), sinon SQLite (dev local).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var usePostgres = !string.IsNullOrWhiteSpace(connectionString);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite("Data Source=Shipping.db");
});

// RabbitMQ (désactivé si RabbitMq:HostName n'est pas configuré)
var rabbitOptions = builder.Configuration.GetSection("RabbitMq").Get<RabbitMqOptions>() ?? new RabbitMqOptions();
builder.Services.AddSingleton(rabbitOptions);
if (rabbitOptions.Enabled)
{
    builder.Services.AddSingleton<RabbitMqConnection>();
    builder.Services.AddSingleton<IEventPublisher, RabbitMqEventPublisher>();
    builder.Services.AddHostedService<PaymentConfirmedConsumer>();
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
        ShippingDbStartup.EnsureCreatedWithRetry(db, app.Logger);
    }
    else
    {
        db.Database.Migrate(); // Applique les migrations et crée la DB si besoin
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

internal static class ShippingDbStartup
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
