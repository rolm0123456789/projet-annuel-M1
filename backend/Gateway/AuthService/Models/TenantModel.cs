using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models;

// Tables structurantes du modèle multi-tenant (rapport §5.5) :
// un tenant représente une boutique, tenant_users associe les utilisateurs
// à leurs boutiques avec un rôle. Un utilisateur peut appartenir à plusieurs tenants.
[Table("tenants")]
public class Tenant
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = default!;

    [Column("slug")]
    public string Slug { get; set; } = default!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Tenant par défaut du MVP : la boutique « Business First ». L'identifiant est
// partagé avec la Gateway et les services (configuration Tenancy:DefaultTenantId).
public static class TenantDefaults
{
    public const string DefaultTenantId = "11111111-1111-1111-1111-111111111111";
    public const string DefaultTenantName = "Business First";
    public const string DefaultTenantSlug = "business-first";
}

[Table("tenant_users")]
public class TenantUser
{
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role")]
    public string Role { get; set; } = default!;
}
