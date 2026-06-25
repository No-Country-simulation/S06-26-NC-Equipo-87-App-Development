using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Close;

public class CloseIncidentHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor, IIncidentEventPublisher eventPublisher)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IIncidentEventPublisher _eventPublisher = eventPublisher;

    public async Task<CloseIncidentResult> HandleAsync(string incidentId, CloseIncidentCommand command)
    {
        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = "User is not authenticated." };
        }

        string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = "User ID claim is missing." };
        }

        Incident? incident = await _dbContext.Incidents
            .Include(i => i.StatusHistories)
            .FirstOrDefaultAsync(i => i.IncidentId == incidentId);

        if (incident == null)
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = $"Incident with ID {incidentId} not found." };
        }

        if (incident.Status == "Closed")
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = "Incident is already closed." };
        }

        if (incident.AssignedToUserId != userId)
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = "Incident is not assigned to you." };
        }

        if (string.IsNullOrWhiteSpace(command.SolutionApplied))
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = "Solution applied description is required." };
        }

        RootCauseType? rootCause = await _dbContext.RootCauseTypes
            .FirstOrDefaultAsync(r => r.Id == command.RootCauseTypeId && r.Status == "Active");

        if (rootCause == null)
        {
            return new CloseIncidentResult { Succeeded = false, ErrorMessage = $"Root cause type with ID {command.RootCauseTypeId} does not exist or is inactive." };
        }

        string previousStatus = incident.Status;
        incident.Status = "Closed";
        incident.SolutionApplied = command.SolutionApplied;
        incident.RootCauseTypeId = command.RootCauseTypeId;

        IncidentStatusHistory history = new IncidentStatusHistory
        {
            IncidentId = incidentId,
            PreviousStatus = previousStatus,
            NewStatus = "Closed",
            TransitionNotes = $"Solución: {command.SolutionApplied}. Causa Raíz: {rootCause.Name}",
            ChangedByUserId = userId,
            ChangedDate = DateTimeOffset.UtcNow
        };

        _dbContext.IncidentStatusHistories.Add(history);
        await _dbContext.SaveChangesAsync();

        await _eventPublisher.PublishIncidentClosedAsync(new IncidentClosedEvent(
            incidentId,
            command.SolutionApplied,
            command.RootCauseTypeId,
            incident.Status
        ));

        return new CloseIncidentResult { Succeeded = true };
    }
}
