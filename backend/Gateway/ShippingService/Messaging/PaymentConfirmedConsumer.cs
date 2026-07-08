using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ShippingService.Data;
using ShippingService.Models;

namespace ShippingService.Messaging;

// Consomme PaymentConfirmed : prépare l'expédition puis publie ShipmentCreated.
public sealed class PaymentConfirmedConsumer(
    RabbitMqConnection connection,
    IServiceScopeFactory scopeFactory,
    IEventPublisher eventPublisher,
    ILogger<PaymentConfirmedConsumer> logger)
    : RabbitMqConsumerService(connection, logger)
{
    private readonly ILogger<PaymentConfirmedConsumer> _logger = logger;

    protected override string QueueName => "shipping.payment-confirmed";

    protected override IReadOnlyCollection<string> RoutingKeys => [EventBusTopology.PaymentConfirmed];

    protected override async Task HandleAsync(string eventType, Guid eventId, Guid correlationId, JsonElement data, CancellationToken ct)
    {
        var orderId = data.GetProperty("orderId").GetInt32();

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Idempotence : une expédition existe déjà pour cette commande.
        if (await db.Shippings.AnyAsync(s => s.OrderId == orderId, ct))
        {
            _logger.LogInformation("Expédition déjà créée pour la commande {OrderId}, événement ignoré", orderId);
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
            new { orderId, shipmentId = shipment.Id, trackingNumber = shipment.trackingNumber }, correlationId);
    }
}
