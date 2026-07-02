namespace api.Features.Incidents.List;

public class ListIncidentsQuery
{
    public DateTimeOffset? Since { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public string? Status { get; set; }
    public string? Severity { get; set; }
    public string? Area { get; set; }
}


