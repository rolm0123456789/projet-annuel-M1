using InventoryService.Models;
using InventoryService.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, TenantContext tenant) : DbContext(options)
{
    public DbSet<InventoryModel> Inventorys => Set<InventoryModel>();
    public DbSet<ProcessedEvent> ProcessedEvents => Set<ProcessedEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<ProcessedEvent>().HasKey(e => e.EventId);

        // Isolation applicative : toute requête est filtrée sur le tenant courant,
        // en complément de la RLS PostgreSQL (défense en profondeur, rapport §4.8).
        modelBuilder.Entity<InventoryModel>().HasQueryFilter(i => i.TenantId == tenant.TenantId);
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
