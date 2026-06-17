using api.Features.Authentication.Register;

namespace api.UnitTests.Features.Authentication.Register;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;

    public RegisterCommandValidatorTests()
    {
        _validator = new RegisterCommandValidator();
    }

    [Fact]
    public void Validate_ValidCommand_ReturnsTrue()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_FirstNameTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = new string('a', 51),
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "FirstName" && e.ErrorMessage.Contains("exceed 50 characters"));
    }

    [Fact]
    public void Validate_LastNameTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = new string('b', 51),
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "LastName" && e.ErrorMessage.Contains("exceed 50 characters"));
    }

    [Fact]
    public void Validate_FirstNameInvalidCharacters_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John123",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "FirstName" && e.ErrorMessage.Contains("invalid characters"));
    }

    [Fact]
    public void Validate_LastNameInvalidCharacters_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe#",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "LastName" && e.ErrorMessage.Contains("invalid characters"));
    }

    [Fact]
    public void Validate_EmailTooLong_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = new string('a', 90) + "@example.com",
            Password = "Password123!",
            Role = "Operator"
        };

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Email" && e.ErrorMessage.Contains("exceed 100 characters"));
    }

    [Fact]
    public void Validate_InvalidRole_ReturnsFalse()
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = "Password123!",
            Role = "InvalidRole"
        };

        var result = _validator.Validate(command);

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
    public void Validate_PasswordRules_Evaluated(string password)
    {
        RegisterCommand command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Password = password,
            Role = "Operator"
        };

        var result = _validator.Validate(command);

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
