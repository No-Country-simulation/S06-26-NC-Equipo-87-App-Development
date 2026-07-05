namespace api.Features.Dashboard.GetOperationalDashboard;

public class OperationalDashboardResponse
{
    public int IncidentsThisWeek { get; set; }
    public int IncidentsLastWeek { get; set; }
    public string MeanTimeToRepair { get; set; } = string.Empty;
    public double MeanTimeToRepairMinutes { get; set; }
    public double MeanTimeToRepairLastWeekMinutes { get; set; }
    public string ResolutionRate { get; set; } = string.Empty;
    public string ResolutionRateLastWeek { get; set; } = string.Empty;
    public int HighSeverityThisWeek { get; set; }
    public int HighSeverityLastWeek { get; set; }
    public List<DailyIncidentTrendDto> IncidentsByDay { get; set; } = [];
    public List<IncidentTypeDistributionDto> IncidentsByType { get; set; } = [];
    public List<ShiftDistributionDto> IncidentsByShift { get; set; } = [];
    public List<RecentCriticalIncidentDto> RecentCriticalIncidents { get; set; } = [];
    public StatusSummaryCountsDto StatusCounts { get; set; } = null!;
    public List<string> Insights { get; set; } = [];
}

public class DailyIncidentTrendDto
{
    public string Day { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class IncidentTypeDistributionDto
{
    public string Label { get; set; } = string.Empty;
    public double Percent { get; set; }
    public int Count { get; set; }
}

public class ShiftDistributionDto
{
    public string Label { get; set; } = string.Empty;
    public double Percent { get; set; }
    public int Count { get; set; }
}

public class RecentCriticalIncidentDto
{
    public string Id { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
}

public class StatusSummaryCountsDto
{
    public int Open { get; set; }
    public int Assigned { get; set; }
    public int InProgress { get; set; }
    public int Closed { get; set; }
}
