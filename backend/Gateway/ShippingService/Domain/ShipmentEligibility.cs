namespace ShippingService.Domain;

public record ShipmentDecision(bool Eligible, string? Reason)
{
    public static ShipmentDecision Ok() => new(true, null);
    public static ShipmentDecision NotEligible(string reason) => new(false, reason);
}

// Règle métier pure (rapport §6.2) : aucune expédition n'est créée pour une
// commande non éligible. Une commande est éligible lorsque son stock est
// réservé, son paiement confirmé et qu'aucune expédition n'existe déjà (§5.6).
public static class ShipmentEligibility
{
    public static ShipmentDecision Decide(bool stockReserved, bool paymentConfirmed, bool alreadyShipped)
    {
        if (alreadyShipped)
            return ShipmentDecision.NotEligible("Une expédition existe déjà pour cette commande.");

        if (!stockReserved)
            return ShipmentDecision.NotEligible("Le stock de la commande n'est pas réservé.");

        if (!paymentConfirmed)
            return ShipmentDecision.NotEligible("Le paiement de la commande n'est pas confirmé.");

        return ShipmentDecision.Ok();
    }
}
