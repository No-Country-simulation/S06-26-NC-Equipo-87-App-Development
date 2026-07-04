using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Dashboard.GetAnalyticalDashboard;

public class GetAnalyticalDashboardHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<AnalyticalDashboardResponse> HandleAsync(GetAnalyticalDashboardQuery query)
    {
        var queryable = _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.RootCauseType)
            .Include(i => i.StatusHistories)
            .AsQueryable();

        if (query != null)
        {
            if (!string.IsNullOrEmpty(query.Area) && !string.Equals(query.Area, "all", StringComparison.OrdinalIgnoreCase))
            {
                queryable = queryable.Where(i => i.Area.Name.ToLower() == query.Area.ToLower());
            }

            if (query.StartDate.HasValue)
            {
                DateTimeOffset start = query.StartDate.Value;
                queryable = queryable.Where(i => i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedDate)
                    .FirstOrDefault() >= start);
            }

            if (query.EndDate.HasValue)
            {
                DateTimeOffset end = query.EndDate.Value;
                queryable = queryable.Where(i => i.StatusHistories
                    .OrderBy(h => h.ChangedDate)
                    .Select(h => h.ChangedDate)
                    .FirstOrDefault() < end);
            }
        }

        List<Incident> incidents = await queryable.ToListAsync();

        List<string> allRootCauseNames = await _dbContext.RootCauseTypes
            .Select(r => r.Name)
            .ToListAsync();

        List<string> allAreaNames = await _dbContext.Areas
            .Select(a => a.Name)
            .ToListAsync();

        List<Incident> closedIncidents = incidents
            .Where(i => i.Status == "Closed")
            .ToList();

        List<FrequentCauseDto> frequentCauses = GetFrequentCauses(closedIncidents, allRootCauseNames);
        List<AreaIncidentDistributionDto> incidentsByArea = GetIncidentsByArea(incidents, allAreaNames);
        List<MechanicalFailTrendDto> mechanicalTrend = GetMechanicalFailsTrend(incidents, query);
        List<TechnicianPerformanceDto> techPerformance = await GetTechnicianPerformanceAsync(incidents);
        List<string> insights = GetAnalyticalInsights(incidents, techPerformance);

        return new AnalyticalDashboardResponse
        {
            FrequentCauses = frequentCauses,
            IncidentsByArea = incidentsByArea,
            MechanicalFailsTrend = mechanicalTrend,
            TechnicianPerformance = techPerformance,
            Insights = insights
        };
    }

    private static List<FrequentCauseDto> GetFrequentCauses(
        List<Incident> closedIncidents,
        List<string> allRootCauseNames)
    {
        Dictionary<string, int> countsByCause = closedIncidents
            .GroupBy(i => i.RootCauseType?.Name ?? "Causa no determinada")
            .ToDictionary(g => g.Key, g => g.Count());

        return allRootCauseNames
            .Select(name => new FrequentCauseDto
            {
                Label = name,
                Count = countsByCause.GetValueOrDefault(name, 0)
            })
            .OrderByDescending(c => c.Count)
            .ToList();
    }

    private static List<AreaIncidentDistributionDto> GetIncidentsByArea(
        List<Incident> incidents,
        List<string> allAreaNames)
    {
        Dictionary<string, int> countsByArea = incidents
            .GroupBy(i => i.Area.Name)
            .ToDictionary(g => g.Key, g => g.Count());

        return allAreaNames
            .Select(name => new AreaIncidentDistributionDto
            {
                Name = name,
                Count = countsByArea.GetValueOrDefault(name, 0)
            })
            .OrderByDescending(a => a.Count)
            .ToList();
    }

    private static List<MechanicalFailTrendDto> GetMechanicalFailsTrend(List<Incident> incidents, GetAnalyticalDashboardQuery? query)
    {
        List<MechanicalFailTrendDto> trend = new List<MechanicalFailTrendDto>();
        var now = DateTimeOffset.UtcNow;

        List<Incident> mechanicalFails = incidents
            .Where(i => i.IncidentType.Name.Equals("Falla mecánica", StringComparison.OrdinalIgnoreCase))
            .ToList();

        string timeFilter = "month";
        if (query?.StartDate.HasValue == true)
        {
            double totalDays = (now - query.StartDate.Value).TotalDays;
            if (totalDays <= 8)
            {
                timeFilter = "week";
            }
            else if (totalDays > 31)
            {
                timeFilter = "year";
            }
        }

        if (timeFilter == "week")
        {
            string[] dayNames = { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };
            for (int d = 6; d >= 0; d--)
            {
                var targetDate = now.AddDays(-d);
                DateTimeOffset start = new DateTimeOffset(targetDate.Year, targetDate.Month, targetDate.Day, 0, 0, 0, targetDate.Offset);
                var end = start.AddDays(1);

                int count = mechanicalFails
                    .Count(i =>
                    {
                        var reportedDate = GetReportedDate(i);
                        return reportedDate >= start && reportedDate < end;
                    });

                int dayOfWeekIndex = (int)targetDate.DayOfWeek;
                string label = $"{dayNames[dayOfWeekIndex]} {targetDate.Day}";

                trend.Add(new MechanicalFailTrendDto
                {
                    Week = label,
                    Count = count
                });
            }
        }
        else if (timeFilter == "year")
        {
            string[] monthNames = { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

            for (int i = 11; i >= 0; i--)
            {
                DateTimeOffset targetMonth = now.AddMonths(-i);
                DateTimeOffset start = new DateTimeOffset(targetMonth.Year, targetMonth.Month, 1, 0, 0, 0, TimeSpan.Zero);
                DateTimeOffset end = start.AddMonths(1);

                int count = mechanicalFails
                    .Count(incident =>
                    {
                        var reportedDate = GetReportedDate(incident);
                        return reportedDate >= start && reportedDate < end;
                    });

                trend.Add(new MechanicalFailTrendDto
                {
                    Week = monthNames[targetMonth.Month - 1],
                    Count = count
                });
            }
        }
        else
        {
            for (int w = 1; w <= 4; w++)
            {
                var end = now.AddDays(-7 * (4 - w));
                var start = now.AddDays(-7 * (5 - w));

                int count = mechanicalFails
                    .Count(i =>
                    {
                        var reportedDate = GetReportedDate(i);
                        return reportedDate >= start && reportedDate < end;
                    });

                trend.Add(new MechanicalFailTrendDto
                {
                    Week = $"Sem {w}",
                    Count = count
                });
            }
        }

        return trend;
    }

    private static DateTimeOffset GetReportedDate(Incident incident)
    {
        var firstHistory = incident.StatusHistories
            .OrderBy(h => h.ChangedDate)
            .FirstOrDefault();

        return firstHistory?.ChangedDate ?? DateTimeOffset.MinValue;
    }

    private async Task<List<TechnicianPerformanceDto>> GetTechnicianPerformanceAsync(List<Incident> incidents)
    {
        var technicians = await (from u in _dbContext.Users
                                 join ur in _dbContext.UserRoles on u.Id equals ur.UserId
                                 join r in _dbContext.Roles on ur.RoleId equals r.Id
                                 where r.Name == "Technician"
                                 select u)
                                 .Include(u => u.Speciality)
                                 .ToListAsync();

        List<Incident> closedIncidents = incidents
            .Where(i => i.Status == "Closed" && !string.IsNullOrEmpty(i.AssignedToUserId))
            .ToList();

        List<TechnicianPerformanceDto> performance = new List<TechnicianPerformanceDto>();

        foreach (var tech in technicians)
        {
            List<Incident> techClosed = closedIncidents
                .Where(i => i.AssignedToUserId == tech.Id)
                .ToList();

            List<TimeSpan> repairDurations = techClosed
                .Select(CalculateResolutionDuration)
                .Where(d => d.HasValue)
                .Select(d => d!.Value)
                .ToList();

            string avgResolutionTime = "-";
            if (repairDurations.Count > 0)
            {
                double avgTicks = repairDurations.Average(d => d.Ticks);
                avgResolutionTime = FormatDuration(TimeSpan.FromTicks((long)avgTicks));
            }

            string cleanEmpId = tech.EmployeeId.TrimStart('0');
            string formattedEmpId = string.IsNullOrEmpty(cleanEmpId) ? "000" : cleanEmpId.PadLeft(3, '0');
            performance.Add(new TechnicianPerformanceDto
            {
                Name = $"{tech.LastName} #{formattedEmpId}",
                Specialty = tech.Speciality?.Name ?? "General",
                TicketsResolved = techClosed.Count,
                AvgResolutionTime = avgResolutionTime
            });
        }

        return performance.OrderByDescending(p => p.TicketsResolved).ToList();
    }

    private static TimeSpan? CalculateResolutionDuration(Incident incident)
    {
        var inProgressDate = incident.StatusHistories
            .Where(h => h.NewStatus == "In-Progress")
            .OrderBy(h => h.ChangedDate)
            .Select(h => h.ChangedDate)
            .FirstOrDefault();

        var closedDate = incident.StatusHistories
            .Where(h => h.NewStatus == "Closed")
            .OrderBy(h => h.ChangedDate)
            .Select(h => h.ChangedDate)
            .FirstOrDefault();

        return inProgressDate != default && closedDate != default && closedDate > inProgressDate ? closedDate - inProgressDate : null;
    }

    private static string FormatDuration(TimeSpan duration)
    {
        int hours = (int)duration.TotalHours;
        int minutes = duration.Minutes;
        return $"{hours:D2}:{minutes:D2}";
    }

    private static List<string> GetAnalyticalInsights(List<Incident> incidents, List<TechnicianPerformanceDto> techPerformance)
    {
        List<string> insights = [];

        List<IGrouping<string, Incident>> incidentsByType = incidents
            .GroupBy(i => i.IncidentType.Name)
            .ToList();

        List<(double Percentage, string InsightText)> concentrationInsights = [];

        foreach (IGrouping<string, Incident> group in incidentsByType)
        {
            int totalForType = group.Count();
            if (totalForType == 0)
            {
                continue;
            }

            List<KeyValuePair<string, int>> areaCounts = group
                .GroupBy(i => i.Area.Name)
                .Select(g => new KeyValuePair<string, int>(g.Key, g.Count()))
                .OrderByDescending(x => x.Value)
                .ToList();

            if (areaCounts.Count > 0)
            {
                KeyValuePair<string, int> topArea = areaCounts[0];
                double pct = ((double)topArea.Value / totalForType) * 100;
                if (pct > 50)
                {
                    double roundedPct = Math.Round(pct);
                    string phrase = group.Key.ToLower() switch
                    {
                        "falla mecánica" => "fallas mecánicas",
                        "accidente" => "accidentes",
                        "calidad" => "incidentes de calidad",
                        _ => $"incidentes de tipo {group.Key.ToLower()}"
                    };
                    string connector = group.Key.ToLower() switch
                    {
                        "falla mecánica" => "de las",
                        "accidente" => "de los",
                        "calidad" => "de los",
                        _ => "de los"
                    };
                    string article = topArea.Key.Equals("Almacén", StringComparison.OrdinalIgnoreCase) ? "El" : "La";
                    concentrationInsights.Add((roundedPct, $"{article} {topArea.Key} concentra el {roundedPct}% {connector} {phrase} del período."));
                }
            }
        }

        if (concentrationInsights.Count > 0)
        {
            var topConcentration = concentrationInsights
                .OrderByDescending(x => x.Percentage)
                .First();
            insights.Add(topConcentration.InsightText);
        }

        List<TimeSpan> allDurations = incidents
            .Where(i => i.Status == "Closed")
            .Select(CalculateResolutionDuration)
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .ToList();

        if (allDurations.Count > 0)
        {
            double teamAverageMinutes = allDurations.Average(d => d.TotalMinutes);
            if (teamAverageMinutes > 0)
            {
                List<(double Ratio, string InsightText)> performanceInsights = [];

                foreach (TechnicianPerformanceDto tech in techPerformance)
                {
                    if (tech.TicketsResolved == 0 || string.IsNullOrEmpty(tech.AvgResolutionTime) || tech.AvgResolutionTime == "-")
                    {
                        continue;
                    }

                    string[] parts = tech.AvgResolutionTime.Split(':');
                    if (parts.Length == 2 && double.TryParse(parts[0], out double hrs) && double.TryParse(parts[1], out double mins))
                    {
                        double techAvgMinutes = hrs * 60 + mins;
                        double ratio = techAvgMinutes / teamAverageMinutes;
                        if (ratio >= 2.0)
                        {
                            performanceInsights.Add((ratio, $"{tech.Name} tiene un tiempo de resolución {ratio:0.0}x mayor al promedio del equipo."));
                        }
                    }
                }

                if (performanceInsights.Count > 0)
                {
                    var topPerformance = performanceInsights
                        .OrderByDescending(x => x.Ratio)
                        .First();
                    insights.Add(topPerformance.InsightText);
                }
            }
        }

        return insights;
    }
}
