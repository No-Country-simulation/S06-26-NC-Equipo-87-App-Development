using System.Security.Claims;

using api.Data;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.List;

public class ListIncidentsHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public async Task<List<IncidentListItemResponse>> HandleAsync(ListIncidentsQuery query)
    {
        var incidentsQuery = _dbContext.Incidents.AsQueryable();

        HttpContext? httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated == true)
        {
            string? userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                if (httpContext.User.IsInRole("Operator"))
                {
                    incidentsQuery = incidentsQuery.Where(i => i.StatusHistories
                        .OrderBy(h => h.ChangedDate)
                        .Select(h => h.ChangedByUserId)
                        .FirstOrDefault() == userId);
                }
                else if (httpContext.User.IsInRole("Supervisor"))
                {
                    var userAreaIds = await _dbContext.UserAreas
                        .Where(ua => ua.UserId == userId)
                        .Select(ua => ua.AreaId)
                        .ToListAsync();

                    incidentsQuery = incidentsQuery.Where(i => userAreaIds.Contains(i.AreaId));
                }
                else if (httpContext.User.IsInRole("Technician"))
                {
                    incidentsQuery = incidentsQuery.Where(i => i.AssignedToUserId == userId);
                }
                else if (httpContext.User.IsInRole("Plant Manager"))
                {
                    // No filter (returns all incidents)
                }
            }
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
            .OrderByDescending(i => i.StatusHistories.Max(h => h.ChangedDate))
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
                ReportedByEmployeeId = i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedByUser.EmployeeId)
                    .FirstOrDefault() ?? string.Empty,
                ReportedDate = i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedDate)
                    .FirstOrDefault()
            })
            .ToListAsync();
    }
}

