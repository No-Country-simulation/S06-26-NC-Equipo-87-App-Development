using System.Net;

namespace api.IntegrationTests;

public class HealthCheckTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;

    [Fact]
    public async Task Get_Health_ReturnsOkAndHealthy()
    {
        // Arrange
        var client = _factory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(5);

        // Act
        var response = await client.GetAsync("/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(response.Content.Headers.ContentType);
        Assert.Contains("text/plain", response.Content.Headers.ContentType.ToString());
        string content = await response.Content.ReadAsStringAsync();
        Assert.Equal("Healthy", content);
    }
}
