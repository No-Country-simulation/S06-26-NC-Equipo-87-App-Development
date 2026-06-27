using api.Data;
using api.Features.Incidents.Edit;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.UnitTests.Features.Incidents.Edit;

public class EditIncidentValidatorTests
{
    private readonly EditIncidentValidator _validator;

    public EditIncidentValidatorTests()
    {
        DbContextOptions<AppDbContext> options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        AppDbContext dbContext = new AppDbContext(options);

        dbContext.Areas.Add(new Area { Id = 1, Name = "Zona Norte", Status = "Active" });
        dbContext.Areas.Add(new Area { Id = 2, Name = "Inactive Area", Status = "Inactive" });
        dbContext.IncidentTypes.Add(new IncidentType { Id = 1, Name = "Falla mecánica", Status = "Active", SpecialityId = 1 });
        dbContext.IncidentTypes.Add(new IncidentType { Id = 2, Name = "Old Type", Status = "Inactive", SpecialityId = 1 });
        dbContext.SeverityTypes.Add(new SeverityType { Id = 1, Name = "Alto", Status = "Active" });
        dbContext.SeverityTypes.Add(new SeverityType { Id = 2, Name = "Old Severity", Status = "Inactive" });
        dbContext.Specialities.Add(new Speciality { Id = 1, Name = "Mecanico", Status = "Active" });
        dbContext.SaveChanges();

        _validator = new EditIncidentValidator(dbContext);
    }

    private static EditIncidentCommand ValidCommand()
    {
        return new EditIncidentCommand
        {
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 1,
            Description = "This is a valid description with enough characters"
        };
    }

    [Fact]
    public async Task Validate_ValidCommand_Passes()
    {
        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(ValidCommand());
        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_EmptyDescription_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.Description = string.Empty;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Description" && e.ErrorMessage.Contains("required"));
    }

    [Fact]
    public async Task Validate_DescriptionTooShort_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.Description = "Too short";

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Description" && e.ErrorMessage.Contains("20 characters"));
    }

    [Fact]
    public async Task Validate_DescriptionTooLong_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.Description = new string('x', 501);

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Description" && e.ErrorMessage.Contains("500 characters"));
    }

    [Fact]
    public async Task Validate_AreaDoesNotExist_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.AreaId = 999;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "AreaId" && e.ErrorMessage.Contains("active"));
    }

    [Fact]
    public async Task Validate_AreaIsInactive_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        const int inactiveAreaId = 2;
        cmd.AreaId = inactiveAreaId;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "AreaId" && e.ErrorMessage.Contains("active"));
    }

    [Fact]
    public async Task Validate_IncidentTypeDoesNotExist_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.IncidentTypeId = 999;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "IncidentTypeId" && e.ErrorMessage.Contains("active"));
    }

    [Fact]
    public async Task Validate_IncidentTypeIsInactive_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        const int inactiveIncidentTypeId = 2;
        cmd.IncidentTypeId = inactiveIncidentTypeId;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "IncidentTypeId" && e.ErrorMessage.Contains("active"));
    }

    [Fact]
    public async Task Validate_SeverityTypeDoesNotExist_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        cmd.SeverityTypeId = 999;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "SeverityTypeId" && e.ErrorMessage.Contains("active"));
    }

    [Fact]
    public async Task Validate_SeverityTypeIsInactive_Fails()
    {
        EditIncidentCommand cmd = ValidCommand();
        const int inactiveSeverityTypeId = 2;
        cmd.SeverityTypeId = inactiveSeverityTypeId;

        FluentValidation.Results.ValidationResult result = await _validator.ValidateAsync(cmd);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "SeverityTypeId" && e.ErrorMessage.Contains("active"));
    }
}
