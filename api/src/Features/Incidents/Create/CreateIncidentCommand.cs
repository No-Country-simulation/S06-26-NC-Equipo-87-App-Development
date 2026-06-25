namespace api.Features.Incidents.Create;

public class CreateIncidentCommand
{
    public int AreaId { get; set; }
    public int IncidentTypeId { get; set; }
    public int SeverityTypeId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? DeviceTimestamp { get; set; }
}
