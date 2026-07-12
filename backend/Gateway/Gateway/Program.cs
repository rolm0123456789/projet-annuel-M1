using System.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Configuration CORS pour autoriser tous les domaines
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Validation des tokens JWT émis par AuthService (rapport §5.2).
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Authenticated", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
});

builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Activer CORS avant tout
app.UseCors();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Journalisation des requêtes (rapport §5.2, §5.9) : chaque requête reçoit un
// correlationId qui est propagé aux services et permet de suivre le flux complet.
app.Use(async (context, next) =>
{
    var correlationId = Guid.TryParse(context.Request.Headers["X-Correlation-Id"], out var incoming)
        ? incoming
        : Guid.NewGuid();
    context.Request.Headers["X-Correlation-Id"] = correlationId.ToString();
    context.Response.Headers["X-Correlation-Id"] = correlationId.ToString();

    var stopwatch = Stopwatch.StartNew();
    try
    {
        await next();
    }
    finally
    {
        stopwatch.Stop();
        app.Logger.LogInformation(
            "{Method} {Path} => {StatusCode} en {ElapsedMs}ms (correlationId={CorrelationId}, tenantId={TenantId})",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            stopwatch.ElapsedMilliseconds,
            correlationId,
            context.Request.Headers["X-Tenant-Id"].ToString());
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Règles d'autorisation par préfixe de route (rapport §4.8) : la Gateway n'est
// pas l'unique barrière — les services et la RLS complètent la défense en
// profondeur — mais elle bloque les accès non autorisés au plus tôt.
// Les GET du catalogue produits restent publics (vitrine de la boutique).
var protectedRoutes = new List<(string prefix, string[] methods, string policy)>
{
    ("/api/orders",    new[] { "GET", "POST", "DELETE" }, "Authenticated"),
    ("/api/orders",    new[] { "PUT", "PATCH" },          "RequireAdmin"),
    ("/api/payments",  new[] { "GET", "POST", "PUT", "PATCH", "DELETE" }, "RequireAdmin"),
    ("/api/products",  new[] { "POST", "PUT", "PATCH", "DELETE" },        "RequireAdmin"),
    ("/api/inventory", new[] { "GET", "POST", "PUT", "PATCH", "DELETE" }, "RequireAdmin"),
    ("/api/shipping",  new[] { "GET" },                                    "Authenticated"),
    ("/api/shipping",  new[] { "POST", "PUT", "PATCH", "DELETE" },         "RequireAdmin"),
};

var defaultTenantId = app.Configuration["Tenancy:DefaultTenantId"] ?? "11111111-1111-1111-1111-111111111111";

app.MapReverseProxy(proxyPipeline =>
{
    proxyPipeline.Use(async (context, next) =>
    {
        var requestPath = context.Request.Path.Value ?? "";
        var requestMethod = context.Request.Method.ToUpperInvariant();

        var match = protectedRoutes.FirstOrDefault(r =>
            requestPath.StartsWith(r.prefix, StringComparison.OrdinalIgnoreCase) &&
            r.methods.Contains(requestMethod));

        if (!string.IsNullOrEmpty(match.prefix))
        {
            var authService = context.RequestServices.GetRequiredService<IAuthorizationService>();
            var result = await authService.AuthorizeAsync(context.User, null, match.policy);

            if (!result.Succeeded)
            {
                context.Response.StatusCode = context.User.Identity?.IsAuthenticated == true ? 403 : 401;
                await context.Response.WriteAsync(
                    context.Response.StatusCode == 403
                        ? "Access Denied: insufficient permissions."
                        : "Unauthorized: Authentication required.");
                return;
            }
        }

        // Les headers de contexte interne ne sont jamais acceptés du client :
        // ils sont dérivés exclusivement du JWT validé par la Gateway.
        context.Request.Headers.Remove("X-User-Id");
        context.Request.Headers.Remove("X-User-Role");
        context.Request.Headers.Remove("X-Tenant-Id");

        var userId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                  ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
            context.Request.Headers["X-User-Id"] = userId;

        var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(role))
            context.Request.Headers["X-User-Role"] = role;

        // Propagation du tenant aux services internes (rapport §4.8) : celui du
        // JWT pour un utilisateur connecté, la boutique par défaut pour un
        // visiteur anonyme (vitrine publique du MVP).
        var tenantId = context.User.FindFirst("tenantId")?.Value;
        context.Request.Headers["X-Tenant-Id"] = string.IsNullOrEmpty(tenantId) ? defaultTenantId : tenantId;

        await next();
    });
});

app.Run();
