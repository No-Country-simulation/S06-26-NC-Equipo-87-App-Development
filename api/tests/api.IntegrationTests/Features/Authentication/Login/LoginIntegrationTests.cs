using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using api.Features.Authentication.Login;
using api.Features.Authentication.Register;

using Microsoft.AspNetCore.Mvc;

namespace api.IntegrationTests.Features.Authentication.Login;

public class LoginIntegrationTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Login_ValidEmailAndPassword_ReturnsOkWithToken()
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Alice",
            LastName = "Smith",
            Password = "SupervisorPassword1!",
            Email = "alice.smith@opscore.com",
            Role = "Supervisor"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = "alice.smith@opscore.com",
            Password = "SupervisorPassword1!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var result = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result.Token));
    }

    [Fact]
    public async Task Login_ValidEmployeeIdAndPassword_ReturnsOkWithToken()
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Bob",
            LastName = "Jones",
            Password = "OperatorPassword1!",
            Email = "bob.jones@opscore.com",
            Role = "Operator"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);
        var regResult = await registerResponse.Content.ReadFromJsonAsync<RegisterResponseDto>();
        Assert.NotNull(regResult);
        Assert.False(string.IsNullOrEmpty(regResult.EmployeeId));

        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = regResult.EmployeeId,
            Password = "OperatorPassword1!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var result = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result.Token));
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsBadRequestWithProblemDetails()
    {
        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = "nonexistent@opscore.com",
            Password = "WrongPassword!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        Assert.Equal(HttpStatusCode.BadRequest, loginResponse.StatusCode);

        var problem = await loginResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Equal(400, problem.Status);
        Assert.Contains("Identifier", problem.Errors.Keys);
    }

    [Fact]
    public async Task Logout_ValidToken_RevokesTokenAndSubsequentRequestFails()
    {
        RegisterCommand registerCommand = new RegisterCommand
        {
            FirstName = "Charlie",
            LastName = "Brown",
            Password = "TechnicianPassword1!",
            Email = "charlie.brown@opscore.com",
            Role = "Technician"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/authentication/register", registerCommand);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        LoginCommand loginCommand = new LoginCommand
        {
            Identifier = "charlie.brown@opscore.com",
            Password = "TechnicianPassword1!"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", loginCommand);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.NotNull(loginResult);

        HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/logout");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.Token);
        var logoutResponse = await _client.SendAsync(requestMessage);
        Assert.Equal(HttpStatusCode.OK, logoutResponse.StatusCode);

        HttpRequestMessage requestMessageAfterLogout = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/logout");
        requestMessageAfterLogout.Headers.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.Token);
        var secondLogoutResponse = await _client.SendAsync(requestMessageAfterLogout);
        Assert.Equal(HttpStatusCode.Unauthorized, secondLogoutResponse.StatusCode);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
    }

    private class RegisterResponseDto
    {
        public string EmployeeId { get; set; } = string.Empty;
    }
}
