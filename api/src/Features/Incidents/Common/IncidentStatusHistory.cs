using api.Features.Authentication.Common;

namespace api.Features.Incidents.Common;

public class IncidentStatusHistory
{
    public int HistoryId { get; set; }
    public string IncidentId { get; set; } = string.Empty;
    public Incident Incident { get; set; } = null!;
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? TransitionNotes { get; set; }
    public string ChangedByUserId { get; set; } = string.Empty;
    public User ChangedByUser { get; set; } = null!;
    public DateTimeOffset ChangedDate { get; set; }
}
