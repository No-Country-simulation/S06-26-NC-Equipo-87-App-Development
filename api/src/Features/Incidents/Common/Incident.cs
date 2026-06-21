using api.Features.Lookups.Common;

namespace api.Features.Incidents.Common;

public class Incident
{
    public string IncidentId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;
    public int IncidentTypeId { get; set; }
    public IncidentType IncidentType { get; set; } = null!;
    public int SeverityTypeId { get; set; }
    public SeverityType SeverityType { get; set; } = null!;
    public string Status { get; set; } = "Open";
    public ICollection<IncidentStatusHistory> StatusHistories { get; set; } = [];
}
