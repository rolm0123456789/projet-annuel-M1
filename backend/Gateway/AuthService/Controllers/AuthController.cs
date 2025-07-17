using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace AuthService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AuthDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email déjà utilisé.");

            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User { Email = dto.Email, PasswordHash = hash };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Utilisateur créé");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDto dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Identifiants invalides.");

            var token = _tokenService.CreateToken(user);
            return Ok(new { token });
        }
    }
}
