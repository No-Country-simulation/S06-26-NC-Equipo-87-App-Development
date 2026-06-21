using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using api.Features.Authentication.Login;
using api.Features.Authentication.Register;
using api.Features.Incidents.Create;
using api.Features.Incidents.Detail;
using api.Features.Incidents.List;

namespace api.IntegrationTests.Features.Incidents;

public class IncidentIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<string> AuthenticateUserAsync(string email, string role)
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Test",
            LastName = "User",
            Password = "SecurePassword123!",
            Email = email,
            Role = role
        };
        await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);

        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = email,
            Password = "SecurePassword123!"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        return loginResult?.Token ?? string.Empty;
    }

    [Fact]
    public async Task CreateIncident_ValidPayloadAsOperator_ReturnsCreatedAndLogsHistory()
    {
        // Arrange
        string token = await AuthenticateUserAsync("operator.incidents@opscore.com", "Operator");
        CreateIncidentCommand command = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Leaking valve in Zone North"
        };
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(result);
        Assert.StartsWith("INC-", result.IncidentId);
        Assert.Equal("Open", result.Status);
        Assert.Equal(command.Description, result.Description);
        Assert.Equal(command.AreaId, result.AreaId);
        Assert.Equal(command.IncidentTypeId, result.IncidentTypeId);
        Assert.Equal(command.SeverityTypeId, result.SeverityTypeId);
    }

    [Fact]
    public async Task CreateIncident_Unauthenticated_ReturnsUnauthorized()
    {
        // Arrange
        CreateIncidentCommand command = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Test unauthenticated description"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/incidents", command);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateIncident_ForbiddenRole_ReturnsForbidden()
    {
        // Arrange
        string token = await AuthenticateUserAsync("technician.incidents@opscore.com", "Technician");
        CreateIncidentCommand command = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Technician test description"
        };
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task IncidentFlow_CreateListAndDetail_SucceedsEndToEnd()
    {
        // Arrange
        string token = await AuthenticateUserAsync("supervisor.incidents@opscore.com", "Supervisor");

        CreateIncidentCommand command1 = new CreateIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Slip hazard in Line 3"
        };
        HttpRequestMessage request1 = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command1)
        };
        request1.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response1 = await _client.SendAsync(request1);
        var result1 = await response1.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(result1);

        CreateIncidentCommand command2 = new CreateIncidentCommand
        {
            AreaId = 3,
            IncidentTypeId = 3,
            SeverityTypeId = 3,
            Description = "Damaged packaging box"
        };
        HttpRequestMessage request2 = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command2)
        };
        request2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response2 = await _client.SendAsync(request2);
        var result2 = await response2.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(result2);

        HttpRequestMessage listRequest = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        listRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var listResponse = await _client.SendAsync(listRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var listResult = await listResponse.Content.ReadFromJsonAsync<List<IncidentListItemResponse>>();
        Assert.NotNull(listResult);
        Assert.Contains(listResult, x => x.IncidentId == result1.IncidentId);
        Assert.Contains(listResult, x => x.IncidentId == result2.IncidentId);

        // Arrange
        HttpRequestMessage detailRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/incidents/{result1.IncidentId}");
        detailRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var detailResponse = await _client.SendAsync(detailRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, detailResponse.StatusCode);
        var detailResult = await detailResponse.Content.ReadFromJsonAsync<IncidentDetailResponse>();
        Assert.NotNull(detailResult);
        Assert.Equal(result1.IncidentId, detailResult.IncidentId);
        Assert.Equal(command1.Description, detailResult.Description);
        Assert.Equal("Línea 3", detailResult.AreaName);
        Assert.Equal("Accidente", detailResult.IncidentTypeName);
        Assert.Equal("Medio", detailResult.SeverityTypeName);
        Assert.Single(detailResult.History);
        Assert.Equal("Open", detailResult.History[0].NewStatus);
        Assert.Null(detailResult.History[0].PreviousStatus);
    }

    [Fact]
    public async Task ListIncidents_WithSinceFilter_ReturnsOnlyRecentIncidents()
    {
        // Arrange
        string token = await AuthenticateUserAsync("supervisor.filter@opscore.com", "Supervisor");

        CreateIncidentCommand commandRecent = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Leaking valve recent",
            DeviceTimestamp = DateTimeOffset.UtcNow.AddHours(-2)
        };
        HttpRequestMessage requestRecent = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(commandRecent)
        };
        requestRecent.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var responseRecent = await _client.SendAsync(requestRecent);
        var resultRecent = await responseRecent.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(resultRecent);

        CreateIncidentCommand commandOld = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Leaking valve old",
            DeviceTimestamp = DateTimeOffset.UtcNow.AddHours(-26)
        };
        HttpRequestMessage requestOld = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(commandOld)
        };
        requestOld.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var responseOld = await _client.SendAsync(requestOld);
        var resultOld = await responseOld.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(resultOld);

        string sinceParam = Uri.EscapeDataString(DateTimeOffset.UtcNow.AddHours(-24).ToString("o"));
        HttpRequestMessage listRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/incidents?since={sinceParam}");
        listRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var listResponse = await _client.SendAsync(listRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var listResult = await listResponse.Content.ReadFromJsonAsync<List<IncidentListItemResponse>>();
        Assert.NotNull(listResult);
        Assert.Contains(listResult, x => x.IncidentId == resultRecent.IncidentId);
        Assert.DoesNotContain(listResult, x => x.IncidentId == resultOld.IncidentId);
    }

    [Fact]
    public async Task GetIncident_NonExistent_ReturnsNotFound()
    {
        // Arrange
        string token = await AuthenticateUserAsync("supervisor.incidents2@opscore.com", "Supervisor");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents/INC-9999");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
