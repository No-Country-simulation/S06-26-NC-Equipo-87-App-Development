namespace api.Features.Incidents.Common;

public class LoggingIncidentEventPublisher(ILogger<LoggingIncidentEventPublisher> logger) : IIncidentEventPublisher
{
    private readonly ILogger<LoggingIncidentEventPublisher> _logger = logger;

    public Task PublishIncidentCreatedAsync(IncidentCreatedEvent @event)
    {
        _logger.LogInformation("Domain Event Published: IncidentCreated {@Event}", @event);
        return Task.CompletedTask;
    }

    public Task PublishIncidentAssignedAsync(IncidentAssignedEvent @event)
    {
        _logger.LogInformation("Domain Event Published: IncidentAssigned {@Event}", @event);
        return Task.CompletedTask;
    }

    public Task PublishIncidentAttentionStartedAsync(IncidentAttentionStartedEvent @event)
    {
        _logger.LogInformation("Domain Event Published: IncidentAttentionStarted {@Event}", @event);
        return Task.CompletedTask;
    }

    public Task PublishIncidentClosedAsync(IncidentClosedEvent @event)
    {
        _logger.LogInformation("Domain Event Published: IncidentClosed {@Event}", @event);
        return Task.CompletedTask;
    }
}
