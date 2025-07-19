namespace InventoryService.Models
{
    public class InventoryModel
    {
        public int Id { get; set; }
        public string ProductId { get; set; } = default!;
        public string Quantity { get; set; } = default!;
        public DateTime last_updated { get; set; } = DateTime.UtcNow;
    }
}
