using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Edit;

public class EditIncidentHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public async Task<EditIncidentResult> HandleAsync(string incidentId, EditIncidentCommand command)
    {
        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return new EditIncidentResult { Succeeded = false, ErrorMessage = "User is not authenticated." };
        }

        string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return new EditIncidentResult { Succeeded = false, ErrorMessage = "User ID claim is missing." };
        }

        Incident? incident = await _dbContext.Incidents
            .Include(i => i.StatusHistories)
            .FirstOrDefaultAsync(i => i.IncidentId == incidentId);

        if (incident == null)
        {
            return new EditIncidentResult { Succeeded = false, ErrorMessage = $"Incident with ID {incidentId} not found." };
        }

        if (incident.Status != "Open")
        {
            return new EditIncidentResult { Succeeded = false, ErrorMessage = "Incident can only be edited while it is in Open status." };
        }

        string? creatorId = incident.StatusHistories
            .OrderBy(h => h.ChangedDate)
            .FirstOrDefault(h => h.PreviousStatus == null)?.ChangedByUserId;

        if (creatorId == null || creatorId != userId)
        {
            return new EditIncidentResult { Succeeded = false, ErrorMessage = "Only the user who created this incident can edit it." };
        }

        incident.Description = command.Description;
        incident.AreaId = command.AreaId;
        incident.IncidentTypeId = command.IncidentTypeId;
        incident.SeverityTypeId = command.SeverityTypeId;

        await _dbContext.SaveChangesAsync();

        return new EditIncidentResult
        {
            Succeeded = true,
            Response = new EditIncidentResponse
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
}
