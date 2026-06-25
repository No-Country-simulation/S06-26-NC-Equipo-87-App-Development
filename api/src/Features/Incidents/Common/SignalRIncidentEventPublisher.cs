using api.Data;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Common;

public class SignalRIncidentEventPublisher(
    IHubContext<IncidentHub> hubContext,
    AppDbContext dbContext,
    ILogger<SignalRIncidentEventPublisher> logger) : IIncidentEventPublisher
{
    private readonly IHubContext<IncidentHub> _hubContext = hubContext;
    private readonly AppDbContext _dbContext = dbContext;
    private readonly ILogger<SignalRIncidentEventPublisher> _logger = logger;

    public async Task PublishIncidentCreatedAsync(IncidentCreatedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentCreated {@Event}", @event);

        List<string> recipientGroups = await GetTargetGroupsForAreaAsync(@event.AreaId);

        await _hubContext.Clients.Groups(recipientGroups)
            .SendAsync("IncidentCreated", new { incidentId = @event.IncidentId });
    }

    public async Task PublishIncidentAssignedAsync(IncidentAssignedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentAssigned {@Event}", @event);

        int areaId = 0;
        Incident? incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.IncidentId == @event.IncidentId);

        if (incident != null)
        {
            areaId = incident.AreaId;
        }

        List<string> recipientGroups = await GetTargetGroupsForAreaAsync(areaId);

        if (!string.IsNullOrEmpty(@event.TechnicianId))
        {
            recipientGroups.Add($"tech_{@event.TechnicianId}");
        }

        string? reporterId = await GetReporterIdAsync(@event.IncidentId);
        if (!string.IsNullOrEmpty(reporterId))
        {
            recipientGroups.Add($"operator_{reporterId}");
        }

        await _hubContext.Clients.Groups(recipientGroups.Distinct())
            .SendAsync("IncidentStatusChanged", new { incidentId = @event.IncidentId, status = @event.Status });
    }

    public async Task PublishIncidentAttentionStartedAsync(IncidentAttentionStartedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentAttentionStarted {@Event}", @event);

        int areaId = 0;
        string? assignedToUserId = null;
        Incident? incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.IncidentId == @event.IncidentId);

        if (incident != null)
        {
            areaId = incident.AreaId;
            assignedToUserId = incident.AssignedToUserId;
        }

        List<string> recipientGroups = await GetTargetGroupsForAreaAsync(areaId);

        if (!string.IsNullOrEmpty(assignedToUserId))
        {
            recipientGroups.Add($"tech_{assignedToUserId}");
        }

        string? reporterId = await GetReporterIdAsync(@event.IncidentId);
        if (!string.IsNullOrEmpty(reporterId))
        {
            recipientGroups.Add($"operator_{reporterId}");
        }

        await _hubContext.Clients.Groups(recipientGroups.Distinct())
            .SendAsync("IncidentStatusChanged", new { incidentId = @event.IncidentId, status = @event.Status });
    }

    public async Task PublishIncidentClosedAsync(IncidentClosedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentClosed {@Event}", @event);

        int areaId = 0;
        string? assignedToUserId = null;
        Incident? incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.IncidentId == @event.IncidentId);

        if (incident != null)
        {
            areaId = incident.AreaId;
            assignedToUserId = incident.AssignedToUserId;
        }

        List<string> recipientGroups = await GetTargetGroupsForAreaAsync(areaId);

        if (!string.IsNullOrEmpty(assignedToUserId))
        {
            recipientGroups.Add($"tech_{assignedToUserId}");
        }

        string? reporterId = await GetReporterIdAsync(@event.IncidentId);
        if (!string.IsNullOrEmpty(reporterId))
        {
            recipientGroups.Add($"operator_{reporterId}");
        }

        await _hubContext.Clients.Groups(recipientGroups.Distinct())
            .SendAsync("IncidentStatusChanged", new { incidentId = @event.IncidentId, status = @event.Status });
    }

    private async Task<List<string>> GetTargetGroupsForAreaAsync(int areaId)
    {
        List<string> recipientGroups = [];

        IdentityRole? supervisorRole = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == "Supervisor");
        if (supervisorRole != null && areaId > 0)
        {
            List<string> supervisorIds = await _dbContext.UserAreas
                .Where(ua => ua.AreaId == areaId)
                .Select(ua => ua.UserId)
                .Where(userId => _dbContext.UserRoles.Any(ur => ur.UserId == userId && ur.RoleId == supervisorRole.Id))
                .ToListAsync();

            foreach (string supervisorId in supervisorIds)
            {
                recipientGroups.Add($"supervisor_{supervisorId}");
            }
        }

        IdentityRole? managerRole = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == "Plant Manager");
        if (managerRole != null)
        {
            List<string> managerIds = await _dbContext.UserRoles
                .Where(ur => ur.RoleId == managerRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            foreach (string managerId in managerIds)
            {
                recipientGroups.Add($"manager_{managerId}");
            }
        }

        return recipientGroups;
    }

    private async Task<string?> GetReporterIdAsync(string incidentId)
    {
        return await _dbContext.IncidentStatusHistories
            .Where(h => h.IncidentId == incidentId && h.PreviousStatus == null)
            .Select(h => h.ChangedByUserId)
            .FirstOrDefaultAsync();
    }
}
