using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace PaymentService.Messaging;

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
    void Publish(string routingKey, string eventType, object data, Guid? correlationId = null);
}

public sealed class RabbitMqEventPublisher(RabbitMqConnection connection, ILogger<RabbitMqEventPublisher> logger) : IEventPublisher
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public void Publish(string routingKey, string eventType, object data, Guid? correlationId = null)
    {
        var envelope = new
        {
            eventId = Guid.NewGuid(),
            correlationId = correlationId ?? Guid.NewGuid(),
            occurredAt = DateTime.UtcNow,
            type = eventType,
            data
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
            "Evénement {EventType} publié (routingKey={RoutingKey}, eventId={EventId}, correlationId={CorrelationId})",
            eventType, routingKey, envelope.eventId, envelope.correlationId);
    }
}

// Utilisé quand RabbitMQ n'est pas configuré (dev local sans broker) : l'API reste fonctionnelle.
public sealed class NullEventPublisher(ILogger<NullEventPublisher> logger) : IEventPublisher
{
    public void Publish(string routingKey, string eventType, object data, Guid? correlationId = null)
        => logger.LogWarning("RabbitMQ non configuré : événement {EventType} ({RoutingKey}) non publié", eventType, routingKey);
}

// Consumer de base : file durable, ack explicite, 1 retry puis dead-letter queue.
public abstract class RabbitMqConsumerService(RabbitMqConnection connection, ILogger logger) : BackgroundService
{
    private IModel? _channel;

    protected abstract string QueueName { get; }
    protected abstract IReadOnlyCollection<string> RoutingKeys { get; }

    protected abstract Task HandleAsync(string eventType, Guid eventId, Guid correlationId, JsonElement data, CancellationToken ct);

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
                using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(ea.Body.Span));
                var root = doc.RootElement;
                var eventType = root.GetProperty("type").GetString() ?? "";
                eventId = root.GetProperty("eventId").GetGuid();
                correlationId = root.GetProperty("correlationId").GetGuid();

                await HandleAsync(eventType, eventId, correlationId, root.GetProperty("data"), stoppingToken);

                channel.BasicAck(ea.DeliveryTag, multiple: false);
                logger.LogInformation(
                    "Evénement {EventType} traité (eventId={EventId}, correlationId={CorrelationId}, file={Queue})",
                    eventType, eventId, correlationId, QueueName);
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
