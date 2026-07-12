using System.ComponentModel.DataAnnotations.Schema;
using ShippingService.Tenancy;

namespace ShippingService.Models
{
    public class ShippingModel : ITenantOwned
    {
        public int Id { get; set; }

        // Les expéditions sont rattachées à la boutique de la commande (rapport §4.3).
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        public int OrderId { get; set; } = default!;
        public string trackingNumber { get; set; } = default!;
        public string Carrier { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime ShppedAt { get; set; } = DateTime.UtcNow;
        public DateTime DeliveredAt { get; set; } = DateTime.UtcNow;
    }

    // Conditions préalables à l'expédition d'une commande (rapport §5.6, étape 8) :
    // le stock doit être réservé ET le paiement confirmé avant de créer l'expédition.
    public class ShipmentPrecondition : ITenantOwned
    {
        public int Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        public int OrderId { get; set; }
        public bool StockReserved { get; set; }
        public bool PaymentConfirmed { get; set; }
    }
}
