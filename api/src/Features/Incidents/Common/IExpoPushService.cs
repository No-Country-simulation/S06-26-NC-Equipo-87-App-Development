namespace api.Features.Incidents.Common;

public interface IExpoPushService
{
    public Task SendPushAsync(string expoPushToken, string title, string body, object data);
}
