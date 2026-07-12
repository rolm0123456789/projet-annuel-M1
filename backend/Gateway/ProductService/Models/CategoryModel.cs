using System.ComponentModel.DataAnnotations.Schema;
using ProductService.Tenancy;

namespace ProductService.Models;

public class CategoryModel : ITenantOwned
{
    public int Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public string? Image { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public int ProductCount { get; set; }
}
