using api.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace api.IntegrationTests.Features.Incidents;

public class DatabaseSchemaTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly IntegrationTestFactory _factory = factory;

    [Fact]
    public async Task DatabaseSchema_WhenInitialized_HasSeededLookupValues()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Act
        var areas = await context.Areas.ToListAsync();
        var types = await context.IncidentTypes.ToListAsync();
        var severities = await context.SeverityTypes.ToListAsync();

        // Assert
        Assert.Equal(4, areas.Count);
        Assert.Contains(areas, a => a.Name == "Zona Norte" && a.Status == "Active");
        Assert.Contains(areas, a => a.Name == "Línea 3" && a.Status == "Active");
        Assert.Contains(areas, a => a.Name == "Almacén" && a.Status == "Active");
        Assert.Contains(areas, a => a.Name == "Calidad" && a.Status == "Active");

        Assert.Equal(4, types.Count);
        Assert.Contains(types, t => t.Name == "Falla mecánica" && t.Status == "Active");
        Assert.Contains(types, t => t.Name == "Accidente" && t.Status == "Active");
        Assert.Contains(types, t => t.Name == "Calidad" && t.Status == "Active");
        Assert.Contains(types, t => t.Name == "Otro" && t.Status == "Active");

        Assert.Equal(3, severities.Count);
        Assert.Contains(severities, s => s.Name == "Alto" && s.Status == "Active");
        Assert.Contains(severities, s => s.Name == "Medio" && s.Status == "Active");
        Assert.Contains(severities, s => s.Name == "Bajo" && s.Status == "Active");
    }
}
