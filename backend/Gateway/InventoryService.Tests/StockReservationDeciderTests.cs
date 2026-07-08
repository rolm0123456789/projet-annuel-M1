using InventoryService.Domain;
using Xunit;

namespace InventoryService.Tests;

public class StockReservationDeciderTests
{
    private static readonly Dictionary<string, int> Stocks = new()
    {
        ["1"] = 10,
        ["2"] = 3
    };

    [Fact]
    public void Reservation_acceptee_quand_le_stock_suffit()
    {
        var result = StockReservationDecider.Decide(Stocks,
            [new ReservationLine("1", 5), new ReservationLine("2", 3)]);

        Assert.True(result.Success);
        Assert.Null(result.FailureReason);
    }

    [Fact]
    public void Reservation_refusee_quand_le_stock_est_insuffisant()
    {
        var result = StockReservationDecider.Decide(Stocks, [new ReservationLine("2", 4)]);

        Assert.False(result.Success);
        Assert.Contains("Stock insuffisant", result.FailureReason);
    }

    [Fact]
    public void Reservation_refusee_pour_un_produit_inconnu()
    {
        var result = StockReservationDecider.Decide(Stocks, [new ReservationLine("99", 1)]);

        Assert.False(result.Success);
        Assert.Contains("absent de l'inventaire", result.FailureReason);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-2)]
    public void Reservation_refusee_pour_une_quantite_invalide(int requested)
    {
        var result = StockReservationDecider.Decide(Stocks, [new ReservationLine("1", requested)]);

        Assert.False(result.Success);
    }

    [Fact]
    public void La_reservation_est_tout_ou_rien()
    {
        // La première ligne est disponible mais la seconde non : tout est refusé.
        var result = StockReservationDecider.Decide(Stocks,
            [new ReservationLine("1", 1), new ReservationLine("2", 50)]);

        Assert.False(result.Success);
    }
}
