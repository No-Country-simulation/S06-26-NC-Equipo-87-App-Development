using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Create;

public class CreateIncidentHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private static readonly SemaphoreSlim _semaphore = new(1, 1);

    public async Task<CreateIncidentResult> HandleAsync(CreateIncidentCommand command)
    {
        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return new CreateIncidentResult { Succeeded = false, ErrorMessage = "User is not authenticated." };
        }

        string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return new CreateIncidentResult { Succeeded = false, ErrorMessage = "User ID claim is missing." };
        }

        await _semaphore.WaitAsync();
        try
        {
            string? latestIncidentId = await _dbContext.Incidents
                .OrderByDescending(i => i.IncidentId)
                .Select(i => i.IncidentId)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (latestIncidentId != null && latestIncidentId.StartsWith("INC-") && int.TryParse(latestIncidentId.Substring(4), out int parsedNum))
            {
                nextNumber = parsedNum + 1;
            }
            string newIncidentId = $"INC-{nextNumber:D4}";

            Incident incident = new Incident
            {
                IncidentId = newIncidentId,
                Description = command.Description,
                AreaId = command.AreaId,
                IncidentTypeId = command.IncidentTypeId,
                SeverityTypeId = command.SeverityTypeId,
                Status = "Open"
            };

            IncidentStatusHistory history = new IncidentStatusHistory
            {
                IncidentId = newIncidentId,
                PreviousStatus = null,
                NewStatus = "Open",
                TransitionNotes = "Initial report",
                ChangedByUserId = userId,
                ChangedDate = command.DeviceTimestamp ?? DateTimeOffset.UtcNow
            };

            _dbContext.Incidents.Add(incident);
            _dbContext.IncidentStatusHistories.Add(history);
            await _dbContext.SaveChangesAsync();

            return new CreateIncidentResult
            {
                Succeeded = true,
                Response = new CreateIncidentResponse
                {
                    IncidentId = incident.IncidentId,
                    Description = incident.Description,
                    AreaId = incident.AreaId,
                    IncidentTypeId = incident.IncidentTypeId,
                    SeverityTypeId = incident.SeverityTypeId,
                    Status = incident.Status
                }
            };
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
