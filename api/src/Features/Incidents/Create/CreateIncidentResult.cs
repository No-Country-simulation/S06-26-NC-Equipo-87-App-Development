namespace api.Features.Incidents.Create;

public class CreateIncidentResult
{
    public bool Succeeded { get; set; }
    public string? ErrorMessage { get; set; }
    public CreateIncidentResponse? Response { get; set; }
}
