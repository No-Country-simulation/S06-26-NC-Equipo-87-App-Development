namespace api.Features.Incidents.Close;

public class CloseIncidentResult
{
    public bool Succeeded { get; set; }
    public string? ErrorMessage { get; set; }
}
