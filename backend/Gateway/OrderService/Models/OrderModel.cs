public class OrderModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Status { get; set; } = default!;
    public float TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItemModel> Items { get; set; } = new List<OrderItemModel>();
}

public class OrderItemModel
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public float UnitPrice { get; set; }
    public OrderModel? Order { get; set; }
}
