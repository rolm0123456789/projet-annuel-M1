using Microsoft.EntityFrameworkCore;
using ShippingService.Data;
using ShippingService.Domain;
using ShippingService.Models;
using ShippingService.Tenancy;

namespace ShippingService.Messaging;

// Consomme StockReserved et PaymentConfirmed (Annexe C du rapport) : l'expédition
// n'est créée que lorsque les conditions sont remplies — stock réservé ET paiement
// confirmé (§5.6, étape 8). Publie alors ShipmentCreated.
public sealed class OrderEventsConsumer(
    RabbitMqConnection connection,
    IServiceScopeFactory scopeFactory,
    IEventPublisher eventPublisher,
    ILogger<OrderEventsConsumer> logger)
    : RabbitMqConsumerService(connection, logger)
{
    private readonly ILogger<OrderEventsConsumer> _logger = logger;

    protected override string QueueName => "shipping.order-events";

    protected override IReadOnlyCollection<string> RoutingKeys =>
    [
        EventBusTopology.StockReserved,
        EventBusTopology.PaymentConfirmed
    ];

    protected override async Task HandleAsync(EventEnvelope envelope, CancellationToken ct)
    {
        var orderId = envelope.Payload.GetProperty("orderId").GetInt32();

        using var scope = scopeFactory.CreateScope();

        // Le traitement s'exécute dans le tenant de l'événement (isolation §6.4).
        scope.ServiceProvider.GetRequiredService<TenantContext>().TenantId = envelope.TenantId;
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var precondition = await db.ShipmentPreconditions.FirstOrDefaultAsync(p => p.OrderId == orderId, ct);
        if (precondition is null)
        {
            precondition = new ShipmentPrecondition { OrderId = orderId };
            db.ShipmentPreconditions.Add(precondition);
        }

        // Idempotent : rejouer le même événement laisse le drapeau à true.
        switch (envelope.EventType)
        {
            case "StockReserved":
                precondition.StockReserved = true;
                break;
            case "PaymentConfirmed":
                precondition.PaymentConfirmed = true;
                break;
        }

        var alreadyShipped = await db.Shippings.AnyAsync(s => s.OrderId == orderId, ct);
        var decision = ShipmentEligibility.Decide(precondition.StockReserved, precondition.PaymentConfirmed, alreadyShipped);

        if (!decision.Eligible)
        {
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Commande {OrderId} non expédiable pour l'instant : {Reason} (correlationId={CorrelationId})",
                orderId, decision.Reason, envelope.CorrelationId);
            return;
        }

        var shipment = new ShippingModel
        {
            OrderId = orderId,
            trackingNumber = $"BF-{orderId:D6}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
            Carrier = "Colissimo",
            Status = "En préparation",
            ShppedAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow
        };

        db.Shippings.Add(shipment);
        await db.SaveChangesAsync(ct);

        eventPublisher.Publish(EventBusTopology.ShipmentCreated, "ShipmentCreated",
            new { orderId, shipmentId = shipment.Id, trackingNumber = shipment.trackingNumber },
            envelope.TenantId, envelope.CorrelationId);
    }
}
