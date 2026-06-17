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
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Password = "OperatorPassword123!",
            Email = "operator@opscore.com",
            Role = "Operator"
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
        var command = new RegisterCommand
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
        var command1 = new RegisterCommand
        {
            FirstName = "Jane",
            LastName = "Doe",
            Password = "Password123!",
            Email = "jane1@example.com",
            Role = "Operator"
        };

        var command2 = new RegisterCommand
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

    private class RegisterResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
    }
}
