using System.Text;
using OrderService.Messaging;
using Xunit;

namespace OrderService.Tests;

// Rapport §6.4 : un événement dont le tenantId est absent ou incohérent doit
// être rejeté par le consommateur (le rejet l'envoie vers la dead-letter queue).
// Rapport §4.5 : contrat d'événement (eventId, eventType, occurredAt, tenantId, payload).
public class EventEnvelopeTests
{
    private static byte[] Envelope(string? tenantIdJson) => Encoding.UTF8.GetBytes($$"""
        {
          "eventId": "0d5f9a3e-63a1-4a53-bb1e-0e51e662a7cd",
          "correlationId": "3f2c1baf-9d2e-4a24-b7cf-2a2cf5b0f7aa",
          "occurredAt": "2026-06-19T12:00:00Z",
          {{(tenantIdJson is null ? "" : $"\"tenantId\": {tenantIdJson},")}}
          "eventType": "OrderCreated",
          "payload": { "orderId": 1 }
        }
        """);

    [Fact]
    public void Parse_un_evenement_conforme_au_contrat()
    {
        var envelope = EventEnvelope.Parse(Envelope("\"11111111-1111-1111-1111-111111111111\""));

        Assert.Equal("OrderCreated", envelope.EventType);
        Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), envelope.TenantId);
        Assert.Equal(Guid.Parse("0d5f9a3e-63a1-4a53-bb1e-0e51e662a7cd"), envelope.EventId);
        Assert.Equal(1, envelope.Payload.GetProperty("orderId").GetInt32());
    }

    [Fact]
    public void Rejette_un_evenement_sans_tenantId()
    {
        Assert.Throws<InvalidOperationException>(() => EventEnvelope.Parse(Envelope(null)));
    }

    [Fact]
    public void Rejette_un_tenantId_vide()
    {
        Assert.Throws<InvalidOperationException>(
            () => EventEnvelope.Parse(Envelope("\"00000000-0000-0000-0000-000000000000\"")));
    }

    [Fact]
    public void Rejette_un_tenantId_illisible()
    {
        Assert.Throws<InvalidOperationException>(
            () => EventEnvelope.Parse(Envelope("\"pas-un-uuid\"")));
    }
}
