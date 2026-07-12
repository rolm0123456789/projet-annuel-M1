using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ShippingService.Tenancy;

// Socle multi-tenant du service (rapport §4.6, §4.7, §5.5) :
// - TenantContext porte le tenant courant (requête HTTP ou message consommé) ;
// - TenantMiddleware le résout depuis le header interne X-Tenant-Id posé par la Gateway ;
// - TenantConnectionInterceptor positionne app.current_tenant sur chaque connexion
//   PostgreSQL pour que les politiques RLS s'appliquent ;
// - TenantRls active les politiques RLS et les index tenant_id (Annexe D).

public sealed class TenantContext
{
    public Guid? TenantId { get; set; }
}

public static class TenantDefaults
{
    // Boutique par défaut du MVP ; identifiant seedé par AuthService et partagé
    // par la Gateway (configuration Tenancy:DefaultTenantId).
    public const string DefaultTenantId = "11111111-1111-1111-1111-111111111111";
}

// Entité métier rattachée à un tenant (colonne tenant_id).
public interface ITenantOwned
{
    Guid TenantId { get; set; }
}

public sealed class TenantMiddleware(RequestDelegate next, IConfiguration config)
{
    private readonly Guid _defaultTenantId =
        Guid.Parse(config["Tenancy:DefaultTenantId"] ?? TenantDefaults.DefaultTenantId);

    public async Task InvokeAsync(HttpContext context, TenantContext tenant)
    {
        // Le header est posé par la Gateway à partir du JWT validé ; en accès
        // direct (dev local), on retombe sur la boutique par défaut.
        tenant.TenantId = Guid.TryParse(context.Request.Headers["X-Tenant-Id"], out var tenantId)
            ? tenantId
            : _defaultTenantId;

        await next(context);
    }
}

public static class TenantEntityHelpers
{
    // Renseigne tenant_id sur les entités ajoutées qui ne le précisent pas.
    public static void StampTenant(this ChangeTracker changeTracker, TenantContext tenant)
    {
        if (tenant.TenantId is not { } tenantId)
            return;

        foreach (var entry in changeTracker.Entries<ITenantOwned>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                entry.Entity.TenantId = tenantId;
        }
    }
}

// Positionne le tenant courant dans la session PostgreSQL : même si une requête
// applicative oubliait un filtre tenant_id, la RLS bloque les lignes des autres
// tenants (rapport §4.7).
public sealed class TenantConnectionInterceptor(TenantContext tenant) : DbConnectionInterceptor
{
    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        if (connection is Npgsql.NpgsqlConnection)
            SetCurrentTenant(connection);
    }

    public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
    {
        if (connection is not Npgsql.NpgsqlConnection)
            return;

        await using var command = connection.CreateCommand();
        PrepareCommand(command);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private void SetCurrentTenant(DbConnection connection)
    {
        using var command = connection.CreateCommand();
        PrepareCommand(command);
        command.ExecuteNonQuery();
    }

    private void PrepareCommand(DbCommand command)
    {
        command.CommandText = "SELECT set_config('app.current_tenant', @tenant, false)";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "tenant";
        parameter.Value = tenant.TenantId?.ToString() ?? "";
        command.Parameters.Add(parameter);
    }
}

public static class TenantRls
{
    // Active la Row-Level Security sur les tables métiers (Annexe D du rapport).
    // Idempotent : rejoué à chaque démarrage du service. PostgreSQL uniquement.
    public static void Apply(DbContext db, params string[] tables)
    {
        if (!db.Database.IsNpgsql())
            return;

        foreach (var table in tables)
        {
            var suffix = table.ToLowerInvariant();
            db.Database.ExecuteSqlRaw($"""
                ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY;
                ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS tenant_isolation_{suffix} ON "{table}";
                CREATE POLICY tenant_isolation_{suffix}
                ON "{table}"
                USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
                WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
                CREATE INDEX IF NOT EXISTS ix_{suffix}_tenant_id ON "{table}" (tenant_id);
                """);
        }
    }
}
