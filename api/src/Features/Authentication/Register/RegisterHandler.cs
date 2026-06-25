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
    public string? Pin { get; set; }
    public List<int> AreaIds { get; set; } = new();
    public int? ShiftId { get; set; }
    public int? SpecialityId { get; set; }
    public IEnumerable<IdentityError> Errors { get; set; } = Enumerable.Empty<IdentityError>();
    public string? InvalidRoleError { get; set; }
}

public class RegisterHandler(UserManager<User> userManager, RoleManager<IdentityRole> roleManager, IPasswordHasher<User> passwordHasher)
{
    private readonly UserManager<User> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;

    public async Task<RegisterResult> HandleAsync(RegisterCommand command)
    {
        if (!await RoleExistsAsync(command.Role))
        {
            return CreateInvalidRoleResult(command.Role);
        }

        string username = await GenerateUniqueUsernameAsync(command.FirstName, command.LastName);
        string employeeId = await GenerateNextEmployeeIdAsync();
        string plaintextPin = GenerateRandomPin();

        User user = CreateUserEntity(command, username, employeeId);
        user.PinHash = _passwordHasher.HashPassword(user, plaintextPin);

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

        return CreateSuccessfulRegistrationResult(user, command.Role, plaintextPin);
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

    private string GenerateRandomPin()
    {
        Random random = new Random();
        return random.Next(0, 10000).ToString("D4");
    }

    private User CreateUserEntity(RegisterCommand command, string username, string employeeId)
    {
        User user = new User
        {
            UserName = username,
            Email = command.Email,
            FirstName = CapitalizeName(command.FirstName),
            LastName = CapitalizeName(command.LastName),
            EmployeeId = employeeId,
            ShiftId = command.ShiftId,
            SpecialityId = command.SpecialityId
        };

        if (command.AreaIds != null)
        {
            user.UserAreas = command.AreaIds.Select(id => new UserArea { AreaId = id }).ToList();
        }

        return user;
    }

    private string CapitalizeName(string name)
    {
        return string.IsNullOrWhiteSpace(name)
            ? name
            : System.Globalization.CultureInfo.InvariantCulture.TextInfo.ToTitleCase(name.Trim().ToLowerInvariant());
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

    private RegisterResult CreateSuccessfulRegistrationResult(User user, string role, string plaintextPin)
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
            EmployeeId = user.EmployeeId,
            AreaIds = user.UserAreas.Select(ua => ua.AreaId).ToList(),
            ShiftId = user.ShiftId,
            SpecialityId = user.SpecialityId,
            Pin = plaintextPin
        };
    }
}
