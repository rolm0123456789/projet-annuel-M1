using System.ComponentModel.DataAnnotations.Schema;
using PaymentService.Tenancy;

namespace PaymentService.Models
{
    public class PaymentModel : ITenantOwned
    {
        public int Id { get; set; }

        // Traçabilité multi-tenant : commande, montant, statut et tenant (rapport §4.3).
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        public int OrderId { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public float Amount { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    }
}
