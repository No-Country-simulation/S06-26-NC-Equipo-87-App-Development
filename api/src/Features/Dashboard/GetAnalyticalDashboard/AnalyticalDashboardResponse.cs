namespace api.Features.Dashboard.GetAnalyticalDashboard;

public class AnalyticalDashboardResponse
{
    public List<FrequentCauseDto> FrequentCauses { get; set; } = [];
    public List<AreaIncidentDistributionDto> IncidentsByArea { get; set; } = [];
    public List<MechanicalFailTrendDto> MechanicalFailsTrend { get; set; } = [];
    public List<TechnicianPerformanceDto> TechnicianPerformance { get; set; } = [];
    public List<string> Insights { get; set; } = [];
}

public class FrequentCauseDto
{
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AreaIncidentDistributionDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class MechanicalFailTrendDto
{
    public string Week { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TechnicianPerformanceDto
{
    public string Name { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public int TicketsResolved { get; set; }
    public string AvgResolutionTime { get; set; } = string.Empty;
}
