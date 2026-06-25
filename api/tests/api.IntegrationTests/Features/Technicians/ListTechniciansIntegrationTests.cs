using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using api.Features.Authentication.Login;
using api.Features.Authentication.Register;
using api.Features.Incidents.Create;
using api.Features.Technicians.List;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace api.IntegrationTests.Features.Technicians;

public class ListTechniciansIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<string> AuthenticateUserAsync(string email, string role, List<int>? areaIds = null, int? specialityId = null)
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Test",
            LastName = "User",
            Password = "SecurePassword123!",
            Email = email,
            Role = role,
            AreaIds = areaIds ?? new List<int> { 1, 2, 3, 4 },
            SpecialityId = role == "Technician" ? (specialityId ?? 1) : null
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
    public async Task ListTechnicians_NoFilters_ReturnsAllTechniciansAndRequestedFields()
    {
        // Arrange
        string opEmail = "operator.list@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        string tech1Email = "tech1.list@opscore.com";
        string tech2Email = "tech2.list@opscore.com";
        await AuthenticateUserAsync(tech1Email, "Technician", specialityId: 1); // Mecanico
        await AuthenticateUserAsync(tech2Email, "Technician", specialityId: 2); // Calidad

        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/technicians");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<TechnicianResponse>? result = await response.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result);
        Assert.True(result.Count >= 2);

        // Verify the response DTO structure matches exactly
        var tech1 = result.FirstOrDefault(t => t.SpecialityId == 1);
        Assert.NotNull(tech1);
        Assert.NotEmpty(tech1.UserId);
        Assert.Equal("Test", tech1.FirstName);
        Assert.Equal("User", tech1.LastName);
        Assert.Equal(1, tech1.SpecialityId);
        Assert.Equal("Mecanico", tech1.SpecialityName);
        Assert.True(tech1.IsFree);
    }

    [Fact]
    public async Task ListTechnicians_FilterByArea_ReturnsOnlyTechniciansInThatArea()
    {
        // Arrange
        string opEmail = "operator.area@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        // techArea1 is assigned only to Area 1
        string techArea1Email = "tech.area1@opscore.com";
        await AuthenticateUserAsync(techArea1Email, "Technician", areaIds: new List<int> { 1 });

        // techArea2 is assigned only to Area 2
        string techArea2Email = "tech.area2@opscore.com";
        await AuthenticateUserAsync(techArea2Email, "Technician", areaIds: new List<int> { 2 });

        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/technicians?areaId=1");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<TechnicianResponse>? result = await response.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result);
        Assert.Contains(result, t => t.FirstName == "Test" && t.LastName == "User" && t.SpecialityId == 1);
        // Let's check using DB context to ensure techArea2 is excluded
        using IServiceScope scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
        var techUser2 = db.Users.First(u => u.Email == techArea2Email);
        Assert.DoesNotContain(result, t => t.UserId == techUser2.Id);
    }

    [Fact]
    public async Task ListTechnicians_FilterBySpeciality_ReturnsOnlyMatchingTechnicians()
    {
        // Arrange
        string opEmail = "operator.spec@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        string techSpec2Email = "tech.spec2@opscore.com";
        await AuthenticateUserAsync(techSpec2Email, "Technician", specialityId: 2); // Calidad

        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/technicians?specialityId=2");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<TechnicianResponse>? result = await response.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result);
        Assert.All(result, t => Assert.Equal(2, t.SpecialityId));
        Assert.Contains(result, t => t.SpecialityName == "Calidad");
    }

    [Fact]
    public async Task ListTechnicians_FilterByIncidentType_ReturnsOnlyMatchingTechnicians()
    {
        // Arrange
        string opEmail = "operator.incidenttype@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        // IncidentType 1 maps to Speciality 1 (Mecanico)
        string techMecEmail = "tech.mec@opscore.com";
        await AuthenticateUserAsync(techMecEmail, "Technician", specialityId: 1); // Mecanico

        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/technicians?incidentTypeId=1");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        List<TechnicianResponse>? result = await response.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result);
        Assert.All(result, t => Assert.Equal(1, t.SpecialityId));
        Assert.Contains(result, t => t.SpecialityName == "Mecanico");
    }

    [Fact]
    public async Task ListTechnicians_InvalidIncidentTypeId_ReturnsBadRequest()
    {
        // Arrange
        string opEmail = "operator.invalidit@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/technicians?incidentTypeId=999");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);

        // Act
        HttpResponseMessage response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        ValidationProblemDetails? problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Contains("incidentTypeId", problem.Errors.Keys);
        Assert.Equal("Incident type with ID 999 does not exist.", problem.Errors["incidentTypeId"][0]);
    }

    [Fact]
    public async Task ListTechnicians_AvailabilityIsComputedCorrectly()
    {
        // Arrange
        string opEmail = "operator.availability@opscore.com";
        string opToken = await AuthenticateUserAsync(opEmail, "Operator");

        string techEmail = "tech.availability@opscore.com";
        string techToken = await AuthenticateUserAsync(techEmail, "Technician");

        // Initially, the technician should be free
        HttpRequestMessage request1 = new HttpRequestMessage(HttpMethod.Get, "/api/technicians");
        request1.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);
        HttpResponseMessage response1 = await _client.SendAsync(request1);
        List<TechnicianResponse>? result1 = await response1.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result1);
        var techResponse1 = result1.First(t => t.SpecialityName == "Mecanico" && t.FirstName == "Test");
        Assert.True(techResponse1.IsFree);

        // Create an incident and assign it to the technician
        CreateIncidentCommand cmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident for availability check"
        };
        HttpRequestMessage createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd) };
        createRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);
        HttpResponseMessage createResponse = await _client.SendAsync(createRequest);
        CreateIncidentResponse? incident = await createResponse.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident);

        {
            using IServiceScope scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            var techUser = db.Users.First(u => u.Email == techEmail);
            var incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.AssignedToUserId = techUser.Id;
            await db.SaveChangesAsync();
        }

        // Now, the technician should not be free
        HttpRequestMessage request2 = new HttpRequestMessage(HttpMethod.Get, "/api/technicians");
        request2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);
        HttpResponseMessage response2 = await _client.SendAsync(request2);
        List<TechnicianResponse>? result2 = await response2.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result2);
        var techResponse2 = result2.First(t => t.UserId == techResponse1.UserId);
        Assert.False(techResponse2.IsFree);

        // Close the incident
        {
            using IServiceScope scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            var incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.Status = "Closed";
            await db.SaveChangesAsync();
        }

        // The technician should be free again
        HttpRequestMessage request3 = new HttpRequestMessage(HttpMethod.Get, "/api/technicians");
        request3.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opToken);
        HttpResponseMessage response3 = await _client.SendAsync(request3);
        List<TechnicianResponse>? result3 = await response3.Content.ReadFromJsonAsync<List<TechnicianResponse>>();
        Assert.NotNull(result3);
        var techResponse3 = result3.First(t => t.UserId == techResponse1.UserId);
        Assert.True(techResponse3.IsFree);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
