namespace api.Features.Incidents.Detail;

public class IncidentDetailResponse
{
    public string IncidentId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int AreaId { get; set; }
    public string AreaName { get; set; } = string.Empty;
    public int IncidentTypeId { get; set; }
    public string IncidentTypeName { get; set; } = string.Empty;
    public int SeverityTypeId { get; set; }
    public string SeverityTypeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ReportedByUserId { get; set; } = string.Empty;
    public string ReportedByEmployeeId { get; set; } = string.Empty;
    public DateTimeOffset ReportedDate { get; set; }
    public List<IncidentStatusHistoryDto> History { get; set; } = [];
}

public class IncidentStatusHistoryDto
{
    public int HistoryId { get; set; }
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? TransitionNotes { get; set; }
    public string ChangedByUserId { get; set; } = string.Empty;
    public string ChangedByUserFullName { get; set; } = string.Empty;
    public DateTimeOffset ChangedDate { get; set; }
}
