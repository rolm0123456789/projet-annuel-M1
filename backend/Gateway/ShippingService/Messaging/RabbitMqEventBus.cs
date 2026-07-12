using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace ShippingService.Messaging;

// Topologie commune du bus d'événements Business First.
public static class EventBusTopology
{
    public const string Exchange = "business_first.events";

    public const string OrderCreated = "order.created";
    public const string StockReserved = "stock.reserved";
    public const string StockReservationFailed = "stock.reservation_failed";
    public const string PaymentConfirmed = "payment.confirmed";
    public const string ShipmentCreated = "shipment.created";
}

// Enveloppe des événements, conforme au contrat du rapport (§4.5) :
// eventId pour l'idempotence, tenantId pour l'isolation, occurredAt pour
// l'horodatage, payload limité au nécessaire. correlationId permet de suivre
// un flux complet dans les logs (§5.4, §5.9).
public sealed record EventEnvelope(
    Guid EventId,
    Guid CorrelationId,
    Guid TenantId,
    string EventType,
    DateTime OccurredAt,
    JsonElement Payload)
{
    public static EventEnvelope Parse(ReadOnlySpan<byte> body)
    {
        using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(body));
        var root = doc.RootElement;

        var eventType = root.GetProperty("eventType").GetString() ?? "";
        var eventId = root.GetProperty("eventId").GetGuid();
        var correlationId = root.GetProperty("correlationId").GetGuid();
        var occurredAt = root.GetProperty("occurredAt").GetDateTime();

        // Un événement sans tenant valide est rejeté : un consommateur ne doit
        // jamais traiter des données sans savoir à quelle boutique elles
        // appartiennent (scénario multi-tenant du rapport, §6.4).
        if (!root.TryGetProperty("tenantId", out var tenantElement)
            || !Guid.TryParse(tenantElement.GetString(), out var tenantId)
            || tenantId == Guid.Empty)
        {
            throw new InvalidOperationException(
                $"Evénement {eventType} ({eventId}) sans tenantId valide : message rejeté.");
        }

        return new EventEnvelope(eventId, correlationId, tenantId, eventType, occurredAt,
            root.GetProperty("payload").Clone());
    }
}

public sealed class RabbitMqOptions
{
    public string HostName { get; set; } = "";
    public int Port { get; set; } = 5672;
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";

    public bool Enabled => !string.IsNullOrWhiteSpace(HostName);
}

// Connexion unique partagée par le service (publisher + consumers).
public sealed class RabbitMqConnection(RabbitMqOptions options, ILogger<RabbitMqConnection> logger) : IDisposable
{
    private readonly object _lock = new();
    private IConnection? _connection;

    public IConnection GetConnection()
    {
        lock (_lock)
        {
            if (_connection is { IsOpen: true })
                return _connection;

            var factory = new ConnectionFactory
            {
                HostName = options.HostName,
                Port = options.Port,
                UserName = options.UserName,
                Password = options.Password,
                DispatchConsumersAsync = true,
                AutomaticRecoveryEnabled = true
            };

            _connection = factory.CreateConnection();
            logger.LogInformation("Connexion RabbitMQ établie vers {Host}:{Port}", options.HostName, options.Port);
            return _connection;
        }
    }

    public void Dispose() => _connection?.Dispose();
}

public interface IEventPublisher
{
    void Publish(string routingKey, string eventType, object payload, Guid tenantId, Guid? correlationId = null);
}

public sealed class RabbitMqEventPublisher(RabbitMqConnection connection, ILogger<RabbitMqEventPublisher> logger) : IEventPublisher
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public void Publish(string routingKey, string eventType, object payload, Guid tenantId, Guid? correlationId = null)
    {
        var envelope = new
        {
            eventId = Guid.NewGuid(),
            correlationId = correlationId ?? Guid.NewGuid(),
            occurredAt = DateTime.UtcNow,
            tenantId,
            eventType,
            payload
        };

        using var channel = connection.GetConnection().CreateModel();
        channel.ExchangeDeclare(EventBusTopology.Exchange, ExchangeType.Topic, durable: true);

        var props = channel.CreateBasicProperties();
        props.Persistent = true; // messages persistants (survie au redémarrage du broker)
        props.ContentType = "application/json";
        props.MessageId = envelope.eventId.ToString();
        props.CorrelationId = envelope.correlationId.ToString();

        channel.BasicPublish(
            EventBusTopology.Exchange,
            routingKey,
            props,
            JsonSerializer.SerializeToUtf8Bytes(envelope, JsonOptions));

        logger.LogInformation(
            "Evénement {EventType} publié (routingKey={RoutingKey}, eventId={EventId}, correlationId={CorrelationId}, tenantId={TenantId})",
            eventType, routingKey, envelope.eventId, envelope.correlationId, tenantId);
    }
}

// Utilisé quand RabbitMQ n'est pas configuré (dev local sans broker) : l'API reste fonctionnelle.
public sealed class NullEventPublisher(ILogger<NullEventPublisher> logger) : IEventPublisher
{
    public void Publish(string routingKey, string eventType, object payload, Guid tenantId, Guid? correlationId = null)
        => logger.LogWarning("RabbitMQ non configuré : événement {EventType} ({RoutingKey}) non publié", eventType, routingKey);
}

// Consumer de base : file durable, ack explicite, 1 retry puis dead-letter queue.
public abstract class RabbitMqConsumerService(RabbitMqConnection connection, ILogger logger) : BackgroundService
{
    private IModel? _channel;

    protected abstract string QueueName { get; }
    protected abstract IReadOnlyCollection<string> RoutingKeys { get; }

    protected abstract Task HandleAsync(EventEnvelope envelope, CancellationToken ct);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                StartConsuming(stoppingToken);
                logger.LogInformation("Consommation démarrée sur la file {Queue} ({RoutingKeys})",
                    QueueName, string.Join(", ", RoutingKeys));
                return;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "RabbitMQ indisponible, nouvelle tentative dans 5s (file {Queue})", QueueName);
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private void StartConsuming(CancellationToken stoppingToken)
    {
        var channel = connection.GetConnection().CreateModel();
        var deadLetterQueue = QueueName + ".dlq";

        channel.ExchangeDeclare(EventBusTopology.Exchange, ExchangeType.Topic, durable: true);
        channel.QueueDeclare(deadLetterQueue, durable: true, exclusive: false, autoDelete: false);
        channel.QueueDeclare(QueueName, durable: true, exclusive: false, autoDelete: false,
            arguments: new Dictionary<string, object>
            {
                // Les messages en échec durable partent dans la DLQ du service.
                ["x-dead-letter-exchange"] = "",
                ["x-dead-letter-routing-key"] = deadLetterQueue
            });

        foreach (var routingKey in RoutingKeys)
            channel.QueueBind(QueueName, EventBusTopology.Exchange, routingKey);

        channel.BasicQos(0, prefetchCount: 1, global: false);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.Received += async (_, ea) =>
        {
            Guid eventId = Guid.Empty, correlationId = Guid.Empty;
            try
            {
                var envelope = EventEnvelope.Parse(ea.Body.Span);
                eventId = envelope.EventId;
                correlationId = envelope.CorrelationId;

                await HandleAsync(envelope, stoppingToken);

                channel.BasicAck(ea.DeliveryTag, multiple: false);
                logger.LogInformation(
                    "Evénement {EventType} traité (eventId={EventId}, correlationId={CorrelationId}, tenantId={TenantId}, file={Queue})",
                    envelope.EventType, envelope.EventId, envelope.CorrelationId, envelope.TenantId, QueueName);
            }
            catch (Exception ex)
            {
                // 1er échec : redelivery ; 2e échec : dead-letter queue.
                var requeue = !ea.Redelivered;
                logger.LogError(ex,
                    "Echec de traitement (eventId={EventId}, correlationId={CorrelationId}, file={Queue}) - {Action}",
                    eventId, correlationId, QueueName, requeue ? "nouvelle tentative" : "envoi en DLQ");
                channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: requeue);
            }
        };

        channel.BasicConsume(QueueName, autoAck: false, consumer);
        _channel = channel;
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        base.Dispose();
    }
}
