using InventoryService.Data;
using InventoryService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InventoryController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<InventoryModel>>> GetInventoryModels()
        {
            return Ok(await _context.Inventorys
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryModel>> GetInventoryModelById(int id)
        {
            var InventoryModel = await _context.Inventorys.FindAsync(id);
            if (InventoryModel is null)
                return NotFound();

            return Ok(InventoryModel);
        }

        [HttpPost]
        public async Task<ActionResult<InventoryModel>> AddInventoryModel(InventoryModel newInventoryModel)
        {
            if (newInventoryModel is null)
                return BadRequest();

            _context.Inventorys.Add(newInventoryModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInventoryModelById), new { id = newInventoryModel.Id }, newInventoryModel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryModel(int id, InventoryModel updatedInventoryModel)
        {
            var InventoryModel = await _context.Inventorys.FindAsync(id);
            if (InventoryModel is null)
                return NotFound();

            InventoryModel.last_updated = updatedInventoryModel.last_updated;
            InventoryModel.ProductId = updatedInventoryModel.ProductId;
            InventoryModel.Quantity = updatedInventoryModel.Quantity;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryModel(int id)
        {
            var InventoryModel = await _context.Inventorys.FindAsync(id);
            if (InventoryModel is null)
                return NotFound();

            _context.Inventorys.Remove(InventoryModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
