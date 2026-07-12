using InventoryService.Data;
using InventoryService.Domain;
using InventoryService.Models;
using InventoryService.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Messaging;

// Consomme OrderCreated : réserve le stock (tout-ou-rien) puis publie
// StockReserved ou StockReservationFailed.
public sealed class OrderCreatedConsumer(
    RabbitMqConnection connection,
    IServiceScopeFactory scopeFactory,
    IEventPublisher eventPublisher,
    ILogger<OrderCreatedConsumer> logger)
    : RabbitMqConsumerService(connection, logger)
{
    private readonly ILogger<OrderCreatedConsumer> _logger = logger;

    protected override string QueueName => "inventory.order-created";

    protected override IReadOnlyCollection<string> RoutingKeys => [EventBusTopology.OrderCreated];

    protected override async Task HandleAsync(EventEnvelope envelope, CancellationToken ct)
    {
        var orderId = envelope.Payload.GetProperty("orderId").GetInt32();

        using var scope = scopeFactory.CreateScope();

        // Le traitement s'exécute dans le tenant de l'événement : le stock d'une
        // autre boutique est invisible, donc impossible à réserver (§6.4).
        scope.ServiceProvider.GetRequiredService<TenantContext>().TenantId = envelope.TenantId;
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Idempotence : un événement déjà traité est ignoré.
        if (await db.ProcessedEvents.AnyAsync(e => e.EventId == envelope.EventId, ct))
        {
            _logger.LogInformation("Evénement {EventId} déjà traité, ignoré (commande {OrderId})", envelope.EventId, orderId);
            return;
        }

        var lines = envelope.Payload.GetProperty("items").EnumerateArray()
            .Select(i => new ReservationLine(
                i.GetProperty("productId").GetInt32().ToString(),
                i.GetProperty("quantity").GetInt32()))
            .ToList();

        var productIds = lines.Select(l => l.ProductId).ToList();
        var stocks = await db.Inventorys
            .Where(s => productIds.Contains(s.ProductId))
            .ToListAsync(ct);

        var availableByProduct = stocks.ToDictionary(
            s => s.ProductId,
            s => int.TryParse(s.Quantity, out var q) ? q : 0);

        var result = StockReservationDecider.Decide(availableByProduct, lines);

        if (result.Success)
        {
            foreach (var line in lines)
            {
                var stock = stocks.First(s => s.ProductId == line.ProductId);
                stock.Quantity = (availableByProduct[line.ProductId] - line.Requested).ToString();
                stock.last_updated = DateTime.UtcNow;
            }
        }

        db.ProcessedEvents.Add(new ProcessedEvent { EventId = envelope.EventId });
        await db.SaveChangesAsync(ct);

        if (result.Success)
        {
            eventPublisher.Publish(EventBusTopology.StockReserved, "StockReserved",
                new { orderId }, envelope.TenantId, envelope.CorrelationId);
        }
        else
        {
            _logger.LogWarning("Réservation refusée pour la commande {OrderId} : {Reason}", orderId, result.FailureReason);
            eventPublisher.Publish(EventBusTopology.StockReservationFailed, "StockReservationFailed",
                new { orderId, reason = result.FailureReason }, envelope.TenantId, envelope.CorrelationId);
        }
    }
}
