using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Controllers;

[ApiController]
[Route("[controller]")]
public class CategoryController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    // GET /Category
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories.ToListAsync();
        var result = new List<CategoryDto>();

        foreach (var cat in categories)
        {
            var count = await _context.Products.CountAsync(p => p.CategoryId == cat.Slug);
            result.Add(new CategoryDto
            {
                Id = cat.Id,
                Name = cat.Name,
                Slug = cat.Slug,
                Description = cat.Description,
                Image = cat.Image,
                ProductCount = count
            });
        }

        return Ok(result);
    }

    // GET /Category/{slug}
    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryDto>> GetCategoryBySlug(string slug)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
        if (category is null)
            return NotFound();

        var count = await _context.Products.CountAsync(p => p.CategoryId == slug);

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            Image = category.Image,
            ProductCount = count
        });
    }
}
