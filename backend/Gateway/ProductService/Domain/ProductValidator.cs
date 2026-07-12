using ProductService.Models;

namespace ProductService.Domain;

public record ProductValidationResult(bool IsValid, string? Error)
{
    public static ProductValidationResult Ok() => new(true, null);
    public static ProductValidationResult Fail(string error) => new(false, error);
}

// Règle métier pure (rapport §6.2) : un produit sans nom ou sans prix valide
// est refusé à la création comme à la mise à jour.
public static class ProductValidator
{
    public static ProductValidationResult Validate(ProductModel? product)
    {
        if (product is null)
            return ProductValidationResult.Fail("Le produit est requis.");

        if (string.IsNullOrWhiteSpace(product.Name))
            return ProductValidationResult.Fail("Le nom du produit est requis.");

        if (product.Price <= 0)
            return ProductValidationResult.Fail("Le prix du produit doit être strictement positif.");

        return ProductValidationResult.Ok();
    }
}
