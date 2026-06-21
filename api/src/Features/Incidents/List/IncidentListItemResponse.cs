namespace api.Features.Incidents.List;

public class IncidentListItemResponse
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
    public DateTimeOffset ReportedDate { get; set; }
}
