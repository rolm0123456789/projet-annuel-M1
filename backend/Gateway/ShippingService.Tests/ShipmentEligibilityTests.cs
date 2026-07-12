using ShippingService.Domain;
using Xunit;

namespace ShippingService.Tests;

// Rapport §6.2 : ShippingService ne crée pas d'expédition pour une commande
// non éligible. §5.6 étape 8 : l'expédition attend stock réservé ET paiement confirmé.
public class ShipmentEligibilityTests
{
    [Fact]
    public void Expedie_quand_stock_reserve_et_paiement_confirme()
    {
        var decision = ShipmentEligibility.Decide(stockReserved: true, paymentConfirmed: true, alreadyShipped: false);

        Assert.True(decision.Eligible);
        Assert.Null(decision.Reason);
    }

    [Fact]
    public void Refuse_sans_reservation_de_stock()
    {
        var decision = ShipmentEligibility.Decide(stockReserved: false, paymentConfirmed: true, alreadyShipped: false);

        Assert.False(decision.Eligible);
        Assert.Contains("stock", decision.Reason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Refuse_sans_paiement_confirme()
    {
        var decision = ShipmentEligibility.Decide(stockReserved: true, paymentConfirmed: false, alreadyShipped: false);

        Assert.False(decision.Eligible);
        Assert.Contains("paiement", decision.Reason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Refuse_une_commande_deja_expediee()
    {
        var decision = ShipmentEligibility.Decide(stockReserved: true, paymentConfirmed: true, alreadyShipped: true);

        Assert.False(decision.Eligible);
        Assert.Contains("expédition", decision.Reason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Refuse_une_commande_sans_aucune_condition_remplie()
    {
        var decision = ShipmentEligibility.Decide(stockReserved: false, paymentConfirmed: false, alreadyShipped: false);

        Assert.False(decision.Eligible);
    }
}
