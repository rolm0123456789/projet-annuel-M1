using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;
using OrderService.Tenancy;
using Xunit;

namespace OrderService.Tests;

// Rapport §6.4 : un utilisateur du tenant A ne doit pas pouvoir lire, modifier
// ou supprimer une ressource du tenant B, même en forgeant un identifiant.
// Ici on valide le filtre applicatif ; en PostgreSQL, la RLS applique la même
// règle au niveau du SGBD.
public class TenantIsolationTests : IDisposable
{
    private static readonly Guid TenantA = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid TenantB = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    private readonly SqliteConnection _connection;

    public TenantIsolationTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        using var db = CreateContext(TenantA);
        db.Database.EnsureCreated();
    }

    private ApplicationDbContext CreateContext(Guid tenantId)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;
        return new ApplicationDbContext(options, new TenantContext { TenantId = tenantId });
    }

    private int SeedOrderForTenantB()
    {
        using var db = CreateContext(TenantB);
        var order = new OrderModel { UserId = 7, Status = "En attente", TotalAmount = 100 };
        db.Orders.Add(order);
        db.SaveChanges();
        return order.Id;
    }

    [Fact]
    public void Le_tenant_A_ne_voit_pas_les_commandes_du_tenant_B()
    {
        SeedOrderForTenantB();

        using var db = CreateContext(TenantA);
        Assert.Empty(db.Orders.ToList());
    }

    [Fact]
    public void Le_tenant_A_ne_lit_pas_une_commande_du_tenant_B_par_identifiant_forge()
    {
        var orderId = SeedOrderForTenantB();

        using var db = CreateContext(TenantA);
        Assert.Null(db.Orders.FirstOrDefault(o => o.Id == orderId));
    }

    [Fact]
    public void Le_tenant_B_retrouve_ses_propres_commandes()
    {
        var orderId = SeedOrderForTenantB();

        using var db = CreateContext(TenantB);
        var order = db.Orders.FirstOrDefault(o => o.Id == orderId);

        Assert.NotNull(order);
        Assert.Equal(TenantB, order.TenantId);
    }

    [Fact]
    public void Le_tenant_est_renseigne_automatiquement_a_la_creation()
    {
        using var db = CreateContext(TenantA);
        var order = new OrderModel { UserId = 1, Status = "En attente", TotalAmount = 10 };
        db.Orders.Add(order);
        db.SaveChanges();

        Assert.Equal(TenantA, order.TenantId);
    }

    public void Dispose() => _connection.Dispose();
}
