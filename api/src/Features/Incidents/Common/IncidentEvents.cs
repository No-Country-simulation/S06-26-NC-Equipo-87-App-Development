namespace api.Features.Incidents.Common;

public record IncidentCreatedEvent(
    string IncidentId,
    string Description,
    int AreaId,
    int IncidentTypeId,
    int SeverityTypeId,
    string Status
);

public record IncidentAssignedEvent(
    string IncidentId,
    string TechnicianId,
    string Status
);

public record IncidentAttentionStartedEvent(
    string IncidentId,
    string Status
);

public record IncidentClosedEvent(
    string IncidentId,
    string SolutionApplied,
    int RootCauseTypeId,
    string Status
);

public interface IIncidentEventPublisher
{
    public Task PublishIncidentCreatedAsync(IncidentCreatedEvent @event);
    public Task PublishIncidentAssignedAsync(IncidentAssignedEvent @event);
    public Task PublishIncidentAttentionStartedAsync(IncidentAttentionStartedEvent @event);
    public Task PublishIncidentClosedAsync(IncidentClosedEvent @event);
}
