using Microsoft.EntityFrameworkCore;
using OrderService.Models;
using OrderService.Tenancy;

namespace OrderService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, TenantContext tenant) : DbContext(options)
{
    public DbSet<OrderModel> Orders => Set<OrderModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OrderItemModel>()
            .HasOne(item => item.Order)
            .WithMany(order => order.Items)
            .HasForeignKey(item => item.OrderId);

        // Isolation applicative : toute requête est filtrée sur le tenant courant,
        // en complément de la RLS PostgreSQL (défense en profondeur, rapport §4.8).
        modelBuilder.Entity<OrderModel>().HasQueryFilter(o => o.TenantId == tenant.TenantId);
        modelBuilder.Entity<OrderItemModel>().HasQueryFilter(i => i.TenantId == tenant.TenantId);
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
