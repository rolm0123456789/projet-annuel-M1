using System.ComponentModel.DataAnnotations.Schema;
using ProductService.Tenancy;

namespace ProductService.Models;

public class ProductModel : ITenantOwned
{
    public int Id { get; set; }

    // Chaque produit est rattaché à un tenant : un commerçant ne gère que son
    // propre catalogue (rapport §4.3).
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    public string Name { get; set; }
    public string Description { get; set; }
    public int Price { get; set; }
    public string Image { get; set; }
    public List<string> Images { get; set; }
    public string Category { get; set; }
    public string CategoryId { get; set; }
    public string Brand { get; set; }
    public int StockQuantity { get; set; }
    public List<string> Tags { get; set; }
    public bool IsOnSale { get; set; }
    public int Discount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }
}
