using PaymentService.Domain;
using Xunit;

namespace PaymentService.Tests;

// Rapport §6.2 : PaymentService ne marque pas une transaction comme payée
// sans confirmation valide.
public class PaymentConfirmationValidatorTests
{
    [Fact]
    public void Accepte_une_confirmation_valide()
    {
        var result = PaymentConfirmationValidator.Validate(orderId: 42, amount: 129.90f);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Refuse_une_commande_non_identifiee(int orderId)
    {
        var result = PaymentConfirmationValidator.Validate(orderId, amount: 100f);

        Assert.False(result.IsValid);
        Assert.Contains("commande", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(-50f)]
    [InlineData(float.NaN)]
    [InlineData(float.PositiveInfinity)]
    public void Refuse_un_montant_invalide(float amount)
    {
        var result = PaymentConfirmationValidator.Validate(orderId: 42, amount: amount);

        Assert.False(result.IsValid);
        Assert.Contains("montant", result.Error, StringComparison.OrdinalIgnoreCase);
    }
}
