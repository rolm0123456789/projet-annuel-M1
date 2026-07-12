using ProductService.Domain;
using ProductService.Models;
using Xunit;

namespace ProductService.Tests;

// Rapport §6.2 : ProductService refuse la création d'un produit sans nom
// ou sans prix valide.
public class ProductValidatorTests
{
    private static ProductModel ValidProduct() => new()
    {
        Name = "Casque audio",
        Description = "Casque à réduction de bruit",
        Price = 19900,
        Image = "",
        Images = [],
        Category = "Audio",
        CategoryId = "audio",
        Brand = "Sony",
        StockQuantity = 10,
        Tags = []
    };

    [Fact]
    public void Accepte_un_produit_valide()
    {
        var result = ProductValidator.Validate(ValidProduct());

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }

    [Fact]
    public void Refuse_un_produit_nul()
    {
        var result = ProductValidator.Validate(null);

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Refuse_un_produit_sans_nom(string? name)
    {
        var product = ValidProduct();
        product.Name = name!;

        var result = ProductValidator.Validate(product);

        Assert.False(result.IsValid);
        Assert.Contains("nom", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-19900)]
    public void Refuse_un_produit_sans_prix_valide(int price)
    {
        var product = ValidProduct();
        product.Price = price;

        var result = ProductValidator.Validate(product);

        Assert.False(result.IsValid);
        Assert.Contains("prix", result.Error, StringComparison.OrdinalIgnoreCase);
    }
}
