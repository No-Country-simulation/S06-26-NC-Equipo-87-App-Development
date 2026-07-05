using api.Data;
using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Common;

public class SignalRIncidentEventPublisher(
    IHubContext<IncidentHub> hubContext,
    AppDbContext dbContext,
    ILogger<SignalRIncidentEventPublisher> logger,
    IServiceProvider serviceProvider) : IIncidentEventPublisher
{
    private readonly IHubContext<IncidentHub> _hubContext = hubContext;
    private readonly AppDbContext _dbContext = dbContext;
    private readonly ILogger<SignalRIncidentEventPublisher> _logger = logger;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    public async Task PublishIncidentCreatedAsync(IncidentCreatedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentCreated {@Event}", @event);

        List<string> recipientGroups = await GetTargetGroupsForAreaAsync(@event.AreaId);

        await _hubContext.Clients.Groups(recipientGroups)
            .SendAsync("IncidentCreated", new { incidentId = @event.IncidentId });

        string areaName = "Unknown Area";
        string typeName = "Unknown Type";
        string severityName = "Unknown Severity";

        Area? area = await _dbContext.Areas.FindAsync(@event.AreaId);
        if (area != null) { areaName = area.Name; }

        IncidentType? incidentType = await _dbContext.IncidentTypes.FindAsync(@event.IncidentTypeId);
        if (incidentType != null) { typeName = incidentType.Name; }

        SeverityType? severity = await _dbContext.SeverityTypes.FindAsync(@event.SeverityTypeId);
        if (severity != null) { severityName = severity.Name; }

        string title = "New Incident Reported";
        string body = $"{typeName} - {severityName} Severity in {areaName}";

        SendPushNotifications(recipientGroups, title, body, @event.IncidentId, "Created", null);
    }

    public async Task PublishIncidentAssignedAsync(IncidentAssignedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentAssigned {@Event}", @event);

        int areaId = 0;
        Incident? incident = await _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.SeverityType)
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

        if (incident != null)
        {
            string areaName = incident.Area?.Name ?? "Unknown Area";
            string typeName = incident.IncidentType?.Name ?? "Unknown Type";
            string severityName = incident.SeverityType?.Name ?? "Unknown Severity";
            string body = $"{typeName} - {severityName} Severity in {areaName}";

            SendPushNotifications(recipientGroups, $"Status Update: {@event.IncidentId}", body, @event.IncidentId, "Assigned", @event.TechnicianId);
        }
    }

    public async Task PublishIncidentAttentionStartedAsync(IncidentAttentionStartedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentAttentionStarted {@Event}", @event);

        int areaId = 0;
        string? assignedToUserId = null;
        Incident? incident = await _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.SeverityType)
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

        if (incident != null)
        {
            string areaName = incident.Area?.Name ?? "Unknown Area";
            string typeName = incident.IncidentType?.Name ?? "Unknown Type";
            string severityName = incident.SeverityType?.Name ?? "Unknown Severity";
            string body = $"{typeName} - {severityName} Severity in {areaName}";

            SendPushNotifications(recipientGroups, $"Status Update: {@event.IncidentId}", body, @event.IncidentId, "InProgress", assignedToUserId);
        }
    }

    public async Task PublishIncidentClosedAsync(IncidentClosedEvent @event)
    {
        _logger.LogInformation("Domain Event Published to SignalR: IncidentClosed {@Event}", @event);

        int areaId = 0;
        string? assignedToUserId = null;
        Incident? incident = await _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.SeverityType)
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

        if (incident != null)
        {
            string areaName = incident.Area?.Name ?? "Unknown Area";
            string typeName = incident.IncidentType?.Name ?? "Unknown Type";
            string severityName = incident.SeverityType?.Name ?? "Unknown Severity";
            string body = $"{typeName} - {severityName} Severity in {areaName}";

            SendPushNotifications(recipientGroups, $"Status Update: {@event.IncidentId}", body, @event.IncidentId, "Closed", assignedToUserId);
        }
    }

    private void SendPushNotifications(List<string> recipientGroups, string title, string body, string incidentId, string eventStatus, string? assignedToUserId)
    {
        List<string> userIds = recipientGroups
            .Where(g => g.StartsWith("supervisor_") || g.StartsWith("tech_") || g.StartsWith("operator_"))
            .Select(g => g.Split('_')[1])
            .Distinct()
            .ToList();

        if (userIds.Count == 0) { return; }

        _ = Task.Run(async () =>
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                IExpoPushService pushService = scope.ServiceProvider.GetRequiredService<IExpoPushService>();

                var userTokens = await dbContext.Users
                    .Where(u => userIds.Contains(u.Id) && !string.IsNullOrEmpty(u.ExpoPushToken))
                    .Select(u => new { u.Id, u.ExpoPushToken })
                    .ToListAsync();

                foreach (var userToken in userTokens)
                {
                    string userTitle = title;
                    if (eventStatus == "Assigned" && userToken.Id == assignedToUserId)
                    {
                        userTitle = "Ticket Assigned to You";
                    }
                    else if (eventStatus == "Assigned")
                    {
                        userTitle = $"Status Update: {incidentId}";
                    }
                    else if (eventStatus == "InProgress")
                    {
                        userTitle = $"Status Update: {incidentId}";
                    }
                    else if (eventStatus == "Closed")
                    {
                        userTitle = $"Status Update: {incidentId}";
                    }

                    try
                    {
                        await pushService.SendPushAsync(userToken.ExpoPushToken!, userTitle, body, new { incidentId });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending push notification to user {UserId}", userToken.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background push notification dispatch");
            }
        });
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

        recipientGroups.Add("managers");

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
