using InventoryService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace InventoryService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<InventoryModel> Inventorys => Set<InventoryModel>();
    public DbSet<ProcessedEvent> ProcessedEvents => Set<ProcessedEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<ProcessedEvent>().HasKey(e => e.EventId);
    }
}
