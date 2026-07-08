using OrderService.Domain;
using Xunit;

namespace OrderService.Tests;

public class OrderStatusFlowTests
{
    [Fact]
    public void StockReserved_confirme_une_commande_en_attente()
        => Assert.Equal(OrderStatusFlow.Confirmed, OrderStatusFlow.Apply(OrderStatusFlow.Pending, "StockReserved"));

    [Fact]
    public void StockReservationFailed_annule_la_commande()
        => Assert.Equal(OrderStatusFlow.Cancelled, OrderStatusFlow.Apply(OrderStatusFlow.Pending, "StockReservationFailed"));

    [Fact]
    public void ShipmentCreated_passe_la_commande_en_expediee()
        => Assert.Equal(OrderStatusFlow.Shipped, OrderStatusFlow.Apply(OrderStatusFlow.Confirmed, "ShipmentCreated"));

    [Fact]
    public void Un_evenement_en_retard_ne_fait_pas_regresser_le_statut()
        => Assert.Null(OrderStatusFlow.Apply(OrderStatusFlow.Shipped, "StockReserved"));

    [Fact]
    public void PaymentConfirmed_ne_change_rien_si_deja_confirmee()
        => Assert.Null(OrderStatusFlow.Apply(OrderStatusFlow.Confirmed, "PaymentConfirmed"));

    [Theory]
    [InlineData("StockReserved")]
    [InlineData("PaymentConfirmed")]
    [InlineData("ShipmentCreated")]
    public void Une_commande_annulee_est_terminale(string eventType)
        => Assert.Null(OrderStatusFlow.Apply(OrderStatusFlow.Cancelled, eventType));

    [Fact]
    public void Une_commande_livree_est_terminale()
        => Assert.Null(OrderStatusFlow.Apply(OrderStatusFlow.Delivered, "ShipmentCreated"));

    [Fact]
    public void Un_evenement_inconnu_est_ignore()
        => Assert.Null(OrderStatusFlow.Apply(OrderStatusFlow.Pending, "SomethingElse"));
}
