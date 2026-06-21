namespace api.Features.Incidents.Create;

public class CreateIncidentResponse
{
    public string IncidentId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int AreaId { get; set; }
    public int IncidentTypeId { get; set; }
    public int SeverityTypeId { get; set; }
    public string Status { get; set; } = string.Empty;
}
