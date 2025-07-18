namespace ShippingService.Models
{
    public class ShippingModel
    {
        public int Id { get; set; }
        public int OrderId { get; set; } = default!;
        public string trackingNumber { get; set; } = default!;
        public string Carrier { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime ShppedAt { get; set; } = DateTime.UtcNow;
        public DateTime DeliveredAt { get; set; } = DateTime.UtcNow;
    }
}
