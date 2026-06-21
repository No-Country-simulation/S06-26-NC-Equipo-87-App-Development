using api.Data;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.List;

public class ListIncidentsHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<IncidentListItemResponse>> HandleAsync(ListIncidentsQuery query)
    {
        var incidentsQuery = _dbContext.Incidents.AsQueryable();

        if (!string.IsNullOrEmpty(query.ReportedByUserId))
        {
            incidentsQuery = incidentsQuery.Where(i => i.StatusHistories
                .OrderBy(h => h.ChangedDate)
                .Select(h => h.ChangedByUserId)
                .FirstOrDefault() == query.ReportedByUserId);
        }

        if (query.Since.HasValue)
        {
            var sinceUtc = query.Since.Value.ToUniversalTime();
            incidentsQuery = incidentsQuery.Where(i => i.StatusHistories
                .OrderBy(h => h.ChangedDate)
                .Select(h => h.ChangedDate)
                .FirstOrDefault() >= sinceUtc);
        }

        return await incidentsQuery
            .Select(i => new IncidentListItemResponse
            {
                IncidentId = i.IncidentId,
                Description = i.Description,
                AreaId = i.AreaId,
                AreaName = i.Area.Name,
                IncidentTypeId = i.IncidentTypeId,
                IncidentTypeName = i.IncidentType.Name,
                SeverityTypeId = i.SeverityTypeId,
                SeverityTypeName = i.SeverityType.Name,
                Status = i.Status,
                ReportedByUserId = i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedByUserId)
                    .FirstOrDefault() ?? string.Empty,
                ReportedDate = i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedDate)
                    .FirstOrDefault()
            })
            .ToListAsync();
    }
}
