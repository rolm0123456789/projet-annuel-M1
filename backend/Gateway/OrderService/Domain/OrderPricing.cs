using OrderService.Models;

namespace OrderService.Domain;

public static class OrderPricing
{
    // Le total est calculé côté serveur à partir des lignes : le montant envoyé
    // par le client n'est jamais considéré comme fiable.
    public static float ComputeTotal(IEnumerable<OrderItemModel> items)
        => items.Sum(i => i.Quantity * i.UnitPrice);
}
