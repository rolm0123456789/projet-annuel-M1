using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Controllers;

[ApiController]
[Route("[controller]")]
public class OrderController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<List<OrderModel>>> GetOrderModels()
    {
        return Ok(await _context.Orders
            .Include(o => o.Items) // Inclure les items
            .ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderModel>> GetOrderModelById(int id)
    {
        var OrderModel = await _context.Orders
            .Include(o => o.Items) // Inclure les items
            .FirstOrDefaultAsync(o => o.Id == id);

        if (OrderModel is null)
            return NotFound();

        return Ok(OrderModel);
    }

    [HttpPost]
    public async Task<ActionResult<OrderModel>> AddOrderModel([FromBody] OrderModel newOrderModel)
    {
        if (newOrderModel is null)
            return BadRequest();

        _context.Orders.Add(newOrderModel);
        await _context.SaveChangesAsync();

        // Recharger avec les items pour la réponse
        var createdOrder = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == newOrderModel.Id);

        return CreatedAtAction(nameof(GetOrderModelById), new { id = newOrderModel.Id }, createdOrder);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrderModel(int id, OrderModel updatedOrderModel)
    {
        var OrderModel = await _context.Orders.FindAsync(id);
        if (OrderModel is null)
            return NotFound();

        OrderModel.Status = updatedOrderModel.Status;


        await _context.SaveChangesAsync();

        return Ok(OrderModel);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrderModel(int id)
    {
        var OrderModel = await _context.Orders.FindAsync(id);
        if (OrderModel is null)
            return NotFound();

        _context.Orders.Remove(OrderModel);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}