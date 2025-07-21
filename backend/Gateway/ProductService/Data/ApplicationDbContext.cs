using Microsoft.EntityFrameworkCore;
using ProductService.Models;

namespace ProductService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<ProductModel> Products => Set<ProductModel>();
}