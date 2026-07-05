using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using api.Features.Authentication.Login;
using api.Features.Authentication.Register;
using api.Features.Incidents.Close;
using api.Features.Incidents.Create;
using api.Features.Incidents.Detail;
using api.Features.Incidents.Edit;
using api.Features.Incidents.List;
using api.Features.Lookups.Common;

using Microsoft.Extensions.DependencyInjection;

namespace api.IntegrationTests.Features.Incidents;

public class IncidentIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<string> AuthenticateUserAsync(string email, string role, List<int>? areaIds = null)
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Test",
            LastName = "User",
            Password = "SecurePassword123!",
            Email = email,
            Role = role,
            AreaIds = areaIds ?? new List<int> { 1, 2, 3, 4 },
            SpecialityId = role == "Technician" ? 1 : null
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
    public async Task CreateIncident_DescriptionTooShort_ReturnsBadRequest()
    {
        // Arrange
        string token = await AuthenticateUserAsync("operator.shortdesc@opscore.com", "Operator");
        CreateIncidentCommand command = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Short desc" // 10 chars
        };
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateIncident_DescriptionTooLong_ReturnsBadRequest()
    {
        // Arrange
        string token = await AuthenticateUserAsync("operator.longdesc@opscore.com", "Operator");
        CreateIncidentCommand command = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = new string('A', 501)
        };
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
        var envelopeResult = await listResponse.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(envelopeResult);
        var listResult = envelopeResult.Items;
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
            Description = "Leaking valve in Zone North (Old)",
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
        var envelopeResult = await listResponse.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(envelopeResult);
        var listResult = envelopeResult.Items;
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

    [Fact]
    public async Task ListIncidents_RoleBasedFiltering_FiltersCorrectlyForEachRole()
    {
        // 1. Arrange & Seed
        string op1Email = "operator1.test@opscore.com";
        string op2Email = "operator2.test@opscore.com";
        string sup1Email = "supervisor1.test@opscore.com";
        string sup2Email = "supervisor2.test@opscore.com";
        string techEmail = "technician.test@opscore.com";
        string managerEmail = "manager.test@opscore.com";

        string op1Token = await AuthenticateUserAsync(op1Email, "Operator", new List<int> { 1 });
        string op2Token = await AuthenticateUserAsync(op2Email, "Operator", new List<int> { 2 });
        string sup1Token = await AuthenticateUserAsync(sup1Email, "Supervisor", new List<int> { 1 });
        string sup2Token = await AuthenticateUserAsync(sup2Email, "Supervisor", new List<int>()); // No areas
        string techToken = await AuthenticateUserAsync(techEmail, "Technician");
        string managerToken = await AuthenticateUserAsync(managerEmail, "Plant Manager");

        // Report incident as Operator 1 (Area 1)
        CreateIncidentCommand cmd1 = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Operator 1 incident report"
        };
        HttpRequestMessage req1 = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd1) };
        req1.Headers.Authorization = new AuthenticationHeaderValue("Bearer", op1Token);
        HttpResponseMessage res1 = await _client.SendAsync(req1);
        CreateIncidentResponse? incident1 = await res1.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident1);

        // Report incident as Operator 2 (Area 2)
        CreateIncidentCommand cmd2 = new CreateIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Operator 2 incident report"
        };
        HttpRequestMessage req2 = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd2) };
        req2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", op2Token);
        HttpResponseMessage res2 = await _client.SendAsync(req2);
        CreateIncidentResponse? incident2 = await res2.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident2);

        // Assign incident 1 to Technician
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            api.Features.Authentication.Common.User techUser = db.Users.First(u => u.Email == techEmail);
            api.Features.Incidents.Common.Incident incEntity1 = db.Incidents.First(i => i.IncidentId == incident1.IncidentId);
            incEntity1.AssignedToUserId = techUser.Id;
            await db.SaveChangesAsync();
        }

        // 2. Act & Assert for Operator 1 (Only sees reported by them)
        HttpRequestMessage op1Request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        op1Request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", op1Token);
        HttpResponseMessage op1Response = await _client.SendAsync(op1Request);
        var op1Envelope = await op1Response.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(op1Envelope);
        var op1Result = op1Envelope.Items;
        Assert.NotNull(op1Result);
        Assert.Contains(op1Result, x => x.IncidentId == incident1.IncidentId);
        Assert.DoesNotContain(op1Result, x => x.IncidentId == incident2.IncidentId);

        // 3. Act & Assert for Supervisor 1 (Only sees Area 1)
        HttpRequestMessage sup1Request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        sup1Request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", sup1Token);
        HttpResponseMessage sup1Response = await _client.SendAsync(sup1Request);
        var sup1Envelope = await sup1Response.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(sup1Envelope);
        var sup1Result = sup1Envelope.Items;
        Assert.NotNull(sup1Result);
        Assert.Contains(sup1Result, x => x.IncidentId == incident1.IncidentId);
        Assert.DoesNotContain(sup1Result, x => x.IncidentId == incident2.IncidentId);

        // 4. Act & Assert for Supervisor 2 (Empty list - no areas)
        HttpRequestMessage sup2Request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        sup2Request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", sup2Token);
        HttpResponseMessage sup2Response = await _client.SendAsync(sup2Request);
        var sup2Envelope = await sup2Response.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(sup2Envelope);
        var sup2Result = sup2Envelope.Items;
        Assert.NotNull(sup2Result);
        Assert.Empty(sup2Result);

        // 5. Act & Assert for Technician (Only sees assigned incident 1)
        HttpRequestMessage techRequest = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        techRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage techResponse = await _client.SendAsync(techRequest);
        var techEnvelope = await techResponse.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(techEnvelope);
        var techResult = techEnvelope.Items;
        Assert.NotNull(techResult);
        Assert.Contains(techResult, x => x.IncidentId == incident1.IncidentId);
        Assert.DoesNotContain(techResult, x => x.IncidentId == incident2.IncidentId);

        // 6. Act & Assert for Plant Manager (Sees both)
        HttpRequestMessage managerRequest = new HttpRequestMessage(HttpMethod.Get, "/api/incidents");
        managerRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", managerToken);
        HttpResponseMessage managerResponse = await _client.SendAsync(managerRequest);
        var managerEnvelope = await managerResponse.Content.ReadFromJsonAsync<IncidentListResponse>();
        Assert.NotNull(managerEnvelope);
        var managerResult = managerEnvelope.Items;
        Assert.NotNull(managerResult);
        Assert.Contains(managerResult, x => x.IncidentId == incident1.IncidentId);
        Assert.Contains(managerResult, x => x.IncidentId == incident2.IncidentId);
    }

    [Fact]
    public async Task StartIncident_AsAssignedTechnician_TransitionsStatusToInProgressAndLogsHistory()
    {
        // 1. Arrange & Seed
        string techEmail = "tech.start@opscore.com";
        string techToken = await AuthenticateUserAsync(techEmail, "Technician");

        string supervisorEmail = "sup.start@opscore.com";
        string supervisorToken = await AuthenticateUserAsync(supervisorEmail, "Supervisor");

        // Create incident
        CreateIncidentCommand cmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident to be started"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd) };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supervisorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? incident = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident);

        // Assign to tech
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            api.Features.Authentication.Common.User techUser = db.Users.First(u => u.Email == techEmail);
            api.Features.Incidents.Common.Incident incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.AssignedToUserId = techUser.Id;
            incEntity.Status = "Assigned";
            await db.SaveChangesAsync();
        }

        // 2. Act
        HttpRequestMessage startRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/incidents/{incident.IncidentId}/start");
        startRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage startResponse = await _client.SendAsync(startRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);

        // Fetch detail to verify status and history
        HttpRequestMessage detailRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/incidents/{incident.IncidentId}");
        detailRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage detailResponse = await _client.SendAsync(detailRequest);
        IncidentDetailResponse? detailResult = await detailResponse.Content.ReadFromJsonAsync<IncidentDetailResponse>();

        Assert.NotNull(detailResult);
        Assert.Equal("In-Progress", detailResult.Status);

        // Verify history logs
        Assert.Contains(detailResult.History, h => h.NewStatus == "In-Progress" && h.PreviousStatus == "Assigned");
    }

    [Fact]
    public async Task StartIncident_AsUnassignedTechnician_ReturnsValidationProblem()
    {
        // Arrange
        string techEmail1 = "tech1.start@opscore.com";
        string techToken1 = await AuthenticateUserAsync(techEmail1, "Technician");

        string techEmail2 = "tech2.start@opscore.com";
        string techToken2 = await AuthenticateUserAsync(techEmail2, "Technician");

        string supervisorEmail = "sup2.start@opscore.com";
        string supervisorToken = await AuthenticateUserAsync(supervisorEmail, "Supervisor");

        // Create incident
        CreateIncidentCommand cmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident assigned to someone else"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd) };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supervisorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? incident = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident);

        // Assign to tech1
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            api.Features.Authentication.Common.User techUser = db.Users.First(u => u.Email == techEmail1);
            api.Features.Incidents.Common.Incident incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.AssignedToUserId = techUser.Id;
            incEntity.Status = "Assigned";
            await db.SaveChangesAsync();
        }

        // Act - Try to start with tech2
        HttpRequestMessage startRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/incidents/{incident.IncidentId}/start");
        startRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken2);
        HttpResponseMessage startResponse = await _client.SendAsync(startRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, startResponse.StatusCode);
    }

    [Fact]
    public async Task ListRootCauseTypes_ReturnsActiveRootCauses()
    {
        // Arrange
        string token = await AuthenticateUserAsync("user.lookups@opscore.com", "Operator");
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/api/incidents/root-cause-types");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<RootCauseType>>();
        Assert.NotNull(result);
        Assert.Equal(5, result.Count);
        Assert.Contains(result, r => r.Name == "Error de operación");
        Assert.Contains(result, r => r.Name == "Causa no determinada");
    }

    [Fact]
    public async Task CloseIncident_SuccessfulFlow_UpdatesIncidentAndLogsHistory()
    {
        // Arrange
        string techEmail = "tech.close@opscore.com";
        string techToken = await AuthenticateUserAsync(techEmail, "Technician");
        string supervisorToken = await AuthenticateUserAsync("supervisor.close@opscore.com", "Supervisor");

        // Create incident
        CreateIncidentCommand cmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident to close by technician"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd) };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supervisorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        string resString = await createRes.Content.ReadAsStringAsync();
        Console.WriteLine($"DEBUG RESPONSE: {resString}");
        CreateIncidentResponse? incident = System.Text.Json.JsonSerializer.Deserialize<CreateIncidentResponse>(resString, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(incident);

        // Assign to technician and set In-Progress
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            var techUser = db.Users.First(u => u.Email == techEmail);
            var incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.AssignedToUserId = techUser.Id;
            incEntity.Status = "In-Progress";
            await db.SaveChangesAsync();
        }

        CloseIncidentCommand closeCmd = new CloseIncidentCommand
        {
            SolutionApplied = "Replaced faulty valve with a new one.",
            RootCauseTypeId = 2 // Falla o desgaste de componente
        };

        // Act
        HttpRequestMessage closeReq = new HttpRequestMessage(HttpMethod.Post, $"/api/incidents/{incident.IncidentId}/close")
        {
            Content = JsonContent.Create(closeCmd)
        };
        closeReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage closeResponse = await _client.SendAsync(closeReq);

        // Assert
        Assert.Equal(HttpStatusCode.OK, closeResponse.StatusCode);

        // Fetch detail to verify status, solution, root cause and history
        HttpRequestMessage detailRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/incidents/{incident.IncidentId}");
        detailRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage detailResponse = await _client.SendAsync(detailRequest);

        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            var incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            Assert.Equal("Closed", incEntity.Status);
            Assert.Equal(closeCmd.SolutionApplied, incEntity.SolutionApplied);
            Assert.Equal(closeCmd.RootCauseTypeId, incEntity.RootCauseTypeId);
        }

        IncidentDetailResponse? detailResult = await detailResponse.Content.ReadFromJsonAsync<IncidentDetailResponse>();
        Assert.NotNull(detailResult);
        Assert.Equal("Closed", detailResult.Status);
        Assert.Contains(detailResult.History, h => h.NewStatus == "Closed" && h.PreviousStatus == "In-Progress");
    }

    [Fact]
    public async Task CloseIncident_InvalidRootCauseOrUnassigned_ReturnsBadRequest()
    {
        // Arrange
        string techEmail = "tech.closeinvalid@opscore.com";
        string techToken = await AuthenticateUserAsync(techEmail, "Technician");
        string supervisorToken = await AuthenticateUserAsync("supervisor.closeinvalid@opscore.com", "Supervisor");

        // Create incident
        CreateIncidentCommand cmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident to try closing"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents") { Content = JsonContent.Create(cmd) };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supervisorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? incident = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(incident);

        // Case 1: Close without assigning (not assigned to you)
        CloseIncidentCommand closeCmd = new CloseIncidentCommand
        {
            SolutionApplied = "Some solution",
            RootCauseTypeId = 1
        };
        HttpRequestMessage closeReq1 = new HttpRequestMessage(HttpMethod.Post, $"/api/incidents/{incident.IncidentId}/close")
        {
            Content = JsonContent.Create(closeCmd)
        };
        closeReq1.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage closeResponse1 = await _client.SendAsync(closeReq1);
        Assert.Equal(HttpStatusCode.BadRequest, closeResponse1.StatusCode);

        // Assign to technician
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            var techUser = db.Users.First(u => u.Email == techEmail);
            var incEntity = db.Incidents.First(i => i.IncidentId == incident.IncidentId);
            incEntity.AssignedToUserId = techUser.Id;
            incEntity.Status = "In-Progress";
            await db.SaveChangesAsync();
        }

        // Case 2: Close with invalid root cause type ID (e.g. 99)
        CloseIncidentCommand invalidCloseCmd = new CloseIncidentCommand
        {
            SolutionApplied = "Some solution",
            RootCauseTypeId = 99
        };
        HttpRequestMessage closeReq2 = new HttpRequestMessage(HttpMethod.Post, $"/api/incidents/{incident.IncidentId}/close")
        {
            Content = JsonContent.Create(invalidCloseCmd)
        };
        closeReq2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);
        HttpResponseMessage closeResponse2 = await _client.SendAsync(closeReq2);
        Assert.Equal(HttpStatusCode.BadRequest, closeResponse2.StatusCode);
    }

    [Fact]
    public async Task EditIncident_ValidPayloadByCreator_ReturnsOkWithUpdatedData()
    {
        // Arrange — create incident as operator
        string operatorToken = await AuthenticateUserAsync("operator.edit.happy@opscore.com", "Operator");

        CreateIncidentCommand createCmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Original incident description that is long enough"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(createCmd)
        };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", operatorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? created = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(created);

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Updated incident description that is long enough to be valid"
        };
        HttpRequestMessage editReq = new HttpRequestMessage(HttpMethod.Put, $"/api/incidents/{created.IncidentId}")
        {
            Content = JsonContent.Create(editCmd)
        };
        editReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", operatorToken);

        // Act
        HttpResponseMessage editRes = await _client.SendAsync(editReq);

        // Assert
        Assert.Equal(HttpStatusCode.OK, editRes.StatusCode);
        EditIncidentResponse? updated = await editRes.Content.ReadFromJsonAsync<EditIncidentResponse>();
        Assert.NotNull(updated);
        Assert.Equal(created.IncidentId, updated.IncidentId);
        Assert.Equal(editCmd.Description, updated.Description);
        Assert.Equal(editCmd.AreaId, updated.AreaId);
        Assert.Equal(editCmd.IncidentTypeId, updated.IncidentTypeId);
        Assert.Equal(editCmd.SeverityTypeId, updated.SeverityTypeId);
        Assert.Equal("Open", updated.Status);
    }

    [Fact]
    public async Task EditIncident_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Trying to edit without a token"
        };
        var response = await _client.PutAsJsonAsync("/api/incidents/INC-0001", editCmd);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task EditIncident_AsTechnician_ReturnsForbidden()
    {
        // Arrange
        string techToken = await AuthenticateUserAsync("technician.edit@opscore.com", "Technician");

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Technician should not be able to edit incidents"
        };
        HttpRequestMessage req = new HttpRequestMessage(HttpMethod.Put, "/api/incidents/INC-0001")
        {
            Content = JsonContent.Create(editCmd)
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", techToken);

        // Act
        var response = await _client.SendAsync(req);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task EditIncident_NonExistentIncident_ReturnsNotFound()
    {
        // Arrange
        string token = await AuthenticateUserAsync("operator.edit.notfound@opscore.com", "Operator");

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Editing an incident that does not exist anywhere"
        };
        HttpRequestMessage req = new HttpRequestMessage(HttpMethod.Put, "/api/incidents/INC-9999")
        {
            Content = JsonContent.Create(editCmd)
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(req);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EditIncident_DescriptionTooShort_ReturnsBadRequest()
    {
        // Arrange
        string token = await AuthenticateUserAsync("operator.edit.shortdesc@opscore.com", "Operator");

        CreateIncidentCommand createCmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Valid description for the initial report"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(createCmd)
        };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? created = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(created);

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Too short" // < 20 chars
        };
        HttpRequestMessage editReq = new HttpRequestMessage(HttpMethod.Put, $"/api/incidents/{created.IncidentId}")
        {
            Content = JsonContent.Create(editCmd)
        };
        editReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(editReq);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EditIncident_DifferentUserThanCreator_ReturnsBadRequest()
    {
        // Arrange — incident created by user A, edit attempted by user B
        string creatorToken = await AuthenticateUserAsync("operator.edit.creator@opscore.com", "Operator");
        string otherToken = await AuthenticateUserAsync("operator.edit.other@opscore.com", "Operator");

        CreateIncidentCommand createCmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident created by a specific operator user"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(createCmd)
        };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", creatorToken);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? created = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(created);

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Trying to edit someone else's incident report"
        };
        HttpRequestMessage editReq = new HttpRequestMessage(HttpMethod.Put, $"/api/incidents/{created.IncidentId}")
        {
            Content = JsonContent.Create(editCmd)
        };
        editReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", otherToken);

        // Act
        HttpResponseMessage editRes = await _client.SendAsync(editReq);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, editRes.StatusCode);
    }

    [Fact]
    public async Task EditIncident_IncidentNotOpen_ReturnsBadRequest()
    {
        // Arrange — create, then manually set status to Assigned
        string token = await AuthenticateUserAsync("operator.edit.notopen@opscore.com", "Operator");

        CreateIncidentCommand createCmd = new CreateIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "Incident that will be moved to Assigned status"
        };
        HttpRequestMessage createReq = new HttpRequestMessage(HttpMethod.Post, "/api/incidents")
        {
            Content = JsonContent.Create(createCmd)
        };
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        HttpResponseMessage createRes = await _client.SendAsync(createReq);
        CreateIncidentResponse? created = await createRes.Content.ReadFromJsonAsync<CreateIncidentResponse>();
        Assert.NotNull(created);

        // Move status out of Open
        using (IServiceScope scope = _factory.Services.CreateScope())
        {
            api.Data.AppDbContext db = scope.ServiceProvider.GetRequiredService<api.Data.AppDbContext>();
            api.Features.Incidents.Common.Incident incEntity = db.Incidents.First(i => i.IncidentId == created.IncidentId);
            incEntity.Status = "Assigned";
            await db.SaveChangesAsync();
        }

        EditIncidentCommand editCmd = new EditIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Trying to edit an incident that is no longer open"
        };
        HttpRequestMessage editReq = new HttpRequestMessage(HttpMethod.Put, $"/api/incidents/{created.IncidentId}")
        {
            Content = JsonContent.Create(editCmd)
        };
        editReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        HttpResponseMessage editRes = await _client.SendAsync(editReq);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, editRes.StatusCode);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
