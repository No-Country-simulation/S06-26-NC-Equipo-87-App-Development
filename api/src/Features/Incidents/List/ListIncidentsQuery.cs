namespace api.Features.Incidents.List;

public class ListIncidentsQuery
{
    public string? ReportedByUserId { get; set; }
    public DateTimeOffset? Since { get; set; }
}
