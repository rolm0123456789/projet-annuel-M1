namespace AuthService.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }
}

