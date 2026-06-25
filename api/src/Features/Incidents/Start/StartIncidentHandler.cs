using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Start;

public class StartIncidentHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor, IIncidentEventPublisher eventPublisher)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IIncidentEventPublisher _eventPublisher = eventPublisher;

    public async Task<StartIncidentResult> HandleAsync(string incidentId)
    {
        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return new StartIncidentResult { Succeeded = false, ErrorMessage = "User is not authenticated." };
        }

        string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return new StartIncidentResult { Succeeded = false, ErrorMessage = "User ID claim is missing." };
        }

        Incident? incident = await _dbContext.Incidents
            .Include(i => i.StatusHistories)
            .FirstOrDefaultAsync(i => i.IncidentId == incidentId);

        if (incident == null)
        {
            return new StartIncidentResult { Succeeded = false, ErrorMessage = $"Incident with ID {incidentId} not found." };
        }

        if (incident.Status == "Closed")
        {
            return new StartIncidentResult { Succeeded = false, ErrorMessage = "Cannot start attention on a closed incident." };
        }

        if (incident.AssignedToUserId != userId)
        {
            return new StartIncidentResult { Succeeded = false, ErrorMessage = "Incident is not assigned to you." };
        }

        string previousStatus = incident.Status;
        incident.Status = "In-Progress";

        IncidentStatusHistory history = new IncidentStatusHistory
        {
            IncidentId = incidentId,
            PreviousStatus = previousStatus,
            NewStatus = "In-Progress",
            TransitionNotes = "Atención iniciada por el técnico",
            ChangedByUserId = userId,
            ChangedDate = DateTimeOffset.UtcNow
        };

        _dbContext.IncidentStatusHistories.Add(history);
        await _dbContext.SaveChangesAsync();

        await _eventPublisher.PublishIncidentAttentionStartedAsync(new IncidentAttentionStartedEvent(
            incidentId,
            incident.Status
        ));

        return new StartIncidentResult { Succeeded = true };
    }
}
