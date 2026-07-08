namespace OrderService.Domain;

// Transitions de statut pilotées par les événements du bus.
// Les libellés correspondent à ceux affichés par le frontend.
public static class OrderStatusFlow
{
    public const string Pending = "En attente";
    public const string Confirmed = "Confirmée";
    public const string Shipped = "Expédiée";
    public const string Delivered = "Livrée";
    public const string Cancelled = "Annulée";

    private static readonly Dictionary<string, int> Rank = new()
    {
        [Pending] = 0,
        [Confirmed] = 1,
        [Shipped] = 2,
        [Delivered] = 3
    };

    // Retourne le nouveau statut, ou null si l'événement ne doit pas modifier la commande
    // (statut terminal, événement en retard ou dupliqué).
    public static string? Apply(string currentStatus, string eventType)
    {
        if (currentStatus is Cancelled or Delivered)
            return null;

        var target = eventType switch
        {
            "StockReserved" => Confirmed,
            "StockReservationFailed" => Cancelled,
            "PaymentConfirmed" => Confirmed,
            "ShipmentCreated" => Shipped,
            _ => null
        };

        if (target is null)
            return null;

        if (target == Cancelled)
            return Cancelled;

        var currentRank = Rank.GetValueOrDefault(currentStatus, 0);
        return Rank[target] > currentRank ? target : null;
    }
}
