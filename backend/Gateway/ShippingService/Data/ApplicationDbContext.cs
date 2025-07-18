using ShippingService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ShippingService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<ShippingModel> Shippings => Set<ShippingModel>();
}
