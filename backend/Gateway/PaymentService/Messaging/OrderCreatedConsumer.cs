using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

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

    protected override async Task HandleAsync(string eventType, Guid eventId, Guid correlationId, JsonElement data, CancellationToken ct)
    {
        var orderId = data.GetProperty("orderId").GetInt32();
        var amount = data.GetProperty("totalAmount").GetSingle();

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Idempotence : un paiement existe déjà pour cette commande.
        if (await db.Payments.AnyAsync(p => p.OrderId == orderId, ct))
        {
            _logger.LogInformation("Paiement déjà enregistré pour la commande {OrderId}, événement ignoré", orderId);
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
            new { orderId, paymentId = payment.Id, amount }, correlationId);
    }
}
