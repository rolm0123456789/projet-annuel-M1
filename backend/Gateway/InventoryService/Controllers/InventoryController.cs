using InventoryService.Data;
using InventoryService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Controllers;

[ApiController]
[Route("[controller]")]
public class InventoryController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    public sealed record SetStockRequest(int Quantity);

    [HttpGet]
    public async Task<ActionResult<List<InventoryModel>>> GetInventoryModels()
        => Ok(await _context.Inventorys.ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InventoryModel>> GetInventoryModelById(int id)
    {
        var inventory = await _context.Inventorys.FindAsync(id);
        return inventory is null ? NotFound() : Ok(inventory);
    }

    // Source unique de vérité du stock : crée ou met à jour la ligne du produit
    // dans le tenant courant. Une route dédiée évite les doublons ProductId qui
    // rendaient ensuite la réservation impossible.
    [HttpPut("product/{productId}")]
    public async Task<ActionResult<InventoryModel>> SetStock(string productId, SetStockRequest request)
    {
        if (string.IsNullOrWhiteSpace(productId) || request.Quantity < 0)
            return BadRequest("Le produit et une quantité positive ou nulle sont requis.");

        var stock = await _context.Inventorys.SingleOrDefaultAsync(i => i.ProductId == productId);
        if (stock is null)
        {
            stock = new InventoryModel { ProductId = productId };
            _context.Inventorys.Add(stock);
        }

        stock.Quantity = request.Quantity.ToString();
        stock.last_updated = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(stock);
    }

    [HttpDelete("product/{productId}")]
    public async Task<IActionResult> DeleteInventoryByProductId(string productId)
    {
        var stock = await _context.Inventorys.SingleOrDefaultAsync(i => i.ProductId == productId);
        if (stock is null)
            return NotFound();

        _context.Inventorys.Remove(stock);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
