using System.Text.Json;

using api.Data;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Common;

public class ExpoPushService(HttpClient httpClient, AppDbContext dbContext, ILogger<ExpoPushService> logger) : IExpoPushService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly AppDbContext _dbContext = dbContext;
    private readonly ILogger<ExpoPushService> _logger = logger;

    public async Task SendPushAsync(string expoPushToken, string title, string body, object data)
    {
        var payload = new
        {
            to = expoPushToken,
            title,
            body,
            data
        };

        HttpResponseMessage response = await _httpClient.PostAsJsonAsync("https://exp.host/--/api/v2/push/send", payload);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Expo push API returned error status: {StatusCode}", response.StatusCode);
            return;
        }

        string responseString = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(responseString);
        JsonElement root = doc.RootElement;

        if (root.TryGetProperty("data", out JsonElement dataProp) && dataProp.ValueKind == JsonValueKind.Array)
        {
            foreach (JsonElement item in dataProp.EnumerateArray())
            {
                if (item.TryGetProperty("status", out JsonElement statusProp) && statusProp.GetString() == "error")
                {
                    if (item.TryGetProperty("details", out JsonElement detailsProp) &&
                        detailsProp.TryGetProperty("error", out JsonElement errorProp) &&
                        errorProp.GetString() == "DeviceNotRegistered")
                    {
                        _logger.LogWarning("Expo token {Token} is not registered. Removing from database.", expoPushToken);

                        api.Features.Authentication.Common.User? user = await _dbContext.Users.FirstOrDefaultAsync(u => u.ExpoPushToken == expoPushToken);
                        if (user != null)
                        {
                            user.ExpoPushToken = null;
                            await _dbContext.SaveChangesAsync();
                        }
                    }
                }
            }
        }
    }
}
