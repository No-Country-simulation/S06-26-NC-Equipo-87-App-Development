using api.Data;
using api.Features.Incidents.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Dashboard.GetOperationalDashboard;

public class GetOperationalDashboardHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<OperationalDashboardResponse> HandleAsync(GetOperationalDashboardQuery query)
    {
        DateTimeOffset thisPeriodStart = DateTimeOffset.UtcNow.AddDays(-7);
        DateTimeOffset? thisPeriodEnd = null;
        DateTimeOffset prevPeriodStart = DateTimeOffset.UtcNow.AddDays(-14);
        DateTimeOffset? prevPeriodEnd = DateTimeOffset.UtcNow.AddDays(-7);

        DateTimeOffset trendReferenceDate = DateTimeOffset.UtcNow.Date;

        if (query != null && (query.StartDate.HasValue || query.EndDate.HasValue))
        {
            if (query.StartDate.HasValue)
            {
                thisPeriodStart = query.StartDate.Value;
                thisPeriodEnd = query.EndDate;
                TimeSpan duration = (thisPeriodEnd ?? DateTimeOffset.UtcNow) - thisPeriodStart;
                prevPeriodStart = thisPeriodStart.Add(-duration);
                prevPeriodEnd = thisPeriodStart;
                trendReferenceDate = (thisPeriodEnd ?? DateTimeOffset.UtcNow).Date;
            }
            else
            {
                thisPeriodStart = DateTimeOffset.MinValue;
                thisPeriodEnd = query.EndDate;
                prevPeriodStart = DateTimeOffset.MinValue;
                prevPeriodEnd = DateTimeOffset.MinValue;
                trendReferenceDate = query.EndDate.HasValue ? query.EndDate.Value.Date : DateTimeOffset.UtcNow.Date;
            }
        }
        else if (query != null)
        {
            thisPeriodStart = DateTimeOffset.MinValue;
            thisPeriodEnd = null;
            prevPeriodStart = DateTimeOffset.MinValue;
            prevPeriodEnd = DateTimeOffset.MinValue;
            trendReferenceDate = DateTimeOffset.UtcNow.Date;
        }

        List<Incident> incidents = await _dbContext.Incidents
            .Include(i => i.Area)
            .Include(i => i.IncidentType)
            .Include(i => i.SeverityType)
            .Include(i => i.StatusHistories)
                .ThenInclude(h => h.ChangedByUser)
                    .ThenInclude(u => u.Shift)
            .ToListAsync();

        List<string> allIncidentTypeNames = await _dbContext.IncidentTypes
            .Select(t => t.Name)
            .ToListAsync();

        List<string> allShiftNames = await _dbContext.Shifts
            .Select(s => s.Name)
            .ToListAsync();

        List<Incident> weeklyIncidents = incidents
            .Where(i =>
            {
                var reportedDate = GetReportedDate(i);
                return reportedDate >= thisPeriodStart && (thisPeriodEnd == null || reportedDate < thisPeriodEnd);
            })
            .ToList();

        List<Incident> lastWeekIncidents = incidents
            .Where(i =>
            {
                var reportedDate = GetReportedDate(i);
                return reportedDate >= prevPeriodStart && (prevPeriodEnd == null || reportedDate < prevPeriodEnd);
            })
            .ToList();

        List<Incident> closedWeeklyIncidents = weeklyIncidents
            .Where(i => i.Status == "Closed")
            .ToList();

        List<Incident> closedLastWeekIncidents = lastWeekIncidents
            .Where(i => i.Status == "Closed")
            .ToList();

        int incidentsThisWeekCount = weeklyIncidents.Count;
        int incidentsLastWeekCount = lastWeekIncidents.Count;

        List<TimeSpan> repairDurations = closedWeeklyIncidents
            .Select(CalculateResolutionDuration)
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .ToList();

        List<TimeSpan> lastWeekRepairDurations = closedLastWeekIncidents
            .Select(CalculateResolutionDuration)
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .ToList();

        string meanTimeToRepair = "-";
        double meanTimeToRepairMinutes = 0;
        if (repairDurations.Count > 0)
        {
            double avgTicks = repairDurations.Average(d => d.Ticks);
            TimeSpan avgDuration = TimeSpan.FromTicks((long)avgTicks);
            meanTimeToRepair = FormatDuration(avgDuration);
            meanTimeToRepairMinutes = avgDuration.TotalMinutes;
        }

        double meanTimeToRepairLastWeekMinutes = lastWeekRepairDurations.Count > 0
            ? TimeSpan.FromTicks((long)lastWeekRepairDurations.Average(d => d.Ticks)).TotalMinutes
            : 0;

        string resolutionRate = incidentsThisWeekCount > 0
            ? $"{Math.Round(((double)closedWeeklyIncidents.Count / incidentsThisWeekCount) * 100)}%"
            : "0%";

        string resolutionRateLastWeek = incidentsLastWeekCount > 0
            ? $"{Math.Round(((double)closedLastWeekIncidents.Count / incidentsLastWeekCount) * 100)}%"
            : "0%";

        int highSeverityCount = weeklyIncidents
            .Count(i => i.SeverityType.Name.Equals("Alto", StringComparison.OrdinalIgnoreCase));

        int highSeverityLastWeekCount = lastWeekIncidents
            .Count(i => i.SeverityType.Name.Equals("Alto", StringComparison.OrdinalIgnoreCase));

        List<DailyIncidentTrendDto> dailyTrend = GetDailyIncidentTrend(weeklyIncidents, trendReferenceDate);
        List<IncidentTypeDistributionDto> typeDistribution = GetIncidentTypeDistribution(weeklyIncidents, allIncidentTypeNames);
        List<ShiftDistributionDto> shiftDistribution = GetShiftDistribution(weeklyIncidents, allShiftNames);
        List<RecentCriticalIncidentDto> recentCritical = GetRecentCriticalIncidents(weeklyIncidents);
        StatusSummaryCountsDto statusCounts = GetStatusCounts(weeklyIncidents);
        List<string> insights = GetOperationalInsights(incidentsThisWeekCount, incidentsLastWeekCount, weeklyIncidents);

        return new OperationalDashboardResponse
        {
            IncidentsThisWeek = incidentsThisWeekCount,
            IncidentsLastWeek = incidentsLastWeekCount,
            MeanTimeToRepair = meanTimeToRepair,
            MeanTimeToRepairMinutes = meanTimeToRepairMinutes,
            MeanTimeToRepairLastWeekMinutes = meanTimeToRepairLastWeekMinutes,
            ResolutionRate = resolutionRate,
            ResolutionRateLastWeek = resolutionRateLastWeek,
            HighSeverityThisWeek = highSeverityCount,
            HighSeverityLastWeek = highSeverityLastWeekCount,
            IncidentsByDay = dailyTrend,
            IncidentsByType = typeDistribution,
            IncidentsByShift = shiftDistribution,
            RecentCriticalIncidents = recentCritical,
            StatusCounts = statusCounts,
            Insights = insights
        };
    }

    private static DateTimeOffset GetReportedDate(Incident incident)
    {
        var firstHistory = incident.StatusHistories
            .OrderBy(h => h.ChangedDate)
            .FirstOrDefault();

        return firstHistory?.ChangedDate ?? DateTimeOffset.MinValue;
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

    private static List<DailyIncidentTrendDto> GetDailyIncidentTrend(List<Incident> weeklyIncidents, DateTimeOffset today)
    {
        List<DailyIncidentTrendDto> trend = new List<DailyIncidentTrendDto>();

        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            string dayLabel = GetSpanishDayLabel(date.DayOfWeek);

            int count = weeklyIncidents
                .Count(inc => GetReportedDate(inc).UtcDateTime.Date == date.UtcDateTime.Date);

            trend.Add(new DailyIncidentTrendDto
            {
                Day = dayLabel,
                Value = count
            });
        }

        return trend;
    }

    private static string GetSpanishDayLabel(DayOfWeek dayOfWeek)
    {
        return dayOfWeek switch
        {
            DayOfWeek.Monday => "Lun",
            DayOfWeek.Tuesday => "Mar",
            DayOfWeek.Wednesday => "Mié",
            DayOfWeek.Thursday => "Jue",
            DayOfWeek.Friday => "Vie",
            DayOfWeek.Saturday => "Sáb",
            DayOfWeek.Sunday => "Dom",
            _ => string.Empty
        };
    }

    private static List<IncidentTypeDistributionDto> GetIncidentTypeDistribution(
        List<Incident> weeklyIncidents,
        List<string> allIncidentTypeNames)
    {
        int total = weeklyIncidents.Count;

        Dictionary<string, int> countsByType = weeklyIncidents
            .GroupBy(i => i.IncidentType.Name)
            .ToDictionary(g => g.Key, g => g.Count());

        return allIncidentTypeNames
            .Select(name => new IncidentTypeDistributionDto
            {
                Label = name,
                Count = countsByType.GetValueOrDefault(name, 0),
                Percent = total > 0
                    ? Math.Round(((double)countsByType.GetValueOrDefault(name, 0) / total) * 100)
                    : 0
            })
            .OrderByDescending(d => d.Count)
            .ToList();
    }

    private static List<ShiftDistributionDto> GetShiftDistribution(
        List<Incident> weeklyIncidents,
        List<string> allShiftNames)
    {
        int total = weeklyIncidents.Count;

        Dictionary<string, int> countsByShift = weeklyIncidents
            .GroupBy(i =>
            {
                IncidentStatusHistory? firstHistory = i.StatusHistories.OrderBy(h => h.ChangedDate).FirstOrDefault();
                return firstHistory?.ChangedByUser?.Shift?.Name ?? "Otro";
            })
            .ToDictionary(g => g.Key, g => g.Count());

        return allShiftNames
            .Select(name => new ShiftDistributionDto
            {
                Label = name,
                Count = countsByShift.GetValueOrDefault(name, 0),
                Percent = total > 0
                    ? Math.Round(((double)countsByShift.GetValueOrDefault(name, 0) / total) * 100)
                    : 0
            })
            .OrderByDescending(d => d.Count)
            .ToList();
    }

    private static List<RecentCriticalIncidentDto> GetRecentCriticalIncidents(List<Incident> incidents)
    {
        return incidents
            .Where(i => i.SeverityType.Name.Equals("Alto", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(GetReportedDate)
            .Take(5)
            .Select(i =>
            {
                var duration = CalculateResolutionDuration(i);
                string resolutionTime = duration.HasValue ? FormatDuration(duration.Value) : "-";

                return new RecentCriticalIncidentDto
                {
                    Id = i.IncidentId,
                    Area = i.Area.Name,
                    Type = i.IncidentType.Name,
                    Status = GetSpanishStatus(i.Status),
                    StatusKey = GetStatusKey(i.Status),
                    Time = resolutionTime
                };
            })
            .ToList();
    }

    private static string GetSpanishStatus(string status)
    {
        return status switch
        {
            "Open" => "ABIERTO",
            "Assigned" => "ASIGNADO",
            "In-Progress" => "EN PROCESO",
            "Closed" => "CERRADO",
            _ => "ABIERTO"
        };
    }

    private static string GetStatusKey(string status)
    {
        return status switch
        {
            "Open" => "open",
            "Assigned" => "assigned",
            "In-Progress" => "inProgress",
            "Closed" => "closed",
            _ => "open"
        };
    }

    private static StatusSummaryCountsDto GetStatusCounts(List<Incident> periodIncidents)
    {
        int openCount = periodIncidents.Count(i => i.Status == "Open" && i.AssignedToUserId == null);
        int assignedCount = periodIncidents.Count(i => i.Status == "Assigned");
        int inProgressCount = periodIncidents.Count(i => i.Status == "In-Progress");
        int closedCount = periodIncidents.Count(i => i.Status == "Closed");

        return new StatusSummaryCountsDto
        {
            Open = openCount,
            Assigned = assignedCount,
            InProgress = inProgressCount,
            Closed = closedCount
        };
    }

    private static List<string> GetOperationalInsights(
        int currentCount,
        int previousCount,
        List<Incident> weeklyIncidents)
    {
        List<string> insights = [];

        if (previousCount > 0 && currentCount > previousCount)
        {
            double increasePct = ((double)(currentCount - previousCount) / previousCount) * 100;
            if (increasePct > 20)
            {
                double roundedPct = Math.Round(increasePct);
                insights.Add($"Los incidentes aumentaron un {roundedPct}% esta semana respecto a la anterior.");
            }
        }

        int unclassifiedCount = weeklyIncidents
            .Count(i => i.IncidentType.Name.Equals("Otro", StringComparison.OrdinalIgnoreCase) || i.IncidentTypeId == 4);

        if (unclassifiedCount > 0)
        {
            string incidentWord = unclassifiedCount == 1 ? "incidente" : "incidentes";
            insights.Add($"{unclassifiedCount} {incidentWord} sin clasificar esta semana, requiere revisión manual.");
        }

        return insights;
    }
}
