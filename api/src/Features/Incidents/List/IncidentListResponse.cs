namespace api.Features.Incidents.List;

public class IncidentListResponse
{
    public List<IncidentListItemResponse> Items { get; set; } = [];
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int OpenCount { get; set; }
    public int AssignedCount { get; set; }
    public int InProgressCount { get; set; }
    public int ClosedCount { get; set; }
}
