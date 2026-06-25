using System.IdentityModel.Tokens.Jwt;

using api.Data;
using api.Features.Authentication.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Authentication.Logout;

[ApiController]
[Route("api/authentication")]
[Tags("Authentication")]
public class LogoutEndpoint(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        string authorizationHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized();
        }

        string token = authorizationHeader.Substring("Bearer ".Length).Trim();
        JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();

        DateTime expiryTime;
        try
        {
            JwtSecurityToken jwtToken = handler.ReadJwtToken(token);
            expiryTime = jwtToken.ValidTo;
        }
        catch
        {
            expiryTime = DateTime.UtcNow.AddDays(30);
        }

        RevokedToken revokedToken = new RevokedToken
        {
            Token = token,
            ExpiryTime = expiryTime
        };

        _dbContext.RevokedTokens.Add(revokedToken);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }
}
