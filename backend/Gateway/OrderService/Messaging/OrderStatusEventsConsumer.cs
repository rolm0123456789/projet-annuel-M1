using System.Text.Json;
using OrderService.Data;
using OrderService.Domain;

namespace OrderService.Messaging;

// Met à jour le statut des commandes à partir des événements publiés
// par InventoryService, PaymentService et ShippingService.
public sealed class OrderStatusEventsConsumer(
    RabbitMqConnection connection,
    IServiceScopeFactory scopeFactory,
    ILogger<OrderStatusEventsConsumer> logger)
    : RabbitMqConsumerService(connection, logger)
{
    private readonly ILogger<OrderStatusEventsConsumer> _logger = logger;

    protected override string QueueName => "order.status-events";

    protected override IReadOnlyCollection<string> RoutingKeys =>
    [
        EventBusTopology.StockReserved,
        EventBusTopology.StockReservationFailed,
        EventBusTopology.PaymentConfirmed,
        EventBusTopology.ShipmentCreated
    ];

    protected override async Task HandleAsync(string eventType, Guid eventId, Guid correlationId, JsonElement data, CancellationToken ct)
    {
        var orderId = data.GetProperty("orderId").GetInt32();

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var order = await db.Orders.FindAsync([orderId], ct);
        if (order is null)
        {
            _logger.LogWarning("Commande {OrderId} introuvable pour l'événement {EventType} (correlationId={CorrelationId})",
                orderId, eventType, correlationId);
            return;
        }

        var newStatus = OrderStatusFlow.Apply(order.Status, eventType);
        if (newStatus is null)
            return;

        order.Status = newStatus;
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("Commande {OrderId} : statut mis à jour vers '{Status}' suite à {EventType} (correlationId={CorrelationId})",
            orderId, newStatus, eventType, correlationId);
    }
}
