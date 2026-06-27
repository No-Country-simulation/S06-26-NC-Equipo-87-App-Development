namespace api.Features.Incidents.Edit;

public class EditIncidentCommand
{
    public int AreaId { get; set; }
    public int IncidentTypeId { get; set; }
    public int SeverityTypeId { get; set; }
    public string Description { get; set; } = string.Empty;
}
