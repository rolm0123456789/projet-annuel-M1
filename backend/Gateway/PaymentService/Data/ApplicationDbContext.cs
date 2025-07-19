using PaymentService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace PaymentService.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<PaymentModel> Payments => Set<PaymentModel>();
}
