using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Domain;
using OrderService.Tenancy;

namespace OrderService.Messaging;

// Met à jour le statut des commandes à partir des événements publiés
// par InventoryService, PaymentService et ShippingService (Annexe C).
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

    protected override async Task HandleAsync(EventEnvelope envelope, CancellationToken ct)
    {
        var orderId = envelope.Payload.GetProperty("orderId").GetInt32();

        using var scope = scopeFactory.CreateScope();

        // Le traitement s'exécute dans le tenant de l'événement : filtre applicatif
        // et RLS PostgreSQL empêchent tout accès transverse. Un événement dont le
        // tenant ne correspond pas à la commande est donc isolé (rapport §6.4).
        scope.ServiceProvider.GetRequiredService<TenantContext>().TenantId = envelope.TenantId;
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null)
        {
            _logger.LogWarning("Commande {OrderId} introuvable pour l'événement {EventType} dans le tenant {TenantId} (correlationId={CorrelationId})",
                orderId, envelope.EventType, envelope.TenantId, envelope.CorrelationId);
            return;
        }

        var newStatus = OrderStatusFlow.Apply(order.Status, envelope.EventType);
        if (newStatus is null)
            return;

        order.Status = newStatus;
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("Commande {OrderId} : statut mis à jour vers '{Status}' suite à {EventType} (correlationId={CorrelationId}, tenantId={TenantId})",
            orderId, newStatus, envelope.EventType, envelope.CorrelationId, envelope.TenantId);
    }
}
