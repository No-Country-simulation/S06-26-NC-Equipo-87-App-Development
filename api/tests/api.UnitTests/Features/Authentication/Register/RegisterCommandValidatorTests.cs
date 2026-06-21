using api.Data;
using api.Features.Authentication.Register;

using Microsoft.EntityFrameworkCore;

namespace api.UnitTests.Features.Authentication.Register;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;
    private readonly AppDbContext _dbContext;

    public RegisterCommandValidatorTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _dbContext = new AppDbContext(options);

        // Seed some defaults
        _dbContext.Areas.Add(new api.Features.Lookups.Common.Area { Id = 1, Name = "Zona Norte", Status = "Active" });
        _dbContext.Shifts.Add(new api.Features.Lookups.Common.Shift { Id = 1, Name = "Turno mañana", Status = "Active" });
        _dbContext.SaveChanges();

        _validator = new RegisterCommandValidator(_dbContext);
    }

    [Fact]
    public async Task Validate_ValidCommand_ReturnsTrue()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_FirstNameTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = new string('a', 51),
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "FirstName" && e.ErrorMessage.Contains("exceed 50 characters"));
    }

    [Fact]
    public async Task Validate_LastNameTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = new string('b', 51),
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "LastName" && e.ErrorMessage.Contains("exceed 50 characters"));
    }

    [Fact]
    public async Task Validate_FirstNameInvalidCharacters_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John123",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "FirstName" && e.ErrorMessage.Contains("invalid characters"));
    }

    [Fact]
    public async Task Validate_LastNameInvalidCharacters_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe#",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "LastName" && e.ErrorMessage.Contains("invalid characters"));
    }

    [Fact]
    public async Task Validate_EmailTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = new string('a', 90) + "@example.com",
            Password = "Password123!",
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Email" && e.ErrorMessage.Contains("exceed 100 characters"));
    }

    [Fact]
    public async Task Validate_InvalidRole_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "InvalidRole",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Role" && e.ErrorMessage.Contains("valid option"));
    }

    [Theory]
    [InlineData("password")]
    [InlineData("PASSWORD")]
    [InlineData("Password")]
    [InlineData("Password12")]
    [InlineData("Pass1!")]
    [InlineData("P1!")]
    public async Task Validate_PasswordRules_Evaluated(string password)
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = password,
            Role = "Operator",
            AreaId = 1,
            ShiftId = 1
        };

        var result = await _validator.ValidateAsync(command);

        if (password == "Pass1!")
        {
            Assert.True(result.IsValid);
        }
        else
        {
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Password");
        }
    }
}
