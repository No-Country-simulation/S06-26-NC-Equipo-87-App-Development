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

public class LoginHandler(UserManager<User> userManager, IConfiguration configuration, IPasswordHasher<User> passwordHasher)
{
    private readonly UserManager<User> _userManager = userManager;
    private readonly IConfiguration _configuration = configuration;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;

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
            bool isPinValid = VerifyPin(user, command.Password);
            if (!isPinValid)
            {
                return new LoginResult { Succeeded = false, ErrorMessage = "Invalid credentials." };
            }
        }

        IList<string> roles = await _userManager.GetRolesAsync(user);
        string token = GenerateJwtToken(user, roles);

        return new LoginResult { Succeeded = true, Token = token };
    }

    private async Task<User?> FindUserAsync(string identifier)
    {
        return identifier.Contains('@')
            ? await _userManager.Users
                .Include(u => u.UserAreas)
                    .ThenInclude(ua => ua.Area)
                .Include(u => u.Shift)
                .FirstOrDefaultAsync(u => u.Email == identifier)
            : await _userManager.Users
                .Include(u => u.UserAreas)
                    .ThenInclude(ua => ua.Area)
                .Include(u => u.Shift)
                .FirstOrDefaultAsync(u => u.EmployeeId == identifier);
    }

    private bool VerifyPin(User user, string password)
    {
        if (string.IsNullOrEmpty(user.PinHash) || password.Length != 4 || !password.All(char.IsDigit))
        {
            return false;
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PinHash, password);
        return verificationResult == PasswordVerificationResult.Success;
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
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (string role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var userArea in user.UserAreas)
        {
            claims.Add(new Claim("areaId", userArea.AreaId.ToString()));
            if (userArea.Area != null)
            {
                claims.Add(new Claim("areaName", userArea.Area.Name));
            }
        }

        if (user.ShiftId.HasValue)
        {
            claims.Add(new Claim("shiftId", user.ShiftId.Value.ToString()));
        }

        if (user.Shift != null)
        {
            claims.Add(new Claim("shiftName", user.Shift.Name));
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
