using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Domain;
using OrderService.Messaging;
using OrderService.Models;

namespace OrderService.Controllers;

[ApiController]
[Route("[controller]")]
public class OrderController(ApplicationDbContext context, IEventPublisher eventPublisher) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    // Contexte utilisateur propagé par la Gateway dans les headers internes
    // (rapport §5.2) : les décisions métier restent dans le service (§4.8).
    private int? CurrentUserId =>
        int.TryParse(Request.Headers["X-User-Id"], out var id) ? id : null;

    private bool IsAdmin =>
        string.Equals(Request.Headers["X-User-Role"], "Admin", StringComparison.OrdinalIgnoreCase);

    [HttpGet]
    public async Task<ActionResult<List<OrderModel>>> GetOrderModels()
    {
        var query = _context.Orders.Include(o => o.Items).AsQueryable();

        // Contrôle des rôles : un client ne voit que ses propres commandes,
        // un administrateur voit toutes celles de sa boutique.
        if (!IsAdmin)
        {
            if (CurrentUserId is not { } userId)
                return Forbid();
            query = query.Where(o => o.UserId == userId);
        }

        return Ok(await query.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderModel>> GetOrderModelById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound();

        // Une commande d'un autre client est introuvable, pas interdite :
        // on n'expose pas l'existence de la ressource.
        if (!IsAdmin && order.UserId != CurrentUserId)
            return NotFound();

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderModel>> AddOrderModel([FromBody] OrderModel newOrderModel)
    {
        if (newOrderModel is null)
            return BadRequest();

        // L'identité vient du JWT validé par la Gateway, pas du corps de requête.
        if (CurrentUserId is { } userId)
            newOrderModel.UserId = userId;

        newOrderModel.Status = OrderStatusFlow.Pending;
        newOrderModel.TotalAmount = OrderPricing.ComputeTotal(newOrderModel.Items);

        _context.Orders.Add(newOrderModel);
        await _context.SaveChangesAsync();

        // Recharger avec les items pour la réponse
        var createdOrder = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == newOrderModel.Id);

        // Publication de l'événement OrderCreated : InventoryService et PaymentService
        // consomment cet événement de manière asynchrone (Annexe C du rapport).
        eventPublisher.Publish(EventBusTopology.OrderCreated, "OrderCreated", new
        {
            orderId = newOrderModel.Id,
            userId = newOrderModel.UserId,
            totalAmount = newOrderModel.TotalAmount,
            items = newOrderModel.Items.Select(i => new
            {
                productId = i.ProductId,
                quantity = i.Quantity,
                unitPrice = i.UnitPrice
            })
        }, newOrderModel.TenantId);

        return CreatedAtAction(nameof(GetOrderModelById), new { id = newOrderModel.Id }, createdOrder);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrderModel(int id, OrderModel updatedOrderModel)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound();

        order.Status = updatedOrderModel.Status;

        await _context.SaveChangesAsync();

        return Ok(order);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrderModel(int id)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound();

        // Un client ne peut annuler que ses propres commandes.
        if (!IsAdmin && order.UserId != CurrentUserId)
            return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
