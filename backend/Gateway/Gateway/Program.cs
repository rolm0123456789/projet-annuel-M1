using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true; // Debug (optionnel)

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

// Cl secrte EXACTEMENT comme dans Flask
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
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("AUTH ERROR: " + context.Exception.ToString());
                return Task.CompletedTask;
            }
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

app.UseHttpsRedirection();

// Activer CORS avant l'authentification
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var protectedRoutes = new List<(string path, string method, string policy)>
{
    ("/api/payments/Payment", "GET", "RequireAdmin"),
    //("/api/payments/Payment", "POST", "RequireAdmin"),
    //("/api/payments/Payment", "PATCH", "RequireAdmin"),
    //("/api/orders/place", "POST", "Authenticated"),
    //("/api/orders/cancel", "PATCH", "Authenticated"),
    //("/api/users/delete", "DELETE", "RequireAdmin")
};


app.MapReverseProxy(proxyPipeline =>
{
    proxyPipeline.Use(async (context, next) =>
    {
        var requestPath = context.Request.Path.Value;
        var requestMethod = context.Request.Method.ToUpperInvariant();

        var match = protectedRoutes.FirstOrDefault(r =>
            r.path.Equals(requestPath, StringComparison.OrdinalIgnoreCase) &&
            r.method.Equals(requestMethod, StringComparison.OrdinalIgnoreCase)
        );

        if (!string.IsNullOrEmpty(match.path))
        {
            var authService = context.RequestServices.GetRequiredService<IAuthorizationService>();
            var result = await authService.AuthorizeAsync(context.User, null, match.policy);

            if (!result.Succeeded)
            {
                context.Response.StatusCode = match.policy == "RequireAdmin" ? 403 : 401;
                await context.Response.WriteAsync(
                    match.policy == "RequireAdmin"
                        ? "Access Denied: Admin only."
                        : "Unauthorized: Authentication required."
                );
                return;
            }
        }
        var userId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                  ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Ajoute l'ID utilisateur à l'en-tête
        if (!string.IsNullOrEmpty(userId))
        {
            context.Request.Headers["X-User-Id"] = userId;
        }

        await next();
    });
});

app.Run();
