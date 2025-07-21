using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace productService.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    // GET /Product
    [HttpGet]
    public async Task<ActionResult<List<ProductModel>>> GetProducts()
    {
        return Ok(await _context.Products.ToListAsync());
    }

    // GET /Product/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductModel>> GetProductById(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
            return NotFound();
        return Ok(product);
    }

    // POST /Product
    [HttpPost]
    public async Task<ActionResult<ProductModel>> CreateProduct([FromBody] ProductModel productModel)
    {
        if (productModel is null)
            return BadRequest();

        // L'ID sera généré automatiquement par la base de données
        productModel.CreatedAt = DateTime.UtcNow;
        productModel.UpdatedAt = DateTime.UtcNow;

        _context.Products.Add(productModel);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProductById), new { id = productModel.Id }, productModel);
    }

    // PUT /Product/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductModel updatedProduct)
    {
        var existingProduct = await _context.Products.FindAsync(id);
        if (existingProduct is null)
            return NotFound();

        // Mettre à jour les propriétés une par une
        existingProduct.Name = updatedProduct.Name;
        existingProduct.Description = updatedProduct.Description;
        existingProduct.Price = updatedProduct.Price;
        existingProduct.Image = updatedProduct.Image;
        existingProduct.Images = updatedProduct.Images;
        existingProduct.Category = updatedProduct.Category;
        existingProduct.CategoryId = updatedProduct.CategoryId;
        existingProduct.Brand = updatedProduct.Brand;
        existingProduct.StockQuantity = updatedProduct.StockQuantity;
        existingProduct.Tags = updatedProduct.Tags;
        existingProduct.IsOnSale = updatedProduct.IsOnSale;
        existingProduct.Discount = updatedProduct.Discount;
        existingProduct.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(existingProduct);
    }

    // DELETE /Product/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET /Product/search/{searchTerm}
    [HttpGet("search/{searchTerm}")]
    public async Task<ActionResult<List<ProductModel>>> SearchProducts(string searchTerm)
    {
        var products = await _context.Products
            .Where(p => p.Name.Contains(searchTerm) || 
                       p.Description.Contains(searchTerm) ||
                       p.Category.Contains(searchTerm) ||
                       p.Brand.Contains(searchTerm))
            .ToListAsync();
        return Ok(products);
    }

    // GET /Product/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<List<ProductModel>>> GetProductsByCategory(string categoryId)
    {
        var products = await _context.Products
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();
        return Ok(products);
    }

    // GET /Product/featured
    [HttpGet("featured")]
    public async Task<ActionResult<List<ProductModel>>> GetFeaturedProducts()
    {
        var products = await _context.Products
            .Where(p => p.IsOnSale)
            .OrderByDescending(p => p.Discount)
            .Take(10)
            .ToListAsync();
        return Ok(products);
    }

    // GET /Product/low-stock
    [HttpGet("low-stock")]
    public async Task<ActionResult<List<ProductModel>>> GetLowStockProducts([FromQuery] int threshold = 10)
    {
        var products = await _context.Products
            .Where(p => p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .ToListAsync();
        return Ok(products);
    }
}