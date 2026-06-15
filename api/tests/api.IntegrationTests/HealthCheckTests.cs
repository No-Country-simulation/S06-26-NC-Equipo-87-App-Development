using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace api.IntegrationTests
{
    public class HealthCheckTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public HealthCheckTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

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
            var content = await response.Content.ReadAsStringAsync();
            Assert.Equal("Healthy", content);
        }
    }
}
