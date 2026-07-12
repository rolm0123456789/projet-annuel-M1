using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using OrderService.Tenancy;

namespace OrderService.Models;

public class OrderModel : ITenantOwned
{
    public int Id { get; set; }

    // Chaque ressource métier est rattachée à un tenant (exigence 2 du rapport).
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    public int UserId { get; set; }
    public string Status { get; set; } = default!;
    public float TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItemModel> Items { get; set; } = new List<OrderItemModel>();
}

public class OrderItemModel : ITenantOwned
{
    public int Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public float UnitPrice { get; set; }

    [JsonIgnore] public OrderModel? Order { get; set; }
}
