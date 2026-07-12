using ShippingService.Models;
using ShippingService.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace ShippingService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, TenantContext tenant) : DbContext(options)
{
    public DbSet<ShippingModel> Shippings => Set<ShippingModel>();
    public DbSet<ShipmentPrecondition> ShipmentPreconditions => Set<ShipmentPrecondition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ShipmentPrecondition>()
            .HasIndex(p => new { p.TenantId, p.OrderId })
            .IsUnique();

        // Isolation applicative : toute requête est filtrée sur le tenant courant,
        // en complément de la RLS PostgreSQL (défense en profondeur, rapport §4.8).
        modelBuilder.Entity<ShippingModel>().HasQueryFilter(s => s.TenantId == tenant.TenantId);
        modelBuilder.Entity<ShipmentPrecondition>().HasQueryFilter(p => p.TenantId == tenant.TenantId);
    }

    public override int SaveChanges()
    {
        ChangeTracker.StampTenant(tenant);
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ChangeTracker.StampTenant(tenant);
        return base.SaveChangesAsync(cancellationToken);
    }
}
