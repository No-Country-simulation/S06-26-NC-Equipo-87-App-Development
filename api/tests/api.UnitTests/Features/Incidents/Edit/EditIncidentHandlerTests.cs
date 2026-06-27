using System.Security.Claims;

using api.Data;
using api.Features.Incidents.Common;
using api.Features.Incidents.Edit;
using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using Moq;

namespace api.UnitTests.Features.Incidents.Edit;

public class EditIncidentHandlerTests
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly EditIncidentHandler _handler;

    public EditIncidentHandlerTests()
    {
        DbContextOptions<AppDbContext> options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _dbContext = new AppDbContext(options);

        _dbContext.Areas.AddRange(
            new Area { Id = 1, Name = "Zona Norte", Status = "Active" },
            new Area { Id = 2, Name = "Línea 3", Status = "Active" }
        );
        _dbContext.IncidentTypes.AddRange(
            new IncidentType { Id = 1, Name = "Falla mecánica", Status = "Active", SpecialityId = 1 },
            new IncidentType { Id = 2, Name = "Accidente", Status = "Active", SpecialityId = 1 }
        );
        _dbContext.SeverityTypes.AddRange(
            new SeverityType { Id = 1, Name = "Alto", Status = "Active" },
            new SeverityType { Id = 2, Name = "Medio", Status = "Active" }
        );
        _dbContext.Specialities.Add(new Speciality { Id = 1, Name = "Mecanico", Status = "Active" });
        _dbContext.SaveChanges();

        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _handler = new EditIncidentHandler(_dbContext, _httpContextAccessorMock.Object);
    }

    private void SetAuthenticatedUser(string userId)
    {
        List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        };
        ClaimsIdentity identity = new ClaimsIdentity(claims, "Test");
        ClaimsPrincipal principal = new ClaimsPrincipal(identity);
        DefaultHttpContext httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
    }

    private void SetUnauthenticatedContext()
    {
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);
    }

    private Incident SeedOpenIncident(string incidentId, string creatorId)
    {
        Incident incident = new Incident
        {
            IncidentId = incidentId,
            Description = "Original description for the incident test case",
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Status = "Open"
        };
        IncidentStatusHistory history = new IncidentStatusHistory
        {
            IncidentId = incidentId,
            PreviousStatus = null,
            NewStatus = "Open",
            TransitionNotes = "Initial report",
            ChangedByUserId = creatorId,
            ChangedDate = DateTimeOffset.UtcNow.AddMinutes(-10)
        };
        _dbContext.Incidents.Add(incident);
        _dbContext.IncidentStatusHistories.Add(history);
        _dbContext.SaveChanges();
        return incident;
    }

    private static EditIncidentCommand ValidCommand()
    {
        return new EditIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Updated description that is long enough to pass validation"
        };
    }

    [Fact]
    public async Task HandleAsync_NullHttpContext_ReturnsNotAuthenticated()
    {
        // Arrange
        SetUnauthenticatedContext();

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0001", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("User is not authenticated.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_MissingNameIdentifierClaim_ReturnsUserIdMissing()
    {
        // Arrange
        ClaimsIdentity identityWithNoSubjectClaim = new ClaimsIdentity(new List<Claim>(), "Test");
        ClaimsPrincipal principal = new ClaimsPrincipal(identityWithNoSubjectClaim);
        DefaultHttpContext httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0001", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("User ID claim is missing.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_IncidentDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        SetAuthenticatedUser("user-1");

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-9999", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Contains("not found", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_IncidentIsAssigned_ReturnsStatusError()
    {
        // Arrange
        const string creatorId = "user-creator";
        SetAuthenticatedUser(creatorId);
        Incident incident = SeedOpenIncident("INC-0010", creatorId);
        incident.Status = "Assigned";
        _dbContext.SaveChanges();

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0010", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Incident can only be edited while it is in Open status.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_IncidentIsInProgress_ReturnsStatusError()
    {
        // Arrange
        const string creatorId = "user-creator-2";
        SetAuthenticatedUser(creatorId);
        Incident incident = SeedOpenIncident("INC-0011", creatorId);
        incident.Status = "In-Progress";
        _dbContext.SaveChanges();

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0011", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Incident can only be edited while it is in Open status.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_IncidentIsClosed_ReturnsStatusError()
    {
        // Arrange
        const string creatorId = "user-creator-3";
        SetAuthenticatedUser(creatorId);
        Incident incident = SeedOpenIncident("INC-0012", creatorId);
        incident.Status = "Closed";
        _dbContext.SaveChanges();

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0012", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Incident can only be edited while it is in Open status.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_DifferentUserThanCreator_ReturnsForbiddenMessage()
    {
        // Arrange
        const string incidentCreatorId = "user-a";
        const string differentUserId = "user-b";
        SeedOpenIncident("INC-0020", incidentCreatorId);
        SetAuthenticatedUser(differentUserId);

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0020", ValidCommand());

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Only the user who created this incident can edit it.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_ValidCreatorAndOpenIncident_ReturnsSuccessAndUpdatesFields()
    {
        // Arrange
        const string creatorId = "user-owner";
        SeedOpenIncident("INC-0030", creatorId);
        SetAuthenticatedUser(creatorId);

        EditIncidentCommand command = new EditIncidentCommand
        {
            AreaId = 2,
            IncidentTypeId = 2,
            SeverityTypeId = 2,
            Description = "Updated description that is long enough to satisfy the validation rule"
        };

        // Act
        EditIncidentResult result = await _handler.HandleAsync("INC-0030", command);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Null(result.ErrorMessage);
        Assert.NotNull(result.Response);
        Assert.Equal("INC-0030", result.Response.IncidentId);
        Assert.Equal(command.Description, result.Response.Description);
        Assert.Equal(command.AreaId, result.Response.AreaId);
        Assert.Equal(command.IncidentTypeId, result.Response.IncidentTypeId);
        Assert.Equal(command.SeverityTypeId, result.Response.SeverityTypeId);
        Assert.Equal("Open", result.Response.Status);

        Incident? updatedIncident = await _dbContext.Incidents.FindAsync("INC-0030");
        Assert.NotNull(updatedIncident);
        Assert.Equal(command.Description, updatedIncident.Description);
        Assert.Equal(command.AreaId, updatedIncident.AreaId);
        Assert.Equal(command.IncidentTypeId, updatedIncident.IncidentTypeId);
        Assert.Equal(command.SeverityTypeId, updatedIncident.SeverityTypeId);
    }
}
