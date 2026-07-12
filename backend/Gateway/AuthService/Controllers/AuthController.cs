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
        private readonly Guid _defaultTenantId;

        public AuthController(AuthDbContext context, TokenService tokenService, IConfiguration config)
        {
            _context = context;
            _tokenService = tokenService;
            _defaultTenantId = Guid.Parse(config["Tenancy:DefaultTenantId"] ?? TenantDefaults.DefaultTenantId);
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

            // Chaque utilisateur est rattaché à un tenant (boutique) : le MVP
            // n'expose que la boutique par défaut, le modèle en autorise plusieurs.
            _context.TenantUsers.Add(new TenantUser
            {
                TenantId = _defaultTenantId,
                UserId = user.Id,
                Role = user.Role
            });
            await _context.SaveChangesAsync();

            return Ok("Utilisateur créé avec succès.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDto dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Identifiants invalides.");

            // Le tenant courant est dérivé de l'appartenance de l'utilisateur,
            // jamais choisi arbitrairement par le client (rapport §5.1).
            var membership = await _context.TenantUsers.FirstOrDefaultAsync(tu => tu.UserId == user.Id);
            var tenantId = membership?.TenantId ?? _defaultTenantId;

            var token = _tokenService.CreateToken(user, tenantId);
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
