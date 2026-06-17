using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using api.Features.Authentication.Common;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace api.Features.Authentication.Login;

public class LoginResult
{
    public bool Succeeded { get; set; }
    public string? Token { get; set; }
    public string? ErrorMessage { get; set; }
}

public class LoginHandler(UserManager<User> userManager, IConfiguration configuration)
{
    private readonly UserManager<User> _userManager = userManager;
    private readonly IConfiguration _configuration = configuration;

    public async Task<LoginResult> HandleAsync(LoginCommand command)
    {
        User? user = await FindUserAsync(command.Identifier);
        if (user == null)
        {
            return new LoginResult { Succeeded = false, ErrorMessage = "Invalid credentials." };
        }

        bool isPasswordValid = await _userManager.CheckPasswordAsync(user, command.Password);
        if (!isPasswordValid)
        {
            return new LoginResult { Succeeded = false, ErrorMessage = "Invalid credentials." };
        }

        IList<string> roles = await _userManager.GetRolesAsync(user);
        string token = GenerateJwtToken(user, roles);

        return new LoginResult { Succeeded = true, Token = token };
    }

    private async Task<User?> FindUserAsync(string identifier)
    {
        return identifier.Contains('@')
            ? await _userManager.FindByEmailAsync(identifier)
            : await _userManager.Users.FirstOrDefaultAsync(u => u.EmployeeId == identifier);
    }

    private string GenerateJwtToken(User user, IList<string> roles)
    {
        IConfigurationSection jwtSettings = _configuration.GetSection("Jwt");
        string secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.");
        string? issuer = jwtSettings["Issuer"];
        string? audience = jwtSettings["Audience"];
        int expiryDays = int.TryParse(jwtSettings["ExpiryDays"], out int days) ? days : 30;

        SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        List<Claim> claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new("employeeId", user.EmployeeId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (string role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(expiryDays),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
