using Microsoft.EntityFrameworkCore;
using ProductService.Models;
using ProductService.Tenancy;

namespace ProductService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, TenantContext tenant) : DbContext(options)
{
    public DbSet<ProductModel> Products => Set<ProductModel>();
    public DbSet<CategoryModel> Categories => Set<CategoryModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Isolation applicative : toute requête est filtrée sur le tenant courant,
        // en complément de la RLS PostgreSQL (défense en profondeur, rapport §4.8).
        modelBuilder.Entity<ProductModel>().HasQueryFilter(p => p.TenantId == tenant.TenantId);
        modelBuilder.Entity<CategoryModel>().HasQueryFilter(c => c.TenantId == tenant.TenantId);
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
