using PaymentService.Data;
using PaymentService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PaymentController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<PaymentModel>>> GetPaymentModels()
        {
            return Ok(await _context.Payments
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentModel>> GetPaymentModelById(int id)
        {
            var PaymentModel = await _context.Payments.FindAsync(id);
            if (PaymentModel is null)
                return NotFound();

            return Ok(PaymentModel);
        }

        [HttpPost]
        public async Task<ActionResult<PaymentModel>> AddPaymentModel(PaymentModel newPaymentModel)
        {
            if (newPaymentModel is null)
                return BadRequest();

            _context.Payments.Add(newPaymentModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPaymentModelById), new { id = newPaymentModel.Id }, newPaymentModel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePaymentModel(int id, PaymentModel updatedPaymentModel)
        {
            var PaymentModel = await _context.Payments.FindAsync(id);
            if (PaymentModel is null)
                return NotFound();

            PaymentModel.Amount = updatedPaymentModel.Amount;
            PaymentModel.Status = updatedPaymentModel.Status;
            PaymentModel.PaymentMethod = updatedPaymentModel.PaymentMethod;
            PaymentModel.PaidAt = updatedPaymentModel.PaidAt;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentModel(int id)
        {
            var PaymentModel = await _context.Payments.FindAsync(id);
            if (PaymentModel is null)
                return NotFound();

            _context.Payments.Remove(PaymentModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
