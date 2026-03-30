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

            var user = new User { Email = dto.Email, PasswordHash = hash, Role = dto.Role };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Utilisateur créé avec succès.");
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null)
                return Ok(new { message = "Si un compte existe avec cet email, un code de réinitialisation a été généré." });

            // Générer un code à 6 chiffres
            var resetToken = Random.Shared.Next(100000, 999999).ToString();
            user.ResetToken = resetToken;
            user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Log le code en console (en prod, envoyer par email)
            Console.WriteLine($"[RESET PASSWORD] Code pour {user.Email}: {resetToken}");

            return Ok(new { message = "Si un compte existe avec cet email, un code de réinitialisation a été généré." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u =>
                u.ResetToken == dto.Token &&
                u.ResetTokenExpiry > DateTime.UtcNow);

            if (user is null)
                return BadRequest("Code invalide ou expiré.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mot de passe réinitialisé avec succès." });
        }
    }
}
