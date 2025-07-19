using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShippingService.Data;
using ShippingService.Models;

namespace ShippingService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ShippingController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<ShippingModel>>> GetShippingModels()
        {
            return Ok(await _context.Shippings
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShippingModel>> GetShippingModelById(int id)
        {
            var ShippingModel = await _context.Shippings.FindAsync(id);
            if (ShippingModel is null)
                return NotFound();

            return Ok(ShippingModel);
        }

        [HttpPost]
        public async Task<ActionResult<ShippingModel>> AddShippingModel(ShippingModel newShippingModel)
        {
            if (newShippingModel is null)
                return BadRequest();

            _context.Shippings.Add(newShippingModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShippingModelById), new { id = newShippingModel.Id }, newShippingModel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShippingModel(int id, ShippingModel updatedShippingModel)
        {
            var ShippingModel = await _context.Shippings.FindAsync(id);
            if (ShippingModel is null)
                return NotFound();

            ShippingModel.OrderId = updatedShippingModel.OrderId;
            ShippingModel.trackingNumber = updatedShippingModel.trackingNumber;
            ShippingModel.Carrier = updatedShippingModel.Carrier;
            ShippingModel.Status = updatedShippingModel.Status;
            ShippingModel.ShppedAt = updatedShippingModel.ShppedAt;
            ShippingModel.DeliveredAt = updatedShippingModel.DeliveredAt;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShippingModel(int id)
        {
            var ShippingModel = await _context.Shippings.FindAsync(id);
            if (ShippingModel is null)
                return NotFound();

            _context.Shippings.Remove(ShippingModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
