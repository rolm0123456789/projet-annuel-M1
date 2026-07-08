using OrderService.Domain;
using OrderService.Models;
using Xunit;

namespace OrderService.Tests;

public class OrderPricingTests
{
    [Fact]
    public void Le_total_est_la_somme_des_lignes()
    {
        var items = new List<OrderItemModel>
        {
            new() { ProductId = 1, Quantity = 2, UnitPrice = 10.5f },
            new() { ProductId = 2, Quantity = 1, UnitPrice = 4.0f }
        };

        Assert.Equal(25.0f, OrderPricing.ComputeTotal(items), precision: 2);
    }

    [Fact]
    public void Une_commande_sans_ligne_a_un_total_nul()
        => Assert.Equal(0f, OrderPricing.ComputeTotal([]));

    [Fact]
    public void Le_montant_client_est_ignore_le_total_vient_des_lignes()
    {
        var items = new List<OrderItemModel> { new() { ProductId = 1, Quantity = 3, UnitPrice = 2f } };
        // Peu importe le totalAmount envoyé par le client, seul le calcul serveur compte.
        Assert.Equal(6f, OrderPricing.ComputeTotal(items));
    }
}
