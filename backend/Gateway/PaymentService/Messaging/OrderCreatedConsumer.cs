using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Domain;
using PaymentService.Models;
using PaymentService.Tenancy;

namespace PaymentService.Messaging;

// Consomme OrderCreated : enregistre un paiement simulé puis publie PaymentConfirmed.
public sealed class OrderCreatedConsumer(
    RabbitMqConnection connection,
    IServiceScopeFactory scopeFactory,
    IEventPublisher eventPublisher,
    ILogger<OrderCreatedConsumer> logger)
    : RabbitMqConsumerService(connection, logger)
{
    private readonly ILogger<OrderCreatedConsumer> _logger = logger;

    protected override string QueueName => "payment.order-created";

    protected override IReadOnlyCollection<string> RoutingKeys => [EventBusTopology.OrderCreated];

    protected override async Task HandleAsync(EventEnvelope envelope, CancellationToken ct)
    {
        var orderId = envelope.Payload.GetProperty("orderId").GetInt32();
        var amount = envelope.Payload.GetProperty("totalAmount").GetSingle();

        using var scope = scopeFactory.CreateScope();

        // Le traitement s'exécute dans le tenant de l'événement (isolation §6.4).
        scope.ServiceProvider.GetRequiredService<TenantContext>().TenantId = envelope.TenantId;
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Idempotence : un paiement existe déjà pour cette commande.
        if (await db.Payments.AnyAsync(p => p.OrderId == orderId, ct))
        {
            _logger.LogInformation("Paiement déjà enregistré pour la commande {OrderId}, événement ignoré", orderId);
            return;
        }

        // Une transaction n'est jamais marquée payée sans confirmation valide (§6.2).
        var confirmation = PaymentConfirmationValidator.Validate(orderId, amount);
        if (!confirmation.IsValid)
        {
            _logger.LogWarning("Confirmation de paiement refusée pour la commande {OrderId} : {Reason} (correlationId={CorrelationId})",
                orderId, confirmation.Error, envelope.CorrelationId);
            return;
        }

        // Paiement simulé : aucun prestataire réel n'est branché (voir perspectives du rapport).
        var payment = new PaymentModel
        {
            OrderId = orderId,
            PaymentMethod = "Carte bancaire (simulé)",
            Amount = amount,
            Status = "Payée",
            PaidAt = DateTime.UtcNow
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync(ct);

        eventPublisher.Publish(EventBusTopology.PaymentConfirmed, "PaymentConfirmed",
            new { orderId, paymentId = payment.Id, amount }, envelope.TenantId, envelope.CorrelationId);
    }
}
