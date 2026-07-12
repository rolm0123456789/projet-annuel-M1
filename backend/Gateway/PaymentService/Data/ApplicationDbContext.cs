using PaymentService.Models;
using PaymentService.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace PaymentService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, TenantContext tenant) : DbContext(options)
{
    public DbSet<PaymentModel> Payments => Set<PaymentModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Isolation applicative : toute requête est filtrée sur le tenant courant,
        // en complément de la RLS PostgreSQL (défense en profondeur, rapport §4.8).
        modelBuilder.Entity<PaymentModel>().HasQueryFilter(p => p.TenantId == tenant.TenantId);
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
