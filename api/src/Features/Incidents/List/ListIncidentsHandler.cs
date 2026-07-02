using System.Security.Claims;

using api.Data;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.List;

public class ListIncidentsHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
{
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public async Task<IncidentListResponse> HandleAsync(ListIncidentsQuery query)
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
                    List<int> userAreaIds = await _dbContext.UserAreas
                        .Where(ua => ua.UserId == userId)
                        .Select(ua => ua.AreaId)
                        .ToListAsync();

                    incidentsQuery = incidentsQuery.Where(i => userAreaIds.Contains(i.AreaId));
                }
                else if (httpContext.User.IsInRole("Technician"))
                {
                    incidentsQuery = incidentsQuery.Where(i => i.AssignedToUserId == userId);
                }
            }
        }

        if (query.Since.HasValue)
        {
            DateTimeOffset sinceUtc = query.Since.Value.ToUniversalTime();
            incidentsQuery = incidentsQuery.Where(i => i.StatusHistories
                .OrderBy(h => h.ChangedDate)
                .Select(h => h.ChangedDate)
                .FirstOrDefault() >= sinceUtc);
        }

        if (!string.IsNullOrEmpty(query.Severity) && !string.Equals(query.Severity, "All", StringComparison.OrdinalIgnoreCase))
        {
            incidentsQuery = incidentsQuery.Where(i => i.SeverityType.Name.ToLower() == query.Severity.ToLower());
        }

        if (!string.IsNullOrEmpty(query.Area) && !string.Equals(query.Area, "All", StringComparison.OrdinalIgnoreCase))
        {
            incidentsQuery = incidentsQuery.Where(i => i.Area.Name.ToLower() == query.Area.ToLower());
        }

        var statusCounts = await incidentsQuery
            .GroupBy(i => i.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        int openCount = statusCounts.FirstOrDefault(x => string.Equals(x.Status, "Open", StringComparison.OrdinalIgnoreCase))?.Count ?? 0;
        int assignedCount = statusCounts.FirstOrDefault(x => string.Equals(x.Status, "Assigned", StringComparison.OrdinalIgnoreCase))?.Count ?? 0;
        int inProgressCount = statusCounts.FirstOrDefault(x => string.Equals(x.Status, "In-Progress", StringComparison.OrdinalIgnoreCase))?.Count ?? 0;
        int closedCount = statusCounts.FirstOrDefault(x => string.Equals(x.Status, "Closed", StringComparison.OrdinalIgnoreCase))?.Count ?? 0;

        if (!string.IsNullOrEmpty(query.Status) && !string.Equals(query.Status, "All", StringComparison.OrdinalIgnoreCase))
        {
            incidentsQuery = incidentsQuery.Where(i => i.Status.ToLower() == query.Status.ToLower());
        }

        int totalItems = await incidentsQuery.CountAsync();
        int currentPage = query.Page ?? 1;
        int pageSize = query.PageSize ?? 10;
        int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        List<IncidentListItemResponse> items = await incidentsQuery
            .OrderByDescending(i => i.StatusHistories.Max(h => h.ChangedDate))
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
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
                    .FirstOrDefault(),
                AssignedToEmployeeId = i.AssignedToUser != null ? i.AssignedToUser.EmployeeId : string.Empty,
                ReportedByLastName = i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedByUser.LastName)
                    .FirstOrDefault() ?? string.Empty,
                AssignedToLastName = i.AssignedToUser != null ? i.AssignedToUser.LastName : string.Empty
            })
            .ToListAsync();

        return new IncidentListResponse
        {
            Items = items,
            CurrentPage = currentPage,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            OpenCount = openCount,
            AssignedCount = assignedCount,
            InProgressCount = inProgressCount,
            ClosedCount = closedCount
        };
    }
}

