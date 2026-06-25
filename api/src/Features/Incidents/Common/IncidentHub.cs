using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.AspNetCore.SignalR;

namespace api.Features.Incidents.Common;

public class IncidentHub(ILogger<IncidentHub> logger) : Hub
{
    private readonly ILogger<IncidentHub> _logger = logger;

    public override async Task OnConnectedAsync()
    {
        ClaimsPrincipal? user = Context.User;
        string? userId = Context.UserIdentifier
                         ?? user?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (user != null && !string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("SignalR client connected. UserId: {UserId}, Authenticated: {IsAuthenticated}", userId, user.Identity?.IsAuthenticated);

            if (user.IsInRole("Operator"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"operator_{userId}");
                _logger.LogInformation("UserId {UserId} joined group: operator_{UserId}", userId, userId);
            }
            if (user.IsInRole("Supervisor"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"supervisor_{userId}");
                _logger.LogInformation("UserId {UserId} joined group: supervisor_{UserId}", userId, userId);
            }
            if (user.IsInRole("Technician"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"tech_{userId}");
                _logger.LogInformation("UserId {UserId} joined group: tech_{UserId}", userId, userId);
            }
            if (user.IsInRole("Plant Manager") || user.IsInRole("Manager"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"manager_{userId}");
                _logger.LogInformation("UserId {UserId} joined group: manager_{UserId}", userId, userId);
            }
        }
        else
        {
            _logger.LogWarning("Anonymous or unauthenticated SignalR client connected. ConnectionId: {ConnectionId}", Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }
}
