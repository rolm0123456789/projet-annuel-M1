using System.ComponentModel.DataAnnotations.Schema;
using InventoryService.Tenancy;

namespace InventoryService.Models
{
    public class InventoryModel : ITenantOwned
    {
        public int Id { get; set; }

        // Le stock est géré par boutique (rapport §4.3).
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        public string ProductId { get; set; } = default!;
        public string Quantity { get; set; } = default!;
        public DateTime last_updated { get; set; } = DateTime.UtcNow;
    }
}
