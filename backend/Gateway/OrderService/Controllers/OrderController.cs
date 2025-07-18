using OrderService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<OrderModel>>> GetOrderModels()
        {
            return Ok(await _context.Orders
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderModel>> GetOrderModelById(int id)
        {
            var OrderModel = await _context.Orders.FindAsync(id);
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

            return CreatedAtAction(nameof(GetOrderModelById), new { id = newOrderModel.Id }, newOrderModel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderModel(int id, OrderModel updatedOrderModel)
        {
            var OrderModel = await _context.Orders.FindAsync(id);
            if (OrderModel is null)
                return NotFound();

            OrderModel.TotalAmount = updatedOrderModel.TotalAmount;

            await _context.SaveChangesAsync();

            return NoContent();
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
}
