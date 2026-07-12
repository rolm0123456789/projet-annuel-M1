namespace PaymentService.Domain;

public record PaymentConfirmationResult(bool IsValid, string? Error)
{
    public static PaymentConfirmationResult Ok() => new(true, null);
    public static PaymentConfirmationResult Fail(string error) => new(false, error);
}

// Règle métier pure (rapport §6.2) : une transaction n'est jamais marquée comme
// payée sans confirmation valide (commande identifiée et montant cohérent).
public static class PaymentConfirmationValidator
{
    public static PaymentConfirmationResult Validate(int orderId, float amount)
    {
        if (orderId <= 0)
            return PaymentConfirmationResult.Fail("Identifiant de commande invalide.");

        if (amount <= 0 || float.IsNaN(amount) || float.IsInfinity(amount))
            return PaymentConfirmationResult.Fail("Montant de paiement invalide.");

        return PaymentConfirmationResult.Ok();
    }
}
