namespace api.Features.Incidents.Close;

public class CloseIncidentCommand
{
    public string SolutionApplied { get; set; } = string.Empty;
    public int RootCauseTypeId { get; set; }
}
