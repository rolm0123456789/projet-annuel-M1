using Microsoft.EntityFrameworkCore;

namespace OrderService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<OrderModel> Orders => Set<OrderModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OrderItemModel>()
         .HasOne(item => item.Order)
         .WithMany(order => order.Items)
         .HasForeignKey(item => item.OrderId);
    }

}
