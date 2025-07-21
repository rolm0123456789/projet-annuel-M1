using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace productService.Controllers;

[ApiController]
[Route("produits")]
public class ProductController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    // GET /produits
    [HttpGet]
    public async Task<ActionResult<List<ProductModel>>> GetProduits()
    {
        return Ok(await _context.Products.ToListAsync());
    }

    // GET /produits/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductModel>> GetProduitById(int id)
    {
        var produit = await _context.Products.FindAsync(id);
        if (produit is null)
            return NotFound();
        return Ok(produit);
    }

    // PUT /produits/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PatchProduit(int id, [FromBody] ProductModel productModel)
    {
        var productModelEntity = await _context.Products.FindAsync(id);
        if (productModelEntity is null)
            return NotFound();

        productModelEntity = productModel;

        await _context.SaveChangesAsync();

        return Ok(productModelEntity);
    }

    // GET /produits/{searchTerm}
    [HttpGet("{searchTerm}")]
    public async Task<ActionResult<List<ProductModel>>> SearchProduits(string searchTerm)
    {
        var produits = await _context.Products
            .Where(p => p.Name.Contains(searchTerm))
            .ToListAsync();
        return Ok(produits);
    }

    // DELETE /produits/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduit(int id)
    {
        var produit = await _context.Products.FindAsync(id);
        if (produit is null)
            return NotFound();

        _context.Products.Remove(produit);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET /produits/categories/{idCategory}
    [HttpGet("categories/{idCategory}")]
    public async Task<ActionResult<List<ProductModel>>> GetProduitsByCategory(string idCategory)
    {
        var produits = await _context.Products
            .Where(p => p.CategoryId == idCategory)
            .ToListAsync();
        return Ok(produits);
    }
}