namespace InventoryService.Models
{
    // Trace des événements déjà consommés : garantit l'idempotence
    // (un même OrderCreated reçu deux fois ne réserve pas deux fois le stock).
    public class ProcessedEvent
    {
        public Guid EventId { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }
}
