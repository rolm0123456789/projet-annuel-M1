namespace PaymentService.Models
{
    public class PaymentModel
    {
        public int Id { get; set; }
        public int OrderId { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public float Amount { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    }
}
