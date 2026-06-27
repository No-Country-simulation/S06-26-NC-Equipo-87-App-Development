using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Detail;

public class GetIncidentDetailHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IncidentDetailResponse?> HandleAsync(string incidentId)
    {
        Incident? incident = await _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.SeverityType)
            .Include(i => i.StatusHistories)
                .ThenInclude(h => h.ChangedByUser)
            .FirstOrDefaultAsync(i => i.IncidentId == incidentId);

        if (incident == null)
        {
            return null;
        }

        List<IncidentStatusHistory> chronologicalHistory = incident.StatusHistories
            .OrderBy(h => h.ChangedDate)
            .ToList();

        IncidentStatusHistory? earliestHistory = chronologicalHistory.FirstOrDefault();
        string reportedByUserId = earliestHistory?.ChangedByUserId ?? string.Empty;
        string reportedByEmployeeId = earliestHistory?.ChangedByUser?.EmployeeId ?? string.Empty;
        DateTimeOffset reportedDate = earliestHistory?.ChangedDate ?? DateTimeOffset.MinValue;

        List<IncidentStatusHistoryDto> historyDtos = chronologicalHistory.Select(h => new IncidentStatusHistoryDto
        {
            HistoryId = h.HistoryId,
            PreviousStatus = h.PreviousStatus,
            NewStatus = h.NewStatus,
            TransitionNotes = h.TransitionNotes,
            ChangedByUserId = h.ChangedByUserId,
            ChangedByUserFullName = $"{h.ChangedByUser.FirstName} {h.ChangedByUser.LastName}".Trim(),
            ChangedDate = h.ChangedDate
        }).ToList();

        return new IncidentDetailResponse
        {
            IncidentId = incident.IncidentId,
            Description = incident.Description,
            AreaId = incident.AreaId,
            AreaName = incident.Area.Name,
            IncidentTypeId = incident.IncidentTypeId,
            IncidentTypeName = incident.IncidentType.Name,
            SeverityTypeId = incident.SeverityTypeId,
            SeverityTypeName = incident.SeverityType.Name,
            Status = incident.Status,
            ReportedByUserId = reportedByUserId,
            ReportedByEmployeeId = reportedByEmployeeId,
            ReportedDate = reportedDate,
            History = historyDtos
        };
    }
}
