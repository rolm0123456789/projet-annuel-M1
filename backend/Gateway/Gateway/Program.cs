/// Fonctionne avec log
//using Gateway.Configuration;
//using Gateway.Resources;

//var builder = WebApplication.CreateBuilder(args);
//var services = builder.Services;

//// Configuration
//var config = ReverseProxyConfiguration.Configure();

//// Dependencies injection
//services.AddDefaultLogging(config);
//services.AddYarpReverseProxy(builder);
//services.AddHttpLogging(httpLogger =>
//{
//    httpLogger.CombineLogs = true;
//});

//var app = builder.Build();

//app.UseRouting();
//app.UseWebSockets();
//app.UseResponseCompression();
//app.UseHttpLogging();
//app.UseHealthChecks(Settings.HealthEndpoint);
//app.UseCertificateForwarding();
//app.UseResponseCaching();

//// Register the reverse proxy routes
//app.MapReverseProxy();

//app.Logger.LogInformation(
//    message: Logs.Welcome,
//    DateTime.Now.ToShortTimeString());

//app.Run();


/// Fontionne Sans log
//var builder = WebApplication.CreateBuilder(args);
//builder.Services.AddReverseProxy()
//    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
//var app = builder.Build();
//app.MapReverseProxy();
//app.Run();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

builder.Services.AddHttpClient("gateway", client =>
{
    client.BaseAddress = new Uri("https://localhost:7299/");
});

// Ajoute les contrôleurs
builder.Services.AddControllers();

// Ajoute tes clients HTTP si tu en as (ex. : vers microservices)
//builder.Services.AddHttpClient<CommandeClient>();
//builder.Services.AddHttpClient<UtilisateurClient>();

// Ajoute YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Mappe les routes des contrôleurs
app.MapControllers();

// Mappe YARP
app.MapReverseProxy();

app.Run();
