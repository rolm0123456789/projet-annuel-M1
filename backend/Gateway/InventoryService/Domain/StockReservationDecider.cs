namespace InventoryService.Domain;

public record ReservationLine(string ProductId, int Requested);

public record ReservationResult(bool Success, string? FailureReason)
{
    public static ReservationResult Ok() => new(true, null);
    public static ReservationResult Fail(string reason) => new(false, reason);
}

// Règle métier pure : une réservation est tout-ou-rien sur l'ensemble des lignes.
public static class StockReservationDecider
{
    public static ReservationResult Decide(IReadOnlyDictionary<string, int> availableByProduct, IEnumerable<ReservationLine> lines)
    {
        foreach (var line in lines)
        {
            if (line.Requested <= 0)
                return ReservationResult.Fail($"Quantité demandée invalide pour le produit {line.ProductId}");

            if (!availableByProduct.TryGetValue(line.ProductId, out var available))
                return ReservationResult.Fail($"Produit {line.ProductId} absent de l'inventaire");

            if (available < line.Requested)
                return ReservationResult.Fail($"Stock insuffisant pour le produit {line.ProductId} ({available} disponible(s), {line.Requested} demandé(s))");
        }

        return ReservationResult.Ok();
    }
}
