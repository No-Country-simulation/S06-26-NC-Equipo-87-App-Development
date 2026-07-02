using System.Net;
using System.Net.Http.Json;

using api.Features.Authentication.Register;

using Microsoft.AspNetCore.Mvc;

namespace api.IntegrationTests.Features.Authentication.Register;

public class RegisterIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Register_ValidPayload_ReturnsCreatedAndUserData()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Password = "OperatorPassword123!",
            Email = "operator@opscore.com",
            Role = "Operator",
            AreaIds = new List<int> { 1, 2 },
            ShiftId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.NotNull(result);

        Assert.False(string.IsNullOrEmpty(result.UserId));
        Assert.Equal("johdoe", result.Username);
        Assert.False(string.IsNullOrEmpty(result.EmployeeId));
        Assert.Equal(command.Email, result.Email);
        Assert.Equal(command.FirstName, result.FirstName);
        Assert.Equal(command.LastName, result.LastName);
        Assert.Equal(command.Role, result.Role);
        Assert.Equal(command.AreaIds, result.AreaIds);
        Assert.Equal(command.ShiftId, result.ShiftId);
    }

    [Theory]
    [InlineData("", "Doe", "Password123!", "test@example.com", "Operator", "FirstName")]
    [InlineData("John", "", "Password123!", "test@example.com", "Operator", "LastName")]
    [InlineData("John", "Doe", "", "test@example.com", "Operator", "Password")]
    [InlineData("John", "Doe", "pwd", "test@example.com", "Operator", "Password")]
    [InlineData("John", "Doe", "Password123!", "invalid-email", "Operator", "Email")]
    [InlineData("John", "Doe", "Password123!", "test@example.com", "", "Role")]
    [InlineData("John", "Doe", "Password123!", "test@example.com", "NonExistentRole", "Role")]
    public async Task Register_InvalidPayload_ReturnsBadRequestWithProblemDetails(
        string firstName, string lastName, string password, string email, string role, string expectedErrorKey)
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = firstName,
            LastName = lastName,
            Password = password,
            Email = email,
            Role = role
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Equal(400, problem.Status);
        Assert.Contains(expectedErrorKey, problem.Errors.Keys);
    }

    [Fact]
    public async Task Register_NameCollisionAndMultipleUsers_AutogeneratesUniqueUsernamesAndSequentialEmployeeIds()
    {
        // Arrange
        RegisterCommand command1 = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "Password123!",
            Email = "jane1@example.com",
            Role = "Operator"
        };

        RegisterCommand command2 = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "Password123!",
            Email = "jane2@example.com",
            Role = "Supervisor"
        };

        // Act
        var response1 = await _client.PostAsJsonAsync("/api/authentication/register", command1);
        Assert.Equal(HttpStatusCode.Created, response1.StatusCode);
        var result1 = await response1.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.NotNull(result1);
        Assert.Equal("jandoe", result1.Username);

        var response2 = await _client.PostAsJsonAsync("/api/authentication/register", command2);
        Assert.Equal(HttpStatusCode.Created, response2.StatusCode);
        var result2 = await response2.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.NotNull(result2);

        // Assert
        Assert.Equal("jandoe1", result2.Username);

        int id1 = int.Parse(result1.EmployeeId);
        int id2 = int.Parse(result2.EmployeeId);
        Assert.Equal(id1 + 1, id2);
    }

    [Fact]
    public async Task Register_InvalidAreaId_ReturnsBadRequestWithValidationMessage()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Password = "OperatorPassword123!",
            Email = "invalidarea@opscore.com",
            Role = "Operator",
            AreaIds = new List<int> { 999 }
        };

        // Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        ValidationProblemDetails? problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Contains("AreaIds", problem.Errors.Keys);
        Assert.Equal("All assigned areas must exist and be active.", problem.Errors["AreaIds"][0]);
    }

    [Fact]
    public async Task Register_InvalidShiftId_ReturnsBadRequestWithValidationMessage()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Password = "OperatorPassword123!",
            Email = "invalidshift@opscore.com",
            Role = "Operator",
            ShiftId = 999
        };

        // Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        ValidationProblemDetails? problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Contains("ShiftId", problem.Errors.Keys);
        Assert.Equal("Shift must exist and be active.", problem.Errors["ShiftId"][0]);
    }

    [Fact]
    public async Task Login_UserWithAreaAndShift_TokenContainsClaims()
    {
        // Arrange
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Test",
            LastName = "User",
            Password = "UserPassword1!",
            Email = "testuser@opscore.com",
            Role = "Operator",
            AreaIds = new List<int> { 1, 2 },
            ShiftId = 1
        };
        HttpResponseMessage registerResponse = await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        object loginCommand = new
        {
            Identifier = "testuser@opscore.com",
            Password = "UserPassword1!"
        };

        // Act
        HttpResponseMessage loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);

        // Assert
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        LoginResponse? loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(loginResult);

        System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtToken = tokenHandler.ReadJwtToken(loginResult.Token);
        string? shiftClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "shiftId")?.Value;
        string? shiftNameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "shiftName")?.Value;
        List<string> areaClaims = jwtToken.Claims.Where(c => c.Type == "areaId").Select(c => c.Value).ToList();
        List<string> areaNameClaims = jwtToken.Claims.Where(c => c.Type == "areaName").Select(c => c.Value).ToList();
        Assert.Contains("1", areaClaims);
        Assert.Contains("2", areaClaims);
        Assert.Contains("Zona Norte", areaNameClaims);
        Assert.Contains("Línea 3", areaNameClaims);
        Assert.Equal("1", shiftClaim);
        Assert.Equal("Matutino", shiftNameClaim);
    }

    [Fact]
    public async Task Register_TechnicianWithValidSpeciality_ReturnsCreated()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "TechPassword123!",
            Email = "tech@opscore.com",
            Role = "Technician",
            AreaIds = new List<int> { 1 },
            ShiftId = 1,
            SpecialityId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.NotNull(result);
        Assert.Equal(1, result.SpecialityId);
    }

    [Fact]
    public async Task Register_TechnicianWithoutSpeciality_ReturnsBadRequest()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "TechPassword123!",
            Email = "technospec@opscore.com",
            Role = "Technician",
            AreaIds = new List<int> { 1 },
            ShiftId = 1,
            SpecialityId = null
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Contains("SpecialityId", problem.Errors.Keys);
        Assert.Equal("Speciality is required for technicians.", problem.Errors["SpecialityId"][0]);
    }

    [Fact]
    public async Task Register_WithInvalidSpecialityId_ReturnsBadRequest()
    {
        // Arrange
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "TechPassword123!",
            Email = "techbadspec@opscore.com",
            Role = "Technician",
            AreaIds = new List<int> { 1 },
            ShiftId = 1,
            SpecialityId = 999
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/authentication/register", command);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Contains("SpecialityId", problem.Errors.Keys);
        Assert.Equal("Speciality must exist and be active.", problem.Errors["SpecialityId"][0]);
    }

    private class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
    }

    private class RegisterResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public List<int> AreaIds { get; set; } = new();
        public int? ShiftId { get; set; }
        public int? SpecialityId { get; set; }
    }
}
