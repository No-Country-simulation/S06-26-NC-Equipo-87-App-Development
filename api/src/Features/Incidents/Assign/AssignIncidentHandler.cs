using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Assign;

public class AssignIncidentHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor, IIncidentEventPublisher eventPublisher)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IIncidentEventPublisher _eventPublisher = eventPublisher;

    public async Task<AssignIncidentResult> HandleAsync(string incidentId, AssignIncidentCommand command)
    {
        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return new AssignIncidentResult { Succeeded = false, ErrorMessage = "User is not authenticated." };
        }

        string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return new AssignIncidentResult { Succeeded = false, ErrorMessage = "User ID claim is missing." };
        }

        Incident? incident = await _dbContext.Incidents
            .Include(i => i.StatusHistories)
            .FirstOrDefaultAsync(i => i.IncidentId == incidentId);

        if (incident == null)
        {
            return new AssignIncidentResult { Succeeded = false, ErrorMessage = $"Incident with ID {incidentId} not found." };
        }

        if (incident.Status == "Closed")
        {
            return new AssignIncidentResult { Succeeded = false, ErrorMessage = "Cannot assign a technician to a closed incident." };
        }

        var technician = await (from u in _dbContext.Users
                                join ur in _dbContext.UserRoles on u.Id equals ur.UserId
                                join r in _dbContext.Roles on ur.RoleId equals r.Id
                                where u.Id == command.TechnicianId && r.Name == "Technician"
                                select u)
                               .FirstOrDefaultAsync();

        if (technician == null)
        {
            return new AssignIncidentResult { Succeeded = false, ErrorMessage = $"Technician with ID {command.TechnicianId} not found or is not a technician." };
        }

        string previousStatus = incident.Status;
        incident.AssignedToUserId = command.TechnicianId;
        incident.Status = "Assigned";

        IncidentStatusHistory history = new IncidentStatusHistory
        {
            IncidentId = incidentId,
            PreviousStatus = previousStatus,
            NewStatus = "Assigned",
            TransitionNotes = $"Técnico asignado: {technician.FirstName} {technician.LastName}",
            ChangedByUserId = userId,
            ChangedDate = DateTimeOffset.UtcNow
        };

        _dbContext.IncidentStatusHistories.Add(history);
        await _dbContext.SaveChangesAsync();

        await _eventPublisher.PublishIncidentAssignedAsync(new IncidentAssignedEvent(
            incidentId,
            command.TechnicianId,
            incident.Status
        ));

        return new AssignIncidentResult { Succeeded = true };
    }
}
