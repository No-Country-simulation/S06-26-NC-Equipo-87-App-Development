using api.Features.Authentication.Common;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace api.Features.Authentication.Register;

public class RegisterResult
{
    public bool Succeeded { get; set; }
    public string? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? EmployeeId { get; set; }
    public IEnumerable<IdentityError> Errors { get; set; } = Enumerable.Empty<IdentityError>();
    public string? InvalidRoleError { get; set; }
}

public class RegisterHandler(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
{
    private readonly UserManager<User> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;

    public async Task<RegisterResult> HandleAsync(RegisterCommand command)
    {
        if (!await RoleExistsAsync(command.Role))
        {
            return CreateInvalidRoleResult(command.Role);
        }

        string username = await GenerateUniqueUsernameAsync(command.FirstName, command.LastName);
        string employeeId = await GenerateNextEmployeeIdAsync();

        User user = CreateUserEntity(command, username, employeeId);

        var createResult = await _userManager.CreateAsync(user, command.Password);
        if (!createResult.Succeeded)
        {
            return CreateFailedRegistrationResult(createResult.Errors);
        }

        var roleResult = await _userManager.AddToRoleAsync(user, command.Role);
        if (!roleResult.Succeeded)
        {
            await RollbackUserCreationAsync(user);
            return CreateFailedRegistrationResult(roleResult.Errors);
        }

        return CreateSuccessfulRegistrationResult(user, command.Role);
    }

    private async Task<bool> RoleExistsAsync(string role)
    {
        return await _roleManager.RoleExistsAsync(role);
    }

    private RegisterResult CreateInvalidRoleResult(string role)
    {
        return new RegisterResult
        {
            Succeeded = false,
            InvalidRoleError = $"Role '{role}' does not exist."
        };
    }

    private async Task<string> GenerateUniqueUsernameAsync(string firstName, string lastName)
    {
        string baseUsername = (GetFirstThreeCharacters(firstName) + GetFirstThreeCharacters(lastName)).ToLowerInvariant();
        string username = baseUsername;
        int suffix = 1;
        while (await _userManager.FindByNameAsync(username) != null)
        {
            username = $"{baseUsername}{suffix}";
            suffix++;
        }
        return username;
    }

    private string GetFirstThreeCharacters(string value)
    {
        return value.Length >= 3 ? value.Substring(0, 3) : value;
    }

    private async Task<string> GenerateNextEmployeeIdAsync()
    {
        string? maxEmployeeId = await _userManager.Users
            .Select(u => u.EmployeeId)
            .OrderByDescending(id => id)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(maxEmployeeId) && int.TryParse(maxEmployeeId, out int maxNum))
        {
            nextNumber = maxNum + 1;
        }
        return nextNumber.ToString("D4");
    }

    private User CreateUserEntity(RegisterCommand command, string username, string employeeId)
    {
        return new User
        {
            UserName = username,
            Email = command.Email,
            FirstName = command.FirstName,
            LastName = command.LastName,
            EmployeeId = employeeId
        };
    }

    private RegisterResult CreateFailedRegistrationResult(IEnumerable<IdentityError> errors)
    {
        return new RegisterResult
        {
            Succeeded = false,
            Errors = errors
        };
    }

    private async Task RollbackUserCreationAsync(User user)
    {
        await _userManager.DeleteAsync(user);
    }

    private RegisterResult CreateSuccessfulRegistrationResult(User user, string role)
    {
        return new RegisterResult
        {
            Succeeded = true,
            UserId = user.Id,
            Username = user.UserName,
            Email = user.Email,
            Role = role,
            FirstName = user.FirstName,
            LastName = user.LastName,
            EmployeeId = user.EmployeeId
        };
    }
}
