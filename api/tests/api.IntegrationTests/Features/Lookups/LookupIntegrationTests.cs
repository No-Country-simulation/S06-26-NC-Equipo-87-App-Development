using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using api.Features.Authentication.Login;
using api.Features.Authentication.Register;
using api.Features.Lookups.Common;

namespace api.IntegrationTests.Features.Lookups;

public class LookupIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<string> AuthenticateUserAsync(string email)
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Lookup",
            LastName = "Tester",
            Password = "SecurePassword123!",
            Email = email,
            Role = "Operator"
        };
        await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);

        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = email,
            Password = "SecurePassword123!"
        };
        HttpResponseMessage loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        LoginResponseDto? loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        return loginResult?.Token ?? string.Empty;
    }

    [Fact]
    public async Task GetAreas_Authenticated_ReturnsOkAndSeededAreas()
    {
        // Arrange
        string token = await AuthenticateUserAsync("areas.tester@opscore.com");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/areas");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<Area>? result = await response.Content.ReadFromJsonAsync<List<Area>>();
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
        Assert.Contains(result, a => a.Name == "Zona Norte" && a.Status == "Active");
        Assert.Contains(result, a => a.Name == "Línea 3" && a.Status == "Active");
        Assert.Contains(result, a => a.Name == "Almacén" && a.Status == "Active");
        Assert.Contains(result, a => a.Name == "Calidad" && a.Status == "Active");
    }

    [Fact]
    public async Task GetAreas_Unauthenticated_ReturnsUnauthorized()
    {
        // Arrange

        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/areas");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetIncidentTypes_Authenticated_ReturnsOkAndSeededIncidentTypes()
    {
        // Arrange
        string token = await AuthenticateUserAsync("types.tester@opscore.com");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents/types");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<IncidentType>? result = await response.Content.ReadFromJsonAsync<List<IncidentType>>();
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
        Assert.Contains(result, t => t.Name == "Falla mecánica" && t.Status == "Active" && t.SpecialityId == 1 && t.Speciality != null && t.Speciality.Name == "Mecanico");
        Assert.Contains(result, t => t.Name == "Accidente" && t.Status == "Active" && t.SpecialityId == 3 && t.Speciality != null && t.Speciality.Name == "Seguridad");
        Assert.Contains(result, t => t.Name == "Calidad" && t.Status == "Active" && t.SpecialityId == 2 && t.Speciality != null && t.Speciality.Name == "Calidad");
        Assert.Contains(result, t => t.Name == "Otro" && t.Status == "Active" && t.SpecialityId == 4 && t.Speciality != null && t.Speciality.Name == "General");
    }

    [Fact]
    public async Task GetSeverityTypes_Authenticated_ReturnsOkAndSeededSeverityTypes()
    {
        // Arrange
        string token = await AuthenticateUserAsync("severities.tester@opscore.com");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents/severities");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<SeverityType>? result = await response.Content.ReadFromJsonAsync<List<SeverityType>>();
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.Contains(result, s => s.Name == "Alto" && s.Status == "Active");
        Assert.Contains(result, s => s.Name == "Medio" && s.Status == "Active");
        Assert.Contains(result, s => s.Name == "Bajo" && s.Status == "Active");
    }

    [Fact]
    public async Task GetSpecialities_Authenticated_ReturnsOkAndSeededSpecialities()
    {
        // Arrange
        string token = await AuthenticateUserAsync("specialities.tester@opscore.com");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/specialities");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<Speciality>? result = await response.Content.ReadFromJsonAsync<List<Speciality>>();
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
        Assert.Contains(result, s => s.Id == 1 && s.Name == "Mecanico" && s.Status == "Active");
        Assert.Contains(result, s => s.Id == 2 && s.Name == "Calidad" && s.Status == "Active");
        Assert.Contains(result, s => s.Id == 3 && s.Name == "Seguridad" && s.Status == "Active");
        Assert.Contains(result, s => s.Id == 4 && s.Name == "General" && s.Status == "Active");
    }

    [Fact]
    public async Task GetSpecialities_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/specialities");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
