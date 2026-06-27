namespace api.Features.Incidents.Edit;

public class EditIncidentResult
{
    public bool Succeeded { get; set; }
    public string? ErrorMessage { get; set; }
    public EditIncidentResponse? Response { get; set; }
}
